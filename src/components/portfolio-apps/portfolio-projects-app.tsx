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
  const detailRef = useRef<HTMLDivElement>(null);
  const triggerRefs = useRef(new Map<string, HTMLButtonElement>());
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
            const projectId = selectedProject.id;
            setSelectedProjectId(null);
            window.setTimeout(() => triggerRefs.current.get(projectId)?.focus(), 0);
          }}
        />
      </div>
    );
  }

  return (
    <section className="space-y-5">
      <PortfolioSectionHeading
        eyebrow="Product ecosystems"
        title="Portfolio projects"
        description="Current product ecosystems and platform directions, presented without invented metrics, launch claims, or unsupported results."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        {portfolioProjects.map((project) => (
          <PortfolioProjectCard
            key={project.id}
            project={project}
            buttonRef={(element) => {
              if (element) triggerRefs.current.set(project.id, element);
              else triggerRefs.current.delete(project.id);
            }}
            onViewDetails={() => setSelectedProjectId(project.id)}
          />
        ))}
      </div>
    </section>
  );
}
