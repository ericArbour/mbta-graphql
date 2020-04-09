import { ApolloServer, PubSub } from "apollo-server";
import { DataSourceConfig } from "apollo-datasource";
import dotenv from "dotenv";

import MbtaAPI from "./data/MbtaAPI";
import MbtaSSE from "./data/MbtaSSE";
import { typeDefs, resolvers } from "./rootGraphQL";
import { DataSources } from "./types";

dotenv.config();

const pubsub = new PubSub();
const mbtaSSE = new MbtaSSE(pubsub);

const server = new ApolloServer({
  typeDefs,
  resolvers,
  dataSources: (): DataSources => ({
    mbtaAPI: new MbtaAPI(),
  }),
  context: ({ connection }) => {
    if (connection) {
      const mbtaAPI = new MbtaAPI();
      mbtaAPI.initialize({ context: connection.context } as DataSourceConfig<
        any
      >);
      return { ...connection.context, mbtaSSE, dataSources: { mbtaAPI } };
    }

    return {};
  },
});

server.listen(4000).then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
