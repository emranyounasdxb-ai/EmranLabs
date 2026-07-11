import type { LucideIcon } from "lucide-react";

export type DesktopAppId =
  | "about"
  | "skills"
  | "portfolio"
  | "creative-labs"
  | "journey"
  | "contact"
  | "em-ai";

export type DesktopRect = {
  width: number;
  height: number;
};

export type DesktopPoint = {
  x: number;
  y: number;
};

export type DesktopApp = {
  id: DesktopAppId;
  title: string;
  shortLabel: string;
  icon: LucideIcon;
  defaultSize: DesktopRect;
  defaultPosition: DesktopPoint;
  enabled: boolean;
};

export type DesktopWindowState = {
  appId: DesktopAppId;
  zIndex: number;
  position: DesktopPoint;
  size: DesktopRect;
  minimized: boolean;
};
