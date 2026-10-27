import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { enterDesktop } from "./fixtures";

const trackers =
  /googletagmanager\.com|google-analytics\.com|connect\.facebook\.net|facebook\.com\/tr|snap\.licdn\.com|px\.ads\.linkedin\.com|clarity\.ms/;
async function openPreferences(page: Page) {
  const panel = page.getByRole("region", { name: "Privacy preferences" });
  const shortcut = page.getByRole("button", { name: /^Privacy preferences,/ });
  // Wait for hydration before choosing the already-open panel or its shortcut.
  await expect(panel.or(shortcut)).toBeVisible();
  if (!(await panel.isVisible())) await shortcut.click();
  await expect(panel).toBeVisible();
}

test("privacy opens on first visit, saves choices, and local previews send no vendor traffic", async ({
  page,
}) => {
  const outgoing: string[] = [];
  page.on("request", (r) => {
    if (trackers.test(r.url())) outgoing.push(r.url());
  });
  await page.goto("/contact");
  const panel = page.getByRole("region", { name: "Privacy preferences" });
  await expect(panel).toBeVisible();
  await openPreferences(page);
  for (const name of ["Google Analytics", "Meta Pixel"])
    await expect(
      panel.getByRole("checkbox", { name, exact: true }),
    ).not.toBeChecked();
  await expect(
    panel.getByRole("checkbox", {
      name: "Microsoft Clarity",
      exact: true,
    }),
  ).not.toBeChecked();
  const accessibility = await new AxeBuilder({ page })
    .include('[aria-labelledby="tracking-consent-title"]')
    .analyze();
  expect(accessibility.violations).toEqual([]);
  await panel.getByRole("button", { name: "Allow all", exact: true }).click();
  await openPreferences(page);
  await expect(
    panel.getByRole("checkbox", { name: "Google Analytics", exact: true }),
  ).toBeChecked();
  await panel
    .getByRole("button", { name: "Use limited mode", exact: true })
    .click();
  await page.reload();
  await expect(
    page.getByRole("button", { name: /^Privacy preferences,/ }),
  ).toBeVisible();
  await expect(panel).toBeHidden();
  await openPreferences(page);
  for (const checkbox of await panel.getByRole("checkbox").all())
    await expect(checkbox).not.toBeChecked();
  expect(outgoing).toEqual([]);
});

test("GPC overrides all tracking and keyboard dismissal restores focus", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "globalPrivacyControl", { value: true });
    localStorage.setItem("emranlabs.analytics-consent", "granted");
    localStorage.setItem("emranlabs.meta-consent", "granted");
  });
  await page.goto("/contact");
  await openPreferences(page);
  await expect(
    page.getByRole("heading", { name: "Privacy preferences" }),
  ).toBeFocused();
  await expect(
    page.getByRole("button", { name: "Allow all", exact: true }),
  ).toBeDisabled();
  for (const checkbox of await page
    .getByRole("region", { name: "Privacy preferences" })
    .getByRole("checkbox")
    .all()) {
    await expect(checkbox).toBeDisabled();
    await expect(checkbox).not.toBeChecked();
  }
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: /^Privacy preferences,/ }),
  ).toBeFocused();
});

test("virtual production loads only cookieless Clarity initially; opt-out unloads and persists", async ({
  page,
  request,
}) => {
  const loaded: string[] = [];
  await page.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (trackers.test(url.href)) {
      loaded.push(url.href);
      await route.fulfill({
        status: 200,
        contentType: "application/javascript",
        body: "/* isolated vendor test: no external data sent */",
      });
    } else if (url.hostname === "emranlabs.com") {
      await route.fulfill({
        response: await request.get(
          `http://127.0.0.1:3000${url.pathname}${url.search}`,
        ),
      });
    } else await route.abort();
  });
  await page.goto("https://emranlabs.com/contact");
  await expect.poll(() => loaded.length).toBe(1);
  expect(loaded[0]).toContain("clarity.ms/tag/");
  await expect(
    page.getByRole("region", { name: "Privacy preferences" }),
  ).toBeVisible();
  await expect(page.locator("body")).toHaveAttribute(
    "data-clarity-mask",
    "true",
  );
  expect(
    await page.evaluate(
      () => (window as Window & { clarity?: { q?: unknown[] } }).clarity?.q,
    ),
  ).toEqual([
    ["consentv2", { analytics_Storage: "denied", ad_Storage: "denied" }],
  ]);
  await openPreferences(page);
  await page
    .getByRole("checkbox", { name: "Google Analytics", exact: true })
    .check();
  await page.getByRole("button", { name: "Save choices", exact: true }).click();
  await expect.poll(() => loaded.length).toBe(2);
  expect(loaded[1]).toContain("googletagmanager.com/gtm.js");
  await openPreferences(page);
  await page.getByRole("button", { name: "Allow all", exact: true }).click();
  await expect.poll(() => loaded.length).toBe(3);
  expect(loaded[2]).toContain("connect.facebook.net");
  const clarityQueue = await page.evaluate(
    () => (window as Window & { clarity?: { q?: unknown[] } }).clarity?.q,
  );
  expect(clarityQueue?.at(-1)).toEqual([
    "consentv2",
    { analytics_Storage: "granted", ad_Storage: "denied" },
  ]);
  await openPreferences(page);
  await page
    .getByRole("button", { name: "Use limited mode", exact: true })
    .click();
  await expect(
    page.locator("#emranlabs-google-tag-manager, #emranlabs-meta-pixel"),
  ).toHaveCount(0);
  await expect(page.locator("#emranlabs-clarity")).toHaveCount(1);
  await openPreferences(page);
  await expect(
    page.getByRole("checkbox", {
      name: "Microsoft Clarity",
      exact: true,
    }),
  ).not.toBeChecked();
  await expect.poll(() => loaded.length).toBe(4);
  await page
    .getByRole("button", { name: "Turn off all tracking", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: /^Privacy preferences,/ }),
  ).toBeVisible();
  await expect(page.locator("#emranlabs-clarity")).toHaveCount(0);
  expect(loaded.length).toBe(4);
  expect(
    await page.evaluate(() =>
      localStorage.getItem("emranlabs.clarity-disabled"),
    ),
  ).toBe("1");
  // Saving an unrelated vendor preference must preserve an explicit Clarity opt-out.
  await openPreferences(page);
  await page
    .getByRole("checkbox", { name: "Google Analytics", exact: true })
    .check();
  await page.getByRole("button", { name: "Save choices", exact: true }).click();
  await expect.poll(() => loaded.length).toBe(5);
  await expect(page.locator("#emranlabs-clarity")).toHaveCount(0);
});

test("mobile controls fit and privacy disclosure is available", async ({
  page,
  request,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/privacy");
  await expect(
    page.getByRole("heading", { name: "Your visit. Your choices." }),
  ).toBeVisible();
  await openPreferences(page);
  const panel = page.getByRole("region", { name: "Privacy preferences" });
  const bounds = await panel.boundingBox();
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(bounds!.y).toBeGreaterThanOrEqual(0);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(390);
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(844);
  await panel
    .getByRole("button", { name: "Use limited mode", exact: true })
    .click();
  expect((await request.get("/preview/privacy")).status()).toBe(404);
});

test("storage failure stops measurement and does not claim the choice was saved", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (
        this === window.localStorage &&
        /emranlabs\.(analytics|meta|linkedin)-consent|emranlabs\.clarity-disabled/.test(
          key,
        )
      )
        throw new Error("Storage full");
      return original.call(this, key, value);
    };
  });
  await page.goto("/contact");
  await openPreferences(page);
  await page.getByRole("button", { name: "Allow all", exact: true }).click();
  const panel = page.getByRole("region", { name: "Privacy preferences" });
  await expect(panel.getByRole("status")).toContainText("could not save");
  for (const checkbox of await panel.getByRole("checkbox").all())
    await expect(checkbox).not.toBeChecked();
  await expect(
    page.locator(
      "#emranlabs-clarity, #emranlabs-google-tag-manager, #emranlabs-meta-pixel",
    ),
  ).toHaveCount(0);
});

test("desktop stays clear; privacy controls open from Settings", async ({
  page,
}) => {
  await page.goto("/");
  await enterDesktop(page);
  await expect(page.locator(".mac-desktop")).toBeVisible();
  await page
    .getByRole("button", { name: "Use limited mode", exact: true })
    .click();
  await expect(
    page.getByRole("region", { name: "Privacy preferences" }),
  ).toBeHidden();
  await expect(
    page.getByRole("button", { name: /^Privacy preferences,/ }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Open Control Center", exact: true })
    .click();
  await page.getByRole("button", { name: "All settings", exact: true }).click();
  const opener = page.getByRole("button", {
    name: "Privacy preferences",
    exact: true,
  });
  await opener.click();
  await expect(
    page.getByRole("heading", { name: "Privacy preferences" }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(opener).toBeFocused();
});
