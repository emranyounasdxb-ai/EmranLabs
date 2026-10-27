# Desktop fixes and functional audit — 27 October 2026

Local preview: http://127.0.0.1:3000. No deployment or dependency changes.

## Completed fixes

- **Tablet dock:** responsive icon sizes and spacing at 761–1000px. All 20 entries remain visible; the approved 54px height and desktop icon dimensions are preserved. At 761px the dock spans x=36–725; at 820px it spans x=45.5–774.5. The rightmost Trash control opens correctly.
- **Dialog exits:** Control Center, calendar, window overview, Quick Look, widget gallery and Spotlight share `AnimatedDialog`. Contents remain mounted through the 180ms exit; Escape follows the same path; interrupted exits clean up; reduced motion closes immediately. Native modal focus restoration and Control Center → gallery navigation work.
- **Clock synchronization:** menu, widget and calendar consume one second-aligned clock. Minute-only displays avoid second-by-second rerenders. The clock refreshes on focus/visibility changes and stops when unused. The live 26→27 October Dubai midnight rollover updated menu time, widget date and calendar Today consistently.

## Four follow-up findings — resolved and verified

All four findings below were repaired and verified against the optimized local production build on 27 October 2026. The original observations are retained as regression context; they no longer describe the current behavior. Their origin has not been attributed to dependency upgrades.

### 1. A placed window can remain outside a narrower tablet viewport

**Resolved — high usability.** Previously, tiling Finder right at desktop width using Alt+Shift+Right, then resizing to 820px left settled bounds at x=771, width=753, right=1524: most of the window remained outside the screen.

`use-window-frame.ts` now suspends desktop placement below 900px and avoids overwriting saved desktop geometry from compact layouts. At 820px the window spans x=20–800; at 390px it spans x=8–382. Document widths match both viewports. Reloading at compact width and returning to 1534px restores the saved right tile at x=771–1524. Desktop reset continues to work.

Evidence: [before](audit-window-tablet-2026-10-27.png), [fixed tablet window](fixed-window-tablet-2026-10-27.png).

### 2. Dock calendar ignores the selected city's time zone

**Resolved — medium.** Previously, selecting Philadelphia after Dubai midnight left the dock on OCT 27 while the menu, clock and calendar correctly showed 26 October.

`AppIcon` now accepts a time zone. Dock and Spotlight pass the selected city's zone, retaining Dubai as the default. Verified Philadelphia shows OCT 26 in both icons and calendar Today; switching back to Dubai shows OCT 27. Philadelphia's selection and date remain correct after reload.

### 3. Spotlight cannot select/open results with arrows and Enter

**Resolved — medium keyboard usability.** Previously, typing `Notes` and pressing Arrow Down then Enter left focus in the input without opening the app.

Spotlight now has a combobox/listbox relationship, one selected result and `aria-activedescendant`. Up/Down wraps through results; Enter opens the selected app/project; query changes reset selection. Text editing and composition are preserved, and Escape restores focus to the search launcher. Verified Notes and INAYA opening, first/last wraparound, empty results, query reset, light/dark selection contrast, and keyboard activation in the 390px layout. DOM focus remains in the search field during navigation. Pattern reference: [W3C combobox guidance](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/).

### 4. Weather city changes briefly show an error before fetching

**Resolved — low visual feedback.** Previously, switching to an uncached city briefly showed “Weather unavailable / Check your connection” with `aria-busy=false` before any failed request.

Weather cards now reset per city, immediately enter loading, and show error feedback only after a real failure. Request ownership checks prevent old/aborted requests from replacing current data or clearing its loading state. Verified uncached London shows “Checking the sky…” with `aria-busy=true` in both cards, then loads successfully; rapid city changes settle on the final city. A temporary local QA proxy deliberately returned HTTP 503: the actual error and Try again control appeared; retry returned a forecast and `aria-busy=false`. The proxy was stopped after verification and is not part of the production application.

## Verification completed

- Final optimized Next production build and its TypeScript check passed.
- Existing lifecycle, focus, URL, saved-state, widget/time-zone/leap-year/temperature checks passed, including 400 geometry boundary cases. Cross-breakpoint window placement was additionally verified in the browser as described above.
- Home, About, Services, Contact, all three project pages, sitemap, robots, manifest, social image and icon returned HTTP 200. Home retains canonical metadata, JSON-LD and crawlable project links.
- Contact/AI endpoints reject invalid input with 400; invalid weather city returns 400; valid forecasts load.
- Chrome verified retained dialog exit contents, final dismissal/focus restoration, Quick Look via Space/Escape, modal-to-modal navigation, Spotlight opening by click, light/dark appearance, and reduced-motion exits.
- Dropdown keyboard navigation keeps one highlighted row. Notes persisted through reload; test content was restored afterward.
- Checked 761px and 820px tablet dock layouts and 390×844 phone contact/project views. Mobile validation focuses the missing name, single-tap projects open, visible images load, and document width remains 390px.
- Captured warning/error logs in the production QA session were empty. The isolated weather failure fixture intentionally produced a 503 response.

## Limits

This was a source review plus local Chrome functional/responsive audit, not an exhaustive security or cross-browser certification. Safari/Firefox, physical touch devices, screen-reader output, external email delivery and paid AI calls were not tested. No full-repository lint or new Lighthouse run was performed. The contact panel prepares an email draft; it does not itself send mail. Existing social placeholders and empty collections are not counted as update regressions.

The retained deployment script targets the older server runtime; migration remains a future deployment task, not a local preview failure.
