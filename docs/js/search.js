function filterRoutesByAirport(airport, airline) {
  return routes.filter(route => {

    const matchAirport =
      !airport ||
      route.origin === airport ||
      route.destination === airport;

    const matchAirline =
      !airline ||
      route.airlines.includes(airline);

    return matchAirport && matchAirline;
  });
}

function populateDropdowns() {
  const airportSelect = document.getElementById("airportSelect");
  const airlineSelect = document.getElementById("airlineSelect");

  airports.forEach(airport => {
    if (!airport.iata) return;
    airportSelect.add(
      new Option(`${airport.iata} - ${airport.city}`, airport.iata)
    );
  });

  airlines.forEach(airline => {
    airlineSelect.add(
      new Option(`${airline.iata} - ${airline.name}`, airline.iata)
    );
  });
}

function updateRouteCount(routeArray) {
  const countElement = document.getElementById("route-count");
  countElement.textContent = `該当路線数：${routeArray.length}件`;
}

document.addEventListener("DOMContentLoaded", async function () {

  await loadData();

  initMap();
  populateDropdowns();

  // 初期は全路線
  drawRoutes(routes);
  updateRouteCount(routes);

  // 検索
  document.getElementById("searchBtn").addEventListener("click", function () {

    const airport = document.getElementById("airportSelect").value;
    const airline = document.getElementById("airlineSelect").value;

    const results = filterRoutesByAirport(airport, airline);

    drawRoutes(results);
    updateRouteCount(results);
  });

  // リセット
  document.getElementById("resetBtn").addEventListener("click", function () {

    document.getElementById("airportSelect").value = "";
    document.getElementById("airlineSelect").value = "";

    drawRoutes(routes);
    updateRouteCount(routes);
  });

});
