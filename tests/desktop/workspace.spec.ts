import AxeBuilder from "@axe-core/playwright";
import {
  test,
  expect,
  openDesktop,
  appearance,
  controlCenter,
} from "./fixtures";

test("dock magnification and launch motion remain functional", async ({
  page,
}) => {
  await openDesktop(page, "/?app=settings");
  const notes = page.getByRole("button", { name: "Notes", exact: true });
  await notes.hover();
  await expect
    .poll(() =>
      notes.evaluate((e) =>
        Number((e as HTMLElement).style.getPropertyValue("--dock-scale")),
      ),
    )
    .toBeGreaterThan(1.2);
  await page
    .locator('[data-window-app="settings"]')
    .getByRole("checkbox", { name: /Magnification/ })
    .uncheck();
  await notes.hover();
  await expect
    .poll(() =>
      notes.evaluate((e) =>
        Number(
          (e as HTMLElement).style.getPropertyValue("--dock-scale") || "1",
        ),
      ),
    )
    .toBe(1);
  // Observe WAAPI in the same task as the click so fast engines cannot race the assertion.
  const launch = await notes.evaluate((e) => {
    (e as HTMLButtonElement).click();
    return e
      .querySelector(".app-icon")!
      .getAnimations()
      .map((a) => a.id);
  });
  expect(launch).toContain("dock-launch");
  await expect(page.locator('[data-window-app="notes"]')).toBeVisible();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect
    .poll(() =>
      page.evaluate(
        () => matchMedia("(prefers-reduced-motion: reduce)").matches,
      ),
    )
    .toBe(true);
  const calmLaunch = await page
    .getByRole("button", { name: "Calendar", exact: true })
    .evaluate((e) => {
      (e as HTMLButtonElement).click();
      return e
        .querySelector(".app-icon")!
        .getAnimations()
        .map((a) => a.id);
    });
  expect(calmLaunch).not.toContain("dock-launch");
});

test("Launchpad filters and opens a collection; search remains independent", async ({
  page,
}) => {
  await openDesktop(page);
  await page.getByRole("button", { name: "Launchpad", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Launchpad", exact: true });
  await expect(
    dialog.getByRole("heading", { name: "Coding collections" }),
  ).toBeVisible();
  await dialog
    .getByRole("textbox", { name: "Search Launchpad" })
    .fill("Python");
  await expect(
    dialog.getByRole("button", { name: "Python", exact: true }),
  ).toBeVisible();
  await dialog.getByRole("button", { name: "Python", exact: true }).click();
  await expect(page).toHaveURL(/\/workspace\/collections\/python$/);
  await expect(dialog).not.toBeVisible();
  await page
    .getByRole("button", { name: "Search workspace", exact: true })
    .click();
  const input = page.getByRole("combobox");
  await input.fill("Notes");
  await input.press("ArrowDown");
  await input.press("Enter");
  await expect(page.locator('[data-window-app="notes"]')).toBeVisible();
});

test("System appearance follows live media changes and preserves explicit choice", async ({
  page,
}) => {
  await openDesktop(page);
  await appearance(page, "system");
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.locator(".mac-desktop")).toHaveClass(/dark/);
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator(".mac-desktop")).not.toHaveClass(/dark/);
  await appearance(page, "dark");
  await page.reload();
  await expect(page.locator(".mac-desktop")).toHaveClass(/dark/);
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator(".mac-desktop")).toHaveClass(/dark/);
});

test("Dock preferences persist, fit tablet, reveal on focus and reset to approved defaults", async ({
  page,
}) => {
  await openDesktop(page, "/?app=settings");
  const settings = page.locator('[data-window-app="settings"]');
  await settings
    .getByRole("checkbox", { name: /Automatically hide the Dock/ })
    .check();
  await settings.getByRole("checkbox", { name: /Magnification/ }).uncheck();
  await settings.getByRole("slider", { name: "Dock icon size" }).fill("40");
  await page.reload();
  await expect(settings.getByRole("slider")).toHaveValue("40");
  await expect(
    settings.getByRole("checkbox", { name: /Magnification/ }),
  ).not.toBeChecked();
  await expect(page.locator(".dock-reveal-zone")).toHaveClass(/dock-auto-hide/);
  await page.getByRole("button", { name: "Launchpad", exact: true }).focus();
  await expect
    .poll(async () =>
      page.locator(".dock").evaluate((e) => getComputedStyle(e).translate),
    )
    .toBe("0px");
  await page.setViewportSize({ width: 820, height: 900 });
  // The browser dispatches resize asynchronously; wait for the responsive layout.
  await expect
    .poll(async () => (await page.locator(".dock").boundingBox())!.x)
    .toBeGreaterThanOrEqual(0);
  await expect
    .poll(async () => {
      const dock = (await page.locator(".dock").boundingBox())!;
      return dock.x + dock.width;
    })
    .toBeLessThanOrEqual(820);
  await settings
    .getByRole("button", { name: "Reset Dock preferences" })
    .click();
  await expect(settings.getByRole("slider")).toHaveValue("35");
  await expect(
    settings.getByRole("checkbox", { name: /Magnification/ }),
  ).toBeChecked();
  await expect(
    settings.getByRole("checkbox", { name: /Automatically hide the Dock/ }),
  ).not.toBeChecked();
});

test("Window overview represents selected project and empty collection accurately", async ({
  page,
}) => {
  await openDesktop(page, "/?project=inaya");
  await page.keyboard.press("Alt+9");
  const overview = page.getByRole("dialog", { name: "Window overview" });
  await expect(overview.locator(".mission-project-detail")).toContainText(
    "INAYA Domestic",
  );
  await expect(overview.locator(".mission-project-detail img")).toHaveAttribute(
    "src",
    "/images/projects/inaya.webp",
  );
  await page.keyboard.press("Escape");
  await expect(overview).not.toBeVisible();
  await page
    .getByRole("button", { name: "Python projects", exact: true })
    .click();
  await page.keyboard.press("Alt+9");
  await expect(overview.locator(".mission-collection")).toContainText("Python");
  await expect(overview.locator(".mission-empty-collection")).toHaveText(
    "No matching projects",
  );
  await expect(overview.locator(".mission-folders img")).toHaveCount(0);
});

test("Right-tiled window remains usable across compact reload and returns to saved desktop position", async ({
  page,
}) => {
  await openDesktop(page);
  await page.keyboard.press("Alt+Shift+ArrowRight");
  const win = page.locator('[data-window-app="projects"]');
  await expect(win).toHaveClass(/placed/);
  const saved = await win.getAttribute("style");
  for (const width of [820, 390]) {
    await page.setViewportSize({ width, height: 844 });
    await expect(win).not.toHaveClass(/placed/);
    await expect
      .poll(async () => win.evaluate((e) => e.getBoundingClientRect().right))
      .toBeLessThanOrEqual(width);
  }
  await page.reload();
  await expect(win).toBeVisible();
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(win).toHaveClass(/placed/);
  await expect(win).toHaveAttribute("style", saved!);
});

test("Calendar zone and weather loading stay consistent, with actual error recovery", async ({
  page,
}) => {
  await page.clock.setFixedTime(new Date("2026-10-26T20:30:00Z"));
  await openDesktop(page);
  const cc = await controlCenter(page);
  await cc
    .getByRole("button", { name: "Widgets Clock, calendar, weather" })
    .click();
  const gallery = page.getByRole("dialog", { name: "Widget gallery" });
  await gallery.locator("select").first().selectOption("philadelphia");
  await expect(page.locator('.dock [aria-label="Calendar"]')).toContainText(
    "26",
  );
  await expect(
    gallery.locator('[aria-label="October 2026 26, today"]'),
  ).toBeVisible();
  await page.route("**/api/weather?city=london", (r) =>
    r.fulfill({ status: 503, json: { error: "QA failure" } }),
  );
  await gallery.locator("select").first().selectOption("london");
  await expect(gallery.getByText("Checking the sky…")).toBeVisible();
  await expect(gallery.getByText("Weather unavailable")).toBeVisible();
  await page.unroute("**/api/weather?city=london");
  await gallery.getByRole("button", { name: "Try again" }).click();
  await expect(gallery.getByText("Clear sky")).toBeVisible();
});

test("Spotlight supports wraparound, empty results, Escape focus and readable themes", async ({
  page,
}) => {
  await openDesktop(page);
  for (const theme of ["light", "dark"]) {
    await appearance(page, theme);
    await page
      .getByRole("button", { name: "Search workspace", exact: true })
      .click();
    const input = page.getByRole("combobox");
    await input.press("ArrowUp");
    await expect(input).toHaveAttribute(
      "aria-activedescendant",
      "spotlight-option-app-calendar",
    );
    await input.press("ArrowDown");
    await expect(input).toHaveAttribute(
      "aria-activedescendant",
      "spotlight-option-project-edrive",
    );
    const results = await new AxeBuilder({ page })
      .include(".spotlight")
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(results.violations).toEqual([]);
    await input.fill("zz-missing");
    await input.press("ArrowDown");
    await input.press("Enter");
    await expect(page.getByRole("option")).toHaveCount(0);
    await input.press("Escape");
    await expect(
      page.getByRole("button", { name: "Search workspace", exact: true }),
    ).toBeFocused();
  }
});

test("Menus have a single highlight and reduced motion dismisses the overlay", async ({
  page,
}) => {
  await openDesktop(page);
  await page.getByRole("button", { name: "Edit", exact: true }).click();
  const menu = page.getByRole("menu");
  await expect(menu).toBeVisible();
  await page.keyboard.press("ArrowDown");
  await expect(menu.locator("button:focus")).toHaveCount(1);
  const focusedBackground = await menu
    .locator("button:focus")
    .evaluate((e) => getComputedStyle(e).backgroundColor);
  expect(focusedBackground).not.toBe("rgba(0, 0, 0, 0)");
  const highlights = await menu
    .locator("button")
    .evaluateAll(
      (buttons, bg) =>
        buttons.filter((e) => getComputedStyle(e).backgroundColor === bg)
          .length,
      focusedBackground,
    );
  expect(highlights).toBe(1);
  await page.keyboard.press("Escape");
  const cc = await controlCenter(page);
  await cc
    .getByRole("checkbox", { name: "Reduce motion", exact: true })
    .check();
  await page.keyboard.press("Escape");
  await expect(cc).not.toBeVisible();
  await page
    .getByRole("button", { name: "Search workspace", exact: true })
    .click();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("dialog", { name: "Search workspace" }),
  ).not.toBeVisible();
});

test("Launchpad and settings pass automated accessibility checks; 200% equivalent reflow stays usable", async ({
  page,
}) => {
  await openDesktop(page);
  for (const theme of ["light", "dark"]) {
    await appearance(page, theme);
    await page.getByRole("button", { name: "Launchpad", exact: true }).click();
    await expect(
      page.getByRole("textbox", { name: "Search Launchpad" }),
    ).toBeFocused();
    const audit = await new AxeBuilder({ page })
      .include(".launchpad")
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(audit.violations).toEqual([]);
    await page.keyboard.press("Escape");
  }
  // Same CSS layout area as a 1440×900 desktop at 200% browser zoom.
  await page.setViewportSize({ width: 720, height: 450 });
  const cc = await controlCenter(page);
  await cc.getByRole("button", { name: "All settings" }).click();
  const settings = page.locator('[data-window-app="settings"]');
  await settings
    .getByRole("slider", { name: "Dock icon size" })
    .scrollIntoViewIfNeeded();
  await expect(settings.getByRole("slider")).toBeInViewport();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(720);
  const audit = await new AxeBuilder({ page })
    .include(".settings-content")
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(audit.violations).toEqual([]);
});
