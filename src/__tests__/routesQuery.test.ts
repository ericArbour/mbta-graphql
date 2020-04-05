import { createTestClient } from "apollo-server-testing";
import { gql } from "apollo-server";

import { constructTestServer } from "../utils/testUtils";
import { mockGet } from "../__mocks__/apollo-datasource-rest";

jest.mock("apollo-datasource-rest");

afterEach(() => {
  mockGet.mockClear();
});

describe("Routes query", () => {
  const { server } = constructTestServer();
  const { query } = createTestClient(server);

  it("only requests included fields", async () => {
    const GET_ROUTES = gql`
      query GetRoutes {
        routes {
          id
          type
          longName
        }
      }
    `;
    await query({ query: GET_ROUTES });

    expect(mockGet).toBeCalledWith("routes?fields[route]=type,long_name");
  });

  it("allows filtering by route ids", async () => {
    const GET_ROUTES = gql`
      query GetRoutes {
        routes(filter: { routeIdFilter: ["ROUTE1", "ROUTE2"] }) {
          id
        }
      }
    `;
    await query({ query: GET_ROUTES });

    expect(mockGet).toBeCalledWith(
      "routes?fields[route]=&filter[id]=ROUTE1,ROUTE2"
    );
  });

  it("allows filtering by type", async () => {
    const GET_ROUTES = gql`
      query GetRoutes {
        routes(filter: { typeFilter: [SUBWAY] }) {
          id
        }
      }
    `;
    await query({ query: GET_ROUTES });

    expect(mockGet).toBeCalledWith("routes?fields[route]=&filter[type]=1");
  });
});
