"use client";

import { Circle, Clock3, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { desktopAppMap } from "@/config/desktop-apps";
import { useDesktopStore } from "@/stores/desktop-store";

import { DesktopShortcutHint } from "./desktop-shortcut-hint";

export function DesktopTopBar() {
  const activeWindowId = useDesktopStore((state) => state.activeWindowId);
  const setCommandCenterOpen = useDesktopStore(
    (state) => state.setCommandCenterOpen,
  );
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () =>
      setTime(
        new Intl.DateTimeFormat(undefined, {
          hour: "2-digit",
          minute: "2-digit",
        }).format(new Date()),
      );
    updateTime();
    const timer = window.setInterval(updateTime, 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const activeTitle = useMemo(
    () =>
      activeWindowId ? desktopAppMap.get(activeWindowId)?.title : "Desktop",
    [activeWindowId],
  );

  return (
    <header className="fixed top-3 right-3 left-3 z-[200] flex min-h-12 items-center justify-between rounded-full border border-[var(--glass-border)] bg-[rgba(11,12,16,0.72)] px-4 text-sm shadow-[var(--shadow-panel)] backdrop-blur-xl sm:px-5">
      <div className="flex min-w-0 items-center gap-3">
        <span className="font-heading shrink-0 font-semibold tracking-[-0.03em]">
          EMRAN LABS
        </span>
        <span className="hidden h-4 w-px bg-[var(--glass-border)] sm:block" />
        <span className="hidden truncate text-[var(--text-secondary)] sm:inline">
          {activeTitle}
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-2 text-[var(--text-secondary)]">
        <button
          type="button"
          onClick={() => setCommandCenterOpen(true)}
          aria-label="Open command center"
          className="flex min-h-10 min-w-10 items-center justify-center gap-2 rounded-full border border-[var(--glass-border)] bg-white/[0.055] px-3 text-[var(--text-primary)] transition hover:border-[rgba(23,227,192,0.42)] hover:bg-white/[0.085]"
        >
          <Search aria-hidden="true" className="size-4" />
          <span className="hidden sm:inline">Command</span>
          <DesktopShortcutHint keys={["Ctrl/⌘", "K"]} />
        </button>
        <span className="hidden items-center gap-1.5 lg:flex">
          <Circle
            aria-hidden="true"
            className="size-2 fill-[var(--color-signal)] text-[var(--color-signal)]"
          />
          Shell online
        </span>
        <span className="hidden items-center gap-1.5 sm:flex">
          <Clock3 aria-hidden="true" className="size-4" /> {time || "--:--"}
        </span>
      </div>
    </header>
  );
}
