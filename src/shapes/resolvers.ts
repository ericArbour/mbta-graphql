import { IResolvers } from "graphql-tools";
import polyline from "@mapbox/polyline";

import { Context, isNullish } from "../types";
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
  Shape: {
    polyline(parent: MbtaShape, args, context, info) {
      if (isNullish(parent.polyline)) return null;

      // Flipped to be compatible with mapbox's lon/lat coordinate requirements
      return polyline.decode(parent.polyline).map(([lat, lon]) => [lon, lat]);
    },
  },
};

export default resolvers;
