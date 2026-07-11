"use client";

import { Minus, X } from "lucide-react";
import type { CSSProperties, PointerEvent, ReactNode } from "react";
import { useCallback, useRef } from "react";

import type {
  DesktopApp,
  DesktopPoint,
  DesktopWindowState,
} from "@/types/desktop";

type DesktopWindowProps = {
  app: DesktopApp;
  windowState: DesktopWindowState;
  active: boolean;
  children: ReactNode;
  onFocus: () => void;
  onMinimize: () => void;
  onClose: () => void;
  onMove: (position: DesktopPoint) => void;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export function DesktopWindow({
  app,
  windowState,
  active,
  children,
  onFocus,
  onMinimize,
  onClose,
  onMove,
}: DesktopWindowProps) {
  const dragOffset = useRef<DesktopPoint>({ x: 0, y: 0 });
  const Icon = app.icon;

  const moveWindow = useCallback(
    (clientX: number, clientY: number) => {
      const isMobile = window.matchMedia("(max-width: 767px)").matches;
      if (isMobile) return;

      const maxX = window.innerWidth - windowState.size.width - 16;
      const maxY = window.innerHeight - windowState.size.height - 96;
      onMove({
        x: clamp(clientX - dragOffset.current.x, 8, Math.max(8, maxX)),
        y: clamp(clientY - dragOffset.current.y, 64, Math.max(64, maxY)),
      });
    },
    [onMove, windowState.size.height, windowState.size.width],
  );

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("button")) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;

    onFocus();
    dragOffset.current = {
      x: event.clientX - windowState.position.x,
      y: event.clientY - windowState.position.y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  return (
    <section
      role="dialog"
      aria-label={app.title}
      aria-modal="false"
      onPointerDown={onFocus}
      className="fixed right-3 bottom-24 left-3 flex max-h-[calc(100dvh-7.5rem)] flex-col overflow-hidden rounded-[var(--radius-panel)] border bg-[rgba(21,23,30,0.86)] shadow-[var(--shadow-panel)] backdrop-blur-2xl transition-[border-color,box-shadow,opacity] duration-[var(--duration-standard)] ease-[var(--motion-ease)] md:right-auto md:bottom-auto md:left-auto md:translate-x-[var(--window-x)] md:translate-y-[var(--window-y)]"
      style={
        {
          "--window-x": `${windowState.position.x}px`,
          "--window-y": `${windowState.position.y}px`,
          width: `min(${windowState.size.width}px, calc(100vw - 1.5rem))`,
          height: `min(${windowState.size.height}px, calc(100dvh - 7.5rem))`,
          zIndex: windowState.zIndex,
          borderColor: active ? "rgba(23,227,192,0.42)" : "var(--glass-border)",
          boxShadow: active
            ? "var(--shadow-panel), var(--glow-restraint)"
            : "var(--shadow-panel)",
        } as CSSProperties
      }
    >
      <div
        className="flex min-h-14 touch-none items-center justify-between border-b border-[var(--glass-border)] px-4"
        onPointerDown={handlePointerDown}
        onPointerMove={(event) =>
          event.currentTarget.hasPointerCapture(event.pointerId) &&
          moveWindow(event.clientX, event.clientY)
        }
      >
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-xl border border-[var(--glass-border)] bg-white/[0.055]">
            <Icon className="size-4" />
          </span>
          <h2 className="font-heading text-sm font-semibold tracking-[-0.02em]">
            {app.title}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onMinimize}
            aria-label={`Minimize ${app.title}`}
            className="grid min-h-10 min-w-10 place-items-center rounded-full text-[var(--text-secondary)] transition hover:bg-white/10 hover:text-[var(--text-primary)]"
          >
            <Minus className="size-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label={`Close ${app.title}`}
            className="grid min-h-10 min-w-10 place-items-center rounded-full text-[var(--text-secondary)] transition hover:bg-white/10 hover:text-[var(--text-primary)]"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-auto p-5 text-sm leading-6 text-[var(--text-secondary)] sm:p-6">
        {children}
      </div>
    </section>
  );
}
