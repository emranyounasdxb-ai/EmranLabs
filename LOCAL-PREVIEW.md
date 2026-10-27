# Emran Labs desktop preview

The owner authorized GitHub publication, cPanel deployment, and automatic deployment after successful checks on 27 October 2026. See docs/deployment.md. Earlier local-preview notes below are historical.

## Customer growth and measurement — 27 October 2026

The latest eight improvements add equal direct-contact cards, business-oriented collections, real mobile case-study captures/screen tours, service scope/process/FAQ, five focused service pages, lighter rendering work, consent-controlled measurement and individual project sharing images. See [implementation and audit](docs/customer-growth-2026-10-27.md).

Google Tag Manager and GA4 are configured, Search Console domain ownership is verified, and Meta Pixel is created with automatic matching/events disabled and an Emran Labs domain allow list. The local code has separate Google/Meta consent and blocks vendor SDK loading on local/preview hosts. No paid campaign or Conversions API was created. Live event receipt and sitemap submission remain launch checks. See [IDs, events and launch verification](docs/analytics/README.md).

## Customer experience update — 27 October 2026

The eight approved customer improvements are implemented: welcome actions, useful empty tool collections, contextual enquiry flow, effective motion status, collapsible Finder groups/counts, screenshot zoom/navigation, confirmed Instagram/YouTube links and improved reading-surface contrast. Tool/project enquiry context survives a refresh within the same browser tab; personal form contents are not written to browser storage.

See [implementation details](docs/customer-experience-2026-10-27.md) and [InMotion email setup](docs/inmotion-email-setup.md). Local SMTP and Cloudflare email DNS are configured and verified. One approved form self-test was received in **helo@emranlabs.com** Inbox. Automated success/failure tests use simulated responses and never send real mail. The website remains local only.

Validation: final production build/TypeScript passed; desktop state checks and 400 geometry cases passed. The existing 30 workspace behaviors were exercised in Chromium, Firefox and WebKit, with the asynchronous resize assertion corrected and rechecked. Four creative-tool/customer-link checks passed. A final targeted cross-browser run passed 19 checks (2 deliberate server-test skips), including the corrected WebKit focus return and button contrast. After adding refresh persistence, 5 final checks passed (5 platform skips): context restoration in all three engines, phone navigation and six visual surfaces. Two visual baselines changed for the approved sidebar/social layout and were visually reviewed. The initial repeated API test correctly hit the rate limiter; it now runs once per suite instead of once per browser.

Preview: http://127.0.0.1:3000/ — production server left running with `scripts/pnpm.ps1 start --hostname 127.0.0.1 --port 3000`. Review captures: `docs/assets/customer-welcome-2026-10-27.png` and `docs/assets/customer-image-viewer-2026-10-27.png`. Actual macOS/iOS hardware testing remains separate from automated WebKit checks.

## Eight desktop refinements — 27 October 2026

Includes readable light/dark Spotlight, a searchable Launchpad, content-aware Window Overview previews, saved Dock controls (auto-hide, magnification, 30–40px icons with the approved 35px default), and Light/Dark/System appearance. Dock pointer work is batched and cached; window drag uses compositor translation with geometry saved at gesture completion. Keyboard focus restoration also handles pointer-opened dialogs in WebKit.

The new browser suite covers Chromium, Firefox and WebKit, a WebKit phone profile, deterministic screenshot comparisons, automated accessibility checks and a separate CPU-throttled motion sample. See [the implementation and verification report](docs/desktop-refinements-2026-10-27.md) for commands, measured results and device-testing limits.

Verification: 35 browser cases passed, five platform-specific cases intentionally skipped, six screenshot comparisons passed, and the separate 4× CPU sample passed its gross-stall guard. Build, TypeScript and existing desktop checks passed. The stress sample still shows dropped frames; actual macOS/iOS Safari and physical phone testing remain outstanding.

## Follow-up fixes and audit — 27 October 2026

Tablet dock sizing, shared dialog exit animations (including Spotlight), and synchronized menu/widget/calendar time are implemented. The production build and existing desktop checks pass. The live Dubai midnight rollover, modal focus/reduced motion, 761px/820px dock layouts, mobile project/contact flows, notes persistence and route/API smoke checks were verified.

All four follow-up audit findings are now fixed: compact layouts suspend and preserve desktop window placement; dock and Spotlight calendar icons use the selected city zone; Spotlight supports Up/Down selection and Enter activation; weather enters loading immediately and reserves error feedback for actual failures. The production build, TypeScript and existing desktop checks pass. Chrome verification covered desktop → tablet → phone → desktop transitions, compact reload and saved placement, calendar dates across Dubai/Philadelphia midnight, keyboard search including empty results, uncached/rapid weather city changes, and a controlled weather failure followed by a successful retry. See [the updated audit and evidence](docs/desktop-audit-2026-10-27.md).

## Run

- Node 24.22.1 LTS and pnpm 12.15.0, pinned per project. pnpm downloads and uses the local runtime automatically.
- Windows checkout: `.\scripts\pnpm.ps1 install --frozen-lockfile`
- Start development: `.\scripts\pnpm.ps1 dev --hostname 127.0.0.1 --port 3000`
- Visit http://127.0.0.1:3000.
- Production verification: `.\scripts\pnpm.ps1 build`, then `.\scripts\pnpm.ps1 start --hostname 127.0.0.1 --port 3000`.
- Fresh checkout: bootstrap Corepack 0.36.0 and run `corepack pnpm install --frozen-lockfile` first. See README for runtime setup.

## First page

The approved coastal macOS-inspired mockup is implemented in React and TypeScript. Main implementation: `src/components/workspace/mac-desktop.tsx`, visual system: `src/styles/workspace.css`, verified project and social content: `src/components/workspace/workspace-data.ts`.

Includes project collection filters, grid/list view, inline project details, directly addressable static project pages, search (Ctrl/Cmd+K), draggable/resizable/maximizable/minimizable window, a live Dubai clock, contact links, local browser notes, calendar, appearance and reduced-motion controls. The mobile dock scrolls horizontally. Notes and preferences stay in browser local storage. Mail opens verified contact channels; Instagram and YouTube open Connect with a message until their exact URLs are supplied. Python and Flutter currently have explicit empty states because the verified projects do not use those technologies.

Performance foundation: static-rendered HTML and project routes, local WebP wallpaper, responsive Next Image delivery, native system fonts with a local Inter fallback, CSS and Web Animations transform/opacity transitions, and a small requestAnimationFrame spring loop for the dock. The loop stops when settled, and reduced motion is respected. No background video or third-party animation runtime is loaded on the new home page. Metadata, canonical links, social preview, sitemap, robots and structured data are included. No ranking or real-user Core Web Vitals claim is implied by local testing.

## Material and motion refinement

`src/styles/desktop-materials.css` refines the layout stylesheet with a shared type scale, frosted toolbar/sidebar/dock materials, layered edge highlights, tighter native-style controls and responsive proportions. Dock artwork uses locally optimized icon assets. Resting icons stay 35px on desktop and the glass bar stays 54px tall. Nearby icons magnify with a spring on pointer hover; minimize contracts the window toward Finder, while close uses a short fade. The default Emran Horizon wallpaper has a dark color treatment; the optional Catalina collection uses a separate night image. See `ASSETS.md` for sources and provenance.

## Wallpaper provenance

The default is the original Emran Horizon wallpaper. Its source image, built-in generation mode and full prompt are documented in `docs/wallpaper-generation.md`. Photos lets visitors switch between Horizon and the earlier Catalina reference, with the choice saved locally.

`public/images/coastline.webp` was created with the built-in Imagegen tool from the approved desktop mockup. Prompt: remove all UI, text, windows, widgets, icons, menu bar and dock; reconstruct the underlying sunlit sandstone coast, blue sea, pale sky and foreground plants while retaining the composition; clean realistic 16:9 landscape, no text or watermark. The PNG was compressed to WebP with Sharp; it is an illustrative generated wallpaper.

The existing backend/API and deployment files remain in the checkout for later integration. The new page doesn't invoke those APIs. Live publication requires the user's later instruction.

## Verification on 26 October 2026

- Production build and strict TypeScript check passed; home and all three project pages are prerendered.
- Home, project pages, sitemap, robots, Open Graph image and icon returned HTTP 200.
- Confirmed rendered HTML contains metadata, canonical URL, structured data and crawlable project links.
- Browser checks: project filtering and details, Spotlight search, light/dark appearance, reduced-motion toggle, local notes, minimize/restore and maximize/restore.
- Checked desktop and 390 × 844 mobile layout. Mobile had no document-level horizontal overflow; dock and collection tabs scroll within their containers.
- Local browser console had no warnings or errors at the verification point. Public-device performance metrics and live search indexing require later deployment and real-user measurements.

Refinement verification: production build and TypeScript passed again; focused ESLint checks passed for the desktop, icon component, dock motion hook and root layout. Verified the local font and every visible image loaded, dock blur computed correctly, adjacent dock icons magnified, minimize removed the window and Finder restored it, maximize filled the available desktop, Spotlight opened, both appearances rendered, and reduced motion shortened CSS animation duration. Checked the revised 390 × 844 layout without document overflow. The standard desktop overview fits its window without an internal scrollbar.

## Approved desktop upgrade

- Functional File, Edit, View, Go, Window and Help menus, keyboard navigation, project/background context menus, sorting and sidebar visibility.
- Window resizing on eight edges, left/right tiling, default-layout reset, pointer dragging and keyboard resizing. Help lists the supported shortcuts.
- Shared project detail pages with actual website captures, verified technology stacks, and prominent website/contact links. EmranLabs is explicitly a local preview. GitHub links were removed in the customer-facing update on 27 October 2026.
- About uses the user's public profile photograph and verified professional focus. Disputed employer dates, title and location were not added.
- Lighter glass, more readable small text, consistent motion timing, reduced-motion support and container-responsive project/About layouts.

Upgrade validation: production build and TypeScript passed. `node scripts/check-window-geometry.cjs` passed 400 boundary and anchored-edge cases. Browser checks covered menu keyboard navigation and Escape focus return, pointer drag/resize, keyboard resize/reset, tiling, project context menu actions, appearance, reduced motion, wallpaper persistence, and 390 × 844 About/project layouts without horizontal overflow. Screenshots are real local-browser captures; no production performance score is claimed.

Final production preview: home, all three static project routes, sitemap, robots and updated image assets returned HTTP 200. Tiled-window minimize completed and removed the window. The fresh final browser load had no captured warnings/errors, no broken visible images and no document overflow. Saved review screenshot: `desktop-upgrade-preview.png`.

## Portfolio experience update — 26 October 2026

This section supersedes the earlier single-window and mobile-dock descriptions.

- Independent draggable/resizable windows now retain their own geometry and content. Opening, focusing, minimizing, restoring, closing and showing the desktop preserve the other windows.
- Project folders carry real screenshot previews. Space or the context menu opens Quick Look; arrow keys browse projects and Escape returns focus.
- All three case studies include the purpose, role, approach, observable outcome and three real captures. The user confirmed that eDrive and INAYA were designed and developed entirely by him. Their credit is **Sole designer & developer**, with first-person copy and no invented business metrics.
- The approved public email is exactly **helo@emranlabs.com**. Work with me offers email copy and a validated enquiry form that submits through the protected SMTP API. When delivery is unavailable or fails, visitors can open an email draft or copy their message.
- Desktop navigation updates query URLs and supports browser Back/Forward. `/about`, `/services`, `/contact` and `/projects/{id}` remain separately prerendered, crawlable pages with canonical metadata and sitemap entries.
- Phones use touch-sized project cards and bottom app navigation. Desktop dock proportions remain unchanged. Reduce transparency, reduced motion and light/dark preferences are supported.
- Secondary desktop panels load on demand. The local Inter font is subset from 352,240 to 105,500 bytes. See `docs/performance-2026-10-26.md` for measured results and their limits.

Validation: production build and TypeScript passed; window lifecycle/URL tests and 400 window geometry cases passed. Browser checks covered multi-window focus, minimize/restore with form draft retained, browser history, keyboard Quick Look and focus return, contact draft content, dark/opaque appearance, and 390 × 844 layouts without horizontal overflow. Static routes, sitemap and font returned HTTP 200; project HTML includes the sole-designer credit. The final preview remains local at http://127.0.0.1:3000.

Review captures: `desktop-experience-preview.png` and `desktop-experience-mobile.png`.

## Icon, motion and menu correction — 26 October 2026

- Removed sidebar grayscale, brightness and selected-row inversion filters so
  coding tools retain their original brand colours in light and dark appearance.
- Restored the missing Quick Look animation keyframes and added matching reveals
  for system panels and widgets. Project grid/list changes replay a short
  staggered transition; folder hover movement is restored. Window motion uses
  consistent opening, minimize and restore timings, and dock clicks have a small
  launch bounce alongside the existing spring magnification.
- Menu pointer movement and keyboard navigation share one focused row. Removed
  the separate hover highlight and scoped menu-bar sizing to its direct buttons,
  preventing duplicate blue highlights and inherited dropdown row sizing.
- Latest dependency versions remain installed. Reduced-motion settings still
  suppress nonessential animation.

Validation: production build, strict TypeScript and existing desktop behavior
checks pass. Chrome confirmed original icon colours, single-row menu highlighting,
arrow navigation and Escape focus return, interpolating dock/window/Quick Look
motion, grid/list animation start, and Control Center entrance. Reduced-motion
and dark appearance were checked, then returned to the original light/full-motion
settings. The 390×844 layout has no document overflow or broken visible images.
Review capture: `dropdown-fixed-preview.png`.

## Native desktop and widgets update — 26 October 2026

All eight approved refinements are implemented:

1. Shared neutral glass, light/dark materials, quieter borders and active/inactive window contrast.
2. Consistent icon sizing and actual eDrive/INAYA project marks. The approved 54px dock and 35px resting icons retain Mac, coding and social entries.
3. Finder-style selection: single click selects; double click or Enter opens; arrows move selection; Space opens Quick Look. Touch opens with one tap.
4. Active-app menu labels and relevant File/Edit/View commands, plus dock context actions.
5. Matching window minimize/restore motion. Hover over the green button, right-click it or press Arrow Down for fill, tile and default-position options.
6. Consistent typography, spacing and alignment, with readable sidebar icons and responsive layouts.
7. Control Center for appearance, accents, wallpaper, transparency and motion; menu-bar date opens an interactive calendar.
8. Browser-local persistence for window geometry, open windows, project views and widget preferences. Reset desktop layout restores positions without clearing notes. Alt+9 opens the window overview.

Widgets include an analog/digital clock, a month calendar with selected dates and Today navigation, and real current weather with a four-day outlook. Dubai is the default; the gallery also offers Abu Dhabi, Karachi, London and Philadelphia. Clock/calendar use the selected time zone. Weather supports Celsius/Fahrenheit, refresh, cache, retry and honest unavailable/cached states. No geolocation permission is requested.

Use **Edit widgets** to drag handles or reposition with arrow keys. Use **Control Center → Widgets** to change city, units, clock style or visibility. Phones access the widgets through this scrollable gallery; floating cards remain on wider desktops. Widget and window positions are clamped to the viewport and saved on this browser.

The `/api/weather` route calls Open-Meteo server-side, caches provider responses for 15 minutes and keeps an optional `OPEN_METEO_API_KEY` private. See `docs/project-brand-assets.md` for attribution, asset provenance and the service-plan requirement before a public commercial release. No subscription or deployment was performed.

Validation: production build and TypeScript passed; window lifecycle/URL tests, saved-state validation, widget preference checks, leap-year/time-zone/temperature cases and 400 geometry boundary cases passed. Browser checks covered Finder selection/Quick Look/Enter, tiling, minimize/restore with project state retained, app menus, appearance persistence, gallery settings, saved widget positions, calendar navigation, layout reset and window overview. Verified 390×844 phone and 1366×768 laptop layouts without document overflow. Weather returned real data and invalid city input returned 400. Screenshots: `desktop-widgets-preview.png`, `desktop-widgets-mobile.png`.
