import { gql } from "apollo-server";
import { IResolvers } from "graphql-tools";
import merge from "lodash.merge";

import vehicleTypeDefs from "./vehicles/typeDefs";
import vehicleResolvers from "./vehicles/resolvers";
import stopTypeDefs from "./stops/typeDefs";
import stopResolvers from "./stops/resolvers";
import routeTypeDefs from "./routes/typeDefs";
import routeResolvers from "./routes/resolvers";
import shapeTypeDefs from "./shapes/typeDefs";
import shapeResolvers from "./shapes/resolvers";
import { Context } from "./types";

const rootTypeDefs = gql`
  type Query {
    root: String
  }

  type Subscription {
    root: String
  }
`;

export const typeDefs = [
  rootTypeDefs,
  vehicleTypeDefs,
  stopTypeDefs,
  routeTypeDefs,
  shapeTypeDefs,
];

export const resolvers: IResolvers<unknown, Context> = merge(
  {
    Query: {},
  },
  vehicleResolvers,
  stopResolvers,
  routeResolvers,
  shapeResolvers,
);
