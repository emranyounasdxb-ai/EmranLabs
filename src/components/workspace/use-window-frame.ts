"use client";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from "react";
import {
  resizeFrame,
  type WindowFrame,
  type ResizeEdge,
} from "./window-geometry";
import { clampSavedFrame } from "./desktop-preferences";

export function useWindowFrame(id: string) {
  const windowRef = useRef<HTMLElement>(null);
  const [frame, setFrame] = useState<WindowFrame | null>(null);
  const [maximized, setMaximized] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const [ready, setReady] = useState(false);
  const [desktopLayout, setDesktopLayout] = useState(false);
  const restoredDesktop = useRef(false);
  const motionFrame = useRef(0);
  const pendingFrame = useRef<WindowFrame | null>(null);
  const storageKey = `emranlabs-frame-v2-${id}`;
  const gesture = useRef<{
    x: number;
    y: number;
    frame: WindowFrame;
    edge?: ResizeEdge;
  } | null>(null);
  useEffect(() => {
    const resize = () => {
      cancelAnimationFrame(motionFrame.current);
      if (windowRef.current) windowRef.current.style.translate = "";
      motionFrame.current = 0;
      pendingFrame.current = null;
      const wide = innerWidth >= 900;
      setDesktopLayout(wide);
      if (wide) {
        if (!restoredDesktop.current) {
          try {
            const saved = JSON.parse(
              localStorage.getItem(storageKey) ?? "null",
            );
            setFrame(clampSavedFrame(saved?.frame, innerWidth, innerHeight));
            setMaximized(saved?.maximized === true);
          } catch {}
          restoredDesktop.current = true;
        } else {
          setFrame((current) =>
            clampSavedFrame(current, innerWidth, innerHeight),
          );
        }
      }
      setInteracting(false);
      gesture.current = null;
    };
    resize();
    // Storage and viewport restoration must finish before persistence starts.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReady(true);
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(motionFrame.current);
    };
  }, [storageKey]);
  useEffect(() => {
    if (!ready || !desktopLayout || interacting || innerWidth < 900) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify({ frame, maximized }));
    } catch {}
  }, [frame, maximized, interacting, ready, desktopLayout, storageKey]);
  function readFrame(): WindowFrame | null {
    const r = windowRef.current?.getBoundingClientRect();
    return r ? { x: r.x, y: r.y, width: r.width, height: r.height } : null;
  }
  function start(event: PointerEvent<HTMLElement>, edge?: ResizeEdge) {
    if (maximized || innerWidth < 900 || event.button !== 0) return;
    if (!edge && (event.target as Element).closest("button,input,a")) return;
    const current = readFrame();
    if (!current) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    gesture.current = {
      x: event.clientX,
      y: event.clientY,
      frame: current,
      edge,
    };
    setFrame(current);
    setInteracting(true);
  }
  function move(event: PointerEvent<HTMLElement>) {
    const current = gesture.current;
    if (!current) return;
    const dx = event.clientX - current.x,
      dy = event.clientY - current.y;
    pendingFrame.current = current.edge
      ? resizeFrame(
          current.frame,
          current.edge,
          dx,
          dy,
          innerWidth,
          innerHeight,
        )
      : {
          ...current.frame,
          x: Math.max(
            8,
            Math.min(
              innerWidth - current.frame.width - 8,
              current.frame.x + dx,
            ),
          ),
          y: Math.max(
            38,
            Math.min(
              innerHeight - current.frame.height - 86,
              current.frame.y + dy,
            ),
          ),
        };
    // Move the existing composited window without rerendering its contents.
    // React commits and persists the final geometry when the gesture finishes.
    if (!motionFrame.current)
      motionFrame.current = requestAnimationFrame(() => {
        motionFrame.current = 0;
        const element = windowRef.current;
        const next = pendingFrame.current;
        const activeGesture = gesture.current;
        if (!element || !next || !activeGesture) return;
        if (activeGesture.edge) {
          element.style.left = `${next.x + next.width / 2}px`;
          element.style.top = `${next.y}px`;
          element.style.width = `${next.width}px`;
          element.style.height = `${next.height}px`;
        } else {
          element.style.translate = `${next.x - activeGesture.frame.x}px ${next.y - activeGesture.frame.y}px`;
        }
      });
  }
  function end() {
    cancelAnimationFrame(motionFrame.current);
    motionFrame.current = 0;
    const element = windowRef.current;
    const next = pendingFrame.current;
    if (element && next) {
      element.style.left = `${next.x + next.width / 2}px`;
      element.style.top = `${next.y}px`;
      element.style.width = `${next.width}px`;
      element.style.height = `${next.height}px`;
      element.style.translate = "";
      // Commit once while transitions are disabled, avoiding a second slide
      // from the old layout position when the interacting class is removed.
      element.getBoundingClientRect();
      setFrame(next);
    }
    pendingFrame.current = null;
    gesture.current = null;
    setInteracting(false);
  }
  function toggleMaximize() {
    setMaximized((v) => !v);
  }
  function resetWindow() {
    restoredDesktop.current = true;
    setFrame(null);
    setMaximized(false);
    try {
      localStorage.removeItem(storageKey);
    } catch {}
  }
  function snap(side: "left" | "right") {
    if (innerWidth < 900) {
      setMaximized(true);
      return;
    }
    const width = (innerWidth - 28) / 2;
    setMaximized(false);
    setFrame({
      x: side === "left" ? 10 : width + 18,
      y: 42,
      width,
      height: innerHeight - 128,
    });
  }
  function keyboardResize(dx: number, dy: number) {
    if (innerWidth < 900) return;
    const r = readFrame();
    if (r && !maximized)
      setFrame(resizeFrame(r, "se", dx, dy, innerWidth, innerHeight));
  }
  const style: CSSProperties =
    desktopLayout && frame && !maximized
      ? {
          left: frame.x + frame.width / 2,
          top: frame.y,
          width: frame.width,
          height: frame.height,
        }
      : {};
  return {
    windowRef,
    style,
    placed: desktopLayout && !!frame && !maximized,
    maximized,
    interacting,
    start,
    move,
    end,
    toggleMaximize,
    resetWindow,
    snap,
    keyboardResize,
  };
}
