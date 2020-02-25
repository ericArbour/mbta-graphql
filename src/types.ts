import * as JSONAPI from "jsonapi-typescript";

export type Maybe<T> = null | T;

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

export function isNotNull<T>(x: Maybe<T>): x is T {
  return x !== null;
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
  return Array.isArray(relationship as JSONAPI.ResourceIdentifierObject[]);
}
