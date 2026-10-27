# Customer website improvements — 27 October 2026

The eight approved improvements are implemented in the existing local Next.js website. No website deployment, source push or paid advertising campaign was performed.

## Implemented scope

1. **Direct contact:** equally prominent UAE/Pakistan cards, framed country flags and compact Call/WhatsApp/SMS controls. WhatsApp carries the selected public project or service context. `tel:` and `sms:` use the visitor's own configured device handler.
2. **Business browsing:** five business/service categories alongside the existing technology collections and Mac-style Dock. Filters, counts, reload state and contextual enquiry actions work together.
3. **Case studies:** genuine mobile captures, three-step guided screen tours and optional 18-second captioned videos assembled from real captures. These are clearly screen tours, not simulated transaction demos. Solo design/development credit is retained.
4. **Service clarity:** scope, deliverables, process, initial brief prompts and FAQs. Five static service pages link to relevant case studies. Unpublished Cloud/IT work is described honestly; no results, prices or schedules were invented.
5. **Interface polish:** balanced contact layouts, readable hierarchy, calmer reading surfaces and optional budget/timeline disclosure on the form. Dark, high-contrast and reduced-motion behavior remain supported.
6. **Rendering work:** reduced nested window/sidebar blur and stop the shared clock while the document is hidden. Dock magnification, launch motion, window transitions and native dialog exit behavior remain active unless reduced motion is selected.
7. **Measurement:** configured GA4/GTM, verified Search Console, and added Meta Pixel at the owner's follow-up request. Separate visitor consent, Do Not Track and production-host guards protect local previews. See [measurement setup](analytics/README.md).
8. **SEO/sharing:** five focused service routes in the sitemap and individual 1200×630 project sharing images. Existing canonical metadata, structured data and crawlable project links remain available.

## Additional issues addressed during final checks

- Service selections now reach the validated enquiry payload and owner email, not just the visible form.
- Removed a rendered window-position ref read; starting window order is stable state. DOM animation refs remain event/effect-only.
- Selected tool collections reveal their collapsed group before paint.
- Corrected effect ordering, menu-list construction and internal Next links found by the expanded lint pass.
- Scoped CommonJS lint configuration to the existing Node scripts; renamed the Playwright fixture callback so React's hook rule does not misclassify it.
- Preserved necessary post-hydration preference restoration and native exit snapshots with documented, line-specific lint exceptions; no broad production React rule was disabled.
- Applied the configured formatter. Generated Next declarations/email previews and vendored licenses are excluded from formatting, not application validation.
- Added explicit standalone route-change page measurements while retaining separate desktop app/project events.

## Verification and limits

The production build generates 22 routes. Automated checks cover desktop state/preferences and 400 window-boundary cases, mocked mail delivery, metadata filtering, separate Google/Meta consent, host restrictions, business filters, contact context, responsive cards, media and metadata. Browser tests never send real enquiries or vendor tracking events.

The 4× CPU stress sample passed its gross-stall threshold, but recorded a 16.9ms median frame, 200.2ms p95 frame and 824ms maximum event duration. This is not a 60fps guarantee or a production Core Web Vitals score. Additional tuning and physical-device testing remain useful before launch.

Full ESLint passes with zero errors and seven existing image-element optimization warnings in workspace overlays/folder artwork. These warnings do not indicate broken icons. Actual Safari/iOS hardware, vendor-side event receipt, public indexing and real-world lead attribution are launch/device checks.

Review images: [desktop](assets/customer-growth-desktop-2026-10-27.png), [mobile contact](assets/customer-growth-mobile-2026-10-27.png), [Search Console](assets/search-console-verified-2026-10-27.png), [Meta domain permissions](assets/meta-pixel-domain-2026-10-27.png).
