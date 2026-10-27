import {
  collections,
  projects,
  type AppName,
  type Collection,
} from "./workspace-data";
import type { DesktopState } from "./window-manager";
import type { WindowFrame } from "./window-geometry";

export const workspaceStorageKey = "emranlabs-workspace-v2";
export const appNames: AppName[] = [
  "projects",
  "about",
  "contact",
  "notes",
  "calendar",
  "settings",
  "photos",
  "trash",
  "help",
  "services",
];
export const accentColors = {
  blue: "#007aff",
  purple: "#8b5bd7",
  rose: "#d34e79",
  green: "#248565",
  orange: "#bd641c",
} as const;
export type Accent = keyof typeof accentColors;
export type SavedWorkspace = {
  desktop: DesktopState;
  collection: Collection;
  project: string | null;
  list: boolean;
  sort: "featured" | "name" | "kind";
  showSidebar: boolean;
};

export function parseWorkspace(raw: string | null): SavedWorkspace | null {
  try {
    const v = JSON.parse(raw ?? "null");
    if (!v || !Array.isArray(v.desktop?.windows)) return null;
    const seen = new Set<string>();
    const windows = v.desktop.windows
      .filter(
        (w: { id: AppName }) =>
          w && appNames.includes(w.id) && !seen.has(w.id) && !!seen.add(w.id),
      )
      .map((w: { id: AppName; minimized: unknown }) => ({
        id: w.id,
        minimized: w.minimized === true,
      }));
    const active = windows.some(
      (w: { id: AppName; minimized: boolean }) =>
        w.id === v.desktop.active && !w.minimized,
    )
      ? v.desktop.active
      : (windows.findLast((w: { minimized: boolean }) => !w.minimized)?.id ??
        "projects");
    return {
      desktop: { windows, active },
      collection: collections.includes(v.collection)
        ? v.collection
        : "Overview",
      project: projects.some((p) => p.id === v.project) ? v.project : null,
      list: v.list === true,
      sort: ["featured", "name", "kind"].includes(v.sort) ? v.sort : "featured",
      showSidebar: v.showSidebar !== false,
    };
  } catch {
    return null;
  }
}

export function clampSavedFrame(
  value: unknown,
  width: number,
  height: number,
): WindowFrame | null {
  const v = value as WindowFrame | null;
  if (
    !v ||
    ![v.x, v.y, v.width, v.height].every(Number.isFinite) ||
    v.width < 100 ||
    v.height < 100
  )
    return null;
  const w = Math.min(Math.max(340, v.width), Math.max(340, width - 16));
  const h = Math.min(Math.max(300, v.height), Math.max(300, height - 124));
  return {
    width: w,
    height: h,
    x: Math.max(8, Math.min(v.x, width - w - 8)),
    y: Math.max(38, Math.min(v.y, height - h - 86)),
  };
}
