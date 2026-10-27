import { emAiRequestSchema } from "@/lib/validation/em-ai";
import {
  clientKey,
  errorJson,
  jsonResponse,
  readBoundedJson,
  validateSameOrigin,
  zodFieldErrors,
} from "@/lib/server/request-guards";
import { envInt, SlidingWindowRateLimiter } from "@/lib/server/rate-limit";
import { createRequestId, logRouteEvent } from "@/lib/server/safe-logging";
import {
  generatePortfolioAnswer,
  hasOpenAiConfig,
  moderateText,
} from "@/lib/server/openai-client";

export const runtime = "nodejs";
const limiter = new SlidingWindowRateLimiter(
  envInt("AI_RATE_LIMIT_MAX", 12, 1, 120),
  envInt("AI_RATE_LIMIT_WINDOW_MS", 10 * 60 * 1000, 10_000, 60 * 60 * 1000),
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
      "Please wait before trying again.",
      requestId,
      429,
      { retryAfter: limited.retryAfter },
    );

  const json = await readBoundedJson(request, requestId, 16_000);
  if (!json.ok) return json.response;

  const parsed = emAiRequestSchema.safeParse(json.value);
  if (!parsed.success)
    return errorJson(
      "VALIDATION_ERROR",
      "Please revise the highlighted request fields.",
      requestId,
      400,
      { fieldErrors: zodFieldErrors(parsed.error) },
    );
  if (!hasOpenAiConfig())
    return errorJson(
      "AI_UNAVAILABLE",
      "EM AI is temporarily unavailable. Please use the Contact application for professional inquiries.",
      requestId,
      503,
    );
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 18_000);
  try {
    const latest = parsed.data.messages.at(-1)!.content;
    if (await moderateText(latest, controller.signal))
      return errorJson(
        "AI_BLOCKED",
        "I cannot help with that request. Please keep questions focused on the EMRAN LABS portfolio.",
        requestId,
        400,
      );
    const answer = await generatePortfolioAnswer(
      parsed.data,
      controller.signal,
    );
    if (!answer || (await moderateText(answer, controller.signal)))
      return errorJson(
        "AI_BLOCKED",
        "I cannot provide a safe response to that request.",
        requestId,
        400,
      );
    logRouteEvent("em-ai", {
      requestId,
      status: "ok",
      durationMs: Date.now() - started,
    });
    return jsonResponse({
      ok: true,
      message: { role: "assistant", content: answer },
      requestId,
    });
  } catch {
    const code = controller.signal.aborted ? "AI_TIMEOUT" : "INTERNAL_ERROR";
    logRouteEvent("em-ai", {
      requestId,
      status: code,
      durationMs: Date.now() - started,
    });
    return errorJson(
      code,
      "EM AI could not complete the request. Please try again later.",
      requestId,
      code === "AI_TIMEOUT" ? 504 : 500,
    );
  } finally {
    clearTimeout(timeout);
  }
}
