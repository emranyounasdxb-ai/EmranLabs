"use client";

import { useEffect, useState } from "react";

const CONSENT_KEY = "emranlabs-analytics-consent";
const CONSENT_EVENT = "emranlabs:analytics-consent-changed";

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

function hasDoNotTrack() {
  return (
    navigator.doNotTrack === "1" ||
    navigator.doNotTrack === "yes" ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).doNotTrack === "1"
  );
}

function pushConsent(consent: "granted" | "denied") {
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({
    event: "consent_update",
    analytics_storage: consent,
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
}

export function ConsentAwareGtm() {
  const [consent, setConsent] = useState<"granted" | "denied" | null>(null);
  const gtmId = process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID?.trim();

  useEffect(() => {
    window.dataLayer = window.dataLayer ?? [];
    pushConsent("denied");
    if (hasDoNotTrack()) {
      queueMicrotask(() => setConsent("denied"));
      return;
    }
    const stored = window.localStorage.getItem(CONSENT_KEY);
    if (stored === "granted" || stored === "denied") {
      queueMicrotask(() => setConsent(stored));
    }
  }, []);

  useEffect(() => {
    if (!gtmId || consent !== "granted" || hasDoNotTrack()) return;
    if (document.querySelector(`script[data-emranlabs-gtm="${gtmId}"]`)) return;
    pushConsent("granted");
    window.dataLayer?.push({ event: "gtm.js", "gtm.start": Date.now() });
    const script = document.createElement("script");
    script.async = true;
    script.dataset.emranlabsGtm = gtmId;
    script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId)}`;
    document.head.appendChild(script);
  }, [consent, gtmId]);

  if (!gtmId || consent) return null;

  const updateConsent = (value: "granted" | "denied") => {
    window.localStorage.setItem(CONSENT_KEY, value);
    pushConsent(value);
    window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value }));
    setConsent(value);
  };

  return (
    <div className="fixed right-4 bottom-4 z-50 max-w-sm rounded-3xl border border-white/15 bg-black/85 p-4 text-sm text-white shadow-2xl backdrop-blur">
      <p className="font-semibold">Privacy-first analytics</p>
      <p className="mt-2 text-white/75">
        EMRAN LABS uses Google Tag Manager only after analytics consent. Do Not
        Track is respected and advertising storage remains denied.
      </p>
      <div className="mt-4 flex gap-2">
        <button
          className="rounded-full bg-white px-4 py-2 font-semibold text-black"
          onClick={() => updateConsent("granted")}
        >
          Accept
        </button>
        <button
          className="rounded-full border border-white/25 px-4 py-2 font-semibold text-white"
          onClick={() => updateConsent("denied")}
        >
          Decline
        </button>
      </div>
    </div>
  );
}
