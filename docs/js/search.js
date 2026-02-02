document.addEventListener("DOMContentLoaded", async () => {

  await loadData();
  populateDropdowns();
  initMap();
  drawRoutes(routes);
  updateRouteCount(routes);

  // 🔍 検索ボタン
  document.getElementById("searchBtn").addEventListener("click", () => {

    clearRoutes();

    const origin =
      document.getElementById("originSelect").value;

    const destination =
      document.getElementById("destinationSelect").value;

    const airline =
      document.getElementById("airlineSelect").value;

    const results = filterRoutes(origin, destination, airline);

    results.forEach(drawRoute);

    updateRouteCount(results);
  });

  // 🔄 リセット
  document.getElementById("resetBtn").addEventListener("click", () => {

    clearRoutes();

    document.getElementById("originSelect").value = "";
    document.getElementById("destinationSelect").value = "";
    document.getElementById("airlineSelect").value = "";

    drawRoutes(routes);
    updateRouteCount(routes);
  });
});



function filterRoutes(origin, destination, airline) {
  return routes.filter(route => {

    const matchOrigin =
      !origin ||
      route.origin === origin ||
      route.destination === origin;

    const matchDestination =
      !destination ||
      route.origin === destination ||
      route.destination === destination;

    const matchAirline =
      !airline ||
      route.airlines.includes(airline);

    return matchOrigin && matchDestination && matchAirline;
  });
}



function populateDropdowns() {

  const originSelect = document.getElementById("originSelect");
  const destinationSelect = document.getElementById("destinationSelect");
  const airlineSelect = document.getElementById("airlineSelect");

  airports.forEach(airport => {

    const option1 = new Option(
      `${airport.iata} - ${airport.name}`,  // 日本語名
      airport.iata
    );

    const option2 = new Option(
      `${airport.iata} - ${airport.name}`,
      airport.iata
    );

    originSelect.add(option1);
    destinationSelect.add(option2);
  });

  airlines.forEach(airline => {

    const option = new Option(
      `${airline.iata} - ${airline.name}`,
      airline.iata
    );

    airlineSelect.add(option);
  });
}



function updateRouteCount(routeArray) {
  const countElement =
    document.getElementById("route-count");

  countElement.textContent =
    `該当路線数：${routeArray.length}件`;
}
