"use client";

import { desktopApps } from "@/config/desktop-apps";
import { useDesktopStore } from "@/stores/desktop-store";

import { DesktopAppIcon } from "./desktop-app-icon";

export function DesktopDock() {
  const windows = useDesktopStore((state) => state.windows);
  const activeWindowId = useDesktopStore((state) => state.activeWindowId);
  const openWindow = useDesktopStore((state) => state.openWindow);
  const minimizeWindow = useDesktopStore((state) => state.minimizeWindow);
  const restoreWindow = useDesktopStore((state) => state.restoreWindow);

  return (
    <nav
      aria-label="Application dock"
      className="fixed right-2 bottom-3 left-2 z-[210] flex justify-center sm:bottom-5"
    >
      <div className="flex max-w-full gap-2 overflow-x-auto rounded-[2rem] border border-[var(--glass-border)] bg-[rgba(11,12,16,0.76)] p-2 shadow-[var(--shadow-panel)] backdrop-blur-xl">
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
      </div>
    </nav>
  );
}
