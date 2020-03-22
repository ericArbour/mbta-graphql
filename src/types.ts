import * as JSONAPI from "jsonapi-typescript";
import * as JSON from "json-typescript";
import { FragmentDefinitionNode } from "graphql";

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

function isObject(x: unknown): x is object {
  return typeof x === "object" && isNotNull(x);
}

export function isResourceObject(x: unknown): x is JSONAPI.ResourceObject {
  if (!isObject(x)) return false;
  const resourceObject = x as JSONAPI.ResourceObject;

  return (
    typeof resourceObject.id === "string" &&
    typeof resourceObject.type === "string" &&
    isObject(resourceObject.attributes)
  );
}

export function isSingleResourceDoc<A extends { [k: string]: JSON.Value }>(
  isType: (x: unknown) => x is JSONAPI.ResourceObject<string, A>,
  x: unknown
): x is JSONAPI.SingleResourceDoc<string, A> {
  if (!isObject(x)) return false;
  const test = x;

  const data = (x as JSONAPI.SingleResourceDoc<string, A>).data;

  return isType(data);
}

export function isCollectionResourceDoc<A extends { [k: string]: JSON.Value }>(
  isType: (x: unknown) => x is JSONAPI.ResourceObject<string, A>,
  x: unknown
): x is JSONAPI.CollectionResourceDoc<string, A> {
  if (!isObject(x)) return false;

  const data = (x as JSONAPI.CollectionResourceDoc<string, A>).data;

  return Array.isArray(data) && data.every(isType);
}

export function isRelationshipsWithData(
  maybeRelationship: JSONAPI.RelationshipObject | undefined
): maybeRelationship is JSONAPI.RelationshipsWithData {
  if (!isObject(maybeRelationship)) return false;

  const data = (maybeRelationship as JSONAPI.RelationshipsWithData).data;

  return isObject(data);
}

export function isResourceIdentifierObject(
  maybeResourceLinkage: JSONAPI.ResourceLinkage | undefined
): maybeResourceLinkage is JSONAPI.ResourceIdentifierObject {
  if (!isObject(maybeResourceLinkage)) return false;

  const resourceIdObj = maybeResourceLinkage as JSONAPI.ResourceIdentifierObject;

  return (
    isObject(resourceIdObj) &&
    (typeof resourceIdObj.id === "number" ||
      typeof resourceIdObj.id === "string")
  );
}

export function isResourceIdentifierObjectArray(
  maybeResourceLinkage: JSONAPI.ResourceLinkage | undefined
): maybeResourceLinkage is JSONAPI.ResourceIdentifierObject[] {
  if (!isObject(maybeResourceLinkage)) return false;

  const resourceIdObjArr = maybeResourceLinkage as JSONAPI.ResourceIdentifierObject[];

  return (
    Array.isArray(resourceIdObjArr) &&
    resourceIdObjArr.every(isResourceIdentifierObject)
  );
}

export type BatchFieldConfig = { id: string; fields: string[] };

export type BatchListFieldConfig = { ids: string[]; fields: string[] };

export type FragmentMap = {
  [key: string]: FragmentDefinitionNode;
};

export function isFragmentMap(
  maybeFragmentMap: FragmentMap | undefined
): maybeFragmentMap is FragmentMap {
  return isNotUndefined(maybeFragmentMap) && isObject(maybeFragmentMap);
}
