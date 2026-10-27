import Link from "next/link";
import { ProjectImageViewer } from "./project-image-viewer";
import { ArrowLeft, ArrowUpRight, Globe, Check } from "lucide-react";
import type { Project } from "./workspace-data";
import { projectStories } from "./project-stories";
import { ContactChannels } from "./contact-channels";
import { ProjectWalkthrough, ProjectViewEvent } from "./project-walkthrough";

export function ProjectDetails({
  project,
  onBack,
  onContact,
}: {
  project: Project;
  onBack?: () => void;
  onContact?: () => void;
}) {
  const story = projectStories[project.id];
  const screens = [
    { image: project.image, caption: `${project.name} website screenshot` },
    ...(story?.gallery ?? []),
  ];
  const contactAction = (className: string) =>
    onContact ? (
      <button className={className} onClick={onContact}>
        Discuss a project <ArrowUpRight size={14} />
      </button>
    ) : (
      <Link className={className} href={`/contact?project=${project.id}`}>
        Discuss a project <ArrowUpRight size={14} />
      </Link>
    );
  return (
    <article className="project-detail rich-project">
      <ProjectViewEvent id={project.id} />
      {onBack && (
        <button className="text-link project-back" onClick={onBack}>
          <ArrowLeft size={14} /> All projects
        </button>
      )}
      <div className="project-title-row">
        <div>
          <span className="eyebrow">{project.kind}</span>
          <h1>{project.name}</h1>
        </div>
        <span className={`project-status ${project.live ? "is-live" : ""}`}>
          <span />
          {project.status}
        </span>
      </div>
      <p className="detail-summary">{project.summary}</p>
      <div className="project-actions">
        {project.live && (
          <a
            className="primary-button"
            href={project.live}
            target="_blank"
            rel="noreferrer"
          >
            <Globe size={15} /> Visit website <ArrowUpRight size={14} />
          </a>
        )}
        {contactAction("secondary-button")}
        {!project.live && (
          <span className="local-project-label">
            You’re exploring the local version.
          </span>
        )}
      </div>
      <div className="project-preview-frame">
        <div className="preview-browser-bar">
          <span className="preview-dots">
            <i />
            <i />
            <i />
          </span>
          <span>
            <Globe size={11} />
            {project.displayUrl}
          </span>
          <ArrowUpRight size={12} />
        </div>
        <ProjectImageViewer screens={screens} index={0} hero />
        <span className="preview-caption">
          {project.live
            ? "Live website · captured October 2026"
            : "Local desktop preview · in progress"}
        </span>
      </div>
      <div className="project-info-grid">
        <section>
          <h2>What’s inside</h2>
          <ul>
            {project.features.map((feature) => (
              <li key={feature}>
                <Check size={14} />
                {feature}
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h2>Built with</h2>
          <div className="tech-tags">
            {project.technologies.map((tech) => (
              <span key={tech}>{tech}</span>
            ))}
          </div>
        </section>
      </div>
      {story && (
        <section className="case-study">
          <h2>Behind the project</h2>
          <dl className="case-study-role">
            <div>
              <dt>My role</dt>
              <dd>{story.role}</dd>
            </div>
            <div>
              <dt>Project</dt>
              <dd>{project.kind}</dd>
            </div>
          </dl>
          <p className="detail-summary">{story.responsibility}</p>
          <section className="case-study-section">
            <h3>The goal</h3>
            <p>{story.goal}</p>
          </section>
          <section className="case-study-section">
            <h3>How I approached it</h3>
            <ul>
              {story.approach.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </section>
          <section className="case-study-section">
            <h3>The result</h3>
            <p>{story.outcome}</p>
          </section>
        </section>
      )}
      <ProjectWalkthrough project={project} />
      {!!story?.gallery.length && (
        <section className="project-gallery">
          <h2>A closer look</h2>
          <div className="project-gallery-grid">
            {story.gallery.map((screen, index) => (
              <figure key={screen.image}>
                <ProjectImageViewer screens={screens} index={index + 1} />
                <figcaption>{screen.caption}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}
      <div className="case-study-next">
        {contactAction("primary-button")}
        <Link className="text-link" href="/services">
          How I can help <ArrowUpRight size={14} />
        </Link>
      </div>
      <ContactChannels project={project.id} />
    </article>
  );
}
