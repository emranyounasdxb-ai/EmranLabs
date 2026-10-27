import { ArrowLeft } from "lucide-react";

import type { PortfolioProject } from "@/types/portfolio";

type PortfolioProjectDetailProps = {
  project: PortfolioProject;
  onBack: () => void;
};

export function PortfolioProjectDetail({
  project,
  onBack,
}: PortfolioProjectDetailProps) {
  return (
    <article className="space-y-5">
      <button
        type="button"
        onClick={onBack}
        className="flex min-h-11 items-center gap-2 rounded-full border border-[var(--glass-border)] bg-white/[0.055] px-4 text-sm text-[var(--text-primary)] transition hover:border-[rgba(23,227,192,0.42)] hover:bg-white/[0.085]"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Back to projects
      </button>

      <section className="rounded-[var(--radius-panel)] border border-[var(--glass-border)] bg-white/[0.04] p-5">
        <p className="font-mono text-xs tracking-[0.22em] text-[var(--color-signal)] uppercase">
          {project.status}
        </p>
        <h2 className="font-heading mt-3 text-3xl font-semibold tracking-[-0.05em] text-[var(--text-primary)]">
          {project.name}
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          {project.category}
        </p>
        <p className="mt-4 text-sm leading-6 text-[var(--text-secondary)]">
          {project.description}
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl border border-[var(--glass-border)] bg-white/[0.035] p-4">
          <h3 className="font-heading text-base font-semibold text-[var(--text-primary)]">
            Product direction
          </h3>
          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
            {project.summary}
          </p>
        </section>
        <section className="rounded-2xl border border-[var(--glass-border)] bg-white/[0.035] p-4">
          <h3 className="font-heading text-base font-semibold text-[var(--text-primary)]">
            Platforms
          </h3>
          <ul className="mt-3 flex flex-wrap gap-2">
            {project.platforms.map((platform) => (
              <li
                key={platform}
                className="rounded-full bg-[rgba(23,227,192,0.1)] px-3 py-1 text-xs text-[var(--color-signal)]"
              >
                {platform}
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-2xl border border-[var(--glass-border)] bg-white/[0.035] p-4">
          <h3 className="font-heading text-base font-semibold text-[var(--text-primary)]">
            Capabilities
          </h3>
          <ul className="mt-3 flex flex-wrap gap-2">
            {project.capabilities.map((capability) => (
              <li
                key={capability.label}
                className="rounded-full border border-[var(--glass-border)] px-3 py-1 text-xs text-[var(--text-secondary)]"
              >
                {capability.label}
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-2xl border border-[var(--glass-border)] bg-white/[0.035] p-4">
          <h3 className="font-heading text-base font-semibold text-[var(--text-primary)]">
            Technologies
          </h3>
          <ul className="mt-3 flex flex-wrap gap-2">
            {project.technologies.map((technology) => (
              <li
                key={technology}
                className="rounded-full border border-[var(--glass-border)] px-3 py-1 text-xs text-[var(--text-primary)]"
              >
                {technology}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="rounded-2xl border border-[var(--glass-border)] bg-white/[0.035] p-4">
        <h3 className="font-heading text-base font-semibold text-[var(--text-primary)]">
          Current focus
        </h3>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {project.currentFocus.map((focus) => (
            <li
              key={focus}
              className="rounded-xl border border-[var(--glass-border)] bg-white/[0.03] px-3 py-2 text-sm text-[var(--text-secondary)]"
            >
              {focus}
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
