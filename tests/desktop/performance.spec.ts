import { test, expect, openDesktop } from "./fixtures";

// Trace DOM snapshots/screencasts add overhead to every pointer sample.
test.use({ trace: "off", screenshot: "off", fixedClock: false });

test("motion stays interactive with 4x CPU throttling", async ({
  page,
  browser,
}, info) => {
  test.setTimeout(60000);
  await openDesktop(page, "/?collection=All+Projects");
  // Measure interactions after the initial font/image/entrance work has settled.
  await page.evaluate(() => document.fonts.ready);
  await expect(page.getByText("Clear sky", { exact: true })).toBeVisible();
  await expect
    .poll(() =>
      page
        .locator(".dock")
        .evaluate(
          (e) =>
            e.getAnimations().filter((a) => a.playState === "running").length,
        ),
    )
    .toBe(0);
  const client = await page.context().newCDPSession(page);
  const browserClient = await browser.newBrowserCDPSession();
  const system = await browserClient.send("SystemInfo.getInfo");
  await browserClient.detach();
  await client.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await page.evaluate(async () => {
    await Promise.all(
      Array.from(document.images, (image) => image.decode().catch(() => {})),
    );
    // Visible layout can precede the first composited paint. Let decoded images
    // reach the display before sampling steady-state interactions.
    for (let i = 0; i < 3; i++)
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => resolve()),
      );
  });
  await page.evaluate(() => {
    const samples = {
      started: performance.now(),
      frames: [] as number[],
      events: [] as number[],
      longFrames: [] as number[],
      details: [] as {
        name: string;
        duration: number;
        phase: string;
        timing: Record<string, unknown>;
      }[],
      phase: "dock",
      last: 0,
      raf: 0,
      observers: [] as PerformanceObserver[],
    };
    window.__motionQA = samples;
    const tick = (now: number) => {
      if (samples.last) samples.frames.push(now - samples.last);
      samples.last = now;
      samples.raf = requestAnimationFrame(tick);
    };
    samples.raf = requestAnimationFrame(tick);
    for (const type of ["event", "long-animation-frame"]) {
      if (!PerformanceObserver.supportedEntryTypes.includes(type)) continue;
      const observer = new PerformanceObserver((list) => {
        for (const e of list.getEntries()) {
          if (e.startTime < samples.started) continue;
          (type === "event" ? samples.events : samples.longFrames).push(
            e.duration,
          );
          samples.details.push({
            name: e.name,
            duration: e.duration,
            phase: samples.phase,
            timing: e.toJSON(),
          });
        }
      });
      observer.observe({
        type,
        buffered: false,
        durationThreshold: 16,
      } as PerformanceObserverInit);
      samples.observers.push(observer);
    }
  });
  const dock = await page.locator(".dock").boundingBox();
  await page.mouse.move(dock!.x + 10, dock!.y + 25);
  await page.mouse.move(dock!.x + dock!.width - 10, dock!.y + 25, {
    steps: 45,
  });
  await page.getByRole("button", { name: "Notes", exact: true }).click();
  const win = page.locator('[data-window-app="notes"]');
  await expect(win).toBeVisible();
  await page.evaluate(() => {
    window.__motionQA.phase = "drag";
  });
  const title = await win.locator(".finder-toolbar").boundingBox();
  await page.mouse.move(title!.x + title!.width / 2, title!.y + 20);
  await page.mouse.down();
  await page.mouse.move(title!.x + title!.width / 2 + 100, title!.y + 95, {
    steps: 35,
  });
  await page.mouse.up();
  await page.evaluate(() => {
    window.__motionQA.phase = "minimize-restore";
  });
  await win
    .getByRole("button", { name: "Minimize window", exact: true })
    .click();
  await expect(win).not.toBeVisible();
  await page.getByRole("button", { name: "Notes", exact: true }).click();
  await expect(win).toBeVisible();
  await page.evaluate(() => {
    window.__motionQA.phase = "spotlight";
  });
  await page
    .getByRole("button", { name: "Search workspace", exact: true })
    .click();
  await expect(page.getByRole("combobox")).toBeFocused();
  await page.keyboard.press("Escape");
  await page.mouse.move(20, 35);
  await expect(page.locator(".dock")).not.toHaveAttribute(
    "data-moving",
    "true",
  );
  const metrics = await page.evaluate(() => {
    const s = window.__motionQA;
    cancelAnimationFrame(s.raf);
    s.observers.forEach((o: PerformanceObserver) => o.disconnect());
    const sorted = [...s.frames].sort((a: number, b: number) => a - b);
    return {
      cpuSlowdown: 4,
      frames: sorted.length,
      medianFrameMs: sorted[Math.floor(sorted.length * 0.5)],
      p95FrameMs: sorted[Math.floor(sorted.length * 0.95)],
      maxEventMs: Math.max(0, ...s.events),
      longAnimationFrames: s.longFrames.length,
      maxLongFrameMs: Math.max(0, ...s.longFrames),
      slowLongFrames: s.details
        .filter((e) => e.name === "long-animation-frame")
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 3),
      slowest: s.details
        .sort(
          (a: { duration: number }, b: { duration: number }) =>
            b.duration - a.duration,
        )
        .slice(0, 8),
    };
  });
  await info.attach("motion-performance.json", {
    body: JSON.stringify(
      {
        ...metrics,
        renderer: system.gpu.devices,
        features: system.gpu.featureStatus,
      },
      null,
      2,
    ),
    contentType: "application/json",
  });
  console.log("Motion sample", metrics);
  expect(metrics.frames).toBeGreaterThan(10);
  // Guard gross stalls; the measured report, not a universal FPS claim, is the output.
  expect(metrics.maxEventMs).toBeLessThan(1000);
  await client.send("Emulation.setCPUThrottlingRate", { rate: 1 });
});

declare global {
  interface Window {
    __motionQA: {
      started: number;
      frames: number[];
      events: number[];
      longFrames: number[];
      details: {
        name: string;
        duration: number;
        phase: string;
        timing: Record<string, unknown>;
      }[];
      phase: string;
      last: number;
      raf: number;
      observers: PerformanceObserver[];
    };
  }
}
