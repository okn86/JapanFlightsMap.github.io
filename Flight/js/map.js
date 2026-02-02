let map;
let routeLayerGroup;

function initMap() {
  map = L.map("map").setView([36.2048, 138.2529], 5);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);

  routeLayerGroup = L.layerGroup().addTo(map);
}

function clearRoutes() {
  routeLayerGroup.clearLayers();
}

function drawRoute(route) {
  const originAirport = airports.find(a => a.iata === route.origin);
  const destAirport = airports.find(a => a.iata === route.destination);

  if (!originAirport || !destAirport) return;

  const polyline = L.polyline(
    [
      [originAirport.lat, originAirport.lng],
      [destAirport.lat, destAirport.lng]
    ],
    { weight: 2 }
  );

  const popupContent = `
    <strong>${route.origin} ⇄ ${route.destination}</strong><br/>
    運航会社:<br/>
    ${route.airlines.join(", ")}
  `;

  polyline.bindPopup(popupContent);
  polyline.addTo(routeLayerGroup);
}
