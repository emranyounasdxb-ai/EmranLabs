"use client";

import { useEffect, useRef, useState } from "react";

import { creativeLabs } from "@/content/portfolio-content";

import { CreativeLabCard } from "./creative-lab-card";
import { CreativeLabDetail } from "./creative-lab-detail";
import { PortfolioSectionHeading } from "./portfolio-section-heading";

export function CreativeLabsApp() {
  const [selectedLabId, setSelectedLabId] = useState<string | null>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  const triggerRefs = useRef(new Map<string, HTMLButtonElement>());
  const selectedLab = creativeLabs.find((lab) => lab.id === selectedLabId);

  useEffect(() => {
    if (selectedLab) detailRef.current?.focus();
  }, [selectedLab]);

  if (selectedLab) {
    return (
      <div
        ref={detailRef}
        tabIndex={-1}
        className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-signal)]"
      >
        <CreativeLabDetail
          lab={selectedLab}
          onBack={() => {
            const labId = selectedLab.id;
            setSelectedLabId(null);
            window.setTimeout(
              () => triggerRefs.current.get(labId)?.focus(),
              0,
            );
          }}
        />
      </div>
    );
  }

  return (
    <section className="space-y-5" aria-labelledby="creative-labs-title">
      <PortfolioSectionHeading
        eyebrow="Creative labs"
        title="Exploration themes and concept directions"
        titleId="creative-labs-title"
        description="A collection of research themes, concept directions, and planned experiments exploring practical product ideas before production decisions are made."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        {creativeLabs.map((lab) => (
          <CreativeLabCard
            key={lab.id}
            lab={lab}
            buttonRef={(element) => {
              if (element) triggerRefs.current.set(lab.id, element);
              else triggerRefs.current.delete(lab.id);
            }}
            onViewDetails={() => setSelectedLabId(lab.id)}
          />
        ))}
      </div>
    </section>
  );
}
