import { createTestClient } from "apollo-server-testing";
import { gql } from "apollo-server";

import { constructTestServer } from "../utils/testUtils";
import { mockGet } from "../__mocks__/apollo-datasource-rest";
import {
  mbtaVehiclesResponse,
  mbtaStopsResponse,
  mbtaChildStopsResponse,
  mbtaParentStopsResponse,
  result
} from "../mockData/fullGraphTest";

describe("Full graph query", () => {
  it("can traverse from the vehicles node to nested stops", async () => {
    mockGet
      .mockReturnValueOnce(mbtaVehiclesResponse)
      .mockReturnValueOnce(mbtaStopsResponse)
      .mockReturnValueOnce(mbtaChildStopsResponse)
      .mockReturnValueOnce(mbtaParentStopsResponse);

    const GET_FULL_GRAPH = gql`
      query FullGraph {
        vehicles {
          id
          updatedAt
          speed
          longitude
          latitude
          label
          directionId
          currentStopSequence
          currentStatus
          bearing
          stop {
            ...StopFields
            parentStation {
              ...StopFields
            }
            childStops {
              ...StopFields
            }
          }
        }
      }
      fragment StopFields on Stop {
        id
        wheelchairBoarding
        vehicleType
        platformName
        platformCode
        onStreet
        name
        municipality
        latitude
        longitude
        locationType
        description
        atStreet
        address
      }
    `;

    const { server } = constructTestServer();
    const { query } = createTestClient(server);
    const res = await query({ query: GET_FULL_GRAPH });

    expect(mockGet).toHaveBeenNthCalledWith(
      1,
      "vehicles?fields[vehicle]=updated_at,speed,longitude,latitude,label,direction_id,current_stop_sequence,current_status,bearing&include=stop&fields[stop]="
    );
    expect(mockGet).toHaveBeenNthCalledWith(
      2,
      "stops?fields[stop]=wheelchair_boarding,vehicle_type,platform_name,platform_code,on_street,name,municipality,latitude,longitude,location_type,description,at_street,address&include=parent_station,child_stops&fields[parent_station]=&fields[child_stops]=&filter[id]=STOP1,STOP2,STOP3"
    );
    expect(mockGet).toHaveBeenNthCalledWith(
      3,
      "stops?fields[stop]=wheelchair_boarding,vehicle_type,platform_name,platform_code,on_street,name,municipality,latitude,longitude,location_type,description,at_street,address&filter[id]=STOP4,STOP5,STOP6,STOP7"
    );
    expect(mockGet).toHaveBeenNthCalledWith(
      4,
      "stops?fields[stop]=wheelchair_boarding,vehicle_type,platform_name,platform_code,on_street,name,municipality,latitude,longitude,location_type,description,at_street,address&filter[id]=STOP8,STOP9"
    );
    expect(res.data).toEqual(result);
  });
});
