import * as Sentry from "@sentry/react";

import config from "@/lib/config";

export const setupSentry = () => {
  Sentry.init({
    dsn: config.sentry_dsn,
    integrations: [Sentry.replayIntegration()],
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
};
