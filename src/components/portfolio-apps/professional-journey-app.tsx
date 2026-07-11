"use client";

import { useEffect, useRef, useState } from "react";

import {
  journeyChapters,
  portfolioIdentity,
} from "@/content/portfolio-content";

import { JourneyChapterCard } from "./journey-chapter-card";
import { JourneyChapterDetail } from "./journey-chapter-detail";
import { PortfolioSectionHeading } from "./portfolio-section-heading";

export function ProfessionalJourneyApp() {
  const [selectedChapterId, setSelectedChapterId] = useState(
    journeyChapters[0]?.id ?? "",
  );
  const detailRef = useRef<HTMLDivElement>(null);
  const triggerRefs = useRef(new Map<string, HTMLButtonElement>());
  const selectedChapter =
    journeyChapters.find((chapter) => chapter.id === selectedChapterId) ??
    journeyChapters[0];

  useEffect(() => {
    detailRef.current?.focus();
  }, [selectedChapterId]);

  return (
    <section className="space-y-5" aria-labelledby="journey-title">
      <PortfolioSectionHeading
        eyebrow="Professional journey"
        title="Capability evolution and product-building direction"
        titleId="journey-title"
        description={`${portfolioIdentity.brand} presents the current professional direction of an ${portfolioIdentity.role}, focused on scalable, secure, professional, and future-ready digital products.`}
      />
      <div className="rounded-[var(--radius-panel)] border border-[var(--glass-border)] bg-white/[0.04] p-4">
        <p className="font-mono text-xs tracking-[0.22em] text-[var(--color-signal)] uppercase">
          Current professional direction
        </p>
        <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
          This sequence connects IT operations, software architecture, web and
          mobile delivery, data, cloud, AI solutions, and automation across the
          current EMRAN LABS product ecosystems.
        </p>
      </div>
      <div className="grid gap-5 xl:grid-cols-[0.95fr_1.25fr]">
        <section
          aria-label="Capability evolution sequence"
          className="relative space-y-3 before:absolute before:top-4 before:bottom-4 before:left-6 before:w-px before:bg-[var(--glass-border)]"
        >
          {journeyChapters.map((chapter) => (
            <div key={chapter.id} className="relative pl-6">
              <span
                className="absolute top-6 left-[1.18rem] size-3 rounded-full border border-[var(--color-signal)] bg-[var(--color-void)]"
                aria-hidden="true"
              />
              <JourneyChapterCard
                chapter={chapter}
                active={chapter.id === selectedChapter.id}
                buttonRef={(element) => {
                  if (element) triggerRefs.current.set(chapter.id, element);
                  else triggerRefs.current.delete(chapter.id);
                }}
                onSelect={() => setSelectedChapterId(chapter.id)}
              />
            </div>
          ))}
        </section>
        <div
          ref={detailRef}
          tabIndex={-1}
          className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-signal)]"
        >
          <JourneyChapterDetail chapter={selectedChapter} />
        </div>
      </div>
    </section>
  );
}
