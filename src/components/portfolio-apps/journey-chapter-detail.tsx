import type { JourneyChapter } from "@/types/portfolio";

type JourneyChapterDetailProps = { chapter: JourneyChapter };

export function JourneyChapterDetail({ chapter }: JourneyChapterDetailProps) {
  const Icon = chapter.icon;
  return (
    <article className="rounded-[var(--radius-panel)] border border-[var(--glass-border)] bg-white/[0.045] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="rounded-2xl border border-[var(--glass-border)] bg-[rgba(23,227,192,0.1)] p-3 text-[var(--color-signal)]">
            <Icon aria-hidden="true" className="size-5" />
          </span>
          <div>
            <p className="font-mono text-xs tracking-[0.22em] text-[var(--color-signal)] uppercase">
              {chapter.status}
            </p>
            <h4 className="font-heading mt-2 text-2xl font-semibold tracking-[-0.05em] text-[var(--text-primary)]">
              {chapter.title}
            </h4>
          </div>
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-[var(--text-secondary)]">
        {chapter.description}
      </p>
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <section>
          <h5 className="font-heading text-sm font-semibold text-[var(--text-primary)]">
            Capability focus
          </h5>
          <ul className="mt-3 space-y-3">
            {chapter.capabilities.map((capability) => (
              <li
                key={capability.label}
                className="rounded-xl border border-[var(--glass-border)] bg-white/[0.035] p-3"
              >
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  {capability.label}
                </p>
                <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
                  {capability.description}
                </p>
              </li>
            ))}
          </ul>
        </section>
        <section className="space-y-4">
          <div>
            <h5 className="font-heading text-sm font-semibold text-[var(--text-primary)]">
              Delivery disciplines
            </h5>
            <ul className="mt-3 flex flex-wrap gap-2">
              {chapter.disciplines.map((discipline) => (
                <li
                  key={discipline}
                  className="rounded-full border border-[var(--glass-border)] px-3 py-1 text-xs text-[var(--text-secondary)]"
                >
                  {discipline}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h5 className="font-heading text-sm font-semibold text-[var(--text-primary)]">
              Related product ecosystems
            </h5>
            <ul className="mt-3 flex flex-wrap gap-2">
              {chapter.relatedProducts.map((product) => (
                <li
                  key={product}
                  className="rounded-full bg-[rgba(23,227,192,0.1)] px-3 py-1 text-xs text-[var(--color-signal)]"
                >
                  {product}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </article>
  );
}
