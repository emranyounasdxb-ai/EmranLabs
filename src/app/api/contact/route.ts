import { contactRequestSchema } from "@/lib/validation/contact";
import {
  clientKey,
  errorJson,
  jsonResponse,
  readBoundedJson,
  validateSameOrigin,
  zodFieldErrors,
} from "@/lib/server/request-guards";
import { envInt, SlidingWindowRateLimiter } from "@/lib/server/rate-limit";
import {
  hasContactConfig,
  sendContactInquiry,
} from "@/lib/server/contact-mailer";
import { createRequestId, logRouteEvent } from "@/lib/server/safe-logging";

export const runtime = "nodejs";
const limiter = new SlidingWindowRateLimiter(
  envInt("CONTACT_RATE_LIMIT_MAX", 5, 1, 120),
  envInt(
    "CONTACT_RATE_LIMIT_WINDOW_MS",
    15 * 60 * 1000,
    10_000,
    60 * 60 * 1000,
  ),
);

export async function POST(request: Request) {
  const requestId = createRequestId();
  const started = Date.now();
  const guarded = validateSameOrigin(request, requestId);
  if (guarded) return guarded;
  const limited = limiter.check(clientKey(request));
  if (!limited.allowed)
    return errorJson(
      "RATE_LIMITED",
      "Please wait before sending another inquiry.",
      requestId,
      429,
      { retryAfter: limited.retryAfter },
    );

  const json = await readBoundedJson(request, requestId, 12_000);
  if (!json.ok) return json.response;

  if (
    json.value &&
    typeof json.value === "object" &&
    "website" in json.value &&
    String((json.value as { website?: unknown }).website ?? "").length > 0
  ) {
    return jsonResponse({
      ok: true,
      message: "Thank you. Your inquiry has been received.",
      requestId,
    });
  }
  const parsed = contactRequestSchema.safeParse(json.value);
  if (!parsed.success)
    return errorJson(
      "VALIDATION_ERROR",
      "Please revise the highlighted contact fields.",
      requestId,
      400,
      { fieldErrors: zodFieldErrors(parsed.error) },
    );
  if (!hasContactConfig())
    return errorJson(
      "CONTACT_UNAVAILABLE",
      "The inquiry form is temporarily unavailable. Please use the confirmed professional channels.",
      requestId,
      503,
    );
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  try {
    await sendContactInquiry(parsed.data, controller.signal);
    logRouteEvent("contact", {
      requestId,
      status: "ok",
      durationMs: Date.now() - started,
    });
    return jsonResponse({
      ok: true,
      message: "Thank you. Your inquiry has been received.",
      requestId,
    });
  } catch {
    logRouteEvent("contact", {
      requestId,
      status: "CONTACT_DELIVERY_FAILED",
      durationMs: Date.now() - started,
    });
    return errorJson(
      "CONTACT_DELIVERY_FAILED",
      "The inquiry could not be sent right now. Please try again later or use a confirmed channel.",
      requestId,
      502,
    );
  } finally {
    clearTimeout(timeout);
  }
}
