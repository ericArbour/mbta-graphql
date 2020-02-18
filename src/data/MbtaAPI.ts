import { RESTDataSource, RequestOptions } from "apollo-datasource-rest";
import { MbtaVehiclesJSON, VehicleResolverArgs } from "../vehicles/types";
import { MbtaStopsJSON } from "../stops/types";

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
    const { vehicleIdFilter = [], labelFilter = [] } = args;
    const vehicleIdFilterString = vehicleIdFilter.length
      ? `&filter[id]=${vehicleIdFilter.join(",")}`
      : "";
    const labelFilterString = labelFilter.length
      ? `&filter[label]=${labelFilter.join(",")}`
      : "";
    const queryString = `${fieldString}${vehicleIdFilterString}${labelFilterString}`;

    return await this.parseAsyncJSON(this.get(`vehicles?${queryString}`));
  }

  async getStops(fields: string[] = []): Promise<MbtaStopsJSON> {
    const fieldString = `fields[stop]=${fields.join(",")}`;
    return await this.parseAsyncJSON(this.get(`stops?${fieldString}`));
  }

  async parseAsyncJSON(promise: Promise<string>) {
    const jsonString = await promise;
    return JSON.parse(jsonString);
  }
}
