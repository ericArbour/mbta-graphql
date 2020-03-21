import { IResolvers } from "graphql-tools";

import { IContext } from "../types";
import { getFieldsFromInfo, objSnakeKeysToCamelKeys } from "../utils/utils";
import { isRelationshipsWithData, isResourceIdentifierObject } from "../types";
import { mbtaStopToStop } from "../stops/resolvers";
import { Stop } from "../stops/types";
import { MbtaRoute } from "../routes/types";

import {
  MbtaVehicle,
  Vehicle,
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
    ): Promise<Vehicle[]> => {
      const fields = getFieldsFromInfo(info);
      const mbtaVehicles = await dataSources.mbtaAPI.getVehicles(fields, args);

      return mbtaVehicles.map(mbtaVehicleToVehicle);
    },
    vehicle: async (
      parent,
      args: VehicleResolverArgs,
      { dataSources },
      info
    ) => {
      const fields = getFieldsFromInfo(info);
      const mbtaVehicle = await dataSources.mbtaAPI.getVehicle(fields, args);

      return mbtaVehicleToVehicle(mbtaVehicle);
    }
  },
  Vehicle: {
    stop: async (
      parent: Vehicle,
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
      parent: Vehicle,
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

export function mbtaVehicleToVehicle(mbtaVehicle: MbtaVehicle): Vehicle {
  const { id = null, attributes = {}, relationships } = mbtaVehicle;
  const stopRelationship = relationships?.stop;
  const routeRelationship = relationships?.route;

  const stopRelationshipData = isRelationshipsWithData(stopRelationship)
    ? stopRelationship?.data
    : null;
  const stop = isResourceIdentifierObject(stopRelationshipData)
    ? {
        id: stopRelationshipData.id
      }
    : null;

  const routeRelationshipData = isRelationshipsWithData(routeRelationship)
    ? routeRelationship.data
    : null;
  const route = isResourceIdentifierObject(routeRelationshipData)
    ? { id: routeRelationshipData.id }
    : null;

  const camelCaseAttributes = objSnakeKeysToCamelKeys(attributes);

  return {
    id,
    ...camelCaseAttributes,
    stop,
    route
  };
}

export default resolvers;
