"use client";

export type AnalyticsEventName =
  | "application_opened"
  | "project_detail_opened"
  | "command_center_opened"
  | "contact_form_submitted"
  | "em_ai_opened";

type AnalyticsMetadata = {
  app?:
    | "about"
    | "skills"
    | "portfolio"
    | "creative-labs"
    | "journey"
    | "contact"
    | "em-ai";
  project?: "edrive" | "aliyas360" | "inaya-domestic";
};

type PlausibleWindow = Window & {
  plausible?: (
    event: AnalyticsEventName,
    options?: { props?: AnalyticsMetadata },
  ) => void;
};

export function trackEvent(
  event: AnalyticsEventName,
  metadata?: AnalyticsMetadata,
) {
  try {
    const plausible = (window as PlausibleWindow).plausible;
    if (typeof plausible !== "function") return;
    plausible(event, metadata ? { props: metadata } : undefined);
  } catch {
    // Analytics must never affect the portfolio UI.
  }
}
