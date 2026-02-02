let map;
let routeLayerGroup;
let airportLayerGroup;
let drawnRoutes = [];


function initMap() {
  map = L.map("map").setView([36.2048, 138.2529], 5);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);

  routeLayerGroup = L.layerGroup().addTo(map);
  airportLayerGroup = L.layerGroup().addTo(map);
}

function clearRoutes() {
  routeLayerGroup.clearLayers();
  airportLayerGroup.clearLayers();
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
    {
      weight: 2,
      color: "#444"
    }
  );

  polyline.routeData = route; // ← 重要

  polyline.bindPopup(`
    <strong>${route.origin} ⇄ ${route.destination}</strong><br/>
    ${route.airlines.join(", ")}
  `);

  polyline.addTo(routeLayerGroup);
  drawnRoutes.push(polyline);

  drawAirportMarker(originAirport);
  drawAirportMarker(destAirport);
}


function drawAirportMarker(airport) {
  const exists = airportLayerGroup.getLayers().some(layer =>
    layer.options.iata === airport.iata
  );

  if (exists) return;

  const marker = L.circleMarker(
    [airport.lat, airport.lng],
    {
      radius: 6,
      weight: 1,
      fillColor: "#003366",
      color: "#003366",
      fillOpacity: 0.8
    }
  );

  marker.options.iata = airport.iata;

  marker.bindPopup(`
    <strong>${airport.iata}</strong><br/>
    ${airport.name}
  `);

  // 👇 hover時
  marker.on("mouseover", () => highlightRoutes(airport.iata));

  // 👇 hover解除
  marker.on("mouseout", () => resetRouteStyles());

  marker.addTo(airportLayerGroup);
}

function highlightRoutes(iata) {
  drawnRoutes.forEach(routeLine => {
    const route = routeLine.routeData;

    if (route.origin === iata || route.destination === iata) {
      routeLine.setStyle({
        weight: 5,
        color: "#d00000"
      });
    } else {
      routeLine.setStyle({
        weight: 1,
        color: "#ccc"
      });
    }
  });
}

function resetRouteStyles() {
  drawnRoutes.forEach(routeLine => {
    routeLine.setStyle({
      weight: 2,
      color: "#444"
    });
  });
}
