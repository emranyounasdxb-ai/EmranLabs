export type EmAiRole = "user" | "assistant";

export type EmAiMessage = {
  id?: string;
  role: EmAiRole;
  content: string;
};

export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "UNSUPPORTED_MEDIA_TYPE"
  | "REQUEST_TOO_LARGE"
  | "FORBIDDEN_ORIGIN"
  | "RATE_LIMITED"
  | "AI_UNAVAILABLE"
  | "AI_BLOCKED"
  | "AI_TIMEOUT"
  | "CONTACT_UNAVAILABLE"
  | "CONTACT_DELIVERY_FAILED"
  | "INTERNAL_ERROR";

export type ApiErrorResponse = {
  ok: false;
  code: ApiErrorCode;
  message: string;
  requestId: string;
  retryAfter?: number;
  fieldErrors?: Record<string, string>;
};

export type EmAiSuccessResponse = {
  ok: true;
  message: EmAiMessage;
  requestId: string;
};

export type EmAiResponse = EmAiSuccessResponse | ApiErrorResponse;
