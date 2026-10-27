import "server-only";

export function createRequestId() {
  return crypto.randomUUID();
}

export function logRouteEvent(
  event: string,
  metadata: Record<string, string | number>,
) {
  console.info(`[${event}]`, metadata);
}
