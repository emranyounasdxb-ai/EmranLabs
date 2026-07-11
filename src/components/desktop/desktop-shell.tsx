"use client";

import { DesktopMotionProvider } from "@/components/motion/motion-provider";
import { useDesktopShortcuts } from "@/hooks/use-desktop-shortcuts";

import { DesktopBackground } from "./desktop-background";
import { DesktopCommandCenter } from "./desktop-command-center";
import { DesktopDock } from "./desktop-dock";
import { DesktopTopBar } from "./desktop-top-bar";
import { DesktopWorkspace } from "./desktop-workspace";

export function DesktopShell() {
  useDesktopShortcuts();

  return (
    <DesktopMotionProvider>
      <div className="relative min-h-screen overflow-hidden bg-[var(--background-primary)] text-[var(--text-primary)]">
        <DesktopBackground />
        <DesktopTopBar />
        <DesktopWorkspace />
        <DesktopDock />
        <DesktopCommandCenter />
      </div>
    </DesktopMotionProvider>
  );
}
