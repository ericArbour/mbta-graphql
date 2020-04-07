import { PubSub } from "apollo-server";
import { DataSource } from "apollo-datasource";
import EventSource from "eventsource";

import {
  parseAndTypeJSON,
  updateArrayItem,
  removeArrayItem,
} from "../utils/utils";
import {
  MbtaVehicle,
  isMbtaVehicleResource,
  isMbtaVehicleResources,
} from "../vehicles/types";
import { mbtaVehicleResourceToMbtaVehicle } from "../vehicles/data";

const VEHICLES_UPDATED = "VEHICLES_UPDATED";

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

  constructor(pubsub: PubSub) {
    super();

    this.pubsub = pubsub;

    const mbtaVehicleEvtSrc = new EventSource(
      this.baseURL + "vehicles?filter[route]=Red",
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
    this.pubsub.publish(VEHICLES_UPDATED, { vehicles: this.mbtaVehicles });
  }

  subscribeToVehicles() {
    return this.pubsub.asyncIterator<MbtaVehicle[]>([VEHICLES_UPDATED]);
  }
}

// const kendallId = "place-knncl";
// const kendallInboundId = "70071";
// const brighamCircleId = "place-brmnl";
// const brighamCircleInboundId = "70250";
// const parkStreetId = "place-pktrm";
// const parkStreetRedOutbound = "70076";
// const parkStreetGreenOutbound = "70199";
// const url = "https://api-v3.mbta.com/predictions/?filter[stop]=place-knncl";
