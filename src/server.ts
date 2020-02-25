import { ApolloServer, gql } from "apollo-server";
import { IResolvers } from "graphql-tools";
import dotenv from "dotenv";
import merge from "lodash.merge";

import { IContext } from "./data/dataSources";
import dataSources from "./data/dataSources";
import vehicleTypeDefs from "./vehicles/typeDefs";
import vehicleResolvers from "./vehicles/resolvers";
import stopTypeDefs from "./stops/typeDefs";
import stopResolvers from "./stops/resolvers";

dotenv.config();

const rootTypeDefs = gql`
  type Query {
    root: String
  }
`;

const resolvers: IResolvers<any, IContext> = merge(
  {
    Query: {}
  },
  vehicleResolvers,
  stopResolvers
);

const server = new ApolloServer({
  typeDefs: [rootTypeDefs, vehicleTypeDefs, stopTypeDefs],
  resolvers,
  dataSources
});

server.listen(4000).then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
