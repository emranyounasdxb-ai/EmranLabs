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
} from "../src/lib/analytics/client.ts";

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
