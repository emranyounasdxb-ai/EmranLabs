"use client";

export const analyticsConsentStorageKey = "emranlabs.analytics-consent";

export type AnalyticsConsent = "granted" | "denied";

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

type ConsentModeState = {
  analytics_storage: AnalyticsConsent;
  ad_storage: "denied";
  ad_user_data: "denied";
  ad_personalization: "denied";
};

type DataLayerArguments =
  | ["consent", "default" | "update", ConsentModeState]
  | { "gtm.start": number; event: "gtm.js" }
  | ({ event: AnalyticsEventName } & AnalyticsMetadata);

type AnalyticsWindow = Window & {
  dataLayer?: DataLayerArguments[];
  __emranLabsGtmLoaded?: boolean;
};

export function doNotTrackEnabled() {
  if (typeof navigator === "undefined") return false;
  return navigator.doNotTrack === "1" || navigator.doNotTrack === "yes";
}

export function getStoredAnalyticsConsent(): AnalyticsConsent | null {
  try {
    const value = window.localStorage.getItem(analyticsConsentStorageKey);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
}

export function storeAnalyticsConsent(consent: AnalyticsConsent) {
  try {
    window.localStorage.setItem(analyticsConsentStorageKey, consent);
  } catch {
    // Consent storage failure should not break the desktop UI.
  }
}

export function buildConsentState(
  analyticsStorage: AnalyticsConsent,
): ConsentModeState {
  return {
    analytics_storage: analyticsStorage,
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  };
}

function getDataLayer() {
  const analyticsWindow = window as AnalyticsWindow;
  analyticsWindow.dataLayer = analyticsWindow.dataLayer ?? [];
  return analyticsWindow.dataLayer;
}

export function pushConsentDefault(consent: AnalyticsConsent) {
  try {
    getDataLayer().push(["consent", "default", buildConsentState(consent)]);
  } catch {
    // Consent mode must never affect the portfolio UI.
  }
}

export function pushConsentUpdate(consent: AnalyticsConsent) {
  try {
    getDataLayer().push(["consent", "update", buildConsentState(consent)]);
  } catch {
    // Consent mode must never affect the portfolio UI.
  }
}

export function markGoogleTagManagerLoading() {
  try {
    const analyticsWindow = window as AnalyticsWindow;
    if (analyticsWindow.__emranLabsGtmLoaded) return false;
    analyticsWindow.__emranLabsGtmLoaded = true;
    getDataLayer().push({ "gtm.start": Date.now(), event: "gtm.js" });
    return true;
  } catch {
    return false;
  }
}

export function disableGoogleTagManagerEvents() {
  try {
    (window as AnalyticsWindow).__emranLabsGtmLoaded = false;
  } catch {
    // Analytics must never affect the portfolio UI.
  }
}

export function trackEvent(
  event: AnalyticsEventName,
  metadata?: AnalyticsMetadata,
) {
  try {
    const analyticsWindow = window as AnalyticsWindow;
    if (
      doNotTrackEnabled() ||
      getStoredAnalyticsConsent() !== "granted" ||
      !analyticsWindow.__emranLabsGtmLoaded ||
      !analyticsWindow.dataLayer
    ) {
      return;
    }
    analyticsWindow.dataLayer.push({ event, ...(metadata ?? {}) });
  } catch {
    // Analytics must never affect the portfolio UI.
  }
}
