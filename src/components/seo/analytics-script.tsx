"use client";

import { useEffect } from "react";
import type { AnalyticsConfig } from "@/lib/analytics/config";

function doNotTrackEnabled() {
  return navigator.doNotTrack === "1" || navigator.doNotTrack === "yes";
}

export function AnalyticsScript({ config }: { config: AnalyticsConfig }) {
  useEffect(() => {
    if (doNotTrackEnabled() || document.getElementById("plausible-analytics"))
      return;
    const script = document.createElement("script");
    script.id = "plausible-analytics";
    script.defer = true;
    script.async = true;
    script.src = config.scriptUrl;
    script.dataset.domain = config.domain;
    document.head.append(script);
    return () => script.remove();
  }, [config.domain, config.scriptUrl]);

  return null;
}
