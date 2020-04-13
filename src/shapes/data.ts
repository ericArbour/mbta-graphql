import MbtaAPI from "../data/MbtaAPI";
import { objSnakeKeysToCamelKeys } from "../utils/utils";
import {
  isUndefined,
  BatchFieldConfig,
  isRelationshipsWithData,
  isResourceIdentifierObject,
} from "../types";

import {
  MbtaShape,
  MbtaShapeResource,
  ShapesResolverArgs,
  isMbtaShapeResourceCollection,
} from "./types";

const shapeRelationships = ["route"];
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

export async function batchRouteShapesLoadFn(
  this: MbtaAPI,
  configs: readonly BatchFieldConfig[],
): Promise<MbtaShape[][]> {
  const fields = configs.flatMap((config) => config.fields);
  const fieldsAndIncludeParams = this.getShapeFieldsAndIncludeParams([
    ...fields,
    "route",
  ]);
  const routeFilterString = `&filter[route]=${configs
    .map(({ id }) => id)
    .join(",")}`;

  const result = await this.getTypedParsedJSON(
    `shapes?${fieldsAndIncludeParams}${routeFilterString}`,
    isMbtaShapeResourceCollection,
  );
  const mbtaShapes = result.data.map(mbtaShapeResourceToMbtaShape);

  return configs.map((config) =>
    mbtaShapes.filter((mbtaShape) => mbtaShape.route?.id === config.id),
  );
}

function mbtaShapeResourceToMbtaShape(
  mbtaShapeResource: MbtaShapeResource,
): MbtaShape {
  const { id, attributes = {}, relationships } = mbtaShapeResource;
  if (isUndefined(id)) throw new Error("No id on shape.");

  const routeRelationship = relationships?.route;
  const routeRelationshipData = isRelationshipsWithData(routeRelationship)
    ? routeRelationship.data
    : null;
  const route = isResourceIdentifierObject(routeRelationshipData)
    ? { id: routeRelationshipData.id }
    : null;

  const camelCaseAttributes = objSnakeKeysToCamelKeys(attributes);

  return {
    id,
    route,
    ...camelCaseAttributes,
  };
}
