export const vehicleResponse = JSON.stringify({
  data: {
    attributes: {},
    id: "VEHICLE1",
    relationships: {
      stop: {
        data: {
          id: "STOP1",
          type: "stop",
        },
      },
      route: {
        data: {
          id: "ROUTE1",
          type: "route",
        },
      },
    },
    type: "vehicle",
  },
});

export const stopResponse = JSON.stringify({
  data: [
    {
      attributes: {
        location_type: 1,
      },
      id: "STOP1",
      relationships: {
        child_stops: {
          data: null,
        },
        parent_station: {
          data: null,
        },
      },
      type: "stop",
    },
  ],
});

export const routeResponse = JSON.stringify({
  data: [
    {
      attributes: {},
      id: "ROUTE1",
      relationships: {},
      type: "route",
    },
  ],
});

export const stopResult = {
  vehicle: {
    stop: {
      locationType: "STATION",
    },
  },
};

export const routeResult = {
  vehicle: {
    route: {
      id: "ROUTE1",
    },
  },
};
