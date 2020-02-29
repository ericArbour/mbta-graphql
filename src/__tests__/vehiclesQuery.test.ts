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

describe("Vehicles query", () => {
  const { server } = constructTestServer();
  const { query } = createTestClient(server);

  it("only requests included fields", async () => {
    const GET_VEHICLES = gql`
      query GetVehicles {
        vehicles {
          id
          speed
          label
        }
      }
    `;
    const res = await query({ query: GET_VEHICLES });
    expect(mockGet).toBeCalledWith("vehicles?fields[vehicle]=speed,label");
  });

  it("allows filtering by vehicle ids", async () => {
    const GET_VEHICLES = gql`
      query GetVehicles {
        vehicles(filter: { vehicleIdFilter: ["VEHICLE1"] }) {
          id
        }
      }
    `;
    const res = await query({ query: GET_VEHICLES });
    expect(mockGet).toBeCalledWith(
      "vehicles?fields[vehicle]=&filter[id]=VEHICLE1"
    );
  });

  it("allows filtering by label", async () => {
    const GET_VEHICLES = gql`
      query GetVehicles {
        vehicles(filter: { labelFilter: ["Vehicle One"] }) {
          id
        }
      }
    `;
    const res = await query({ query: GET_VEHICLES });
    expect(mockGet).toBeCalledWith(
      "vehicles?fields[vehicle]=&filter[label]=Vehicle One"
    );
  });
});
