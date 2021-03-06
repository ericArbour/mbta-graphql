import { createTestClient } from "apollo-server-testing";
import { gql } from "apollo-server";

import { constructTestServer } from "../utils/testUtils";
import { mockGet } from "../__mocks__/apollo-datasource-rest";
import {
  stopResponse1,
  stopResponse2,
  stopResponse3,
  stopResponse4,
  stopResponse5,
  stopResult,
  routeResponse,
  routeResult,
} from "../mockData/stopQueryTest";

afterEach(() => {
  mockGet.mockClear();
});

describe("Stop query", () => {
  const { server } = constructTestServer();
  const { query } = createTestClient(server);

  it("only requests included fields", async () => {
    const GET_STOP = gql`
      query GetStop {
        stop(id: "STOP1") {
          name
          vehicleType
        }
      }
    `;
    await query({ query: GET_STOP });

    expect(mockGet).toBeCalledWith(
      "stops/STOP1?fields[stop]=name,vehicle_type"
    );
  });

  it("supports object field nesting of arbitrary depth ", async () => {
    mockGet
      .mockReturnValueOnce(stopResponse1)
      .mockReturnValueOnce(stopResponse2)
      .mockReturnValueOnce(stopResponse3)
      .mockReturnValueOnce(stopResponse4)
      .mockReturnValueOnce(stopResponse5);

    const GET_STOP = gql`
      query GetStop {
        stop2: stop(id: "STOP2") {
          id
          parentStation {
            id
            me: childStops(filter: { stopIdFilter: ["STOP2"] }) {
              id
            }
            siblingStations: childStops(
              filter: { locationTypeFilter: [STATION] }
            ) {
              id
            }
          }
          childStops {
            id
            childStops {
              id
            }
          }
        }
        stop7: stop(id: "STOP7") {
          ...StopFields
        }
      }
      fragment StopFields on Stop {
        name
        description
        longitude
        latitude
        vehicleType
        childStops {
          ...ChildStopFields
        }
      }
      fragment ChildStopFields on Stop {
        name
        childStops {
          name
        }
      }
    `;
    const res = await query({ query: GET_STOP });

    expect(mockGet).toHaveBeenNthCalledWith(
      1,
      "stops/STOP2?fields[stop]=&include=parent_station,child_stops&fields[parent_station]=&fields[child_stops]="
    );
    expect(mockGet).toHaveBeenNthCalledWith(
      2,
      "stops/STOP7?fields[stop]=name,description,longitude,latitude,vehicle_type&include=child_stops&fields[child_stops]="
    );
    expect(mockGet).toHaveBeenNthCalledWith(
      3,
      "stops?fields[stop]=&include=child_stops&fields[child_stops]=&filter[id]=STOP1"
    );
    expect(mockGet).toHaveBeenNthCalledWith(
      4,
      "stops?fields[stop]=name&include=child_stops&fields[child_stops]=&filter[id]=STOP4,STOP5,STOP8"
    );
    expect(mockGet).toHaveBeenNthCalledWith(
      5,
      "stops?fields[stop]=location_type&filter[id]=STOP2,STOP3,STOP6"
    );
    expect(res.data).toEqual(stopResult);
  });

  it("correctly requests routes", async () => {
    mockGet
      .mockReturnValueOnce(stopResponse1)
      .mockReturnValueOnce(routeResponse);
    const GET_STOP = gql`
      query GetStop {
        stop(id: "STOP2") {
          routes {
            id
          }
        }
      }
    `;
    const res = await query({ query: GET_STOP });

    expect(mockGet).toHaveBeenNthCalledWith(1, "stops/STOP2?fields[stop]=");
    expect(mockGet).toHaveBeenNthCalledWith(
      2,
      "routes?fields[route]=&filter[stop]=STOP2"
    );
    expect(res.data).toEqual(routeResult);
  });
});
