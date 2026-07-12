import * as Sentry from "@sentry/nextjs";
import {
  boundedSampleRate,
  getSentryDsn,
  getSentryEnvironment,
  sanitizeSentryEvent,
  sanitizeSentryTransaction,
} from "@/lib/observability/sentry";

const dsn = getSentryDsn();

if (dsn) {
  Sentry.init({
    dsn,
    environment: getSentryEnvironment(),
    sendDefaultPii: false,
    tracesSampleRate: boundedSampleRate(
      process.env.SENTRY_TRACES_SAMPLE_RATE,
      0,
    ),
    replaysSessionSampleRate: boundedSampleRate(
      process.env.SENTRY_REPLAYS_SESSION_SAMPLE_RATE,
      0,
    ),
    replaysOnErrorSampleRate: boundedSampleRate(
      process.env.SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE,
      0,
    ),
    beforeSend: sanitizeSentryEvent,
    beforeSendTransaction: sanitizeSentryTransaction,
  });
}
