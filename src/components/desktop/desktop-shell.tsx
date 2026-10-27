"use client";

import { useRef } from "react";

import { DesktopMotionProvider } from "@/components/motion/motion-provider";
import { useDesktopDepth } from "@/hooks/use-desktop-depth";
import { useDesktopShortcuts } from "@/hooks/use-desktop-shortcuts";

import { DesktopBackground } from "./desktop-background";
import { DesktopCommandCenter } from "./desktop-command-center";
import { DesktopDock } from "./desktop-dock";
import { DesktopTopBar } from "./desktop-top-bar";
import { DesktopWorkspace } from "./desktop-workspace";

export function DesktopShell() {
  const shellRef = useRef<HTMLDivElement>(null);
  useDesktopShortcuts();
  useDesktopDepth(shellRef);

  return (
    <DesktopMotionProvider>
      <a href="#desktop-main" className="skip-link">
        Skip to desktop applications
      </a>
      <div
        ref={shellRef}
        className="relative min-h-screen overflow-hidden bg-[var(--background-primary)] text-[var(--text-primary)] [--desktop-depth-x:0px] [--desktop-depth-y:0px]"
      >
        <DesktopBackground />
        <DesktopTopBar />
        <DesktopWorkspace />
        <DesktopDock />
        <DesktopCommandCenter />
      </div>
    </DesktopMotionProvider>
  );
}
