import chunk from "lodash.chunk";

import MbtaAPI from "../data/MbtaAPI";
import { objSnakeKeysToCamelKeys } from "../utils/utils";
import {
  isUndefined,
  isNotUndefined,
  Nullish,
  isRelationshipsWithData,
  isResourceIdentifierObject,
  isResourceIdentifierObjectArray,
  BatchFieldConfig,
  BatchListFieldConfig,
} from "../types";

import {
  MbtaStop,
  MbtaStopResource,
  StopsResolverArgs,
  StopResolverArgs,
  isMbtaStopResourceDoc,
  isMbtaStopResourceCollection,
  LocationType,
} from "./types";

const stopRelationships = ["child_stops", "parent_station", "route"];
const ignoreFields = ["routes"];

export function getStopFieldsAndIncludeParams(this: MbtaAPI, fields: string[]) {
  return this.getFieldsAndIncludeParams(
    "stop",
    stopRelationships,
    ignoreFields,
    fields,
  );
}

export async function getStops(
  this: MbtaAPI,
  fields: string[],
  args: StopsResolverArgs,
): Promise<MbtaStop[]> {
  const fieldsAndIncludeParams = this.getStopFieldsAndIncludeParams(fields);
  const stopIdFilter = args.filter?.stopIdFilter;
  const locationTypeFilter = args.filter?.locationTypeFilter;
  const locationFilter = args.filter?.locationFilter;
  const routeIdFilter = args.filter?.routeIdFilter;
  const stopIdFilterString = stopIdFilter?.length
    ? `&filter[id]=${stopIdFilter.join(",")}`
    : "";
  const locationTypeFilterString = locationTypeFilter?.length
    ? `&filter[location_type]=${locationTypeFilter
        .map(locationTypeToMbtaLocationType)
        .join(",")}`
    : "";
  const locationFilterString = locationFilter
    ? `&filter[latitude]=${locationFilter.latitude}&filter[longitude]=${locationFilter.longitude}&filter[radius]=${locationFilter.radius}`
    : "";
  const routeIdFilterString = routeIdFilter?.length
    ? `&filter[route]=${routeIdFilter.join(",")}`
    : "";
  const queryString = `${fieldsAndIncludeParams}${stopIdFilterString}${locationTypeFilterString}${locationFilterString}${routeIdFilterString}`;

  const result = await this.getTypedParsedJSON(
    `stops?${queryString}`,
    isMbtaStopResourceCollection,
  );

  return result.data.map(mbtaStopResourceToMbtaStop);
}

export async function getStop(
  this: MbtaAPI,
  fields: string[],
  args: StopResolverArgs,
): Promise<MbtaStop> {
  const fieldsAndIncludeParams = this.getStopFieldsAndIncludeParams(fields);

  const result = await this.getTypedParsedJSON(
    `stops/${args.id}?${fieldsAndIncludeParams}`,
    isMbtaStopResourceDoc,
  );

  return mbtaStopResourceToMbtaStop(result.data);
}

export async function batchStopLoadFn(
  this: MbtaAPI,
  configs: readonly BatchFieldConfig[],
): Promise<MbtaStop[]> {
  const fields = configs.flatMap((config) => config.fields);
  const fieldsAndIncludeParams = this.getStopFieldsAndIncludeParams(fields);

  const stopIds = configs.map(({ id }) => id);
  // requests are chunked in batches of 400 to prevent URL size limitations
  const stopIdsChunks = chunk(stopIds, 400);

  const requests = stopIdsChunks.map((chunkOfstopIds) => {
    const batchIdsString = `&filter[id]=${chunkOfstopIds.join(",")}`;
    return this.getTypedParsedJSON(
      `stops?${fieldsAndIncludeParams}${batchIdsString}`,
      isMbtaStopResourceCollection,
    );
  });
  const results = await Promise.all(requests);

  const mbtaStopResources = results.flatMap((result) => result.data);
  return configs
    .map((config) =>
      mbtaStopResources.find(
        (mbtaStopResource) => mbtaStopResource.id === config.id,
      ),
    )
    .filter(isNotUndefined)
    .map(mbtaStopResourceToMbtaStop);
}

export async function batchChildStopsLoadFn(
  this: MbtaAPI,
  configs: readonly BatchListFieldConfig[],
): Promise<MbtaStop[][]> {
  const fields = configs.flatMap((config) => config.fields);
  const fieldsAndIncludeParams = this.getStopFieldsAndIncludeParams(fields);

  const uniqueChildIds = [...new Set(configs.flatMap((config) => config.ids))];
  // requests are chunked in batches of 400 to prevent URL size limitations
  const childIdsChunks = chunk(uniqueChildIds, 400);

  const requests = childIdsChunks.map((childIds) => {
    const childIdsString = `&filter[id]=${childIds.join(",")}`;
    return this.getTypedParsedJSON(
      `stops?${fieldsAndIncludeParams}${childIdsString}`,
      isMbtaStopResourceCollection,
    );
  });
  const results = await Promise.all(requests);

  const mbtaStopResources = results.flatMap((result) => result.data);
  return configs.map((config) =>
    config.ids
      .map((id) =>
        mbtaStopResources.find(
          (mbtaStopResource) => mbtaStopResource.id === id,
        ),
      )
      .filter(isNotUndefined)
      .map(mbtaStopResourceToMbtaStop),
  );
}

export async function batchRouteStopsLoadFn(
  this: MbtaAPI,
  configs: readonly BatchFieldConfig[],
): Promise<MbtaStop[][]> {
  if (configs.length === 1) {
    const [config] = configs;
    const fieldsAndIncludeParams = this.getStopFieldsAndIncludeParams(
      config.fields,
    );
    const routeFilterString = `&filter[route]=${config.id}`;
    const result = await this.getTypedParsedJSON(
      `stops?${fieldsAndIncludeParams}${routeFilterString}`,
      isMbtaStopResourceCollection,
    );

    return [result.data.map(mbtaStopResourceToMbtaStop)];
  } else {
    const fields = configs.flatMap((config) => config.fields);
    const fieldsAndIncludeParams = this.getStopFieldsAndIncludeParams(fields);

    const requests = configs.map((config) => {
      const routeFilterString = `&filter[route]=${config.id}`;
      return this.getTypedParsedJSON(
        `stops?${fieldsAndIncludeParams}${routeFilterString}`,
        isMbtaStopResourceCollection,
      );
    });
    const results = await Promise.all(requests);

    return results.map((result) => result.data.map(mbtaStopResourceToMbtaStop));
  }
}

export function mbtaLocationTypeToLocationType(
  mbtaLocationType: number | Nullish,
) {
  switch (mbtaLocationType) {
    case 0:
      return LocationType.STOP;
    case 1:
      return LocationType.STATION;
    case 2:
      return LocationType.ENTRANCE_OR_EXIT;
    case 3:
      return LocationType.GENERIC_NODE;
    case 4:
      return LocationType.BOARDING_AREA;
    default:
      return LocationType.STOP;
  }
}

export function locationTypeToMbtaLocationType(locationType: LocationType) {
  switch (locationType) {
    case LocationType.STOP:
      return 0;
    case LocationType.STATION:
      return 1;
    case LocationType.ENTRANCE_OR_EXIT:
      return 2;
    case LocationType.GENERIC_NODE:
      return 3;
    case LocationType.BOARDING_AREA:
      return 4;
  }
}

function mbtaStopResourceToMbtaStop(
  mbtaStopResource: MbtaStopResource,
): MbtaStop {
  const { id, attributes = {}, relationships } = mbtaStopResource;
  if (isUndefined(id)) throw new Error("No id on stop.");

  const childStopsRelationship = relationships?.child_stops;
  const parentStationRelationship = relationships?.parent_station;

  const childStopsRelationshipData = isRelationshipsWithData(
    childStopsRelationship,
  )
    ? childStopsRelationship.data
    : null;
  const childStops = isResourceIdentifierObjectArray(childStopsRelationshipData)
    ? childStopsRelationshipData.map(({ id: stopId }) => ({ id: stopId }))
    : [];
  const parentStationRelationshipData = isRelationshipsWithData(
    parentStationRelationship,
  )
    ? parentStationRelationship.data
    : null;
  const parentStation = isResourceIdentifierObject(
    parentStationRelationshipData,
  )
    ? { id: parentStationRelationshipData.id }
    : null;

  const camelCaseAttributes = objSnakeKeysToCamelKeys(attributes);

  return {
    id,
    ...camelCaseAttributes,
    childStops,
    parentStation,
  };
}
