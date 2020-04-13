import * as JSONAPI from "jsonapi-typescript";

import { isResourceObject, isCollectionResourceDoc } from "../types";
import { MbtaRoute } from "../routes/types";

type MbtaShapeAttributes = {
  priority: number | null;
  polyline: string | null;
  name: string | null;
  direction_id: number | null;
};

export type MbtaShapeResource = JSONAPI.ResourceObject<
  string,
  MbtaShapeAttributes
>;

export function isMbtaShapeResource(x: unknown): x is MbtaShapeResource {
  return isResourceObject(x) && x.type === "shape";
}

export function isMbtaShapeResourceCollection(
  x: unknown,
): x is JSONAPI.CollectionResourceDoc<string, MbtaShapeAttributes> {
  return isCollectionResourceDoc(isMbtaShapeResource, x);
}

export type MbtaShape = {
  id: string;
  priority?: number | null;
  polyline?: string | null;
  name?: string | null;
  directionId?: number | null;
  route?: MbtaRoute | null;
};

export type ShapesResolverArgs = {
  route: string;
};
