// import EventSource from "eventsource";

// const kendallId = "place-knncl";
// const kendallInboundId = "70071";
// const brighamCircleId = "place-brmnl";
// const brighamCircleInboundId = "70250";
// const parkStreetId = "place-pktrm";
// const parkStreetRedOutbound = "70076";
// const parkStreetGreenOutbound = "70199";

// const mbtaAPI = "https://api-v3.mbta.com";

// const url2 = "https://api-v3.mbta.com/predictions/?filter[stop]=place-knncl";
// const eventSourceInitDict = {
//   headers: {
//     Accept: "text/event-stream",
//     "X-API-Key": process.env.MBTA_API_KEY
//   }
// };

// const mbtaEvtSrc = new EventSource(url2, eventSourceInitDict);

// mbtaEvtSrc.onmessage = event => {
//   console.log(event.type);
// };

// mbtaEvtSrc.onerror = err => {
//   console.error("EventSource failed:", err);
// };

// mbtaEvtSrc.addEventListener("reset", (e: MessageEvent) => {
//   console.log("Reset ", e.data);
// });

// mbtaEvtSrc.addEventListener("add", (e: MessageEvent) => {
//   console.log("Add ", e.data);
// });

// mbtaEvtSrc.addEventListener("update", (e: MessageEvent) => {
//   console.log("Update ", e.data);
// });

// mbtaEvtSrc.addEventListener("remove", (e: MessageEvent) => {
//   console.log("Remove ", e.data);
// });
