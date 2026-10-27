# Production deployment

The owner authorized GitHub publication and cPanel hosting on 27 October 2026.

Push changes to `main`. GitHub Actions runs lint, TypeScript, formatting, production build, unit checks, and browser/visual checks. The hosting server checks `main` every two minutes and deploys only the exact commit with a completed successful `Quality checks` push run. Failed, pending, missing, or unavailable checks leave the current release active. No GitHub write credential or new SSH key is needed by the deployment server.

Controller checkout: `/home/emranlabs/repositories/EmranLabs`.
Passenger application path: `apps/emranlabs/current`.
Releases: `/home/emranlabs/apps/emranlabs/releases/`.
Private runtime configuration: `/home/emranlabs/.config/emranlabs/production.env` (mode 600).

Every release installs the pinned Linux dependencies, builds with its environment, verifies SMTP without sending mail, and starts a temporary loopback server to check the principal routes before switching the `current` symlink. The previous release is retained. Source and secrets are never copied to `public_html`; existing email assets stay there.

The host uses Node 24.22.1 and Corepack 0.36.0; the repository pins pnpm 12.15.0. The deploy lock prevents overlapping builds. Polling and deployment output is written to the private `deploy.log`. A failed build is retried on the next check; inspect this log if GitHub passed but a release did not activate.

Manual run: `bash /home/emranlabs/repositories/EmranLabs/scripts/deploy-cpanel.sh`.

Rollback: pause the deployment cron, point `current` back to the saved `previous` release, touch its `tmp/restart.txt`, verify the live routes, then revert the faulty commit on GitHub and resume polling after checks pass. Do not delete release folders while they are referenced by `current` or `previous`.

Weather uses MET Norway's global forecast API with a public identifying User-Agent, bounded city coordinates, request coalescing, Expires/Last-Modified caching, conditional requests, and a retry cooldown. Attribution is visible beside the widget. Temperatures are rounded and daily ranges describe the available forecast hours. No weather subscription is needed. A configured Open-Meteo customer key remains supported as an alternative.

References: https://api.met.no/doc/TermsOfService and https://api.met.no/doc/License.
