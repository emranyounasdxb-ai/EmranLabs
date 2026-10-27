"use client";
import { AnimatedDialog } from "./animated-dialog";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { projects, type Project } from "./workspace-data";

export function ProjectFolder({ project }: { project: Project }) {
  return (
    <span className="project-folder-art" aria-hidden="true">
      <img
        src="/icons/folder.svg"
        alt=""
        width={128}
        height={110}
        draggable={false}
      />
      <span className="folder-contact-sheet">
        <Image
          src={project.image}
          alt=""
          width={110}
          height={68}
          sizes="110px"
        />
      </span>
      <span className="folder-project-mark" style={{ backgroundColor: "#fff" }}>
        <img
          src={project.logo}
          alt=""
          width={32}
          height={32}
          draggable={false}
        />
      </span>
    </span>
  );
}

export function QuickLook({
  project,
  onClose,
  onOpen,
  onChange,
}: {
  project: Project | null;
  onClose: () => void;
  onOpen: (project: Project) => void;
  onChange: (project: Project) => void;
}) {
  function step(direction: number) {
    if (!project) return;
    onChange(
      projects[
        (projects.findIndex((p) => p.id === project.id) +
          direction +
          projects.length) %
          projects.length
      ],
    );
  }
  return (
    <AnimatedDialog
      open={!!project}
      onClose={onClose}
      className="quick-look"
      label={project ? `Quick Look: ${project.name}` : "Quick Look"}
      onKeyDown={(event) => {
        if ((event.target as Element).closest("input,textarea")) return;
        if (event.key === " " || event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          onClose();
        }
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault();
          step(event.key === "ArrowLeft" ? -1 : 1);
        }
      }}
    >
      {project && (
        <div className="quick-look-inner">
          <header>
            <button
              className="icon-button"
              onClick={onClose}
              aria-label="Close Quick Look"
            >
              <X size={18} />
            </button>
            <strong>{project.name}</strong>
            <span>Quick Look</span>
          </header>
          <Image
            className="quick-look-image"
            src={project.image}
            alt={`${project.name} website preview`}
            width={1280}
            height={800}
            sizes="(max-width: 760px) 94vw, 850px"
          />
          <div className="quick-look-copy">
            <span className="eyebrow">{project.kind}</span>
            <h2>{project.name}</h2>
            <p>{project.summary}</p>
            <div className="quick-look-actions">
              <button
                className="primary-button"
                onClick={() => onOpen(project)}
              >
                Read case study <ArrowRight size={15} />
              </button>
              {project.live && (
                <a
                  className="text-link"
                  href={project.live}
                  target="_blank"
                  rel="noreferrer"
                >
                  Live Demo <ArrowUpRight size={15} />
                </a>
              )}
            </div>
          </div>
          <footer>
            <button aria-label="Previous project" onClick={() => step(-1)}>
              <ChevronLeft size={17} />
            </button>
            <span>
              {projects.findIndex((p) => p.id === project.id) + 1} of{" "}
              {projects.length}
            </span>
            <button aria-label="Next project" onClick={() => step(1)}>
              <ChevronRight size={17} />
            </button>
            <small>← → to browse · Space to close</small>
          </footer>
        </div>
      )}
    </AnimatedDialog>
  );
}
