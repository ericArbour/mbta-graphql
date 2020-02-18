import * as JSONAPI from "jsonapi-typescript";

import { Maybe, Scalars } from "../types";

type MbtaStopAttributes = {
  wheelchair_boarding: number;
  vehicle_type: number;
  platform_name: string;
  platform_code: string;
  on_street: string;
  name: string;
  municipality: string;
  longitude: number;
  location_type: number;
  latitude: number;
  description: string;
  at_street: string;
  address: string;
};

export type MbtaStop = JSONAPI.ResourceObject<string, MbtaStopAttributes>;

export type MbtaStopsJSON = JSONAPI.CollectionResourceDoc<
  string,
  MbtaStopAttributes
>;

export type Stop = {
  id: Scalars["ID"];
  wheelchair_boarding: Maybe<Scalars["Int"]>;
  vehicle_type: Maybe<Scalars["Int"]>;
  platform_name: Maybe<Scalars["String"]>;
  platform_code: Maybe<Scalars["String"]>;
  on_street: Maybe<Scalars["String"]>;
  name: Maybe<Scalars["String"]>;
  municipality: Maybe<Scalars["String"]>;
  longitude: Maybe<Scalars["Float"]>;
  location_type: Maybe<Scalars["Int"]>;
  latitude: Maybe<Scalars["Float"]>;
  description: Maybe<Scalars["String"]>;
  at_street: Maybe<Scalars["String"]>;
  address: Maybe<Scalars["String"]>;
};
