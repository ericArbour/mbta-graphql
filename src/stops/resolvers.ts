import { IResolvers } from "graphql-tools";
import { FieldNode } from "graphql";

import { IContext } from "../data/dataSources";
import { getFieldsFromInfo } from "../helpers";

import { MbtaStop, Stop } from "./types";

const resolvers: IResolvers<string, IContext> = {
  Query: {
    stops: async (parent, args, { dataSources }, info) => {
      const fields = getFieldsFromInfo(info);
      const result = await dataSources.mbtaAPI.getStops(fields);

      return result.data.map(mbtaStopToStop);
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
