import { gql } from "apollo-server";

/*
  Sources:
  https://api-v3.mbta.com/docs/swagger/index.html
  https://github.com/mbta/api/blob/291096b00907f978a5ad6ecf3b606e307c9707d4/apps/model/lib/model/route.ex
  https://github.com/google/transit/blob/master/gtfs/spec/en/reference.md#routestxt
*/

export default gql`
  """
  Vehicle represents the current status of a vehicle.
  """
  type Route {
    id: ID!
    """
    0: Light Rail - Any light rail or street level system within a metropolitan area.
    1: Subway _ Any underground rail system within a metropolitan area.
    2: Rail - Used for intercity or long-distance travel.
    3: Bus - Used for short- and long-distance bus routes.
    4: Ferry - Used for short- and long-distance boat service.
    """
    type: Int
    """
    A legible color to use for text drawn against a background of the route’s color attribute.
    example: 000000
    """
    text_color: String
    """
    Routes sort in ascending order
    """
    sort_order: Int
    """
    This will often be a short, abstract identifier like "32", "100X", or “Green” that riders use to identify a route, but which doesn’t give any indication of what places the route serves.
    example: Red
    """
    short_name: String
    """
    The full name of a route. This name is generally more descriptive than the short_name and will often include the route’s destination or stop.
    example: Red Line
    """
    long_name: String
    """
    Specifies the fare type of the route, which can differ from the service category.
    example: Free
    """
    fare_class: String
    """
    The names of direction ids for this route in ascending ordering starting at 0 for the first index.
    """
    direction_names: [String]
    """
    The destinations for direction ids for this route in ascending ordering starting at 0 for the first index.
    """
    direction_destinations: [String]
    """
    Details about stops, schedule, and/or service.
    example: Rapid Transit
    """
    description: String
    """
    A color that corresponds to the route, such as the line color on a map.
    example: FFFFFF
    """
    color: String
    """
    The list of vehicles assigned to the route.
    """
    vehicles: [Vehicle!]!
  }

  input RoutesFilter {
    routeIdFilter: [String!]
    typeFilter: [Int!]
  }

  extend type Query {
    routes(filter: RoutesFilter): [Route!]!
    route(id: ID!): Route
  }
`;
