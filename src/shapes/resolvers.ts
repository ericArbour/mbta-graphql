import { IResolvers } from "graphql-tools";

import { Context } from "../types";
import { getFieldsFromInfo } from "../utils/utils";

import { MbtaShape, ShapesResolverArgs } from "./types";

const resolvers: IResolvers<unknown, Context> = {
  Query: {
    shapes: async (
      parent,
      args: ShapesResolverArgs,
      { dataSources },
      info,
    ): Promise<MbtaShape[]> => {
      const fields = getFieldsFromInfo(info);

      return await dataSources.mbtaAPI.getShapes(fields, args);
    },
  },
};

export default resolvers;
