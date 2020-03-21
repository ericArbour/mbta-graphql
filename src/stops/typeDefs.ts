import { gql } from "apollo-server";

/*
  Sources:
  https://github.com/mbta/api/blob/ae01a349968f9ee8c3e467ab3b52656c23c41a47/apps/model/lib/model/stop.ex
  https://api-v3.mbta.com/docs/swagger/index.html#/
*/

export default gql`
  enum LocationType {
    """
    A location where passengers board or disembark from a transit vehicle. Is called a platform when defined within a parent_station. Location type in mbta api v3:  0 (or blank).
    """
    STOP
    """
    A physical structure or area that contains one or more platform. Location type in mbta api v3:  1.
    """
    STATION
    """
    A location where passengers can enter or exit a station from the street. If an entrance/exit belongs to multiple stations, it can be linked by pathways to both, but the data provider must pick one of them as parent. Location type in mbta api v3:  2.
    """
    ENTRANCE_OR_EXIT
    """
    A location within a station, not matching any other location_type, which can be used to link together pathways define in pathways.txt. Location type in mbta api v3:  3.
    """
    GENERIC_NODE
    """
    A specific location on a platform, where passengers can board and/or alight vehicles. Location type in mbta api v3:  4.
    """
    BOARDING_AREA
  }

  """
  Stop represents a physical location where the transit system can pick up or drop off passengers.
  """
  type Stop {
    id: ID!
    """
    Indicates whether wheelchair boardings are possible from the location. Valid options are:
    For parentless stops:
    0 or empty - No accessibility information for the stop.
    1 - Some vehicles at this stop can be boarded by a rider in a wheelchair.
    2 - Wheelchair boarding is not possible at this stop.
    For child stops:
    0 or empty - Stop will inherit its wheelchair_boarding behavior from the parent station, if specified in the parent.
    1 - There exists some accessible path from outside the station to the specific stop/platform.
    2 - There exists no accessible path from outside the station to the specific stop/platform.
    For station entrances/exits:
    0 or empty - Station entrance will inherit its wheelchair_boarding behavior from the parent station, if specified for the parent.
    1 - Station entrance is wheelchair accessible.
    2 - No accessible path from station entrance to stops/platforms.
    """
    wheelchairBoarding: Int
    """
    The type of transportation used at the stop.
    """
    vehicleType: RouteType
    """
    A textual description of the platform or track.
    example: Red Line
    """
    platformName: String
    """
    A short code representing the platform/track (like a number or letter).
    example: 5
    """
    platformCode: String
    """
    The street on which the stop is located.
    """
    onStreet: String
    """
    ame of a stop or station in the local and tourist vernacular.
    """
    name: String
    """
    The municipality in which the stop is located.
    """
    municipality: String
    """
    Latitude of the stop or station. Degrees North, in the WGS-84 coordinate system.
    """
    latitude: Float
    """
    Longitude of the stop or station. Degrees East, in the WGS-84 coordinate system.
    """
    longitude: Float
    """
    Type of the location.
    """
    locationType: LocationType
    """
    Description of the stop.
    example: Alewife - Red Line
    """
    description: String
    """
    The cross street at which the stop is located.
    """
    atStreet: String
    """
    A street address for the station.
    """
    address: String
    """
    For stops location within stations, the parent_station's stop_id represents the whole facility and the child stop represents a specific boarding area, entrance, or generic node.
    All subway, Commuter Rail, and CapeFLYER stops have a parent station, as do some bus and Silver Line facilities, such as Dudley.
    """
    parentStation: Stop
    """
    See parent_station.
    """
    childStops(filter: NestedStopsFilter): [Stop!]!
    """
    The routes the stop belongs to.
    """
    routes(filter: RoutesFilter): [Route!]!
  }

  input LocationFilterInput {
    latitude: Float!
    longitude: Float!
    """
    The distance is in degrees as if latitude and longitude were on a flat 2D plane and normal Pythagorean distance was calculated. Over the region MBTA serves, 0.02 degrees is approximately 1 mile.
    """
    radius: Float!
  }

  input StopsFilter {
    stopIdFilter: [String!]
    locationTypeFilter: [LocationType!]
    locationFilter: LocationFilterInput
  }

  input NestedStopsFilter {
    stopIdFilter: [String!]
    locationTypeFilter: [LocationType!]
  }

  extend type Query {
    stops(filter: StopsFilter): [Stop!]!
    stop(id: ID!): Stop
  }
`;
