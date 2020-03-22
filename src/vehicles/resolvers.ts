import { IResolvers } from "graphql-tools";

import { IContext } from "../types";
import { getFieldsFromInfo } from "../utils/utils";
import { MbtaStop } from "../stops/types";
import { MbtaRoute } from "../routes/types";

import {
  MbtaVehicle,
  VehiclesResolverArgs,
  VehicleResolverArgs
} from "./types";

const resolvers: IResolvers<any, IContext> = {
  Query: {
    vehicles: async (
      parent,
      args: VehiclesResolverArgs,
      { dataSources },
      info
    ): Promise<MbtaVehicle[]> => {
      const fields = getFieldsFromInfo(info);

      return await dataSources.mbtaAPI.getVehicles(fields, args);
    },
    vehicle: async (
      parent,
      args: VehicleResolverArgs,
      { dataSources },
      info
    ) => {
      const fields = getFieldsFromInfo(info);

      return await dataSources.mbtaAPI.getVehicle(fields, args);
    }
  },
  Vehicle: {
    stop: async (
      parent: MbtaVehicle,
      args: VehiclesResolverArgs,
      { dataSources },
      info
    ): Promise<MbtaStop | null> => {
      const stopId = parent?.stop?.id;
      if (!stopId) return null;

      const fields = getFieldsFromInfo(info);
      return await dataSources.mbtaAPI.getBatchStop({
        id: stopId,
        fields
      });
    },
    route: async (
      parent: MbtaVehicle,
      args,
      { dataSources },
      info
    ): Promise<MbtaRoute | null> => {
      const routeId = parent.route?.id;
      if (!routeId) return null;

      const fields = getFieldsFromInfo(info);
      const mbtaRoute = await dataSources.mbtaAPI.getBatchRoute({
        id: routeId,
        fields
      });

      return mbtaRoute;
    }
  }
};

export default resolvers;
