import { RESTDataSource, RequestOptions } from "apollo-datasource-rest";
import DataLoader, { BatchLoadFn } from "dataloader";
import chunk from "lodash.chunk";

import {
  isNotUndefined,
  isCollectionResourceDoc,
  isArrayOfCollectionResourceDocs,
  isDocWithData,
  isRelationshipsWithData,
  isResourceIdentifierObject,
  BatchFieldConfig,
  BatchListFieldConfig
} from "../types";
import {
  MbtaVehicle,
  isMbtaVehicle,
  VehiclesResolverArgs,
  VehicleResolverArgs
} from "../vehicles/types";
import {
  StopsResolverArgs,
  StopResolverArgs,
  MbtaStop,
  isMbtaStop
} from "../stops/types";
import {
  MbtaRoute,
  isMbtaRoute,
  RoutesResolverArgs,
  RouteResolverArgs
} from "../routes/types";
import { MbtaRESTError } from "../utils/utils";

const vehicleRelationships: string[] = ["stop"];
const stopRelationships: string[] = ["child_stops", "parent_station", "route"];
const routeRelationships: string[] = [];

export default class MbtaAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = "https://api-v3.mbta.com/";
  }

  willSendRequest(request: RequestOptions) {
    request.headers.set("X-API-Key", process.env.MBTA_API_KEY || "");
  }

  private getFieldsAndIncludeParams(
    pathType: string,
    fields: string[],
    relationships: string[]
  ): string {
    const uniqueFields = [...new Set(fields)];
    const relationshipsFields = uniqueFields.filter(field =>
      relationships.includes(field)
    );
    const attributeFields = uniqueFields.filter(
      field => !relationships.includes(field)
    );
    const fieldsString = `fields[${pathType}]=${attributeFields.join(",")}`;
    const includeRelationshipsString = relationshipsFields.length
      ? `&include=${relationshipsFields.join(",")}`
      : "";
    const includeRelationshipsFieldsString = relationshipsFields.length
      ? `${relationshipsFields
          .map(relationshipsField => `&fields[${relationshipsField}]=`)
          .join("")}`
      : "";

    return `${fieldsString}${includeRelationshipsString}${includeRelationshipsFieldsString}`;
  }

  async getVehicles(
    fields: string[],
    args: VehiclesResolverArgs
  ): Promise<MbtaVehicle[]> {
    const fieldsAndIncludeParams = this.getFieldsAndIncludeParams(
      "vehicle",
      fields,
      vehicleRelationships
    );
    const vehicleIdFilter = args.filter?.vehicleIdFilter;
    const labelFilter = args.filter?.labelFilter;
    const vehicleIdFilterString = vehicleIdFilter?.length
      ? `&filter[id]=${vehicleIdFilter.join(",")}`
      : "";
    const labelFilterString = labelFilter?.length
      ? `&filter[label]=${labelFilter.join(",")}`
      : "";
    const queryString = `${fieldsAndIncludeParams}${vehicleIdFilterString}${labelFilterString}`;

    const result = await this.getParsedJSON(`vehicles?${queryString}`);

    if (isCollectionResourceDoc(result, isMbtaVehicle)) {
      return result.data;
    } else {
      throw new MbtaRESTError();
    }
  }

  async getVehicle(
    fields: string[],
    args: VehicleResolverArgs
  ): Promise<MbtaVehicle> {
    const fieldsAndIncludeParams = this.getFieldsAndIncludeParams(
      "vehicle",
      fields,
      vehicleRelationships
    );

    const result = await this.getParsedJSON(
      `vehicles/${args.id}?${fieldsAndIncludeParams}`
    );

    if (isDocWithData(result, isMbtaVehicle)) {
      return result.data;
    } else {
      throw new MbtaRESTError();
    }
  }

  private batchRouteVehiclesLoadFn: BatchLoadFn<
    BatchFieldConfig,
    MbtaVehicle[]
  > = async configs => {
    if (configs.length === 1) {
      const [config] = configs;
      const fieldsAndIncludeParams = this.getFieldsAndIncludeParams(
        "vehicle",
        config.fields,
        vehicleRelationships
      );
      const routeFilterString = `&filter[route]=${config.id}`;
      const result = await this.getParsedJSON(
        `vehicles?${fieldsAndIncludeParams}${routeFilterString}`
      );

      if (isCollectionResourceDoc(result, isMbtaVehicle)) {
        return [result.data];
      } else {
        throw new MbtaRESTError();
      }
    } else {
      const fields = configs.flatMap(config => config.fields);
      const fieldsAndIncludeParams = this.getFieldsAndIncludeParams(
        "vehicle",
        [...fields, "route"],
        vehicleRelationships
      );
      const result = await this.getParsedJSON(
        `vehicles?${fieldsAndIncludeParams}`
      );

      if (isCollectionResourceDoc(result, isMbtaVehicle)) {
        const mbtaVehicles = result.data;
        return configs.map(config =>
          mbtaVehicles.filter(mbtaVehicle => {
            const routeRelationship = mbtaVehicle.relationships?.route;
            const routeRelationshipData = isRelationshipsWithData(
              routeRelationship
            )
              ? routeRelationship.data
              : null;
            const routeId = isResourceIdentifierObject(routeRelationshipData)
              ? routeRelationshipData.id
              : null;

            return routeId === config.id;
          })
        );
      } else {
        throw new MbtaRESTError();
      }
    }
  };

  private batchRouteVehiclesDataLoader = new DataLoader(
    this.batchRouteVehiclesLoadFn
  );

  async getBatchRouteVehicles(config: BatchFieldConfig) {
    return this.batchRouteVehiclesDataLoader.load(config);
  }

  async getStops(
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

  async getStop(fields: string[], args: StopResolverArgs): Promise<MbtaStop> {
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

  private batchStopLoadFn: BatchLoadFn<
    BatchFieldConfig,
    MbtaStop
  > = async configs => {
    const batchIdsString = `&filter[id]=${configs
      .map(({ id }) => id)
      .join(",")}`;
    const fields = configs.flatMap(config => config.fields);
    const fieldsAndIncludeParams = this.getFieldsAndIncludeParams(
      "stop",
      fields,
      stopRelationships
    );

    const result = await this.getParsedJSON(
      `stops?${fieldsAndIncludeParams}${batchIdsString}`
    );

    if (isCollectionResourceDoc(result, isMbtaStop)) {
      const mbtaStops = result.data;
      return configs
        .map(config => mbtaStops.find(mbtaStop => mbtaStop.id === config.id))
        .filter(isNotUndefined);
    } else {
      throw new MbtaRESTError();
    }
  };

  private batchStopDataLoader = new DataLoader(this.batchStopLoadFn);

  async getBatchStop(config: BatchFieldConfig) {
    return this.batchStopDataLoader.load(config);
  }

  private batchChildStopsLoadFn: BatchLoadFn<
    BatchListFieldConfig,
    MbtaStop[]
  > = async configs => {
    const uniqueChildIds = [...new Set(configs.flatMap(config => config.ids))];
    // requests are chunked in batches of 400 to prevent URL size limitations
    const childIdsChunks = chunk(uniqueChildIds, 400);
    const fields = configs.flatMap(config => config.fields);
    const fieldsAndIncludeParams = this.getFieldsAndIncludeParams(
      "stop",
      fields,
      stopRelationships
    );
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
  };

  private batchChildStopsDataLoader = new DataLoader(
    this.batchChildStopsLoadFn
  );

  async getBatchChildStops(config: BatchListFieldConfig) {
    return this.batchChildStopsDataLoader.load(config);
  }

  private batchRouteStopsLoadFn: BatchLoadFn<
    BatchFieldConfig,
    MbtaStop[]
  > = async configs => {
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
      const results = await Promise.all(
        configs.map(config => {
          const routeFilterString = `&filter[route]=${config.id}`;
          return this.getParsedJSON(
            `stops?${fieldsAndIncludeParams}${routeFilterString}`
          );
        })
      );

      if (isArrayOfCollectionResourceDocs(results, isMbtaStop)) {
        return results.map(result => result.data);
      } else {
        throw new MbtaRESTError();
      }
    }
  };

  private batchRouteStopsDataLoader = new DataLoader(
    this.batchRouteStopsLoadFn
  );

  async getBatchRouteStops(config: BatchFieldConfig) {
    return this.batchRouteStopsDataLoader.load(config);
  }

  async getRoutes(
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

  async getRoute(
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

  private batchRouteLoadFn: BatchLoadFn<
    BatchFieldConfig,
    MbtaRoute
  > = async configs => {
    const batchIdsString = `&filter[id]=${configs
      .map(({ id }) => id)
      .join(",")}`;
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
  };

  private batchRouteDataLoader = new DataLoader(this.batchRouteLoadFn);

  async getBatchRoute(config: BatchFieldConfig) {
    return this.batchRouteDataLoader.load(config);
  }

  private async getParsedJSON(path: string): Promise<any> {
    return this.parseAsyncJSON(this.get(path));
  }

  private async parseAsyncJSON(promise: Promise<string>): Promise<any> {
    const jsonString = await promise;
    return JSON.parse(jsonString);
  }
}
