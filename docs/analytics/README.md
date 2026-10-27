# Emran Labs measurement setup — 27 October 2026

The website remains a local preview. Google/Meta account configuration is saved, but production event receipt and indexing are launch checks.

## Accounts and properties

| Service                 | Configuration                                      |
| ----------------------- | -------------------------------------------------- |
| Google account          | emranyounasdxb@gmail.com                           |
| Tag Manager             | Emran Labs / emranlabs.com — `GTM-MN7VXD64`        |
| GA4                     | Emran Labs — Website; property `560851938`         |
| GA4 web stream          | Emran Labs Web; `16209630509`; `G-D3NE7DJ58K`      |
| Search Console          | Verified Domain property `sc-domain:emranlabs.com` |
| Meta Pixel              | Emran Labs — Website; `2306932560092203`           |
| Meta owner / ad account | Emran Younas; `1332188772238949`                   |

GA4 uses UAE time (GMT+04) and AED. `generate_lead` is a key event, counted once per event, with no invented monetary value. Event dimensions: Project (`project`), Service (`service`), Contact channel (`channel`), Contact region (`region`), Web vital (`metric`), Performance rating (`rating`), Workspace app (`app`). The custom metric Web vital value (`metric_value`) uses Standard units: filter by Web vital before analysis; timing metrics use milliseconds, CLS is unitless. Never sum these different measurements together.

Search Console ownership was verified through a new root TXT record in Cloudflare. Keep the Google verification record. Existing web and mail records were preserved. Evidence: [verified owner](../assets/search-console-verified-2026-10-27.png).

## Browser implementation

Google Analytics is delivered through GTM. Meta Pixel is installed directly in the site's consent-controlled code; **do not add another Meta tag in GTM**, which would duplicate events. Public IDs are configured in `.env.local` and must be supplied as build-time environment variables at launch:

```dotenv
NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID=GTM-MN7VXD64
NEXT_PUBLIC_META_PIXEL_ID=2306932560092203
```

The Privacy preferences panel has separate unchecked Google Analytics and Meta measurement choices. Existing analytics consent does not grant Meta consent. Do Not Track blocks both. Localhost and preview hosts cannot load either SDK; only `emranlabs.com` and `www.emranlabs.com` are allowed by the application. Consent withdrawal saves the choice, revokes the Pixel, clears its first-party cookies and reloads a page with any withdrawn SDK absent.

Google advertising consent remains denied. Google event parameters are allowlisted public identifiers, contact-button categories and performance metrics. Query strings and referrers are excluded from GA page parameters. Form text, email and phone fields are not event parameters. Meta's base Pixel may process page addresses, cookies, browser and device information after its separate consent; this is disclosed in the panel.

| Website action                                     | Google event                                                  | Meta event    |
| -------------------------------------------------- | ------------------------------------------------------------- | ------------- |
| Initial page / standalone route change             | `page_view`                                                   | `PageView`    |
| Project opened                                     | `project_detail_opened`                                       | `ViewContent` |
| Call, WhatsApp, SMS or email button clicked        | `contact_channel_clicked`                                     | `Contact`     |
| Enquiry successfully accepted by the mail endpoint | `generate_lead`                                               | `Lead`        |
| Business category selected                         | `service_collection_opened`                                   | —             |
| Screen tour opened                                 | `project_walkthrough_opened`                                  | —             |
| App, search or assistant opened                    | `application_opened`, `command_center_opened`, `em_ai_opened` | —             |
| Web performance measurement                        | `web_vital`                                                   | —             |

A contact click is not a successful lead, purchase or booking. Failed forms and email-draft preparation do not emit a lead. No Conversions API, uploaded customer list or advertising campaign was created.

Meta settings: automatic advanced matching off; automatic events off; automatic detailed page/product extraction off; automatic no-code tracking off. Its traffic allow list is `emranlabs.com` and subdomains; the application further limits execution to the two public hostnames above. Evidence: [Meta domain allow list](../assets/meta-pixel-domain-2026-10-27.png).

## Launch verification

1. Deploy only after the owner's separate website-launch instruction, using the public build variables above and the existing server-only mail configuration.
2. Test denied, Google-only, Meta-only, both granted, and withdrawal flows on the real domain. Confirm no duplicated Pixel/GA installation.
3. Use GA Realtime/DebugView and Meta Test events to verify PageView, ViewContent, Contact and one owner-authorized successful enquiry. Local mocks do not prove vendor-side receipt.
4. Verify live `/robots.txt` and `/sitemap.xml`, then submit `https://emranlabs.com/sitemap.xml` in Search Console and inspect important URLs. Do not submit the unfinished local site's sitemap as if it were live.
5. Review real-user performance once enough data exists. Search indexing, attributed leads and conversion performance are not guaranteed by installing tags.

Official references: [Google data layer](https://developers.google.com/tag-platform/tag-manager/datalayer), [GTM consent](https://support.google.com/tagmanager/answer/10718549), [Meta Pixel setup](https://developers.facebook.com/docs/meta-pixel/get-started/). Meta's own logged-in installation flow supplied the installed Pixel ID and base queue snippet.
