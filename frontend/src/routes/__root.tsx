import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { lazy } from "react";

import { Layout } from "@/components/layout";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { statsCountQueryOptions } from "@/api/stats";
import { notificationsQueryOptions } from "@/api/notifications";
import { TooltipProvider } from "@/components/ui/tooltip";

const TanStackRouterDevtools =
  process.env.NODE_ENV === "production"
    ? () => null
    : lazy(() =>
        import("@tanstack/router-devtools").then((res) => ({
          default: res.TanStackRouterDevtools,
        })),
      );

const RootComponent = () => (
  <ThemeProvider defaultTheme="dark" storageKey="indicator-aggretgator-theme">
    <TooltipProvider delayDuration={0}>
      <Layout>
        <Outlet />
      </Layout>
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
      <TanStackRouterDevtools position="bottom-right" />
      <Toaster />
    </TooltipProvider>
  </ThemeProvider>
);

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    component: RootComponent,
    loader: async ({ context: { queryClient } }) =>
      await Promise.all([
        queryClient.ensureQueryData(statsCountQueryOptions),
        queryClient.ensureQueryData(notificationsQueryOptions),
      ]),
  },
);
