let map;
let routeLayers = [];

function initMap() {
  map = L.map("map").setView([35, 135], 5);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);
}

function drawRoute(route) {

  const originAirport =
    airports.find(a => a.iata === route.origin);

  const destinationAirport =
    airports.find(a => a.iata === route.destination);

  if (!originAirport || !destinationAirport) return;

  const line = L.polyline(
    [
      [originAirport.lat, originAirport.lng],
      [destinationAirport.lat, destinationAirport.lng]
    ]
  ).addTo(map);

  routeLayers.push(line);
}

function drawRoutes(routeArray) {
  routeArray.forEach(drawRoute);
}

function clearRoutes() {
  routeLayers.forEach(layer => map.removeLayer(layer));
  routeLayers = [];
}
