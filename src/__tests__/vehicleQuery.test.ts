import { createTestClient } from "apollo-server-testing";
import { gql } from "apollo-server";

import { constructTestServer } from "../utils/testUtils";
import { mockGet } from "../__mocks__/apollo-datasource-rest";
import { response1, response2, result } from "../mockData/vehicleQueryTest";

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

  it("correctly requests stop information", async () => {
    mockGet.mockReturnValueOnce(response1).mockReturnValueOnce(response2);
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
    expect(res.data).toEqual(result);
  });
});
