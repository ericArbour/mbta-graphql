import MbtaAPI from "../data/MbtaAPI";
import { MbtaRESTError, objSnakeKeysToCamelKeys } from "../utils/utils";
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
  MbtaRouteResource,
  MbtaRoute,
  isMbtaRouteResource,
  RoutesResolverArgs,
  RouteResolverArgs
} from "../routes/types";

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
    ? `&filter[type]=${typeFilter.join(",")}`
    : "";
  const queryString = `${fieldsAndIncludeParams}${routeIdFilterString}${typeFilterString}`;

  const result = await this.getParsedJSON(`routes?${queryString}`);

  if (isCollectionResourceDoc(result, isMbtaRouteResource)) {
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

  if (isDocWithData(result, isMbtaRouteResource)) {
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

  if (isCollectionResourceDoc(result, isMbtaRouteResource)) {
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

    if (isCollectionResourceDoc(result, isMbtaRouteResource)) {
      return [result.data.map(mbtaRouteResourceToMbtaRoute)];
    } else {
      throw new MbtaRESTError();
    }
  } else {
    const routesResult = await this.getParsedJSON(
      `/routes?${fieldsAndIncludeParams}`
    );
    if (!isCollectionResourceDoc(routesResult, isMbtaRouteResource))
      throw new MbtaRESTError();

    const mbtaRouteResources = routesResult.data;
    const stopRequests = mbtaRouteResources.map(mbtaRouteResource => {
      return this.getParsedJSON(
        `stops?fields=&include=route&filter[route]=${mbtaRouteResource.id}`
      );
    });

    const stopResults = await Promise.all(stopRequests);
    if (!isArrayOfCollectionResourceDocs(stopResults, isMbtaStop))
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
