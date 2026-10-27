import { ArrowLeft } from "lucide-react";

import type { CreativeLab } from "@/types/portfolio";

type CreativeLabDetailProps = { lab: CreativeLab; onBack: () => void };

export function CreativeLabDetail({ lab, onBack }: CreativeLabDetailProps) {
  const Icon = lab.icon;
  return (
    <article className="space-y-5">
      <button
        type="button"
        onClick={onBack}
        className="flex min-h-11 items-center gap-2 rounded-full border border-[var(--glass-border)] bg-white/[0.055] px-4 text-sm text-[var(--text-primary)] transition hover:border-[rgba(23,227,192,0.42)] hover:bg-white/[0.085] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-signal)]"
      >
        <ArrowLeft aria-hidden="true" className="size-4" /> Back to labs
      </button>
      <section className="rounded-[var(--radius-panel)] border border-[var(--glass-border)] bg-white/[0.04] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="rounded-2xl border border-[var(--glass-border)] bg-[rgba(23,227,192,0.1)] p-3 text-[var(--color-signal)]">
              <Icon aria-hidden="true" className="size-5" />
            </span>
            <div>
              <p className="font-mono text-xs tracking-[0.22em] text-[var(--color-signal)] uppercase">
                {lab.status}
              </p>
              <h2 className="font-heading mt-2 text-3xl font-semibold tracking-[-0.05em] text-[var(--text-primary)]">
                {lab.name}
              </h2>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                {lab.theme}
              </p>
            </div>
          </div>
        </div>
        <p className="mt-4 text-sm leading-6 text-[var(--text-secondary)]">
          {lab.description}
        </p>
      </section>
      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl border border-[var(--glass-border)] bg-white/[0.035] p-4">
          <h3 className="font-heading text-base font-semibold text-[var(--text-primary)]">
            Focus areas
          </h3>
          <ul className="mt-3 flex flex-wrap gap-2">
            {lab.focusAreas.map((item) => (
              <li
                key={item}
                className="rounded-full bg-[rgba(23,227,192,0.1)] px-3 py-1 text-xs text-[var(--color-signal)]"
              >
                {item}
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-2xl border border-[var(--glass-border)] bg-white/[0.035] p-4">
          <h3 className="font-heading text-base font-semibold text-[var(--text-primary)]">
            Technologies or methods
          </h3>
          <ul className="mt-3 flex flex-wrap gap-2">
            {lab.technologies.map((item) => (
              <li
                key={item}
                className="rounded-full border border-[var(--glass-border)] px-3 py-1 text-xs text-[var(--text-primary)]"
              >
                {item}
              </li>
            ))}
          </ul>
        </section>
      </div>
      <section className="rounded-2xl border border-[var(--glass-border)] bg-white/[0.035] p-4">
        <h3 className="font-heading text-base font-semibold text-[var(--text-primary)]">
          Key exploration questions
        </h3>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {lab.questions.map((question) => (
            <li
              key={question}
              className="rounded-xl border border-[var(--glass-border)] bg-white/[0.03] px-3 py-2 text-sm text-[var(--text-secondary)]"
            >
              {question}
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
