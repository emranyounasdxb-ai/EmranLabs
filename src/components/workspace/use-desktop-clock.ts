"use client";

import { useMemo, useSyncExternalStore } from "react";

let timestamp: number | null = null;
let timer: ReturnType<typeof setTimeout> | undefined;
const listeners = new Set<() => void>();

function tick() {
  clearTimeout(timer);
  if (document.visibilityState === "hidden") return;
  timestamp = Math.floor(Date.now() / 1000) * 1000;
  listeners.forEach((notify) => notify());
  // Align to wall-clock seconds, including after a suspended/background tab.
  timer = setTimeout(tick, 1000 - (Date.now() % 1000));
}

function subscribe(notify: () => void) {
  listeners.add(notify);
  if (listeners.size === 1) {
    tick();
    window.addEventListener("focus", tick);
    document.addEventListener("visibilitychange", tick);
  }
  return () => {
    listeners.delete(notify);
    if (!listeners.size) {
      clearTimeout(timer);
      window.removeEventListener("focus", tick);
      document.removeEventListener("visibilitychange", tick);
    }
  };
}

const seconds = () => timestamp;
const minutes = () =>
  timestamp === null ? null : Math.floor(timestamp / 60000) * 60000;
const serverSnapshot = () => null;

/** One clock for menu, widgets and calendar; minute-only consumers stay cheap. */
export function useDesktopClock(precision: "minute" | "second" = "minute") {
  const value = useSyncExternalStore(
    subscribe,
    precision === "second" ? seconds : minutes,
    serverSnapshot,
  );
  return useMemo(() => (value === null ? null : new Date(value)), [value]);
}
