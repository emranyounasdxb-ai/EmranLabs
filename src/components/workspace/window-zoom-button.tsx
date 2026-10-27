"use client";
import { useEffect, useRef } from "react";
import { Maximize2 } from "lucide-react";
export function WindowZoomButton({
  maximized,
  onToggle,
  onOptions,
}: {
  maximized: boolean;
  onToggle: () => void;
  onOptions: (x: number, y: number) => void;
}) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancel = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  function show(element: HTMLElement) {
    const r = element.getBoundingClientRect();
    cancel();
    onOptions(r.left - 8, r.bottom + 12);
  }
  return (
    <button
      className="maximize"
      aria-label={maximized ? "Restore window size" : "Maximize window"}
      aria-haspopup="menu"
      onClick={() => {
        cancel();
        onToggle();
      }}
      onPointerEnter={(e) => {
        const element = e.currentTarget;
        if (e.pointerType === "mouse")
          timer.current = setTimeout(() => show(element), 450);
      }}
      onPointerLeave={cancel}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        show(e.currentTarget);
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          show(e.currentTarget);
        }
      }}
    >
      <Maximize2 size={8} />
    </button>
  );
}
