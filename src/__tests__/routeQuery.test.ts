import { createTestClient } from "apollo-server-testing";
import { gql } from "apollo-server";

import { constructTestServer } from "../utils/testUtils";
import { mockGet } from "../__mocks__/apollo-datasource-rest";
import {
  routeResponse,
  stopsResponse,
  stopsResult,
  vehiclesResponse,
  vehiclesResult,
  shapesResponse,
  shapesResult,
} from "../mockData/routeQueryTest";

jest.mock("apollo-datasource-rest");

afterEach(() => {
  mockGet.mockClear();
});

describe("Route query", () => {
  const { server } = constructTestServer();
  const { query } = createTestClient(server);

  it("only requests included fields", async () => {
    const GET_ROUTE = gql`
      query GetRoute {
        route(id: "ROUTE1") {
          id
          type
          color
        }
      }
    `;
    await query({ query: GET_ROUTE });

    expect(mockGet).toBeCalledWith("routes/ROUTE1?fields[route]=type,color");
  });

  it("correctly requests stops", async () => {
    mockGet
      .mockReturnValueOnce(routeResponse)
      .mockReturnValueOnce(stopsResponse);
    const GET_ROUTE = gql`
      query GetRoute {
        route(id: "ROUTE1") {
          stops {
            latitude
            longitude
          }
        }
      }
    `;
    const res = await query({ query: GET_ROUTE });

    expect(mockGet).toHaveBeenNthCalledWith(1, "routes/ROUTE1?fields[route]=");
    expect(mockGet).toHaveBeenNthCalledWith(
      2,
      "stops?fields[stop]=latitude,longitude&filter[route]=ROUTE1",
    );
    expect(res.data).toEqual(stopsResult);
  });

  it("correctly requests vehicles", async () => {
    mockGet
      .mockReturnValueOnce(routeResponse)
      .mockReturnValueOnce(vehiclesResponse);
    const GET_ROUTE = gql`
      query GetRoute {
        route(id: "ROUTE1") {
          vehicles {
            latitude
            longitude
          }
        }
      }
    `;
    const res = await query({ query: GET_ROUTE });

    expect(mockGet).toHaveBeenNthCalledWith(1, "routes/ROUTE1?fields[route]=");
    expect(mockGet).toHaveBeenNthCalledWith(
      2,
      "vehicles?fields[vehicle]=latitude,longitude&filter[route]=ROUTE1",
    );
    expect(res.data).toEqual(vehiclesResult);
  });

  it("correctly requests shapes", async () => {
    mockGet
      .mockReturnValueOnce(routeResponse)
      .mockReturnValueOnce(shapesResponse);
    const GET_ROUTE = gql`
      query GetRoute {
        route(id: "ROUTE1") {
          id
          shapes {
            id
          }
        }
      }
    `;
    const res = await query({ query: GET_ROUTE });

    expect(mockGet).toHaveBeenNthCalledWith(1, "routes/ROUTE1?fields[route]=");
    expect(mockGet).toHaveBeenNthCalledWith(
      2,
      "shapes?fields[shape]=&include=route&fields[route]=&filter[route]=ROUTE1",
    );
    expect(res.data).toEqual(shapesResult);
  });
});
