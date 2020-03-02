import { IResolvers } from "graphql-tools";

import { IContext } from "../types";
import { getFieldsFromInfo } from "../utils/utils";
import { mbtaStopToStop } from "../stops/resolvers";
import { Stop } from "../stops/types";
import { isRelationshipsWithData, isResourceIdentifierObject } from "../types";

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
    }
  }
};

function mbtaVehicleToVehicle(mbtaVehicle: MbtaVehicle): Vehicle {
  const { id = null, attributes, relationships } = mbtaVehicle;
  const stopRelationship = relationships?.stop;

  const stopRelationshipData = isRelationshipsWithData(stopRelationship)
    ? stopRelationship?.data
    : null;
  const stopId = isResourceIdentifierObject(stopRelationshipData)
    ? stopRelationshipData?.id
    : null;

  return {
    id,
    ...attributes,
    stop: {
      id: stopId
    }
  };
}

export default resolvers;
