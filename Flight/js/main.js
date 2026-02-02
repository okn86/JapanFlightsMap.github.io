document.addEventListener("DOMContentLoaded", async () => {
  await loadData();
  initMap();

  document.getElementById("searchBtn").addEventListener("click", () => {
    clearRoutes();

    const origin = document
      .getElementById("originInput")
      .value.trim()
      .toUpperCase();

    const destination = document
      .getElementById("destinationInput")
      .value.trim()
      .toUpperCase();

    const airline = document
      .getElementById("airlineInput")
      .value.trim()
      .toUpperCase();

    const results = filterRoutes(origin, destination, airline);

    results.forEach(drawRoute);
  });

  document.getElementById("resetBtn").addEventListener("click", () => {
    clearRoutes();
    document.getElementById("originInput").value = "";
    document.getElementById("destinationInput").value = "";
    document.getElementById("airlineInput").value = "";
  });
});
