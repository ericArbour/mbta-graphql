import * as JSONAPI from "jsonapi-typescript";

import { isResourceObject } from "../types";
import { Vehicle } from "../vehicles/types";

type MbtaRouteAttributes = {
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

export type MbtaRoute = JSONAPI.ResourceObject<string, MbtaRouteAttributes>;

export function isMbtaRoute(a: any): a is MbtaRoute {
  return isResourceObject(a) && a.type === "route";
}

export type Route = {
  id: string | null;
  type?: number | null;
  text_color?: string | null;
  sort_order?: number | null;
  short_name?: string | null;
  long_name?: string | null;
  fare_class?: string | null;
  direction_names?: (string | null)[] | null;
  direction_destinations?: (string | null)[] | null;
  description?: string | null;
  color?: string | null;
  vehicles?: Vehicle[] | null;
};

export type RoutesFilter = {
  routeIdFilter?: string[];
  typeFilter?: number[];
};

export type RoutesResolverArgs = {
  filter?: RoutesFilter;
};

export type RouteResolverArgs = {
  id: string;
};
