import { createTestClient } from "apollo-server-testing";
import { gql } from "apollo-server";

import { constructTestServer } from "../utils/testUtils";
import { mockGet } from "../__mocks__/apollo-datasource-rest";
import { mbtaStopResponse } from "../mockData/fragmentsTest";

beforeEach(() => {
  mockGet.mockClear();
});

describe("Queries with fragments", () => {
  const { server } = constructTestServer();
  const { query } = createTestClient(server);

  it("only request included fields with fragments of a depth of 1", async () => {
    const GET_STOP = gql`
      query GetStop {
        stop(id: "STOP1") {
          id
          wheelchair_boarding
          ...StopFields
        }
      }
      fragment StopFields on Stop {
        latitude
      }
    `;
    await query({ query: GET_STOP });

    expect(mockGet).toBeCalledWith(
      "stops/STOP1?fields[stop]=wheelchair_boarding,latitude"
    );
  });

  it("only request included fields with fragments of a depth of 2", async () => {
    const GET_STOP = gql`
      query GetStop {
        stop(id: "STOP1") {
          id
          wheelchair_boarding
          ...TopStopFields
        }
      }
      fragment TopStopFields on Stop {
        latitude
        ...NestedStopFields
      }
      fragment NestedStopFields on Stop {
        longitude
      }
    `;
    await query({ query: GET_STOP });

    expect(mockGet).toBeCalledWith(
      "stops/STOP1?fields[stop]=wheelchair_boarding,latitude,longitude"
    );
  });

  it("only request included fields with fragments of a depth of 3", async () => {
    const GET_STOP = gql`
      query GetStop {
        stop(id: "STOP1") {
          id
          wheelchair_boarding
          ...FirstStopFields
        }
      }
      fragment FirstStopFields on Stop {
        latitude
        ...SecondStopFields
      }
      fragment SecondStopFields on Stop {
        longitude
        ...ThirdStopFields
      }
      fragment ThirdStopFields on Stop {
        location_type
      }
    `;
    await query({ query: GET_STOP });

    expect(mockGet).toBeCalledWith(
      "stops/STOP1?fields[stop]=wheelchair_boarding,latitude,longitude,location_type"
    );
  });

  it("Only request included fields with fragments in relationship queries", async () => {
    mockGet.mockReturnValue(mbtaStopResponse);
    const GET_STOP = gql`
      query GetStop {
        stop(id: "STOP1") {
          ...CommonStopFields
          parent_station {
            ...CommonStopFields
          }
          child_stops {
            ...CommonStopFields
          }
        }
      }
      fragment CommonStopFields on Stop {
        id
        name
      }
    `;
    await query({ query: GET_STOP });

    expect(mockGet).toHaveBeenNthCalledWith(
      1,
      "stops/STOP1?fields[stop]=name&include=parent_station,child_stops"
    );
    expect(mockGet).toHaveBeenNthCalledWith(
      2,
      "stops?fields[stop]=name&filter[id]=STOP2"
    );
    expect(mockGet).toHaveBeenNthCalledWith(
      3,
      "stops?fields[stop]=name&filter[id]=STOP3"
    );
  });
});
