import { createTestClient } from "apollo-server-testing";
import { gql } from "apollo-server";

import { constructTestServer } from "../utils/testUtils";

const mockGet = jest.fn();

jest.mock("apollo-datasource-rest", () => {
  class MockRESTDataSource {
    baseUrl = "";
    get = mockGet;
  }

  return {
    RESTDataSource: MockRESTDataSource
  };
});

beforeEach(() => {
  mockGet.mockClear();
});

describe("Stops query", () => {
  const { server } = constructTestServer();
  const { query } = createTestClient(server);

  it("only requests included fields", async () => {
    const GET_STOPS = gql`
      query GetStops {
        stops {
          vehicle_type
          description
        }
      }
    `;
    const res = await query({ query: GET_STOPS });
    expect(mockGet).toBeCalledWith(
      "stops?fields[stop]=vehicle_type,description"
    );
  });

  it("allows filtering by stop ids", async () => {
    const GET_STOPS = gql`
      query GetStops {
        stops(filter: { stopIdFilter: ["STOP1", "STOP2"] }) {
          id
        }
      }
    `;
    const res = await query({ query: GET_STOPS });
    expect(mockGet).toBeCalledWith(
      "stops?fields[stop]=&filter[id]=STOP1,STOP2"
    );
  });

  it("allows filtering by location types", async () => {
    const GET_STOPS = gql`
      query GetStops {
        stops(filter: { locationTypeFilter: [0, 1, 2] }) {
          id
        }
      }
    `;
    const res = await query({ query: GET_STOPS });
    expect(mockGet).toBeCalledWith(
      "stops?fields[stop]=&filter[location_type]=0,1,2"
    );
  });

  it("allows filtering by location", async () => {
    const GET_STOPS = gql`
      query GetStops {
        stops(
          filter: { locationFilter: { latitude: 70, longitude: 40, radius: 1 } }
        ) {
          id
          latitude
          longitude
        }
      }
    `;
    const res = await query({ query: GET_STOPS });
    expect(mockGet).toBeCalledWith(
      "stops?fields[stop]=latitude,longitude&filter[latitude]=70&filter[longitude]=40&filter[radius]=1"
    );
  });

  it("allows filtering by multiple filter types", async () => {
    const GET_STOPS = gql`
      query GetStops {
        stops(
          filter: {
            locationTypeFilter: [1]
            locationFilter: { latitude: 70, longitude: 40, radius: 1 }
          }
        ) {
          id
          latitude
          longitude
        }
      }
    `;
    const res = await query({ query: GET_STOPS });
    expect(mockGet).toBeCalledWith(
      "stops?fields[stop]=latitude,longitude&filter[location_type]=1&filter[latitude]=70&filter[longitude]=40&filter[radius]=1"
    );
  });
});
