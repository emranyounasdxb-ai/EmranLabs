import AxeBuilder from "@axe-core/playwright";
import { test, expect, openDesktop, appearance } from "./fixtures";

test("contact API rejects invalid requests and reports missing delivery configuration", async ({
  request,
}, info) => {
  test.skip(
    info.project.name !== "chromium",
    "Server checks run once; UI flows run in every engine.",
  );
  const availability = await request.get("/api/contact");
  expect(availability.status()).toBe(200);
  const state = await availability.json();
  expect(Object.keys(state)).toEqual(["available"]);
  const denied = await request.post("/api/contact", {
    headers: { Origin: "https://unrelated.example" },
    data: {},
  });
  expect(denied.status()).toBe(403);
  const invalid = await request.post("/api/contact", { data: { name: "X" } });
  expect(invalid.status()).toBe(400);
  // Never submit a valid request to a configured mailbox in an automated test.
  if (state.available === false) {
    const response = await request.post("/api/contact", {
      data: {
        name: "Local Test",
        email: "visitor@example.com",
        inquiryType: "Web application",
        subject: "Local validation test",
        message: "This checks the unconfigured local delivery fallback.",
        consent: true,
        website: "",
        startedAt: Date.now() - 10000,
        project: "eDrive",
        tool: "Figma",
        budget: "USD 1,000–5,000",
        timeframe: "1–3 months",
      },
    });
    expect(response.status()).toBe(503);
    expect((await response.json()).code).toBe("CONTACT_UNAVAILABLE");
  }
});

test("welcome actions and confirmed social destinations are clear", async ({
  page,
}) => {
  await openDesktop(page);
  await page
    .locator('[data-window-app="projects"]')
    .getByRole("button", { name: "Close window", exact: true })
    .click();
  const welcome = page.getByRole("region", { name: "Welcome to Emran Labs" });
  await expect(
    welcome.getByRole("heading", { name: "Hi, I’m Emran." }),
  ).toBeVisible();
  await expect(
    page.locator(".dock").getByRole("link", { name: "Instagram", exact: true }),
  ).toHaveAttribute("href", "https://www.instagram.com/emranlabs/");
  await expect(
    page.locator(".dock").getByRole("link", { name: "YouTube", exact: true }),
  ).toHaveAttribute("href", "https://www.youtube.com/@EmranLabs");
  expect(
    (
      await new AxeBuilder({ page })
        .include(".welcome-workspace")
        .withTags(["wcag2a", "wcag2aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await welcome
    .getByRole("button", { name: "View Projects", exact: true })
    .click();
  await expect(page).toHaveURL(/collection=All\+Projects/);
});

test("sidebar groups persist, reveal a selected tool, and carry it to an enquiry", async ({
  page,
}) => {
  // This preview-only test must remain safe after real SMTP is configured.
  await page.route("**/api/contact", (route) =>
    route.request().method() === "GET"
      ? route.fulfill({ json: { available: false } })
      : route.abort(),
  );
  await openDesktop(page);
  const sidebar = page.getByRole("navigation", { name: "Project collections" });
  const design = sidebar.getByRole("button", { name: "Design", exact: true });
  await design.click();
  await expect(design).toHaveAttribute("aria-expanded", "false");
  await expect(
    sidebar.getByRole("button", { name: "Figma", exact: true }),
  ).toBeHidden();
  await page.reload();
  await expect(design).toHaveAttribute("aria-expanded", "false");
  await page.locator('[data-dock-tool="figma"]').click();
  await expect(design).toHaveAttribute("aria-expanded", "true");
  await expect(
    sidebar.getByRole("button", { name: "Figma", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await expect(
    sidebar
      .getByRole("button", { name: "Figma", exact: true })
      .locator(".collection-count"),
  ).toHaveText("0");
  await page
    .getByRole("button", { name: "Discuss this type of project" })
    .click();
  await expect(page.locator(".enquiry-context")).toContainText("Figma");
  await page.reload();
  await expect(page.locator(".enquiry-context")).toContainText("Figma");
  await page.getByLabel("Your name", { exact: true }).fill("Test Visitor");
  await page
    .getByLabel("Email address", { exact: true })
    .fill("visitor@example.com");
  await page
    .getByLabel("A little about your project")
    .fill("I would like to discuss a prototype for my business website.");
  await page
    .getByRole("checkbox", { name: "You may use these details" })
    .check();
  await page.getByRole("button", { name: "Prepare enquiry" }).click();
  await expect(
    page.getByRole("region", { name: "Enquiry preview" }),
  ).toContainText("Tool / collection: Figma");
  await expect(
    page.getByRole("link", { name: "Open email draft" }),
  ).toHaveAttribute("href", /^mailto:helo@emranlabs.com/);
});

test("enquiry delivery handles success and failure without sending real email", async ({
  page,
}) => {
  let posts = 0;
  let payload: Record<string, unknown> = {};
  await page.route("**/api/contact", async (route) => {
    if (route.request().method() === "GET")
      return route.fulfill({ json: { available: true } });
    posts++;
    payload = route.request().postDataJSON();
    return route.fulfill(
      posts === 1
        ? { status: 502, json: { ok: false, code: "CONTACT_DELIVERY_FAILED" } }
        : { json: { ok: true, message: "Received", requestId: "local-test" } },
    );
  });
  await page.goto("/contact?project=edrive&tool=Figma");
  await expect(page.locator(".enquiry-context")).toContainText(
    "eDrive · Figma",
  );
  await page.getByLabel("Your name", { exact: true }).fill("Test Visitor");
  await page
    .getByLabel("Email address", { exact: true })
    .fill("visitor@example.com");
  await page.locator(".optional-project-details summary").click();
  await page
    .getByLabel("Budget", { exact: false })
    .selectOption("USD 1,000–5,000");
  await page
    .getByLabel("Timeframe", { exact: false })
    .selectOption("1–3 months");
  await page
    .getByLabel("A little about your project")
    .fill("A business website with clear services and an enquiry form.");
  await page
    .getByRole("checkbox", { name: "You may use these details" })
    .check();
  await page.getByRole("button", { name: "Send enquiry", exact: true }).click();
  await expect(page.locator(".contact-panel").getByRole("alert")).toContainText(
    "could not be sent",
  );
  await expect(page.getByLabel("Your name", { exact: true })).toHaveValue(
    "Test Visitor",
  );
  await page.getByRole("button", { name: "Send enquiry", exact: true }).click();
  await expect(
    page.getByText("Your enquiry has been sent.", { exact: false }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Enquiry sent" }),
  ).toBeDisabled();
  expect(payload).toMatchObject({
    project: "eDrive",
    tool: "Figma",
    budget: "USD 1,000–5,000",
    timeframe: "1–3 months",
    consent: true,
  });
  expect(posts).toBe(2);
});

test("screenshot viewer supports zoom, navigation, Escape and mobile sizing", async ({
  page,
}) => {
  await page.goto("/projects/edrive");
  // A new visitor can dismiss the first-visit privacy card without granting consent.
  await page.getByRole("button", { name: "Close privacy preferences" }).click();
  const trigger = page.getByRole("button", {
    name: "Enlarge: eDrive website screenshot",
    exact: true,
  });
  await trigger.click();
  const viewer = page.getByRole("dialog", {
    name: "Project screenshot viewer",
  });
  await expect(viewer).toBeVisible();
  const fittedImage = await viewer
    .locator(".image-viewer-canvas img")
    .boundingBox();
  const canvas = await viewer.locator(".image-viewer-canvas").boundingBox();
  expect(fittedImage!.height).toBeLessThanOrEqual(canvas!.height + 1);
  expect(fittedImage!.width).toBeLessThanOrEqual(canvas!.width + 1);
  await viewer.getByRole("button", { name: "Zoom in", exact: true }).click();
  await expect(
    viewer.getByRole("button", { name: "Fit screenshot" }),
  ).toHaveText("125%");
  await viewer.getByRole("button", { name: "Next screenshot" }).click();
  await expect(viewer.locator(".image-viewer-toolbar")).toContainText("2 / 3");
  await expect(
    viewer.getByRole("button", { name: "Fit screenshot" }),
  ).toHaveText("100%");
  await page.keyboard.press("ArrowLeft");
  await expect(viewer.locator(".image-viewer-toolbar")).toContainText("1 / 3");
  expect(
    (
      await new AxeBuilder({ page })
        .include(".project-image-viewer")
        .withTags(["wcag2a", "wcag2aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(viewer).toBeHidden();
  await expect(trigger).toBeFocused();
  await page.setViewportSize({ width: 390, height: 844 });
  await trigger.click();
  await expect(viewer).toBeVisible();
  const rect = await viewer.boundingBox();
  expect(rect!.x).toBeGreaterThanOrEqual(0);
  expect(rect!.width).toBeLessThanOrEqual(390);
  await viewer.getByRole("button", { name: "Close screenshot viewer" }).click();
  await expect(viewer).toBeHidden();
});

test("motion status follows local and system preferences and dark surfaces remain readable", async ({
  page,
}) => {
  await openDesktop(page, "/?app=settings");
  const settings = page.locator('[data-window-app="settings"]');
  await settings.getByRole("checkbox", { name: /Reduce motion/i }).check();
  await expect(
    settings.getByText("Paused by Reduce Motion", { exact: true }),
  ).toBeVisible();
  await settings.getByRole("checkbox", { name: /Reduce motion/i }).uncheck();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(
    settings.getByText("Paused by system Reduce Motion", { exact: true }),
  ).toBeVisible();
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await appearance(page, "dark");
  await page.locator('[data-dock-tool="figma"]').click();
  // Contrast applies to the settled surface, not a frame of its opening fade.
  await page
    .locator('[data-window-app="projects"]')
    .evaluate(async (element) => {
      await Promise.all(
        element
          .getAnimations({ subtree: true })
          .filter(
            (animation) =>
              animation.effect?.getTiming().iterations !== Infinity,
          )
          .map((animation) => animation.finished.catch(() => undefined)),
      );
    });
  expect(
    (
      await new AxeBuilder({ page })
        .include(".tool-collection-intro")
        .include(".finder-sidebar")
        .withTags(["wcag2a", "wcag2aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
});
