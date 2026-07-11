import type { Transition, Variants } from "framer-motion";

export const motionTimings = {
  instant: 0.12,
  fast: 0.18,
  standard: 0.24,
  considered: 0.34,
} as const;

export const motionEase = [0.22, 1, 0.36, 1] as const;

export const motionTransitions = {
  standard: { duration: motionTimings.standard, ease: motionEase },
  fast: { duration: motionTimings.fast, ease: motionEase },
  considered: { duration: motionTimings.considered, ease: motionEase },
} satisfies Record<string, Transition>;

export const windowMotionVariants = {
  initial: { opacity: 0, scale: 0.975, y: 14, filter: "blur(10px)" },
  animate: { opacity: 1, scale: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, scale: 0.985, y: 10, filter: "blur(8px)" },
} satisfies Variants;

export const commandCenterMotionVariants = {
  initial: { opacity: 0, scale: 0.965, y: 18, filter: "blur(12px)" },
  animate: { opacity: 1, scale: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, scale: 0.98, y: 10, filter: "blur(10px)" },
} satisfies Variants;

export const overlayMotionVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
} satisfies Variants;

export const cardMotionVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
} satisfies Variants;
