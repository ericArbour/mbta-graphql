import { IResolvers, FilterToSchema } from "graphql-tools";

import { getFieldsFromInfo, objSnakeKeysToCamelKeys } from "../utils/utils";
import { IContext, isNotNull, isNotNullish } from "../types";
import { MbtaRoute, RouteType, RoutesResolverArgs } from "../routes/types";
import { mbtaRouteTypeToRouteType } from "../routes/data";

import {
  MbtaStop,
  LocationType,
  StopsResolverArgs,
  StopResolverArgs,
  NestedStopsResolverArgs
} from "./types";
import { mbtaLocationTypeToLocationType } from "./data";

const resolvers: IResolvers<unknown, IContext> = {
  Query: {
    stops: async (
      parent,
      args: StopsResolverArgs,
      { dataSources },
      info
    ): Promise<MbtaStop[]> => {
      const fields = getFieldsFromInfo(info);
      return await dataSources.mbtaAPI.getStops(fields, args);
    },
    stop: async (
      parent,
      args: StopResolverArgs,
      { dataSources },
      info
    ): Promise<MbtaStop> => {
      const fields = getFieldsFromInfo(info);
      return await dataSources.mbtaAPI.getStop(fields, args);
    }
  },
  Stop: {
    locationType: (
      { locationType }: MbtaStop,
      args,
      context,
      info
    ): LocationType => {
      return mbtaLocationTypeToLocationType(locationType);
    },
    vehicleType: (
      { vehicleType }: MbtaStop,
      args,
      context,
      info
    ): RouteType | null => {
      return mbtaRouteTypeToRouteType(vehicleType);
    },
    childStops: async (
      { childStops = [] }: MbtaStop,
      args: NestedStopsResolverArgs,
      { dataSources },
      info
    ): Promise<MbtaStop[]> => {
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

      const stopIdFilteredChildMbtaStops = stopIdFilter
        ? childMbtaStops.filter(
            childMbtaStop =>
              isNotNullish(childMbtaStop.id) &&
              stopIdFilter.includes(childMbtaStop.id)
          )
        : childMbtaStops;

      const locationTypeFilteredChildStops = locationTypeFilter
        ? stopIdFilteredChildMbtaStops.filter(
            childMbtaStop =>
              isNotNullish(childMbtaStop.locationType) &&
              locationTypeFilter.includes(
                mbtaLocationTypeToLocationType(childMbtaStop.locationType)
              )
          )
        : stopIdFilteredChildMbtaStops;

      return locationTypeFilteredChildStops;
    },
    parentStation: async (
      parent: MbtaStop,
      args,
      { dataSources },
      info
    ): Promise<MbtaStop | null> => {
      const stopId = parent.parentStation?.id;
      if (!stopId) return null;

      const fields = getFieldsFromInfo(info);
      return await dataSources.mbtaAPI.getBatchStop({
        id: stopId,
        fields
      });
    },
    routes: async (
      parent: MbtaStop,
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

export default resolvers;
