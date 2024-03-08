/* prettier-ignore-start */

/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file is auto-generated by TanStack Router

// Import Routes

import { Route as rootRoute } from "./routes/__root";
import { Route as RequestImport } from "./routes/request";
import { Route as DocsImport } from "./routes/docs";
import { Route as ConfigImport } from "./routes/config";
import { Route as SourcesRouteImport } from "./routes/sources/route";
import { Route as ProvidersRouteImport } from "./routes/providers/route";
import { Route as ListsRouteImport } from "./routes/lists/route";
import { Route as HistoryRouteImport } from "./routes/history/route";
import { Route as IndexImport } from "./routes/index";
import { Route as SourcesIndexImport } from "./routes/sources/index";
import { Route as ProvidersIndexImport } from "./routes/providers/index";
import { Route as ListsIndexImport } from "./routes/lists/index";
import { Route as HistoryIndexImport } from "./routes/history/index";
import { Route as SourcesNewImport } from "./routes/sources/new";
import { Route as SourcesIdImport } from "./routes/sources/$id";
import { Route as ProvidersNewImport } from "./routes/providers/new";
import { Route as ProvidersIdImport } from "./routes/providers/$id";
import { Route as ListsNewImport } from "./routes/lists/new";
import { Route as ListsIdImport } from "./routes/lists/$id";
import { Route as HistoryIdImport } from "./routes/history/$id";
import { Route as SourcesIdEditImport } from "./routes/sources/$id.edit";
import { Route as ProvidersIdEditImport } from "./routes/providers/$id.edit";
import { Route as ListsIdEditImport } from "./routes/lists/$id.edit";

// Create/Update Routes

const RequestRoute = RequestImport.update({
  path: "/request",
  getParentRoute: () => rootRoute,
} as any);

const DocsRoute = DocsImport.update({
  path: "/docs",
  getParentRoute: () => rootRoute,
} as any);

const ConfigRoute = ConfigImport.update({
  path: "/config",
  getParentRoute: () => rootRoute,
} as any);

const SourcesRouteRoute = SourcesRouteImport.update({
  path: "/sources",
  getParentRoute: () => rootRoute,
} as any);

const ProvidersRouteRoute = ProvidersRouteImport.update({
  path: "/providers",
  getParentRoute: () => rootRoute,
} as any);

const ListsRouteRoute = ListsRouteImport.update({
  path: "/lists",
  getParentRoute: () => rootRoute,
} as any);

const HistoryRouteRoute = HistoryRouteImport.update({
  path: "/history",
  getParentRoute: () => rootRoute,
} as any);

const IndexRoute = IndexImport.update({
  path: "/",
  getParentRoute: () => rootRoute,
} as any);

const SourcesIndexRoute = SourcesIndexImport.update({
  path: "/",
  getParentRoute: () => SourcesRouteRoute,
} as any);

const ProvidersIndexRoute = ProvidersIndexImport.update({
  path: "/",
  getParentRoute: () => ProvidersRouteRoute,
} as any);

const ListsIndexRoute = ListsIndexImport.update({
  path: "/",
  getParentRoute: () => ListsRouteRoute,
} as any);

const HistoryIndexRoute = HistoryIndexImport.update({
  path: "/",
  getParentRoute: () => HistoryRouteRoute,
} as any);

const SourcesNewRoute = SourcesNewImport.update({
  path: "/new",
  getParentRoute: () => SourcesRouteRoute,
} as any);

const SourcesIdRoute = SourcesIdImport.update({
  path: "/$id",
  getParentRoute: () => SourcesRouteRoute,
} as any);

const ProvidersNewRoute = ProvidersNewImport.update({
  path: "/new",
  getParentRoute: () => ProvidersRouteRoute,
} as any);

const ProvidersIdRoute = ProvidersIdImport.update({
  path: "/$id",
  getParentRoute: () => ProvidersRouteRoute,
} as any);

const ListsNewRoute = ListsNewImport.update({
  path: "/new",
  getParentRoute: () => ListsRouteRoute,
} as any);

const ListsIdRoute = ListsIdImport.update({
  path: "/$id",
  getParentRoute: () => ListsRouteRoute,
} as any);

const HistoryIdRoute = HistoryIdImport.update({
  path: "/$id",
  getParentRoute: () => HistoryRouteRoute,
} as any);

const SourcesIdEditRoute = SourcesIdEditImport.update({
  path: "/edit",
  getParentRoute: () => SourcesIdRoute,
} as any);

const ProvidersIdEditRoute = ProvidersIdEditImport.update({
  path: "/edit",
  getParentRoute: () => ProvidersIdRoute,
} as any);

const ListsIdEditRoute = ListsIdEditImport.update({
  path: "/edit",
  getParentRoute: () => ListsIdRoute,
} as any);

// Populate the FileRoutesByPath interface

declare module "@tanstack/react-router" {
  interface FileRoutesByPath {
    "/": {
      preLoaderRoute: typeof IndexImport;
      parentRoute: typeof rootRoute;
    };
    "/history": {
      preLoaderRoute: typeof HistoryRouteImport;
      parentRoute: typeof rootRoute;
    };
    "/lists": {
      preLoaderRoute: typeof ListsRouteImport;
      parentRoute: typeof rootRoute;
    };
    "/providers": {
      preLoaderRoute: typeof ProvidersRouteImport;
      parentRoute: typeof rootRoute;
    };
    "/sources": {
      preLoaderRoute: typeof SourcesRouteImport;
      parentRoute: typeof rootRoute;
    };
    "/config": {
      preLoaderRoute: typeof ConfigImport;
      parentRoute: typeof rootRoute;
    };
    "/docs": {
      preLoaderRoute: typeof DocsImport;
      parentRoute: typeof rootRoute;
    };
    "/request": {
      preLoaderRoute: typeof RequestImport;
      parentRoute: typeof rootRoute;
    };
    "/history/$id": {
      preLoaderRoute: typeof HistoryIdImport;
      parentRoute: typeof HistoryRouteImport;
    };
    "/lists/$id": {
      preLoaderRoute: typeof ListsIdImport;
      parentRoute: typeof ListsRouteImport;
    };
    "/lists/new": {
      preLoaderRoute: typeof ListsNewImport;
      parentRoute: typeof ListsRouteImport;
    };
    "/providers/$id": {
      preLoaderRoute: typeof ProvidersIdImport;
      parentRoute: typeof ProvidersRouteImport;
    };
    "/providers/new": {
      preLoaderRoute: typeof ProvidersNewImport;
      parentRoute: typeof ProvidersRouteImport;
    };
    "/sources/$id": {
      preLoaderRoute: typeof SourcesIdImport;
      parentRoute: typeof SourcesRouteImport;
    };
    "/sources/new": {
      preLoaderRoute: typeof SourcesNewImport;
      parentRoute: typeof SourcesRouteImport;
    };
    "/history/": {
      preLoaderRoute: typeof HistoryIndexImport;
      parentRoute: typeof HistoryRouteImport;
    };
    "/lists/": {
      preLoaderRoute: typeof ListsIndexImport;
      parentRoute: typeof ListsRouteImport;
    };
    "/providers/": {
      preLoaderRoute: typeof ProvidersIndexImport;
      parentRoute: typeof ProvidersRouteImport;
    };
    "/sources/": {
      preLoaderRoute: typeof SourcesIndexImport;
      parentRoute: typeof SourcesRouteImport;
    };
    "/lists/$id/edit": {
      preLoaderRoute: typeof ListsIdEditImport;
      parentRoute: typeof ListsIdImport;
    };
    "/providers/$id/edit": {
      preLoaderRoute: typeof ProvidersIdEditImport;
      parentRoute: typeof ProvidersIdImport;
    };
    "/sources/$id/edit": {
      preLoaderRoute: typeof SourcesIdEditImport;
      parentRoute: typeof SourcesIdImport;
    };
  }
}

// Create and export the route tree

export const routeTree = rootRoute.addChildren([
  IndexRoute,
  HistoryRouteRoute.addChildren([HistoryIdRoute, HistoryIndexRoute]),
  ListsRouteRoute.addChildren([
    ListsIdRoute.addChildren([ListsIdEditRoute]),
    ListsNewRoute,
    ListsIndexRoute,
  ]),
  ProvidersRouteRoute.addChildren([
    ProvidersIdRoute.addChildren([ProvidersIdEditRoute]),
    ProvidersNewRoute,
    ProvidersIndexRoute,
  ]),
  SourcesRouteRoute.addChildren([
    SourcesIdRoute.addChildren([SourcesIdEditRoute]),
    SourcesNewRoute,
    SourcesIndexRoute,
  ]),
  ConfigRoute,
  DocsRoute,
  RequestRoute,
]);

/* prettier-ignore-end */
