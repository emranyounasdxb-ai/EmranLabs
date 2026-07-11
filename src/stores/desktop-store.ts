"use client";

import { create } from "zustand";

import { desktopAppMap } from "@/config/desktop-apps";
import type {
  DesktopAppId,
  DesktopPoint,
  DesktopRect,
  DesktopWindowState,
} from "@/types/desktop";

type DesktopStore = {
  windows: Partial<Record<DesktopAppId, DesktopWindowState>>;
  activeWindowId: DesktopAppId | null;
  nextZIndex: number;
  dockVisible: boolean;
  commandCenterOpen: boolean;
  openWindow: (appId: DesktopAppId) => void;
  closeWindow: (appId: DesktopAppId) => void;
  minimizeWindow: (appId: DesktopAppId) => void;
  restoreWindow: (appId: DesktopAppId) => void;
  focusWindow: (appId: DesktopAppId) => void;
  setWindowPosition: (appId: DesktopAppId, position: DesktopPoint) => void;
  setWindowSize: (appId: DesktopAppId, size: DesktopRect) => void;
  setDockVisible: (visible: boolean) => void;
  setCommandCenterOpen: (open: boolean) => void;
  closeAllWindows: () => void;
  restoreAllWindows: () => void;
  resetDesktopLayout: () => void;
};

const createWindow = (
  appId: DesktopAppId,
  zIndex: number,
): DesktopWindowState | undefined => {
  const app = desktopAppMap.get(appId);

  if (!app || !app.enabled) {
    return undefined;
  }

  return {
    appId,
    zIndex,
    position: app.defaultPosition,
    size: app.defaultSize,
    minimized: false,
  };
};

export const useDesktopStore = create<DesktopStore>((set, get) => ({
  windows: {},
  activeWindowId: null,
  nextZIndex: 20,
  dockVisible: true,
  commandCenterOpen: false,
  openWindow: (appId) => {
    const existingWindow = get().windows[appId];
    const zIndex = get().nextZIndex;

    if (existingWindow) {
      set((state) => ({
        windows: {
          ...state.windows,
          [appId]: { ...existingWindow, minimized: false, zIndex },
        },
        activeWindowId: appId,
        nextZIndex: zIndex + 1,
      }));
      return;
    }

    const windowState = createWindow(appId, zIndex);

    if (!windowState) {
      return;
    }

    set((state) => ({
      windows: { ...state.windows, [appId]: windowState },
      activeWindowId: appId,
      nextZIndex: zIndex + 1,
    }));
  },
  closeWindow: (appId) =>
    set((state) => {
      const remainingWindows = { ...state.windows };
      delete remainingWindows[appId];

      return {
        windows: remainingWindows,
        activeWindowId:
          state.activeWindowId === appId ? null : state.activeWindowId,
      };
    }),
  minimizeWindow: (appId) =>
    set((state) => ({
      windows: state.windows[appId]
        ? {
            ...state.windows,
            [appId]: { ...state.windows[appId], minimized: true },
          }
        : state.windows,
      activeWindowId:
        state.activeWindowId === appId ? null : state.activeWindowId,
    })),
  restoreWindow: (appId) => get().openWindow(appId),
  focusWindow: (appId) => {
    const windowState = get().windows[appId];

    if (!windowState || windowState.minimized) {
      return;
    }

    const zIndex = get().nextZIndex;
    set((state) => ({
      windows: {
        ...state.windows,
        [appId]: { ...windowState, zIndex },
      },
      activeWindowId: appId,
      nextZIndex: zIndex + 1,
    }));
  },
  setWindowPosition: (appId, position) =>
    set((state) => ({
      windows: state.windows[appId]
        ? { ...state.windows, [appId]: { ...state.windows[appId], position } }
        : state.windows,
    })),
  setWindowSize: (appId, size) =>
    set((state) => ({
      windows: state.windows[appId]
        ? { ...state.windows, [appId]: { ...state.windows[appId], size } }
        : state.windows,
    })),
  setDockVisible: (dockVisible) => set({ dockVisible }),
  setCommandCenterOpen: (commandCenterOpen) => set({ commandCenterOpen }),
  closeAllWindows: () => set({ windows: {}, activeWindowId: null }),
  restoreAllWindows: () =>
    set((state) => {
      const entries = Object.values(state.windows).sort(
        (a, b) => a.zIndex - b.zIndex,
      );
      if (entries.length === 0) return state;

      const windows = entries.reduce<
        Partial<Record<DesktopAppId, DesktopWindowState>>
      >((nextWindows, windowState, index) => {
        nextWindows[windowState.appId] = {
          ...windowState,
          minimized: false,
          zIndex: 20 + index,
        };
        return nextWindows;
      }, {});
      const activeWindow = entries.at(-1);

      return {
        windows,
        activeWindowId: activeWindow?.appId ?? null,
        nextZIndex: 20 + entries.length,
      };
    }),
  resetDesktopLayout: () =>
    set((state) => {
      const entries = Object.values(state.windows).sort(
        (a, b) => a.zIndex - b.zIndex,
      );
      if (entries.length === 0) return state;

      const windows = entries.reduce<
        Partial<Record<DesktopAppId, DesktopWindowState>>
      >((nextWindows, windowState, index) => {
        const app = desktopAppMap.get(windowState.appId);
        if (!app) return nextWindows;

        nextWindows[windowState.appId] = {
          ...windowState,
          position: app.defaultPosition,
          size: app.defaultSize,
          zIndex: 20 + index,
        };
        return nextWindows;
      }, {});
      const activeWindow = entries
        .filter((windowState) => !windowState.minimized)
        .at(-1);

      return {
        windows,
        activeWindowId: activeWindow?.appId ?? null,
        nextZIndex: 20 + entries.length,
      };
    }),
}));
