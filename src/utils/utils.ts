import { GraphQLResolveInfo, SelectionNode } from "graphql";
import { ApolloError } from "apollo-server";

import { isNotNullish, FragmentMap, isFragmentMap } from "../types";

function snakeToCamel(str: string) {
  return str.replace(/(_\w)/g, (match: string) => match[1].toUpperCase());
}

function camelToSnake(str: string) {
  return str
    .replace(/[\w]([A-Z])/g, (match: string) => match[0] + "_" + match[1])
    .toLowerCase();
}

export function objSnakeKeysToCamelKeys(obj: object) {
  return Object.entries(obj).reduce((newObj: { [key: string]: any }, entry) => {
    const [key, value] = entry;
    const camelKey = snakeToCamel(key);
    newObj[camelKey] = value;
    return newObj;
  }, {});
}

export function getFieldsFromInfo(info: GraphQLResolveInfo): string[] {
  const selections = info.fieldNodes[0].selectionSet?.selections || [];

  // id field is always returned from MBTA api and never needs to be specified in fields
  return recursiveFieldsGetter(selections, info.fragments)
    .filter(field => isNotNullish(field) && field !== "id")
    .map(field => camelToSnake(field));
}

function recursiveFieldsGetter(
  selections: readonly SelectionNode[],
  maybeFragmentMap?: FragmentMap
): string[] {
  return selections.flatMap(fieldNode => {
    if (fieldNode.kind === "Field") return fieldNode.name.value;
    if (fieldNode.kind === "FragmentSpread" && isFragmentMap(maybeFragmentMap))
      return recursiveFieldsGetter(
        maybeFragmentMap[fieldNode.name.value].selectionSet.selections,
        maybeFragmentMap
      );
    return "";
  });
}

export class MbtaRESTError extends ApolloError {
  constructor() {
    super(
      "An error occurred mapping data between the MBTA REST endpoint and this service.",
      "MBTA_DATA_MAPPING_ERROR"
    );
  }
}
