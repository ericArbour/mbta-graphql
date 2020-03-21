import * as JSONAPI from "jsonapi-typescript";

import { isResourceObject } from "../types";

type MbtaStopAttributes = {
  wheelchair_boarding: number | null;
  vehicle_type: number | null;
  platform_name: string | null;
  platform_code: string | null;
  on_street: string | null;
  name: string | null;
  municipality: string | null;
  longitude: number | null;
  location_type: number | null;
  latitude: number | null;
  description: string | null;
  at_street: string | null;
  address: string | null;
};

export type MbtaStop = JSONAPI.ResourceObject<string, MbtaStopAttributes>;

export function isMbtaStop(a: any): a is MbtaStop {
  return isResourceObject(a) && a.type === "stop";
}

export enum LocationType {
  STOP = "STOP",
  STATION = "STATION",
  ENTRANCE_OR_EXIT = "ENTRANCE_OR_EXIT",
  GENERIC_NODE = "GENERIC_NODE",
  BOARDING_AREA = "BOARDING_AREA"
}

export type Stop = {
  id: string | null;
  wheelchairBoarding?: number | null;
  vehicleType?: number | null;
  platformName?: string | null;
  platformCode?: string | null;
  onStreet?: string | null;
  name?: string | null;
  municipality?: string | null;
  longitude?: number | null;
  locationType?: number | null;
  latitude?: number | null;
  description?: string | null;
  atStreet?: string | null;
  address?: string | null;
  parentStation?: Stop | null;
  childStops?: Stop[];
};

type LocationFilterInput = {
  latitude: number;
  longitude: number;
  radius: number;
};

type StopsFilter = {
  stopIdFilter?: string[];
  locationTypeFilter?: LocationType[];
  locationFilter?: LocationFilterInput;
};

type NestedStopsFilter = {
  stopIdFilter?: string[];
  locationTypeFilter?: LocationType[];
};

export type StopsResolverArgs = {
  filter?: StopsFilter;
};

export type NestedStopsResolverArgs = {
  filter?: NestedStopsFilter;
};

export type StopResolverArgs = {
  id: string;
};
