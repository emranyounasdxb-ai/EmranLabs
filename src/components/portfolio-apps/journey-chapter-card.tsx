import type { Ref } from "react";

import type { JourneyChapter } from "@/types/portfolio";

type JourneyChapterCardProps = {
  chapter: JourneyChapter;
  active: boolean;
  buttonRef?: Ref<HTMLButtonElement>;
  onSelect: () => void;
};

export function JourneyChapterCard({
  chapter,
  active,
  buttonRef,
  onSelect,
}: JourneyChapterCardProps) {
  const Icon = chapter.icon;

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className="group w-full rounded-2xl border border-[var(--glass-border)] bg-white/[0.035] p-4 text-left transition hover:border-[rgba(23,227,192,0.42)] hover:bg-white/[0.06] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-signal)] data-[active=true]:border-[rgba(23,227,192,0.5)] data-[active=true]:bg-[rgba(23,227,192,0.08)]"
      data-active={active}
    >
      <span className="flex items-start gap-3">
        <span className="mt-1 rounded-xl border border-[var(--glass-border)] bg-white/[0.05] p-2 text-[var(--color-signal)]">
          <Icon aria-hidden="true" className="size-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="font-mono text-[0.68rem] tracking-[0.2em] text-[var(--color-signal)] uppercase">
            {chapter.label}
          </span>
          <span className="font-heading mt-1 block text-base font-semibold tracking-[-0.03em] text-[var(--text-primary)]">
            {chapter.title}
          </span>
          <span className="mt-2 block text-sm leading-6 text-[var(--text-secondary)]">
            {chapter.summary}
          </span>
        </span>
      </span>
    </button>
  );
}
