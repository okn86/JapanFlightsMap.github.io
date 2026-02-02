let airports = [];
let routes = [];
let airlines = [];

async function loadData() {
  const airportRes = await fetch("data/airports.json");
  airports = await airportRes.json();

  const routeRes = await fetch("data/routes.json");
  routes = await routeRes.json();

  const airlineRes = await fetch("data/airlines.json");
  airlines = await airlineRes.json();
}
