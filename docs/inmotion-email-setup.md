# InMotion cPanel email connection

**Status: complete and verified on 27 October 2026 (Asia/Dubai).** The local enquiry form delivers through InMotion SMTP to **helo@emranlabs.com**. The account was already present in cPanel; no new mailbox was created. This completes local email setup; the website remains local and has not been deployed.

## Verified on 27 October 2026

- cPanel routing is **Local Mail Exchanger**; no routing change was needed.
- InMotion mail server: **ded6959.inmotionhosting.com**, **213.165.245.187**.
- Port **465** accepted a certificate-validated **TLS 1.3** connection.
- The website apex `emranlabs.com` is Cloudflare-proxied and its SMTP connection timed out. The local configuration therefore uses the verified InMotion server hostname, rather than the apex suggested by cPanel's generic client setup page.
- The owner saved the password privately in ignored `.env.local`. Corrected dotenv quoting so its literal special characters are preserved. The password was not printed, committed or shared in chat.
- SMTP DNS, connection, TLS and mailbox authentication passed. Restarted the local production server; `/api/contact` reports `{ "available": true }`.
- The production build passed. Seven targeted browser checks passed across Chromium, Firefox and WebKit; two duplicate server-only checks were intentionally skipped. Form tests mock delivery or explicitly require an unconfigured endpoint, so automated runs cannot send real enquiry emails.
- The mailbox is unrestricted and has available storage. cPanel automatically enabled DKIM signing after it detected the valid published key. DKIM, SPF, DMARC and PTR now all show **VALID**.
- Sent exactly one owner-approved self-test through the actual local browser form. The form showed **Enquiry sent** and the message was found in **Inbox**, with reference **EL-MAIL-20261027**. Confirmed From, To, Reply-To, eDrive project, Figma collection, budget/timeframe and full body. No third-party recipient was used. Independent external-provider spam placement was not tested.

Evidence: [inbox receipt](assets/email-inbox-verified-2026-10-27.png), [form success](assets/email-form-sent-2026-10-27.png), [cPanel validation](assets/email-dns-valid-2026-10-27.png). Webmail displays its own timezone; the test date here uses Asia/Dubai.

## DNS corrections applied

Authoritative DNS is at Cloudflare (`armando.ns.cloudflare.com` and `sara.ns.cloudflare.com`), not cPanel. At inspection, the apex had no MX or SPF record, `mail.emranlabs.com` and `default._domainkey.emranlabs.com` did not exist. cPanel confirmed missing SPF/DKIM. PTR was valid.

Added the following four records in the authoritative Cloudflare zone. Both `armando.ns.cloudflare.com` and `sara.ns.cloudflare.com` returned the correct records after saving; the DKIM public key exactly matches cPanel:

| Type | Name               | Value                                             | Options               |
| ---- | ------------------ | ------------------------------------------------- | --------------------- |
| A    | mail               | 213.165.245.187                                   | DNS only, Auto TTL    |
| MX   | @                  | mail.emranlabs.com                                | Priority 10, Auto TTL |
| TXT  | @                  | v=spf1 ip4:213.165.245.187 ~all                   | Auto TTL              |
| TXT  | default._domainkey | Exact public key from cPanel Email Deliverability | Auto TTL              |

The SPF authorizes the observed InMotion sending IP. It does not authorize Cloudflare web proxy addresses through an `a` mechanism. For future sending services, merge their required mechanisms into this record instead of creating a second SPF record.

Preserved the existing DMARC record: `p=quarantine`, relaxed alignment and its existing aggregate-report destination. The website's apex/www routing and proxy settings are unchanged. The `mail` hostname must remain DNS only because Cloudflare's HTTP proxy does not handle SMTP; Cloudflare therefore displays its shared-origin-IP notice for this record.

## Local configuration and checks

1. Use the existing confirmed mailbox, **helo@emranlabs.com**, in InMotion cPanel.
2. In **Email Accounts → Connect Devices**, copy the outgoing server from **Secure SSL/TLS Settings**. Use the exact hostname shown for this account; do not guess it from the domain.
3. Add the following variables to the local, ignored `.env.local` file, or the eventual web host’s secret/environment settings. Keep the password out of source control and chat.

```dotenv
CONTACT_SMTP_HOST=ded6959.inmotionhosting.com
CONTACT_SMTP_PORT=465
CONTACT_SMTP_SECURE=true
CONTACT_SMTP_USER=helo@emranlabs.com
CONTACT_SMTP_PASSWORD='<mailbox-password>'
CONTACT_TO_EMAIL=helo@emranlabs.com
CONTACT_FROM_EMAIL="EMRAN LABS <helo@emranlabs.com>"
```

Port 465 uses implicit TLS. Certificate validation stays enabled; a STARTTLS configuration must successfully upgrade before authentication. Restart the local Next.js server after changing the environment. For local-only work do not copy `NEXT_PUBLIC_SITE_URL=https://emranlabs.com` into `.env.local`, because production origin checks would reject the localhost form. The form checks availability on opening and will show **Send enquiry** only when all required configuration is present.

Run `.\scripts\pnpm.ps1 check:email` from the website folder to test DNS, connection, TLS and mailbox authentication **without sending email**. It uses the same SMTP configuration and Next.js environment parsing as the server, and prints only safe status/error codes. Do not enable SMTP debug logging or print `.env.local`. Quote passwords containing `#` so dotenv does not treat the rest as a comment. Escape literal dollar signs as `\$`.

The sender and receiving mailbox above are Emran’s address. A visitor’s address is used as Reply-To on the owner notification and as the recipient of a separate HTML/plain-text acknowledgement after the owner notification is accepted by SMTP. Selected tool/project, optional budget and timeframe are included in the plain-text owner email. Validation, consent, same-origin checking, honeypot, rate limiting and timeouts remain in place.

## Branded confirmations

Completed on 27 October 2026: the local website sends a form-specific receipt with a reference, while the live cPanel autoresponder sends a separate new-message receipt. Inbox-delivery filters prevent a duplicate cPanel reply to website notifications and suppress acknowledgements on conversation follow-ups. Both templates contain UAE/Pakistan flags, country names below the numbers, Call / WhatsApp / SMS icon links and public social profiles. The contact panel adapts to mobile. Five static email-artwork PNGs are hosted in the dedicated `/email-assets/` directory; the website itself remains local.

See [confirmation configuration, tests and maintenance](email-confirmations-2026-10-27.md) for the exact filters, repeat limits and evidence. The website remains local; the direct-email autoresponder is active independently in cPanel.

Availability means configuration is present; it does not continuously verify authentication or delivery. An SMTP failure shows an error and retains the visitor’s message with an email fallback. A timeout reports that delivery could not be confirmed. Re-run the connection check after credential/hosting changes; send additional real tests only when authorized.

Official references: [InMotion — Find your email settings in cPanel or Webmail](https://www.inmotionhosting.com/support/email/how-to-find-email-settings/), [Cloudflare — Set up email records](https://developers.cloudflare.com/dns/manage-dns-records/how-to/email-records/), [Nodemailer — SMTP transport](https://nodemailer.com/smtp).
