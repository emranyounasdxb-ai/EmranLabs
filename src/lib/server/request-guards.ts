import "server-only";

import type { ApiErrorCode, ApiErrorResponse } from "@/types/em-ai";

export const jsonHeaders = {
  "content-type": "application/json; charset=utf-8",
};

export function errorJson(
  code: ApiErrorCode,
  message: string,
  requestId: string,
  status: number,
  init?: { retryAfter?: number; fieldErrors?: Record<string, string> },
) {
  const body: ApiErrorResponse = {
    ok: false,
    code,
    message,
    requestId,
    ...(init?.retryAfter ? { retryAfter: init.retryAfter } : {}),
    ...(init?.fieldErrors ? { fieldErrors: init.fieldErrors } : {}),
  };
  const headers = new Headers(jsonHeaders);
  if (init?.retryAfter) headers.set("Retry-After", String(init.retryAfter));
  return Response.json(body, { status, headers });
}

export function validateJsonRequest(
  request: Request,
  requestId: string,
  maxLength: number,
) {
  const type = request.headers.get("content-type") ?? "";
  if (!type.toLowerCase().includes("application/json"))
    return errorJson(
      "UNSUPPORTED_MEDIA_TYPE",
      "Please send JSON content.",
      requestId,
      415,
    );
  const length = Number.parseInt(
    request.headers.get("content-length") ?? "0",
    10,
  );
  if (length > maxLength)
    return errorJson(
      "REQUEST_TOO_LARGE",
      "The request is too large.",
      requestId,
      413,
    );
  return null;
}

export function validateSameOrigin(request: Request, requestId: string) {
  const site = request.headers.get("sec-fetch-site");
  if (site && !["same-origin", "same-site", "none"].includes(site))
    return errorJson(
      "FORBIDDEN_ORIGIN",
      "This request could not be accepted.",
      requestId,
      403,
    );
  const origin = request.headers.get("origin");
  if (!origin) return null;
  const expected = new URL(request.url).origin;
  return origin === expected
    ? null
    : errorJson(
        "FORBIDDEN_ORIGIN",
        "This request could not be accepted.",
        requestId,
        403,
      );
}

export function clientKey(request: Request) {
  const source =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "local";
  const ua = request.headers.get("user-agent") ?? "unknown";
  let hash = 2166136261;
  for (const char of `${source}:${ua}`)
    hash = (hash ^ char.charCodeAt(0)) * 16777619;
  return `k${(hash >>> 0).toString(16)}`;
}

export function zodFieldErrors(error: {
  issues: { path: PropertyKey[]; message: string }[];
}) {
  return Object.fromEntries(
    error.issues.map((issue) => [
      String(issue.path[0] ?? "form"),
      issue.message,
    ]),
  );
}
