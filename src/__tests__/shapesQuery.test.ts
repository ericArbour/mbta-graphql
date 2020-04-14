import { createTestClient } from "apollo-server-testing";
import { gql } from "apollo-server";

import { constructTestServer } from "../utils/testUtils";
import { mockGet } from "../__mocks__/apollo-datasource-rest";
import { shapesResponse, shapesResult } from "../mockData/shapesQueryTest";

jest.mock("apollo-datasource-rest");

afterEach(() => {
  mockGet.mockClear();
});

describe("Shapes query", () => {
  const { server } = constructTestServer();
  const { query } = createTestClient(server);

  it("only requests included fields", async () => {
    const GET_SHAPES = gql`
      query GetShapes {
        shapes(route: "ROUTE1") {
          name
        }
      }
    `;
    await query({ query: GET_SHAPES });

    expect(mockGet).toBeCalledWith(
      "shapes?fields[shape]=name&filter[route]=ROUTE1",
    );
  });

  it("requires a route argument", async () => {
    const GET_SHAPES = gql`
      query GetShapes {
        shapes {
          polyline
        }
      }
    `;
    await query({ query: GET_SHAPES });

    expect(mockGet).not.toBeCalled();
  });

  it("provides a decoded lon/lat polyline array of coordinates", async () => {
    mockGet.mockReturnValueOnce(shapesResponse);

    const GET_ROUTE = gql`
      query GetRoute {
        shapes(route: "ROUTE1") {
          polyline
        }
      }
    `;
    const res = await query({ query: GET_ROUTE });

    expect(mockGet).toHaveBeenNthCalledWith(
      1,
      "shapes?fields[shape]=polyline&filter[route]=ROUTE1",
    );
    expect(res.data).toEqual(shapesResult);
  });
});
