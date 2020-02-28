import { gql } from "apollo-server";
import { IResolvers } from "graphql-tools";
import merge from "lodash.merge";

import vehicleTypeDefs from "./vehicles/typeDefs";
import vehicleResolvers from "./vehicles/resolvers";
import stopTypeDefs from "./stops/typeDefs";
import stopResolvers from "./stops/resolvers";
import { IContext } from "./types";

const rootTypeDefs = gql`
  type Query {
    root: String
  }
`;

export const typeDefs = [rootTypeDefs, vehicleTypeDefs, stopTypeDefs];

export const resolvers: IResolvers<any, IContext> = merge(
  {
    Query: {}
  },
  vehicleResolvers,
  stopResolvers
);
