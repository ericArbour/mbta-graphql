import MbtaAPI from "../data/MbtaAPI";
import { MbtaRESTError, objSnakeKeysToCamelKeys } from "../utils/utils";
import {
  isRelationshipsWithData,
  isResourceIdentifierObject,
  BatchFieldConfig,
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

export async function getVehicles(
  this: MbtaAPI,
  fields: string[],
  args: VehiclesResolverArgs
): Promise<MbtaVehicle[]> {
  const fieldsAndIncludeParams = this.getFieldsAndIncludeParams(
    "vehicle",
    fields,
    vehicleRelationships
  );
  const vehicleIdFilter = args.filter?.vehicleIdFilter;
  const labelFilter = args.filter?.labelFilter;
  const vehicleIdFilterString = vehicleIdFilter?.length
    ? `&filter[id]=${vehicleIdFilter.join(",")}`
    : "";
  const labelFilterString = labelFilter?.length
    ? `&filter[label]=${labelFilter.join(",")}`
    : "";
  const queryString = `${fieldsAndIncludeParams}${vehicleIdFilterString}${labelFilterString}`;

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
  const fieldsAndIncludeParams = this.getFieldsAndIncludeParams(
    "vehicle",
    fields,
    vehicleRelationships
  );

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
    const fieldsAndIncludeParams = this.getFieldsAndIncludeParams(
      "vehicle",
      config.fields,
      vehicleRelationships
    );
    const routeFilterString = `&filter[route]=${config.id}`;
    const result = await this.getTypedParsedJSON(
      `vehicles?${fieldsAndIncludeParams}${routeFilterString}`,
      isMbtaVehicleResourceCollection
    );

    return [result.data.map(mbtaVehicleResourceToMbtaVehicle)];
  } else {
    const fields = configs.flatMap((config) => config.fields);
    const fieldsAndIncludeParams = this.getFieldsAndIncludeParams(
      "vehicle",
      [...fields, "route"],
      vehicleRelationships
    );
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

function mbtaVehicleResourceToMbtaVehicle(
  mbtaVehicleResource: MbtaVehicleResource
): MbtaVehicle {
  const { id = null, attributes = {}, relationships } = mbtaVehicleResource;
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
