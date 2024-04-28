/* prettier-ignore-start */

/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file is auto-generated by TanStack Router

// Import Routes

import { Route as rootRoute } from "./routes/__root";
import { Route as RequestImport } from "./routes/request";
import { Route as LogoutImport } from "./routes/logout";
import { Route as LoginImport } from "./routes/login";
import { Route as DocsImport } from "./routes/docs";
import { Route as ConfigImport } from "./routes/config";
import { Route as AuthImport } from "./routes/auth";
import { Route as UsersRouteImport } from "./routes/users/route";
import { Route as SourcesRouteImport } from "./routes/sources/route";
import { Route as ProvidersRouteImport } from "./routes/providers/route";
import { Route as ListsRouteImport } from "./routes/lists/route";
import { Route as HistoryRouteImport } from "./routes/history/route";
import { Route as IndexImport } from "./routes/index";
import { Route as UsersIndexImport } from "./routes/users/index";
import { Route as SourcesIndexImport } from "./routes/sources/index";
import { Route as ProvidersIndexImport } from "./routes/providers/index";
import { Route as ListsIndexImport } from "./routes/lists/index";
import { Route as HistoryIndexImport } from "./routes/history/index";
import { Route as UsersIdImport } from "./routes/users/$id";
import { Route as SourcesNewImport } from "./routes/sources/new";
import { Route as SourcesSlugImport } from "./routes/sources/$slug";
import { Route as ProvidersNewImport } from "./routes/providers/new";
import { Route as ProvidersSlugImport } from "./routes/providers/$slug";
import { Route as ListsNewImport } from "./routes/lists/new";
import { Route as ListsSlugImport } from "./routes/lists/$slug";
import { Route as HistoryIdImport } from "./routes/history/$id";
import { Route as UsersIdEditImport } from "./routes/users/$id.edit";
import { Route as SourcesSlugEditImport } from "./routes/sources/$slug.edit";
import { Route as ProvidersSlugEditImport } from "./routes/providers/$slug.edit";
import { Route as ListsSlugEditImport } from "./routes/lists/$slug.edit";

// Create/Update Routes

const RequestRoute = RequestImport.update({
  path: "/request",
  getParentRoute: () => rootRoute,
} as any);

const LogoutRoute = LogoutImport.update({
  path: "/logout",
  getParentRoute: () => rootRoute,
} as any);

const LoginRoute = LoginImport.update({
  path: "/login",
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

const AuthRoute = AuthImport.update({
  path: "/auth",
  getParentRoute: () => rootRoute,
} as any);

const UsersRouteRoute = UsersRouteImport.update({
  path: "/users",
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

const UsersIndexRoute = UsersIndexImport.update({
  path: "/",
  getParentRoute: () => UsersRouteRoute,
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

const UsersIdRoute = UsersIdImport.update({
  path: "/$id",
  getParentRoute: () => UsersRouteRoute,
} as any);

const SourcesNewRoute = SourcesNewImport.update({
  path: "/new",
  getParentRoute: () => SourcesRouteRoute,
} as any);

const SourcesSlugRoute = SourcesSlugImport.update({
  path: "/$slug",
  getParentRoute: () => SourcesRouteRoute,
} as any);

const ProvidersNewRoute = ProvidersNewImport.update({
  path: "/new",
  getParentRoute: () => ProvidersRouteRoute,
} as any);

const ProvidersSlugRoute = ProvidersSlugImport.update({
  path: "/$slug",
  getParentRoute: () => ProvidersRouteRoute,
} as any);

const ListsNewRoute = ListsNewImport.update({
  path: "/new",
  getParentRoute: () => ListsRouteRoute,
} as any);

const ListsSlugRoute = ListsSlugImport.update({
  path: "/$slug",
  getParentRoute: () => ListsRouteRoute,
} as any);

const HistoryIdRoute = HistoryIdImport.update({
  path: "/$id",
  getParentRoute: () => HistoryRouteRoute,
} as any);

const UsersIdEditRoute = UsersIdEditImport.update({
  path: "/edit",
  getParentRoute: () => UsersIdRoute,
} as any);

const SourcesSlugEditRoute = SourcesSlugEditImport.update({
  path: "/edit",
  getParentRoute: () => SourcesSlugRoute,
} as any);

const ProvidersSlugEditRoute = ProvidersSlugEditImport.update({
  path: "/edit",
  getParentRoute: () => ProvidersSlugRoute,
} as any);

const ListsSlugEditRoute = ListsSlugEditImport.update({
  path: "/edit",
  getParentRoute: () => ListsSlugRoute,
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
    "/users": {
      preLoaderRoute: typeof UsersRouteImport;
      parentRoute: typeof rootRoute;
    };
    "/auth": {
      preLoaderRoute: typeof AuthImport;
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
    "/login": {
      preLoaderRoute: typeof LoginImport;
      parentRoute: typeof rootRoute;
    };
    "/logout": {
      preLoaderRoute: typeof LogoutImport;
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
    "/lists/$slug": {
      preLoaderRoute: typeof ListsSlugImport;
      parentRoute: typeof ListsRouteImport;
    };
    "/lists/new": {
      preLoaderRoute: typeof ListsNewImport;
      parentRoute: typeof ListsRouteImport;
    };
    "/providers/$slug": {
      preLoaderRoute: typeof ProvidersSlugImport;
      parentRoute: typeof ProvidersRouteImport;
    };
    "/providers/new": {
      preLoaderRoute: typeof ProvidersNewImport;
      parentRoute: typeof ProvidersRouteImport;
    };
    "/sources/$slug": {
      preLoaderRoute: typeof SourcesSlugImport;
      parentRoute: typeof SourcesRouteImport;
    };
    "/sources/new": {
      preLoaderRoute: typeof SourcesNewImport;
      parentRoute: typeof SourcesRouteImport;
    };
    "/users/$id": {
      preLoaderRoute: typeof UsersIdImport;
      parentRoute: typeof UsersRouteImport;
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
    "/users/": {
      preLoaderRoute: typeof UsersIndexImport;
      parentRoute: typeof UsersRouteImport;
    };
    "/lists/$slug/edit": {
      preLoaderRoute: typeof ListsSlugEditImport;
      parentRoute: typeof ListsSlugImport;
    };
    "/providers/$slug/edit": {
      preLoaderRoute: typeof ProvidersSlugEditImport;
      parentRoute: typeof ProvidersSlugImport;
    };
    "/sources/$slug/edit": {
      preLoaderRoute: typeof SourcesSlugEditImport;
      parentRoute: typeof SourcesSlugImport;
    };
    "/users/$id/edit": {
      preLoaderRoute: typeof UsersIdEditImport;
      parentRoute: typeof UsersIdImport;
    };
  }
}

// Create and export the route tree

export const routeTree = rootRoute.addChildren([
  IndexRoute,
  HistoryRouteRoute.addChildren([HistoryIdRoute, HistoryIndexRoute]),
  ListsRouteRoute.addChildren([
    ListsSlugRoute.addChildren([ListsSlugEditRoute]),
    ListsNewRoute,
    ListsIndexRoute,
  ]),
  ProvidersRouteRoute.addChildren([
    ProvidersSlugRoute.addChildren([ProvidersSlugEditRoute]),
    ProvidersNewRoute,
    ProvidersIndexRoute,
  ]),
  SourcesRouteRoute.addChildren([
    SourcesSlugRoute.addChildren([SourcesSlugEditRoute]),
    SourcesNewRoute,
    SourcesIndexRoute,
  ]),
  UsersRouteRoute.addChildren([
    UsersIdRoute.addChildren([UsersIdEditRoute]),
    UsersIndexRoute,
  ]),
  AuthRoute,
  ConfigRoute,
  DocsRoute,
  LoginRoute,
  LogoutRoute,
  RequestRoute,
]);

/* prettier-ignore-end */
