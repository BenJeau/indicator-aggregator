import { createRouter } from "@tanstack/react-router";

import { routeTree } from "@/navigation/routeTree.gen";
import { queryClient } from "@/lib/query";
import { NotFound } from "@/components";

export const router = createRouter({
  routeTree,
  defaultPendingComponent: () => <div />,
  context: {
    queryClient,
  },
  defaultPreload: "intent",
  defaultPreloadStaleTime: 0,
  defaultNotFoundComponent: () => <NotFound />,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
