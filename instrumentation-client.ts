import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 0,
    // RGPD: don't auto-capture IPs, headers, request bodies. Override per-event
    // via beforeSend if specific data is needed.
    sendDefaultPii: false,
    enableLogs: true,

    // Session Replay: 0% of normal sessions, 100% of sessions with errors.
    // Inputs and text are masked by default — no extra config needed.
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0,

    integrations: [Sentry.replayIntegration()],
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
