"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Check, ShieldCheck, X } from "lucide-react";
import type { AnalyticsConfig } from "@/lib/analytics/config";
import {
  analyticsConsentStorageKey,
  metaConsentStorageKey,
  linkedInConsentStorageKey,
  doNotTrackEnabled,
  isAnalyticsHostname,
  getGoogleTagManagerStatus,
  getStoredAnalyticsConsent,
  getStoredMetaConsent,
  getStoredLinkedInConsent,
  storeAnalyticsConsent,
  storeMetaConsent,
  storeLinkedInConsent,
  pushConsentDefault,
  pushConsentUpdate,
  queueGoogleTagManagerStart,
  setGoogleTagManagerStatus,
  loadMetaPixel,
  revokeMetaPixel,
  trackMetaPageView,
  trackAnalyticsPageView,
  loadLinkedInInsight,
  revokeLinkedInInsight,
  trackLinkedInPageView,
  clearGoogleAnalyticsCookies,
  suspendTrackingForSession,
  resumeTrackingAfterSavedChoice,
  clarityPreferenceStorageKey,
  clarityConsentStorageKey,
  getStoredClarityConsent,
  storeClarityConsent,
  updateClarityConsent,
  privacyOpenEvent,
  isClarityEnabled,
  storeClarityEnabled,
  loadClarity,
  stopClarity,
} from "@/lib/analytics/client";
import styles from "./tracking-consent.module.css";

type Choices = {
  google: boolean;
  meta: boolean;
  linkedin: boolean;
  clarity: boolean;
};
const declined: Choices = {
  google: false,
  meta: false,
  linkedin: false,
  clarity: false,
};
const consentKeys = [
  analyticsConsentStorageKey,
  metaConsentStorageKey,
  linkedInConsentStorageKey,
  clarityPreferenceStorageKey,
  clarityConsentStorageKey,
];

function loadGoogleTagManager(containerId: string) {
  if (
    !/^GTM-[A-Z0-9]+$/.test(containerId) ||
    doNotTrackEnabled() ||
    getStoredAnalyticsConsent() !== "granted" ||
    !isAnalyticsHostname(window.location.hostname)
  )
    return;
  if (["loading", "loaded"].includes(getGoogleTagManagerStatus())) return;
  if (document.getElementById("emranlabs-google-tag-manager")) return;
  queueGoogleTagManagerStart();
  setGoogleTagManagerStatus("loading");
  const script = document.createElement("script");
  script.id = "emranlabs-google-tag-manager";
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(containerId)}`;
  script.onload = () => setGoogleTagManagerStatus("loaded");
  script.onerror = () => {
    setGoogleTagManagerStatus("failed");
    script.remove();
  };
  document.head.append(script);
}

function startAllowedTags(config: AnalyticsConfig, choices: Choices) {
  if (!config.enabled) return;
  loadClarity(config.clarityProjectId);
  if (choices.google) loadGoogleTagManager(config.containerId);
  if (choices.meta) loadMetaPixel(config.metaPixelId);
  if (choices.linkedin)
    loadLinkedInInsight(
      config.linkedInPartnerId,
      config.linkedInLeadConversionId,
    );
}

export function TrackingConsent({
  config,
  inline = false,
}: {
  config: AnalyticsConfig;
  inline?: boolean;
}) {
  const [hydrated, setHydrated] = useState(false);
  const [open, setOpen] = useState(false);
  const [choices, setChoices] = useState<Choices>(declined);
  const [saved, setSaved] = useState<Choices>(declined);
  const [privacySignal, setPrivacySignal] = useState(false);
  const [storageNotice, setStorageNotice] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const pathname = usePathname();
  const {
    containerId,
    metaPixelId,
    linkedInPartnerId,
    linkedInLeadConversionId,
    clarityProjectId,
    enabled,
  } = config;

  useEffect(() => {
    trackAnalyticsPageView();
    trackMetaPageView();
    trackLinkedInPageView();
  }, [pathname]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const google = getStoredAnalyticsConsent();
      const meta = getStoredMetaConsent();
      const linkedin = getStoredLinkedInConsent();
      const clarity = getStoredClarityConsent();
      const signal = doNotTrackEnabled();
      const next = {
        clarity:
          !!clarityProjectId && isClarityEnabled() && clarity === "granted",
        google: !signal && !!containerId && google === "granted",
        meta: !signal && !!metaPixelId && meta === "granted",
        linkedin: !signal && !!linkedInPartnerId && linkedin === "granted",
      };
      setPrivacySignal(signal);
      setChoices(next);
      setSaved(next);
      // Show once for a new visitor or newly configured vendor. Saved choices
      // keep the desktop clear; Settings can reopen the same right-side card.
      setOpen(
        inline ||
          (!signal &&
            ((!!containerId && !google) ||
              (!!metaPixelId && !meta) ||
              (!!linkedInPartnerId && !linkedin) ||
              (!!clarityProjectId && !clarity))),
      );
      setHydrated(true);
      pushConsentDefault(next.google ? "granted" : "denied");
      startAllowedTags(
        {
          enabled,
          containerId,
          metaPixelId,
          linkedInPartnerId,
          linkedInLeadConversionId,
          clarityProjectId,
        },
        next,
      );
    }, 0);
    function syncConsent(event: StorageEvent) {
      if (event.key === null || consentKeys.includes(event.key)) {
        if (!isClarityEnabled()) stopClarity();
        window.location.reload();
      }
    }
    function openFromSettings(event: Event) {
      const trigger = (event as CustomEvent<HTMLElement>).detail;
      // Safari does not focus buttons on a pointer click; retain the actual opener.
      returnFocusRef.current =
        trigger instanceof HTMLElement
          ? trigger
          : (document.activeElement as HTMLElement | null);
      setOpen(true);
      window.setTimeout(() => headingRef.current?.focus(), 0);
    }
    window.addEventListener("storage", syncConsent);
    window.addEventListener(privacyOpenEvent, openFromSettings);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("storage", syncConsent);
      window.removeEventListener(privacyOpenEvent, openFromSettings);
    };
  }, [
    containerId,
    metaPixelId,
    linkedInPartnerId,
    linkedInLeadConversionId,
    clarityProjectId,
    enabled,
    inline,
  ]);

  function choose(requested: Choices, stopAll = false, enableLimited = false) {
    const blocked = doNotTrackEnabled();
    const next = {
      clarity: !blocked && !!clarityProjectId && requested.clarity,
      google: !blocked && !!containerId && requested.google,
      meta: !blocked && !!metaPixelId && requested.meta,
      linkedin: !blocked && !!linkedInPartnerId && requested.linkedin,
    };
    const unload =
      ((stopAll || blocked || (!next.clarity && saved.clarity)) &&
        !!document.getElementById("emranlabs-clarity")) ||
      (!next.google &&
        !!document.getElementById("emranlabs-google-tag-manager")) ||
      (!next.meta && !!document.getElementById("emranlabs-meta-pixel")) ||
      (!next.linkedin &&
        !!document.getElementById("emranlabs-linkedin-insight"));
    const googleSaved = storeAnalyticsConsent(
      next.google ? "granted" : "denied",
    );
    const metaSaved = storeMetaConsent(next.meta ? "granted" : "denied");
    // An unconfigured vendor is not consented in advance of a future setup.
    const linkedinSaved =
      !linkedInPartnerId ||
      storeLinkedInConsent(next.linkedin ? "granted" : "denied");
    const claritySaved =
      !clarityProjectId ||
      storeClarityConsent(next.clarity ? "granted" : "denied");
    const clarityPreferenceSaved =
      !clarityProjectId ||
      storeClarityEnabled(
        !blocked &&
          !stopAll &&
          (requested.clarity || enableLimited || isClarityEnabled()),
      );
    if (
      !googleSaved ||
      !metaSaved ||
      !linkedinSaved ||
      !claritySaved ||
      !clarityPreferenceSaved
    ) {
      const safeToReload = suspendTrackingForSession();
      pushConsentUpdate("denied");
      revokeMetaPixel();
      revokeLinkedInInsight();
      stopClarity();
      clearGoogleAnalyticsCookies();
      setChoices(declined);
      setSaved(declined);
      setStorageNotice(true);
      setOpen(true);
      if (
        safeToReload &&
        document.querySelector(
          "#emranlabs-google-tag-manager, #emranlabs-meta-pixel, #emranlabs-linkedin-insight, #emranlabs-clarity",
        )
      )
        window.location.reload();
      return;
    }
    resumeTrackingAfterSavedChoice();
    updateClarityConsent();
    pushConsentUpdate(next.google ? "granted" : "denied");
    if (!next.google) clearGoogleAnalyticsCookies();
    if (!next.meta) revokeMetaPixel();
    if (!next.linkedin) revokeLinkedInInsight();
    setPrivacySignal(blocked);
    setChoices(next);
    setSaved(next);
    setStorageNotice(false);
    setOpen(false);
    if (unload) {
      window.location.reload();
      return;
    }
    startAllowedTags(config, next);
    restoreFocus();
  }

  function restoreFocus() {
    window.setTimeout(
      () => (toggleRef.current ?? returnFocusRef.current)?.focus(),
      0,
    );
  }

  function editPreferences() {
    setChoices(saved);
    setOpen(true);
    window.setTimeout(() => headingRef.current?.focus(), 0);
  }

  if (!hydrated || !enabled) return null;
  const services = [
    {
      key: "clarity" as const,
      title: "Microsoft Clarity",
      mark: "C",
      active: !!clarityProjectId,
      detail:
        "Allow analytics cookies to connect page visits, heatmaps and masked recordings. Microsoft advertising sharing stays off.",
    },
    {
      key: "google" as const,
      title: "Google Analytics",
      mark: "G",
      active: !!containerId,
      detail: "Understand visits, popular projects and website performance.",
    },
    {
      key: "meta" as const,
      title: "Meta Pixel",
      mark: "∞",
      active: !!metaPixelId,
      detail:
        "Measure Facebook and Instagram campaigns and selected website actions.",
    },
    {
      key: "linkedin" as const,
      title: "LinkedIn Insight",
      mark: "in",
      active: !!linkedInPartnerId,
      detail:
        "Measure LinkedIn campaigns and learn about professional audiences.",
    },
  ];
  return (
    <div
      className={`${styles.root} ${inline ? styles.inline : styles.positioned}`}
    >
      {open ? (
        <section
          aria-labelledby="tracking-consent-title"
          className={styles.panel}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setChoices(saved);
              setOpen(false);
              restoreFocus();
            }
          }}
        >
          <header className={styles.header}>
            <span className={styles.shield}>
              <ShieldCheck size={22} strokeWidth={1.65} aria-hidden="true" />
            </span>
            <div>
              <span className={styles.eyebrow}>EMRAN LABS · PRIVACY</span>
              <h2 id="tracking-consent-title" ref={headingRef} tabIndex={-1}>
                Privacy preferences
              </h2>
            </div>
            <button
              className={styles.close}
              aria-label="Close privacy preferences"
              onClick={() => {
                setChoices(saved);
                setOpen(false);
                restoreFocus();
              }}
            >
              <X size={17} aria-hidden="true" />
            </button>
          </header>
          <p className={styles.intro}>
            A little insight. Entirely your choice.
          </p>
          <p className={styles.description}>
            Allow measurement to help improve this workspace. Without opt-in,
            Clarity uses limited cookieless measurement; Google and Meta stay
            off. The website works with any choice.
          </p>
          <div className={styles.essential}>
            <span>
              <Check size={15} aria-hidden="true" /> Essential features
            </span>
            <strong>Always on</strong>
          </div>
          <div className={styles.services}>
            {services
              .filter((service) => service.active || inline)
              .map((service) => (
                <label key={service.key} className={styles.service}>
                  <span
                    className={`${styles.vendor} ${styles[service.key]}`}
                    aria-hidden="true"
                  >
                    {service.mark}
                  </span>
                  <span className={styles.serviceCopy}>
                    <strong>{service.title}</strong>
                    <small>{service.detail}</small>
                    {!service.active && <em>Account connection pending</em>}
                  </span>
                  <input
                    type="checkbox"
                    aria-label={service.title}
                    disabled={privacySignal || !service.active}
                    checked={choices[service.key]}
                    onChange={(event) =>
                      setChoices({
                        ...choices,
                        [service.key]: event.target.checked,
                      })
                    }
                  />
                </label>
              ))}
          </div>
          <p className={styles.disclosure}>
            Clarity receives page addresses, device and interaction data,
            including clicks and masked page recordings. Cookie-free does not
            mean no data collection. Other enabled services may use cookies.
            Form text is not included in our event parameters.{" "}
            <a href="/privacy">Read the privacy notice</a>.
          </p>
          {privacySignal && (
            <p role="status" className={styles.notice}>
              Your browser’s Do Not Track or Global Privacy Control signal is
              on. Optional tracking stays off.
            </p>
          )}
          {storageNotice && (
            <p role="status" className={styles.notice}>
              This browser could not save your choice. Optional tracking remains
              off where consent cannot be stored.
            </p>
          )}
          <div className={styles.actions}>
            <button
              onClick={() =>
                choose({
                  google: true,
                  meta: true,
                  linkedin: true,
                  clarity: true,
                })
              }
              disabled={privacySignal}
            >
              Allow all
            </button>
            <button onClick={() => choose(declined, false, true)}>
              Use limited mode
            </button>
          </div>
          <button className={styles.save} onClick={() => choose(choices)}>
            Save choices <span aria-hidden="true">→</span>
          </button>
          <button
            className={styles.save}
            onClick={() => choose(declined, true)}
          >
            Turn off all tracking
          </button>
          <p className={styles.footnote}>
            Change your mind anytime in Privacy preferences.
          </p>
        </section>
      ) : pathname !== "/" || inline ? (
        <button
          ref={toggleRef}
          className={styles.toggle}
          onClick={editPreferences}
          aria-label={`Privacy preferences, Google ${saved.google ? "granted" : "denied"}, Meta ${saved.meta ? "granted" : "denied"}, LinkedIn ${saved.linkedin ? "granted" : "denied"}`}
        >
          <ShieldCheck size={14} aria-hidden="true" /> Privacy preferences
        </button>
      ) : null}
    </div>
  );
}
