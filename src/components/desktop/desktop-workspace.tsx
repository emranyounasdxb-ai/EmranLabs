"use client";

import { desktopAppMap, desktopApps } from "@/config/desktop-apps";
import { AppContentRouter } from "@/components/portfolio-apps/app-content-router";
import { useDesktopStore } from "@/stores/desktop-store";
import { DesktopAppIcon } from "./desktop-app-icon";
import { DesktopWindow } from "./desktop-window";

export function DesktopWorkspace() {
  const windows = useDesktopStore((state) => state.windows);
  const activeWindowId = useDesktopStore((state) => state.activeWindowId);
  const openWindow = useDesktopStore((state) => state.openWindow);
  const closeWindow = useDesktopStore((state) => state.closeWindow);
  const minimizeWindow = useDesktopStore((state) => state.minimizeWindow);
  const focusWindow = useDesktopStore((state) => state.focusWindow);
  const setWindowPosition = useDesktopStore((state) => state.setWindowPosition);

  return (
    <main
      className="relative z-10 min-h-screen overflow-hidden px-4 pt-20 pb-28"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget)
          useDesktopStore.setState({ activeWindowId: null });
      }}
    >
      <div className="grid w-fit grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-1">
        {desktopApps.map((app) => (
          <DesktopAppIcon
            key={app.id}
            app={app}
            onClick={() => openWindow(app.id)}
          />
        ))}
      </div>
      {Object.values(windows).map((windowState) => {
        const app = desktopAppMap.get(windowState.appId);
        if (!app || windowState.minimized) return null;
        return (
          <DesktopWindow
            key={windowState.appId}
            app={app}
            windowState={windowState}
            active={activeWindowId === windowState.appId}
            onFocus={() => focusWindow(windowState.appId)}
            onMinimize={() => minimizeWindow(windowState.appId)}
            onClose={() => closeWindow(windowState.appId)}
            onMove={(position) =>
              setWindowPosition(windowState.appId, position)
            }
          >
            <AppContentRouter appId={windowState.appId} />
          </DesktopWindow>
        );
      })}
    </main>
  );
}
