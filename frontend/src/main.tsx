import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import ReactDOM from "react-dom/client";
import { Loader } from "lucide-react";
import * as Sentry from "@sentry/react";

import "./index.css";

import { routeTree } from "./routeTree.gen";
import { queryClient } from "./api";

import dayjs from "dayjs";
import LocalizedFormat from "dayjs/plugin/localizedFormat";
import Utc from "dayjs/plugin/utc";
import config from "./config";

dayjs.extend(LocalizedFormat);
dayjs.extend(Utc);

Sentry.init({
  dsn: config.sentry_dsn,
  integrations: [Sentry.replayIntegration()],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

export function Spinner({
  show,
  wait,
}: {
  show?: boolean;
  wait?: `delay-${number}`;
}) {
  return (
    <div
      className={`inline-block animate-spin px-3 transition ${
        show ?? true
          ? `opacity-1 duration-500 ${wait ?? "delay-300"}`
          : "duration-500 opacity-0 delay-0"
      }`}
    >
      <Loader />
    </div>
  );
}

// Set up a Router instance
const router = createRouter({
  routeTree,
  defaultPendingComponent: () => (
    <div className={`p-2 text-2xl`}>
      <Spinner />
    </div>
  ),
  context: {
    queryClient,
  },
  defaultPreload: "intent",
  defaultPreloadStaleTime: 0,
});

// Register things for typesafety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>,
);
