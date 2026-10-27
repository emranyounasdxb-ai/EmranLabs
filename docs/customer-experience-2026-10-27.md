# Customer experience update — 27 October 2026

## Approved scope

1. Replaced the empty-desktop restore button with Emran’s introduction and View Projects / Start a Project actions. Copy states that Emran works independently.
2. Empty tool collections now contain relevant brief prompts, an honest unpublished-work notice, links to the existing eDrive and INAYA case studies, and a contextual enquiry action. No projects, metrics or creative-tool experience were invented.
3. Connected the enquiry form to the existing protected SMTP endpoint. Added explicit consent, optional budget/timeframe, selected tool/project context, submission locking, success/error feedback and retained email-draft fallback. Standalone case-study links also carry the project. The public tool/project selection persists in session storage across refresh; personal form contents are not stored there. Availability exposes only a boolean and is not cached.
4. Magnification shows when local or system Reduce Motion pauses it. The setting keeps its own stable accessible name and a separate status description. Accessibility preferences remain respected.
5. Finder groups expand/collapse and save their state locally. Collection counts are shown; opening a collection reveals and scrolls to its selected entry. Mobile keeps a horizontal collection strip.
6. Project screenshots open in an accessible animated modal with full-image fit, zoom, previous/next, arrow keys, Escape and focus return. Background document scrolling is locked during preview. No demo videos were available or fabricated.
7. Connected user-confirmed Instagram and YouTube URLs across the Dock, Connect widget, Launchpad and Contact page. Retained the existing LinkedIn/Facebook links. GitHub remains absent from customer surfaces.
8. Improved welcome-card contrast and gave reading/form content calmer surfaces. Added dark, opaque, increased-contrast and reduced-motion handling; kept Dock icon size, glass chrome and spring animation.

## Email delivery dependency

InMotion SMTP and Cloudflare email DNS were completed on 27 October 2026. The local form now sends to **helo@emranlabs.com**; one owner-approved self-test was received in Inbox. SPF, DKIM, DMARC and PTR are valid. See [configuration and verification evidence](inmotion-email-setup.md). Automated browser tests continue to mock delivery so they never send real emails.

## Validation

Production build and strict TypeScript passed. Pure desktop state/preferences checks and 400 geometry boundary cases passed. Targeted browser tests cover the eight changes, mocked email success/failure, the unconfigured real API, accessible light/dark surfaces, modal keyboard behavior, responsive layout and the existing Dock/window/menu flows. Final run results are recorded in LOCAL-PREVIEW.md.

The site remains a local preview. No dependency upgrades, publication, commits or pushes were performed for this update.
