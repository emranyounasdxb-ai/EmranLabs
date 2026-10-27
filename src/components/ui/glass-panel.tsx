import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

type GlassPanelProps = ComponentPropsWithoutRef<"section">;

export function GlassPanel({ className, ...props }: GlassPanelProps) {
  return (
    <section
      className={cn(
        "rounded-[var(--radius-panel)] border border-[var(--glass-border)] bg-[var(--glass-fill)] p-6 shadow-[var(--shadow-panel)] backdrop-blur-xl sm:p-8",
        "before:pointer-events-none before:absolute before:inset-x-6 before:top-0 before:h-px before:bg-[var(--glass-highlight)]",
        "relative overflow-hidden",
        className,
      )}
      {...props}
    />
  );
}
