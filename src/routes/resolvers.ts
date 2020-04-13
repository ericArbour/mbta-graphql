import { IResolvers } from "graphql-tools";

import { Context, isNotNullish } from "../types";
import { getFieldsFromInfo } from "../utils/utils";
import { MbtaVehicle } from "../vehicles/types";
import { MbtaStop, NestedStopsResolverArgs } from "../stops/types";
import { mbtaLocationTypeToLocationType } from "../stops/data";
import { MbtaShape } from "../shapes/types";

import {
  MbtaRoute,
  RouteType,
  RoutesResolverArgs,
  RouteResolverArgs,
  RouteVehiclesResolverArgs,
} from "./types";
import { mbtaRouteTypeToRouteType } from "./data";

const resolvers: IResolvers<unknown, Context> = {
  Query: {
    routes: async (
      parent,
      args: RoutesResolverArgs,
      { dataSources },
      info,
    ): Promise<MbtaRoute[]> => {
      const fields = getFieldsFromInfo(info);
      return await dataSources.mbtaAPI.getRoutes(fields, args);
    },
    route: async (parent, args: RouteResolverArgs, { dataSources }, info) => {
      const fields = getFieldsFromInfo(info);
      return await dataSources.mbtaAPI.getRoute(fields, args);
    },
  },
  Route: {
    type: ({ type }: MbtaRoute, args, context, info): RouteType | null => {
      return mbtaRouteTypeToRouteType(type);
    },
    vehicles: async (
      { id }: MbtaRoute,
      args: RouteVehiclesResolverArgs,
      { dataSources },
      info,
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
        fields: fieldsWithFilterInfo,
      });

      const vehicleIdFilteredMbtaVehicles = vehicleIdFilter
        ? mbtaVehicles.filter(
            (mbtaVehicle) =>
              isNotNullish(mbtaVehicle.id) &&
              vehicleIdFilter.includes(mbtaVehicle.id),
          )
        : mbtaVehicles;

      const labelFilteredMbtaVehicles = labelFilter
        ? vehicleIdFilteredMbtaVehicles.filter(
            (mbtaVehicle) =>
              isNotNullish(mbtaVehicle.label) &&
              labelFilter.includes(mbtaVehicle.label),
          )
        : vehicleIdFilteredMbtaVehicles;

      return labelFilteredMbtaVehicles;
    },
    stops: async (
      { id }: MbtaRoute,
      args: NestedStopsResolverArgs,
      { dataSources },
      info,
    ): Promise<MbtaStop[]> => {
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
        fields: fieldsWithFilterInfo,
      });

      const stopIdFilteredMbtaStops = stopIdFilter
        ? mbtaStops.filter(
            (mbtaStop) =>
              isNotNullish(mbtaStop.id) && stopIdFilter.includes(mbtaStop.id),
          )
        : mbtaStops;

      const locationTypeFilteredMbtaStops = locationTypeFilter
        ? stopIdFilteredMbtaStops.filter(
            (mbtaStop) =>
              isNotNullish(mbtaStop.locationType) &&
              locationTypeFilter.includes(
                mbtaLocationTypeToLocationType(mbtaStop.locationType),
              ),
          )
        : stopIdFilteredMbtaStops;

      return locationTypeFilteredMbtaStops;
    },
    shapes: async (
      { id }: MbtaRoute,
      args,
      { dataSources },
      info,
    ): Promise<MbtaShape[]> => {
      if (!id) return [];
      const fields = getFieldsFromInfo(info);

      return await dataSources.mbtaAPI.getBatchRouteShapes({
        id,
        fields,
      });
    },
  },
};

export default resolvers;
