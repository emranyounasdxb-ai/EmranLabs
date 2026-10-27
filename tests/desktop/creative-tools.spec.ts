import AxeBuilder from "@axe-core/playwright";
import { test, expect, openDesktop, appearance } from "./fixtures";

const newTools = [
  ["figma", "Figma"],
  ["photoshop", "Photoshop"],
  ["illustrator", "Illustrator"],
  ["premierepro", "Premiere Pro"],
  ["aftereffects", "After Effects"],
  ["blender", "Blender"],
  ["unrealengine", "Unreal Engine"],
  ["cinema4d", "Cinema 4D"],
  ["wordpress", "WordPress"],
] as const;

test("creative tools open honest collections and load their branded icons", async ({
  page,
}) => {
  test.setTimeout(60000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await openDesktop(page);
  await expect(page.locator(".dock .dock-item")).toHaveCount(28);
  await expect(
    page
      .getByRole("group", { name: "Mac apps", exact: true })
      .getByRole("button"),
  ).toHaveCount(8);
  for (const [id, label] of newTools) {
    await page.mouse.move(20, 34);
    await expect(page.locator(".dock")).not.toHaveAttribute(
      "data-moving",
      "true",
    );
    const tool = page.locator(`[data-dock-tool="${id}"]`);
    await expect(tool).toBeVisible();
    await expect
      .poll(() =>
        tool
          .locator("img")
          .evaluate(
            (image: HTMLImageElement) =>
              image.complete && image.naturalWidth > 0,
          ),
      )
      .toBe(true);
    await tool.click();
    await expect(page).toHaveURL(
      (url) =>
        url.pathname ===
          `/workspace/collections/${label.toLowerCase().replaceAll(" ", "-")}` &&
        url.search === "",
    );
    await expect(
      page.getByRole("heading", { name: `Built with ${label}.`, exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: `A ${label} project in mind?` }),
    ).toBeVisible();
    await expect(page.locator(".projects-grid .project-folder")).toHaveCount(0);
  }
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Built with WordPress.", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Search workspace", exact: true })
    .click();
  await page.getByRole("combobox").fill("Cinema 4D");
  await page.getByRole("combobox").press("Enter");
  await expect(
    page.getByRole("heading", { name: "Built with Cinema 4D.", exact: true }),
  ).toBeVisible();
});

test("responsive Dock preserves Mac apps and fits the full icon-size range", async ({
  page,
}) => {
  test.setTimeout(60000);
  await openDesktop(page, "/?app=settings");
  for (const [width, size] of [
    [1920, 40],
    [1440, 35],
    [1280, 40],
    [1024, 35],
    [900, 35],
    [820, 40],
    [761, 40],
  ]) {
    await page.setViewportSize({ width, height: 900 });
    await page
      .getByRole("slider", { name: "Dock icon size" })
      .fill(String(size));
    await page.mouse.move(20, 34);
    await expect(page.locator(".dock")).not.toHaveAttribute(
      "data-moving",
      "true",
    );
    await expect
      .poll(() =>
        page.locator(".dock").evaluate((dock) => {
          const bounds = [dock, ...dock.querySelectorAll(".dock-item")].map(
            (item) => item.getBoundingClientRect(),
          );
          return bounds.every(
            (rect) => rect.left >= 8 && rect.right <= innerWidth - 8,
          );
        }),
      )
      .toBe(true);
    await expect(
      page
        .getByRole("group", { name: "Mac apps", exact: true })
        .getByRole("button"),
    ).toHaveCount(8);
    if (width <= 1280)
      await expect(
        page.getByRole("button", { name: "Design tools", exact: true }),
      ).toBeVisible();
    if (width <= 1024)
      await expect(
        page.getByRole("button", { name: "Development tools", exact: true }),
      ).toBeVisible();
  }
});

test("tool stacks, pinning, keyboard focus and light/dark accessibility work together", async ({
  page,
}) => {
  test.setTimeout(60000);
  await page.setViewportSize({ width: 1024, height: 900 });
  await openDesktop(page);
  for (const theme of ["light", "dark"]) {
    await appearance(page, theme);
    const trigger = page.getByRole("button", {
      name: "Design tools",
      exact: true,
    });
    await trigger.click();
    const panel = page.getByRole("dialog", {
      name: "Design tools",
      exact: true,
    });
    await expect(
      panel.getByRole("button", { name: "Photoshop", exact: true }),
    ).toBeVisible();
    const results = await new AxeBuilder({ page })
      .include(".dock-stack")
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(results.violations).toEqual([]);
    await page.keyboard.press("Escape");
    await expect(trigger).toBeFocused();
  }
  await page.getByRole("button", { name: "Design tools", exact: true }).click();
  const panel = page.getByRole("dialog", { name: "Design tools", exact: true });
  await panel
    .getByRole("button", { name: "Keep Figma in Dock", exact: true })
    .click();
  await panel.getByRole("button", { name: "Figma", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Built with Figma.", exact: true }),
  ).toBeVisible();
  await page.reload();
  const pinned = page.getByRole("button", {
    name: "Figma projects",
    exact: true,
  });
  await expect(pinned).toBeVisible();
  await pinned.click({ button: "right" });
  await page
    .getByRole("menuitemcheckbox", { name: "Keep in Dock", exact: true })
    .click();
  await expect(pinned).toHaveCount(0);
  await page.getByRole("button", { name: "Launchpad", exact: true }).click();
  const launchpad = page.getByRole("dialog", {
    name: "Launchpad",
    exact: true,
  });
  await launchpad
    .getByRole("textbox", { name: "Search Launchpad" })
    .fill("adobe");
  for (const label of [
    "Photoshop",
    "Illustrator",
    "Premiere Pro",
    "After Effects",
  ])
    await expect(
      launchpad.getByRole("button", { name: label, exact: true }),
    ).toBeVisible();
});

test("customer pages and structured data expose no GitHub or repository destinations", async ({
  request,
}) => {
  for (const path of [
    "/",
    "/about",
    "/services",
    "/contact",
    "/projects/edrive",
    "/projects/inaya",
    "/projects/emranlabs",
  ]) {
    const response = await request.get(path);
    expect(response.status()).toBe(200);
    expect(await response.text()).not.toMatch(
      /github|githubusercontent|emranyounasdxb-ai|repository/i,
    );
  }
});
