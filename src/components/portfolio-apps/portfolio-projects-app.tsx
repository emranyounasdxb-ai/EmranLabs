"use client";

import { useEffect, useRef, useState } from "react";

import { portfolioProjects } from "@/content/portfolio-content";

import { PortfolioProjectCard } from "./portfolio-project-card";
import { PortfolioProjectDetail } from "./portfolio-project-detail";
import { PortfolioSectionHeading } from "./portfolio-section-heading";

export function PortfolioProjectsApp() {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  );
  const headingRef = useRef<HTMLHeadingElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  const selectedProject = portfolioProjects.find(
    (project) => project.id === selectedProjectId,
  );

  useEffect(() => {
    if (selectedProject) detailRef.current?.focus();
  }, [selectedProject]);

  if (selectedProject) {
    return (
      <div ref={detailRef} tabIndex={-1}>
        <PortfolioProjectDetail
          project={selectedProject}
          onBack={() => {
            setSelectedProjectId(null);
            window.setTimeout(() => headingRef.current?.focus(), 0);
          }}
        />
      </div>
    );
  }

  return (
    <section className="space-y-5">
      <div ref={headingRef} tabIndex={-1}>
        <PortfolioSectionHeading
          eyebrow="Product ecosystems"
          title="Portfolio projects"
          description="Current product ecosystems and platform directions, presented without invented metrics, launch claims, or unsupported results."
        />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {portfolioProjects.map((project) => (
          <PortfolioProjectCard
            key={project.id}
            project={project}
            onViewDetails={() => setSelectedProjectId(project.id)}
          />
        ))}
      </div>
    </section>
  );
}
