import { gql } from "apollo-server";

/*
  Sources:
  https://github.com/google/transit/blob/master/gtfs-realtime/spec/en/reference.md
  https://github.com/mbta/api/blob/291096b00907f978a5ad6ecf3b606e307c9707d4/apps/model/lib/model/vehicle.ex
  https://developers.google.com/transit/gtfs/reference
  https://github.com/mbta/gtfs-documentation/blob/master/reference/gtfs.md
*/

export default gql`
  """
  The exact status of the vehicle with respect to the current stop. Ignored if current_stop_sequence is missing.
  """
  enum CurrentStopStatus {
    """
    The vehicle is just about to arrive at the stop (on a stop display, the vehicle symbol typically flashes).
    """
    INCOMING_AT
    """
    The vehicle is standing at the stop.
    """
    STOPPED_AT
    """
    The vehicle has departed the previous stop and is in transit.
    """
    IN_TRANSIT_TO
  }

  """
  Vehicle represents the current status of a vehicle.
  """
  type Vehicle {
    id: ID!
    """
    Time at which vehicle information was last updated.
    """
    updatedAt: String
    """
    Meters per second
    """
    speed: Float
    """
    Latitude of the stop or station. Degrees North, in the WGS-84 coordinate system.
    """
    latitude: Float
    """
    Longitude of the stop or station. Degrees East, in the WGS-84 coordinate system.
    """
    longitude: Float
    """
    User visible label, such as the one on the signage on the vehicle.
    """
    label: String
    """
    Indicates the direction of travel for a trip. This field is not used in routing; it provides a way to separate trips by direction when publishing time tables. Valid options are:
    0 - Travel in one direction (e.g. outbound travel).
    1 - Travel in the opposite direction (e.g. inbound travel).
    """
    directionId: Int
    """
    The stop sequence index of the current stop. The meaning of current_stop_sequence (i.e., the stop that it refers to) is determined by current_status. If current_status is missing IN_TRANSIT_TO is assumed.
    """
    currentStopSequence: Int
    currentStatus: CurrentStopStatus
    """
    in degrees, clockwise from True North, i.e., 0 is North and 90 is East.
    """
    bearing: Int
    """
    The current stop
    """
    stop: Stop
    """
    The route to which the vehicle belongs.
    """
    route: Route
  }

  input VehiclesFilter {
    vehicleIdFilter: [String!]
    labelFilter: [String!]
    routeFilter: [String!]
  }

  extend type Query {
    vehicles(filter: VehiclesFilter): [Vehicle!]!
    vehicle(id: ID!): Vehicle
  }

  extend type Subscription {
    vehicles(route: String!): [Vehicle!]!
    vehicle(id: ID!): Vehicle
  }
`;
