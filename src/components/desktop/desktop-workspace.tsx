"use client";

import { useEffect } from "react";

import { desktopAppMap, desktopApps } from "@/config/desktop-apps";
import { useDesktopStore } from "@/stores/desktop-store";
import type { DesktopAppId } from "@/types/desktop";

import { DesktopAppIcon } from "./desktop-app-icon";
import { DesktopWindow } from "./desktop-window";

const skills = [
  "AI Solutions",
  "Next.js and React",
  "TypeScript",
  "FastAPI",
  "Supabase and PostgreSQL",
  "UI/UX Systems",
  "Business Automation",
  "Mobile Applications",
];
const projects = ["eDrive", "Aliyas360", "INAYA Domestic"];

function AppContent({ appId }: { appId: DesktopAppId }) {
  if (appId === "about") {
    return (
      <div className="space-y-4">
        <p className="font-heading text-3xl font-semibold text-[var(--text-primary)]">
          EMRAN LABS
        </p>
        <p className="text-lg text-[var(--color-signal)]">
          Building the Future of AI & Digital Experiences
        </p>
        <p>
          This is a personal technology portfolio focused on AI, design,
          development, and creative technology.
        </p>
      </div>
    );
  }
  if (appId === "skills") {
    return (
      <ul className="grid gap-3 sm:grid-cols-2">
        {skills.map((skill) => (
          <li
            key={skill}
            className="rounded-2xl border border-[var(--glass-border)] bg-white/[0.04] px-4 py-3 text-[var(--text-primary)]"
          >
            {skill}
          </li>
        ))}
      </ul>
    );
  }
  if (appId === "portfolio") {
    return (
      <div className="space-y-4">
        <p>Active product ecosystems:</p>
        <ul className="grid gap-3">
          {projects.map((project) => (
            <li
              key={project}
              className="rounded-2xl border border-[var(--glass-border)] bg-white/[0.04] px-4 py-3 text-[var(--text-primary)]"
            >
              {project}
            </li>
          ))}
        </ul>
      </div>
    );
  }
  if (appId === "contact") {
    return (
      <div className="space-y-4">
        <p className="font-heading text-2xl font-semibold text-[var(--text-primary)]">
          Contact Interface
        </p>
        <p>Contact channels will be connected in a later phase.</p>
      </div>
    );
  }
  return <p>This application is planned for a later phase.</p>;
}

export function DesktopWorkspace() {
  const windows = useDesktopStore((state) => state.windows);
  const activeWindowId = useDesktopStore((state) => state.activeWindowId);
  const openWindow = useDesktopStore((state) => state.openWindow);
  const closeWindow = useDesktopStore((state) => state.closeWindow);
  const minimizeWindow = useDesktopStore((state) => state.minimizeWindow);
  const focusWindow = useDesktopStore((state) => state.focusWindow);
  const setWindowPosition = useDesktopStore((state) => state.setWindowPosition);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isEditable = target?.matches(
        "input, textarea, select, [contenteditable='true']",
      );
      if (event.key === "Escape" && activeWindowId && !isEditable)
        closeWindow(activeWindowId);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeWindowId, closeWindow]);

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
            <AppContent appId={windowState.appId} />
          </DesktopWindow>
        );
      })}
    </main>
  );
}
