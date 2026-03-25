/**
 * map-engine.js — Moteur cartographique principal
 *
 * Stack : Mapbox GL JS v3 + CustomLayer WebGL (GLSL)
 * Features :
 *   - Globe 3D complet avec atmosphère réaliste
 *   - Cycle Jour/Nuit astronomique (position solaire réelle)
 *   - Texture NASA Black Marble (lumières des villes la nuit)
 *   - Fade intelligent Nuit→Jour au zoom (effet Apple Maps)
 *   - flyTo parabolique sur changement d'étape
 *   - Un seul contexte WebGL (règle absolue)
 */

import { getSolarPosition } from './solar.js';

// ─── TOKEN MAPBOX ──────────────────────────────────────────────────────────────
const MAPBOX_TOKEN = 'pk.eyJ1Ijoic2ltYW90aGVvNjQiLCJhIjoiY21uNGh0c25yMDBhdzJyc2NoMmxmaWR6OCJ9.G1w0xhZMfmz4rTISLA7iTA';

// ─── NASA Black Marble — image équirectangulaire libre ─────────────────────────
// Source officielle NASA SVS (domaine public, usage éducatif/personnel)
const BLACK_MARBLE_URL = 'https://eoimages.gsfc.nasa.gov/images/imagerecords/144000/144898/BlackMarble_2016_01deg_geo.jpg';

// ─── CONSTANTES ────────────────────────────────────────────────────────────────
const MIN_ZOOM_NIGHT_VISIBLE = 2.5;   // En dessous : nuit pleinement visible
const MAX_ZOOM_NIGHT_VISIBLE = 5.0;   // Au dessus  : nuit effacée (= jour partout)

// ─── ÉTAT GLOBAL ───────────────────────────────────────────────────────────────
let map = null;
let nightLayerReady = false;
let blackMarbleTexture = null;

// ═══════════════════════════════════════════════════════════════════════════════
// 1. INITIALISATION DE LA CARTE
// ═══════════════════════════════════════════════════════════════════════════════

export function initMap(containerId = 'map') {
    mapboxgl.accessToken = MAPBOX_TOKEN;

    map = new mapboxgl.Map({
        container: containerId,
        style: 'mapbox://styles/mapbox/satellite-streets-v12',
        center: [105.0, 16.0],   // Centré Vietnam par défaut
        zoom: 3,
        pitch: 30,
        bearing: 0,
        projection: 'globe',     // ← Globe 3D natif Mapbox v3
        antialias: true,         // Meilleur rendu WebGL
        localIdeographFontFamily: "'SF Pro Display', 'Helvetica Neue', Arial, sans-serif",
    });

    // Masquer les contrôles Mapbox (logo, attribution)
    map.on('load', () => {
        const logo = document.querySelector('.mapboxgl-ctrl-logo');
        const attrib = document.querySelector('.mapboxgl-ctrl-attrib');
        if (logo) logo.style.display = 'none';
        if (attrib) attrib.style.display = 'none';
    });

    // Atmosphère + étoiles (effet spatial réaliste)
    map.on('style.load', () => {
        applyAtmosphere();
        loadBlackMarbleAndInit();
    });

    // Mise à jour de l'opacité nuit au zoom
    map.on('zoom', updateNightOpacity);

    return map;
}

// ─── ATMOSPHÈRE & FOG ──────────────────────────────────────────────────────────

function applyAtmosphere() {
    map.setFog({
        'color': 'rgb(186, 210, 235)',           // Bleu ciel à l'horizon
        'high-color': 'rgb(20, 60, 180)',        // Bleu profond en altitude
        'horizon-blend': 0.03,                   // Douceur de la transition
        'space-color': 'rgb(5, 5, 20)',          // Noir de l'espace
        'star-intensity': 0.8,                   // Étoiles bien visibles
    });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. CHARGEMENT BLACK MARBLE + CUSTOM LAYER GLSL
// ═══════════════════════════════════════════════════════════════════════════════

function loadBlackMarbleAndInit() {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
        // Créer la texture WebGL depuis l'image NASA
        const gl = map.painter.context.gl;
        blackMarbleTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, blackMarbleTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.bindTexture(gl.TEXTURE_2D, null);

        addNightDayLayer();
        nightLayerReady = true;

        // Lancer la mise à jour périodique de la position solaire (toutes les 60s)
        updateNightLayer();
        setInterval(updateNightLayer, 60000);
    };

    img.onerror = () => {
        console.warn('[MapEngine] Black Marble non disponible (hors-ligne ?). Mode dégradé : ombre simple.');
        addNightDayLayerFallback();
    };

    img.src = BLACK_MARBLE_URL;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. CUSTOM LAYER WebGL — SHADER GLSL NUIT/JOUR
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Vertex Shader :
 * - Projette les vertices du quad plein écran
 * - Passe les UV pour l'échantillonnage de la texture
 */
const VERT_SHADER = `
    attribute vec2 a_pos;
    varying vec2 v_uv;

    void main() {
        // Quad de -1 à +1 (clip space)
        gl_Position = vec4(a_pos, 0.0, 1.0);
        // UV de 0 à 1
        v_uv = (a_pos + 1.0) * 0.5;
    }
`;

/**
 * Fragment Shader — Le cœur du système nuit/jour
 *
 * Principe :
 * 1. Pour chaque pixel, on retrouve sa position géographique (lon/lat)
 * 2. On calcule l'angle entre ce point et le point sub-solaire
 * 3. Si l'angle > 90° → côté nuit → on applique la texture Black Marble
 * 4. Un uniform nightOpacity permet le fade au zoom (effet Apple Maps)
 */
const FRAG_SHADER = `
    precision highp float;

    varying vec2 v_uv;

    // Position sub-solaire (lat/lon en radians)
    uniform float u_sun_lat;
    uniform float u_sun_lon;

    // Opacité de la couche nuit (0 = invisible, 1 = pleine nuit)
    uniform float u_night_opacity;

    // Texture Black Marble NASA
    uniform sampler2D u_black_marble;

    // Matrice de projection inverse Mapbox (pour reconstruire lon/lat)
    uniform mat4 u_matrix;

    const float PI = 3.14159265359;
    const float TWO_PI = 6.28318530718;

    // Convertit des degrés en radians
    float toRad(float deg) { return deg * PI / 180.0; }

    void main() {
        // ── Reconstruire la position géo depuis les UV du quad ──
        // UV [0,1] → coordonnées géographiques
        float lon = (v_uv.x - 0.5) * TWO_PI;  // -π à +π
        float lat = (v_uv.y - 0.5) * PI;       // -π/2 à +π/2

        // ── Angle solaire via formule sphérique ──
        // Angle entre le point (lat, lon) et le point sub-solaire (sun_lat, sun_lon)
        float dLon = lon - u_sun_lon;
        float cosAngle = sin(u_sun_lat) * sin(lat) +
                         cos(u_sun_lat) * cos(lat) * cos(dLon);

        // cosAngle > 0 → côté jour / cosAngle < 0 → côté nuit
        // On crée une zone de transition douce autour du terminateur (±5°)
        float terminatorBlend = 5.0 * PI / 180.0;
        float nightFactor = smoothstep(-terminatorBlend, terminatorBlend, -cosAngle);

        // ── Échantillonner la texture Black Marble ──
        // L'image NASA est équirectangulaire : lon/lat → UV direct
        float bm_u = v_uv.x;
        float bm_v = 1.0 - v_uv.y; // Flip vertical (Y inversé en WebGL)
        vec4 blackMarbleColor = texture2D(u_black_marble, vec2(bm_u, bm_v));

        // ── Rendu final ──
        // La couleur Black Marble, modulée par nightFactor × nightOpacity globale
        float alpha = nightFactor * u_night_opacity;

        // Boost des lumières pour effet "villes brillantes" plus marqué
        vec3 boostedColor = blackMarbleColor.rgb * 1.8;

        gl_FragColor = vec4(boostedColor, alpha);
    }
`;

function addNightDayLayer() {
    if (!blackMarbleTexture) return;

    const nightLayer = {
        id: 'night-day-shader',
        type: 'custom',
        renderingMode: '2d',

        onAdd(map, gl) {
            // ── Compiler les shaders ──
            const vert = gl.createShader(gl.VERTEX_SHADER);
            gl.shaderSource(vert, VERT_SHADER);
            gl.compileShader(vert);
            if (!gl.getShaderParameter(vert, gl.COMPILE_STATUS)) {
                console.error('[Shader] Vertex error:', gl.getShaderInfoLog(vert));
            }

            const frag = gl.createShader(gl.FRAGMENT_SHADER);
            gl.shaderSource(frag, FRAG_SHADER);
            gl.compileShader(frag);
            if (!gl.getShaderParameter(frag, gl.COMPILE_STATUS)) {
                console.error('[Shader] Fragment error:', gl.getShaderInfoLog(frag));
            }

            // ── Lier le programme ──
            this.program = gl.createProgram();
            gl.attachShader(this.program, vert);
            gl.attachShader(this.program, frag);
            gl.linkProgram(this.program);
            if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
                console.error('[Shader] Link error:', gl.getProgramInfoLog(this.program));
            }

            // ── Quad plein écran (2 triangles) ──
            const vertices = new Float32Array([
                -1, -1,   1, -1,  -1,  1,
                -1,  1,   1, -1,   1,  1,
            ]);
            this.buffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
            gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

            // ── Récupérer les locations des uniforms ──
            this.aPos       = gl.getAttribLocation(this.program, 'a_pos');
            this.uSunLat    = gl.getUniformLocation(this.program, 'u_sun_lat');
            this.uSunLon    = gl.getUniformLocation(this.program, 'u_sun_lon');
            this.uOpacity   = gl.getUniformLocation(this.program, 'u_night_opacity');
            this.uMarble    = gl.getUniformLocation(this.program, 'u_black_marble');
            this.uMatrix    = gl.getUniformLocation(this.program, 'u_matrix');
        },

        render(gl, matrix) {
            const solar = getSolarPosition();
            const sunLatRad = solar.lat * Math.PI / 180;
            const sunLonRad = solar.lon * Math.PI / 180;
            const opacity = computeNightOpacity(map.getZoom());

            if (opacity <= 0.01) return; // Skip render si invisible

            gl.useProgram(this.program);

            // Blend alpha pour transparence
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

            // ── Uniforms ──
            gl.uniform1f(this.uSunLat, sunLatRad);
            gl.uniform1f(this.uSunLon, sunLonRad);
            gl.uniform1f(this.uOpacity, opacity);

            // Texture Black Marble sur l'unité 0
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, blackMarbleTexture);
            gl.uniform1i(this.uMarble, 0);

            // ── Vertices ──
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
            gl.enableVertexAttribArray(this.aPos);
            gl.vertexAttribPointer(this.aPos, 2, gl.FLOAT, false, 0, 0);

            gl.drawArrays(gl.TRIANGLES, 0, 6);

            gl.disableVertexAttribArray(this.aPos);
            gl.disable(gl.BLEND);
        },
    };

    map.addLayer(nightLayer, 'waterway-label'); // Insérer sous les labels
}

// ─── FALLBACK sans Black Marble (offline) ─────────────────────────────────────

function addNightDayLayerFallback() {
    // Version dégradée : polygone GeoJSON sombre (mieux que rien)
    const { lat, lon } = getSolarPosition();
    const antiLat = -lat;
    const antiLon = lon > 0 ? lon - 180 : lon + 180;

    // Cercle de 10018 km (demi-sphère) centré sur le point anti-solaire
    // = la moitié nuit de la Terre
    const steps = 64;
    const coords = [];
    for (let i = 0; i <= steps; i++) {
        const angle = (i / steps) * 2 * Math.PI;
        const latRad = Math.asin(
            Math.sin(antiLat * Math.PI / 180) * Math.cos(10018 / 6371) +
            Math.cos(antiLat * Math.PI / 180) * Math.sin(10018 / 6371) * Math.cos(angle)
        );
        const lonRad = antiLon * Math.PI / 180 + Math.atan2(
            Math.sin(angle) * Math.sin(10018 / 6371) * Math.cos(antiLat * Math.PI / 180),
            Math.cos(10018 / 6371) - Math.sin(antiLat * Math.PI / 180) * Math.sin(latRad)
        );
        coords.push([lonRad * 180 / Math.PI, latRad * 180 / Math.PI]);
    }

    if (map.getSource('night-fallback')) {
        map.getSource('night-fallback').setData({ type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [coords] } });
    } else {
        map.addSource('night-fallback', { type: 'geojson', data: { type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [coords] } } });
        map.addLayer({
            id: 'night-fallback-layer',
            type: 'fill',
            source: 'night-fallback',
            paint: {
                'fill-color': '#000020',
                'fill-opacity': ['interpolate', ['linear'], ['zoom'], 2.5, 0.55, 5.0, 0.0],
            },
        });
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. MISE À JOUR DYNAMIQUE
// ═══════════════════════════════════════════════════════════════════════════════

function updateNightLayer() {
    if (!nightLayerReady) return;
    // Le shader recalcule la position solaire à chaque frame via getSolarPosition()
    // Donc rien à faire ici, sauf forcer un repaint si la carte est idle
    map.triggerRepaint();
}

/**
 * Calcule l'opacité de la couche nuit en fonction du zoom
 * Effet Apple Maps : plus on zoom, plus la nuit s'efface → révèle la carte de jour
 *
 * zoom ≤ MIN_ZOOM → opacité 1.0 (nuit pleinement visible)
 * zoom ≥ MAX_ZOOM → opacité 0.0 (nuit effacée, carte de jour)
 * entre les deux   → fade linéaire smooth
 */
function computeNightOpacity(zoom) {
    if (zoom <= MIN_ZOOM_NIGHT_VISIBLE) return 1.0;
    if (zoom >= MAX_ZOOM_NIGHT_VISIBLE) return 0.0;
    const t = (zoom - MIN_ZOOM_NIGHT_VISIBLE) / (MAX_ZOOM_NIGHT_VISIBLE - MIN_ZOOM_NIGHT_VISIBLE);
    // Ease in-out pour un fade naturel
    return 1.0 - (t * t * (3 - 2 * t));
}

function updateNightOpacity() {
    if (!nightLayerReady) return;
    map.triggerRepaint();
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5. NAVIGATION & CAMÉRA
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Convertit une "altitude simulée" en zoom Mapbox
 * altitudeM : altitude en mètres
 */
export function altitudeToZoom(altitudeM) {
    if (altitudeM >= 8_000_000) return 2;
    if (altitudeM >= 2_000_000) return 4;
    if (altitudeM >= 500_000)   return 6;
    if (altitudeM >= 200_000)   return 7.5;
    if (altitudeM >= 100_000)   return 9;
    if (altitudeM >= 60_000)    return 11;
    if (altitudeM >= 40_000)    return 12.5;
    return 14;
}

/**
 * Vole vers une étape du voyage avec effet parabolique (zoom out → zoom in)
 * Reproduit l'effet Apple Maps / Google Earth
 *
 * @param {number} lon - Longitude destination
 * @param {number} lat - Latitude destination
 * @param {number} altitudeM - Altitude simulée en mètres (détermine le zoom final)
 * @param {object} opts - Options additionnelles
 */
export function flyToStep(lon, lat, altitudeM, opts = {}) {
    const targetZoom = altitudeToZoom(altitudeM);

    map.flyTo({
        center: [lon, lat],
        zoom: targetZoom,
        pitch: targetZoom >= 12 ? 50 : 30,   // Plus d'inclinaison en ville
        bearing: 0,
        speed: opts.speed || 1.2,            // Vitesse de l'animation
        curve: opts.curve || 1.4,            // Courbe parabolique (> 1 = effet zoom out)
        easing: (t) => {
            // Ease in-out cubic pour mouvement naturel
            return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        },
        essential: true,
    });
}

/**
 * Géolocalisation de l'utilisateur
 */
export function geolocateUser() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
        (pos) => {
            map.flyTo({
                center: [pos.coords.longitude, pos.coords.latitude],
                zoom: 14,
                pitch: 45,
                speed: 1.5,
                essential: true,
            });
        },
        (err) => console.warn('[GeoLocate]', err.message),
        { timeout: 10000 }
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 6. TRACÉ D'ITINÉRAIRE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Ajoute ou met à jour le tracé pointillé de l'itinéraire
 * @param {Array} coordinates - Tableau de [lon, lat]
 */
export function setRouteCoordinates(coordinates) {
    const geojson = {
        type: 'Feature',
        properties: {},
        geometry: { type: 'LineString', coordinates },
    };

    if (map.getSource('route')) {
        map.getSource('route').setData(geojson);
    } else {
        map.addSource('route', { type: 'geojson', data: geojson });

        // Halo blanc derrière la ligne pour lisibilité sur satellite
        map.addLayer({
            id: 'route-halo',
            type: 'line',
            source: 'route',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: {
                'line-color': '#FFFFFF',
                'line-width': 6,
                'line-opacity': 0.4,
            },
        });

        // Ligne pointillée verte
        map.addLayer({
            id: 'route-line',
            type: 'line',
            source: 'route',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: {
                'line-color': '#10b981',
                'line-width': 3,
                'line-dasharray': [2, 2.5],
            },
        });
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 7. MARQUEURS
// ═══════════════════════════════════════════════════════════════════════════════

const markers = [];

/**
 * Ajoute un marqueur glassmorphism cliquable
 * @param {object} city - { name, lon, lat, dayIndex }
 * @param {function} onClick - Callback au clic
 */
export function addCityMarker(city, onClick) {
    const el = document.createElement('div');
    el.className = 'map-marker';
    el.innerHTML = `<span class="marker-dot"></span><span class="marker-label">${city.name}</span>`;
    el.addEventListener('click', (e) => {
        e.stopPropagation();
        onClick(city);
    });

    const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([city.lon, city.lat])
        .addTo(map);

    markers.push(marker);
    return marker;
}

export function clearMarkers() {
    markers.forEach(m => m.remove());
    markers.length = 0;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 8. THÈME
// ═══════════════════════════════════════════════════════════════════════════════

let isDark = true;

export function toggleMapTheme() {
    isDark = !isDark;
    const style = isDark
        ? 'mapbox://styles/mapbox/satellite-streets-v12'
        : 'mapbox://styles/mapbox/light-v11';

    map.setStyle(style);

    // Re-appliquer le fog et les layers après changement de style
    map.once('style.load', () => {
        applyAtmosphere();
        nightLayerReady = false;
        blackMarbleTexture = null;
        loadBlackMarbleAndInit();
        // Le reste (route, markers) sera re-ajouté par le module appelant
        map.fire('os:style-reloaded');
    });

    return isDark;
}

export function getMap() { return map; }
export function isDarkTheme() { return isDark; }
