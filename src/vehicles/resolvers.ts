import { IResolvers } from "graphql-tools";
import { IContext } from "../data/dataSources";
import { MbtaVehicle, Vehicle } from "./types";

const resolvers: IResolvers<any, IContext> = {
  Query: {
    vehicles: async (parent, args, { dataSources }, info) => {
      const result = await dataSources.mbtaAPI.getVehicles();
      return result.data.map(mbtaVehicleToVehicle);
    }
  }
};

function mbtaVehicleToVehicle(mbtaVehicle: MbtaVehicle): Vehicle {
  const { id, attributes } = mbtaVehicle;
  const {
    updated_at,
    speed,
    longitude,
    latitude,
    label,
    direction_id,
    current_stop_sequence,
    current_status,
    bearing
  } = attributes;

  return {
    id,
    updatedAt: updated_at,
    speed,
    longitude,
    latitude,
    label,
    directionId: direction_id,
    currentStopSequence: current_stop_sequence,
    currentStatus: current_status,
    bearing
  };
}

export default resolvers;
