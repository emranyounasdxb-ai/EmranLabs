import { toolIds, type ToolId } from "./workspace-tools";

export type DockPreferences = {
  autoHide: boolean;
  magnify: boolean;
  size: number;
  pinned: ToolId[];
};
export const dockStorageKey = "emranlabs-dock-v1";
export const defaultDock: DockPreferences = {
  autoHide: false,
  magnify: true,
  size: 35,
  pinned: [],
};
export function parseDock(raw: string | null): DockPreferences {
  try {
    const value = JSON.parse(raw ?? "null");
    return {
      autoHide: value?.autoHide === true,
      magnify: value?.magnify !== false,
      pinned: Array.isArray(value?.pinned)
        ? [
            ...new Set<ToolId>(
              value.pinned.filter(
                (id: unknown) => typeof id === "string" && toolIds.includes(id),
              ),
            ),
          ]
        : [],
      size:
        typeof value?.size === "number" && Number.isFinite(value.size)
          ? Math.round(Math.max(30, Math.min(40, value.size)))
          : 35,
    };
  } catch {
    return { ...defaultDock };
  }
}
