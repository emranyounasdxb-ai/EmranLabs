"use client";

import dynamic from "next/dynamic";
import type { CSSProperties, PointerEvent } from "react";
import { useCallback, useRef } from "react";

import { useReducedMotion } from "@/hooks/use-reduced-motion";

const EmranDigitalCore = dynamic(
  () =>
    import("@/components/three/emran-digital-core").then(
      (module) => module.EmranDigitalCore,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full rounded-full bg-[radial-gradient(circle,rgba(23,227,192,0.16),rgba(123,92,255,0.06)_42%,transparent_70%)]" />
    ),
  },
);

export function DesktopBackground() {
  const rootRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const reducedMotion = useReducedMotion();

  const updateDepth = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (reducedMotion || frameRef.current !== null) return;

      const { clientX, clientY } = event;
      frameRef.current = window.requestAnimationFrame(() => {
        frameRef.current = null;
        const x = (clientX / window.innerWidth - 0.5) * 18;
        const y = (clientY / window.innerHeight - 0.5) * 18;
        rootRef.current?.style.setProperty("--desktop-depth-x", `${x}px`);
        rootRef.current?.style.setProperty("--desktop-depth-y", `${y}px`);
      });
    },
    [reducedMotion],
  );

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="pointer-events-auto absolute inset-0 overflow-hidden"
      onPointerMove={updateDepth}
      style={
        {
          "--desktop-depth-x": "0px",
          "--desktop-depth-y": "0px",
        } as CSSProperties
      }
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(23,227,192,0.18),transparent_30%),radial-gradient(circle_at_78%_10%,rgba(123,92,255,0.14),transparent_32%),linear-gradient(180deg,rgba(21,23,30,0.94),var(--color-void))]" />
      <div className="desktop-atmosphere pointer-events-none absolute inset-[-8%] opacity-80" />
      <div className="desktop-grid pointer-events-none absolute inset-0 opacity-35" />
      <div className="desktop-scanline pointer-events-none absolute inset-0 opacity-30" />
      <div className="pointer-events-none absolute top-[13%] right-[6%] hidden aspect-square w-[min(34vw,29rem)] translate-x-[calc(var(--desktop-depth-x)*-0.38)] translate-y-[calc(var(--desktop-depth-y)*-0.38)] lg:block">
        <EmranDigitalCore className="h-full w-full opacity-75" />
      </div>
      <div className="pointer-events-none absolute right-[12%] bottom-[18%] h-56 w-56 translate-x-[calc(var(--desktop-depth-x)*0.6)] translate-y-[calc(var(--desktop-depth-y)*0.6)] rounded-full bg-[var(--signature-gradient)] opacity-10 blur-3xl" />
      <div className="pointer-events-none absolute top-[42%] left-[14%] h-px w-[38vw] rotate-[-18deg] bg-gradient-to-r from-transparent via-[rgba(23,227,192,0.28)] to-transparent opacity-60" />
    </div>
  );
}
