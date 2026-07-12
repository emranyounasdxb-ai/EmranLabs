import type { Event, EventHint, TransactionEvent } from "@sentry/nextjs";

const DEFAULT_ENVIRONMENT = "production";
const SENSITIVE_KEY_PATTERN =
  /(authorization|cookie|set-cookie|api[-_]?key|token|secret|password|smtp|openai|message|prompt|response|content|body|email|phone|name)/i;
const SENSITIVE_ROUTE_PATTERN = /\/api\/(contact|em-ai)(?:\/|$)/i;

export function boundedSampleRate(value: string | undefined, fallback = 0) {
  if (!value) return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(1, Math.max(0, parsed));
}

export function getSentryDsn() {
  return process.env.NEXT_PUBLIC_SENTRY_DSN?.trim() || undefined;
}

export function getSentryEnvironment() {
  return process.env.SENTRY_ENVIRONMENT?.trim() || DEFAULT_ENVIRONMENT;
}

function sanitizeObject(value: unknown): unknown {
  if (!value || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(sanitizeObject);

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
      key,
      SENSITIVE_KEY_PATTERN.test(key) ? "[Filtered]" : sanitizeObject(entry),
    ]),
  );
}

function sanitizeUrl(url: string | undefined) {
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    parsed.search = "";
    parsed.hash = "";
    return parsed.toString();
  } catch {
    return url.split("?")[0]?.split("#")[0];
  }
}

function stripSensitiveRequest(event: Event) {
  if (!event.request) return;
  const route = event.request.url ?? "";
  event.request.url = sanitizeUrl(event.request.url);
  delete event.request.query_string;
  delete event.request.cookies;
  delete event.request.data;

  if (event.request.headers) {
    event.request.headers = Object.fromEntries(
      Object.entries(event.request.headers).map(([key, value]) => [
        key,
        SENSITIVE_KEY_PATTERN.test(key) ? "[Filtered]" : value,
      ]),
    );
  }

  if (SENSITIVE_ROUTE_PATTERN.test(route)) {
    event.extra = {
      ...event.extra,
      sensitiveRoutePayload: "[Filtered]",
    };
  }
}

export function sanitizeSentryEvent(event: Event, hint?: EventHint) {
  void hint;
  stripSensitiveRequest(event);
  event.user = undefined;
  event.contexts = sanitizeObject(event.contexts) as Event["contexts"];
  event.extra = sanitizeObject(event.extra) as Event["extra"];
  return event;
}

export function sanitizeSentryTransaction(event: TransactionEvent) {
  stripSensitiveRequest(event);
  event.user = undefined;
  return event;
}
