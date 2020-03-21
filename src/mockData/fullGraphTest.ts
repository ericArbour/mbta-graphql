export const mbtaVehiclesResponse = JSON.stringify({
  data: [
    {
      attributes: {
        bearing: 1,
        current_status: "IN_TRANSIT_TO",
        current_stop_sequence: 1,
        direction_id: 1,
        label: "Cool Train",
        latitude: 20,
        longitude: 20,
        speed: 30,
        updated_at: "2020-02-28T13:27:44-05:00"
      },
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
    },
    {
      attributes: {
        bearing: 1,
        current_status: "IN_TRANSIT_TO",
        current_stop_sequence: 1,
        direction_id: 1,
        label: "Fast Train",
        latitude: 20,
        longitude: 20,
        speed: 30,
        updated_at: "2020-02-28T13:27:44-05:00"
      },
      id: "VEHICLE2",
      relationships: {
        stop: {
          data: {
            id: "STOP2",
            type: "stop"
          }
        }
      },
      type: "vehicle"
    },
    {
      attributes: {
        bearing: 1,
        current_status: "IN_TRANSIT_TO",
        current_stop_sequence: 1,
        direction_id: 1,
        label: "Fun Train",
        latitude: 20,
        longitude: 20,
        speed: 30,
        updated_at: "2020-02-28T13:27:44-05:00"
      },
      id: "VEHICLE3",
      relationships: {
        stop: {
          data: {
            id: "STOP3",
            type: "stop"
          }
        }
      },
      type: "vehicle"
    }
  ]
});

export const mbtaStopsResponse = JSON.stringify({
  data: [
    {
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
              id: "STOP4",
              type: "stop"
            },
            {
              id: "STOP5",
              type: "stop"
            },
            {
              id: "STOP6",
              type: "stop"
            }
          ]
        },
        parent_station: {
          data: null
        }
      },
      type: "stop"
    },
    {
      attributes: {
        address: "123 Street",
        at_street: null,
        description: null,
        latitude: 42,
        location_type: 1,
        longitude: -71,
        municipality: "Cambridge",
        name: "Second Stop",
        on_street: null,
        platform_code: null,
        platform_name: null,
        vehicle_type: null,
        wheelchair_boarding: 1
      },
      id: "STOP2",
      relationships: {
        child_stops: {
          data: [
            {
              id: "STOP7",
              type: "stop"
            }
          ]
        },
        parent_station: {
          data: {
            id: "STOP8",
            type: "stop"
          }
        }
      },
      type: "stop"
    },
    {
      attributes: {
        address: "123 Street",
        at_street: null,
        description: null,
        latitude: 42,
        location_type: 1,
        longitude: -71,
        municipality: "Cambridge",
        name: "Third Stop",
        on_street: null,
        platform_code: null,
        platform_name: null,
        vehicle_type: null,
        wheelchair_boarding: 1
      },
      id: "STOP3",
      relationships: {
        child_stops: {
          data: null
        },
        parent_station: {
          data: {
            id: "STOP9",
            type: "stop"
          }
        }
      },
      type: "stop"
    }
  ]
});

export const mbtaChildStopsResponse = JSON.stringify({
  data: [
    {
      attributes: {
        address: "123 Street",
        at_street: null,
        description: null,
        latitude: 42,
        location_type: 1,
        longitude: -71,
        municipality: "Cambridge",
        name: "Fourth Stop",
        on_street: null,
        platform_code: null,
        platform_name: null,
        vehicle_type: null,
        wheelchair_boarding: 1
      },
      id: "STOP4",
      relationships: {
        child_stops: {
          data: null
        },
        parent_station: {
          data: {
            id: "STOP1",
            type: "stop"
          }
        }
      },
      type: "stop"
    },
    {
      attributes: {
        address: "123 Street",
        at_street: null,
        description: null,
        latitude: 42,
        location_type: 1,
        longitude: -71,
        municipality: "Cambridge",
        name: "Fifth Stop",
        on_street: null,
        platform_code: null,
        platform_name: null,
        vehicle_type: null,
        wheelchair_boarding: 1
      },
      id: "STOP5",
      relationships: {
        child_stops: {
          data: null
        },
        parent_station: {
          data: {
            id: "STOP1",
            type: "stop"
          }
        }
      },
      type: "stop"
    },
    {
      attributes: {
        address: "123 Street",
        at_street: null,
        description: null,
        latitude: 42,
        location_type: 1,
        longitude: -71,
        municipality: "Cambridge",
        name: "Sixth Stop",
        on_street: null,
        platform_code: null,
        platform_name: null,
        vehicle_type: null,
        wheelchair_boarding: 1
      },
      id: "STOP6",
      relationships: {
        child_stops: {
          data: null
        },
        parent_station: {
          data: {
            id: "STOP1",
            type: "stop"
          }
        }
      },
      type: "stop"
    },
    {
      attributes: {
        address: "123 Street",
        at_street: null,
        description: null,
        latitude: 42,
        location_type: 1,
        longitude: -71,
        municipality: "Cambridge",
        name: "Seventh Stop",
        on_street: null,
        platform_code: null,
        platform_name: null,
        vehicle_type: null,
        wheelchair_boarding: 1
      },
      id: "STOP7",
      relationships: {
        child_stops: {
          data: null
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
  ]
});

export const mbtaParentStopsResponse = JSON.stringify({
  data: [
    {
      attributes: {
        address: "123 Street",
        at_street: null,
        description: null,
        latitude: 42,
        location_type: 1,
        longitude: -71,
        municipality: "Cambridge",
        name: "Eighth Stop",
        on_street: null,
        platform_code: null,
        platform_name: null,
        vehicle_type: null,
        wheelchair_boarding: 1
      },
      id: "STOP8",
      relationships: {
        child_stops: {
          data: null
        },
        parent_station: {
          data: {
            id: "STOP1",
            type: "stop"
          }
        }
      },
      type: "stop"
    },
    {
      attributes: {
        address: "123 Street",
        at_street: null,
        description: null,
        latitude: 42,
        location_type: 1,
        longitude: -71,
        municipality: "Cambridge",
        name: "Ninth Stop",
        on_street: null,
        platform_code: null,
        platform_name: null,
        vehicle_type: null,
        wheelchair_boarding: 1
      },
      id: "STOP9",
      relationships: {
        child_stops: {
          data: null
        },
        parent_station: {
          data: {
            id: "STOP1",
            type: "stop"
          }
        }
      },
      type: "stop"
    }
  ]
});

export const result = {
  vehicles: [
    {
      id: "VEHICLE1",
      bearing: 1,
      currentStatus: "IN_TRANSIT_TO",
      currentStopSequence: 1,
      directionId: 1,
      label: "Cool Train",
      latitude: 20,
      longitude: 20,
      speed: 30,
      updatedAt: "2020-02-28T13:27:44-05:00",
      stop: {
        id: "STOP1",
        address: "123 Street",
        atStreet: null,
        description: null,
        latitude: 42,
        locationType: "STATION",
        longitude: -71,
        municipality: "Cambridge",
        name: "First Stop",
        onStreet: null,
        platformCode: null,
        platformName: null,
        vehicleType: null,
        wheelchairBoarding: 1,
        parentStation: null,
        childStops: [
          {
            id: "STOP4",
            address: "123 Street",
            atStreet: null,
            description: null,
            latitude: 42,
            locationType: "STATION",
            longitude: -71,
            municipality: "Cambridge",
            name: "Fourth Stop",
            onStreet: null,
            platformCode: null,
            platformName: null,
            vehicleType: null,
            wheelchairBoarding: 1
          },
          {
            id: "STOP5",
            address: "123 Street",
            atStreet: null,
            description: null,
            latitude: 42,
            locationType: "STATION",
            longitude: -71,
            municipality: "Cambridge",
            name: "Fifth Stop",
            onStreet: null,
            platformCode: null,
            platformName: null,
            vehicleType: null,
            wheelchairBoarding: 1
          },
          {
            id: "STOP6",
            address: "123 Street",
            atStreet: null,
            description: null,
            latitude: 42,
            locationType: "STATION",
            longitude: -71,
            municipality: "Cambridge",
            name: "Sixth Stop",
            onStreet: null,
            platformCode: null,
            platformName: null,
            vehicleType: null,
            wheelchairBoarding: 1
          }
        ]
      }
    },
    {
      id: "VEHICLE2",
      bearing: 1,
      currentStatus: "IN_TRANSIT_TO",
      currentStopSequence: 1,
      directionId: 1,
      label: "Fast Train",
      latitude: 20,
      longitude: 20,
      speed: 30,
      updatedAt: "2020-02-28T13:27:44-05:00",
      stop: {
        id: "STOP2",
        address: "123 Street",
        atStreet: null,
        description: null,
        latitude: 42,
        locationType: "STATION",
        longitude: -71,
        municipality: "Cambridge",
        name: "Second Stop",
        onStreet: null,
        platformCode: null,
        platformName: null,
        vehicleType: null,
        wheelchairBoarding: 1,
        parentStation: {
          id: "STOP8",
          address: "123 Street",
          atStreet: null,
          description: null,
          latitude: 42,
          locationType: "STATION",
          longitude: -71,
          municipality: "Cambridge",
          name: "Eighth Stop",
          onStreet: null,
          platformCode: null,
          platformName: null,
          vehicleType: null,
          wheelchairBoarding: 1
        },
        childStops: [
          {
            id: "STOP7",
            address: "123 Street",
            atStreet: null,
            description: null,
            latitude: 42,
            locationType: "STATION",
            longitude: -71,
            municipality: "Cambridge",
            name: "Seventh Stop",
            onStreet: null,
            platformCode: null,
            platformName: null,
            vehicleType: null,
            wheelchairBoarding: 1
          }
        ]
      }
    },
    {
      id: "VEHICLE3",
      bearing: 1,
      currentStatus: "IN_TRANSIT_TO",
      currentStopSequence: 1,
      directionId: 1,
      label: "Fun Train",
      latitude: 20,
      longitude: 20,
      speed: 30,
      updatedAt: "2020-02-28T13:27:44-05:00",
      stop: {
        id: "STOP3",
        address: "123 Street",
        atStreet: null,
        description: null,
        latitude: 42,
        locationType: "STATION",
        longitude: -71,
        municipality: "Cambridge",
        name: "Third Stop",
        onStreet: null,
        platformCode: null,
        platformName: null,
        vehicleType: null,
        wheelchairBoarding: 1,
        parentStation: {
          id: "STOP9",
          address: "123 Street",
          atStreet: null,
          description: null,
          latitude: 42,
          locationType: "STATION",
          longitude: -71,
          municipality: "Cambridge",
          name: "Ninth Stop",
          onStreet: null,
          platformCode: null,
          platformName: null,
          vehicleType: null,
          wheelchairBoarding: 1
        },
        childStops: []
      }
    }
  ]
};
