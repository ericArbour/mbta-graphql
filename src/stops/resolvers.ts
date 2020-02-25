import { IResolvers } from "graphql-tools";
import { FieldNode } from "graphql";

import { IContext } from "../data/dataSources";
import { getFieldsFromInfo } from "../helpers";
import {
  isNotNull,
  isRelationshipsWithData,
  isResourceIdentifierObjectArray
} from "../types";

import { MbtaStop, Stop, StopsResolverArgs, StopResolverArgs } from "./types";

const resolvers: IResolvers<any, IContext> = {
  Query: {
    stops: async (
      parent,
      args: StopsResolverArgs,
      { dataSources },
      info
    ): Promise<Stop[]> => {
      const fields = getFieldsFromInfo(info);
      const result = await dataSources.mbtaAPI.getStops(fields, args);

      return result.data.map(mbtaStopToStop);
    },
    stop: async (
      parent,
      args: StopResolverArgs,
      { dataSources },
      info
    ): Promise<Stop> => {
      const fields = getFieldsFromInfo(info);
      const result = await dataSources.mbtaAPI.getStop(fields, args);

      return mbtaStopToStop(result.data);
    }
  },
  Stop: {
    child_stops: async (
      parent: Stop,
      args: StopsResolverArgs,
      { dataSources },
      info
    ) => {
      if (!parent.child_stops) return null;

      const fields = getFieldsFromInfo(info);

      const childStopIds = parent.child_stops
        ?.map(({ id }) => id)
        .filter(isNotNull);

      const argsStopIdFilter = args.filter?.stopIdFilter;
      const stopIdFilter = argsStopIdFilter
        ? childStopIds?.filter(childId =>
            argsStopIdFilter.find(stopId => stopId === childId)
          )
        : childStopIds;

      const newArgs = !args.filter
        ? { ...args, filter: { stopIdFilter } }
        : { ...args, filter: { ...args.filter, stopIdFilter } };

      console.log(newArgs);
      const result = await dataSources.mbtaAPI.getStops(fields, newArgs);
      return result.data.map(mbtaStopToStop);
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
