"use client";

import { motion } from "framer-motion";
import { Search } from "lucide-react";

import { desktopApps } from "@/config/desktop-apps";
import { motionTransitions } from "@/config/motion";
import { useDesktopStore } from "@/stores/desktop-store";

import { DesktopAppIcon } from "./desktop-app-icon";

export function DesktopDock() {
  const windows = useDesktopStore((state) => state.windows);
  const activeWindowId = useDesktopStore((state) => state.activeWindowId);
  const openWindow = useDesktopStore((state) => state.openWindow);
  const minimizeWindow = useDesktopStore((state) => state.minimizeWindow);
  const restoreWindow = useDesktopStore((state) => state.restoreWindow);
  const setCommandCenterOpen = useDesktopStore(
    (state) => state.setCommandCenterOpen,
  );

  return (
    <nav
      aria-label="Application dock"
      className="fixed right-2 bottom-3 left-2 z-[210] flex justify-center sm:bottom-5"
    >
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={motionTransitions.standard}
        className="flex max-w-full gap-2 overflow-x-auto rounded-[2rem] border border-[var(--glass-border)] bg-[rgba(11,12,16,0.76)] p-2 shadow-[var(--shadow-panel)] backdrop-blur-xl"
      >
        <button
          type="button"
          onClick={() => setCommandCenterOpen(true)}
          aria-label="Open command center"
          className="grid min-h-12 min-w-12 place-items-center rounded-2xl border border-[var(--glass-border)] bg-white/[0.055] text-[var(--text-primary)] transition hover:border-[rgba(23,227,192,0.42)] hover:bg-white/[0.085] sm:hidden"
        >
          <Search aria-hidden="true" className="size-5" />
        </button>
        {desktopApps.map((app) => {
          const windowState = windows[app.id];
          const active = activeWindowId === app.id;
          return (
            <DesktopAppIcon
              key={app.id}
              app={app}
              compact
              active={active}
              minimized={windowState?.minimized}
              onClick={() => {
                if (!app.enabled) return;
                if (!windowState) openWindow(app.id);
                else if (active && !windowState.minimized)
                  minimizeWindow(app.id);
                else restoreWindow(app.id);
              }}
            />
          );
        })}
      </motion.div>
    </nav>
  );
}
