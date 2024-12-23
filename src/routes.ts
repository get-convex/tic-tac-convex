import { createRouter, defineRoute, param } from "type-route";

export const { RouteProvider, useRoute, routes } = createRouter({
  auth: defineRoute("/"),
  gameList: defineRoute("/games"),
  gameBoard: defineRoute(
    { gameId: param.path.string },
    (p) => `/games/${p.gameId}`
  ),
});
