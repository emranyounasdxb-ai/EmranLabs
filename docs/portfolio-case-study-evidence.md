# Case-study evidence — 26 October 2026

## Owner confirmation in this conversation

After this research, Emran explicitly confirmed that he completed all design and development for both eDrive and INAYA himself, with no team. The portfolio now uses first-person language and “Sole designer & developer” for those projects. He also supplied and approved `helo@emranlabs.com` as the public professional contact address. The earlier evidence gaps below are historical research notes, now resolved by that direct confirmation. Business-impact statistics remain unverified and are not invented.

Scope: read-only review of the current local portfolio, connected public GitHub sources, and public homepage text. No forms were submitted, staff accounts accessed, or production settings changed. This supplements `docs/portfolio-evidence.md`.

## eDrive Water Sports

**Inferred purpose:** give Dubai water-sports visitors a clear way to compare jet ski/jet car experiences and request a preferred date/time, while keeping staff confirmation and operational follow-up connected. This describes the purpose implied by the product flow; no client discovery interview or historical business problem was supplied.

**Verified implementation:**

- Public package discovery, booking-request and booking-lookup entry points are visible on [the live homepage](https://edrivedubai.ae/).
- [BookingSuccess source](https://github.com/emranyounasdxb-ai/edrive-water-sports/blob/main/components/edrive/booking/booking-success.tsx) submits the request to the Supabase `create_public_booking` RPC, handles saving/success/failure states, offers a retry, and displays the returned booking reference. A legacy insert fallback is present when the RPC is unavailable.
- The same component distinguishes a submitted request from a confirmed booking and explicitly says payment is not taken at that step. It displays package, preferred time, guest/vehicle counts, estimated total and meeting-point information.
- [Booking record mapping](https://github.com/emranyounasdxb-ai/edrive-water-sports/blob/main/lib/booking-records.ts) includes customer requirements, selected package, admin/manager status, payment workflow, collection status and arrival state.
- [README](https://github.com/emranyounasdxb-ai/edrive-water-sports/blob/main/README.md) describes staff availability review, confirmation, vehicle handover, ride completion, collection and settlement. These are documented repository workflows; their live staff deployment was not independently exercised here.
- [Package manifest](https://github.com/emranyounasdxb-ai/edrive-water-sports/blob/main/package.json) and README support Next.js, React, TypeScript, Tailwind CSS and Supabase. The README states that the website is a static export without a Node.js backend runtime. Do not label this website Python/FastAPI.

**Observable outcome:** the public site presents one connected discovery and booking-request journey with reference-based follow-up. The repository contains an operational data model for staff handoff. No revenue, conversion, booking-volume, time-saved or satisfaction improvement has been measured in this review.

**Safe concise portfolio copy:**

> A water-sports booking website that brings package discovery, preferred dates and guest details into a structured request. Visitors receive a reference and clear confirmation status; the documented staff workflow carries the request through availability, handover and collections.

**Personal contribution:** repository ownership and inclusion in the owner's portfolio are established. Exact role, team size, design ownership, implementation boundaries, client relationship and delivery dates require owner confirmation. Prefer neutral “The project includes…” copy; do not add “sole developer” or “led end to end.”

## INAYA Domestic

**Inferred purpose:** help English- and Arabic-speaking households understand service options, pricing and enquiry requirements before contacting the team. The purpose is inferred from the public information architecture; no evidence of a previously broken process or quantified friction was supplied.

**Verified implementation:**

- [Live English homepage](https://inayadomestic.ae/en/) presents services, published pricing, UAE service areas, candidate-country information, guides and consultation paths. It links to its Arabic counterpart.
- [Locale configuration](https://github.com/emranyounasdxb-ai/inaya-domestic-web/blob/main/i18n.ts) supports English/Arabic. [Locale layout](https://github.com/emranyounasdxb-ai/inaya-domestic-web/blob/main/app/%5Blocale%5D/layout.tsx) sets the document language and RTL/LTR direction and generates localized routes.
- [ContactForm](https://github.com/emranyounasdxb-ai/inaya-domestic-web/blob/main/components/ContactForm.tsx) validates required fields and email and associates error text with individual controls.
- [BookingForm](https://github.com/emranyounasdxb-ai/inaya-domestic-web/blob/main/components/BookingForm.tsx) collects service, plan, date and requirements, preserves service selection across relevant navigation, and validates phone/email fields.
- [FormDelivery](https://github.com/emranyounasdxb-ai/inaya-domestic-web/blob/main/components/FormDelivery.tsx) sends enquiry data to `/inaya-enquiry.php`, guards duplicate in-flight requests, handles validation/delivery errors, retains entered details after failure and displays a reference only after an accepted response. Confirmation clearly distinguishes an enquiry from a confirmed booking, job or interview. No real delivery was tested in this research.
- [README](https://github.com/emranyounasdxb-ai/inaya-domestic-web/blob/main/README.md) describes responsive pages, metadata, sitemap and robots output. [Package manifest](https://github.com/emranyounasdxb-ai/inaya-domestic-web/blob/main/package.json) supports Next.js, React, TypeScript, Tailwind CSS and next-intl. The current enquiry transport also uses the PHP endpoint above; no Supabase/Python/FastAPI implementation was established.
- [Repository verification record](https://github.com/emranyounasdxb-ai/inaya-domestic-web/blob/main/docs/live-verification-2026-10-26.md) reports sampled production metadata, reciprocal language links, direction and sitemap checks. Treat these as recorded checks with a defined scope, not evidence of ranking gains or a newly independently rerun full audit.

**Observable outcome:** a publicly available bilingual service and enquiry experience, with Arabic direction handling and explicit enquiry feedback implemented in source. No conversion uplift, traffic growth, response-time improvement, hiring outcomes or SEO ranking change was verified.

**Safe concise portfolio copy:**

> A bilingual service website that organizes household roles, pricing and enquiry information for UAE visitors. English and Arabic layouts share a consistent structure, while validated forms provide clear feedback and a reference when delivery is accepted.

**Personal contribution:** the repository is owned by the user's GitHub account and listed in their portfolio. Exact responsibilities, team collaboration and dates require owner confirmation; no exclusive authorship claim is supported by this review.

## Professional contact email

- Local `src/config/site.ts`, `src/content/portfolio-content.ts`, `src/components/workspace/workspace-data.ts` and the tracked contact UI contain confirmed website/social links but no literal public personal/professional email address.
- Local `src/lib/server/contact-mailer.ts` uses server-only `CONTACT_TO_EMAIL` and `CONTACT_FROM_EMAIL`. Their variable names describe routing, not permission to publish an address.
- A filename/key-only checkout check found `.env.example` with contact-key declarations, and no runtime `.env` file in the project root. No environment values were printed or copied into this document. Process/server configuration was not queried.
- The authenticated GitHub connector previously returned an account email. An authenticated account record is not evidence that the address is public or preferred for portfolio enquiries; do not publish it without confirmation.
- eDrive and INAYA publish company mailboxes for their own customers. Those are not evidence for an EmranLabs personal contact address.
- **Conclusion:** exact portfolio contact email needs owner confirmation. Continue using the confirmed LinkedIn/GitHub/contact channels until supplied; do not guess an `@emranlabs.com` mailbox or present untested form delivery as working.

## Remaining facts for optional owner confirmation

- Exact contribution/role for each project, collaborators and delivery period.
- Any measured outcomes, with the actual metric, baseline, period and source.
- Preferred public contact email.

The existing session constraint still applies: leave disputed ALIYAS role/date and current-location details unchanged. Use “IT Manager and software product builder” and generic verified technical focus instead.
