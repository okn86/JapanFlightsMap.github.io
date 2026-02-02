document.addEventListener("DOMContentLoaded", async function () {

  await loadData();

  initMap();
  populateDropdowns();

  drawRoutes(routes);
  updateRouteCount(routes);

  // 検索ボタン
  document.getElementById("searchBtn").addEventListener("click", function () {

    const origin = document.getElementById("originSelect").value;
    const destination = document.getElementById("destinationSelect").value;
    const airline = document.getElementById("airlineSelect").value;

    const results = filterRoutes(origin, destination, airline);

    drawRoutes(results);
    updateRouteCount(results);
  });

  // リセット
  document.getElementById("resetBtn").addEventListener("click", function () {

    document.getElementById("originSelect").value = "";
    document.getElementById("destinationSelect").value = "";
    document.getElementById("airlineSelect").value = "";

    drawRoutes(routes);
    updateRouteCount(routes);
  });

});
