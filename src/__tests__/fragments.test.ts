import { createTestClient } from "apollo-server-testing";
import { gql } from "apollo-server";

import { constructTestServer } from "../utils/testUtils";
import { mbtaStopResponse } from "../mockData/fragmentsTest";

const mockGet = jest.fn().mockReturnValue(mbtaStopResponse);

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

describe("Fragment Tests", () => {
  const { server } = constructTestServer();
  const { query } = createTestClient(server);
  it("Only requests included fields with fragments of a depth of 1", async () => {
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
    const res = await query({ query: GET_STOP });
    expect(mockGet).toBeCalledWith(
      "stops/STOP1?fields[stop]=wheelchair_boarding,latitude"
    );
  });
  it("Only requests included fields with fragments of a depth of 2", async () => {
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
    const res = await query({ query: GET_STOP });
    expect(mockGet).toBeCalledWith(
      "stops/STOP1?fields[stop]=wheelchair_boarding,latitude,longitude"
    );
  });
  it("Only requests included fields with fragments of a depth of 3", async () => {
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
    const res = await query({ query: GET_STOP });
    expect(mockGet).toBeCalledWith(
      "stops/STOP1?fields[stop]=wheelchair_boarding,latitude,longitude,location_type"
    );
  });
  it("Only requests included fields with fragments in relationship queries", async () => {
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
    const res = await query({ query: GET_STOP });
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
