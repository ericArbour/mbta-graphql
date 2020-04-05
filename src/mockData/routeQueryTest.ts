export const routeResponse = JSON.stringify({
  data: {
    attributes: {},
    id: "ROUTE1",
    relationships: {},
    type: "route",
  },
});

export const stopsResponse = JSON.stringify({
  data: [
    {
      attributes: {
        latitude: 1,
        longitude: 1,
      },
      id: "STOP1",
      relationships: {},
      type: "stop",
    },
    {
      attributes: {
        latitude: 2,
        longitude: 2,
      },
      id: "STOP2",
      relationships: {},
      type: "stop",
    },
  ],
});

export const vehiclesResponse = JSON.stringify({
  data: [
    {
      attributes: {
        latitude: 1,
        longitude: 1,
      },
      id: "VEHICLE1",
      relationships: {},
      type: "vehicle",
    },
    {
      attributes: {
        latitude: 2,
        longitude: 2,
      },
      id: "VEHICLE2",
      relationships: {},
      type: "vehicle",
    },
  ],
});

export const stopsResult = {
  route: {
    stops: [
      {
        latitude: 1,
        longitude: 1,
      },
      {
        latitude: 2,
        longitude: 2,
      },
    ],
  },
};

export const vehiclesResult = {
  route: {
    vehicles: [
      {
        latitude: 1,
        longitude: 1,
      },
      {
        latitude: 2,
        longitude: 2,
      },
    ],
  },
};
