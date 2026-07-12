"use client";

import { useEffect, useRef, useState } from "react";
import type { AnalyticsConfig } from "@/lib/analytics/config";
import {
  disableGoogleTagManagerEvents,
  doNotTrackEnabled,
  getStoredAnalyticsConsent,
  markGoogleTagManagerLoading,
  pushConsentDefault,
  pushConsentUpdate,
  storeAnalyticsConsent,
  type AnalyticsConsent,
} from "@/lib/analytics/client";

const gtmOrigin = "https://www.googletagmanager.com";

type ConsentView = "banner" | "preferences" | "collapsed";

function loadGoogleTagManager(containerId: string) {
  if (!markGoogleTagManagerLoading()) return;
  const existing = document.getElementById("emranlabs-google-tag-manager");
  if (existing) return;

  const script = document.createElement("script");
  script.id = "emranlabs-google-tag-manager";
  script.async = true;
  script.src = `${gtmOrigin}/gtm.js?id=${encodeURIComponent(containerId)}`;
  document.head.append(script);
}

function removeGoogleTagManager() {
  document.getElementById("emranlabs-google-tag-manager")?.remove();
  disableGoogleTagManagerEvents();
}

export function GoogleTagManagerConsent({
  config,
}: {
  config: AnalyticsConfig;
}) {
  const [consent, setConsent] = useState<AnalyticsConsent | null>(() =>
    typeof window === "undefined" ? null : getStoredAnalyticsConsent(),
  );
  const [view, setView] = useState<ConsentView>(() =>
    typeof window === "undefined" || getStoredAnalyticsConsent()
      ? "collapsed"
      : "banner",
  );
  const [dnt] = useState(() =>
    typeof navigator === "undefined" ? false : doNotTrackEnabled(),
  );
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    pushConsentDefault(dnt ? "denied" : (consent ?? "denied"));
    if (!dnt && consent === "granted") {
      loadGoogleTagManager(config.containerId);
    }
  }, [config.containerId, consent, dnt]);

  function choose(nextConsent: AnalyticsConsent) {
    storeAnalyticsConsent(nextConsent);
    setConsent(nextConsent);
    setView("collapsed");
    const effectiveConsent = dnt ? "denied" : nextConsent;
    pushConsentUpdate(effectiveConsent);
    if (effectiveConsent === "granted")
      loadGoogleTagManager(config.containerId);
    else removeGoogleTagManager();
  }

  const panelVisible = view === "banner" || view === "preferences";

  return (
    <div className="pointer-events-none fixed right-3 bottom-24 left-3 z-[520] flex justify-center sm:right-5 sm:bottom-24 sm:left-auto sm:justify-end">
      {panelVisible ? (
        <section
          role={view === "banner" ? "region" : "dialog"}
          aria-modal="false"
          aria-labelledby="analytics-consent-title"
          className="pointer-events-auto w-full max-w-md rounded-[1.5rem] border border-[var(--glass-border)] bg-[rgba(11,12,16,0.94)] p-4 text-sm text-[var(--text-secondary)] shadow-[var(--shadow-panel)] backdrop-blur-xl"
        >
          <h2
            id="analytics-consent-title"
            className="font-heading text-base font-semibold text-[var(--text-primary)]"
          >
            Analytics preferences
          </h2>
          <p className="mt-2 leading-6">
            EMRAN LABS can use Google Analytics through Google Tag Manager only
            after you allow analytics. The choice is stored locally in this
            browser. Contact and EM AI message content is never included in
            analytics events.
          </p>
          {dnt && (
            <p className="mt-2 rounded-2xl border border-[rgba(23,227,192,0.22)] bg-[rgba(23,227,192,0.06)] p-3 text-xs leading-5">
              Browser Do Not Track is enabled, so analytics will stay disabled.
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => choose("granted")}
              disabled={dnt}
              className="rounded-full bg-[var(--color-signal)] px-4 py-2 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-50"
            >
              Allow analytics
            </button>
            <button
              type="button"
              onClick={() => choose("denied")}
              className="rounded-full border border-[var(--glass-border)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)]"
            >
              Decline
            </button>
          </div>
        </section>
      ) : (
        <button
          type="button"
          onClick={() => setView("preferences")}
          className="pointer-events-auto rounded-full border border-[var(--glass-border)] bg-[rgba(11,12,16,0.82)] px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] shadow-[var(--shadow-panel)] backdrop-blur-xl transition hover:text-[var(--text-primary)]"
          aria-label={`Analytics preferences, currently ${dnt ? "disabled by Do Not Track" : (consent ?? "not selected")}`}
        >
          Analytics preferences
        </button>
      )}
    </div>
  );
}
