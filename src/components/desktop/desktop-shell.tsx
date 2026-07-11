"use client";

import { DesktopBackground } from "./desktop-background";
import { DesktopDock } from "./desktop-dock";
import { DesktopTopBar } from "./desktop-top-bar";
import { DesktopWorkspace } from "./desktop-workspace";

export function DesktopShell() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--background-primary)] text-[var(--text-primary)]">
      <DesktopBackground />
      <DesktopTopBar />
      <DesktopWorkspace />
      <DesktopDock />
    </div>
  );
}
