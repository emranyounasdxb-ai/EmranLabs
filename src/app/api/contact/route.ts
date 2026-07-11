import { NextResponse } from "next/server";
import { contactRequestSchema } from "@/lib/validation/contact";
import {
  clientKey,
  errorJson,
  validateJsonRequest,
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
  envInt("CONTACT_RATE_LIMIT_MAX", 5),
  envInt("CONTACT_RATE_LIMIT_WINDOW_MS", 15 * 60 * 1000),
);

export async function POST(request: Request) {
  const requestId = createRequestId();
  const started = Date.now();
  const guarded =
    validateSameOrigin(request, requestId) ??
    validateJsonRequest(request, requestId, 12_000);
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
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return errorJson(
      "VALIDATION_ERROR",
      "Please send valid JSON.",
      requestId,
      400,
    );
  }
  if (
    json &&
    typeof json === "object" &&
    "website" in json &&
    String((json as { website?: unknown }).website ?? "").length > 0
  ) {
    return NextResponse.json({
      ok: true,
      message: "Thank you. Your inquiry has been received.",
      requestId,
    });
  }
  const parsed = contactRequestSchema.safeParse(json);
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
    return NextResponse.json({
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
