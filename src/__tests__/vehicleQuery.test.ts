import { createTestClient } from "apollo-server-testing";
import { gql } from "apollo-server";

import { constructTestServer } from "../utils/testUtils";
import { mockGet } from "../__mocks__/apollo-datasource-rest";
import {
  vehicleResponse,
  stopResponse,
  stopResult,
  routeResponse,
  routeResult,
} from "../mockData/vehicleQueryTest";

jest.mock("apollo-datasource-rest");

afterEach(() => {
  mockGet.mockClear();
});

describe("Vehicle query", () => {
  const { server } = constructTestServer();
  const { query } = createTestClient(server);

  it("only requests included fields", async () => {
    const GET_VEHICLE = gql`
      query GetVehicle {
        vehicle(id: "VEHICLE1") {
          id
          currentStatus
          updatedAt
        }
      }
    `;
    await query({ query: GET_VEHICLE });

    expect(mockGet).toBeCalledWith(
      "vehicles/VEHICLE1?fields[vehicle]=current_status,updated_at"
    );
  });

  it("correctly requests stop", async () => {
    mockGet
      .mockReturnValueOnce(vehicleResponse)
      .mockReturnValueOnce(stopResponse);
    const GET_VEHICLE = gql`
      query GetVehicle {
        vehicle(id: "VEHICLE1") {
          stop {
            locationType
          }
        }
      }
    `;
    const res = await query({ query: GET_VEHICLE });

    expect(mockGet).toHaveBeenNthCalledWith(
      1,
      "vehicles/VEHICLE1?fields[vehicle]=&include=stop&fields[stop]="
    );
    expect(mockGet).toHaveBeenNthCalledWith(
      2,
      "stops?fields[stop]=location_type&filter[id]=STOP1"
    );
    expect(res.data).toEqual(stopResult);
  });

  it("correctly requests route", async () => {
    mockGet
      .mockReturnValueOnce(vehicleResponse)
      .mockReturnValueOnce(routeResponse);
    const GET_VEHICLE = gql`
      query GetVehicle {
        vehicle(id: "VEHICLE1") {
          route {
            id
          }
        }
      }
    `;
    const res = await query({ query: GET_VEHICLE });

    expect(mockGet).toHaveBeenNthCalledWith(
      1,
      "vehicles/VEHICLE1?fields[vehicle]=&include=route&fields[route]="
    );
    expect(mockGet).toHaveBeenNthCalledWith(
      2,
      "routes?fields[route]=&filter[id]=ROUTE1"
    );
    expect(res.data).toEqual(routeResult);
  });
});
