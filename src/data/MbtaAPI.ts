import { RESTDataSource, RequestOptions } from "apollo-datasource-rest";
import DataLoader from "dataloader";

import { BatchFieldConfig, BatchListFieldConfig } from "../types";
import { parseAndTypeJSON } from "../utils/utils";
import { MbtaVehicle } from "../vehicles/types";
import {
  getVehicles,
  getVehicle,
  batchRouteVehiclesLoadFn,
  getVehicleFieldsAndIncludeParams,
} from "../vehicles/data";
import { MbtaStop } from "../stops/types";
import {
  getStops,
  getStop,
  batchStopLoadFn,
  batchChildStopsLoadFn,
  batchRouteStopsLoadFn,
  getStopFieldsAndIncludeParams,
} from "../stops/data";
import { MbtaRoute } from "../routes/types";
import {
  getRoutes,
  getRoute,
  batchRouteLoadFn,
  batchStopRoutesLoadFn,
  getRouteFieldsAndIncludeParams,
} from "../routes/data";

export default class MbtaAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = "https://api-v3.mbta.com/";
  }

  protected willSendRequest(request: RequestOptions) {
    request.headers.set("X-API-Key", process.env.MBTA_API_KEY || "");
  }

  protected getFieldsAndIncludeParams(
    pathType: string,
    relationships: string[],
    // Fields the graphql api supports that aren't attributes or relationships in MBTA api
    ignoreFields: string[] | undefined = [],
    fields: string[]
  ): string {
    const uniqueFields = [...new Set(fields)].filter(
      (field) => !ignoreFields.includes(field)
    );
    const relationshipsFields = uniqueFields.filter((field) =>
      relationships.includes(field)
    );
    const attributeFields = uniqueFields.filter(
      (field) => !relationships.includes(field)
    );
    const fieldsString = `fields[${pathType}]=${attributeFields.join(",")}`;
    const includeRelationshipsString = relationshipsFields.length
      ? `&include=${relationshipsFields.join(",")}`
      : "";
    const includeRelationshipsFieldsString = relationshipsFields.length
      ? `${relationshipsFields
          .map((relationshipsField) => `&fields[${relationshipsField}]=`)
          .join("")}`
      : "";

    return `${fieldsString}${includeRelationshipsString}${includeRelationshipsFieldsString}`;
  }

  getVehicles = getVehicles;
  getVehicle = getVehicle;
  protected getVehicleFieldsAndIncludeParams = getVehicleFieldsAndIncludeParams;

  private batchRouteVehiclesDataLoader = new DataLoader<
    BatchFieldConfig,
    MbtaVehicle[]
  >(batchRouteVehiclesLoadFn.bind(this));

  getBatchRouteVehicles(config: BatchFieldConfig) {
    return this.batchRouteVehiclesDataLoader.load(config);
  }

  getStops = getStops;
  getStop = getStop;
  protected getStopFieldsAndIncludeParams = getStopFieldsAndIncludeParams;

  private batchStopDataLoader = new DataLoader<BatchFieldConfig, MbtaStop>(
    batchStopLoadFn.bind(this)
  );

  getBatchStop(config: BatchFieldConfig): Promise<MbtaStop> {
    return this.batchStopDataLoader.load(config);
  }

  private batchChildStopsDataLoader = new DataLoader<
    BatchListFieldConfig,
    MbtaStop[]
  >(batchChildStopsLoadFn.bind(this));

  getBatchChildStops(config: BatchListFieldConfig) {
    return this.batchChildStopsDataLoader.load(config);
  }

  private batchRouteStopsDataLoader = new DataLoader<
    BatchFieldConfig,
    MbtaStop[]
  >(batchRouteStopsLoadFn.bind(this));

  getBatchRouteStops(config: BatchFieldConfig) {
    return this.batchRouteStopsDataLoader.load(config);
  }

  getRoutes = getRoutes;
  getRoute = getRoute;
  protected getRouteFieldsAndIncludeParams = getRouteFieldsAndIncludeParams;

  private batchRouteDataLoader = new DataLoader<BatchFieldConfig, MbtaRoute>(
    batchRouteLoadFn.bind(this)
  );

  getBatchRoute(config: BatchFieldConfig) {
    return this.batchRouteDataLoader.load(config);
  }

  private batchStopRoutesDataLoader = new DataLoader<
    BatchFieldConfig,
    MbtaRoute[]
  >(batchStopRoutesLoadFn.bind(this));

  getBatchStopRoutes(config: BatchFieldConfig) {
    return this.batchStopRoutesDataLoader.load(config);
  }

  async getTypedParsedJSON<T>(
    path: string,
    isType: (x: unknown) => x is T
  ): Promise<T> | never {
    const jsonString = await this.get(path);

    return parseAndTypeJSON(jsonString, isType);
  }
}
