"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import type { AnalyticsConfig } from "@/lib/analytics/config";
import {
  doNotTrackEnabled,
  isAnalyticsHostname,
  getGoogleTagManagerStatus,
  getStoredAnalyticsConsent,
  pushConsentDefault,
  pushConsentUpdate,
  queueGoogleTagManagerStart,
  setGoogleTagManagerStatus,
  storeAnalyticsConsent,
  getStoredMetaConsent,
  storeMetaConsent,
  loadMetaPixel,
  revokeMetaPixel,
  trackMetaPageView,
  trackAnalyticsPageView,
  type AnalyticsConsent,
} from "@/lib/analytics/client";

const gtmOrigin = "https://www.googletagmanager.com";
const gtmScriptId = "emranlabs-google-tag-manager";

type ConsentView = "banner" | "preferences" | "collapsed";

function loadGoogleTagManager(containerId: string) {
  if (!isAnalyticsHostname(window.location.hostname)) return;
  const status = getGoogleTagManagerStatus();
  if (status === "loading" || status === "loaded") return;

  const existing = document.getElementById(gtmScriptId);
  if (existing) {
    setGoogleTagManagerStatus("loading");
    return;
  }

  queueGoogleTagManagerStart();
  setGoogleTagManagerStatus("loading");

  const script = document.createElement("script");
  script.id = gtmScriptId;
  script.async = true;
  script.src = `${gtmOrigin}/gtm.js?id=${encodeURIComponent(containerId)}`;
  script.onload = () => setGoogleTagManagerStatus("loaded");
  script.onerror = () => setGoogleTagManagerStatus("failed");
  document.head.append(script);
}

export function GoogleTagManagerConsent({
  config,
}: {
  config: AnalyticsConfig;
}) {
  const [hydrated, setHydrated] = useState(false);
  const [consent, setConsent] = useState<AnalyticsConsent | null>(null);
  const [metaConsent, setMetaConsent] = useState<AnalyticsConsent | null>(null);
  const [allowAnalytics, setAllowAnalytics] = useState(false);
  const [allowMeta, setAllowMeta] = useState(false);
  const [view, setView] = useState<ConsentView>("collapsed");
  const [dnt, setDnt] = useState(false);
  const preferencesButtonRef = useRef<HTMLButtonElement>(null);
  const initialized = useRef(false);
  const pathname = usePathname();

  useEffect(() => {
    trackMetaPageView();
    trackAnalyticsPageView();
  }, [pathname]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const storedConsent = getStoredAnalyticsConsent();
      const dntEnabled = doNotTrackEnabled();
      const storedMeta = getStoredMetaConsent();
      setConsent(storedConsent);
      setMetaConsent(storedMeta);
      setAllowAnalytics(!dntEnabled && storedConsent === "granted");
      setAllowMeta(!dntEnabled && storedMeta === "granted");
      setDnt(dntEnabled);
      setView(
        storedConsent && (!config.metaPixelId || storedMeta)
          ? "collapsed"
          : "banner",
      );
      setHydrated(true);

      if (initialized.current) return;
      initialized.current = true;
      pushConsentDefault(dntEnabled ? "denied" : (storedConsent ?? "denied"));
      if (!dntEnabled && storedConsent === "granted") {
        loadGoogleTagManager(config.containerId);
      }
      if (!dntEnabled && storedMeta === "granted")
        loadMetaPixel(config.metaPixelId);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [config.containerId, config.metaPixelId]);

  function focusPreferencesButton() {
    window.setTimeout(() => preferencesButtonRef.current?.focus(), 0);
  }

  function choose(analytics: boolean, meta: boolean) {
    const effectiveConsent = !dnt && analytics ? "granted" : "denied";
    const effectiveMeta =
      !dnt && meta && config.metaPixelId ? "granted" : "denied";
    const unload =
      (consent === "granted" &&
        effectiveConsent === "denied" &&
        getGoogleTagManagerStatus() !== "idle") ||
      (metaConsent === "granted" &&
        effectiveMeta === "denied" &&
        !!document.getElementById("emranlabs-meta-pixel"));
    storeAnalyticsConsent(effectiveConsent);
    storeMetaConsent(effectiveMeta);
    setConsent(effectiveConsent);
    setMetaConsent(effectiveMeta);
    setAllowAnalytics(effectiveConsent === "granted");
    setAllowMeta(effectiveMeta === "granted");
    setView("collapsed");
    pushConsentUpdate(effectiveConsent);
    if (effectiveMeta === "denied") revokeMetaPixel();
    // Reload after withdrawal to discard the previously loaded SDKs entirely.
    if (unload) {
      window.location.reload();
      return;
    }
    if (effectiveConsent === "granted")
      loadGoogleTagManager(config.containerId);
    if (effectiveMeta === "granted") loadMetaPixel(config.metaPixelId);
    focusPreferencesButton();
  }

  if (!hydrated) return null;

  const panelVisible = view === "banner" || view === "preferences";
  const headingId = "analytics-consent-title";

  return (
    <div className="analytics-consent">
      {panelVisible ? (
        <section
          role={view === "banner" ? "region" : "dialog"}
          {...(view === "preferences" ? { "aria-modal": false } : {})}
          aria-labelledby={headingId}
          className="consent-panel"
        >
          <h2 id={headingId} className="consent-heading">
            Privacy preferences
          </h2>
          <p className="mt-2 leading-6">
            Choose what you allow. Essential website features work with either
            choice. Your choices are saved in this browser.
          </p>
          <label className="consent-option">
            <input
              type="checkbox"
              checked={allowAnalytics}
              disabled={dnt}
              onChange={(event) => setAllowAnalytics(event.target.checked)}
            />
            <span>
              <strong>Google Analytics</strong>
              <small>
                Measure visits, public project choices and website performance.
              </small>
            </span>
          </label>
          {config.metaPixelId && (
            <label className="consent-option">
              <input
                type="checkbox"
                checked={allowMeta}
                disabled={dnt}
                onChange={(event) => setAllowMeta(event.target.checked)}
              />
              <span>
                <strong>Meta measurement</strong>
                <small>
                  Use cookies, page addresses, browser/device information and
                  selected actions to measure Facebook and Instagram campaigns.
                </small>
              </span>
            </label>
          )}
          <p>
            Form entries and personal contact details are not sent as event
            parameters.
          </p>
          {dnt && (
            <p className="mt-2 rounded-2xl border border-[rgba(23,227,192,0.22)] bg-[rgba(23,227,192,0.06)] p-3 text-xs leading-5">
              Browser Do Not Track is enabled, so analytics will stay disabled.
            </p>
          )}
          <div className="consent-actions">
            <button
              type="button"
              onClick={() => choose(allowAnalytics, allowMeta)}
              disabled={dnt}
              className="consent-allow"
            >
              Save choices
            </button>
            <button
              type="button"
              onClick={() => choose(false, false)}
              className="consent-decline"
            >
              Decline
            </button>
          </div>
        </section>
      ) : (
        <button
          ref={preferencesButtonRef}
          type="button"
          onClick={() => setView("preferences")}
          className="consent-toggle"
          aria-label={`Privacy preferences, analytics ${dnt ? "disabled by Do Not Track" : (consent ?? "not selected")}, Meta ${metaConsent ?? "not selected"}`}
        >
          Privacy preferences
        </button>
      )}
    </div>
  );
}
