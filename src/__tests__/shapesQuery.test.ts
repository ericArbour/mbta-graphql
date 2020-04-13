import { createTestClient } from "apollo-server-testing";
import { gql } from "apollo-server";

import { constructTestServer } from "../utils/testUtils";
import { mockGet } from "../__mocks__/apollo-datasource-rest";

jest.mock("apollo-datasource-rest");

afterEach(() => {
  mockGet.mockClear();
});

describe("Shapes query", () => {
  const { server } = constructTestServer();
  const { query } = createTestClient(server);

  it("only requests included fields", async () => {
    const GET_SHAPES = gql`
      query GetShapes {
        shapes(route: "ROUTE1") {
          polyline
        }
      }
    `;
    await query({ query: GET_SHAPES });

    expect(mockGet).toBeCalledWith(
      "shapes?fields[shape]=polyline&filter[route]=ROUTE1",
    );
  });

  it("requires a route argument", async () => {
    const GET_SHAPES = gql`
      query GetShapes {
        shapes {
          polyline
        }
      }
    `;
    await query({ query: GET_SHAPES });

    expect(mockGet).not.toBeCalled();
  });
});
