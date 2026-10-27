import { test, expect, openDesktop } from "./fixtures";
import AxeBuilder from "@axe-core/playwright";

test("business collections retain tool browsing and survive URL reload", async ({
  page,
}) => {
  await openDesktop(page, "/?collection=All+Projects");
  await page
    .getByRole("navigation", { name: "Browse by business need" })
    .getByRole("button", { name: "Booking Systems" })
    .click();
  await expect(page.locator(".projects-grid .project-folder")).toHaveCount(1);
  await expect(page.locator(".projects-grid")).toContainText("eDrive");
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "From browsing to a clear request." }),
  ).toBeVisible();
  const sidebar = page.getByRole("navigation", { name: "Project collections" });
  await sidebar.getByRole("button", { name: "React", exact: true }).click();
  await expect(page.locator(".projects-grid .project-folder")).toHaveCount(3);
  await expect(page.locator('[data-dock-tool="figma"]')).toBeAttached();
});

test("contact links preserve project context with equal countries on a phone", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/contact?project=edrive");
  const cards = page.locator(".contact-country-card");
  const left = await cards.nth(0).boundingBox(),
    right = await cards.nth(1).boundingBox();
  expect(Math.abs(left!.width - right!.width)).toBeLessThan(1);
  expect(Math.abs(left!.y - right!.y)).toBeLessThan(1);
  await expect(
    page.getByRole("link", { name: "Call Emran — Pakistan" }),
  ).toHaveAttribute("href", "tel:+923233333898");
  await expect(
    page.getByRole("link", { name: "SMS Emran — United Arab Emirates" }),
  ).toHaveAttribute("href", "sms:+971523857572");
  const href = await page
    .getByRole("link", { name: "WhatsApp Emran — Pakistan" })
    .getAttribute("href");
  expect(new URL(href!).searchParams.get("text")).toContain("eDrive");
  await expect(page.getByLabel("Budget", { exact: false })).toBeHidden();
  await page.locator(".optional-project-details summary").click();
  await expect(page.getByLabel("Budget", { exact: false })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    390,
  );
  expect(
    (
      await new AxeBuilder({ page })
        .include(".direct-contact")
        .withTags(["wcag2a", "wcag2aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
});

test("service brief preselects service and sends only a mocked enquiry", async ({
  page,
}) => {
  let payload: Record<string, unknown> = {};
  await page.route("**/api/contact", (route) => {
    if (route.request().method() === "GET")
      return route.fulfill({ json: { available: true } });
    payload = route.request().postDataJSON();
    return route.fulfill({ json: { ok: true, confirmation: "sent" } });
  });
  await page.goto("/services/business-automation");
  await page
    .getByRole("link", { name: "Discuss your project", exact: true })
    .click();
  await expect(page.getByLabel("What do you have in mind?")).toHaveValue(
    "Business workflow or automation",
  );
  await page.getByLabel("Your name", { exact: true }).fill("Local QA");
  await page
    .getByLabel("Email address", { exact: true })
    .fill("local@example.com");
  await page
    .getByLabel("A little about your project")
    .fill("I need to connect our enquiry and follow-up workflow.");
  await page
    .getByRole("checkbox", { name: "You may use these details" })
    .check();
  await page.getByRole("button", { name: "Send enquiry", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Enquiry sent" }),
  ).toBeDisabled();
  expect(payload.inquiryType).toBe("SaaS or business automation");
  expect(payload.service).toBe("business-automation");
});

test("separate consent choices persist and local previews never load tracking tags", async ({
  page,
}) => {
  const requests: string[] = [];
  page.on("request", (request) => {
    if (
      /googletagmanager|google-analytics|connect\.facebook|facebook\.com\/tr/.test(
        request.url(),
      )
    )
      requests.push(request.url());
  });
  await page.goto("/contact");
  await expect(
    page.getByRole("heading", { name: "Privacy preferences" }),
  ).toBeVisible();
  await expect(
    page.getByRole("checkbox", { name: /Meta Pixel/ }),
  ).not.toBeChecked();
  await page.getByRole("checkbox", { name: /Google Analytics/ }).check();
  await page.getByRole("button", { name: "Save choices", exact: true }).click();
  await page.reload();
  await expect(
    page.getByRole("button", {
      name: "Privacy preferences, Google granted, Meta denied, LinkedIn denied",
    }),
  ).toBeVisible();
  await expect(page.locator('script[src*="googletagmanager"]')).toHaveCount(0);
  await page
    .getByRole("button", {
      name: "Privacy preferences, Google granted, Meta denied, LinkedIn denied",
    })
    .click();
  await page.getByRole("checkbox", { name: /Google Analytics/ }).uncheck();
  await page.getByRole("checkbox", { name: /Meta Pixel/ }).check();
  await page.getByRole("button", { name: "Save choices", exact: true }).click();
  await page.reload();
  await page
    .getByRole("button", {
      name: "Privacy preferences, Google denied, Meta granted, LinkedIn denied",
    })
    .click();
  await page
    .getByRole("button", { name: "Use limited mode", exact: true })
    .click();
  await page.reload();
  await expect(
    page.getByRole("button", {
      name: "Privacy preferences, Google denied, Meta denied, LinkedIn denied",
    }),
  ).toBeVisible();
  await expect(page.locator('script[src*="facebook"]')).toHaveCount(0);
  expect(requests).toEqual([]);
});

test("walkthrough uses real mobile imagery and an on-demand captioned video", async ({
  page,
  request,
}) => {
  await page.goto("/projects/edrive");
  const tour = page.getByRole("region", { name: "eDrive screen walkthrough" });
  await tour.getByRole("button", { name: "Next tour screen" }).click();
  await expect(tour.locator(".tour-caption")).toContainText(
    "Package discovery",
  );
  await tour.getByRole("button", { name: "Mobile", exact: true }).click();
  await expect(
    tour.getByAltText("eDrive captured on a mobile viewport"),
  ).toBeVisible();
  await expect(tour.locator("video")).toHaveAttribute("preload", "none");
  await tour.locator("summary").click();
  await expect(tour.locator("video")).toBeVisible();
  expect((await request.get("/videos/edrive-screen-tour.mp4")).status()).toBe(
    200,
  );
  expect((await request.get("/videos/edrive-screen-tour.vtt")).status()).toBe(
    200,
  );
});

test("sharing metadata and service sitemap are project-specific", async ({
  request,
}) => {
  for (const id of ["edrive", "inaya", "emranlabs"]) {
    const html = await (await request.get(`/projects/${id}`)).text();
    expect(html).toContain(`https://emranlabs.com/images/social/${id}.png`);
    const image = await request.get(`/images/social/${id}.png`);
    expect(image.status()).toBe(200);
    expect(image.headers()["content-type"]).toContain("image/png");
  }
  const sitemap = await (await request.get("/sitemap.xml")).text();
  for (const id of [
    "business-websites",
    "booking-systems",
    "business-automation",
    "interface-design",
    "cloud-it",
  ]) {
    expect(sitemap).toContain(`/services/${id}`);
    expect((await request.get(`/services/${id}`)).status()).toBe(200);
  }
  expect((await request.get("/services/missing-service")).status()).toBe(404);
});
