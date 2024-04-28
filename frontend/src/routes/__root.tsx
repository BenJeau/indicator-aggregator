import { createRootRouteWithContext } from "@tanstack/react-router";
import { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { lazy } from "react";
import { Provider } from "jotai";

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Error, Layouts } from "@/components";
import { store } from "@/atoms";

const TanStackRouterDevtools =
  process.env.NODE_ENV === "production"
    ? () => null
    : lazy(() =>
        import("@tanstack/router-devtools").then((res) => ({
          default: res.TanStackRouterDevtools,
        })),
      );

const RootComponent: React.FC = () => (
  <TooltipProvider delayDuration={0}>
    <Provider store={store}>
      <Layouts.default />
    </Provider>
    <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
    <TanStackRouterDevtools position="bottom-right" />
    <Toaster />
  </TooltipProvider>
);

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    component: RootComponent,
    errorComponent: ({ error, info }) => <Error error={error} info={info} />,
  },
);
