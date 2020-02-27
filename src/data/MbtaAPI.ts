import { RESTDataSource, RequestOptions } from "apollo-datasource-rest";
import DataLoader, { BatchLoadFn } from "dataloader";

import {
  isNotUndefined,
  isCollectionResourceDoc,
  isDocWithData
} from "../types";
import {
  MbtaVehicle,
  isMbtaVehicle,
  VehicleResolverArgs,
  BatchStopConfig
} from "../vehicles/types";
import {
  StopsResolverArgs,
  StopResolverArgs,
  ChildStopsBatchConfig,
  MbtaStop,
  isMbtaStop
} from "../stops/types";

export default class MbtaAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = "https://api-v3.mbta.com/";
  }

  willSendRequest(request: RequestOptions) {
    request.headers.set("X-API-Key", process.env.MBTA_API_KEY || "");
  }

  async getVehicles(
    fields: string[] = [],
    args: VehicleResolverArgs
  ): Promise<MbtaVehicle[]> {
    const fieldString = `fields[vehicle]=${fields.join(",")}`;
    const vehicleIdFilter = args.filter?.vehicleIdFilter;
    const labelFilter = args.filter?.labelFilter;
    const vehicleIdFilterString = vehicleIdFilter?.length
      ? `&filter[id]=${vehicleIdFilter.join(",")}`
      : "";
    const labelFilterString = labelFilter?.length
      ? `&filter[label]=${labelFilter.join(",")}`
      : "";
    const queryString = `${fieldString}${vehicleIdFilterString}${labelFilterString}`;

    const result = await this.parseAsyncJSON(
      this.get(`vehicles?${queryString}`)
    );

    if (isCollectionResourceDoc(result, isMbtaVehicle)) {
      return result.data;
    } else {
      throw new Error("Bad data");
    }
  }

  async getStops(
    fields: string[] = [],
    args: StopsResolverArgs
  ): Promise<MbtaStop[]> {
    const relationships = ["child_stops", "parent_station"];
    const relationshipsFields = fields.filter(field =>
      relationships.includes(field)
    );
    const attributeFields = fields.filter(
      field => !relationships.includes(field)
    );
    const fieldsString = `fields[stop]=${attributeFields.join(",")}`;
    const relationshipsString = relationshipsFields.length
      ? `&include=${relationshipsFields.join(",")}`
      : "";
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
    const queryString = `${fieldsString}${relationshipsString}${stopIdFilterString}${locationTypeFilterString}${locationFilterString}`;

    const result = await this.parseAsyncJSON(this.get(`stops?${queryString}`));

    if (isCollectionResourceDoc(result, isMbtaStop)) {
      return result.data;
    } else {
      throw new Error("Bad data");
    }
  }

  async getStop(
    fields: string[] = [],
    args: StopResolverArgs
  ): Promise<MbtaStop> {
    const relationships = ["child_stops", "parent_station"];
    const relationshipsFields = fields.filter(field =>
      relationships.includes(field)
    );
    const attributeFields = fields.filter(
      field => !relationships.includes(field)
    );
    const fieldsString = `fields[stop]=${attributeFields.join(",")}`;
    const relationshipsString = relationshipsFields.length
      ? `&include=${relationshipsFields.join(",")}`
      : "";

    const result = await this.parseAsyncJSON(
      this.get(`stops/${args.id}?${fieldsString}${relationshipsString}`)
    );

    if (isDocWithData(result, isMbtaStop)) {
      return result.data;
    } else {
      throw new Error("Bad data");
    }
  }

  private batchStopsLoadFn: BatchLoadFn<
    BatchStopConfig,
    MbtaStop
  > = async configs => {
    const batchIdsString = `&filter[id]=${configs
      .map(({ id }) => id)
      .join(",")}`;
    const fields = configs[0].fields;
    const relationships = ["child_stops", "parent_station"];
    const relationshipsFields = fields.filter(field =>
      relationships.includes(field)
    );
    const attributeFields = fields.filter(
      field => !relationships.includes(field)
    );
    const fieldsString = `fields[stop]=${attributeFields.join(",")}`;
    const relationshipsString = relationshipsFields.length
      ? `&include=${relationshipsFields.join(",")}`
      : "";
    const result = await this.parseAsyncJSON(
      this.get(`stops?${fieldsString}${relationshipsString}${batchIdsString}`)
    );

    if (isCollectionResourceDoc(result, isMbtaStop)) {
      const mbtaStops = result.data;
      return configs
        .map(config => mbtaStops.find(mbtaStop => mbtaStop.id === config.id))
        .filter(isNotUndefined);
    } else {
      throw new Error("Bad data");
    }
  };

  private batchStopsDataLoader = new DataLoader(this.batchStopsLoadFn);

  async getBatchStop(config: BatchStopConfig) {
    return this.batchStopsDataLoader.load(config);
  }

  private childStopsBatchLoadFn: BatchLoadFn<
    ChildStopsBatchConfig,
    MbtaStop[]
  > = async configs => {
    const uniqueChildIds = [...new Set(configs.flatMap(config => config.ids))];
    const uniqueChildIdsString = `&filter[id]=${uniqueChildIds.join(",")}`;
    const fields = configs[0].fields;
    const relationships = ["child_stops", "parent_station"];
    const relationshipsFields = fields.filter(field =>
      relationships.includes(field)
    );
    const attributeFields = fields.filter(
      field => !relationships.includes(field)
    );
    const fieldsString = `fields[stop]=${attributeFields.join(",")}`;
    const relationshipsString = relationshipsFields.length
      ? `&include=${relationshipsFields.join(",")}`
      : "";
    const result = await this.parseAsyncJSON(
      this.get(
        `stops?${fieldsString}${relationshipsString}${uniqueChildIdsString}`
      )
    );
    if (isCollectionResourceDoc(result, isMbtaStop)) {
      const mbtaStops = result.data;
      return configs.map(config =>
        config.ids
          .map(id => mbtaStops.find(mbtaStop => mbtaStop.id === id))
          .filter(isNotUndefined)
      );
    } else {
      throw new Error("Bad data");
    }
  };

  private childStopsDataLoader = new DataLoader(this.childStopsBatchLoadFn);

  async getChildStops(config: ChildStopsBatchConfig) {
    return this.childStopsDataLoader.load(config);
  }

  async parseAsyncJSON(promise: Promise<string>) {
    const jsonString = await promise;
    return JSON.parse(jsonString);
  }
}
