import MbtaAPI from "../data/MbtaAPI";
import { MbtaRESTError, objSnakeKeysToCamelKeys } from "../utils/utils";
import {
  isCollectionResourceDoc,
  isDocWithData,
  isRelationshipsWithData,
  isResourceIdentifierObject,
  BatchFieldConfig
} from "../types";

import {
  MbtaVehicleResource,
  MbtaVehicle,
  isMbtaVehicleResource,
  VehiclesResolverArgs,
  VehicleResolverArgs
} from "./types";

const vehicleRelationships: string[] = ["stop"];

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

  const result = await this.getParsedJSON(`vehicles?${queryString}`);

  if (isCollectionResourceDoc(isMbtaVehicleResource, result)) {
    return result.data.map(mbtaVehicleResourceToMbtaVehicle);
  } else {
    throw new MbtaRESTError();
  }
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

  const result = await this.getParsedJSON(
    `vehicles/${args.id}?${fieldsAndIncludeParams}`
  );

  if (isDocWithData(isMbtaVehicleResource, result)) {
    return mbtaVehicleResourceToMbtaVehicle(result.data);
  } else {
    throw new MbtaRESTError();
  }
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
    const result = await this.getParsedJSON(
      `vehicles?${fieldsAndIncludeParams}${routeFilterString}`
    );

    if (isCollectionResourceDoc(isMbtaVehicleResource, result)) {
      return [result.data.map(mbtaVehicleResourceToMbtaVehicle)];
    } else {
      throw new MbtaRESTError();
    }
  } else {
    const fields = configs.flatMap(config => config.fields);
    const fieldsAndIncludeParams = this.getFieldsAndIncludeParams(
      "vehicle",
      [...fields, "route"],
      vehicleRelationships
    );
    const result = await this.getParsedJSON(
      `vehicles?${fieldsAndIncludeParams}`
    );

    if (isCollectionResourceDoc(isMbtaVehicleResource, result)) {
      const mbtaVehicleResources = result.data;

      return configs.map(config => {
        const mbtaVehicleResourcesForRoute = mbtaVehicleResources.filter(
          mbtaVehicleResource => {
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

        return mbtaVehicleResourcesForRoute.map(
          mbtaVehicleResourceToMbtaVehicle
        );
      });
    } else {
      throw new MbtaRESTError();
    }
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
        id: stopRelationshipData.id
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
    route
  };
}
