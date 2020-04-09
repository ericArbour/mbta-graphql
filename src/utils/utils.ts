import { GraphQLResolveInfo, SelectionNode } from "graphql";
import { ApolloError } from "apollo-server";
import throttle from "lodash.throttle";
import memoize from "lodash.memoize";

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
  return Object.entries(obj).reduce(
    (newObj: { [key: string]: unknown }, entry) => {
      const [key, value] = entry;
      const camelKey = snakeToCamel(key);
      newObj[camelKey] = value;
      return newObj;
    },
    {}
  );
}

export function getFieldsFromInfo(info: GraphQLResolveInfo): string[] {
  const selections = info.fieldNodes[0].selectionSet?.selections || [];

  // id field is always returned from MBTA api and never needs to be specified in fields
  return recursiveFieldsGetter(selections, info.fragments)
    .filter((field) => isNotNullish(field) && field !== "id")
    .map((field) => camelToSnake(field));
}

function recursiveFieldsGetter(
  selections: readonly SelectionNode[],
  maybeFragmentMap?: FragmentMap
): string[] {
  return selections.flatMap((fieldNode) => {
    if (fieldNode.kind === "Field") return fieldNode.name.value;
    if (fieldNode.kind === "FragmentSpread" && isFragmentMap(maybeFragmentMap))
      return recursiveFieldsGetter(
        maybeFragmentMap[fieldNode.name.value].selectionSet.selections,
        maybeFragmentMap
      );
    return "";
  });
}

export function parseAndTypeJSON<T>(
  jsonString: string,
  isType: (x: unknown) => x is T
) {
  let result: unknown;
  try {
    result = JSON.parse(jsonString);
  } catch (e) {
    throw new MbtaRESTError("Could not parse MBTA API response.");
  }

  if (isType(result)) return result;
  throw new MbtaRESTError("MBTA API response is not of the expected type.");
}

export function updateArrayItem<T extends { id: string }>(
  items: T[],
  newItem: T
): T[] {
  return items.map((item) => (item.id === newItem.id ? newItem : item));
}

export function removeArrayItem<T extends { id: string }>(
  items: T[],
  itemToRemove: T
): T[] {
  return items.filter((item) => item.id !== itemToRemove.id);
}

export class MbtaRESTError extends ApolloError {
  constructor(msg: string) {
    super(msg, "MBTA_DATA_MAPPING_ERROR");
  }
}

export function memoizedThrottle(func: any, wait = 0, options = {}) {
  const memoized = memoize(function () {
    return throttle(func, wait, options);
  });

  return function (...args: any[]) {
    memoized.apply(this, args).apply(this, args);
  };
}
