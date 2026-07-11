"use client";

import { Minus, X } from "lucide-react";
import type { CSSProperties, PointerEvent, ReactNode } from "react";
import { useCallback, useEffect, useRef } from "react";

import { cn } from "@/lib/utils";
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

const isDesktopViewport = () =>
  window.matchMedia("(min-width: 1024px)").matches;

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

  const getClampedPosition = useCallback(
    (x: number, y: number) => {
      const renderedWidth = Math.min(
        windowState.size.width,
        window.innerWidth - 24,
      );
      const renderedHeight = Math.min(
        windowState.size.height,
        window.innerHeight - 120,
      );
      const maxX = Math.max(8, window.innerWidth - renderedWidth - 8);
      const maxY = Math.max(64, window.innerHeight - renderedHeight - 96);

      return {
        x: clamp(x, 8, maxX),
        y: clamp(y, 64, maxY),
      };
    },
    [windowState.size.height, windowState.size.width],
  );

  const moveWindow = useCallback(
    (clientX: number, clientY: number) => {
      if (!isDesktopViewport()) return;

      onMove(
        getClampedPosition(
          clientX - dragOffset.current.x,
          clientY - dragOffset.current.y,
        ),
      );
    },
    [getClampedPosition, onMove],
  );

  useEffect(() => {
    const keepWindowInBounds = () => {
      if (!isDesktopViewport()) return;

      const nextPosition = getClampedPosition(
        windowState.position.x,
        windowState.position.y,
      );

      if (
        nextPosition.x !== windowState.position.x ||
        nextPosition.y !== windowState.position.y
      ) {
        onMove(nextPosition);
      }
    };

    keepWindowInBounds();
    window.addEventListener("resize", keepWindowInBounds);
    return () => window.removeEventListener("resize", keepWindowInBounds);
  }, [
    getClampedPosition,
    onMove,
    windowState.position.x,
    windowState.position.y,
  ]);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!isDesktopViewport()) return;
    if ((event.target as HTMLElement).closest("button")) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;

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
      className={cn(
        "fixed right-3 bottom-24 left-3 h-[calc(100dvh-7.5rem)] max-h-[calc(100dvh-7.5rem)] w-[calc(100vw-1.5rem)] flex-col overflow-hidden rounded-[var(--radius-panel)] border bg-[rgba(21,23,30,0.86)] shadow-[var(--shadow-panel)] backdrop-blur-2xl transition-[border-color,box-shadow,opacity] duration-[var(--duration-standard)] ease-[var(--motion-ease)] lg:top-0 lg:right-auto lg:bottom-auto lg:left-0 lg:h-[min(var(--window-height),calc(100dvh-7.5rem))] lg:w-[min(var(--window-width),calc(100vw-1.5rem))] lg:translate-x-[var(--window-x)] lg:translate-y-[var(--window-y)]",
        active ? "flex" : "hidden lg:flex",
      )}
      style={
        {
          "--window-x": `${windowState.position.x}px`,
          "--window-y": `${windowState.position.y}px`,
          "--window-width": `${windowState.size.width}px`,
          "--window-height": `${windowState.size.height}px`,
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
            <Icon aria-hidden="true" className="size-4" />
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
            <Minus aria-hidden="true" className="size-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label={`Close ${app.title}`}
            className="grid min-h-10 min-w-10 place-items-center rounded-full text-[var(--text-secondary)] transition hover:bg-white/10 hover:text-[var(--text-primary)]"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-auto p-5 text-sm leading-6 text-[var(--text-secondary)] sm:p-6">
        {children}
      </div>
    </section>
  );
}
