import * as JSONAPI from "jsonapi-typescript";

import { Maybe, Scalars } from "../types";

enum VehicleCurrentStopStatus {
  INCOMING_AT = "INCOMING_AT",
  STOPPED_AT = "STOPPED_AT",
  IN_TRANSIT_TO = "IN_TRANSIT_TO"
}

type MbtaVehicleAttributes = {
  updated_at: string;
  speed: number;
  longitude: number;
  latitude: number;
  label: string;
  direction_id: number;
  current_stop_sequence: number;
  current_status: VehicleCurrentStopStatus;
  bearing: number;
};

export type MbtaVehicle = JSONAPI.ResourceObject<string, MbtaVehicleAttributes>;

export type MbtaVehiclesJSON = JSONAPI.CollectionResourceDoc<
  string,
  MbtaVehicleAttributes
>;

export type Vehicle = {
  id: Maybe<Scalars["ID"]>;
  updated_at?: Maybe<Scalars["String"]>;
  speed?: Maybe<Scalars["Float"]>;
  longitude?: Maybe<Scalars["Float"]>;
  latitude?: Maybe<Scalars["Float"]>;
  label?: Maybe<Scalars["String"]>;
  direction_id?: Maybe<Scalars["Int"]>;
  current_stop_sequence?: Maybe<Scalars["Int"]>;
  current_status?: Maybe<VehicleCurrentStopStatus>;
  bearing?: Maybe<Scalars["Int"]>;
};

export type VehicleFilter = {
  vehicleIdFilter?: string[];
  labelFilter?: string[];
};

export type VehicleResolverArgs = {
  filter?: VehicleFilter;
};
