import MbtaAPI from "../data/MbtaAPI";
import { MbtaRESTError } from "../utils/utils";
import {
  isNotNull,
  isNotUndefined,
  isCollectionResourceDoc,
  isArrayOfCollectionResourceDocs,
  isDocWithData,
  isRelationshipsWithData,
  isResourceIdentifierObject,
  BatchFieldConfig
} from "../types";
import { isMbtaStop } from "../stops/types";
import {
  MbtaRoute,
  isMbtaRoute,
  RoutesResolverArgs,
  RouteResolverArgs
} from "../routes/types";

const routeRelationships: string[] = [];

export async function getRoutes(
  this: MbtaAPI,
  fields: string[],
  args: RoutesResolverArgs
): Promise<MbtaRoute[]> {
  const fieldsAndIncludeParams = this.getFieldsAndIncludeParams(
    "route",
    fields,
    routeRelationships
  );
  const routeIdFilter = args.filter?.routeIdFilter;
  const typeFilter = args.filter?.typeFilter;
  const routeIdFilterString = routeIdFilter?.length
    ? `&filter[id]=${routeIdFilter.join(",")}`
    : "";
  const typeFilterString = typeFilter?.length
    ? `&filter[type]=${typeFilter.join(",")}`
    : "";
  const queryString = `${fieldsAndIncludeParams}${routeIdFilterString}${typeFilterString}`;

  const result = await this.getParsedJSON(`routes?${queryString}`);

  if (isCollectionResourceDoc(result, isMbtaRoute)) {
    return result.data;
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

  if (isDocWithData(result, isMbtaRoute)) {
    return result.data;
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

  if (isCollectionResourceDoc(result, isMbtaRoute)) {
    const mbtaRoutes = result.data;
    return configs
      .map(config => mbtaRoutes.find(mbtaRoute => mbtaRoute.id === config.id))
      .filter(isNotUndefined);
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

    if (isCollectionResourceDoc(result, isMbtaRoute)) {
      return [result.data];
    } else {
      throw new MbtaRESTError();
    }
  } else {
    const routesResult = await this.getParsedJSON(
      `/routes?${fieldsAndIncludeParams}`
    );
    if (!isCollectionResourceDoc(routesResult, isMbtaRoute))
      throw new MbtaRESTError();

    const mbtaRoutes = routesResult.data;
    const stopRequests = mbtaRoutes.map(mbtaRoute => {
      return this.getParsedJSON(
        `stops?fields=&include=route&filter[route]=${mbtaRoute.id}`
      );
    });

    const stopResults = await Promise.all(stopRequests);
    if (!isArrayOfCollectionResourceDocs(stopResults, isMbtaStop))
      throw new MbtaRESTError();

    const mbtaStops = stopResults.flatMap(result => result.data);

    return configs.map(config => {
      const configStops = mbtaStops.filter(
        mbtaStop => mbtaStop.id === config.id
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

      return mbtaRoutes.filter(
        mbtaRoute =>
          mbtaRoute.id !== undefined && stopRouteIds.includes(mbtaRoute.id)
      );
    });
  }
}
