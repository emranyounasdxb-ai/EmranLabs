"use client";

export const analyticsConsentStorageKey = "emranlabs.analytics-consent";
export const metaConsentStorageKey = "emranlabs.meta-consent";

export type AnalyticsConsent = "granted" | "denied";
export type GoogleTagManagerStatus = "idle" | "loading" | "loaded" | "failed";

export type AnalyticsEventName =
  | "page_view"
  | "application_opened"
  | "project_detail_opened"
  | "command_center_opened"
  | "generate_lead"
  | "contact_channel_clicked"
  | "service_collection_opened"
  | "project_walkthrough_opened"
  | "web_vital"
  | "em_ai_opened";

type AnalyticsMetadata = {
  app?:
    | "about"
    | "skills"
    | "portfolio"
    | "creative-labs"
    | "journey"
    | "contact"
    | "em-ai"
    | "projects"
    | "services"
    | "notes"
    | "calendar"
    | "settings"
    | "photos"
    | "trash"
    | "help";
  project?: string;
  service?: string;
  channel?: "call" | "whatsapp" | "sms" | "email";
  region?: "uae" | "pakistan";
  metric?: "LCP" | "INP" | "CLS" | "FCP" | "TTFB";
  value?: number;
  rating?: "good" | "needs-improvement" | "poor";
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
  | ({ event: AnalyticsEventName } & {
      [K in keyof AnalyticsMetadata]: AnalyticsMetadata[K] | null;
    });

export function isAnalyticsHostname(hostname: string) {
  return hostname === "emranlabs.com" || hostname === "www.emranlabs.com";
}

type AnalyticsWindow = Window & {
  dataLayer?: Array<GtagConsentArguments | DataLayerEvent>;
  __emranLabsGtmStatus?: GoogleTagManagerStatus;
  __emranLabsGooglePage?: string;
  __emranLabsMetaPixelId?: string;
  __emranLabsMetaPage?: string;
  fbq?: MetaPixelQueue;
  _fbq?: MetaPixelQueue;
};

type MetaPixelQueue = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  push?: MetaPixelQueue;
  loaded: boolean;
  version: string;
  queue: unknown[][];
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

export function getStoredMetaConsent(): AnalyticsConsent | null {
  try {
    const value = window.localStorage.getItem(metaConsentStorageKey);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
}

export function storeMetaConsent(consent: AnalyticsConsent) {
  try {
    window.localStorage.setItem(metaConsentStorageKey, consent);
  } catch {}
}

function metaAllowed() {
  return (
    !doNotTrackEnabled() &&
    isAnalyticsHostname(window.location.hostname) &&
    getStoredMetaConsent() === "granted"
  );
}

/** Official Pixel queue, created only after explicit Meta consent. */
export function loadMetaPixel(pixelId?: string) {
  if (!pixelId || !/^\d{10,20}$/.test(pixelId) || !metaAllowed()) return;
  const target = getAnalyticsWindow();
  if (target.__emranLabsMetaPixelId) {
    trackMetaPageView();
    return;
  }
  // Avoid a second installation if another integration owns an existing Pixel.
  if (target.fbq) return;
  const fbq: MetaPixelQueue = Object.assign(
    (...args: unknown[]) => {
      if (fbq.callMethod) fbq.callMethod(...args);
      else fbq.queue.push(args);
    },
    { loaded: true, version: "2.0", queue: [] as unknown[][] },
  );
  fbq.push = fbq;
  target.fbq = fbq;
  target._fbq = fbq;
  target.__emranLabsMetaPixelId = pixelId;
  fbq("consent", "grant");
  fbq("set", "autoConfig", false, pixelId);
  fbq("init", pixelId);
  trackMetaPageView();
  const script = document.createElement("script");
  script.id = "emranlabs-meta-pixel";
  script.async = true;
  script.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.append(script);
}

export function trackMetaPageView() {
  try {
    const target = getAnalyticsWindow();
    if (!metaAllowed() || !target.__emranLabsMetaPixelId) return;
    // Desktop query-string navigation has its own project/contact events.
    if (target.__emranLabsMetaPage === window.location.pathname) return;
    target.__emranLabsMetaPage = window.location.pathname;
    target.fbq?.("track", "PageView");
  } catch {}
}

export function revokeMetaPixel() {
  try {
    const target = getAnalyticsWindow();
    target.fbq?.("consent", "revoke");
    for (const name of ["_fbp", "_fbc"]) {
      document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
      document.cookie = `${name}=; Max-Age=0; Path=/; Domain=.emranlabs.com; SameSite=Lax`;
    }
  } catch {}
}

function trackMetaEvent(event: AnalyticsEventName, safe: AnalyticsMetadata) {
  const target = getAnalyticsWindow();
  if (!metaAllowed() || !target.__emranLabsMetaPixelId) return;
  if (event === "generate_lead")
    target.fbq?.("track", "Lead", {
      content_name: safe.service ?? "project-enquiry",
      content_category: "website-enquiry",
    });
  else if (event === "project_detail_opened" && safe.project)
    target.fbq?.("track", "ViewContent", {
      content_name: safe.project,
      content_category: "portfolio-project",
    });
  else if (event === "contact_channel_clicked" && safe.channel)
    target.fbq?.("track", "Contact", {
      content_name: safe.channel,
      content_category: safe.region ?? "website",
    });
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
    // The base GA tag records the initial page; route changes are explicit below.
    if (status === "loaded")
      getAnalyticsWindow().__emranLabsGooglePage = window.location.pathname;
  } catch {
    // Analytics must never affect the portfolio UI.
  }
}

export function trackAnalyticsPageView() {
  try {
    const target = getAnalyticsWindow();
    if (
      getStoredAnalyticsConsent() !== "granted" ||
      getGoogleTagManagerStatus() !== "loaded"
    )
      return;
    if (target.__emranLabsGooglePage === window.location.pathname) return;
    target.__emranLabsGooglePage = window.location.pathname;
    trackEvent("page_view");
  } catch {}
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
    if (doNotTrackEnabled() || !isAnalyticsHostname(window.location.hostname))
      return;
    // Only public catalog identifiers and aggregate metrics are accepted.
    // Form text, email addresses, phone numbers, URLs and search queries never leave here.
    const safe: AnalyticsMetadata = {};
    if (
      metadata?.app &&
      [
        "about",
        "skills",
        "portfolio",
        "creative-labs",
        "journey",
        "contact",
        "em-ai",
        "projects",
        "services",
        "notes",
        "calendar",
        "settings",
        "photos",
        "trash",
        "help",
      ].includes(metadata.app)
    )
      safe.app = metadata.app;
    if (
      metadata?.project &&
      ["edrive", "inaya", "emranlabs", "aliyas360", "inaya-domestic"].includes(
        metadata.project,
      )
    )
      safe.project = metadata.project;
    if (
      metadata?.service &&
      [
        "business-websites",
        "booking-systems",
        "business-automation",
        "interface-design",
        "cloud-it",
      ].includes(metadata.service)
    )
      safe.service = metadata.service;
    if (
      metadata?.channel &&
      ["call", "whatsapp", "sms", "email"].includes(metadata.channel)
    )
      safe.channel = metadata.channel;
    if (metadata?.region && ["uae", "pakistan"].includes(metadata.region))
      safe.region = metadata.region;
    if (
      metadata?.metric &&
      ["LCP", "INP", "CLS", "FCP", "TTFB"].includes(metadata.metric)
    ) {
      safe.metric = metadata.metric;
      if (Number.isFinite(metadata.value) && metadata.value! >= 0)
        safe.value = metadata.value;
      if (
        metadata.rating &&
        ["good", "needs-improvement", "poor"].includes(metadata.rating)
      )
        safe.rating = metadata.rating;
    }
    trackMetaEvent(event, safe);
    if (
      getStoredAnalyticsConsent() !== "granted" ||
      analyticsWindow.__emranLabsGtmStatus !== "loaded" ||
      !analyticsWindow.dataLayer
    )
      return;
    // Explicitly clear context so GTM cannot reuse a previous event's dimensions.
    analyticsWindow.dataLayer.push({
      event,
      app: null,
      project: null,
      service: null,
      channel: null,
      region: null,
      metric: null,
      value: null,
      rating: null,
      ...safe,
    });
  } catch {
    // Analytics must never affect the portfolio UI.
  }
}
