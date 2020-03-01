const stop1 = {
  attributes: {},
  id: "STOP1",
  relationships: {
    child_stops: {
      data: [
        {
          id: "STOP2",
          type: "stop"
        },
        {
          id: "STOP3",
          type: "stop"
        }
      ]
    },
    parent_station: {
      data: null
    }
  },
  type: "stop"
};

const stop2 = {
  attributes: {
    location_type: 0
  },
  id: "STOP2",
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
        }
      ]
    },
    parent_station: {
      data: {
        id: "STOP1",
        type: "stop"
      }
    }
  },
  type: "stop"
};

const stop3 = {
  attributes: { location_type: 1 },
  id: "STOP3",
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
};

const stop4 = {
  attributes: {},
  id: "STOP4",
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
};

const stop5 = {
  attributes: {},
  id: "STOP5",
  relationships: {
    child_stops: {
      data: [
        {
          id: "STOP6",
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
};

const stop6 = {
  attributes: {},
  id: "STOP6",
  relationships: {
    child_stops: {
      data: null
    },
    parent_station: {
      data: {
        id: "STOP5",
        type: "stop"
      }
    }
  },
  type: "stop"
};

const stop7 = {
  attributes: {
    name: "Stop Seven",
    description: "It's a stop",
    longitude: 40,
    latitude: 50,
    vehicle_type: 1
  },
  id: "STOP7",
  relationships: {
    child_stops: {
      data: [
        {
          id: "STOP8",
          type: "stop"
        }
      ]
    },
    parent_station: {
      data: null
    }
  },
  type: "stop"
};

const stop8 = {
  attributes: {
    name: "Stop Eight"
  },
  id: "STOP8",
  relationships: {
    child_stops: {
      data: null
    },
    parent_station: {
      data: {
        id: "STOP8",
        type: "stop"
      }
    }
  },
  type: "stop"
};

export const response1 = JSON.stringify({
  data: stop2
});

export const response2 = JSON.stringify({
  data: stop7
});

export const response3 = JSON.stringify({
  data: [stop1]
});

export const response4 = JSON.stringify({
  data: [stop4, stop5, stop8]
});

export const response5 = JSON.stringify({
  data: [stop2, stop3, stop6]
});

export const result = {
  stop2: {
    id: "STOP2",
    parent_station: {
      id: "STOP1",
      me: [{ id: "STOP2" }],
      siblingStations: [{ id: "STOP3" }]
    },
    child_stops: [
      {
        id: "STOP4",
        child_stops: []
      },
      {
        id: "STOP5",
        child_stops: [{ id: "STOP6" }]
      }
    ]
  },
  stop7: {
    name: "Stop Seven",
    description: "It's a stop",
    longitude: 40,
    latitude: 50,
    vehicle_type: 1,
    child_stops: [
      {
        name: "Stop Eight",
        child_stops: []
      }
    ]
  }
};
