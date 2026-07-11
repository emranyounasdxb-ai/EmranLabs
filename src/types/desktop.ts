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

export type DesktopCommandCategory =
  "application" | "desktop-action" | "planned";

export type DesktopCommandAction =
  | { type: "open-app"; appId: DesktopAppId }
  | { type: "minimize-active-window" }
  | { type: "close-active-window" }
  | { type: "close-all-windows" }
  | { type: "restore-all-windows" }
  | { type: "reset-desktop-layout" };

export type DesktopCommandAvailability =
  "always" | "has-active-window" | "has-open-windows" | "has-minimized-windows";

export type DesktopCommand = {
  id: string;
  label: string;
  description?: string;
  icon: LucideIcon;
  keywords: string[];
  category: DesktopCommandCategory;
  availability: DesktopCommandAvailability;
  action: DesktopCommandAction;
};
