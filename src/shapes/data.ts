import MbtaAPI from "../data/MbtaAPI";
import { objSnakeKeysToCamelKeys } from "../utils/utils";
import { isUndefined } from "../types";

import {
  MbtaShape,
  MbtaShapeResource,
  ShapesResolverArgs,
  isMbtaShapeResourceCollection,
} from "./types";

const shapeRelationships: string[] = [];
const ignoreFields: string[] = [];

export function getShapeFieldsAndIncludeParams(
  this: MbtaAPI,
  fields: string[],
) {
  return this.getFieldsAndIncludeParams(
    "shape",
    shapeRelationships,
    ignoreFields,
    fields,
  );
}

export async function getShapes(
  this: MbtaAPI,
  fields: string[],
  args: ShapesResolverArgs,
): Promise<MbtaShape[]> {
  const fieldsAndIncludeParams = this.getShapeFieldsAndIncludeParams(fields);
  const route = args.route;
  const routeFilterString = `&filter[route]=${route}`;
  const queryString = `${fieldsAndIncludeParams}${routeFilterString}`;

  const result = await this.getTypedParsedJSON(
    `shapes?${queryString}`,
    isMbtaShapeResourceCollection,
  );

  return result.data.map(mbtaShapeResourceToMbtaShape);
}

function mbtaShapeResourceToMbtaShape(
  mbtaShapeResource: MbtaShapeResource,
): MbtaShape {
  const { id, attributes = {} } = mbtaShapeResource;
  if (isUndefined(id)) throw new Error("No id on shape.");

  const camelCaseAttributes = objSnakeKeysToCamelKeys(attributes);

  return {
    id,
    ...camelCaseAttributes,
  };
}
