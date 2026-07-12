# Production tools setup: search visibility, monitoring, and observability

This guide separates application code from environment configuration, Google Tag Manager configuration, DNS verification, and external dashboard setup. It does not contain production secrets or real verification tokens.

## Status matrix

| Tool                   | Application code status                         | External setup status   | Required identifier/token                                                                                | Where configured                                    | Verification method                                     | Privacy/consent requirement                                                                |
| ---------------------- | ----------------------------------------------- | ----------------------- | -------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Google Analytics 4     | Not directly implemented in code                | External setup required | GA4 Measurement ID (`G-...`)                                                                             | Google Tag Manager container                        | Tag Assistant and GA4 Realtime after consent            | Runs only after analytics consent; no Contact or EM AI content                             |
| Google Tag Manager     | Existing consent-aware loader; requires env var | External setup required | `NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID`                                                                      | App environment and GTM dashboard                   | Tag Assistant consent preview                           | GTM loads only after analytics consent; Consent Mode V2 keeps ad signals denied            |
| Google Search Console  | Optional metadata fallback supported            | External setup required | Cloudflare DNS TXT token; optional `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`                                | Cloudflare DNS or Next.js metadata                  | Domain verification, sitemap submission, URL inspection | No Search Console tracking script or credentials in code                                   |
| Microsoft Clarity      | No direct app script                            | External setup required | Clarity project ID                                                                                       | GTM container and Clarity dashboard                 | Network checks after consent                            | Must run through GTM after analytics consent with masking enabled                          |
| Cloudflare             | Not application code                            | External setup required | Cloudflare zone/DNS records                                                                              | Cloudflare dashboard                                | Manual DNS, SSL, cache, proxy, and redirect checks      | No application credentials; do not cache user-specific API responses                       |
| Bing Webmaster Tools   | Optional metadata fallback supported            | External setup required | Google import, DNS token, or `NEXT_PUBLIC_BING_SITE_VERIFICATION`                                        | Bing dashboard, Cloudflare DNS, or Next.js metadata | Property verification and sitemap submission            | No Bing analytics script or credentials in code                                            |
| Sentry                 | Implemented but disabled without DSN            | Configuration required  | `NEXT_PUBLIC_SENTRY_DSN`; build-only `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN` for source maps | Runtime/build env and Sentry dashboard              | Protected development capture and dashboard review      | `sendDefaultPii=false`; request bodies, cookies, auth, Contact, and EM AI content filtered |
| UptimeRobot            | `/api/health` implemented                       | External setup required | HTTPS monitor URL                                                                                        | UptimeRobot dashboard                               | `GET`/`HEAD` return HTTP 200                            | Health response exposes no secrets, versions, dependency details, or user content          |
| Ahrefs Webmaster Tools | Not application code                            | External setup required | GSC import or Ahrefs verification                                                                        | Ahrefs dashboard and optional Cloudflare DNS        | Site Audit and sitemap check                            | No Ahrefs API credentials or tracking script in code                                       |
| Rich Schema / JSON-LD  | Existing typed implementation preserved         | Not applicable to code  | None                                                                                                     | Application metadata/JSON-LD                        | Automated serialization checks plus validators          | Factual portfolio data only; no user Contact or EM AI content                              |

## Google Tag Manager and Google Analytics 4

1. Create or confirm the GA4 property for EMRAN LABS.
2. Create a web stream for `https://emranlabs.com`.
3. Create a GTM web container and set `NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID` in the runtime environment. Do not add a `NEXT_PUBLIC_GA_MEASUREMENT_ID` runtime variable.
4. Add the Google tag/GA4 Measurement ID (`G-...`) inside GTM, not in Next.js source code.
5. Require `analytics_storage` consent before the GA4 tag fires. Keep `ad_storage`, `ad_user_data`, and `ad_personalization` denied.
6. Test with Tag Assistant preview: Decline and Do Not Track must prevent GTM/GA4 collection; Accept may load GTM.
7. Test GA4 Realtime only after consent.
8. Publish the GTM container only after verifying that page views are not duplicated and no Contact or EM AI message content is pushed to `dataLayer`.

## Google Search Console

Preferred production setup is a Domain property for `emranlabs.com` verified by a TXT record in Cloudflare DNS. This method does not require a website rebuild. Submit `https://emranlabs.com/sitemap.xml`, confirm `https://emranlabs.com/robots.txt`, and use URL Inspection for canonical and indexing checks.

Optional URL-prefix fallback: set `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` to the exact Google meta verification token. Invalid or missing values emit no tag.

## Microsoft Clarity

Create the EMRAN LABS Clarity project, then configure the Clarity tag through the existing GTM container. Do not install a Clarity package or add a direct script to the application. The tag must fire only after analytics consent, and sensitive masking must remain enabled. Mask Contact fields and EM AI conversation areas in Clarity/GTM configuration or supported masking attributes if needed. Never record passwords, API keys, email message contents, AI prompts, AI responses, contact messages, or sensitive values. Optional GA4/Clarity linking may be configured externally without adding duplicate analytics scripts.

## Cloudflare operational checklist

- Use SSL/TLS Full (strict) after validating the origin certificate.
- Enable Always Use HTTPS and choose a production-appropriate minimum TLS version.
- Proxy public web records where appropriate; keep mail and other incompatible records DNS-only.
- Exclude `/api/*` from cache and never cache EM AI or Contact responses.
- Confirm WebSocket compatibility if an application feature needs it.
- Keep security headers application-controlled unless intentionally overridden at the edge.
- Avoid duplicate redirects between Cloudflare, cPanel, and Next.js.
- Preserve email-related DNS records and avoid proxying mail hosts.

These settings require manual dashboard verification; the repository does not prove they are active.

## Bing Webmaster Tools

Add `https://emranlabs.com` to Bing Webmaster Tools. Prefer importing the verified Google Search Console property when available; otherwise use Bing-supported DNS or meta verification. Submit `https://emranlabs.com/sitemap.xml`, confirm robots and canonical behavior, and review crawl/index coverage. Do not add IndexNow unless a real content-publishing workflow benefits from it. Optional meta fallback uses `NEXT_PUBLIC_BING_SITE_VERIFICATION`; invalid or missing values emit no tag.

## Sentry

Sentry is initialized only when `NEXT_PUBLIC_SENTRY_DSN` is present. Build-time source-map upload is enabled only when `SENTRY_ORG`, `SENTRY_PROJECT`, and `SENTRY_AUTH_TOKEN` are all configured; otherwise it is skipped silently. Keep `SENTRY_AUTH_TOKEN` server/build-only.

Environment variables:

- `NEXT_PUBLIC_SENTRY_DSN`
- `SENTRY_ORG`
- `SENTRY_PROJECT`
- `SENTRY_AUTH_TOKEN`
- `SENTRY_ENVIRONMENT`
- `SENTRY_TRACES_SAMPLE_RATE`
- `SENTRY_REPLAYS_SESSION_SAMPLE_RATE`
- `SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE`

Defaults keep tracing and replay disabled with zero sample rates. Filtering strips request bodies, cookies, auth headers, query strings, Contact payloads, EM AI prompts/responses, SMTP values, OpenAI request bodies, API keys, and user identity. Sentry failures must not break the application.

For capture testing, use a protected development-only page or local error boundary test while `NODE_ENV=development` and a non-production DSN are configured. Do not add or enable a public production throw-error endpoint.

## UptimeRobot

Create an HTTPS monitor for `https://emranlabs.com/api/health`, expect HTTP 200, and choose the interval allowed by the selected plan. Configure alert contacts in UptimeRobot. A second homepage monitor is optional. Do not monitor EM AI or Contact POST endpoints. Verify alerts with UptimeRobot's own test process rather than breaking production.

The health endpoint returns only:

```json
{ "ok": true, "service": "emranlabs" }
```

It uses `Cache-Control: no-store` and `X-Content-Type-Options: nosniff` and does not call databases, OpenAI, SMTP, or other dependencies.

## Ahrefs Webmaster Tools

Add `emranlabs.com`, verify ownership through Google Search Console import or a supported DNS/file method, run Site Audit, confirm the sitemap, and review broken links, redirects, canonical issues, crawlability, duplicate metadata, and performance findings. Do not grant broader Google account access than required and do not add Ahrefs API credentials or paid API integration to the website.

## Rich Schema / JSON-LD

Preserve factual schema only: `WebSite`, `ProfilePage`, `Person`, and confirmed portfolio `ItemList`. Do not fabricate reviews, ratings, address, founding date, organization size, or unsupported job titles. Do not include user-generated Contact or EM AI content. Serialization must escape the less-than character and canonical URLs must remain valid. Manual validation should be performed with Google Rich Results Test and Schema.org Validator, but rich results are never guaranteed.

## Final operations checklist

- Confirm GTM loads only after analytics consent and never with Do Not Track.
- Confirm GA4 is configured only inside GTM and does not duplicate page views.
- Verify Google Search Console Domain ownership through Cloudflare DNS TXT and submit the sitemap.
- Configure Clarity through GTM after analytics consent with masking.
- Manually verify Cloudflare SSL, proxy, cache, security, and redirect settings.
- Verify/import Bing Webmaster Tools and submit the sitemap.
- Configure Sentry DSN and optional source-map upload variables without exposing secrets.
- Configure UptimeRobot for `/api/health` and alert contacts.
- Verify Ahrefs Webmaster Tools and run Site Audit.
- Validate JSON-LD with automated checks and external validators.
