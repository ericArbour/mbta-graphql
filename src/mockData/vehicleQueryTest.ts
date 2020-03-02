export const response1 = JSON.stringify({
  data: {
    attributes: {},
    id: "VEHICLE1",
    relationships: {
      stop: {
        data: {
          id: "STOP1",
          type: "stop"
        }
      }
    },
    type: "vehicle"
  }
});

export const response2 = JSON.stringify({
  data: [
    {
      attributes: {
        location_type: 1
      },
      id: "STOP1",
      relationships: {
        child_stops: {
          data: null
        },
        parent_station: {
          data: null
        }
      },
      type: "stop"
    }
  ]
});

export const result = {
  vehicle: {
    stop: {
      location_type: 1
    }
  }
};
