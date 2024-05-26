import { createRouter } from "@tanstack/react-router";

import { routeTree } from "@/navigation/routeTree.gen";
import { queryClient } from "@/lib/query";

export const router = createRouter({
  routeTree,
  defaultPendingComponent: () => <div />,
  context: {
    queryClient,
  },
  defaultPreload: "intent",
  defaultPreloadStaleTime: 0,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
