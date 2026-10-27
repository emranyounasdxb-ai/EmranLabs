# Local performance measurement — 26 October 2026

Production Next.js build, Chrome on the development Windows computer. A localhost-only QA proxy (`scripts/performance-preview.cjs`) applies a shared 200,000 bytes/second bandwidth budget (1.6 Mbps), 300 ms delay per request, no-store responses and gzip for text. The visible QA panel records browser PerformanceObserver entries. No measurements are sent externally.

## Desktop first load, 1920 × 975

| Measurement                    | Before font subset / deferred panels |    After |
| ------------------------------ | -----------------------------------: | -------: |
| First contentful paint         |                             4,360 ms | 1,784 ms |
| Largest contentful paint       |                             4,560 ms | 1,884 ms |
| Layout shift total during load |                               0.0001 |   0.0001 |
| Loaded subresource transfer    |                              880 KiB |  634 KiB |
| Subresources                   |                                   39 |       39 |

After opening Work with me on the constrained connection, its deferred panel loaded correctly. Maximum observed interaction duration at that point was 88 ms. This is a sampled interaction duration, not an official INP percentile.

The main improvement is the local Inter variable font subset, 352,240 → 105,500 bytes, with the original and OFL retained. Contact, About, Services, guide and inline case-study components are deferred until needed in the desktop. Their standalone pages remain prerendered with complete content.

After the final desktop spacing adjustment and rebuild, a fresh desktop load on the same proxy recorded FCP 1,696 ms, LCP 1,760 ms, layout shift 0.0001 and 634 KiB. A separate 390 × 844 layout check found both the document and content widths equal to their scroll widths (390 px and 362 px respectively), with the mobile navigation visible.

## Interpretation and limits

These are single-run local lab observations, not Lighthouse scores, real-user Core Web Vitals, a low-end-phone CPU benchmark, or a guarantee of production timings. The proxy uses a simplified shared FIFO bandwidth queue rather than real network transport/prioritization. Transfer excludes the document itself and reflects the browser resource entries. The short-run layout-shift sum is useful for this load check; long-session CLS aggregation is not implemented. Normal desktop CPU was used without CPU throttling. Publication, CDN configuration and real devices require later measurement.

Run the production preview on port 3000 and the proxy with `node scripts/performance-preview.cjs`; open `http://127.0.0.1:3002/`. The instrumentation is inserted only by the QA proxy and is absent from the normal website.
