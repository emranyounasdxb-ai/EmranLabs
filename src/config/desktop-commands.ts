import {
  ArchiveRestore,
  ExternalLink,
  Layers,
  Minus,
  RotateCcw,
  SearchX,
  X,
} from "lucide-react";

import { desktopApps } from "@/config/desktop-apps";
import type { DesktopCommand } from "@/types/desktop";

const enabledApplicationCommands = desktopApps
  .filter((app) => app.enabled)
  .map((app) => ({
    id: `open-${app.id}`,
    label: `Open ${app.title}`,
    description: `Launch ${app.title} in the desktop workspace.`,
    icon: app.icon,
    keywords: [app.title, app.shortLabel, "application", "open", "launch"],
    category: "application",
    availability: "always",
    action: { type: "open-app", appId: app.id },
  })) satisfies DesktopCommand[];

export const desktopCommands = [
  ...enabledApplicationCommands,
  {
    id: "minimize-active-window",
    label: "Minimize active window",
    description: "Send the focused application window to the dock.",
    icon: Minus,
    keywords: ["minimize", "hide", "active", "window"],
    category: "desktop-action",
    availability: "has-active-window",
    action: { type: "minimize-active-window" },
  },
  {
    id: "close-active-window",
    label: "Close active window",
    description: "Close the focused application window.",
    icon: X,
    keywords: ["close", "active", "window", "dismiss"],
    category: "desktop-action",
    availability: "has-active-window",
    action: { type: "close-active-window" },
  },
  {
    id: "close-all-windows",
    label: "Close all windows",
    description: "Clear every open desktop window.",
    icon: SearchX,
    keywords: ["close", "all", "windows", "clear", "workspace"],
    category: "desktop-action",
    availability: "has-open-windows",
    action: { type: "close-all-windows" },
  },
  {
    id: "restore-all-windows",
    label: "Restore all minimized windows",
    description: "Bring minimized windows back into the workspace.",
    icon: ArchiveRestore,
    keywords: ["restore", "minimized", "windows", "show"],
    category: "desktop-action",
    availability: "has-minimized-windows",
    action: { type: "restore-all-windows" },
  },
  {
    id: "reset-desktop-layout",
    label: "Reset desktop layout",
    description:
      "Return open windows to their default size and position while preserving minimized state.",
    icon: RotateCcw,
    keywords: ["reset", "layout", "position", "size", "default"],
    category: "desktop-action",
    availability: "has-open-windows",
    action: { type: "reset-desktop-layout" },
  },
] satisfies DesktopCommand[];

export const plannedCommandIndicator = {
  id: "planned-applications",
  label: "Later-phase applications remain visible on the desktop and dock.",
  icon: Layers,
  actionIcon: ExternalLink,
};
