# Desktop refinement and browser verification — 27 October 2026

Local-only work at http://127.0.0.1:3000. This implements the eight approved follow-up improvements.

## Implementation

1. **Readable glass and dark Spotlight:** shared surface, primary/secondary text, selection and border colours; dark Spotlight; clearer placeholder and scrollbar; visible keyboard focus; opaque and increased-contrast variants.
2. **Motion efficiency:** dock positions are measured on layout changes instead of every pointer event. Pointer input is consumed once per animation frame. Neighbour spacing uses a linear pass instead of a nested loop; promotion hints are released when the spring settles. Window dragging uses compositor translation; resize writes are coalesced per frame; React commits and persists the final pointer position on gesture completion. Launch, minimize, restore and reduced-motion behavior are preserved.
3. **Repeatable regression coverage:** Playwright functional tests across Chromium, Firefox and WebKit, isolated browser contexts, deterministic test-only weather, Chromium screenshot baselines, axe accessibility checks, and a Windows CI job. Time is fixed only for screenshot/date scenarios; other interaction tests use native browser clocks. The tests exercise actual UI actions and saved preferences. Test instrumentation is not shipped to visitors.
4. **Launchpad:** a separate searchable grid for workspace apps, coding collections and verified social links. Search focuses on opening; Tab/Enter and Escape are supported. The existing Spotlight remains a separate quick search.
5. **Window Overview:** Finder previews now reflect the selected project, collection, search, grid/list view and empty state. Notes reflect current text; calendar uses the selected city/date; Photos reflects the selected wallpaper; Settings reports the appearance choice.
6. **Dock controls:** saved auto-hide, magnification and 30–40px icon size preferences, plus reset. Defaults remain 35px icons and a 54px bar. Smaller screens constrain the size to fit. Hidden dock reveals at the bottom edge or keyboard focus; touch devices keep it exposed where the desktop dock is used.
7. **System appearance:** Light, Dark and System modes, with live media-query updates and saved explicit preference. Existing legacy Light/Dark choices migrate without being overwritten.
8. **Browser/accessibility verification:** desktop engines, WebKit iPhone emulation, reduced-height keyboard layout, 200%-equivalent CSS viewport reflow, automated contrast/semantic checks and keyboard navigation. Results below are recorded after the final build.

## Running the checks

Use the project launcher on Windows (`.\scripts\pnpm.ps1` in place of `pnpm`).

```text
pnpm exec playwright install chromium firefox webkit
pnpm build
pnpm test:browser
pnpm test:visual
pnpm test:performance
```

The runner uses an existing production preview on port 3000 locally, or starts one if absent. `test:visual:update` intentionally replaces baselines; inspect the resulting images before accepting them. Windows Chromium is the screenshot baseline platform; Firefox/WebKit check behavior. CI uses Windows for the same baseline platform and omits the hardware-sensitive performance sample. Existing `check:desktop` remains available for state and geometry checks.

The separate performance project uses full Chromium headless with GPU rendering enabled and native clocks. The functional/screenshot suite retains Playwright's default browser builds. Playwright documents the [difference between Chromium and headless shell](https://playwright.dev/docs/browsers); Chromium documents [enabling GPU rendering in headless mode](https://chromium.googlesource.com/chromium/src.git/+/main/docs/gpu/using-gpu-hardware-in-headless-chrome.md). Performance is sampled after fonts, image decoding and initial composited paint; initial-load latency is outside this sample.

## Verification results

- Production build and TypeScript: passed, 17 generated/application routes.
- Existing workspace state/URL/widget checks and 400 geometry cases: passed.
- Six screenshot baselines were visually inspected and subsequent comparisons passed; screenshots were not simply regenerated to hide failures.
- The browser suite found and fixed WebKit modal-trigger focus restoration, live reduced-motion cancellation, and an extra position transition after releasing a dragged window.
- CPU-throttled motion sample: passed the gross-stall guard (all sampled event durations below 1,000ms). At 4× CPU slowdown, 226 native animation-frame intervals had a median of 33.2ms and p95 of 100.1ms. Maximum sampled event duration was 632ms; 43 long animation frames were recorded, with a maximum of 344.1ms. GPU compositing/rasterization were enabled on this Windows machine. [Full measurement](motion-performance-2026-10-27.json).

These stress measurements still show dropped frames: the result does **not** establish consistent 60fps on slower hardware. Dock work and window dragging have been reduced without removing the animations, but heavy glass surfaces remain a rendering cost. The saved reduce-motion, magnification and transparency controls are available for a quieter/lighter experience.

Final browser suite: **35 passed, 0 failed, 5 intentional skips** (4.9 minutes). The five skips are desktop projects excluding the phone-only case and Firefox/WebKit excluding Chromium-only screenshots. This includes 30 workspace cases across the three engines, three drag/resize cases, one phone case and one visual case containing six baseline comparisons. The separate native-clock 4× CPU performance case also passed. Functional cases use native clocks except the explicit calendar-boundary scenario. TypeScript and changed-file formatting checks passed after the final test-runner edits. CI configuration is added but has not been run remotely.

## Limits

WebKit on Windows and iPhone emulation do not certify actual Safari on macOS/iOS or physical touch/keyboard behavior. A reduced CSS viewport models the reflow from 200% browser zoom; it is not a real-device test. Automated axe checks are supplemented by keyboard/visual inspection but do not establish full accessibility conformance or screen-reader compatibility. The CPU-throttled motion sample is a local lab observation, not real-user INP, a universal FPS guarantee, or Lighthouse certification. No new production analytics, external email sending or deployment is included.
