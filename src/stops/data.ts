import chunk from "lodash.chunk";

import MbtaAPI from "../data/MbtaAPI";
import { MbtaRESTError } from "../utils/utils";
import {
  isNotUndefined,
  isCollectionResourceDoc,
  isArrayOfCollectionResourceDocs,
  isDocWithData,
  BatchFieldConfig,
  BatchListFieldConfig
} from "../types";
import {
  StopsResolverArgs,
  StopResolverArgs,
  MbtaStop,
  isMbtaStop
} from "../stops/types";

const stopRelationships: string[] = ["child_stops", "parent_station", "route"];

export async function getStops(
  this: MbtaAPI,
  fields: string[],
  args: StopsResolverArgs
): Promise<MbtaStop[]> {
  const fieldsAndIncludeParams = this.getFieldsAndIncludeParams(
    "stop",
    fields,
    stopRelationships
  );
  const stopIdFilter = args.filter?.stopIdFilter;
  const locationTypeFilter = args.filter?.locationTypeFilter;
  const locationFilter = args.filter?.locationFilter;
  const stopIdFilterString = stopIdFilter?.length
    ? `&filter[id]=${stopIdFilter.join(",")}`
    : "";
  const locationTypeFilterString = locationTypeFilter?.length
    ? `&filter[location_type]=${locationTypeFilter.join(",")}`
    : "";
  const locationFilterString = locationFilter
    ? `&filter[latitude]=${locationFilter.latitude}&filter[longitude]=${locationFilter.longitude}&filter[radius]=${locationFilter.radius}`
    : "";
  const queryString = `${fieldsAndIncludeParams}${stopIdFilterString}${locationTypeFilterString}${locationFilterString}`;

  const result = await this.getParsedJSON(`stops?${queryString}`);

  if (isCollectionResourceDoc(result, isMbtaStop)) {
    return result.data;
  } else {
    throw new MbtaRESTError();
  }
}

export async function getStop(
  this: MbtaAPI,
  fields: string[],
  args: StopResolverArgs
): Promise<MbtaStop> {
  const fieldsAndIncludeParams = this.getFieldsAndIncludeParams(
    "stop",
    fields,
    stopRelationships
  );

  const result = await this.getParsedJSON(
    `stops/${args.id}?${fieldsAndIncludeParams}`
  );

  if (isDocWithData(result, isMbtaStop)) {
    return result.data;
  } else {
    throw new MbtaRESTError();
  }
}

export async function batchStopLoadFn(
  this: MbtaAPI,
  configs: readonly BatchFieldConfig[]
): Promise<MbtaStop[]> {
  const fields = configs.flatMap(config => config.fields);
  const fieldsAndIncludeParams = this.getFieldsAndIncludeParams(
    "stop",
    fields,
    stopRelationships
  );

  const stopIds = configs.map(({ id }) => id);
  // requests are chunked in batches of 400 to prevent URL size limitations
  const stopIdsChunks = chunk(stopIds, 400);

  const requests = stopIdsChunks.map(chunkOfstopIds => {
    const batchIdsString = `&filter[id]=${chunkOfstopIds.join(",")}`;
    return this.getParsedJSON(
      `stops?${fieldsAndIncludeParams}${batchIdsString}`
    );
  });

  const results = await Promise.all(requests);

  if (isArrayOfCollectionResourceDocs(results, isMbtaStop)) {
    const mbtaStops = results.flatMap(result => result.data);
    return configs
      .map(config => mbtaStops.find(mbtaStop => mbtaStop.id === config.id))
      .filter(isNotUndefined);
  } else {
    throw new MbtaRESTError();
  }
}

export async function batchChildStopsLoadFn(
  this: MbtaAPI,
  configs: readonly BatchListFieldConfig[]
): Promise<MbtaStop[][]> {
  const fields = configs.flatMap(config => config.fields);
  const fieldsAndIncludeParams = this.getFieldsAndIncludeParams(
    "stop",
    fields,
    stopRelationships
  );

  const uniqueChildIds = [...new Set(configs.flatMap(config => config.ids))];
  // requests are chunked in batches of 400 to prevent URL size limitations
  const childIdsChunks = chunk(uniqueChildIds, 400);

  const requests = childIdsChunks.map(childIds => {
    const childIdsString = `&filter[id]=${childIds.join(",")}`;
    return this.getParsedJSON(
      `stops?${fieldsAndIncludeParams}${childIdsString}`
    );
  });

  const results = await Promise.all(requests);

  if (isArrayOfCollectionResourceDocs(results, isMbtaStop)) {
    const mbtaStops = results.flatMap(result => result.data);
    return configs.map(config =>
      config.ids
        .map(id => mbtaStops.find(mbtaStop => mbtaStop.id === id))
        .filter(isNotUndefined)
    );
  } else {
    throw new MbtaRESTError();
  }
}

export async function batchRouteStopsLoadFn(
  this: MbtaAPI,
  configs: readonly BatchFieldConfig[]
): Promise<MbtaStop[][]> {
  if (configs.length === 1) {
    const [config] = configs;
    const fieldsAndIncludeParams = this.getFieldsAndIncludeParams(
      "stop",
      config.fields,
      stopRelationships
    );
    const routeFilterString = `&filter[route]=${config.id}`;
    const result = await this.getParsedJSON(
      `stops?${fieldsAndIncludeParams}${routeFilterString}`
    );

    if (isCollectionResourceDoc(result, isMbtaStop)) {
      return [result.data];
    } else {
      throw new MbtaRESTError();
    }
  } else {
    const fields = configs.flatMap(config => config.fields);
    const fieldsAndIncludeParams = this.getFieldsAndIncludeParams(
      "stop",
      fields,
      stopRelationships
    );
    const requests = configs.map(config => {
      const routeFilterString = `&filter[route]=${config.id}`;
      return this.getParsedJSON(
        `stops?${fieldsAndIncludeParams}${routeFilterString}`
      );
    });
    const results = await Promise.all(requests);

    if (isArrayOfCollectionResourceDocs(results, isMbtaStop)) {
      return results.map(result => result.data);
    } else {
      throw new MbtaRESTError();
    }
  }
}