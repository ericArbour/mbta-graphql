import { createTestClient } from "apollo-server-testing";
import { gql } from "apollo-server";
import { constructTestServer } from "../testUtils";

const mockGet = jest.fn(() => JSON.stringify({ data: [] }));

jest.mock("apollo-datasource-rest", () => {
  class MockRESTDataSource {
    baseUrl = "";
    get = mockGet;
  }

  return {
    RESTDataSource: MockRESTDataSource
  };
});

const GET_VEHICLES = gql`
  query GetVehicles {
    vehicles {
      id
    }
  }
`;

beforeEach(() => {
  mockGet.mockClear();
});

describe("Queries", () => {
  it("Other", async () => {
    console.log("other");
    const { server } = constructTestServer();

    const { query } = createTestClient(server);
    const res = await query({ query: GET_VEHICLES });
    expect(mockGet).toBeCalledWith("vehicles?fields[vehicle]=");
    expect(res.data).toEqual({ vehicles: [] });
  });
});
