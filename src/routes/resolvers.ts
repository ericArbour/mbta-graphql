import { IResolvers } from "graphql-tools";

import { IContext, isNotNullish } from "../types";
import { getFieldsFromInfo } from "../utils/utils";
import { Vehicle, VehiclesResolverArgs } from "../vehicles/types";
import { mbtaVehicleToVehicle } from "../vehicles/resolvers";
import { Stop, NestedStopsResolverArgs } from "../stops/types";
import { mbtaStopToStop } from "../stops/resolvers";

import {
  MbtaRoute,
  Route,
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
    ): Promise<Route[]> => {
      const fields = getFieldsFromInfo(info);
      const mbtaRoutes = await dataSources.mbtaAPI.getRoutes(fields, args);

      return mbtaRoutes.map(mbtaRouteToRoute);
    },
    route: async (parent, args: RouteResolverArgs, { dataSources }, info) => {
      const fields = getFieldsFromInfo(info);
      const mbtaRoute = await dataSources.mbtaAPI.getRoute(fields, args);

      return mbtaRouteToRoute(mbtaRoute);
    }
  },
  Route: {
    vehicles: async (
      { id }: Route,
      args: VehiclesResolverArgs,
      { dataSources },
      info
    ): Promise<Vehicle[]> => {
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

      const vehicles = mbtaVehicles.map(mbtaVehicleToVehicle);

      const vehicleIdFilteredVehicles = vehicleIdFilter
        ? vehicles.filter(
            vehicle =>
              isNotNullish(vehicle.id) && vehicleIdFilter.includes(vehicle.id)
          )
        : vehicles;

      const labelFilteredVehicles = labelFilter
        ? vehicleIdFilteredVehicles.filter(
            vehicle =>
              isNotNullish(vehicle.label) && labelFilter.includes(vehicle.label)
          )
        : vehicleIdFilteredVehicles;

      return labelFilteredVehicles;
    },
    stops: async (
      { id }: Route,
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

export function mbtaRouteToRoute(mbtaRoute: MbtaRoute): Route {
  const { id = null, attributes } = mbtaRoute;

  return {
    id,
    ...attributes
  };
}

export default resolvers;
