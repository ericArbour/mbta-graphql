import { IResolvers } from "graphql-tools";
import { FieldNode } from "graphql";

import { IContext } from "../data/dataSources";
import { getFieldsFromInfo } from "../helpers";

import { MbtaStop, Stop, StopsResolverArgs, StopResolverArgs } from "./types";

const resolvers: IResolvers<string, IContext> = {
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
  }
};

function mbtaStopToStop(mbtaStop: MbtaStop): Stop {
  const { id = null, attributes } = mbtaStop;

  return {
    id,
    ...attributes
  };
}

export default resolvers;
