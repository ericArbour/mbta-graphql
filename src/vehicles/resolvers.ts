import { IResolvers } from "graphql-tools";

import { IContext } from "../types";
import { getFieldsFromInfo, objSnakeKeysToCamelKeys } from "../utils/utils";
import { isRelationshipsWithData, isResourceIdentifierObject } from "../types";
import { mbtaStopToStop } from "../stops/resolvers";
import { Stop } from "../stops/types";
import { MbtaRoute } from "../routes/types";

import {
  MbtaVehicleResource,
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
    ): Promise<Stop | null> => {
      const stopId = parent?.stop?.id;
      if (!stopId) return null;

      const fields = getFieldsFromInfo(info);
      const stop = await dataSources.mbtaAPI.getBatchStop({
        id: stopId,
        fields
      });

      return mbtaStopToStop(stop);
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
