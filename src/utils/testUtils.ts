import { ApolloServer } from "apollo-server";
import { DataSources } from "apollo-server-core/dist/graphqlOptions";

import MbtaAPI from "../data/MbtaAPI";
import { typeDefs, resolvers } from "../rootGraphQL";
import { IDataSources } from "../types";

export const constructTestServer = () => {
  const mbtaAPI = new MbtaAPI();
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    dataSources: (): DataSources<IDataSources> => ({
      mbtaAPI
    })
  });

  return { server };
};
