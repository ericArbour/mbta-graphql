import * as JSONAPI from "jsonapi-typescript";

import {
  isResourceObject,
  isSingleResourceDoc,
  isCollectionResourceDoc,
} from "../types";

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

export type MbtaStopResource = JSONAPI.ResourceObject<
  string,
  MbtaStopAttributes
>;

export function isMbtaStopResource(x: unknown): x is MbtaStopResource {
  return isResourceObject(x) && x.type === "stop";
}

export function isMbtaStopResourceDoc(
  x: unknown,
): x is JSONAPI.SingleResourceDoc<string, MbtaStopAttributes> {
  return isSingleResourceDoc(isMbtaStopResource, x);
}

export function isMbtaStopResourceCollection(
  x: unknown,
): x is JSONAPI.CollectionResourceDoc<string, MbtaStopAttributes> {
  return isCollectionResourceDoc(isMbtaStopResource, x);
}

export enum LocationType {
  STOP = "STOP",
  STATION = "STATION",
  ENTRANCE_OR_EXIT = "ENTRANCE_OR_EXIT",
  GENERIC_NODE = "GENERIC_NODE",
  BOARDING_AREA = "BOARDING_AREA",
}

export type MbtaStop = {
  id: string;
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
  parentStation?: MbtaStop | null;
  childStops?: MbtaStop[];
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
  routeIdFilter?: string[];
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
