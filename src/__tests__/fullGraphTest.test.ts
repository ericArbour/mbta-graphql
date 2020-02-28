import { createTestClient } from "apollo-server-testing";
import { gql } from "apollo-server";

import { constructTestServer } from "../utils/testUtils";

import {
  mbtaVehiclesResponse,
  mbtaStopsResponse,
  mbtaChildStopsResponse,
  mbtaParentStopsResponse,
  responseData
} from "../mockData/fullGraphTest";

const mockGet = jest
  .fn()
  .mockReturnValueOnce(mbtaVehiclesResponse)
  .mockReturnValueOnce(mbtaStopsResponse)
  .mockReturnValueOnce(mbtaChildStopsResponse)
  .mockReturnValueOnce(mbtaParentStopsResponse);

jest.mock("apollo-datasource-rest", () => {
  class MockRESTDataSource {
    baseUrl = "";
    get = mockGet;
  }

  return {
    RESTDataSource: MockRESTDataSource
  };
});

describe("Vehicles Query", () => {
  it("Can traverse from the vehicles node to nested stops", async () => {
    const GET_VEHICLES = gql`
      query Vehicles {
        vehicles {
          id
          updated_at
          speed
          longitude
          latitude
          label
          direction_id
          current_stop_sequence
          current_status
          bearing
          stop {
            id
            wheelchair_boarding
            vehicle_type
            platform_name
            platform_code
            on_street
            name
            municipality
            latitude
            longitude
            location_type
            description
            at_street
            address
            parent_station {
              id
              wheelchair_boarding
              vehicle_type
              platform_name
              platform_code
              on_street
              name
              municipality
              latitude
              longitude
              location_type
              description
              at_street
              address
            }
            child_stops {
              id
              wheelchair_boarding
              vehicle_type
              platform_name
              platform_code
              on_street
              name
              municipality
              latitude
              longitude
              location_type
              description
              at_street
              address
            }
          }
        }
      }
    `;

    const { server } = constructTestServer();
    const { query } = createTestClient(server);
    const res = await query({ query: GET_VEHICLES });

    expect(mockGet).toHaveBeenNthCalledWith(
      1,
      "vehicles?fields[vehicle]=updated_at,speed,longitude,latitude,label,direction_id,current_stop_sequence,current_status,bearing&include=stop&fields[stop]="
    );
    expect(mockGet).toHaveBeenNthCalledWith(
      2,
      "stops?fields[stop]=wheelchair_boarding,vehicle_type,platform_name,platform_code,on_street,name,municipality,latitude,longitude,location_type,description,at_street,address&include=parent_station,child_stops&filter[id]=STOP1,STOP2,STOP3"
    );
    expect(mockGet).toHaveBeenNthCalledWith(
      3,
      "stops?fields[stop]=wheelchair_boarding,vehicle_type,platform_name,platform_code,on_street,name,municipality,latitude,longitude,location_type,description,at_street,address&filter[id]=STOP4,STOP5,STOP6,STOP7"
    );
    expect(mockGet).toHaveBeenNthCalledWith(
      4,
      "stops?fields[stop]=wheelchair_boarding,vehicle_type,platform_name,platform_code,on_street,name,municipality,latitude,longitude,location_type,description,at_street,address&filter[id]=STOP8,STOP9"
    );
    expect(res.data).toEqual(responseData);
  });
});
