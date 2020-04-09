import { ApolloServer } from "apollo-server";

import MbtaAPI from "../data/MbtaAPI";
import { typeDefs, resolvers } from "../rootGraphQL";
import { DataSources } from "../types";

export const constructTestServer = () => {
  const mbtaAPI = new MbtaAPI();
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    dataSources: (): DataSources => ({
      mbtaAPI,
    }),
  });

  return { server };
};
