import MbtaAPI from "../data/MbtaAPI";
import { objSnakeKeysToCamelKeys } from "../utils/utils";
import {
  isUndefined,
  isNotNull,
  Nullish,
  isNotUndefined,
  isRelationshipsWithData,
  isResourceIdentifierObject,
  BatchFieldConfig,
} from "../types";
import { isMbtaStopResourceCollection } from "../stops/types";

import {
  MbtaRouteResource,
  MbtaRoute,
  RouteType,
  isMbtaRouteResourceDoc,
  isMbtaRouteResourceCollection,
  RoutesResolverArgs,
  RouteResolverArgs,
} from "./types";

const routeRelationships: string[] = [];
const ignoreFields = ["vehicles", "stops"];

export function getRouteFieldsAndIncludeParams(
  this: MbtaAPI,
  fields: string[]
) {
  return this.getFieldsAndIncludeParams(
    "route",
    routeRelationships,
    ignoreFields,
    fields
  );
}

export async function getRoutes(
  this: MbtaAPI,
  fields: string[],
  args: RoutesResolverArgs
): Promise<MbtaRoute[]> {
  const fieldsAndIncludeParams = this.getRouteFieldsAndIncludeParams(fields);
  const routeIdFilter = args.filter?.routeIdFilter;
  const typeFilter = args.filter?.typeFilter;
  const routeIdFilterString = routeIdFilter?.length
    ? `&filter[id]=${routeIdFilter.join(",")}`
    : "";
  const typeFilterString = typeFilter?.length
    ? `&filter[type]=${typeFilter.map(routeTypeToMbtaRouteType).join(",")}`
    : "";
  const queryString = `${fieldsAndIncludeParams}${routeIdFilterString}${typeFilterString}`;

  const result = await this.getTypedParsedJSON(
    `routes?${queryString}`,
    isMbtaRouteResourceCollection
  );

  return result.data.map(mbtaRouteResourceToMbtaRoute);
}

export async function getRoute(
  this: MbtaAPI,
  fields: string[],
  args: RouteResolverArgs
): Promise<MbtaRoute> {
  const fieldsAndIncludeParams = this.getRouteFieldsAndIncludeParams(fields);

  const result = await this.getTypedParsedJSON(
    `routes/${args.id}?${fieldsAndIncludeParams}`,
    isMbtaRouteResourceDoc
  );

  return mbtaRouteResourceToMbtaRoute(result.data);
}

export async function batchRouteLoadFn(
  this: MbtaAPI,
  configs: readonly BatchFieldConfig[]
): Promise<MbtaRoute[]> {
  const batchIdsString = `&filter[id]=${configs.map(({ id }) => id).join(",")}`;
  const fields = configs.flatMap((config) => config.fields);
  const fieldsAndIncludeParams = this.getRouteFieldsAndIncludeParams(fields);

  const result = await this.getTypedParsedJSON(
    `routes?${fieldsAndIncludeParams}${batchIdsString}`,
    isMbtaRouteResourceCollection
  );
  const mbtaRouteResources = result.data;

  return configs
    .map((config) =>
      mbtaRouteResources.find(
        (mbtaRouteResource) => mbtaRouteResource.id === config.id
      )
    )
    .filter(isNotUndefined)
    .map(mbtaRouteResourceToMbtaRoute);
}

export async function batchStopRoutesLoadFn(
  this: MbtaAPI,
  configs: readonly BatchFieldConfig[]
): Promise<MbtaRoute[][]> {
  const fields = configs.flatMap((config) => config.fields);
  const fieldsAndIncludeParams = this.getRouteFieldsAndIncludeParams(fields);

  if (configs.length === 1) {
    const [config] = configs;
    const stopFilterString = `&filter[stop]=${config.id}`;
    const result = await this.getTypedParsedJSON(
      `routes?${fieldsAndIncludeParams}${stopFilterString}`,
      isMbtaRouteResourceCollection
    );

    return [result.data.map(mbtaRouteResourceToMbtaRoute)];
  } else {
    const routesResult = await this.getTypedParsedJSON(
      `/routes?${fieldsAndIncludeParams}`,
      isMbtaRouteResourceCollection
    );
    const mbtaRouteResources = routesResult.data;

    const stopRequests = mbtaRouteResources.map((mbtaRouteResource) => {
      return this.getTypedParsedJSON(
        `stops?fields=&include=route&filter[route]=${mbtaRouteResource.id}`,
        isMbtaStopResourceCollection
      );
    });
    const stopResults = await Promise.all(stopRequests);
    const mbtaStopResources = stopResults.flatMap((result) => result.data);

    return configs.map((config) => {
      const configStops = mbtaStopResources.filter(
        (mbtaStopResource) => mbtaStopResource.id === config.id
      );

      const stopRouteIds = configStops
        .map((configStop) => {
          const routeRelationship = configStop.relationships?.route;
          if (
            !isRelationshipsWithData(routeRelationship) ||
            !isResourceIdentifierObject(routeRelationship.data)
          )
            return null;

          return routeRelationship.data.id;
        })
        .filter(isNotNull);

      return mbtaRouteResources
        .filter(
          (mbtaRouteResource) =>
            isNotUndefined(mbtaRouteResource.id) &&
            stopRouteIds.includes(mbtaRouteResource.id)
        )
        .map(mbtaRouteResourceToMbtaRoute);
    });
  }
}

export function mbtaRouteTypeToRouteType(
  type: number | Nullish
): RouteType | null {
  switch (type) {
    case 0:
      return RouteType.LIGHT_RAIL;
    case 1:
      return RouteType.SUBWAY;
    case 2:
      return RouteType.RAIL;
    case 3:
      return RouteType.BUS;
    case 4:
      return RouteType.FERRY;
    default:
      return null;
  }
}

export function routeTypeToMbtaRouteType(type: RouteType): number {
  switch (type) {
    case RouteType.LIGHT_RAIL:
      return 0;
    case RouteType.SUBWAY:
      return 1;
    case RouteType.RAIL:
      return 2;
    case RouteType.BUS:
      return 3;
    case RouteType.FERRY:
      return 4;
  }
}

function mbtaRouteResourceToMbtaRoute(
  mbtaRouteResource: MbtaRouteResource
): MbtaRoute {
  const { id, attributes = {} } = mbtaRouteResource;
  if (isUndefined(id)) throw new Error("No id on route.");

  const camelCaseAttributes = objSnakeKeysToCamelKeys(attributes);

  return {
    id,
    ...camelCaseAttributes,
  };
}
