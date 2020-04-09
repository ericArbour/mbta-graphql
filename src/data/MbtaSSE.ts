import { PubSub } from "apollo-server";
import { DataSource } from "apollo-datasource";
import EventSource from "eventsource";
import groupby from "lodash.groupby";

import {
  parseAndTypeJSON,
  updateArrayItem,
  removeArrayItem,
  memoizedThrottle,
} from "../utils/utils";
import {
  MbtaVehicle,
  isMbtaVehicleResource,
  isMbtaVehicleResources,
  SubsVehiclesResolverArgs,
  VehicleResolverArgs,
} from "../vehicles/types";
import { mbtaVehicleResourceToMbtaVehicle } from "../vehicles/data";

const VEHICLES_EVENT_SUFFIX = "_VEHICLES_UPDATED";
const VEHICLE_EVENT_SUFFIX = "_VEHICLE_UPDATED";
const throttleWait = 10000;

export default class MbtaSSE extends DataSource {
  pubsub: PubSub;
  baseURL = "https://api-v3.mbta.com/";
  eventSourceInitDict = {
    headers: {
      Accept: "text/event-stream",
      "X-API-Key": process.env.MBTA_API_KEY,
    },
  };
  mbtaVehicles: MbtaVehicle[] = [];
  mbtaVehiclesByRoute: { [key: string]: MbtaVehicle[] };

  constructor(pubsub: PubSub) {
    super();

    this.pubsub = pubsub;
    this.publishRouteVehicles = memoizedThrottle(
      this.publishRouteVehicles,
      throttleWait
    );
    this.publishVehicle = memoizedThrottle(this.publishVehicle, throttleWait);

    const mbtaVehicleEvtSrc = new EventSource(
      this.baseURL + "vehicles",
      this.eventSourceInitDict
    );

    mbtaVehicleEvtSrc.onerror = (err) => {
      console.error("EventSource failed:", err);
    };

    mbtaVehicleEvtSrc.addEventListener("reset", (e: MessageEvent) => {
      const mbtaVehicleResources = parseAndTypeJSON(
        e.data,
        isMbtaVehicleResources
      );
      const newMbtaVehicles = mbtaVehicleResources.map(
        mbtaVehicleResourceToMbtaVehicle
      );

      this.setAndPublishMbtaVehicles(newMbtaVehicles);
    });

    mbtaVehicleEvtSrc.addEventListener("add", (e: MessageEvent) => {
      const mbtaVehicleResource = parseAndTypeJSON(
        e.data,
        isMbtaVehicleResource
      );
      const mbtaVehicle = mbtaVehicleResourceToMbtaVehicle(mbtaVehicleResource);
      const newMbtaVehicles = [...this.mbtaVehicles, mbtaVehicle];

      this.setAndPublishMbtaVehicles(newMbtaVehicles);
    });

    mbtaVehicleEvtSrc.addEventListener("update", (e: MessageEvent) => {
      const mbtaVehicleResource = parseAndTypeJSON(
        e.data,
        isMbtaVehicleResource
      );
      const updatedMbtaVehicle = mbtaVehicleResourceToMbtaVehicle(
        mbtaVehicleResource
      );
      const newMbtaVehicles = updateArrayItem(
        this.mbtaVehicles,
        updatedMbtaVehicle
      );

      this.setAndPublishMbtaVehicles(newMbtaVehicles);
    });

    mbtaVehicleEvtSrc.addEventListener("remove", (e: MessageEvent) => {
      const mbtaVehicleResource = parseAndTypeJSON(
        e.data,
        isMbtaVehicleResource
      );
      const mbtaVehicle = mbtaVehicleResourceToMbtaVehicle(mbtaVehicleResource);

      const newMbtaVehicles = removeArrayItem(this.mbtaVehicles, mbtaVehicle);

      this.setAndPublishMbtaVehicles(newMbtaVehicles);
    });
  }

  setAndPublishMbtaVehicles(mbtaVehicles: MbtaVehicle[]) {
    this.mbtaVehicles = mbtaVehicles;
    this.mbtaVehiclesByRoute = groupby(this.mbtaVehicles, "route.id");

    Object.keys(this.mbtaVehiclesByRoute).forEach((route) =>
      this.publishRouteVehicles(route)
    );
    this.mbtaVehicles.forEach((mbtaVehicle) =>
      this.publishVehicle(mbtaVehicle.id)
    );
  }

  publishRouteVehicles(route: string) {
    this.pubsub.publish(route + VEHICLES_EVENT_SUFFIX, {
      vehicles: this.mbtaVehiclesByRoute[route],
    });
  }

  publishVehicle(id: string) {
    this.pubsub.publish(id + VEHICLE_EVENT_SUFFIX, {
      vehicle: this.mbtaVehicles.find((mbtaVehicle) => mbtaVehicle.id === id),
    });
  }

  subscribeToRouteVehicles(args: SubsVehiclesResolverArgs) {
    return this.pubsub.asyncIterator<MbtaVehicle[]>(
      args.route + VEHICLES_EVENT_SUFFIX
    );
  }

  subscribeToVehicle(args: VehicleResolverArgs) {
    return this.pubsub.asyncIterator<MbtaVehicle[]>(
      args.id + VEHICLE_EVENT_SUFFIX
    );
  }
}
