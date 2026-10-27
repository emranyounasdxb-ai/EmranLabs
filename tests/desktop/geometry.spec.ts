import { test, expect, openDesktop } from "./fixtures";

test("drag release commits geometry without a second position animation", async ({
  page,
}) => {
  await openDesktop(page, "/?app=notes");
  const win = page.locator('[data-window-app="notes"]');
  await expect
    .poll(() =>
      win.evaluate(
        (e) =>
          e.getAnimations().filter((a) => a.playState === "running").length,
      ),
    )
    .toBe(0);
  const toolbar = await win.locator(".finder-toolbar").boundingBox();
  await page.mouse.move(toolbar!.x + toolbar!.width / 2, toolbar!.y + 20);
  await page.mouse.down();
  await page.mouse.move(toolbar!.x + toolbar!.width / 2 + 60, toolbar!.y + 60, {
    steps: 10,
  });
  await page.mouse.up();
  const transitions = await win.evaluate(
    (e) =>
      e
        .getAnimations()
        .filter(
          (a) =>
            a instanceof CSSTransition &&
            ["left", "top"].includes(a.transitionProperty),
        ).length,
  );
  expect(transitions).toBe(0);
  await expect(win).not.toHaveClass(/interacting/);
  const style = await win.getAttribute("style");
  await page.reload();
  await expect(win).toHaveAttribute("style", style!);
  const handle = win.getByRole("button", {
    name: "Resize window se",
    exact: true,
  });
  const rect = await handle.boundingBox();
  const initial = await win.boundingBox();
  await page.mouse.move(rect!.x + rect!.width / 2, rect!.y + rect!.height / 2);
  await page.mouse.down();
  await page.mouse.move(rect!.x + 50, rect!.y - 30, { steps: 10 });
  await page.mouse.up();
  await expect
    .poll(async () => (await win.boundingBox())!.width)
    .toBeGreaterThan(initial!.width);
});
