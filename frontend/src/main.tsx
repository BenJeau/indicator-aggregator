import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import ReactDOM from "react-dom/client";
import * as Sentry from "@sentry/react";

import "./index.css";

import { queryClient } from "@/api";
import config from "@/lib/config";
import { router } from "@/navigation";

import dayjs from "dayjs";
import LocalizedFormat from "dayjs/plugin/localizedFormat";
import Utc from "dayjs/plugin/utc";

dayjs.extend(LocalizedFormat);
dayjs.extend(Utc);

Sentry.init({
  dsn: config.sentry_dsn,
  integrations: [Sentry.replayIntegration()],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>,
);
