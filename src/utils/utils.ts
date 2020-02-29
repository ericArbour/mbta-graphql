import {
  GraphQLResolveInfo,
  SelectionNode,
  FragmentDefinitionNode
} from "graphql";
import { ApolloError } from "apollo-server";

export function getFieldsFromInfo(info: GraphQLResolveInfo): string[] {
  const selections = info.fieldNodes[0].selectionSet?.selections || [];

  return recursiveFieldsGetter(selections, info.fragments);
}

function recursiveFieldsGetter(
  selections: readonly SelectionNode[],
  maybeFragmentMap?: FragmentMap
): string[] {
  const fields = selections.flatMap(fieldNode => {
    if (fieldNode.kind === "Field") return fieldNode.name.value;
    if (fieldNode.kind === "FragmentSpread" && isFragmentMap(maybeFragmentMap))
      return recursiveFieldsGetter(
        maybeFragmentMap[fieldNode.name.value].selectionSet.selections,
        maybeFragmentMap
      );
    return "";
  });

  // id field is always returned from MBTA api and never needs to be specified in fields
  return fields.filter(field => field && field !== "id");
}

type FragmentMap = {
  [key: string]: FragmentDefinitionNode;
};

function isFragmentMap(
  maybeFragmentMap: FragmentMap | undefined
): maybeFragmentMap is FragmentMap {
  return maybeFragmentMap !== undefined;
}

export class MbtaRESTError extends ApolloError {
  constructor() {
    super(
      "An error occurred mapping data between the MBTA REST endpoint and this service.",
      "MBTA_DATA_MAPPING_ERROR"
    );
  }
}
