import { test, expect, openDesktop } from "./fixtures";

test("Back can leave the desktop for a public page", async ({ page }) => {
  await page.goto("/about");
  await page
    .getByRole("button", { name: "Use limited mode", exact: true })
    .click();
  await page
    .getByRole("link", { name: "Explore my work", exact: true })
    .click();
  await expect(page).toHaveURL(/\/workspace\/projects$/);
  await expect(page.locator(".mac-desktop")).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(/\/about$/);
  await expect(
    page.getByRole("link", { name: "Explore my work", exact: true }),
  ).toBeVisible();
  await page.goForward();
  await expect(page).toHaveURL(/\/workspace\/projects$/);
  await expect(page.locator(".mac-desktop")).toBeVisible();
});

test("clean desktop paths survive refresh, history and saved workspace state", async ({
  page,
}) => {
  await openDesktop(page, "/?app=notes");
  await expect(page).toHaveURL(/\/workspace\/notes$/);
  await page.getByRole("button", { name: "Calendar", exact: true }).click();
  await expect(page).toHaveURL(/\/workspace\/calendar$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/workspace\/notes$/);
  await expect(page.locator('[data-window-app="notes"]')).toBeVisible();
  await page.goForward();
  await expect(page).toHaveURL(/\/workspace\/calendar$/);
  await expect(page.locator('[data-window-app="calendar"]')).toBeVisible();
  await page.reload();
  await expect(page.locator('[data-window-app="calendar"]')).toBeVisible();
  // An explicit shared project link takes priority over this device's saved app.
  await page.goto("/workspace/projects/edrive");
  await expect(page.locator(".project-detail")).toContainText("eDrive");
  await expect(page).toHaveURL(/\/workspace\/projects\/edrive$/);
  await page.reload();
  await expect(page.locator(".project-detail")).toContainText("eDrive");
  await expect(
    page.getByRole("region", { name: "Privacy preferences" }),
  ).toBeHidden();
  await expect(
    page.getByRole("button", { name: /^Privacy preferences, Google/ }),
  ).toHaveCount(0);
});

test("old collection links migrate and direct contact paths retain their context", async ({
  page,
}) => {
  await openDesktop(page, "/?collection=Next.js");
  await expect(page).toHaveURL(/\/workspace\/collections\/next-js$/);
  await page.reload();
  await expect(
    page
      .getByRole("navigation", { name: "Project collections" })
      .getByRole("button", { name: "Next.js", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await page.goto("/contact/project/edrive/tool/figma");
  await expect(page.locator(".enquiry-context")).toContainText(
    "eDrive · Figma",
  );
  // Let automatic Link prefetches finish before tearing down the document.
  // WebKit reports aborted unload-time fetches as access-control page errors.
  await page.waitForLoadState("networkidle");
  await page.reload();
  await expect(page.locator(".enquiry-context")).toContainText(
    "eDrive · Figma",
  );
  const whatsapp = await page
    .getByRole("link", { name: "WhatsApp Emran — Pakistan" })
    .getAttribute("href");
  expect(new URL(whatsapp!).searchParams.get("text")).toContain("eDrive");
  await page.waitForLoadState("networkidle");
  await page.goto("/contact?service=business-automation");
  await expect(page).toHaveURL(/\/contact\/service\/business-automation$/);
  await expect(page.getByLabel("What do you have in mind?")).toHaveValue(
    "Business workflow or automation",
  );
});

test("clean route responses preserve SEO pages and reject unknown contexts", async ({
  request,
}, info) => {
  test.skip(info.project.name !== "chromium", "HTTP contracts run once.");
  for (const path of [
    "/workspace/settings",
    "/workspace/projects/edrive",
    "/workspace/collections/next-js",
    "/contact/service/business-automation",
  ]) {
    const response = await request.get(path);
    expect(response.status()).toBe(200);
    expect(await response.text()).toContain('content="noindex, follow"');
  }
  for (const path of [
    "/workspace/unknown",
    "/workspace/projects/missing",
    "/contact/project/missing",
    "/contact/tool/unknown",
  ])
    expect((await request.get(path)).status()).toBe(404);
  const project = await request.get("/projects/edrive");
  expect(project.status()).toBe(200);
  expect(await project.text()).toContain('href="/contact/project/edrive"');
});
