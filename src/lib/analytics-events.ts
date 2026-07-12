export const analyticsEventNames = [
  "desktop_app_opened",
  "portfolio_project_viewed",
  "creative_lab_viewed",
  "journey_chapter_viewed",
  "confirmed_contact_channel_clicked",
] as const;

export type AnalyticsEventName = (typeof analyticsEventNames)[number];

export function isAnalyticsEventName(
  value: string,
): value is AnalyticsEventName {
  return analyticsEventNames.includes(value as AnalyticsEventName);
}
