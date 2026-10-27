"use client";

import type { RefObject } from "react";
import { useEffect, useRef } from "react";

import { useDeviceCapabilities } from "@/hooks/use-device-capabilities";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export function useDesktopDepth(rootRef: RefObject<HTMLElement | null>) {
  const frameRef = useRef<number | null>(null);
  const pointerRef = useRef({ x: 0, y: 0 });
  const reducedMotion = useReducedMotion();
  const { finePointer } = useDeviceCapabilities();

  useEffect(() => {
    if (reducedMotion || !finePointer) {
      rootRef.current?.style.setProperty("--desktop-depth-x", "0px");
      rootRef.current?.style.setProperty("--desktop-depth-y", "0px");
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      return;
    }

    const updateDepth = () => {
      frameRef.current = null;
      const x = (pointerRef.current.x / window.innerWidth - 0.5) * 18;
      const y = (pointerRef.current.y / window.innerHeight - 0.5) * 18;
      rootRef.current?.style.setProperty("--desktop-depth-x", `${x}px`);
      rootRef.current?.style.setProperty("--desktop-depth-y", `${y}px`);
    };

    const handlePointerMove = (event: PointerEvent) => {
      pointerRef.current = { x: event.clientX, y: event.clientY };
      if (frameRef.current === null) {
        frameRef.current = window.requestAnimationFrame(updateDepth);
      }
    };

    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [finePointer, reducedMotion, rootRef]);
}
