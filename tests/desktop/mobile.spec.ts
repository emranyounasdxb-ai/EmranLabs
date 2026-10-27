import { test, expect, openDesktop, controlCenter } from "./fixtures";

test("phone and reduced-height keyboard layout keep search, settings and contact reachable", async ({
  page,
}, info) => {
  test.skip(info.project.name !== "phone");
  await openDesktop(page);
  await page.getByRole("button", { name: "Search apps", exact: true }).tap();
  await page.getByRole("combobox").fill("Notes");
  await page.getByRole("option", { name: "Notes", exact: true }).tap();
  await expect(page.locator('[data-window-app="notes"]')).toBeVisible();
  await page.getByRole("button", { name: "Contact", exact: true }).tap();
  await expect(page.locator('[data-window-app="contact"]')).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
  const cc = await controlCenter(page);
  await cc.getByRole("button", { name: "All settings" }).tap();
  await expect(
    page.getByRole("slider", { name: "Dock icon size" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Search apps", exact: true }).tap();
  await page.setViewportSize({ width: 390, height: 420 });
  await expect(page.getByRole("combobox")).toBeVisible();
  await page.getByRole("combobox").fill("Calendar");
  await page.getByRole("option", { name: "Calendar", exact: true }).tap();
  await expect(page.locator('[data-window-app="calendar"]')).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Browse tools", exact: true }).tap();
  const launchpad = page.getByRole("dialog", {
    name: "Launchpad",
    exact: true,
  });
  await launchpad
    .getByRole("textbox", { name: "Search Launchpad" })
    .fill("WordPress");
  await launchpad.getByRole("button", { name: "WordPress", exact: true }).tap();
  await expect(
    page.getByRole("heading", { name: "Built with WordPress.", exact: true }),
  ).toBeVisible();
});
