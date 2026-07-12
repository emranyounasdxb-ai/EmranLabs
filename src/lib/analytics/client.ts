"use client";

export const analyticsConsentStorageKey = "emranlabs.analytics-consent";

export type AnalyticsConsent = "granted" | "denied";
export type GoogleTagManagerStatus = "idle" | "loading" | "loaded" | "failed";

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

type GtagConsentArguments = IArguments;
type DataLayerEvent =
  | { "gtm.start": number; event: "gtm.js" }
  | ({ event: AnalyticsEventName } & AnalyticsMetadata);

type AnalyticsWindow = Window & {
  dataLayer?: Array<GtagConsentArguments | DataLayerEvent>;
  __emranLabsGtmStatus?: GoogleTagManagerStatus;
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

function getAnalyticsWindow() {
  return window as AnalyticsWindow;
}

export function getDataLayer() {
  const analyticsWindow = getAnalyticsWindow();
  analyticsWindow.dataLayer = analyticsWindow.dataLayer ?? [];
  return analyticsWindow.dataLayer;
}

function gtagCommand(
  command: "consent",
  action: "default" | "update",
  state: ConsentModeState,
) {
  void command;
  void action;
  void state;
  // Match Google's documented fallback shape: function gtag(){dataLayer.push(arguments);}
  // eslint-disable-next-line prefer-rest-params
  getDataLayer().push(arguments);
}

export function pushConsentDefault(consent: AnalyticsConsent) {
  try {
    gtagCommand("consent", "default", buildConsentState(consent));
  } catch {
    // Consent mode must never affect the portfolio UI.
  }
}

export function pushConsentUpdate(consent: AnalyticsConsent) {
  try {
    gtagCommand("consent", "update", buildConsentState(consent));
  } catch {
    // Consent mode must never affect the portfolio UI.
  }
}

export function getGoogleTagManagerStatus() {
  return getAnalyticsWindow().__emranLabsGtmStatus ?? "idle";
}

export function setGoogleTagManagerStatus(status: GoogleTagManagerStatus) {
  try {
    getAnalyticsWindow().__emranLabsGtmStatus = status;
  } catch {
    // Analytics must never affect the portfolio UI.
  }
}

export function queueGoogleTagManagerStart() {
  try {
    getDataLayer().push({ "gtm.start": Date.now(), event: "gtm.js" });
  } catch {
    // Analytics must never affect the portfolio UI.
  }
}

export function trackEvent(
  event: AnalyticsEventName,
  metadata?: AnalyticsMetadata,
) {
  try {
    const analyticsWindow = getAnalyticsWindow();
    if (
      doNotTrackEnabled() ||
      getStoredAnalyticsConsent() !== "granted" ||
      analyticsWindow.__emranLabsGtmStatus !== "loaded" ||
      !analyticsWindow.dataLayer
    ) {
      return;
    }
    analyticsWindow.dataLayer.push({ event, ...(metadata ?? {}) });
  } catch {
    // Analytics must never affect the portfolio UI.
  }
}
