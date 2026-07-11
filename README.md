# EMRAN LABS

Building the Future of AI & Digital Experiences

EMRAN LABS is a futuristic personal technology portfolio that will grow into a premium modern desktop operating-system experience for identity, skills, portfolio work, creative labs, professional journey, contact, and future EM AI functionality.

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

Selective 3D experiences, cinematic motion, and EM AI functionality remain planned for later phases.

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

## Deployment

Production deployment is configured for the existing cPanel Passenger application and runs directly from the repository directory. Source files must not be copied, moved, or synced into `public_html` or any other deployment directory.

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

1. Pull `main` in cPanel Git Version Control.
2. Run Deploy HEAD Commit so `.cpanel.yml` installs dependencies, builds, and touches `tmp/restart.txt`.
3. Register or update the application in Application Manager using `repositories/EmranLabs`.
4. Passenger uses `app.js` as the startup file.

## Step 5: Professional Journey and Creative Labs

- Enabled the Professional Journey desktop application with a truthful capability-evolution narrative for the EMRAN LABS professional direction, avoiding fabricated employment history, dates, employers, metrics, or unsupported achievements.
- Enabled the Creative Labs desktop application as a set of exploration themes and concept directions, with in-window detail views for focus areas, methods, and key exploration questions.
- Professional Journey and Creative Labs are available through the desktop registry, desktop icons, dock, and Command Center application results.
- EM AI remains visible but disabled for a later phase.
