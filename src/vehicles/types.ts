import * as JSONAPI from "jsonapi-typescript";

import { isResourceObject } from "../types";
import { MbtaStop } from "../stops/types";
import { MbtaRoute } from "../routes/types";

enum VehicleCurrentStopStatus {
  INCOMING_AT = "INCOMING_AT",
  STOPPED_AT = "STOPPED_AT",
  IN_TRANSIT_TO = "IN_TRANSIT_TO"
}

type MbtaVehicleAttributes = {
  updated_at: string | null;
  speed: number | null;
  longitude: number | null;
  latitude: number | null;
  label: string | null;
  direction_id: number | null;
  current_stop_sequence: number | null;
  current_status: VehicleCurrentStopStatus | null;
  bearing: number | null;
};

export type MbtaVehicleResource = JSONAPI.ResourceObject<
  string,
  MbtaVehicleAttributes
>;

export function isMbtaVehicleResource(a: any): a is MbtaVehicleResource {
  return isResourceObject(a) && a.type === "vehicle";
}

export type MbtaVehicle = {
  id: string | null;
  updatedAt?: string | null;
  speed?: number | null;
  longitude?: number | null;
  latitude?: number | null;
  label?: string | null;
  directionId?: number | null;
  currentStopSequence?: number | null;
  currentStatus?: VehicleCurrentStopStatus | null;
  bearing?: number | null;
  stop?: MbtaStop | null;
  route?: MbtaRoute | null;
};

export type VehiclesFilter = {
  vehicleIdFilter?: string[];
  labelFilter?: string[];
};

export type VehiclesResolverArgs = {
  filter?: VehiclesFilter;
};

export type VehicleResolverArgs = {
  id: string;
};
