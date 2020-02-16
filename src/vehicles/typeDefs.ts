import { gql } from "apollo-server";

export default gql`
  enum VehicleCurrentStopStatus {
    """
    The vehicle is just about to arrive at the stop (on a stop
    display, the vehicle symbol typically flashes).
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
    longitude: Float
    latitude: Float
    """
    User visible label, such as the one on the signage on the vehicle.
    """
    label: String
    """
    Indicates the direction of travel for a trip.
    This field is not used in routing; it provides
    a way to separate trips by direction when publishing
    time tables. Valid options are:
    0 - Travel in one direction (e.g. outbound travel).
    1 - Travel in the opposite direction (e.g. inbound travel).
    """
    directionId: Int
    """
    The stop sequence index of the current stop.
    The meaning of current_stop_sequence (i.e.,
    the stop that it refers to) is determined by
    current_status. If current_status is missing
    IN_TRANSIT_TO is assumed.
    """
    currentStopSequence: Int
    """
    The exact status of the vehicle with respect to the current stop.
    Ignored if current_stop_sequence is missing.
    """
    currentStatus: VehicleCurrentStopStatus
    """
    in degrees, clockwise from True North, i.e., 0 is North and
    90 is East.
    """
    bearing: Int
  }

  extend type Query {
    vehicles: [Vehicle]
  }
`;
