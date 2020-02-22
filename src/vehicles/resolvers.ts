import { IResolvers } from "graphql-tools";
import { FieldNode } from "graphql";

import { IContext } from "../data/dataSources";
import { getFieldsFromInfo } from "../helpers";

import { MbtaVehicle, Vehicle, VehicleResolverArgs } from "./types";

const resolvers: IResolvers<string, IContext> = {
  Query: {
    vehicles: async (
      parent,
      args: VehicleResolverArgs,
      { dataSources },
      info
    ): Promise<Vehicle[]> => {
      const fields = getFieldsFromInfo(info);
      const result = await dataSources.mbtaAPI.getVehicles(fields, args);

      return result.data.map(mbtaVehicleToVehicle);
    }
  }
};

function mbtaVehicleToVehicle(mbtaVehicle: MbtaVehicle): Vehicle {
  const { id = null, attributes } = mbtaVehicle;

  return {
    id,
    ...attributes
  };
}

export default resolvers;
