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

export type Stop = {
  id: string | null;
  wheelchair_boarding?: number | null;
  vehicle_type?: number | null;
  platform_name?: string | null;
  platform_code?: string | null;
  on_street?: string | null;
  name?: string | null;
  municipality?: string | null;
  longitude?: number | null;
  location_type?: number | null;
  latitude?: number | null;
  description?: string | null;
  at_street?: string | null;
  address?: string | null;
  parent_station?: Stop | null;
  child_stops?: Stop[];
};

type LocationFilterInput = {
  latitude: number;
  longitude: number;
  radius: number;
};

type StopsFilter = {
  stopIdFilter?: string[];
  locationTypeFilter?: number[];
  locationFilter?: LocationFilterInput;
};

type NestedStopsFilter = {
  stopIdFilter?: string[];
  locationTypeFilter?: number[];
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
