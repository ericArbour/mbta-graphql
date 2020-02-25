import { GraphQLResolveInfo } from "graphql";

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
