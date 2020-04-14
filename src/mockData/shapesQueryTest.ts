import polyline from "@mapbox/polyline";

export const shapesResponse = JSON.stringify({
  data: [
    {
      attributes: {
        polyline: polyline.encode([
          [50, 50],
          [51, 51],
        ]),
      },
      id: "SHAPE1",
      relationships: {
        route: {
          data: {
            id: "ROUTE1",
            type: "route",
          },
        },
      },
      type: "shape",
    },
    {
      attributes: {
        polyline: polyline.encode([
          [60, 60],
          [61, 61],
        ]),
      },
      id: "SHAPE2",
      relationships: {
        route: {
          data: {
            id: "ROUTE1",
            type: "route",
          },
        },
      },
      type: "shape",
    },
  ],
});

export const shapesResult = {
  shapes: [
    {
      polyline: [
        [50, 50],
        [51, 51],
      ],
    },
    {
      polyline: [
        [60, 60],
        [61, 61],
      ],
    },
  ],
};
