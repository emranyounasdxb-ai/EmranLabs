# Project brand assets and weather API reference

Verified on 26 October 2026. Only public GET requests and local asset processing were used. No application source, external settings, forms, commits or deployments were changed.

## Actual project marks

These URLs were discovered in the current HTML of the owned public websites, then downloaded directly from those domains. They are real project marks rather than replacement initials or generated artwork.

| Project / use                 | Exact source URL                                                    | Local asset                                         | Dimensions | Size         |
| ----------------------------- | ------------------------------------------------------------------- | --------------------------------------------------- | ---------- | ------------ |
| eDrive compact emblem         | https://edrivedubai.ae/brand/icon-512.png                           | `public/images/projects/edrive-brand-icon.webp`     | 192 × 192  | 4,054 bytes  |
| eDrive header wordmark        | https://edrivedubai.ae/brand/edrive-logo-header.webp                | `public/images/projects/edrive-brand-wordmark.webp` | 400 × 154  | 18,788 bytes |
| INAYA compact emblem          | https://inayadomestic.ae/apple-touch-icon.png                       | `public/images/projects/inaya-brand-icon.webp`      | 180 × 180  | 9,768 bytes  |
| INAYA English header wordmark | https://inayadomestic.ae/brand/inaya-domestic-workers-logo-320.webp | `public/images/projects/inaya-brand-wordmark.webp`  | 320 × 98   | 6,826 bytes  |

- Discovery pages: [eDrive homepage](https://edrivedubai.ae/) and [INAYA English homepage](https://inayadomestic.ae/en/).
- eDrive emblem: teal/silver wings surrounding the ED monogram and “Emotion Drive” ribbon, on the supplied white background. The header asset adds the eDrive Water Sports wordmark and has transparency.
- INAYA emblem: green, red and black flower mark with Arabic/INAYA lettering. Its English header asset includes the INAYA Domestic Workers wordmark. Both retain transparency.
- Sources are preserved as `edrive-brand-icon-source.png` (512 × 512, 126,775 bytes) and `inaya-brand-icon-source.png` (180 × 180, 30,703 bytes).
- Icon processing used installed Sharp: maximum 192 × 192, fit inside, no enlargement, WebP quality 90/effort 6. Header WebPs were copied unchanged. No mark was redrawn, recolored or cropped.
- Use icon assets for compact app/project tiles and full wordmarks for project headers; preserve their aspect ratio. These marks identify the user's portfolio projects. No third-party asset request is needed after integration because the copies are local.

## Open-Meteo: bounded local weather prototype

Official references: [Forecast API docs](https://open-meteo.com/en/docs), [pricing](https://open-meteo.com/en/pricing), [terms](https://open-meteo.com/en/terms), [data licence](https://open-meteo.com/en/licence).

Recommended Dubai-default request (no API key):

```text
https://api.open-meteo.com/v1/forecast?latitude=25.2048&longitude=55.2708&current=temperature_2m,weather_code,is_day&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Asia%2FDubai&forecast_days=7&forecast_hours=24&timeformat=unixtime
```

The request was tested successfully: JSON includes current temperature/code/daylight, 24 hourly rows, seven daily rows and `Asia/Dubai`. Temperatures default to Celsius. With Unix timestamps, multiply seconds by 1,000 and format explicitly in the returned timezone. Weather codes need the documented WMO mapping, with a fallback for unknown codes. Current data comes from a weather model; do not describe it as a reading from a local sensor.

Implementation recommendations (engineering judgment): fetch once on opening, cache for 15 minutes, show the data time, abort timed-out requests, handle missing values and rate-limit failures, and offer retry. Keep cached information clearly marked if stale; never fabricate sunny weather on failure. A fixed Dubai default needs no geolocation permission. Optional user-selected location can be added separately.

### Attribution and service limits

- Put a visible [Weather data by Open-Meteo](https://open-meteo.com/) link beside displayed weather, plus a [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) licence link in the weather panel. Identify transformed display values if applicable, for example rounded temperatures. Do not imply endorsement.
- Open-Meteo explicitly permits the free tier for evaluation and prototyping. Its hosted free API is restricted to noncommercial use, with limits of 600 calls/minute, 5,000/hour, 10,000/day and 300,000/month. No availability guarantee is provided for that tier.
- The terms classify commercial products/promotional activities as commercial. Before the portfolio is publicly released for promotion, choose an eligible service arrangement; local prototype permission is not evidence that free hosted access covers that release.
- Paid access uses `customer-api.open-meteo.com` and an API key with the same parameter format. Keep any future paid key server-side. No subscription was purchased or account created during this task.

The API data licence and the hosted-service usage limits are separate: CC BY permits reuse with attribution; it does not remove the free endpoint's commercial-use restriction.
