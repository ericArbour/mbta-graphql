import { RESTDataSource, RequestOptions } from "apollo-datasource-rest";
import { MbtaVehiclesJSON, VehicleResolverArgs } from "../vehicles/types";
import { MbtaStopsJSON, StopResolverArgs } from "../stops/types";

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
  ): Promise<MbtaVehiclesJSON> {
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

    return await this.parseAsyncJSON(this.get(`vehicles?${queryString}`));
  }

  async getStops(
    fields: string[] = [],
    args: StopResolverArgs
  ): Promise<MbtaStopsJSON> {
    const fieldString = `fields[stop]=${fields.join(",")}`;
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
    const queryString = `${fieldString}${stopIdFilterString}${locationTypeFilterString}${locationFilterString}`;

    return await this.parseAsyncJSON(this.get(`stops?${queryString}`));
  }

  async parseAsyncJSON(promise: Promise<string>) {
    const jsonString = await promise;
    return JSON.parse(jsonString);
  }
}
