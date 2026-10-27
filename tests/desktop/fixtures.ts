import { test as base, expect, type Page } from "@playwright/test";

// Deterministic time/weather keep screenshots useful without masking product UI.
export const test = base.extend<{ fixedClock: boolean }>({
  fixedClock: [false, { option: true }],
  page: async ({ page, fixedClock }, runTest) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    if (fixedClock)
      await page.clock.setFixedTime(new Date("2026-10-27T08:30:00Z"));
    await page.route("**/api/weather?*", (route) => {
      const city = new URL(route.request().url()).searchParams.get("city");
      return route.fulfill({
        json: {
          city,
          temperature: 29,
          apparent: 31,
          code: 0,
          isDay: true,
          high: 33,
          low: 25,
          observedAt: "2026-10-27T12:30",
          fetchedAt: Date.now(),
          days: [27, 28, 29, 30, 31].map((day) => ({
            date: `2026-10-${day}`,
            high: 32,
            low: 25,
            code: 0,
          })),
        },
      });
    });
    await runTest(page);
    expect(errors, "No uncaught client exceptions").toEqual([]);
  },
});
export { expect };
export async function enterDesktop(page: Page) {
  // Entry is a real visitor action. Do not bypass it with seeded storage.
  const guest = page.getByRole("button", {
    name: "Enter as Guest",
    exact: true,
  });
  if (await page.locator("[data-workspace-entry]").count()) {
    await guest.click();
    await expect(page.locator("[data-workspace-entry]")).toHaveCount(0);
  }
}
export async function openDesktop(page: Page, path = "/") {
  await page.goto(path);
  await enterDesktop(page);
  await expect(page.locator(".mac-desktop")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Open Control Center", exact: true }),
  ).toBeVisible();
  await page.waitForFunction(
    () => !!localStorage.getItem("emranlabs-workspace-v2"),
  );
  const privacy = page.getByRole("region", { name: "Privacy preferences" });
  if (await privacy.isVisible())
    await privacy
      .getByRole("button", { name: "Use limited mode", exact: true })
      .click();
}
export async function controlCenter(page: Page) {
  await page
    .getByRole("button", { name: "Open Control Center", exact: true })
    .click();
  return page.getByRole("dialog", { name: "Control Center", exact: true });
}
export async function appearance(page: Page, mode: string) {
  const dialog = await controlCenter(page);
  await dialog
    .getByRole("combobox", { name: "Appearance mode", exact: true })
    .selectOption(mode);
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
}
