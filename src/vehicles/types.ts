import * as JSONAPI from "jsonapi-typescript";

import { isResourceObject } from "../types";
import { Stop } from "../stops/types";
import { Route } from "../routes/types";

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
  id: string | null;
  updated_at?: string | null;
  speed?: number | null;
  longitude?: number | null;
  latitude?: number | null;
  label?: string | null;
  direction_id?: number | null;
  current_stop_sequence?: number | null;
  current_status?: VehicleCurrentStopStatus | null;
  bearing?: number | null;
  stop?: Stop | null;
  route?: Route | null;
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
