"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Monitor, Smartphone, Play } from "lucide-react";
import { trackEvent } from "@/lib/analytics/client";
import type { Project } from "./workspace-data";
import { projectStories } from "./project-stories";

const explanations: Record<string, string[]> = {
  edrive: [
    "A visitor can understand the water-sports offer before choosing an experience.",
    "Package information supports a more specific booking request. Availability still needs to be confirmed.",
    "A dedicated lookup screen gives returning visitors a place to follow up on their request.",
  ],
  inaya: [
    "The opening experience introduces the domestic-service business and its main customer journeys.",
    "Services are organized so customers can explore their options before preparing an enquiry.",
    "The Arabic experience adapts navigation and layout for right-to-left reading.",
  ],
  emranlabs: [
    "The workspace brings project discovery, services and direct contact into a familiar desktop.",
    "The profile explains the person and technical focus behind the work.",
    "The contact form sends an enquiry directly and follows it with an automated receipt.",
  ],
};

export function ProjectViewEvent({ id }: { id: string }) {
  const reported = useRef("");
  useEffect(() => {
    if (reported.current === id) return;
    reported.current = id;
    trackEvent("project_detail_opened", { project: id });
  }, [id]);
  return null;
}

export function ProjectWalkthrough({ project }: { project: Project }) {
  const story = projectStories[project.id];
  const screens = [
    { image: project.image, caption: "The first impression" },
    ...(story?.gallery ?? []),
  ];
  const [step, setStep] = useState(0);
  const [mobile, setMobile] = useState(false);
  const hasMobile = project.id === "edrive" || project.id === "inaya";
  const current = screens[step];
  function select(index: number) {
    setStep(index);
    setMobile(false);
    trackEvent("project_walkthrough_opened", { project: project.id });
  }
  return (
    <section
      className="project-walkthrough"
      aria-label={`${project.name} screen walkthrough`}
    >
      <div className="tour-heading">
        <div>
          <span className="eyebrow">THE EXPERIENCE, UP CLOSE</span>
          <h2>A short tour of the work.</h2>
        </div>
        {hasMobile && (
          <div className="tour-devices" aria-label="Preview device">
            <button aria-pressed={!mobile} onClick={() => setMobile(false)}>
              <Monitor size={15} />
              Desktop
            </button>
            <button aria-pressed={mobile} onClick={() => setMobile(true)}>
              <Smartphone size={15} />
              Mobile
            </button>
          </div>
        )}
      </div>
      <div className="tour-screens" data-mobile={mobile}>
        <Image
          key={mobile ? "mobile" : current.image}
          src={
            mobile
              ? `/images/projects/${project.id}-mobile.webp`
              : current.image
          }
          alt={
            mobile
              ? `${project.name} captured on a mobile viewport`
              : current.caption
          }
          width={mobile ? 390 : 1280}
          height={mobile ? 844 : 800}
          sizes={mobile ? "260px" : "(max-width:760px) 90vw, 800px"}
        />
      </div>
      <div className="tour-caption" aria-live="polite">
        <span>
          {mobile ? "MOBILE EXPERIENCE" : `0${step + 1} / 0${screens.length}`}
        </span>
        <h3>{mobile ? "Designed for a smaller screen." : current.caption}</h3>
        <p>
          {mobile
            ? "A real capture of the live website at a 390px viewport. Open the live website to try the interactions."
            : explanations[project.id]?.[step]}
        </p>
      </div>
      <div className="tour-controls">
        <button
          aria-label="Previous tour screen"
          disabled={step === 0}
          onClick={() => select(step - 1)}
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          {screens.map((screen, index) => (
            <button
              key={screen.image}
              aria-label={`Tour screen ${index + 1}`}
              aria-pressed={!mobile && index === step}
              onClick={() => select(index)}
            >
              {index + 1}
            </button>
          ))}
        </div>
        <button
          aria-label="Next tour screen"
          disabled={step === screens.length - 1}
          onClick={() => select(step + 1)}
        >
          <ArrowRight size={16} />
        </button>
      </div>
      {hasMobile && (
        <details className="tour-video">
          <summary>
            <Play size={15} />
            Watch the screen tour{" "}
            <span>18 sec · captured interface screens</span>
          </summary>
          <video
            controls
            playsInline
            preload="none"
            poster={project.image}
            aria-label={`${project.name} captured screen tour`}
            onPlay={() =>
              trackEvent("project_walkthrough_opened", { project: project.id })
            }
          >
            <source
              src={`/videos/${project.id}-screen-tour.mp4`}
              type="video/mp4"
            />
            <track
              kind="captions"
              src={`/videos/${project.id}-screen-tour.vtt`}
              srcLang="en"
              label="English"
              default
            />
          </video>
          <p>
            A silent tour assembled from actual website captures. The
            step-by-step descriptions above provide the text alternative.
          </p>
        </details>
      )}
    </section>
  );
}
