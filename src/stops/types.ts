import * as JSONAPI from "jsonapi-typescript";

import { Maybe, Scalars, isResourceObject } from "../types";

type MbtaStopAttributes = {
  wheelchair_boarding: Maybe<number>;
  vehicle_type: Maybe<number>;
  platform_name: Maybe<string>;
  platform_code: Maybe<string>;
  on_street: Maybe<string>;
  name: Maybe<string>;
  municipality: Maybe<string>;
  longitude: Maybe<number>;
  location_type: Maybe<number>;
  latitude: Maybe<number>;
  description: Maybe<string>;
  at_street: Maybe<string>;
  address: Maybe<string>;
};

export type MbtaStop = JSONAPI.ResourceObject<string, MbtaStopAttributes>;

export function isMbtaStop(a: any): a is MbtaStop {
  return isResourceObject(a) && a.type === "stop";
}

export type Stop = {
  id: Maybe<Scalars["ID"]>;
  wheelchair_boarding?: Maybe<Scalars["Int"]>;
  vehicle_type?: Maybe<Scalars["Int"]>;
  platform_name?: Maybe<Scalars["String"]>;
  platform_code?: Maybe<Scalars["String"]>;
  on_street?: Maybe<Scalars["String"]>;
  name?: Maybe<Scalars["String"]>;
  municipality?: Maybe<Scalars["String"]>;
  longitude?: Maybe<Scalars["Float"]>;
  location_type?: Maybe<Scalars["Int"]>;
  latitude?: Maybe<Scalars["Float"]>;
  description?: Maybe<Scalars["String"]>;
  at_street?: Maybe<Scalars["String"]>;
  address?: Maybe<Scalars["String"]>;
  parent_station?: Maybe<Stop>;
  child_stops?: Maybe<Stop[]>;
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
