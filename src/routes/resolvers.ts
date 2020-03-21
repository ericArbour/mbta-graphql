import { IResolvers } from "graphql-tools";

import { IContext, Nullish, isNullish, isNotNullish } from "../types";
import { getFieldsFromInfo } from "../utils/utils";
import { MbtaVehicle, VehiclesResolverArgs } from "../vehicles/types";
import { Stop, NestedStopsResolverArgs } from "../stops/types";
import { mbtaStopToStop } from "../stops/resolvers";

import {
  MbtaRoute,
  RouteType,
  RoutesResolverArgs,
  RouteResolverArgs
} from "./types";

const resolvers: IResolvers<any, IContext> = {
  Query: {
    routes: async (
      parent,
      args: RoutesResolverArgs,
      { dataSources },
      info
    ): Promise<MbtaRoute[]> => {
      const fields = getFieldsFromInfo(info);
      const mbtaRoutes = await dataSources.mbtaAPI.getRoutes(fields, args);

      return mbtaRoutes;
    },
    route: async (parent, args: RouteResolverArgs, { dataSources }, info) => {
      const fields = getFieldsFromInfo(info);
      const mbtaRoute = await dataSources.mbtaAPI.getRoute(fields, args);

      return mbtaRoute;
    }
  },
  Route: {
    type: (parent: MbtaRoute, args, context, info): RouteType | Nullish => {
      if (isNullish(parent.type)) return parent.type;

      switch (parent.type) {
        case 0:
          return RouteType.LIGHT_RAIL;
        case 1:
          return RouteType.SUBWAY;
        case 2:
          return RouteType.RAIL;
        case 3:
          return RouteType.BUS;
        case 4:
          return RouteType.FERRY;
        default:
          return;
      }
    },
    vehicles: async (
      { id }: MbtaRoute,
      args: VehiclesResolverArgs,
      { dataSources },
      info
    ): Promise<MbtaVehicle[]> => {
      if (!id) return [];

      const fields = getFieldsFromInfo(info);
      const vehicleIdFilter = args.filter?.vehicleIdFilter;
      const labelFilter = args.filter?.labelFilter;
      const fieldsWithFilterInfo =
        labelFilter && !fields.includes("label")
          ? [...fields, "label"]
          : fields;

      const mbtaVehicles = await dataSources.mbtaAPI.getBatchRouteVehicles({
        id,
        fields: fieldsWithFilterInfo
      });

      const vehicleIdFilteredMbtaVehicles = vehicleIdFilter
        ? mbtaVehicles.filter(
            mbtaVehicle =>
              isNotNullish(mbtaVehicle.id) &&
              vehicleIdFilter.includes(mbtaVehicle.id)
          )
        : mbtaVehicles;

      const labelFilteredMbtaVehicles = labelFilter
        ? vehicleIdFilteredMbtaVehicles.filter(
            mbtaVehicle =>
              isNotNullish(mbtaVehicle.label) &&
              labelFilter.includes(mbtaVehicle.label)
          )
        : vehicleIdFilteredMbtaVehicles;

      return labelFilteredMbtaVehicles;
    },
    stops: async (
      { id }: MbtaRoute,
      args: NestedStopsResolverArgs,
      { dataSources },
      info
    ): Promise<Stop[]> => {
      if (!id) return [];
      const fields = getFieldsFromInfo(info);
      const stopIdFilter = args.filter?.stopIdFilter;
      const locationTypeFilter = args.filter?.locationTypeFilter;
      const fieldsWithFilterInfo =
        locationTypeFilter && !fields.includes("location_type")
          ? [...fields, "location_type"]
          : fields;

      const mbtaStops = await dataSources.mbtaAPI.getBatchRouteStops({
        id,
        fields: fieldsWithFilterInfo
      });

      const stops = mbtaStops.map(mbtaStopToStop);

      const stopIdFilteredStops = stopIdFilter
        ? stops.filter(
            stop => isNotNullish(stop.id) && stopIdFilter.includes(stop.id)
          )
        : stops;

      const locationTypeFilteredStops = locationTypeFilter
        ? stopIdFilteredStops.filter(
            stop =>
              isNotNullish(stop.location_type) &&
              locationTypeFilter.includes(stop.location_type)
          )
        : stopIdFilteredStops;

      return locationTypeFilteredStops;
    }
  }
};

export default resolvers;
