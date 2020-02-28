import { GraphQLResolveInfo } from "graphql";
import { ApolloError } from "apollo-server";

export function getFieldsFromInfo(info: GraphQLResolveInfo): string[] {
  const selections = info.fieldNodes[0].selectionSet?.selections || [];

  return (
    selections
      .map(fieldNode =>
        fieldNode.kind === "Field" ? fieldNode.name.value : ""
      )
      // id field is always returned and never needs to be specified in fields
      .filter(field => field && field !== "id")
  );
}

export class MbtaRESTError extends ApolloError {
  constructor() {
    super(
      "An error occurred mapping data between the MBTA REST endpoint and this service.",
      "MBTA_DATA_MAPPING_ERROR"
    );
  }
}
