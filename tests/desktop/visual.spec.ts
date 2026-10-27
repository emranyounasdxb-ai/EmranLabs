import { test, expect, openDesktop, appearance } from "./fixtures";

test.use({ fixedClock: true });

test("approved desktop surfaces", async ({ page }, info) => {
  test.skip(
    info.project.name !== "chromium",
    "Stable visual baselines use Chromium; behavior runs in all engines.",
  );
  await openDesktop(page, "/?collection=All+Projects");
  // Privacy is available in Settings, leaving the desktop and dock unobstructed.
  await expect(
    page.getByRole("region", { name: "Privacy preferences" }),
  ).toBeHidden();
  await expect(page.getByText("Clear sky")).toBeVisible();
  await expect(page).toHaveScreenshot("desktop-light.png");
  await page.getByRole("button", { name: "Edit", exact: true }).click();
  await expect(page.getByRole("menu")).toHaveScreenshot("edit-menu.png");
  await page.keyboard.press("Escape");
  for (const theme of ["light", "dark"]) {
    await appearance(page, theme);
    await page
      .getByRole("button", { name: "Search workspace", exact: true })
      .click();
    await page.keyboard.press("ArrowDown");
    await expect(
      page.getByRole("dialog", { name: "Search workspace" }),
    ).toHaveScreenshot(`spotlight-${theme}.png`);
    await page.keyboard.press("Escape");
  }
  await page.getByRole("button", { name: "Launchpad", exact: true }).click();
  await expect(
    page.getByRole("dialog", { name: "Launchpad" }),
  ).toHaveScreenshot("launchpad-dark.png");
  await page.keyboard.press("Escape");
  await page.keyboard.press("Alt+Shift+ArrowRight");
  await page.setViewportSize({ width: 820, height: 900 });
  await page.mouse.move(20, 34);
  await expect(page).toHaveScreenshot("tablet-dark.png");
});
