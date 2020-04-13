import { gql } from "apollo-server";

/*
  Sources:
  https://api-v3.mbta.com/docs/swagger/index.html#/shaperesource
*/

export default gql`
  """
  Shape representing the stops to which a particular trip can go. Trips grouped under the same route can have different shapes, and thus different stops.
  """
  type Shape {
    id: String
    """
    Representation of how important a shape is when choosing one for display. Higher number is higher priority. Negative priority is not important enough to show as they only MAY be used.
    """
    priority: Int
    """
    Encoded polyline
    """
    polyline: String
    """
    User-facing name for shape. It may, but is not required to, be a headsign
    """
    name: String
    """
    Indicates the direction of travel for a trip. This field is not used in routing; it provides a way to separate trips by direction when publishing time tables. Valid options are:
    0 - Travel in one direction (e.g. outbound travel).
    1 - Travel in the opposite direction (e.g. inbound travel).
    """
    directionId: Int
  }

  extend type Query {
    shapes(route: String!): [Shape!]!
  }
`;
