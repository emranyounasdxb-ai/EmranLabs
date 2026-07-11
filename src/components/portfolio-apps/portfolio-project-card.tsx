import { ArrowRight } from "lucide-react";
import type { Ref } from "react";

import type { PortfolioProject } from "@/types/portfolio";

type PortfolioProjectCardProps = {
  project: PortfolioProject;
  buttonRef?: Ref<HTMLButtonElement>;
  onViewDetails: () => void;
};

export function PortfolioProjectCard({
  project,
  buttonRef,
  onViewDetails,
}: PortfolioProjectCardProps) {
  return (
    <article className="flex h-full flex-col rounded-[var(--radius-panel)] border border-[var(--glass-border)] bg-white/[0.04] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs text-[var(--color-signal)]">
            {project.category}
          </p>
          <h3 className="font-heading mt-2 text-xl font-semibold tracking-[-0.04em] text-[var(--text-primary)]">
            {project.name}
          </h3>
        </div>
        <span className="rounded-full border border-[var(--glass-border)] px-3 py-1 text-xs text-[var(--text-primary)]">
          {project.status}
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
        {project.summary}
      </p>
      <ul className="mt-4 flex flex-wrap gap-2" aria-label={`${project.name} platforms`}>
        {project.platforms.map((platform) => (
          <li
            key={platform}
            className="rounded-full bg-[rgba(23,227,192,0.1)] px-3 py-1 text-xs text-[var(--color-signal)]"
          >
            {platform}
          </li>
        ))}
      </ul>
      <ul
        className="mt-4 flex flex-wrap gap-2"
        aria-label={`${project.name} capabilities`}
      >
        {project.capabilities.map((capability) => (
          <li
            key={capability.label}
            className="rounded-full border border-[var(--glass-border)] px-3 py-1 text-xs text-[var(--text-secondary)]"
          >
            {capability.label}
          </li>
        ))}
      </ul>
      <button
        ref={buttonRef}
        type="button"
        onClick={onViewDetails}
        aria-label={`View details for ${project.name}`}
        className="mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-[var(--glass-border)] bg-white/[0.055] px-4 text-sm font-medium text-[var(--text-primary)] transition hover:border-[rgba(23,227,192,0.42)] hover:bg-white/[0.085]"
      >
        View details
        <ArrowRight aria-hidden="true" className="size-4" />
      </button>
    </article>
  );
}
