import { RESTDataSource, RequestOptions } from "apollo-datasource-rest";
import { MbtaVehiclesJSON } from "../vehicles/types";

export default class MbtaAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = "https://api-v3.mbta.com/";
  }

  willSendRequest(request: RequestOptions) {
    request.headers.set("X-API-Key", process.env.MBTA_API_KEY);
  }

  async getVehicles(): Promise<MbtaVehiclesJSON> {
    return await this.parseAsyncJSON(this.get(`vehicles`));
  }

  async parseAsyncJSON(promise: Promise<string>) {
    const jsonString = await promise;
    return JSON.parse(jsonString);
  }
}
