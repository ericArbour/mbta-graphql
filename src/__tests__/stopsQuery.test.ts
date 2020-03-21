import { createTestClient } from "apollo-server-testing";
import { gql } from "apollo-server";

import { constructTestServer } from "../utils/testUtils";
import { mockGet } from "../__mocks__/apollo-datasource-rest";

afterEach(() => {
  mockGet.mockClear();
});

describe("Stops query", () => {
  const { server } = constructTestServer();
  const { query } = createTestClient(server);

  it("only requests included fields", async () => {
    const GET_STOPS = gql`
      query GetStops {
        stops {
          vehicleType
          description
        }
      }
    `;
    await query({ query: GET_STOPS });

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
    await query({ query: GET_STOPS });

    expect(mockGet).toBeCalledWith(
      "stops?fields[stop]=&filter[id]=STOP1,STOP2"
    );
  });

  it("allows filtering by location types", async () => {
    const GET_STOPS = gql`
      query GetStops {
        stops(
          filter: { locationTypeFilter: [STOP, STATION, ENTRANCE_OR_EXIT] }
        ) {
          id
        }
      }
    `;
    await query({ query: GET_STOPS });

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
    await query({ query: GET_STOPS });

    expect(mockGet).toBeCalledWith(
      "stops?fields[stop]=latitude,longitude&filter[latitude]=70&filter[longitude]=40&filter[radius]=1"
    );
  });

  it("allows filtering by multiple filter types", async () => {
    const GET_STOPS = gql`
      query GetStops {
        stops(
          filter: {
            locationTypeFilter: [STATION]
            locationFilter: { latitude: 70, longitude: 40, radius: 1 }
          }
        ) {
          id
          latitude
          longitude
        }
      }
    `;
    await query({ query: GET_STOPS });

    expect(mockGet).toBeCalledWith(
      "stops?fields[stop]=latitude,longitude&filter[location_type]=1&filter[latitude]=70&filter[longitude]=40&filter[radius]=1"
    );
  });
});
