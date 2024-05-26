import { createRootRouteWithContext } from "@tanstack/react-router";
import { QueryClient } from "@tanstack/react-query";
import { lazy } from "react";

import { Error, Layouts } from "@/components";

const TanStackRouterDevtools =
  process.env.NODE_ENV === "production"
    ? () => null
    : lazy(() =>
        import("@tanstack/router-devtools").then((res) => ({
          default: res.TanStackRouterDevtools,
        })),
      );

const RouteComponent = () => (
  <>
    <Layouts.default />
    <TanStackRouterDevtools position="bottom-right" />
  </>
);

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    component: RouteComponent,
    errorComponent: ({ error, info }) => <Error error={error} info={info} />,
  },
);
