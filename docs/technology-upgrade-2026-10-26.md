# Technology upgrade — 26 October 2026

All 26 direct dependencies match their pinned installed versions. The stable
registry versions verified on this date are installed, with Node on the latest
verified LTS release. The application design and content are preserved.

## Installed versions

| Technology                    | Before              | Now                    |
| ----------------------------- | ------------------- | ---------------------- |
| Node.js project runtime       | 22.23.2             | 24.22.1 LTS            |
| pnpm                          | 11.11.0             | 12.15.0                |
| Corepack                      | 0.34.6              | 0.36.0                 |
| Next.js                       | 16.2.10             | 16.4.3                 |
| React / React DOM             | 19.2.7              | 19.3.1                 |
| TypeScript                    | 5.9.3               | 7.0.2                  |
| Tailwind CSS / PostCSS plugin | 4.3.2               | 4.3.3                  |
| Lucide React                  | 1.24.0              | 1.61.0                 |
| Framer Motion                 | 12.42.2             | 14.6.0                 |
| Sharp                         | 0.34.5 (transitive) | 0.35.5 (direct)        |
| Nodemailer                    | 9.0.3               | 10.2.1                 |
| OpenAI SDK                    | 6.46.0              | 7.44.0                 |
| tailwind-merge                | 3.6.0               | 3.7.0                  |
| Zod                           | 4.4.3               | 4.6.7                  |
| Zustand                       | 5.0.14              | 5.0.16                 |
| ESLint                        | 9.39.4              | 10.13.0                |
| eslint-config-next            | 16.2.10             | 16.4.3                 |
| @eslint/eslintrc              | 3.3.5               | 3.3.7                  |
| Prettier                      | 3.9.5               | 3.9.10                 |
| prettier-plugin-tailwindcss   | 0.8.0               | 0.8.1                  |
| @types/node                   | 22.20.1             | 24.19.2                |
| @types/react                  | 19.2.17             | 19.3.0                 |
| @types/react-dom              | 19.2.3              | 19.3.0                 |
| @types/nodemailer             | 8.0.1               | 8.0.2                  |
| class-variance-authority      | 0.7.1               | 0.7.1 (already latest) |
| clsx                          | 2.1.1               | 2.1.1 (already latest) |

`@types/node` follows the selected Node 24 LTS runtime; the global 26.x types
describe Node 26. FontTools 4.67.0 and Brotli 1.2.1 were already current in the
earlier asset-helper audit. The exact installed snapshot is recorded in
`technology-upgrade-2026-10-26.json`.

## Compatibility work

- Next builds and application checks use the TypeScript 7 native CLI. Existing
  desktop assertions now compile the actual source modules through this CLI,
  replacing the removed `transpileModule` API.
- The latest typescript-eslint parser (8.72.1) still needs the JavaScript compiler
  API. The version-scoped `.pnpmfile.cjs` hook gives only lint dependencies
  Microsoft's official `@typescript/typescript6` 6.0.2 bridge (API 6.0.3). The
  application's compiler remains 7.0.2. Review this hook when the parser adds
  TypeScript 7 support.
- Next 16.4.3 supplies an ESLint 10 rule-context adapter for its older React,
  import and accessibility plugins. Exact peer allowances are scoped to those
  three plugins. Parser loading and rule execution were verified.
- Project-local Corepack and pnpm-managed Node avoid overwriting another
  application's bundled Node installation. The runtime and package-manager
  versions are pinned for reproducible installs.
- Asset scripts import the new direct Sharp dependency, instead of depending on
  Next's internal dependency tree.
- CI uses actions/checkout v7.0.1, actions/setup-node v7.1.0 and the same runtime
  pins. Existing checks remain, with desktop behavior checks added. Remote CI
  has not run because nothing was pushed.

## Local verification

- Frozen-lockfile install succeeds; peer checks report no issues.
- Strict TypeScript checking and the optimized production build pass. Home,
  About, Services, Contact, project and metadata pages are prerendered.
- Desktop lifecycle/URL state, saved preferences, widget/time-zone/leap-year/
  temperature assertions and 400 window geometry cases pass.
- ESLint configuration loads. A valid TSX fixture passes, and an invalid fixture
  triggers the expected TypeScript rule. This is a toolchain smoke check, not a
  full-repository lint result.
- Sharp's native WebP encoder works.
- Home, About, Services, Contact, three project pages, sitemap, robots, manifest,
  social image and icon return HTTP 200. Home HTML retains canonical metadata,
  JSON-LD and crawlable project links.
- Contact and AI endpoints reject invalid input with their expected 400 validation
  responses. No SMTP delivery or paid AI call was made; external service delivery
  has not been verified.
- Weather returns live data; an invalid city returns 400.
- Chrome checks cover Finder selection, Quick Look, minimize/restore, Control
  Center, widget gallery and temperature conversion. Celsius was restored after
  testing.
- Desktop and 390×844 mobile views have no document overflow or broken visible
  images. Local fonts loaded. Captured browser warning/error logs were empty at
  verification.
- Screenshots: `desktop-latest-tech-preview.png` and
  `desktop-latest-tech-mobile.png` in the project root.

## Local preview and future deployment

The preview is running at http://127.0.0.1:3000. Use
`.\scripts\pnpm.ps1 dev` for development, or `.\scripts\pnpm.ps1 build` followed
by `.\scripts\pnpm.ps1 start --hostname 127.0.0.1 --port 3000` for production mode.

Pre-upgrade manifests and configuration are backed up under the ignored
`.tools/upgrade-backup-2026-10-26/` directory. No source was pushed and no live
deployment was performed. The retained cPanel deployment script still targets
the previous Node 22 server configuration; future deployment must first migrate
both its build runtime and Passenger runtime to Node 24.22.1.

## References

- [Before-upgrade registry audit](dependency-version-audit-2026-10-26.md)
- [Microsoft: TypeScript 7 and API compatibility](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/)
- [Next.js TypeScript configuration](https://nextjs.org/docs/app/api-reference/config/typescript)
- [Node.js releases](https://nodejs.org/en/about/previous-releases)
