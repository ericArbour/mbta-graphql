export const mbtaStopResponse = JSON.stringify({
  data: {
    attributes: {
      address: "123 Street",
      at_street: null,
      description: null,
      latitude: 42,
      location_type: 1,
      longitude: -71,
      municipality: "Cambridge",
      name: "First Stop",
      on_street: null,
      platform_code: null,
      platform_name: null,
      vehicle_type: null,
      wheelchair_boarding: 1
    },
    id: "STOP1",
    relationships: {
      child_stops: {
        data: [
          {
            id: "STOP3",
            type: "stop"
          }
        ]
      },
      parent_station: {
        data: {
          id: "STOP2",
          type: "stop"
        }
      }
    },
    type: "stop"
  }
});
