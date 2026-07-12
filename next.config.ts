import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.EMRANLABS_DIST_DIR?.trim() || ".next",
};

const hasSentrySourceMapConfig = Boolean(
  process.env.SENTRY_ORG?.trim() &&
  process.env.SENTRY_PROJECT?.trim() &&
  process.env.SENTRY_AUTH_TOKEN?.trim(),
);

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: true,
  disableLogger: true,
  sourcemaps: {
    disable: !hasSentrySourceMapConfig,
    deleteSourcemapsAfterUpload: true,
  },
});
