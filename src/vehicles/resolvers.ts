import { IResolvers } from "graphql-tools";

import { IContext } from "../data/dataSources";
import { getFieldsFromInfo } from "../helpers";
import { mbtaStopToStop } from "../stops/resolvers";
import { isRelationshipsWithData, isResourceIdentifierObject } from "../types";

import { MbtaVehicle, Vehicle, VehicleResolverArgs } from "./types";

const resolvers: IResolvers<any, IContext> = {
  Query: {
    vehicles: async (
      parent,
      args: VehicleResolverArgs,
      { dataSources },
      info
    ): Promise<Vehicle[]> => {
      const fields = getFieldsFromInfo(info);
      const mbtaVehicles = await dataSources.mbtaAPI.getVehicles(fields, args);

      return mbtaVehicles.map(mbtaVehicleToVehicle);
    }
  },
  Vehicle: {
    stop: async (
      parent: Vehicle,
      args: VehicleResolverArgs,
      { dataSources },
      info
    ) => {
      const stopId = parent?.stop?.id;
      if (!stopId) return null;

      const fields = getFieldsFromInfo(info);
      const stop = await dataSources.mbtaAPI.getVehicleStop({
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
