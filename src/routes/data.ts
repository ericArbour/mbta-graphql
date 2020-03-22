import MbtaAPI from "../data/MbtaAPI";
import { objSnakeKeysToCamelKeys, MbtaRESTError } from "../utils/utils";
import {
  isNotNull,
  Nullish,
  isNotUndefined,
  isCollectionResourceDoc,
  isCollectionResourceDocsArray,
  isDocWithData,
  isRelationshipsWithData,
  isResourceIdentifierObject,
  BatchFieldConfig
} from "../types";
import { isMbtaStopResource } from "../stops/types";

import {
  MbtaRouteResource,
  MbtaRoute,
  RouteType,
  isMbtaRouteResource,
  RoutesResolverArgs,
  RouteResolverArgs
} from "./types";

const routeRelationships: string[] = [];
const ignoreFields = ["vehicles", "stops"];

export async function getRoutes(
  this: MbtaAPI,
  fields: string[],
  args: RoutesResolverArgs
): Promise<MbtaRoute[]> {
  const fieldsAndIncludeParams = this.getFieldsAndIncludeParams(
    "route",
    fields,
    routeRelationships,
    ignoreFields
  );
  const routeIdFilter = args.filter?.routeIdFilter;
  const typeFilter = args.filter?.typeFilter;
  const routeIdFilterString = routeIdFilter?.length
    ? `&filter[id]=${routeIdFilter.join(",")}`
    : "";
  const typeFilterString = typeFilter?.length
    ? `&filter[type]=${typeFilter.map(routeTypeToMbtaRouteType).join(",")}`
    : "";
  const queryString = `${fieldsAndIncludeParams}${routeIdFilterString}${typeFilterString}`;

  const result = await this.getParsedJSON(`routes?${queryString}`);

  if (isCollectionResourceDoc(isMbtaRouteResource, result)) {
    return result.data.map(mbtaRouteResourceToMbtaRoute);
  } else {
    throw new MbtaRESTError();
  }
}

export async function getRoute(
  this: MbtaAPI,
  fields: string[],
  args: RouteResolverArgs
): Promise<MbtaRoute> {
  const fieldsAndIncludeParams = this.getFieldsAndIncludeParams(
    "route",
    fields,
    routeRelationships
  );

  const result = await this.getParsedJSON(
    `routes/${args.id}?${fieldsAndIncludeParams}`
  );

  if (isDocWithData(isMbtaRouteResource, result)) {
    return mbtaRouteResourceToMbtaRoute(result.data);
  } else {
    throw new MbtaRESTError();
  }
}

export async function batchRouteLoadFn(
  this: MbtaAPI,
  configs: readonly BatchFieldConfig[]
): Promise<MbtaRoute[]> {
  const batchIdsString = `&filter[id]=${configs.map(({ id }) => id).join(",")}`;
  const fields = configs.flatMap(config => config.fields);
  const fieldsAndIncludeParams = this.getFieldsAndIncludeParams(
    "route",
    fields,
    routeRelationships
  );

  const result = await this.getParsedJSON(
    `routes?${fieldsAndIncludeParams}${batchIdsString}`
  );

  if (isCollectionResourceDoc(isMbtaRouteResource, result)) {
    const mbtaRouteResources = result.data;
    return configs
      .map(config =>
        mbtaRouteResources.find(
          mbtaRouteResource => mbtaRouteResource.id === config.id
        )
      )
      .filter(isNotUndefined)
      .map(mbtaRouteResourceToMbtaRoute);
  } else {
    throw new MbtaRESTError();
  }
}

export async function batchStopRoutesLoadFn(
  this: MbtaAPI,
  configs: readonly BatchFieldConfig[]
): Promise<MbtaRoute[][]> {
  const fields = configs.flatMap(config => config.fields);
  const fieldsAndIncludeParams = this.getFieldsAndIncludeParams(
    "route",
    fields,
    routeRelationships
  );
  if (configs.length === 1) {
    const [config] = configs;
    const stopFilterString = `&filter[stop]=${config.id}`;
    const result = await this.getParsedJSON(
      `routes?${fieldsAndIncludeParams}${stopFilterString}`
    );

    if (isCollectionResourceDoc(isMbtaRouteResource, result)) {
      return [result.data.map(mbtaRouteResourceToMbtaRoute)];
    } else {
      throw new MbtaRESTError();
    }
  } else {
    const routesResult = await this.getParsedJSON(
      `/routes?${fieldsAndIncludeParams}`
    );
    if (!isCollectionResourceDoc(isMbtaRouteResource, routesResult))
      throw new MbtaRESTError();

    const mbtaRouteResources = routesResult.data;
    const stopRequests = mbtaRouteResources.map(mbtaRouteResource => {
      return this.getParsedJSON(
        `stops?fields=&include=route&filter[route]=${mbtaRouteResource.id}`
      );
    });

    const stopResults = await Promise.all(stopRequests);
    if (!isCollectionResourceDocsArray(isMbtaStopResource, stopResults))
      throw new MbtaRESTError();

    const mbtaStopResources = stopResults.flatMap(result => result.data);

    return configs.map(config => {
      const configStops = mbtaStopResources.filter(
        mbtaStopResource => mbtaStopResource.id === config.id
      );

      const stopRouteIds = configStops
        .map(configStop => {
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
          mbtaRouteResource =>
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
  const { id = null, attributes = {} } = mbtaRouteResource;
  const camelCaseAttributes = objSnakeKeysToCamelKeys(attributes);

  return {
    id,
    ...camelCaseAttributes
  };
}
