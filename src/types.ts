import * as JSONAPI from "jsonapi-typescript";
import * as JSON from "json-typescript";

export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export function isNotUndefined<T>(x: T | undefined): x is T {
  return x !== undefined;
}

export function isNotNull<T>(x: T | null): x is T {
  return x !== null;
}

export function isResourceObject(a: any): a is JSONAPI.ResourceObject {
  return (
    typeof a === "object" &&
    typeof a.id === "string" &&
    typeof a.type === "string" &&
    typeof a.attributes === "object"
  );
}

export function isDocWithData<A extends { [k: string]: JSON.Value }>(
  a: any,
  isA: (a: any) => a is JSONAPI.ResourceObject<string, A>
): a is JSONAPI.DocWithData<JSONAPI.ResourceObject<string, A>> {
  return typeof a === "object" && typeof a.data === "object" && isA(a.data);
}

export function isCollectionResourceDoc<A extends { [k: string]: JSON.Value }>(
  a: any,
  isA: (a: any) => a is JSONAPI.ResourceObject<string, A>
): a is JSONAPI.CollectionResourceDoc<string, A> {
  return typeof a === "object" && Array.isArray(a.data) && a.data.every(isA);
}

export function isRelationshipsWithData(
  relationship: JSONAPI.RelationshipObject | undefined
): relationship is JSONAPI.RelationshipsWithData {
  const data = (relationship as JSONAPI.RelationshipsWithData)?.data;
  return typeof data === "object" && data !== null;
}

export function isResourceIdentifierObject(
  relationship: JSONAPI.ResourceLinkage | undefined
): relationship is JSONAPI.ResourceIdentifierObject {
  const id = (relationship as JSONAPI.ResourceIdentifierObject)?.id;
  return typeof id === "number" || typeof id === "string";
}

export function isResourceIdentifierObjectArray(
  relationship: JSONAPI.ResourceLinkage | undefined
): relationship is JSONAPI.ResourceIdentifierObject[] {
  const relationshipArray = relationship as JSONAPI.ResourceIdentifierObject[];
  return (
    relationship !== undefined &&
    relationship !== null &&
    Array.isArray(relationshipArray) &&
    relationshipArray.every(isResourceIdentifierObject)
  );
}
