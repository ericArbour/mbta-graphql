import MbtaAPI from "../data/MbtaAPI";
import { objSnakeKeysToCamelKeys } from "../utils/utils";
import {
  isRelationshipsWithData,
  isResourceIdentifierObject,
  BatchFieldConfig,
  isUndefined,
} from "../types";

import {
  MbtaVehicleResource,
  MbtaVehicle,
  isMbtaVehicleResourceDoc,
  isMbtaVehicleResourceCollection,
  VehiclesResolverArgs,
  VehicleResolverArgs,
} from "./types";

const vehicleRelationships: string[] = ["stop", "route"];
const ignoreFields: string[] = [];

export function getVehicleFieldsAndIncludeParams(
  this: MbtaAPI,
  fields: string[]
) {
  return this.getFieldsAndIncludeParams(
    "vehicle",
    vehicleRelationships,
    ignoreFields,
    fields
  );
}

export async function getVehicles(
  this: MbtaAPI,
  fields: string[],
  args: VehiclesResolverArgs
): Promise<MbtaVehicle[]> {
  const fieldsAndIncludeParams = this.getVehicleFieldsAndIncludeParams(fields);

  const vehicleIdFilter = args.filter?.vehicleIdFilter;
  const labelFilter = args.filter?.labelFilter;
  const routeFilter = args.filter?.routeFilter;

  const vehicleIdFilterString = vehicleIdFilter?.length
    ? `&filter[id]=${vehicleIdFilter.join(",")}`
    : "";
  const labelFilterString = labelFilter?.length
    ? `&filter[label]=${labelFilter.join(",")}`
    : "";
  const routeFilterString = routeFilter?.length
    ? `&filter[route]=${routeFilter.join(",")}`
    : "";

  const queryString = `${fieldsAndIncludeParams}${vehicleIdFilterString}${labelFilterString}${routeFilterString}`;

  const result = await this.getTypedParsedJSON(
    `vehicles?${queryString}`,
    isMbtaVehicleResourceCollection
  );

  return result.data.map(mbtaVehicleResourceToMbtaVehicle);
}

export async function getVehicle(
  this: MbtaAPI,
  fields: string[],
  args: VehicleResolverArgs
): Promise<MbtaVehicle> {
  const fieldsAndIncludeParams = this.getVehicleFieldsAndIncludeParams(fields);

  const result = await this.getTypedParsedJSON(
    `vehicles/${args.id}?${fieldsAndIncludeParams}`,
    isMbtaVehicleResourceDoc
  );

  return mbtaVehicleResourceToMbtaVehicle(result.data);
}

export async function batchRouteVehiclesLoadFn(
  this: MbtaAPI,
  configs: readonly BatchFieldConfig[]
): Promise<MbtaVehicle[][]> {
  if (configs.length === 1) {
    const [config] = configs;
    const fieldsAndIncludeParams = this.getVehicleFieldsAndIncludeParams(
      config.fields
    );
    const routeFilterString = `&filter[route]=${config.id}`;
    const result = await this.getTypedParsedJSON(
      `vehicles?${fieldsAndIncludeParams}${routeFilterString}`,
      isMbtaVehicleResourceCollection
    );

    return [result.data.map(mbtaVehicleResourceToMbtaVehicle)];
  } else {
    const fields = configs.flatMap((config) => config.fields);
    const fieldsAndIncludeParams = this.getVehicleFieldsAndIncludeParams([
      ...fields,
      // Always include route so the relationship is requested
      "route",
    ]);
    const result = await this.getTypedParsedJSON(
      `vehicles?${fieldsAndIncludeParams}`,
      isMbtaVehicleResourceCollection
    );

    const mbtaVehicleResources = result.data;

    return configs.map((config) => {
      const mbtaVehicleResourcesForRoute = mbtaVehicleResources.filter(
        (mbtaVehicleResource) => {
          const routeRelationship = mbtaVehicleResource.relationships?.route;
          const routeRelationshipData = isRelationshipsWithData(
            routeRelationship
          )
            ? routeRelationship.data
            : null;
          const routeId = isResourceIdentifierObject(routeRelationshipData)
            ? routeRelationshipData.id
            : null;

          return routeId === config.id;
        }
      );

      return mbtaVehicleResourcesForRoute.map(mbtaVehicleResourceToMbtaVehicle);
    });
  }
}

export function mbtaVehicleResourceToMbtaVehicle(
  mbtaVehicleResource: MbtaVehicleResource
): MbtaVehicle {
  const { id, attributes = {}, relationships } = mbtaVehicleResource;
  if (isUndefined(id)) throw new Error("No id on vehicle.");

  const stopRelationship = relationships?.stop;
  const routeRelationship = relationships?.route;

  const stopRelationshipData = isRelationshipsWithData(stopRelationship)
    ? stopRelationship?.data
    : null;
  const stop = isResourceIdentifierObject(stopRelationshipData)
    ? {
        id: stopRelationshipData.id,
      }
    : null;

  const routeRelationshipData = isRelationshipsWithData(routeRelationship)
    ? routeRelationship.data
    : null;
  const route = isResourceIdentifierObject(routeRelationshipData)
    ? { id: routeRelationshipData.id }
    : null;

  const camelCaseAttributes = objSnakeKeysToCamelKeys(attributes);

  return {
    id,
    ...camelCaseAttributes,
    stop,
    route,
  };
}
