# EMRAN LABS

Building the Future of AI & Digital Experiences

EMRAN LABS is a futuristic personal technology portfolio presented as a premium modern desktop operating-system experience for identity, skills, portfolio work, creative labs, professional journey, secure contact, and EM AI portfolio assistance.

## Step 1 foundation status

Step 1 established a clean Next.js application with TypeScript, Tailwind CSS, reusable design tokens, site metadata, basic SEO routes, documentation, and a minimal foundation verification page.

## Step 2 desktop shell status

The current experience includes the first functional EMRAN LABS desktop shell with a premium full-screen background, top system bar, application workspace, centered dock, typed desktop app registry, and reusable app icon and window frame components.

Window management supports opening, closing, minimizing, restoring, focusing, layering, and desktop pointer dragging with viewport boundary clamping. Enabled Step 2 applications include About Identity, Skills, Portfolio Projects, and Contact, while Creative Labs, Professional Journey, and EM AI remain visible as later-phase applications.

Responsive behavior keeps windows movable on larger screens and presents one active application as a safer near-full-screen panel with a compact bottom dock on mobile and tablet layouts. Keyboard-accessible controls, visible focus states, Escape-to-close behavior, and reduced-motion support are included in the shell foundation.

## Step 3 command center status

The desktop includes a global Command Center that opens from the top system bar, the compact mobile dock launcher, or Control/Command + K. It searches enabled applications and desktop actions, supports keyboard result navigation, and restores focus when closed.

Desktop actions include minimizing the active window, closing the active window, closing all windows, restoring minimized windows, and resetting open windows to their default layout while preserving minimized state. The command surface adapts from a centered desktop modal to a mobile-safe sheet with accessible dialog semantics and touch-friendly controls.

## Step 4 portfolio applications status

The portfolio applications use a typed content system as the single source of truth for identity, focus areas, skill groups, product ecosystems, and confirmed professional channels.

About Identity, Skills, Portfolio Projects, and Contact are polished application experiences with categorized content, reusable project cards, accessible in-window project details, and confirmed external links. Creative Labs, Professional Journey, and EM AI remain visible but disabled for later phases.

Selective 3D experiences, cinematic motion, and EM AI functionality continue through later implementation steps.

## Technology foundation

- Next.js App Router
- React
- TypeScript strict mode
- Tailwind CSS
- ESLint
- Prettier with Tailwind class sorting
- shadcn/ui-compatible configuration
- `@/*` import alias

## Runtime requirements

- Node.js 22.23.0
- pnpm 11.11.0

## Commands

Install dependencies:

```bash
pnpm install
```

Start development server:

```bash
pnpm dev
```

Run linting:

```bash
pnpm lint
```

Run type checking:

```bash
pnpm typecheck
```

Check formatting:

```bash
pnpm format:check
```

Format files:

```bash
pnpm format
```

Create a production build:

```bash
pnpm build
```

## Step 6 status

Step 6 has been merged and deployed. It introduced the cinematic desktop background direction, pointer-responsive depth, selective 3D digital core behavior, reduced-motion and WebGL capability safeguards, and deployment-safe production refinements.

## Step 7 status

Step 7 enables EM AI as a portfolio-grounded assistant and upgrades Contact with a secure professional inquiry form. EM AI uses server-side OpenAI Responses API calls only when `OPENAI_API_KEY` and `OPENAI_MODEL` are configured. Contact delivery uses server-side SMTP only when the contact SMTP variables are configured. Missing secrets leave the website, desktop, confirmed channels, and production build functional while the affected service returns a safe unavailable response.

The EM AI and Contact API routes include same-origin checks, Fetch Metadata handling where supported, JSON body limits, Zod validation, bounded in-memory application-level rate limiting, safe public error responses, and operational logging that avoids message bodies, secrets, provider errors, and model output. This limiter is a baseline for the current single cPanel Passenger application and is not a globally distributed rate limiter.

## Environment variables

Required for EM AI service availability:

- `OPENAI_API_KEY`
- `OPENAI_MODEL`

Required for secure Contact form delivery:

- `CONTACT_SMTP_HOST`
- `CONTACT_SMTP_PORT`
- `CONTACT_SMTP_SECURE`
- `CONTACT_SMTP_USER`
- `CONTACT_SMTP_PASSWORD`
- `CONTACT_TO_EMAIL`
- `CONTACT_FROM_EMAIL`

Optional server-only controls:

- `CONTACT_REPLY_NAME`
- `CONTACT_RATE_LIMIT_MAX`
- `CONTACT_RATE_LIMIT_WINDOW_MS`
- `AI_RATE_LIMIT_MAX`
- `AI_RATE_LIMIT_WINDOW_MS`

Runtime secrets are configured in cPanel Application Manager. Do not commit real keys, email passwords, SMTP passwords, or production credentials.

## Deployment

Production deployment is configured for the existing cPanel Passenger application and runs directly from `/home/emranlabs/repositories/EmranLabs`. Source files must not be copied, moved, or synced into `public_html` or any other deployment directory.

Application Manager values:

- Application Name: EmranLabs
- Deployment Domain: emranlabs.com
- Base Application URL: /
- Application Path: repositories/EmranLabs
- Environment: Production

Environment variables:

- `NODE_ENV=production`
- `NEXT_TELEMETRY_DISABLED=1`
- `NEXT_PUBLIC_SITE_URL=https://emranlabs.com`

Deployment sequence:

```bash
cd /home/emranlabs/repositories/EmranLabs
bash scripts/deploy-cpanel.sh
```

Do not use cPanel “Deploy HEAD Commit”. Do not use “Ensure Dependencies”. Do not run `npm install`. Do not use PM2. Do not copy source files into `public_html`. Passenger uses `app.js` as the startup file. Runtime secrets are configured in cPanel Application Manager. `scripts/deploy-cpanel.sh` performs the safe pull, low-memory pnpm install, webpack build, atomic build swap, and Passenger restart.

## Step 5: Professional Journey and Creative Labs

- Enabled the Professional Journey desktop application with a truthful capability-evolution narrative for the EMRAN LABS professional direction, avoiding fabricated employment history, dates, employers, metrics, or unsupported achievements.
- Enabled the Creative Labs desktop application as a set of exploration themes and concept directions, with in-window detail views for focus areas, methods, and key exploration questions.
- Professional Journey and Creative Labs are available through the desktop registry, desktop icons, dock, and Command Center application results.
- EM AI remained visible but disabled until Step 7.
