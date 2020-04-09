import { createTestClient } from "apollo-server-testing";
import { gql } from "apollo-server";

import { constructTestServer } from "../utils/testUtils";
import { mockGet } from "../__mocks__/apollo-datasource-rest";

jest.mock("apollo-datasource-rest");

afterEach(() => {
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
    await query({ query: GET_VEHICLES });

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
    await query({ query: GET_VEHICLES });

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
    await query({ query: GET_VEHICLES });

    expect(mockGet).toBeCalledWith(
      "vehicles?fields[vehicle]=&filter[label]=Vehicle One"
    );
  });

  it("allows filtering by route", async () => {
    const GET_VEHICLES = gql`
      query GetVehicles {
        vehicles(filter: { routeFilter: ["ROUTE1", "ROUTE2"] }) {
          id
        }
      }
    `;
    await query({ query: GET_VEHICLES });

    expect(mockGet).toBeCalledWith(
      "vehicles?fields[vehicle]=&filter[route]=ROUTE1,ROUTE2"
    );
  });
});
