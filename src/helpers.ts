import { FieldNode, GraphQLResolveInfo } from "graphql";

export function getFieldsFromInfo(info: GraphQLResolveInfo) {
  return info?.fieldNodes[0]?.selectionSet?.selections
    ?.map((fieldNode: FieldNode) => fieldNode.name.value)
    .filter(field => field !== "id");
}
