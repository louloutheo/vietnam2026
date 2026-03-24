let viewer = null;

const ROUTE_COORDS = [
  2.3522, 48.8566,
  28.9784, 41.0082,
  105.8342, 21.0278,
  105.98, 20.2539,
  105.228, 20.4533,
  107.05, 20.728,
  105.8342, 21.0278,
  107.5909, 16.4637,
  108.338, 15.8801,
  108.523, 15.959,
  108.2022, 16.0544
];

const CITIES = [
  { n: "Paris", lo: 2.3522, la: 48.8566, d: 0 },
  { n: "Istanbul", lo: 28.9784, la: 41.0082, d: 0 },
  { n: "Hanoï", lo: 105.8342, la: 21.0278, d: 1 },
  { n: "Ninh Binh", lo: 105.98, la: 20.2539, d: 3 },
  { n: "Pu Luong", lo: 105.228, la: 20.4533, d: 4 },
  { n: "Lan Ha", lo: 107.05, la: 20.728, d: 6 },
  { n: "Hué", lo: 107.5909, la: 16.4637, d: 8 },
  { n: "Hoi An", lo: 108.338, la: 15.8801, d: 9 },
  { n: "Îles Cham", lo: 108.523, la: 15.959, d: 11 },
  { n: "Da Nang", lo: 108.2022, la: 16.0544, d: 13 }
];

export function initCesiumMap({ onCitySelect } = {}) {
  if (typeof Cesium === "undefined") {
    console.error("Cesium non chargé");
    return null;
  }

  Cesium.Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJkY2IxMDk2MS1kMmQ3LTRkNjktOTdkMC1jYjlkMzZmNWY1NjkiLCJpZCI6NDAzMzMyLCJpYXQiOjE3NzM0NDQ1MDB9.KR0l-nDsi9iZF82OwlHBktxKmpEdfAXhftNFj4jExb4";

  viewer = new Cesium.Viewer("cesiumContainer", {
    baseLayer: Cesium.ImageryLayer.fromProviderAsync(Cesium.IonImageryProvider.fromAssetId(2)),
    baseLayerPicker: false,
    geocoder: false,
    homeButton: false,
    infoBox: false,
    navigationHelpButton: false,
    sceneModePicker: false,
    timeline: false,
    animation: false,
    requestRenderMode: true
  });

  viewer.cesiumWidget.creditContainer.style.display = "none";
  viewer.scene.globe.enableLighting = true;
  viewer.scene.fog.enabled = false;
  viewer.scene.skyAtmosphere.enabled = true;
  viewer.scene.globe.maximumScreenSpaceError = 2.5;

  const controller = viewer.scene.screenSpaceCameraController;
  controller.maximumMovementRatio = 0.8;
  controller.zoomFactor = 15.0;
  controller.minimumZoomDistance = 500;
  controller.maximumZoomDistance = 15000000;

  tryAddNightLayer();
  addRoute();
  addCities();
  bindCityClick(onCitySelect);

  viewer.scene.requestRender();
  return viewer;
}

async function tryAddNightLayer() {
  try {
    if (!viewer) return;
    const provider = await Cesium.IonImageryProvider.fromAssetId(3812);
    const nightLayer = viewer.imageryLayers.addImageryProvider(provider);
    nightLayer.dayAlpha = 0.0;
    nightLayer.nightAlpha = 1.0;
  } catch {
    console.log("Couche nuit indisponible");
  }
}

function addRoute() {
  if (!viewer) return;
  viewer.entities.add({
    polyline: {
      positions: Cesium.Cartesian3.fromDegreesArray(ROUTE_COORDS),
      width: 3,
      material: new Cesium.PolylineDashMaterialProperty({
        color: Cesium.Color.fromCssColorString("#10b981"),
        dashLength: 15.0
      })
    }
  });
}

function addCities() {
  if (!viewer) return;
  CITIES.forEach((city) => {
    viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(city.lo, city.la),
      point: {
        pixelSize: 12,
        color: Cesium.Color.fromCssColorString("#10b981"),
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 3
      },
      label: {
        text: city.n,
        font: "bold 12pt sans-serif",
        fillColor: Cesium.Color.fromCssColorString("#f8fafc"),
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        outlineColor: Cesium.Color.fromCssColorString("#0b1120"),
        outlineWidth: 4,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(0, -15)
      },
      properties: { dayIdx: city.d }
    });
  });
}

function bindCityClick(onCitySelect) {
  if (!viewer) return;
  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
  handler.setInputAction((click) => {
    const pickedObject = viewer.scene.pick(click.position);
    const hasDay = Cesium.defined(pickedObject) && pickedObject.id && pickedObject.id.properties && typeof pickedObject.id.properties.dayIdx !== "undefined";
    if (!hasDay) return;
    const dayIdx = pickedObject.id.properties.dayIdx.getValue();
    if (typeof onCitySelect === "function") onCitySelect(dayIdx);
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
}

export function flyToLocation({ lat, lon, zoomMap }) {
  if (!viewer) return;
  const isClose = zoomMap < 1000000;
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(lon, lat, zoomMap),
    orientation: { heading: 0, pitch: Cesium.Math.toRadians(isClose ? -60 : -90), roll: 0 },
    duration: 1.2,
    easingFunction: Cesium.EasingFunction.QUADRATIC_IN_OUT
  });
  viewer.scene.requestRender();
}

export function flyToUserLocation() {
  if (!viewer || !navigator.geolocation) return;
  navigator.geolocation.getCurrentPosition((pos) => {
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(pos.coords.longitude, pos.coords.latitude, 5000),
      duration: 2
    });
    viewer.scene.requestRender();
  });
}

export function resizeCesiumMap() {
  if (!viewer) return;
  viewer.resize();
  viewer.scene.requestRender();
}
