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
