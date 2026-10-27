"use client";
import { useReportWebVitals } from "next/web-vitals";
import { trackEvent } from "@/lib/analytics/client";

const report: Parameters<typeof useReportWebVitals>[0] = (metric) => {
  if (!["LCP", "INP", "CLS", "FCP", "TTFB"].includes(metric.name)) return;
  trackEvent("web_vital", {
    metric: metric.name as "LCP" | "INP" | "CLS" | "FCP" | "TTFB",
    value: Math.round(metric.value * 1000) / 1000,
    rating: metric.rating,
  });
};

export function WebVitals() {
  useReportWebVitals(report);
  return null;
}
