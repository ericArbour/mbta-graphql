import { IResolvers, FilterToSchema } from "graphql-tools";

import { IContext } from "../types";
import { getFieldsFromInfo } from "../utils/utils";
import {
  isNotNull,
  isRelationshipsWithData,
  isResourceIdentifierObject,
  isResourceIdentifierObjectArray
} from "../types";

import {
  MbtaStop,
  Stop,
  StopsResolverArgs,
  StopResolverArgs,
  ChildStopsResolverArgs
} from "./types";

const resolvers: IResolvers<any, IContext> = {
  Query: {
    stops: async (
      parent,
      args: StopsResolverArgs,
      { dataSources },
      info
    ): Promise<Stop[]> => {
      const fields = getFieldsFromInfo(info);
      const mbtaStops = await dataSources.mbtaAPI.getStops(fields, args);

      return mbtaStops.map(mbtaStopToStop);
    },
    stop: async (
      parent,
      args: StopResolverArgs,
      { dataSources },
      info
    ): Promise<Stop> => {
      const fields = getFieldsFromInfo(info);
      const mbtaStop = await dataSources.mbtaAPI.getStop(fields, args);

      return mbtaStopToStop(mbtaStop);
    }
  },
  Stop: {
    child_stops: async (
      { child_stops = [] }: Stop,
      args: ChildStopsResolverArgs,
      { dataSources },
      info
    ): Promise<Stop[]> => {
      if (!child_stops.length) return [];
      const fields = getFieldsFromInfo(info);
      const stopIdFilter = args.filter?.stopIdFilter;
      const locationTypeFilter = args.filter?.locationTypeFilter;
      const fieldsWithFilterInfo =
        locationTypeFilter && !fields.includes("location_type")
          ? [...fields, "location_type"]
          : fields;

      const childStopIds = child_stops?.map(({ id }) => id).filter(isNotNull);

      const filteredChildStopIds = stopIdFilter
        ? childStopIds.filter(childStopId => stopIdFilter.includes(childStopId))
        : childStopIds;

      const childMbtaStops = await dataSources.mbtaAPI.getChildStops({
        ids: filteredChildStopIds,
        fields: fieldsWithFilterInfo
      });

      const locationTypeFilteredChildMbtaStops = locationTypeFilter
        ? childMbtaStops.filter(childMbtaStop => {
            const locationType = childMbtaStop.attributes?.location_type;
            if (locationType === null || locationType === undefined)
              return false;
            return locationTypeFilter.includes(locationType);
          })
        : childMbtaStops;

      const stopIdFilteredChildMbtaStops = stopIdFilter
        ? locationTypeFilteredChildMbtaStops.filter(childMbtaStop => {
            const id = childMbtaStop.id;
            if (id === undefined) return false;
            return stopIdFilter.includes(id);
          })
        : locationTypeFilteredChildMbtaStops;

      return stopIdFilteredChildMbtaStops.map(mbtaStopToStop);
    },
    parent_station: async (
      parent: Stop,
      args,
      { dataSources },
      info
    ): Promise<Stop | null> => {
      const stopId = parent.parent_station?.id;
      if (!stopId) return null;

      const fields = getFieldsFromInfo(info);
      const stop = await dataSources.mbtaAPI.getBatchStop({
        id: stopId,
        fields
      });

      return mbtaStopToStop(stop);
    }
  }
};

export function mbtaStopToStop(mbtaStop: MbtaStop): Stop {
  const { id = null, attributes, relationships } = mbtaStop;
  const childStopsRelationship = relationships?.child_stops;
  const parentStationRelationship = relationships?.parent_station;

  const childStopsRelationshipData = isRelationshipsWithData(
    childStopsRelationship
  )
    ? childStopsRelationship.data
    : null;
  const childStops = isResourceIdentifierObjectArray(childStopsRelationshipData)
    ? childStopsRelationshipData.map(({ id: stopId }) => ({ id: stopId }))
    : [];
  const parentStationRelationshipData = isRelationshipsWithData(
    parentStationRelationship
  )
    ? parentStationRelationship.data
    : null;
  const parentStation = isResourceIdentifierObject(
    parentStationRelationshipData
  )
    ? { id: parentStationRelationshipData.id }
    : null;

  return {
    id,
    ...attributes,
    child_stops: childStops,
    parent_station: parentStation
  };
}

export default resolvers;
