function filterRoutesByAirport(airport, airline) {
  return routes.filter(route => {

    const matchAirport =
      !airport ||
      route.origin === airport ||
      route.destination === airport;

    const normalizeAirline = (code) => {
      if (code === "EH") return "NH";
      return code;
    };

    const normalizedAirlines = route.airlines.map(normalizeAirline);

    const matchAirline =
      !airline ||
      normalizedAirlines.includes(airline);

    return matchAirport && matchAirline;
  });
}

function populateDropdowns() {
  const airlineSelect = document.getElementById("airlineSelect");

  const preferredAirlines = ["JL", "NH"];
  const preferredIndex = new Map(preferredAirlines.map((code, index) => [code, index]));

  const visibleAirlines = airlines.filter(a => a.iata && !a.hidden);
  visibleAirlines.sort((a, b) => {
    const aPref = preferredIndex.has(a.iata);
    const bPref = preferredIndex.has(b.iata);
    if (aPref && bPref) return preferredIndex.get(a.iata) - preferredIndex.get(b.iata);
    if (aPref) return -1;
    if (bPref) return 1;
    return (a.name || "").localeCompare(b.name || "", "ja");
  });

  visibleAirlines.forEach(airline => {
    if (!airline.iata || airline.hidden) return;
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

  const majorOrder = ["HND", "NRT", "ITM", "KIX", "CTS", "NGO", "FUK", "OKA"];
  const majorOrderIndex = new Map(majorOrder.map((code, index) => [code, index]));

  const islandIata = new Set([
    "OIM", "HAC", "MYE",
    "RIS", "RBJ", "OIR", "SHB", "MMB", "MBE",
    "OKI", "IKI", "TSJ", "FUJ",
    "TNE", "KUM", "ASJ", "KKX", "TKN", "OKE", "RNJ",
    "IEJ", "KJP", "AGJ", "UEO", "KTD", "MMD", "MMY", "SHI", "TRA", "ISG", "HTR", "OGN"
  ]);

  const isIsland = (airport) => {
    if (!airport || !airport.iata) return false;
    return islandIata.has(airport.iata);
  };

  const compareAirports = (a, b) => {
    const aMajor = !!a.major;
    const bMajor = !!b.major;
    if (aMajor !== bMajor) return aMajor ? -1 : 1;

    if (aMajor && bMajor) {
      const aIndex = majorOrderIndex.has(a.iata) ? majorOrderIndex.get(a.iata) : 999;
      const bIndex = majorOrderIndex.has(b.iata) ? majorOrderIndex.get(b.iata) : 999;
      if (aIndex !== bIndex) return aIndex - bIndex;
    }

    const aIsland = isIsland(a);
    const bIsland = isIsland(b);
    if (aIsland !== bIsland) return aIsland ? 1 : -1;

    return (a.city || "").localeCompare(b.city || "", "ja");
  };

  const byRegion = new Map();
  regionOrder.forEach(r => byRegion.set(r, []));

  const activeAirportIata = new Set();
  routes.forEach(route => {
    if (route.origin) activeAirportIata.add(route.origin);
    if (route.destination) activeAirportIata.add(route.destination);
  });

  airports.forEach(airport => {
    if (!airport.iata) return;
    if (!activeAirportIata.has(airport.iata)) return;
    const region = airport.region || "その他";
    if (!byRegion.has(region)) byRegion.set(region, []);
    byRegion.get(region).push(airport);
    if (airport.major) {
      byRegion.get("主要な空港").push(airport);
    }
  });

  for (const [region, list] of byRegion.entries()) {
    if (region === "主要な空港") {
      list.sort((a, b) => {
        const aIndex = majorOrderIndex.has(a.iata) ? majorOrderIndex.get(a.iata) : 999;
        const bIndex = majorOrderIndex.has(b.iata) ? majorOrderIndex.get(b.iata) : 999;
        if (aIndex !== bIndex) return aIndex - bIndex;
        return (a.city || "").localeCompare(b.city || "", "ja");
      });
      continue;
    }
    list.sort(compareAirports);
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
