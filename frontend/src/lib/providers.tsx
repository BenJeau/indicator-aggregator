import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Provider } from "jotai";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { store } from "@/atoms";
import { queryClient } from "@/lib/query";
import { router } from "@/navigation";

const Providers: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider delayDuration={0}>
      <Provider store={store}>
        <RouterProvider router={router} />
      </Provider>
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
      <Toaster />
    </TooltipProvider>
  </QueryClientProvider>
);

export default Providers;
