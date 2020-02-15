import { ApolloServer, gql } from "apollo-server";
import EventSource from "eventsource";
import dotenv from "dotenv";

dotenv.config();

const kendallId = "place-knncl";
const kendallInboundId = "70071";
const brighamCircleId = "place-brmnl";
const brighamCircleInboundId = "70250";
const parkStreetId = "place-pktrm";
const parkStreetRedOutbound = "70076";
const parkStreetGreenOutbound = "70199";

const url2 = "https://api-v3.mbta.com/predictions/?filter[stop]=place-knncl";
const eventSourceInitDict = {
  headers: {
    Accept: "text/event-stream",
    "X-API-Key": process.env.MBTA_API_KEY
  }
};

const mbtaEvtSrc = new EventSource(url2, eventSourceInitDict);

mbtaEvtSrc.onmessage = event => {
  console.log(event.type);
};

mbtaEvtSrc.onerror = err => {
  console.error("EventSource failed:", err);
};

mbtaEvtSrc.addEventListener("reset", (e: MessageEvent) => {
  console.log("Reset ", e.data);
});

mbtaEvtSrc.addEventListener("add", (e: MessageEvent) => {
  console.log("Add ", e.data);
});

mbtaEvtSrc.addEventListener("update", (e: MessageEvent) => {
  console.log("Update ", e.data);
});

mbtaEvtSrc.addEventListener("remove", (e: MessageEvent) => {
  console.log("Remove ", e.data);
});

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = gql`
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  # This "Book" type defines the queryable fields for every book in our data source.
  type Book {
    title: String
    author: String
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {
    books: [Book]
  }
`;

const books = [
  {
    title: "Harry Potter and the Chamber of Secrets",
    author: "J.K. Rowling"
  },
  {
    title: "Jurassic Park",
    author: "Michael Crichton"
  }
];

// Resolvers define the technique for fetching the types defined in the
// schema. This resolver retrieves books from the "books" array above.
const resolvers = {
  Query: {
    books: () => {
      console.log("hello");
      return books;
    }
  }
};

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({ typeDefs, resolvers });

// The `listen` method launches a web server.
server.listen(4000).then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
