import * as JSONAPI from "jsonapi-typescript";

import { Scalars, isResourceObject } from "../types";
import { Stop } from "../stops/types";

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

export type MbtaVehicle = JSONAPI.ResourceObject<string, MbtaVehicleAttributes>;

export function isMbtaVehicle(a: any): a is MbtaVehicle {
  return isResourceObject(a) && a.type === "vehicle";
}

export type Vehicle = {
  id: Scalars["ID"] | null;
  updated_at?: Scalars["String"] | null;
  speed?: Scalars["Float"] | null;
  longitude?: Scalars["Float"] | null;
  latitude?: Scalars["Float"] | null;
  label?: Scalars["String"] | null;
  direction_id?: Scalars["Int"] | null;
  current_stop_sequence?: Scalars["Int"] | null;
  current_status?: VehicleCurrentStopStatus | null;
  bearing?: Scalars["Int"] | null;
  stop?: Stop | null;
};

export type BatchStopConfig = { id: string; fields: string[] };

export type VehicleFilter = {
  vehicleIdFilter?: string[];
  labelFilter?: string[];
};

export type VehicleResolverArgs = {
  filter?: VehicleFilter;
};
