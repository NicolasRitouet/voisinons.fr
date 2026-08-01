import * as Sentry from "@sentry/nextjs";

const dsn = process.env.SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 0,
    sendDefaultPii: false,
    enableLogs: true,
    // Off on purpose: server frames hold adminToken, editToken and participant
    // PII, which would ship to Sentry despite sendDefaultPii: false.
    includeLocalVariables: false,
    ignoreErrors: ["NEXT_NOT_FOUND", "NEXT_REDIRECT"],
  });
}
