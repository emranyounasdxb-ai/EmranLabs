import "server-only";

import { createHash } from "node:crypto";
import type { ApiErrorCode, ApiErrorResponse } from "@/types/em-ai";

export const jsonHeaders = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
  "x-content-type-options": "nosniff",
};

export function jsonResponse<T>(body: T, init?: ResponseInit) {
  const headers = new Headers(jsonHeaders);
  for (const [key, value] of new Headers(init?.headers))
    headers.set(key, value);
  return Response.json(body, { ...init, headers });
}

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
  const headers = new Headers();
  if (init?.retryAfter) headers.set("Retry-After", String(init.retryAfter));
  return jsonResponse(body, { status, headers });
}

const jsonContentTypePattern =
  /^application\/json\s*(?:;\s*charset\s*=\s*utf-?8\s*)?$/i;

type JsonReadResult =
  { ok: true; value: unknown } | { ok: false; response: Response };

export async function readBoundedJson(
  request: Request,
  requestId: string,
  maxBytes: number,
): Promise<JsonReadResult> {
  const type = request.headers.get("content-type") ?? "";
  if (!jsonContentTypePattern.test(type.trim())) {
    return {
      ok: false,
      response: errorJson(
        "UNSUPPORTED_MEDIA_TYPE",
        "Please send JSON content.",
        requestId,
        415,
      ),
    };
  }

  const lengthHeader = request.headers.get("content-length");
  if (lengthHeader) {
    const length = Number.parseInt(lengthHeader, 10);
    if (!Number.isFinite(length) || length < 0) {
      return {
        ok: false,
        response: errorJson(
          "REQUEST_TOO_LARGE",
          "The request is too large.",
          requestId,
          413,
        ),
      };
    }
    if (length > maxBytes) {
      return {
        ok: false,
        response: errorJson(
          "REQUEST_TOO_LARGE",
          "The request is too large.",
          requestId,
          413,
        ),
      };
    }
  }

  if (!request.body) {
    return {
      ok: false,
      response: errorJson(
        "VALIDATION_ERROR",
        "Please send valid JSON.",
        requestId,
        400,
      ),
    };
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel().catch(() => undefined);
        return {
          ok: false,
          response: errorJson(
            "REQUEST_TOO_LARGE",
            "The request is too large.",
            requestId,
            413,
          ),
        };
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  try {
    const bytes = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    const text = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
    return { ok: true, value: JSON.parse(text) as unknown };
  } catch {
    return {
      ok: false,
      response: errorJson(
        "VALIDATION_ERROR",
        "Please send valid JSON.",
        requestId,
        400,
      ),
    };
  }
}

function configuredPublicOrigin() {
  const value = process.env.NEXT_PUBLIC_SITE_URL;
  if (!value) return null;
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
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

  const originHeader = request.headers.get("origin");
  if (!originHeader) return null;

  let origin: string;
  try {
    origin = new URL(originHeader).origin;
  } catch {
    return errorJson(
      "FORBIDDEN_ORIGIN",
      "This request could not be accepted.",
      requestId,
      403,
    );
  }

  const publicOrigin = configuredPublicOrigin();
  if (process.env.NODE_ENV === "production" && publicOrigin) {
    return origin === publicOrigin
      ? null
      : errorJson(
          "FORBIDDEN_ORIGIN",
          "This request could not be accepted.",
          requestId,
          403,
        );
  }

  const requestOrigin = new URL(request.url).origin;
  const allowed = new Set([requestOrigin]);
  if (publicOrigin) allowed.add(publicOrigin);
  if (
    origin.startsWith("http://localhost") ||
    origin.startsWith("http://127.0.0.1")
  )
    allowed.add(origin);
  return allowed.has(origin)
    ? null
    : errorJson(
        "FORBIDDEN_ORIGIN",
        "This request could not be accepted.",
        requestId,
        403,
      );
}

export function clientKey(request: Request) {
  // cPanel Passenger is expected to set x-real-ip. x-forwarded-for may contain
  // client-controlled chains, so it is only a fallback and the raw value is never logged.
  const source =
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",").at(-1)?.trim() ||
    "local";
  const ua = request.headers.get("user-agent") ?? "unknown";
  return `k${createHash("sha256").update(`${source}:${ua}`).digest("hex").slice(0, 32)}`;
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
