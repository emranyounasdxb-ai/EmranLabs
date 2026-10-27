"use client";

import { usePathname } from "next/navigation";
import type { AnalyticsConfig } from "@/lib/analytics/config";
import { TrackingConsent } from "./tracking-consent";

/** First-visit choices and an on-demand privacy panel share the same controller. */
export function GoogleTagManagerConsent({
  config,
}: {
  config: AnalyticsConfig;
}) {
  const pathname = usePathname();
  if (pathname === "/preview/privacy") return null;
  return <TrackingConsent config={config} />;
}
