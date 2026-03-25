/**
 * solar.js — Calcul de la position solaire astronomique
 * Retourne la longitude/latitude du point Sub-Solaire (là où le soleil est au zénith)
 * Précision suffisante pour l'effet visuel jour/nuit
 */

export function getSolarPosition() {
    const now = new Date();

    // Jour de l'année (1-365)
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now - start;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);

    // Déclinaison solaire (angle entre l'équateur et le soleil) en degrés
    // Formule de Cooper (1969) - précision ~1°
    const declination = -23.44 * Math.cos((2 * Math.PI / 365) * (dayOfYear + 10));

    // Heure UTC en heures décimales
    const utcHours = now.getUTCHours() + now.getUTCMinutes() / 60 + now.getUTCSeconds() / 3600;

    // Longitude sub-solaire : à midi UTC le soleil est à 0°, décale de 15°/heure
    let subSolarLon = 180 - (utcHours * 15);
    // Normaliser entre -180 et 180
    if (subSolarLon > 180) subSolarLon -= 360;
    if (subSolarLon < -180) subSolarLon += 360;

    return {
        lat: declination,   // Latitude sub-solaire = déclinaison
        lon: subSolarLon,   // Longitude sub-solaire
    };
}

/**
 * Retourne le point antipodal (point opposé au soleil = centre de la nuit)
 */
export function getNightCenter() {
    const { lat, lon } = getSolarPosition();
    return {
        lat: -lat,
        lon: lon > 0 ? lon - 180 : lon + 180,
    };
}
