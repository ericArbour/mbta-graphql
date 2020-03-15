import { IResolvers, FilterToSchema } from "graphql-tools";

import { getFieldsFromInfo } from "../utils/utils";
import {
  IContext,
  isNotNull,
  isNotNullish,
  isRelationshipsWithData,
  isResourceIdentifierObject,
  isResourceIdentifierObjectArray
} from "../types";
import { Route, RoutesResolverArgs } from "../routes/types";
import { mbtaRouteToRoute } from "../routes/resolvers";

import {
  MbtaStop,
  Stop,
  StopsResolverArgs,
  StopResolverArgs,
  NestedStopsResolverArgs
} from "./types";

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
    child_stops: async (
      { child_stops = [] }: Stop,
      args: NestedStopsResolverArgs,
      { dataSources },
      info
    ): Promise<Stop[]> => {
      if (!child_stops.length) return [];

      const fields = getFieldsFromInfo(info);
      const stopIdFilter = args.filter?.stopIdFilter;
      const locationTypeFilter = args.filter?.locationTypeFilter;
      const fieldsWithFilterInfo =
        locationTypeFilter && !fields.includes("location_type")
          ? [...fields, "location_type"]
          : fields;

      const childStopIds = child_stops.map(({ id }) => id).filter(isNotNull);

      const filteredChildStopIds = stopIdFilter
        ? childStopIds.filter(childStopId => stopIdFilter.includes(childStopId))
        : childStopIds;

      const childMbtaStops = await dataSources.mbtaAPI.getBatchChildStops({
        ids: filteredChildStopIds,
        fields: fieldsWithFilterInfo
      });

      const childStops = childMbtaStops.map(mbtaStopToStop);

      const stopIdFilteredChildStops = stopIdFilter
        ? childStops.filter(
            childStop =>
              isNotNullish(childStop.id) && stopIdFilter.includes(childStop.id)
          )
        : childStops;

      const locationTypeFilteredChildStops = locationTypeFilter
        ? stopIdFilteredChildStops.filter(
            childStop =>
              isNotNullish(childStop.location_type) &&
              locationTypeFilter.includes(childStop.location_type)
          )
        : stopIdFilteredChildStops;

      return locationTypeFilteredChildStops;
    },
    parent_station: async (
      parent: Stop,
      args,
      { dataSources },
      info
    ): Promise<Stop | null> => {
      const stopId = parent.parent_station?.id;
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
    ): Promise<Route[]> => {
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

      const routes = mbtaRoutes.map(mbtaRouteToRoute);

      const routeIdFilteredRoutes = routeIdFilter
        ? routes.filter(
            route => isNotNullish(route.id) && routeIdFilter.includes(route.id)
          )
        : routes;

      const typeFilteredRoutes = typeFilter
        ? routeIdFilteredRoutes.filter(
            route => isNotNullish(route.type) && typeFilter.includes(route.type)
          )
        : routeIdFilteredRoutes;

      return typeFilteredRoutes;
    }
  }
};

export function mbtaStopToStop(mbtaStop: MbtaStop): Stop {
  const { id = null, attributes, relationships } = mbtaStop;
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

  return {
    id,
    ...attributes,
    child_stops: childStops,
    parent_station: parentStation
  };
}

export default resolvers;
