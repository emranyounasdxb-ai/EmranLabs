import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "./fixtures";

test("a name leads to a personal welcome, then the desktop and privacy choice", async ({
  page,
}) => {
  await page.goto("/");
  const entry = page.getByRole("dialog", { name: "Welcome to Emran Labs" });
  await expect(entry).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Privacy preferences" }),
  ).toBeHidden();
  await expect(page.locator(".mac-desktop").locator("..")).toHaveAttribute(
    "inert",
    "",
  );
  // The actual desktop initializes behind the welcome screen.
  await expect
    .poll(() =>
      page.evaluate(() => !!localStorage.getItem("emranlabs-workspace-v2")),
    )
    .toBe(true);
  await page.getByLabel("Your name (optional)").fill("  GPT Visitor  ");
  await page
    .getByRole("button", { name: "Enter workspace", exact: true })
    .click();
  await expect(
    entry.getByRole("heading", { name: "Welcome, GPT Visitor." }),
  ).toBeVisible();
  await expect(entry).toHaveCount(0);
  await expect(page.locator(".mac-desktop")).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Privacy preferences" }),
  ).toBeVisible();
  const browserState = await page.evaluate(() =>
    JSON.stringify({
      local: { ...localStorage },
      session: { ...sessionStorage },
      layer: (window as Window & { dataLayer?: unknown[] }).dataLayer,
      url: location.href,
    }),
  );
  expect(browserState).not.toContain("GPT Visitor");
  await page
    .getByRole("button", { name: "Use limited mode", exact: true })
    .click();
  await page.reload();
  await expect(page.locator(".mac-desktop")).toBeVisible();
  await expect(entry).toHaveCount(0);
  await expect(
    page.getByRole("region", { name: "Privacy preferences" }),
  ).toBeHidden();
});

test("guest entry preserves shared projects and is separate from tracking consent", async ({
  page,
}) => {
  await page.goto("/workspace/projects/edrive");
  await page
    .getByRole("button", { name: "Enter as Guest", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Welcome, guest." }),
  ).toBeVisible();
  await expect(page.locator("[data-workspace-entry]")).toHaveCount(0);
  await expect(page.locator(".project-detail")).toContainText("eDrive");
  await expect(page).toHaveURL(/\/workspace\/projects\/edrive$/);
  for (const key of [
    "emranlabs.analytics-consent",
    "emranlabs.meta-consent",
    "emranlabs.clarity-consent",
  ])
    expect(
      await page.evaluate((key) => localStorage.getItem(key), key),
    ).not.toBe("granted");
});

test("welcome supports keyboard navigation, screen readers and reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const entry = page.getByRole("dialog", { name: "Welcome to Emran Labs" });
  const input = page.getByLabel("Your name (optional)");
  await expect(input).toBeEnabled();
  await input.focus();
  await page.keyboard.press("Shift+Tab");
  await expect(
    entry.getByRole("link", { name: "Privacy", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(input).toBeFocused();
  await page.keyboard.press("Control+k");
  await expect(
    page.getByRole("dialog", { name: "Search workspace", exact: true }),
  ).toBeHidden();
  expect(
    (
      await new AxeBuilder({ page })
        .include("[data-workspace-entry]")
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await input.press("Enter");
  await expect(
    page.getByRole("heading", { name: "Welcome, guest." }),
  ).toBeVisible();
  const animations = await entry.evaluate(
    (element) => element.getAnimations({ subtree: true }).length,
  );
  expect(animations).toBe(0);
  await expect(entry).toHaveCount(0);
});

test("guest access works with blocked storage and small keyboard-height screens", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 420 });
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw new DOMException("Blocked", "SecurityError");
    };
    Storage.prototype.setItem = () => {
      throw new DOMException("Blocked", "SecurityError");
    };
  });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Enter as Guest", exact: true })
    .click();
  await expect(page.locator("[data-workspace-entry]")).toHaveCount(0);
  await expect(page.locator(".mac-desktop")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    390,
  );
});
