import * as JSONAPI from "jsonapi-typescript";

import {
  isResourceObject,
  isCollectionResourceDoc,
  isSingleResourceDoc,
} from "../types";
import { MbtaVehicle } from "../vehicles/types";
import { MbtaStop } from "../stops/types";

type MbtaRouteResourceAttributes = {
  type: number | null;
  text_color: string | null;
  sort_order: number | null;
  short_name: string | null;
  long_name: string | null;
  fare_class: string | null;
  direction_names: (string | null)[] | null;
  direction_destinations: (string | null)[] | null;
  description: string | null;
  color: string | null;
};

export type MbtaRouteResource = JSONAPI.ResourceObject<
  string,
  MbtaRouteResourceAttributes
>;

export function isMbtaRouteResource(x: unknown): x is MbtaRouteResource {
  return isResourceObject(x) && x.type === "route";
}

export function isMbtaRouteResourceDoc(
  x: unknown
): x is JSONAPI.SingleResourceDoc<string, MbtaRouteResourceAttributes> {
  return isSingleResourceDoc(isMbtaRouteResource, x);
}

export function isMbtaRouteResourceCollection(
  x: unknown
): x is JSONAPI.CollectionResourceDoc<string, MbtaRouteResourceAttributes> {
  return isCollectionResourceDoc(isMbtaRouteResource, x);
}

export enum RouteType {
  LIGHT_RAIL = "LIGHT_RAIL",
  SUBWAY = "SUBWAY",
  RAIL = "RAIL",
  BUS = "BUS",
  FERRY = "FERRY",
}

export type MbtaRoute = {
  id: string;
  type?: number | null;
  textColor?: string | null;
  sortOrder?: number | null;
  shortName?: string | null;
  longName?: string | null;
  fareClass?: string | null;
  directionNames?: (string | null)[] | null;
  directionDestinations?: (string | null)[] | null;
  description?: string | null;
  color?: string | null;
  vehicles?: MbtaVehicle[];
  stops?: MbtaStop[];
};

export type RoutesFilter = {
  routeIdFilter?: string[];
  typeFilter?: RouteType[];
};

export type RoutesResolverArgs = {
  filter?: RoutesFilter;
};

export type RouteResolverArgs = {
  id: string;
};
