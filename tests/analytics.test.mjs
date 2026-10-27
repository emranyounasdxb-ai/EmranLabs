import test from "node:test";
import assert from "node:assert/strict";
import {
  trackEvent,
  isAnalyticsHostname,
  buildConsentState,
  loadMetaPixel,
  trackMetaPageView,
  revokeMetaPixel,
  trackAnalyticsPageView,
  setGoogleTagManagerStatus,
  loadLinkedInInsight,
  getStoredLinkedInConsent,
  storeLinkedInConsent,
  trackLinkedInPageView,
  revokeLinkedInInsight,
  clearGoogleAnalyticsCookies,
  suspendTrackingForSession,
  resumeTrackingAfterSavedChoice,
  storeAnalyticsConsent,
  getStoredAnalyticsConsent,
  loadClarity,
  isClarityEnabled,
  storeClarityEnabled,
  storeClarityConsent,
  getStoredClarityConsent,
  updateClarityConsent,
} from "../src/lib/analytics/client.ts";
import { getAnalyticsConfig } from "../src/lib/analytics/config.ts";

test("tracking requires consent, loaded tags and honors Do Not Track", () => {
  let consent = null;
  const queue = [];
  globalThis.window = {
    location: { hostname: "emranlabs.com", pathname: "/" },
    dataLayer: queue,
    localStorage: { getItem: () => consent },
    __emranLabsGtmStatus: "loaded",
  };
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: { doNotTrack: "0" },
  });
  trackEvent("generate_lead");
  assert.equal(queue.length, 0);
  consent = "granted";
  window.__emranLabsGtmStatus = "loading";
  trackEvent("generate_lead");
  assert.equal(queue.length, 0);
  window.__emranLabsGtmStatus = "loaded";
  navigator.doNotTrack = "1";
  trackEvent("generate_lead");
  assert.equal(queue.length, 0);
  navigator.doNotTrack = "0";
  trackEvent("generate_lead", {
    project: "edrive",
    service: "booking-systems",
    email: "private@example.com",
    message: "private",
    channel: "not-a-channel",
  });
  assert.equal(queue.length, 1);
  assert.equal(queue[0].project, "edrive");
  assert.equal(queue[0].service, "booking-systems");
  assert.equal(queue[0].channel, null);
  assert.equal(JSON.stringify(queue).includes("private"), false);
  trackEvent("application_opened", { app: "services" });
  assert.equal(queue[1].project, null);
  assert.equal(queue[1].service, null);
  setGoogleTagManagerStatus("loaded");
  trackAnalyticsPageView();
  assert.equal(queue.length, 2, "Base GA tag owns the initial page view");
  window.location.pathname = "/services";
  trackAnalyticsPageView();
  trackAnalyticsPageView();
  assert.equal(queue.filter((entry) => entry.event === "page_view").length, 1);
  consent = "denied";
  trackEvent("contact_channel_clicked", { channel: "whatsapp" });
  assert.equal(queue.length, 3);
});

test("Meta has independent consent, public-only event data and no local requests", () => {
  const store = new Map([["emranlabs.analytics-consent", "denied"]]);
  const scripts = [];
  globalThis.window = {
    location: { hostname: "emranlabs.com", pathname: "/" },
    localStorage: { getItem: (key) => store.get(key) ?? null },
  };
  globalThis.document = {
    createElement: () => ({}),
    head: { append: (script) => scripts.push(script) },
    cookie: "",
  };
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: { doNotTrack: "0" },
  });
  loadMetaPixel("2306932560092203");
  assert.equal(scripts.length, 0);
  store.set("emranlabs.meta-consent", "granted");
  window.location.hostname = "127.0.0.1";
  loadMetaPixel("2306932560092203");
  assert.equal(scripts.length, 0);
  window.location.hostname = "emranlabs.com";
  navigator.doNotTrack = "1";
  loadMetaPixel("2306932560092203");
  assert.equal(scripts.length, 0);
  navigator.doNotTrack = "0";
  loadMetaPixel("2306932560092203");
  loadMetaPixel("2306932560092203");
  assert.equal(scripts.length, 1);
  assert.equal(
    window.fbq.queue.filter((entry) => entry[1] === "PageView").length,
    1,
  );
  assert.deepEqual(
    window.fbq.queue.find((entry) => entry[1] === "autoConfig"),
    ["set", "autoConfig", false, "2306932560092203"],
  );
  trackEvent("generate_lead", {
    service: "booking-systems",
    email: "private@example.com",
    message: "private-message",
  });
  trackEvent("contact_channel_clicked", {
    channel: "whatsapp",
    region: "pakistan",
  });
  trackEvent("project_detail_opened", { project: "edrive" });
  assert.equal(
    window.fbq.queue.filter((entry) => entry[1] === "Lead").length,
    1,
  );
  assert.equal(
    window.fbq.queue.filter((entry) => entry[1] === "Contact").length,
    1,
  );
  assert.equal(
    window.fbq.queue.filter((entry) => entry[1] === "ViewContent").length,
    1,
  );
  assert.equal(JSON.stringify(window.fbq.queue).includes("private"), false);
  assert.equal(window.dataLayer, undefined);
  window.location.pathname = "/services";
  trackMetaPageView();
  assert.equal(
    window.fbq.queue.filter((entry) => entry[1] === "PageView").length,
    2,
  );
  store.set("emranlabs.meta-consent", "denied");
  revokeMetaPixel();
  const count = window.fbq.queue.length;
  trackEvent("generate_lead");
  trackMetaPageView();
  assert.equal(window.fbq.queue.length, count);
  assert.deepEqual(window.fbq.queue.at(-1), ["consent", "revoke"]);
});

test("only real domain is eligible; advertising consent stays denied", () => {
  for (const hostname of [
    "localhost",
    "127.0.0.1",
    "preview.emranlabs.com",
    "emranlabs.com.example.org",
  ])
    assert.equal(isAnalyticsHostname(hostname), false);
  assert.equal(isAnalyticsHostname("emranlabs.com"), true);
  assert.equal(isAnalyticsHostname("www.emranlabs.com"), true);
  assert.deepEqual(buildConsentState("granted"), {
    analytics_storage: "granted",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
});

test("LinkedIn requires its own consent, loads once, and sends only a configured conversion ID", () => {
  const store = new Map([
    ["emranlabs.analytics-consent", "granted"],
    ["emranlabs.meta-consent", "granted"],
  ]);
  const scripts = [];
  const cleared = [];
  globalThis.window = {
    location: { hostname: "emranlabs.com", pathname: "/" },
    localStorage: {
      getItem: (key) => store.get(key) ?? null,
      setItem: (key, value) => store.set(key, value),
    },
  };
  globalThis.document = {
    createElement: () => ({}),
    head: { append: (script) => scripts.push(script) },
    set cookie(value) {
      cleared.push(value);
    },
  };
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: { doNotTrack: "0", globalPrivacyControl: false },
  });
  assert.equal(getStoredLinkedInConsent(), null);
  loadLinkedInInsight("1234567", "7654321");
  assert.equal(
    scripts.length,
    0,
    "Existing Google/Meta permission cannot grant LinkedIn",
  );
  storeLinkedInConsent("granted");
  for (const hostname of ["localhost", "127.0.0.1", "preview.emranlabs.com"]) {
    window.location.hostname = hostname;
    loadLinkedInInsight("1234567");
  }
  assert.equal(scripts.length, 0);
  window.location.hostname = "emranlabs.com";
  navigator.globalPrivacyControl = true;
  loadLinkedInInsight("1234567");
  assert.equal(scripts.length, 0);
  navigator.globalPrivacyControl = false;
  loadLinkedInInsight("invalid");
  assert.equal(scripts.length, 0);
  loadLinkedInInsight("1234567", "7654321");
  loadLinkedInInsight("1234567", "7654321");
  assert.equal(scripts.length, 1);
  assert.equal(
    scripts[0].src,
    "https://snap.licdn.com/li.lms-analytics/insight.min.js",
  );
  trackLinkedInPageView();
  assert.deepEqual(window.lintrk.q, [], "SDK owns the initial view");
  window.location.pathname = "/contact";
  trackLinkedInPageView();
  trackLinkedInPageView();
  assert.deepEqual(window.lintrk.q, [["track", {}]]);
  trackEvent("generate_lead", {
    email: "private@example.com",
    message: "private",
    service: "business-websites",
  });
  assert.deepEqual(window.lintrk.q.at(-1), [
    "track",
    { conversion_id: 7654321 },
  ]);
  assert.equal(JSON.stringify(window.lintrk.q).includes("private"), false);
  storeLinkedInConsent("denied");
  revokeLinkedInInsight();
  const count = window.lintrk.q.length;
  trackEvent("generate_lead");
  window.location.pathname = "/services";
  trackLinkedInPageView();
  assert.equal(window.lintrk.q.length, count);
  assert.ok(
    cleared.some((cookie) => cookie.startsWith("li_fat_id=; Max-Age=0")),
  );
});

test("GPC blocks all three services and invalid storage fails closed", () => {
  const scripts = [];
  globalThis.window = {
    location: { hostname: "emranlabs.com", pathname: "/" },
    localStorage: { getItem: () => "granted" },
    dataLayer: [],
    __emranLabsGtmStatus: "loaded",
  };
  globalThis.document = {
    createElement: () => ({}),
    head: { append: (script) => scripts.push(script) },
  };
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: { doNotTrack: "0", globalPrivacyControl: true },
  });
  loadMetaPixel("2306932560092203");
  loadLinkedInInsight("1234567");
  trackEvent("generate_lead");
  assert.equal(scripts.length, 0);
  assert.equal(window.dataLayer.length, 0);
  window.localStorage.getItem = () => {
    throw new Error("Storage blocked");
  };
  assert.equal(getStoredLinkedInConsent(), null);
  navigator.globalPrivacyControl = false;
  loadLinkedInInsight("1234567");
  assert.equal(scripts.length, 0);
});

test("withdrawal clears Google cookies without deleting essential preferences", () => {
  const cleared = [];
  globalThis.window = { location: { hostname: "www.emranlabs.com" } };
  globalThis.document = {
    get cookie() {
      return "_ga=one; _ga_ABC=two; _gid=three; desktop-theme=dark";
    },
    set cookie(value) {
      cleared.push(value);
    },
  };
  clearGoogleAnalyticsCookies();
  assert.equal(cleared.length, 9);
  assert.equal(
    cleared.some((value) => value.includes("desktop-theme")),
    false,
  );
  assert.ok(cleared.some((value) => value.includes("Domain=.emranlabs.com")));
});

test("vendor configuration is independent and rejects malformed IDs", () => {
  const keys = [
    "NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID",
    "NEXT_PUBLIC_META_PIXEL_ID",
    "NEXT_PUBLIC_LINKEDIN_PARTNER_ID",
    "NEXT_PUBLIC_LINKEDIN_LEAD_CONVERSION_ID",
    "NEXT_PUBLIC_CLARITY_PROJECT_ID",
  ];
  const original = keys.map((key) => process.env[key]);
  try {
    for (const key of keys) delete process.env[key];
    assert.equal(getAnalyticsConfig(), null);
    process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID = "z41sv84gxl";
    assert.equal(getAnalyticsConfig().clarityProjectId, "z41sv84gxl");
    process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID = "../invalid";
    assert.equal(getAnalyticsConfig(), null);
    process.env.NEXT_PUBLIC_LINKEDIN_PARTNER_ID = "1234567";
    assert.equal(getAnalyticsConfig().linkedInPartnerId, "1234567");
    assert.equal(getAnalyticsConfig().containerId, "");
    process.env.NEXT_PUBLIC_LINKEDIN_PARTNER_ID = "javascript:bad";
    assert.equal(getAnalyticsConfig(), null);
    process.env.NEXT_PUBLIC_META_PIXEL_ID = "2306932560092203";
    assert.equal(getAnalyticsConfig().metaPixelId, "2306932560092203");
  } finally {
    keys.forEach((key, index) => {
      if (original[index] === undefined) delete process.env[key];
      else process.env[key] = original[index];
    });
  }
});

test("failed preference writes cannot revive old consent after a reload", () => {
  const session = new Map();
  globalThis.window = {
    localStorage: {
      getItem: () => "granted",
      setItem: () => {
        throw new Error("Full storage");
      },
    },
    sessionStorage: {
      getItem: (key) => session.get(key),
      setItem: (key, value) => session.set(key, value),
      removeItem: (key) => session.delete(key),
    },
  };
  assert.equal(storeAnalyticsConsent("denied"), false);
  assert.equal(suspendTrackingForSession(), true);
  assert.equal(getStoredAnalyticsConsent(), "denied");
  delete window.__emranLabsTrackingSuspended;
  assert.equal(
    getStoredAnalyticsConsent(),
    "denied",
    "Session guard survives a reload",
  );
  resumeTrackingAfterSavedChoice();
  assert.equal(getStoredAnalyticsConsent(), "granted");
});

test("Clarity starts cookieless, grants cookies only on opt-in, and sends only public events", () => {
  const store = new Map();
  const scripts = [];
  globalThis.window = {
    location: { hostname: "emranlabs.com", pathname: "/" },
    localStorage: {
      getItem: (key) => store.get(key) ?? null,
      setItem: (key, value) => store.set(key, value),
    },
  };
  globalThis.document = {
    getElementById: () => null,
    createElement: () => ({}),
    head: { append: (script) => scripts.push(script) },
    cookie: "",
  };
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: { doNotTrack: "0" },
  });
  loadClarity("z41sv84gxl");
  loadClarity("z41sv84gxl");
  assert.equal(scripts.length, 1);
  assert.deepEqual(window.clarity.q, [
    ["consentv2", { analytics_Storage: "denied", ad_Storage: "denied" }],
  ]);
  scripts[0].onload();
  trackEvent("application_opened", {
    app: "portfolio",
    email: "private@example.com",
  });
  trackEvent("project_detail_opened", {
    project: "edrive",
    message: "private",
  });
  trackEvent("application_opened", { app: "private-value" });
  assert.deepEqual(window.clarity.q.slice(1), [
    ["event", "app_portfolio"],
    ["event", "project_edrive"],
  ]);
  assert.equal(JSON.stringify(window.clarity.q).includes("private"), false);
  assert.equal(getStoredClarityConsent(), null);
  assert.equal(storeClarityConsent("granted"), true);
  updateClarityConsent();
  assert.deepEqual(window.clarity.q.at(-1), [
    "consentv2",
    { analytics_Storage: "granted", ad_Storage: "denied" },
  ]);
  storeClarityConsent("denied");
  updateClarityConsent();
  assert.deepEqual(window.clarity.q.at(-1), [
    "consentv2",
    { analytics_Storage: "denied", ad_Storage: "denied" },
  ]);
  storeClarityEnabled(false);
  assert.equal(isClarityEnabled(), false);
  assert.deepEqual(window.clarity.q.at(-1), ["stop"]);
  const count = window.clarity.q.length;
  trackEvent("generate_lead");
  assert.equal(window.clarity.q.length, count);
});

test("Clarity respects local hosts, privacy signals, opt-out and inaccessible storage", () => {
  const scripts = [];
  globalThis.window = {
    location: { hostname: "localhost" },
    localStorage: { getItem: () => null },
  };
  globalThis.document = {
    getElementById: () => null,
    createElement: () => ({}),
    head: { append: (script) => scripts.push(script) },
  };
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: { doNotTrack: "0", globalPrivacyControl: false },
  });
  loadClarity("z41sv84gxl");
  window.location.hostname = "emranlabs.com";
  navigator.globalPrivacyControl = true;
  loadClarity("z41sv84gxl");
  navigator.globalPrivacyControl = false;
  navigator.doNotTrack = "1";
  loadClarity("z41sv84gxl");
  navigator.doNotTrack = "0";
  window.localStorage.getItem = () => "1";
  loadClarity("z41sv84gxl");
  window.localStorage.getItem = () => {
    throw new Error("blocked");
  };
  loadClarity("z41sv84gxl");
  assert.equal(scripts.length, 0);
});
