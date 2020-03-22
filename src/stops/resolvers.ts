import { IResolvers, FilterToSchema } from "graphql-tools";

import { getFieldsFromInfo, objSnakeKeysToCamelKeys } from "../utils/utils";
import {
  IContext,
  isNotNull,
  isNotNullish,
  isRelationshipsWithData,
  isResourceIdentifierObject,
  isResourceIdentifierObjectArray
} from "../types";
import { MbtaRoute, RouteType, RoutesResolverArgs } from "../routes/types";
import { mbtaRouteTypeToRouteType } from "../routes/data";

import {
  MbtaStop,
  Stop,
  LocationType,
  StopsResolverArgs,
  StopResolverArgs,
  NestedStopsResolverArgs
} from "./types";
import { mbtaLocationTypeToLocationType } from "./data";

const resolvers: IResolvers<any, IContext> = {
  Query: {
    stops: async (
      parent,
      args: StopsResolverArgs,
      { dataSources },
      info
    ): Promise<Stop[]> => {
      const fields = getFieldsFromInfo(info);
      const mbtaStops = await dataSources.mbtaAPI.getStops(fields, args);

      return mbtaStops.map(mbtaStopToStop);
    },
    stop: async (
      parent,
      args: StopResolverArgs,
      { dataSources },
      info
    ): Promise<Stop> => {
      const fields = getFieldsFromInfo(info);
      const mbtaStop = await dataSources.mbtaAPI.getStop(fields, args);

      return mbtaStopToStop(mbtaStop);
    }
  },
  Stop: {
    locationType: (
      { locationType }: Stop,
      args,
      context,
      info
    ): LocationType => {
      return mbtaLocationTypeToLocationType(locationType);
    },
    vehicleType: (
      { vehicleType }: Stop,
      args,
      context,
      info
    ): RouteType | null => {
      return mbtaRouteTypeToRouteType(vehicleType);
    },
    childStops: async (
      { childStops = [] }: Stop,
      args: NestedStopsResolverArgs,
      { dataSources },
      info
    ): Promise<Stop[]> => {
      if (!childStops.length) return [];

      const fields = getFieldsFromInfo(info);
      const stopIdFilter = args.filter?.stopIdFilter;
      const locationTypeFilter = args.filter?.locationTypeFilter;
      const fieldsWithFilterInfo =
        locationTypeFilter && !fields.includes("location_type")
          ? [...fields, "location_type"]
          : fields;

      const childStopIds = childStops.map(({ id }) => id).filter(isNotNull);

      const filteredChildStopIds = stopIdFilter
        ? childStopIds.filter(childStopId => stopIdFilter.includes(childStopId))
        : childStopIds;

      const childMbtaStops = await dataSources.mbtaAPI.getBatchChildStops({
        ids: filteredChildStopIds,
        fields: fieldsWithFilterInfo
      });

      const childStops2 = childMbtaStops.map(mbtaStopToStop);

      const stopIdFilteredChildStops = stopIdFilter
        ? childStops2.filter(
            childStop =>
              isNotNullish(childStop.id) && stopIdFilter.includes(childStop.id)
          )
        : childStops2;

      const locationTypeFilteredChildStops = locationTypeFilter
        ? stopIdFilteredChildStops.filter(
            childStop =>
              isNotNullish(childStop.locationType) &&
              locationTypeFilter.includes(
                mbtaLocationTypeToLocationType(childStop.locationType)
              )
          )
        : stopIdFilteredChildStops;

      return locationTypeFilteredChildStops;
    },
    parentStation: async (
      parent: Stop,
      args,
      { dataSources },
      info
    ): Promise<Stop | null> => {
      const stopId = parent.parentStation?.id;
      if (!stopId) return null;

      const fields = getFieldsFromInfo(info);
      const stop = await dataSources.mbtaAPI.getBatchStop({
        id: stopId,
        fields
      });

      return mbtaStopToStop(stop);
    },
    routes: async (
      parent: Stop,
      args: RoutesResolverArgs,
      { dataSources },
      info
    ): Promise<MbtaRoute[]> => {
      const stopId = parent.id;
      if (!stopId) return [];

      const fields = getFieldsFromInfo(info);
      const routeIdFilter = args.filter?.routeIdFilter;
      const typeFilter = args.filter?.typeFilter;
      const fieldsWithFilterInfo =
        typeFilter && !fields.includes("type") ? [...fields, "type"] : fields;

      const mbtaRoutes = await dataSources.mbtaAPI.getBatchStopRoutes({
        id: stopId,
        fields: fieldsWithFilterInfo
      });

      const routeIdFilteredMbtaRoutes = routeIdFilter
        ? mbtaRoutes.filter(
            mbtaRoute =>
              isNotNullish(mbtaRoute.id) && routeIdFilter.includes(mbtaRoute.id)
          )
        : mbtaRoutes;

      const typeFilteredRoutes = typeFilter
        ? routeIdFilteredMbtaRoutes.filter(mbtaRoute => {
            const routeType = mbtaRouteTypeToRouteType(mbtaRoute.type);
            return isNotNullish(routeType) && typeFilter.includes(routeType);
          })
        : routeIdFilteredMbtaRoutes;

      return typeFilteredRoutes;
    }
  }
};

export function mbtaStopToStop(mbtaStop: MbtaStop): Stop {
  const { id = null, attributes = {}, relationships } = mbtaStop;
  const childStopsRelationship = relationships?.child_stops;
  const parentStationRelationship = relationships?.parent_station;

  const childStopsRelationshipData = isRelationshipsWithData(
    childStopsRelationship
  )
    ? childStopsRelationship.data
    : null;
  const childStops = isResourceIdentifierObjectArray(childStopsRelationshipData)
    ? childStopsRelationshipData.map(({ id: stopId }) => ({ id: stopId }))
    : [];
  const parentStationRelationshipData = isRelationshipsWithData(
    parentStationRelationship
  )
    ? parentStationRelationship.data
    : null;
  const parentStation = isResourceIdentifierObject(
    parentStationRelationshipData
  )
    ? { id: parentStationRelationshipData.id }
    : null;

  const camelCaseAttributes = objSnakeKeysToCamelKeys(attributes);

  return {
    id,
    ...camelCaseAttributes,
    childStops,
    parentStation
  };
}

export default resolvers;
