import { ApolloServer } from "apollo-server";
import { DataSources } from "apollo-server-core/dist/graphqlOptions";
import dotenv from "dotenv";

import MbtaAPI from "./data/MbtaAPI";
import { typeDefs, resolvers } from "./rootGraphQL";
import { IDataSources } from "./types";

dotenv.config();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  dataSources: (): DataSources<IDataSources> => ({
    mbtaAPI: new MbtaAPI()
  })
});

server.listen(4000).then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
