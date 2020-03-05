import { IResolvers } from "graphql-tools";

import { IContext } from "../types";
import { getFieldsFromInfo } from "../utils/utils";
import { Vehicle } from "../vehicles/types";
import { mbtaVehicleToVehicle } from "../vehicles/resolvers";

import {
  MbtaRoute,
  Route,
  RoutesResolverArgs,
  RouteResolverArgs
} from "./types";

const resolvers: IResolvers<any, IContext> = {
  Query: {
    routes: async (
      parent,
      args: RoutesResolverArgs,
      { dataSources },
      info
    ): Promise<Route[]> => {
      const fields = getFieldsFromInfo(info);
      const mbtaRoutes = await dataSources.mbtaAPI.getRoutes(fields, args);

      return mbtaRoutes.map(mbtaRouteToRoute);
    },
    route: async (parent, args: RouteResolverArgs, { dataSources }, info) => {
      const fields = getFieldsFromInfo(info);
      const mbtaRoute = await dataSources.mbtaAPI.getRoute(fields, args);

      return mbtaRouteToRoute(mbtaRoute);
    }
  },
  Route: {
    vehicles: async (
      { id }: Route,
      args,
      { dataSources },
      info
    ): Promise<Vehicle[]> => {
      if (!id) return [];
      const fields = getFieldsFromInfo(info);
      const mbtaVehicles = await dataSources.mbtaAPI.getBatchRouteVehicles({
        id,
        fields
      });

      return mbtaVehicles.map(mbtaVehicleToVehicle);
    }
  }
};

export function mbtaRouteToRoute(mbtaRoute: MbtaRoute): Route {
  const { id = null, attributes } = mbtaRoute;

  return {
    id,
    ...attributes
  };
}

export default resolvers;
