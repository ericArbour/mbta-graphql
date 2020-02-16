import { DataSources } from "apollo-server-core/dist/graphqlOptions";
import MbtaAPI from "./MbtaAPI";

interface IDataSources {
  mbtaAPI: MbtaAPI;
}

export interface IContext {
  dataSources: IDataSources;
}

export default function dataSources(): DataSources<IDataSources> {
  return {
    mbtaAPI: new MbtaAPI()
  };
}
