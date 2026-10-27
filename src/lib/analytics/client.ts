"use client";

export const analyticsConsentStorageKey = "emranlabs.analytics-consent";
export const metaConsentStorageKey = "emranlabs.meta-consent";
export const linkedInConsentStorageKey = "emranlabs.linkedin-consent";
export const clarityPreferenceStorageKey = "emranlabs.clarity-disabled";
export const clarityConsentStorageKey = "emranlabs.clarity-consent";
export const privacyOpenEvent = "emranlabs:privacy-open";

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
  clarity?: ((...args: unknown[]) => void) & { q?: unknown[][] };
  __emranLabsClarityStatus?: GoogleTagManagerStatus;
  __emranLabsClarityDisabled?: boolean;
  __emranLabsTrackingSuspended?: boolean;
  dataLayer?: Array<GtagConsentArguments | DataLayerEvent>;
  __emranLabsGtmStatus?: GoogleTagManagerStatus;
  __emranLabsGooglePage?: string;
  __emranLabsMetaPixelId?: string;
  __emranLabsMetaPage?: string;
  fbq?: MetaPixelQueue;
  _fbq?: MetaPixelQueue;
  _linkedin_partner_id?: string;
  _linkedin_data_partner_ids?: string[];
  __emranLabsLinkedInPartnerId?: string;
  __emranLabsLinkedInLeadConversionId?: string;
  __emranLabsLinkedInPage?: string;
  lintrk?: LinkedInQueue;
};

type LinkedInQueue = ((
  command: string,
  options: Record<string, unknown>,
) => void) & {
  q: Array<[string, Record<string, unknown>]>;
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
  return (
    navigator.doNotTrack === "1" ||
    navigator.doNotTrack === "yes" ||
    (navigator as Navigator & { globalPrivacyControl?: boolean })
      .globalPrivacyControl === true
  );
}

/** This is an opt-out preference, never a cookie-consent grant. */
export function isClarityEnabled() {
  try {
    return (
      !doNotTrackEnabled() &&
      !getAnalyticsWindow().__emranLabsClarityDisabled &&
      !getAnalyticsWindow().__emranLabsTrackingSuspended &&
      window.sessionStorage?.getItem(suspendedKey) !== "1" &&
      window.localStorage.getItem(clarityPreferenceStorageKey) !== "1"
    );
  } catch {
    return false;
  }
}

export function storeClarityEnabled(enabled: boolean) {
  const target = getAnalyticsWindow();
  target.__emranLabsClarityDisabled = !enabled;
  if (!enabled) stopClarity();
  try {
    window.localStorage.setItem(
      clarityPreferenceStorageKey,
      enabled ? "0" : "1",
    );
    return (
      window.localStorage.getItem(clarityPreferenceStorageKey) ===
      (enabled ? "0" : "1")
    );
  } catch {
    return false;
  }
}

export function getStoredClarityConsent() {
  return readConsent(clarityConsentStorageKey);
}

export function storeClarityConsent(consent: AnalyticsConsent) {
  return writeConsent(clarityConsentStorageKey, consent);
}

export function updateClarityConsent() {
  try {
    const analytics =
      isClarityEnabled() && getStoredClarityConsent() === "granted"
        ? "granted"
        : "denied";
    getAnalyticsWindow().clarity?.("consentv2", {
      analytics_Storage: analytics,
      ad_Storage: "denied",
    });
    if (analytics === "denied") clearFirstPartyCookies(["_clck", "_clsk"]);
  } catch {}
}

/** Project cookies must also be Off in Clarity Settings > Setup. */
export function loadClarity(projectId?: string) {
  if (
    !projectId ||
    !/^[a-z0-9]{6,20}$/.test(projectId) ||
    !isClarityEnabled() ||
    !isAnalyticsHostname(window.location.hostname)
  )
    return;
  const target = getAnalyticsWindow();
  if (target.clarity || document.getElementById("emranlabs-clarity")) return;
  const queue = Object.assign(
    (...args: unknown[]) => {
      queue.q.push(args);
    },
    { q: [] as unknown[][] },
  );
  target.clarity = queue;
  // Case-sensitive keys: analytics cookies need a separate Clarity opt-in.
  // Microsoft advertising storage is never granted by this integration.
  updateClarityConsent();
  target.__emranLabsClarityStatus = "loading";
  const script = document.createElement("script");
  script.id = "emranlabs-clarity";
  script.async = true;
  script.src = `https://www.clarity.ms/tag/${projectId}`;
  script.onload = () => {
    target.__emranLabsClarityStatus = "loaded";
  };
  script.onerror = () => {
    target.__emranLabsClarityStatus = "failed";
    // Discard queued events if the tag is blocked. Do not grow a queue forever.
    if (target.clarity === queue) delete target.clarity;
    script.remove();
  };
  document.head.append(script);
}

export function stopClarity() {
  try {
    const target = getAnalyticsWindow();
    target.clarity?.("stop");
    target.__emranLabsClarityStatus = "idle";
    clearFirstPartyCookies(["_clck", "_clsk"]);
  } catch {}
}

function trackClarityEvent(event: AnalyticsEventName, safe: AnalyticsMetadata) {
  const target = getAnalyticsWindow();
  if (!isClarityEnabled() || target.__emranLabsClarityStatus !== "loaded")
    return;
  // Use only public catalog names. Never use identify(), free text or visitor IDs.
  if (event === "application_opened" && safe.app)
    target.clarity?.("event", `app_${safe.app}`);
  if (event === "project_detail_opened" && safe.project)
    target.clarity?.("event", `project_${safe.project}`);
  if (event === "contact_channel_clicked" && safe.channel)
    target.clarity?.("event", `contact_${safe.channel}`);
  if (event === "generate_lead") target.clarity?.("event", "enquiry_sent");
}

export function getStoredLinkedInConsent(): AnalyticsConsent | null {
  return readConsent(linkedInConsentStorageKey);
}

export function storeLinkedInConsent(consent: AnalyticsConsent) {
  return writeConsent(linkedInConsentStorageKey, consent);
}

const suspendedKey = "emranlabs.tracking-suspended";

function readConsent(key: string): AnalyticsConsent | null {
  try {
    if (
      getAnalyticsWindow().__emranLabsTrackingSuspended ||
      window.sessionStorage?.getItem(suspendedKey) === "1"
    )
      return "denied";
    const value = window.localStorage.getItem(key);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
}

function writeConsent(key: string, consent: AnalyticsConsent) {
  try {
    window.localStorage.setItem(key, consent);
    return window.localStorage.getItem(key) === consent;
  } catch {
    return false;
  }
}

/** Failed preference writes must not reactivate a previously saved grant. */
export function suspendTrackingForSession() {
  getAnalyticsWindow().__emranLabsTrackingSuspended = true;
  try {
    window.sessionStorage.setItem(suspendedKey, "1");
    return window.sessionStorage.getItem(suspendedKey) === "1";
  } catch {
    return false;
  }
}

export function resumeTrackingAfterSavedChoice() {
  try {
    window.sessionStorage?.removeItem(suspendedKey);
  } catch {}
  getAnalyticsWindow().__emranLabsTrackingSuspended = false;
}

function linkedInAllowed() {
  return (
    !doNotTrackEnabled() &&
    isAnalyticsHostname(window.location.hostname) &&
    getStoredLinkedInConsent() === "granted"
  );
}

/** LinkedIn's queue is installed only after an independent, explicit opt-in. */
export function loadLinkedInInsight(
  partnerId?: string,
  leadConversionId?: string,
) {
  if (!partnerId || !/^[1-9]\d{0,14}$/.test(partnerId) || !linkedInAllowed())
    return;
  const target = getAnalyticsWindow();
  if (target.__emranLabsLinkedInPartnerId) return;
  if (target.lintrk) return;
  const lintrk: LinkedInQueue = Object.assign(
    (command: string, options: Record<string, unknown>) => {
      lintrk.q.push([command, options]);
    },
    { q: [] as Array<[string, Record<string, unknown>]> },
  );
  target.lintrk = lintrk;
  target._linkedin_partner_id = partnerId;
  target._linkedin_data_partner_ids = [partnerId];
  target.__emranLabsLinkedInPartnerId = partnerId;
  target.__emranLabsLinkedInLeadConversionId =
    leadConversionId && /^[1-9]\d{0,14}$/.test(leadConversionId)
      ? leadConversionId
      : undefined;
  // The SDK owns the initial page view; explicit calls cover subsequent routes.
  target.__emranLabsLinkedInPage = window.location.pathname;
  const script = document.createElement("script");
  script.id = "emranlabs-linkedin-insight";
  script.async = true;
  script.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
  document.head.append(script);
}

export function trackLinkedInPageView() {
  try {
    const target = getAnalyticsWindow();
    if (
      !linkedInAllowed() ||
      !target.__emranLabsLinkedInPartnerId ||
      target.__emranLabsLinkedInPage === window.location.pathname
    )
      return;
    target.__emranLabsLinkedInPage = window.location.pathname;
    target.lintrk?.("track", {});
  } catch {}
}

function clearFirstPartyCookies(names: string[]) {
  for (const name of names) {
    for (const domain of [
      "",
      `; Domain=${window.location.hostname}`,
      "; Domain=.emranlabs.com",
    ]) {
      document.cookie = `${name}=; Max-Age=0; Path=/${domain}; SameSite=Lax`;
    }
  }
}

export function revokeLinkedInInsight() {
  try {
    // Reload by the consent controller discards the SDK; third-party cookies
    // belong to LinkedIn and cannot be removed by this website.
    clearFirstPartyCookies(["li_fat_id", "li_giant"]);
  } catch {}
}

export function clearGoogleAnalyticsCookies() {
  try {
    const names = document.cookie
      .split(";")
      .map((cookie) => cookie.trim().split("=")[0])
      .filter((name) =>
        /^(_ga(?:_|$)|_gid$|_gat(?:_|$)|_gac_|_gcl_)/.test(name),
      );
    clearFirstPartyCookies(names);
  } catch {}
}

export function getStoredAnalyticsConsent(): AnalyticsConsent | null {
  return readConsent(analyticsConsentStorageKey);
}

export function storeAnalyticsConsent(consent: AnalyticsConsent) {
  return writeConsent(analyticsConsentStorageKey, consent);
}

export function getStoredMetaConsent(): AnalyticsConsent | null {
  return readConsent(metaConsentStorageKey);
}

export function storeMetaConsent(consent: AnalyticsConsent) {
  return writeConsent(metaConsentStorageKey, consent);
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
    trackClarityEvent(event, safe);
    trackMetaEvent(event, safe);
    if (
      event === "generate_lead" &&
      linkedInAllowed() &&
      analyticsWindow.__emranLabsLinkedInLeadConversionId
    ) {
      analyticsWindow.lintrk?.("track", {
        conversion_id: Number(
          analyticsWindow.__emranLabsLinkedInLeadConversionId,
        ),
      });
    }
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
