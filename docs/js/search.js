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
  const airlineSelect = document.getElementById("airlineSelect");

  airlines.forEach(airline => {
    airlineSelect.add(
      new Option(`${airline.iata} - ${airline.name}`, airline.iata)
    );
  });
}

function setupAirportPicker() {
  const pickerBtn = document.getElementById("airportPickerBtn");
  const pickerPanel = document.getElementById("airportPickerPanel");
  const airportInput = document.getElementById("airportSelect");
  const regionList = document.getElementById("regionList");
  const airportList = document.getElementById("airportList");

  const regionOrder = [
    "主要な空港", "北海道", "東北", "関東・信越", "東海・北陸", "関西", "中国", "四国", "九州", "沖縄"
  ];

  const byRegion = new Map();
  regionOrder.forEach(r => byRegion.set(r, []));

  airports.forEach(airport => {
    if (!airport.iata) return;
    const region = airport.region || "その他";
    if (!byRegion.has(region)) byRegion.set(region, []);
    byRegion.get(region).push(airport);
    if (airport.major) {
      byRegion.get("主要な空港").push(airport);
    }
  });

  for (const [region, list] of byRegion.entries()) {
    list.sort((a, b) => (a.city || "").localeCompare(b.city || "", "ja"));
  }

  function renderAirports(region) {
    airportList.innerHTML = "";

    const allBtn = document.createElement("button");
    allBtn.className = "airport-item";
    allBtn.textContent = "すべての空港";
    allBtn.addEventListener("click", () => {
      airportInput.value = "";
      pickerBtn.textContent = "空港を選択";
      pickerPanel.classList.add("hidden");
    });
    airportList.appendChild(allBtn);

    (byRegion.get(region) || []).forEach(airport => {
      const btn = document.createElement("button");
      btn.className = "airport-item";
      btn.textContent = `${airport.city} (${airport.iata})`;
      btn.addEventListener("click", () => {
        airportInput.value = airport.iata;
        pickerBtn.textContent = airport.city;
        pickerPanel.classList.add("hidden");
      });
      airportList.appendChild(btn);
    });
  }

  function renderRegions() {
    regionList.innerHTML = "";
    const regions = [...byRegion.keys()].filter(r => (byRegion.get(r) || []).length > 0);
    regions.forEach((region, index) => {
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.textContent = region;
      btn.classList.toggle("active", index === 0);
      btn.addEventListener("click", () => {
        [...regionList.querySelectorAll("button")].forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        renderAirports(region);
      });
      li.appendChild(btn);
      regionList.appendChild(li);
    });
    if (regions.length > 0) renderAirports(regions[0]);
  }

  pickerBtn.addEventListener("click", () => {
    pickerPanel.classList.toggle("hidden");
  });

  document.addEventListener("click", (e) => {
    if (!document.getElementById("airportPicker").contains(e.target)) {
      pickerPanel.classList.add("hidden");
    }
  });

  renderRegions();
}

function updateRouteCount(routeArray) {
  const countElement = document.getElementById("route-count");
  countElement.textContent = `該当路線数：${routeArray.length}件`;
}

document.addEventListener("DOMContentLoaded", async function () {

  await loadData();

  initMap();
  populateDropdowns();
  setupAirportPicker();

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
    const pickerBtn = document.getElementById("airportPickerBtn");
    if (pickerBtn) pickerBtn.textContent = "空港を選択";

    drawRoutes(routes);
    updateRouteCount(routes);
  });

});
