let map;
let routeLayerGroup;      // 見た目用（細い線）
let routeHitLayerGroup;   // 当たり判定用（太い透明線）
let airportLayerGroup;
let drawnRoutes = [];     // { visual, hit, routeData } の配列

function initMap() {
  map = L.map("map").setView([36.2048, 138.2529], 5);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);

  //paneで前後関係を固定
  map.createPane("routesVisualPane");
  map.getPane("routesVisualPane").style.zIndex = 400;

  map.createPane("routesHitPane");
  map.getPane("routesHitPane").style.zIndex = 390; // visualより少し下

  map.createPane("markersPane");
  map.getPane("markersPane").style.zIndex = 650;   // マーカーが最前面

  routeLayerGroup = L.layerGroup([], { pane: "routesVisualPane" }).addTo(map);
  routeHitLayerGroup = L.layerGroup([], { pane: "routesHitPane" }).addTo(map);
  airportLayerGroup = L.layerGroup([], { pane: "markersPane" }).addTo(map);
}

function clearRoutes() {
  routeLayerGroup.clearLayers();
  routeHitLayerGroup.clearLayers();
  airportLayerGroup.clearLayers();
  drawnRoutes = [];
}

function drawRoutes(routeArray) {
  clearRoutes();
  routeArray.forEach(drawRoute);
}

function drawRoute(route) {
  const originAirport = airports.find(a => a.iata === route.origin);
  const destAirport   = airports.find(a => a.iata === route.destination);
  if (!originAirport || !destAirport) return;

  const latlngs = [
    [originAirport.lat, originAirport.lng],
    [destAirport.lat, destAirport.lng]
  ];

  //見た目用（細い線）: クリックは受けない
  const visual = L.polyline(latlngs, {
    pane: "routesVisualPane",
    weight: 2,
    color: "#444",
    interactive: false
  }).addTo(routeLayerGroup);

  //当たり判定用（太い透明線）: クリックを受ける
  // opacityは 0 だと当たり判定が消えることがあるので 0.01 にする
  const hit = L.polyline(latlngs, {
    pane: "routesHitPane",
    weight: 12,      // ← クリックしやすさはここ
    color: "#000",
    opacity: 0.01,   // ほぼ見えない
    lineCap: "round"
  }).addTo(routeHitLayerGroup);

  // データ保持（ハイライトで使う）
  visual.routeData = route;
  hit.routeData = route;

  //ポップアップは hit に付ける（クリックしやすい）
  const getAirportDisplayName = (airport) => {
    if (!airport || !airport.city) return "";
    if (airport.city.endsWith("（飛行場）")) {
      return airport.city.replace("（", "").replace("）", "");
    }
    const match = airport.city.match(/（(.+?)）/);
    return match ? match[1] : airport.city;
  };

  const originName = getAirportDisplayName(originAirport);
  const destName = getAirportDisplayName(destAirport);

  const airlineNames = route.airlines.map(code => {
    const airline = airlines.find(a => a.iata === code);
    return airline ? airline.name : code;
  });

  hit.bindPopup(`
    <strong>${originName} - ${destName}</strong><br/>
    航空会社: ${airlineNames.join(", ")}
  `);

  //ホバーのハイライトも hit 側で拾う（線を触りやすい）
  hit.on("mouseover", () => highlightRoutesByIata(null, route));
  hit.on("mouseout", resetRouteStyles);

  drawnRoutes.push({ visual, hit, routeData: route });

  drawAirportMarker(originAirport);
  drawAirportMarker(destAirport);
}

function drawAirportMarker(airport) {
  const exists = airportLayerGroup.getLayers().some(layer =>
    layer.options.iata === airport.iata
  );
  if (exists) return;

  const marker = L.circleMarker([airport.lat, airport.lng], {
    pane: "markersPane", 
    radius: 7,
    weight: 1,
    fillColor: "#ffffff",
    color: "#333333",
    fillOpacity: 0.9
  });

  marker.options.iata = airport.iata;

  marker.bindPopup(`
    <strong>${airport.city}</strong><br/>
    (${airport.iata})
  `);

  marker.on("mouseover", () => highlightRoutes(airport.iata));
  marker.on("mouseout", resetRouteStyles);

  marker.addTo(airportLayerGroup);
  marker.bringToFront(); // 念押し
}

function highlightRoutes(iata) {
  drawnRoutes.forEach(obj => {
    const r = obj.routeData;

    if (r.origin === iata || r.destination === iata) {
      obj.visual.setStyle({ weight: 5, color: "#d00000" });
    } else {
      obj.visual.setStyle({ weight: 1, color: "#ccc" });
    }
  });
}

// ルート自体にマウスが乗った時（iata無しでその1本だけ強調したい時用）
function highlightRoutesByIata(iata, route) {
  drawnRoutes.forEach(obj => {
    const r = obj.routeData;

    const match = (route && r.origin === route.origin && r.destination === route.destination);
    if (match) {
      obj.visual.setStyle({ weight: 5, color: "#d00000" });
    } else {
      obj.visual.setStyle({ weight: 1, color: "#ccc" });
    }
  });
}

function resetRouteStyles() {
  drawnRoutes.forEach(obj => {
    obj.visual.setStyle({ weight: 2, color: "#444" });
  });
}
