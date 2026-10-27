# Email confirmations — 27 October 2026

The local website and live `helo@emranlabs.com` mailbox now have distinct acknowledgements. Website publishing is still pending the owner's final approval; no site deployment was performed.

| Incoming message                              | Result                                                                                                                         |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Website form                                  | Owner receives the enquiry first. The visitor then receives a branded HTML/plain-text receipt with an `EL-` reference.         |
| New direct email                              | cPanel sends the branded “Message received — thank you” receipt.                                                               |
| Conversation follow-up                        | Messages with `In-Reply-To:`, `References:`, or a subject beginning `Re:` are delivered to Inbox without another autoresponse. |
| Repeat form request                           | The enquiry still reaches Emran. The confirmation is limited to one attempt per address per 15 minutes.                        |
| Repeat new direct email from the same address | cPanel's 24-hour autoresponder interval suppresses repeated receipts within that interval.                                     |

Copy identifies Emran as an independent designer and developer. It promises a personal reply shortly, without inventing a sales team, confirmed order, price or booking. The form and direct-email messages use separate subjects and explanatory text.

## Design and contacts

The design uses a white rounded card, system typography, a restrained blue confirmation mark, one primary reply action and monochrome social links. The contact area contains a softly tinted project invitation, a prominent “Discuss your project” WhatsApp action and a concise services line. The latest refinement gives UAE and Pakistan equal-width, side-by-side columns on desktop and mobile, with each country name below its number. Both flags have matching pale frames and borders so Pakistan’s white stripe stays distinct. Call, WhatsApp and SMS artwork is reduced from 44px to 28px, with labelled links that remain 56px tall. The header and spacing are more compact. The upper project invitation remains unchanged.

Headings now share an explicit inline system-font stack with Apple system/Helvetica Neue and Windows Segoe UI Variable fallbacks. Semibold typography uses a 44px main title, 40px project title, 20px reply heading and 18px contact heading, with less compressed letter spacing and responsive 34px/30px main titles. Section labels and the wordmark follow the same font family. No remote font dependency was added. The headings retain their text hierarchy even when a mail client substitutes a fallback font.

The primary action opens the UAE WhatsApp number with a prepared project-discussion message. Both regional WhatsApp buttons use the same channel-specific message; form receipts include their sanitized enquiry reference. The customer decides whether to send the prepared message. No message is sent merely by opening the email or preview, and the template makes no unverified availability, response-time or booking promises.

| Region   | Public number    | Call target         | WhatsApp                     |
| -------- | ---------------- | ------------------- | ---------------------------- |
| UAE      | +971 52 385 7572 | `tel:+971523857572` | `https://wa.me/971523857572` |
| Pakistan | +92 323 3333898  | `tel:+923233333898` | `https://wa.me/923233333898` |

Both templates include the confirmed LinkedIn, Instagram, Facebook and YouTube profiles. No GitHub link is included. Templates use inline styles and presentation tables, plus five small static PNG files hosted at `https://emranlabs.com/email-assets/`. These are shared artwork with no recipient identifiers or tracking pixels. Form receipts include a plain-text alternative. No visitor-supplied message, name or subject is reflected in the receipt HTML; only the sanitized server-generated reference is inserted.

SMS actions use `sms:+971523857572` and `sms:+923233333898`. They open the device's supported SMS application with the number selected; they do not send a message. No body parameter is included, following [Apple's SMS URL guidance](https://developer.apple.com/library/archive/featuredarticles/iPhoneURLScheme_Reference/SMSLinks/SMSLinks.html). Devices without an SMS handler may not open these links.

### Phone and desktop app handoff

The contact anchors already use standard `tel:+<number>` and `sms:+<number>` URLs for both regions; no template change is needed to hand them to a device's configured calling/messaging app. A recipient's own device selects the app. Configuring Emran's Windows PC does not configure customers' computers.

On 27 October, the owner completed Android pairing. Phone Link showed the A54 as Connected, and its Calls view reached the dial pad. The updated installed Phone Link package, version `1.26082.121.0`, registers both `tel` and `sms` protocol handlers. The initial `0.26082.121.0` package only advertised `tel` and `ms-phone`; the app updated during setup.

Windows default associations for **TEL and SMS are saved to Phone Link**. The owner completed the selections after the automation tool dismissed the app picker instead of selecting an app. Both associations were verified in the current Windows `UserChoiceLatest/ProgId` entries and resolved to the installed Microsoft.YourPhone package; the SMS setting also visibly displayed Phone Link. On this Windows build, checking only the older `UserChoice` key incorrectly reports no saved default. See [saved SMS default](assets/phone-link-sms-default-2026-10-27.png).

The email preview's actual Call/SMS targets were inspected for both countries. No outgoing test call or SMS was placed. Browser clicks did not provide a verifiable app-composer result through automation, so browser-to-app handoff and actual mobile dialer/message-composer behavior remain unconfirmed by an end-to-end device test. A browser may ask the user to open Phone Link before handing over the number.

Final previews: [form](email/form-confirmation.html), [direct email](email/email-confirmation.html). Latest screenshots: [main headings](assets/email-headings-hero-2026-10-27.png), [project and contact headings](assets/email-headings-contact-2026-10-27.png), [mobile headings](assets/email-headings-mobile-2026-10-27.png).

## Live cPanel configuration

- Address: `helo@emranlabs.com`.
- Character set: UTF-8; HTML enabled.
- From: `EMRAN LABS`.
- Subject: `Message received — thank you | EMRAN LABS`.
- Interval: 24 hours; starts immediately; no end date.
- Body: generated `docs/email/email-confirmation.html`, updated with refined heading typography, equal country columns, framed flags and compact Call, WhatsApp and SMS icon actions.

Two per-mailbox email filters preserve Inbox delivery while bypassing the autoresponder:

1. **EMRAN LABS website receipts - no duplicate auto-reply**: From contains `helo@emranlabs.com` **AND** Any Header contains `X-EmranLabs-Automated: yes`; action **Deliver to Folder: INBOX**.
2. **EMRAN LABS follow-ups - inbox only**: Any Header contains `In-Reply-To:` **OR** Any Header contains `References:` **OR** Subject begins with `Re:`; action **Deliver to Folder: INBOX**.

The initial self-test exposed an extra cPanel acknowledgement despite standard `Auto-Submitted` and `X-Auto-Response-Suppress` headers. The scoped marker filter fixed this. Keep `X-EmranLabs-Automated: yes` on both website-generated emails and retain the matching mailbox filter. The filters deliver messages to Inbox; they do not discard them.

## Verification

- Six non-sending tests passed: owner-delivery failure, owner-before-visitor sequence, confirmation failure after successful enquiry delivery, repeat suppression, safe reference interpolation, and distinct templates with correct contact links. WhatsApp-link assertions also check the prepared message and ensure only the form version includes the enquiry reference.
- Final production build and TypeScript validation passed after the heading typography update; local production server restarted on `127.0.0.1:3000`.
- Browser previews checked at desktop size and 390px/320px mobile widths. Both countries stay in equal-width columns on the same row without horizontal overflow; phone, WhatsApp and SMS targets are correct. All eight image instances load successfully from the five first-party PNG URLs.
- Actual form self-tests reached the owner's mailbox and produced the correct form receipt. After the marker filter, the form produced one owner notification and one visitor acknowledgement, with no extra cPanel reply.
- Final minimal-design form receipt was opened in Roundcube with reference `EL-56B3B3970E0C`; its matching form reported success. This delivery test preceded the contact-only card refinement.
- The flag/icon revision was also sent through the actual local form to the owner's mailbox. Receipt `EL-BBB810DE975E` arrived with both flags, country labels below the numbers and all six contact actions. Roundcube initially blocked remote images; its per-message Allow action loaded all eight image instances. The text labels and action links were present before loading images. See [received icon email](assets/email-flags-inbox-2026-10-27.png).
- An actual follow-up with a changed subject and standard reply headers reached Inbox without generating a receipt. A fresh direct email using the same test reply address subsequently generated exactly one direct-email receipt, confirming the distinction.
- The final typography and compact contact-card HTML was saved successfully into the active cPanel autoresponder. These visual refinements were checked in browser previews and by reading back the saved template; no additional test email was sent. Earlier received emails retain their previous HTML, as expected.
- All live tests used the owner's mailbox or its own plus addresses; no third-party test recipients, calls or WhatsApp messages were used.

Evidence: [form success](assets/email-confirmation-form-success-2026-10-27.png), [delivered form receipt](assets/email-minimal-form-inbox-2026-10-27.png), [delivered direct receipt](assets/email-minimal-inbox-final-2026-10-27.png), [active autoresponder](assets/email-autoresponder-active-2026-10-27.png), [follow-up filter trace](assets/email-followup-filter-2026-10-27.png), [website filter trace](assets/email-filter-match-2026-10-27.png).

## Maintenance and limits

The source of both designs is `src/lib/email/acknowledgement.ts`. From the website directory, regenerate previews with `.\scripts\pnpm.ps1 preview:email` and run non-sending behavior tests with `.\scripts\pnpm.ps1 test:email`. Website mail uses this source at runtime. cPanel stores a static copy: after future template changes, paste the regenerated direct-email HTML into the existing autoresponder and save. Do not paste the form template there.

The five public PNGs live in `/home/emranlabs/public_html/email-assets/`; only those artwork files were added, with no website deployment. They total about 19 KB and were verified against the local SHA-256 hashes. Local originals and licensing/source notes are in `docs/email/assets/`; the generator also copies the PNGs into `public/email-assets/` for a future Next.js deployment. Regenerate using `.\scripts\pnpm.ps1 exec node scripts/render-email-contact-assets.mjs`. Keep the `/email-assets/` URLs working when the website is eventually deployed or moved. Future artwork revisions should use new versioned filenames to avoid stale email/CDN caches. Email clients may hide remote images until the recipient allows them; visible action labels and phone numbers remain usable without artwork.

The form's 15-minute confirmation limit is held in one server process and resets on restart; a future multi-instance deployment needs shared rate-limit storage. There is no durable confirmation queue or automatic retry. A failed acknowledgement does not convert an already-delivered enquiry into a form failure or ask the visitor to resubmit. The existing overall request timeout remains in place.

Follow-up recognition uses standard email headers and the `Re:` prefix. If a mail client removes all reply headers and the prefix, the message is indistinguishable from a new email. A separate new message from the same address can receive another cPanel receipt after 24 hours.

Rendering was checked in the local browser and Roundcube. Native Gmail, Outlook and Apple Mail clients and external-provider spam placement were not tested; exact rounded-corner/font rendering varies by client. SMTP acceptance and self-mailbox receipt do not guarantee inbox placement for every external provider.

Official references: [cPanel autoresponders](https://docs.cpanel.net/cpanel/email/autoresponders/), [cPanel email filters](https://docs.cpanel.net/cpanel/email/email-filters/), [cPanel filter/autoresponder interaction](https://support.cpanel.net/hc/en-us/articles/10354259597079-Autoresponder-doesn-t-send-and-no-errors-are-logged), [Nodemailer message options](https://nodemailer.com/message).
