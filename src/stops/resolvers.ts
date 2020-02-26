import { IResolvers, FilterToSchema } from "graphql-tools";

import { IContext } from "../data/dataSources";
import { getFieldsFromInfo } from "../helpers";
import {
  isNotNull,
  isRelationshipsWithData,
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
      parent: Stop,
      args: ChildStopsResolverArgs,
      { dataSources },
      info
    ) => {
      if (!parent.child_stops) return null;

      const fields = getFieldsFromInfo(info);
      const stopIdFilter = args.filter?.stopIdFilter;
      const locationTypeFilter = args.filter?.locationTypeFilter;
      const fieldsWithFilterInfo =
        locationTypeFilter && !fields.includes("location_type")
          ? [...fields, "location_type"]
          : fields;

      const childStopIds = parent.child_stops
        ?.map(({ id }) => id)
        .filter(isNotNull);

      const childMbtaStops = await dataSources.mbtaAPI.getChildStops({
        ids: childStopIds,
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
    }
  }
};

export function mbtaStopToStop(mbtaStop: MbtaStop): Stop {
  const { id = null, attributes, relationships } = mbtaStop;
  const childStopsRelationship = relationships?.child_stops;

  const childStopsRelationshipData = isRelationshipsWithData(
    childStopsRelationship
  )
    ? childStopsRelationship?.data
    : null;
  const childStops = isResourceIdentifierObjectArray(childStopsRelationshipData)
    ? childStopsRelationshipData.map(({ id: stopId }) => ({ id: stopId }))
    : null;

  return {
    id,
    ...attributes,
    child_stops: childStops
  };
}

export default resolvers;
