import { IResolvers } from "graphql-tools";
import { FieldNode } from "graphql";
import { IContext } from "../data/dataSources";
import { MbtaVehicle, Vehicle } from "./types";

const resolvers: IResolvers<string, IContext> = {
  Query: {
    vehicles: async (parent, args, { dataSources }, info) => {
      const { selections } = info.fieldNodes[0].selectionSet;
      const fields = selections
        .map((fieldNode: FieldNode) => fieldNode.name.value)
        .filter(field => field !== "id");
      const result = await dataSources.mbtaAPI.getVehicles(fields);

      return result.data.map(mbtaVehicleToVehicle);
    }
  }
};

function mbtaVehicleToVehicle(mbtaVehicle: MbtaVehicle): Vehicle {
  const { id, attributes } = mbtaVehicle;

  return {
    id,
    ...attributes
  };
}

export default resolvers;
