import * as JSONAPI from "jsonapi-typescript";

import { Scalars, isResourceObject } from "../types";

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
  id: Scalars["ID"] | null;
  wheelchair_boarding?: Scalars["Int"] | null;
  vehicle_type?: Scalars["Int"] | null;
  platform_name?: Scalars["String"] | null;
  platform_code?: Scalars["String"] | null;
  on_street?: Scalars["String"] | null;
  name?: Scalars["String"] | null;
  municipality?: Scalars["String"] | null;
  longitude?: Scalars["Float"] | null;
  location_type?: Scalars["Int"] | null;
  latitude?: Scalars["Float"] | null;
  description?: Scalars["String"] | null;
  at_street?: Scalars["String"] | null;
  address?: Scalars["String"] | null;
  parent_station?: Stop | null;
  child_stops?: Stop[] | null;
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

type ChildStopsFilter = {
  stopIdFilter?: string[];
  locationTypeFilter?: number[];
};

export type ChildStopsBatchConfig = { ids: string[]; fields: string[] };

export type StopsResolverArgs = {
  filter?: StopsFilter;
};

export type ChildStopsResolverArgs = {
  filter?: ChildStopsFilter;
};

export type StopResolverArgs = {
  id: string;
};
