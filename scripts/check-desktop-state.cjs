const assert = require("node:assert/strict");
const { load } = require("./load-workspace-checks.cjs");
const { windowReducer, initialDesktopState } = load("window-manager");
const { desktopUrl, parseDesktopLocation, desktopRoutes } =
  load("desktop-location");
const { contactUrl, parseContactPath, parseContactLocation } =
  load("contact-location");
let state = initialDesktopState;
const send = (action) => (state = windowReducer(state, action));
send({ type: "open", id: "notes" });
send({ type: "open", id: "about" });
assert.equal(state.windows.length, 3);
assert.equal(state.active, "about");
send({ type: "focus", id: "projects" });
assert.equal(state.active, "projects");
assert.equal(state.windows.at(-1).id, "projects");
send({ type: "minimize", id: "projects" });
assert.equal(state.active, "about");
assert.equal(state.windows.find((w) => w.id === "projects").minimized, true);
send({ type: "focus", id: "projects" });
assert.equal(state.active, "about");
send({ type: "open", id: "projects" });
assert.equal(state.windows.length, 3);
assert.equal(state.windows.at(-1).minimized, false);
send({ type: "close", id: "projects" });
assert.equal(state.active, "about");
assert.equal(state.windows.length, 2);
send({ type: "close", id: "notes" });
assert.equal(state.active, "about");
send({ type: "show-desktop" });
assert.ok(state.windows.every((w) => w.minimized));
send({ type: "open", id: "about" });
assert.equal(state.windows.length, 1);
assert.equal(state.windows[0].minimized, false);
send({ type: "close", id: "about" });
assert.equal(state.windows.length, 0);
for (let i = 0; i < 200; i++) {
  send({ type: "open", id: ["projects", "notes", "about", "contact"][i % 4] });
  assert.equal(
    new Set(state.windows.map((w) => w.id)).size,
    state.windows.length,
  );
  assert.equal(state.windows.at(-1).id, state.active);
}
for (const app of [
  "projects",
  "about",
  "contact",
  "notes",
  "settings",
  "services",
]) {
  const url = desktopUrl(app);
  assert.equal(parseDesktopLocation(url).app, app);
}
assert.equal(parseDesktopLocation("?project=edrive").project, "edrive");
assert.equal(parseDesktopLocation("?project=unknown&app=bad").app, "projects");
assert.equal(parseDesktopLocation("?collection=Next.js").collection, "Next.js");
assert.equal(
  desktopUrl("projects", "All Projects", null),
  "/workspace/projects",
);
assert.equal(
  parseDesktopLocation("?app=contact&project=inaya").app,
  "projects",
);
assert.equal(
  new Set(desktopRoutes.map(({ path }) => path)).size,
  desktopRoutes.length,
);
for (const { path, location } of desktopRoutes) {
  assert.match(path, /^\/workspace\/[a-z0-9/-]+$/);
  assert.deepEqual(parseDesktopLocation(path), location);
  assert.equal(
    desktopUrl(location.app, location.collection, location.project),
    path,
  );
}
assert.equal(
  contactUrl({ project: "eDrive", tool: "Figma" }),
  "/contact/project/edrive/tool/figma",
);
assert.deepEqual(parseContactPath("/contact/project/edrive/tool/figma"), {
  project: "eDrive",
  tool: "Figma",
});
assert.equal(
  contactUrl(parseContactLocation("/contact", "?service=business-automation")),
  "/contact/service/business-automation",
);
for (const invalid of [
  "/contact/project/missing",
  "/contact/project",
  "/contact/project/edrive/project/inaya",
  "/contact/email/customer@example.com",
  "/contact/tool/missing",
  "/contact/service/missing",
])
  assert.equal(parseContactPath(invalid), null);
assert.equal(
  contactUrl({ project: "customer@example.com", tool: "unknown" }),
  "/contact",
);
console.log(
  "Window lifecycle, duplicate prevention, focus restoration and URL round-trip checks passed.",
);
const { parseWorkspace, clampSavedFrame } = load("desktop-preferences");
const { parseWidgets, monthGrid, dateInZone, temperatureLabel } =
  load("widget-data");
assert.equal(parseWorkspace("{broken"), null);
const restored = parseWorkspace(
  JSON.stringify({
    desktop: {
      windows: [
        { id: "notes", minimized: false },
        { id: "notes", minimized: true },
        { id: "bad" },
        { id: "about", minimized: true },
      ],
      active: "bad",
    },
    collection: "bad",
    project: "fake",
    sort: "bad",
  }),
);
assert.equal(restored.desktop.windows.length, 2);
assert.equal(restored.desktop.active, "notes");
assert.equal(restored.collection, "Overview");
assert.equal(restored.project, null);
assert.equal(restored.sort, "featured");
assert.equal(
  clampSavedFrame({ x: NaN, y: 3, width: 800, height: 500 }, 1366, 768),
  null,
);
const frame = clampSavedFrame(
  { x: 5000, y: -200, width: 2000, height: 1900 },
  1366,
  768,
);
assert.ok(
  frame.x >= 8 &&
    frame.y >= 38 &&
    frame.x + frame.width <= 1358 &&
    frame.y + frame.height <= 682,
);
assert.equal(parseWidgets("{oops").city, "dubai");
assert.equal(parseWidgets('{"city":"__proto__"}').city, "dubai");
const widgetSettings = parseWidgets(
  '{"city":"london","fahrenheit":true,"visible":{"clock":false},"positions":{"clock":{"x":-50,"y":-100},"weather":{"x":"bad","y":22}}}',
);
assert.equal(widgetSettings.city, "london");
assert.equal(widgetSettings.visible.clock, false);
assert.equal(widgetSettings.visible.calendar, true);
assert.equal(widgetSettings.positions.clock.x, 8);
assert.equal(widgetSettings.positions.weather, undefined);
assert.equal(monthGrid(2024, 1).filter(Boolean).length, 29);
assert.equal(monthGrid(2025, 1).filter(Boolean).length, 28);
assert.equal(monthGrid(2026, 9).length, 42);
assert.equal(monthGrid(2026, 9).indexOf(1), 3);
const dubai = dateInZone(new Date("2026-10-26T21:30:00Z"), "Asia/Dubai");
assert.equal(dubai.day, 27);
assert.equal(dubai.hour, 1);
const ny = dateInZone(new Date("2026-03-08T07:30:00Z"), "America/New_York");
assert.equal(ny.hour, 3);
assert.equal(temperatureLabel(0, true), "32°");
assert.equal(temperatureLabel(29.6, false), "30°");
console.log(
  "Saved-state validation, viewport clamping, widget preferences, leap years, timezone boundaries and temperature conversion passed.",
);
