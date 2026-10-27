"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minus,
  Plus,
  X,
} from "lucide-react";
import { AnimatedDialog } from "./animated-dialog";

export type ProjectScreen = { image: string; caption: string };
export function ProjectImageViewer({
  screens,
  index,
  hero = false,
}: {
  screens: ProjectScreen[];
  index: number;
  hero?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(index);
  const [zoom, setZoom] = useState(1);
  const screen = screens[current];
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = previous;
    };
  }, [open]);
  function move(delta: number) {
    setCurrent((value) => (value + delta + screens.length) % screens.length);
    setZoom(1);
  }
  return (
    <>
      <button
        className="project-screen-trigger"
        aria-label={`Enlarge: ${screens[index].caption}`}
        onClick={(event) => {
          // Safari does not focus buttons on pointer click by default.
          // Give the native dialog a reliable element to restore focus to.
          event.currentTarget.focus({ preventScroll: true });
          setCurrent(index);
          setZoom(1);
          setOpen(true);
        }}
      >
        <Image
          src={screens[index].image}
          alt={screens[index].caption}
          width={1280}
          height={800}
          sizes={
            hero
              ? "(max-width: 760px) 90vw, 900px"
              : "(max-width: 760px) 90vw, 440px"
          }
          loading={hero ? "eager" : "lazy"}
        />
        <span className="screen-enlarge">
          <Maximize2 size={14} /> View screenshot
        </span>
      </button>
      <AnimatedDialog
        open={open}
        onClose={() => setOpen(false)}
        className="system-dialog project-image-viewer"
        label="Project screenshot viewer"
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            move(-1);
          }
          if (event.key === "ArrowRight") {
            event.preventDefault();
            move(1);
          }
        }}
      >
        <div className="image-viewer-toolbar">
          <strong>
            Project screenshots{" "}
            <span>
              {current + 1} / {screens.length}
            </span>
          </strong>
          <div>
            <button
              aria-label="Zoom out"
              disabled={zoom <= 1}
              onClick={() => setZoom((value) => Math.max(1, value - 0.25))}
            >
              <Minus size={18} />
            </button>
            <button
              className="zoom-reset"
              aria-label="Fit screenshot"
              onClick={() => setZoom(1)}
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              aria-label="Zoom in"
              disabled={zoom >= 2}
              onClick={() => setZoom((value) => Math.min(2, value + 0.25))}
            >
              <Plus size={18} />
            </button>
            <button
              aria-label="Close screenshot viewer"
              onClick={() => setOpen(false)}
            >
              <X size={20} />
            </button>
          </div>
        </div>
        <div
          className="image-viewer-canvas"
          data-zoomed={zoom > 1}
          key={`${current}-${zoom === 1}`}
          tabIndex={0}
          aria-label="Screenshot; scroll to explore when zoomed"
        >
          <div style={{ width: `${zoom * 100}%` }}>
            <Image
              src={screen.image}
              alt={screen.caption}
              width={1600}
              height={1000}
              sizes="(max-width: 760px) 100vw, 90vw"
              quality={90}
            />
          </div>
        </div>
        <div className="image-viewer-footer">
          <button aria-label="Previous screenshot" onClick={() => move(-1)}>
            <ChevronLeft size={20} />
          </button>
          <p aria-live="polite">{screen.caption}</p>
          <button aria-label="Next screenshot" onClick={() => move(1)}>
            <ChevronRight size={20} />
          </button>
        </div>
      </AnimatedDialog>
    </>
  );
}
