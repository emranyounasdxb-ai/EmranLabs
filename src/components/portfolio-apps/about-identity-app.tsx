import {
  engineeringPrincipleIcons,
  focusAreas,
  portfolioIdentity,
} from "@/content/portfolio-content";

import { PortfolioSectionHeading } from "./portfolio-section-heading";

export function AboutIdentityApp() {
  return (
    <article className="space-y-6">
      <section className="rounded-[var(--radius-panel)] border border-[var(--glass-border)] bg-white/[0.04] p-5">
        <p className="mb-3 w-fit rounded-full border border-[var(--glass-border)] px-3 py-1 font-mono text-[0.68rem] tracking-[0.22em] text-[var(--color-signal)] uppercase">
          Personal technology portfolio
        </p>
        <h2 className="font-heading text-4xl font-semibold tracking-[-0.06em] text-[var(--text-primary)]">
          {portfolioIdentity.brand}
        </h2>
        <p className="mt-2 text-lg text-[var(--color-signal)]">
          {portfolioIdentity.tagline}
        </p>
        <p className="mt-4 text-sm leading-6 text-[var(--text-secondary)]">
          {portfolioIdentity.introduction}
        </p>
      </section>

      <section className="space-y-3" aria-labelledby="identity-focus-title">
        <PortfolioSectionHeading
          eyebrow={portfolioIdentity.role}
          title="Focus areas"
          titleId="identity-focus-title"
          description="Core product and technology domains that shape the EMRAN LABS portfolio."
        />
        <ul className="flex flex-wrap gap-2">
          {portfolioIdentity.focusAreas.map((area) => (
            <li
              key={area}
              className="rounded-full border border-[var(--glass-border)] bg-white/[0.045] px-3 py-2 text-xs text-[var(--text-primary)]"
            >
              {area}
            </li>
          ))}
        </ul>
      </section>

      <section
        className="grid gap-3 md:grid-cols-2"
        aria-label="Product focus areas"
      >
        {focusAreas.map((area) => {
          const Icon = area.icon;
          return (
            <article
              key={area.id}
              className="rounded-2xl border border-[var(--glass-border)] bg-white/[0.035] p-4"
            >
              <Icon
                aria-hidden="true"
                className="mb-3 size-5 text-[var(--color-signal)]"
              />
              <h4 className="font-heading text-base font-semibold text-[var(--text-primary)]">
                {area.title}
              </h4>
              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                {area.description}
              </p>
            </article>
          );
        })}
      </section>

      <section className="space-y-3" aria-labelledby="principles-title">
        <PortfolioSectionHeading
          title="Working principles"
          titleId="principles-title"
          description="A restrained delivery philosophy for secure, scalable, long-term product systems."
        />
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {portfolioIdentity.workingPrinciples.map((principle, index) => {
            const Icon =
              engineeringPrincipleIcons[
                index % engineeringPrincipleIcons.length
              ];
            return (
              <li
                key={principle}
                className="flex min-h-16 items-center gap-3 rounded-2xl border border-[var(--glass-border)] bg-white/[0.035] p-3 text-sm text-[var(--text-primary)]"
              >
                <Icon
                  aria-hidden="true"
                  className="size-4 shrink-0 text-[var(--color-signal)]"
                />
                {principle}
              </li>
            );
          })}
        </ul>
      </section>
    </article>
  );
}
