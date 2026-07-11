"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

import { motionTransitions } from "@/config/motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export function DesktopMotionProvider({ children }: { children: ReactNode }) {
  const reducedMotion = useReducedMotion();

  return (
    <MotionConfig
      reducedMotion={reducedMotion ? "always" : "user"}
      transition={motionTransitions.standard}
    >
      {children}
    </MotionConfig>
  );
}
