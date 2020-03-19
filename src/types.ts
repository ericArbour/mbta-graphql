import * as JSONAPI from "jsonapi-typescript";
import * as JSON from "json-typescript";

import MbtaAPI from "./data/MbtaAPI";

export interface IDataSources {
  mbtaAPI: MbtaAPI;
}

export interface IContext {
  dataSources: IDataSources;
}

export function isUndefined<T>(x: T | undefined): x is undefined {
  return x === undefined;
}

export function isNotUndefined<T>(x: T | undefined): x is T {
  return !isUndefined(x);
}

export function isNull<T>(x: T | null): x is null {
  return x === null;
}

export function isNotNull<T>(x: T | null): x is T {
  return !isNull(x);
}

export type Nullish = null | undefined;

export function isNullish<T>(x: T | Nullish): x is Nullish {
  return isNull(x) || isUndefined(x);
}

export function isNotNullish<T>(x: T | Nullish): x is T {
  return !isNullish(x);
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

export function isArrayOfCollectionResourceDocs<
  A extends { [k: string]: JSON.Value }
>(
  as: any[],
  isA: (a: any) => a is JSONAPI.ResourceObject<string, A>
): as is JSONAPI.CollectionResourceDoc<string, A>[] {
  return as.every(a => isCollectionResourceDoc(a, isA));
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

export type BatchFieldConfig = { id: string; fields: string[] };

export type BatchListFieldConfig = { ids: string[]; fields: string[] };
