import { ApolloServer, gql } from "apollo-server";
import { IResolvers } from "graphql-tools";
import dotenv from "dotenv";
import merge from "lodash.merge";

import dataSources, { IContext } from "./data/dataSources";
import vehicleTypeDefs from "./vehicles/typeDefs";
import vehicleResolvers from "./vehicles/resolvers";

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
  vehicleResolvers
);

const server = new ApolloServer({
  typeDefs: [rootTypeDefs, vehicleTypeDefs],
  resolvers,
  dataSources
});

server.listen(4000).then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
