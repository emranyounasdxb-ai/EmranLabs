import { ArrowRight } from "lucide-react";
import type { Ref } from "react";

import type { CreativeLab } from "@/types/portfolio";

type CreativeLabCardProps = {
  lab: CreativeLab;
  buttonRef?: Ref<HTMLButtonElement>;
  onViewDetails: () => void;
};

export function CreativeLabCard({
  lab,
  buttonRef,
  onViewDetails,
}: CreativeLabCardProps) {
  const Icon = lab.icon;
  return (
    <article className="flex h-full flex-col rounded-[var(--radius-panel)] border border-[var(--glass-border)] bg-white/[0.04] p-4">
      <div className="flex items-start justify-between gap-3">
        <span className="rounded-2xl border border-[var(--glass-border)] bg-white/[0.05] p-3 text-[var(--color-signal)]">
          <Icon aria-hidden="true" className="size-5" />
        </span>
        <span className="rounded-full border border-[var(--glass-border)] px-3 py-1 text-xs text-[var(--text-primary)]">
          {lab.status}
        </span>
      </div>
      <p className="mt-4 text-xs text-[var(--color-signal)]">{lab.theme}</p>
      <h3 className="font-heading mt-2 text-xl font-semibold tracking-[-0.04em] text-[var(--text-primary)]">
        {lab.name}
      </h3>
      <p className="mt-3 flex-1 text-sm leading-6 text-[var(--text-secondary)]">
        {lab.summary}
      </p>
      <ul
        className="mt-4 flex flex-wrap gap-2"
        aria-label={`${lab.name} focus areas`}
      >
        {lab.focusAreas.slice(0, 3).map((focus) => (
          <li
            key={focus}
            className="rounded-full bg-[rgba(23,227,192,0.1)] px-3 py-1 text-xs text-[var(--color-signal)]"
          >
            {focus}
          </li>
        ))}
      </ul>
      <button
        ref={buttonRef}
        type="button"
        onClick={onViewDetails}
        aria-label={`View details for ${lab.name}`}
        className="mt-5 flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-[var(--glass-border)] bg-white/[0.055] px-4 text-sm font-medium text-[var(--text-primary)] transition hover:border-[rgba(23,227,192,0.42)] hover:bg-white/[0.085] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-signal)]"
      >
        View details <ArrowRight aria-hidden="true" className="size-4" />
      </button>
    </article>
  );
}
