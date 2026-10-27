# EmranLabs

An interactive portfolio by **Emran Younas**, independent designer, developer and IT professional. A desktop-inspired interface brings project case studies, services and direct contact into one workspace.

[Visit emranlabs.com](https://emranlabs.com)

## Experience

- Window management, animated dock, search, light/dark appearance and keyboard shortcuts.
- Project collections, case studies and captioned screen tours.
- Responsive contact forms and direct call, WhatsApp, SMS and email links.
- Calendar, clock and weather widgets with saved preferences.
- Accessible motion settings, search metadata and consent-controlled analytics.
- Server-side enquiry delivery with branded email confirmations.

## Stack

Next.js · React · TypeScript · Tailwind CSS · Motion · Zustand · Playwright

Exact dependency versions are pinned in `package.json` and `pnpm-lock.yaml`. Node.js is pinned in `.nvmrc`; pnpm is managed through Corepack.

## Local development

Install the Node.js version in `.nvmrc`, then:

```sh
corepack enable
corepack pnpm install --frozen-lockfile
cp .env.example .env.local
corepack pnpm dev
```

Open [localhost:3000](http://localhost:3000). On Windows, use `Copy-Item .env.example .env.local` instead of `cp`. The project also includes `scripts/pnpm.ps1` for environments that need the local Corepack launcher.

Configure SMTP privately to enable enquiry delivery. The optional AI endpoint needs a server-side API key. All analytics is disabled on localhost. Never commit `.env.local` or credentials.

The right-side privacy card opens on a first visit and stays dismissed once choices are saved. Desktop Settings and standalone-page shortcuts reopen it. Google Analytics through Tag Manager, Meta Pixel, Clarity analytics cookies and optional LinkedIn Insight have independent opt-ins. LinkedIn remains inactive until its Partner ID is configured; its lead-conversion ID is separate.

Microsoft Clarity uses `consentv2`: analytics storage defaults to denied and is granted only after a separate Clarity opt-in; Microsoft advertising storage is always denied. It sends no custom visitor identifiers and masks page text. Set project **Cookies off** (consent mode) and **Masking to Strict** before configuring `NEXT_PUBLIC_CLARITY_PROJECT_ID`. Use limited mode keeps cookieless Clarity measurement, while Turn off all tracking stops collection. Do Not Track and Global Privacy Control disable every tracker. Cookieless Clarity still sends behavioral data and masked recordings to Microsoft and is not an aggregate-only or universally consent-exempt service. The `/privacy` notice describes this collection. A development-only controls preview is available at `/preview/privacy` and returns 404 in production.

## Quality checks

```sh
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm format:check
corepack pnpm check:desktop
corepack pnpm test:email
corepack pnpm test:analytics
corepack pnpm test:deployment
corepack pnpm build
corepack pnpm build:hosting
corepack pnpm exec playwright install chromium firefox webkit
corepack pnpm test:browser
```

Email unit tests use mocks and do not send messages. Screenshot baselines use Chromium on Windows; functional tests cover Chromium, Firefox, WebKit and a mobile viewport. The dedicated performance run is separate from CI because its timing depends on the machine.

## Project structure

```text
src/app/          Pages, metadata and server routes
src/components/   Desktop workspace, project views and UI
src/lib/          Validation, email, analytics and server helpers
src/styles/       Desktop appearance and motion
public/           Website images, fonts, icons and videos
assets/source/    Source artwork for reproducible asset generation
tests/            Unit, browser and visual regression checks
scripts/          Development, asset and deployment utilities
.github/          Automated quality checks
```

## Deployment

Push to `main` to run GitHub Actions. The cPanel deployment controller checks for updates every two minutes and activates only the exact commit whose complete quality workflow passed. Each release is installed, built and smoke-tested in its own folder before the Passenger application is switched. The previous release remains available for rollback.

Runtime credentials are stored privately on the hosting server, outside the repository and public web root. CI checks, environment files and build output are not served as website pages.

Hosting uses Next.js's supported Webpack build because the server's system libraries cannot load the current Turbopack native compiler. CI validates this production build; local development can continue using Turbopack.

## Assets

See [ASSETS.md](ASSETS.md) for third-party attribution. Brand marks identify the tools and platforms shown in the portfolio; they do not imply affiliation or endorsement.
