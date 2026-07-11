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
  openWindow: (appId: DesktopAppId) => void;
  closeWindow: (appId: DesktopAppId) => void;
  minimizeWindow: (appId: DesktopAppId) => void;
  restoreWindow: (appId: DesktopAppId) => void;
  focusWindow: (appId: DesktopAppId) => void;
  setWindowPosition: (appId: DesktopAppId, position: DesktopPoint) => void;
  setWindowSize: (appId: DesktopAppId, size: DesktopRect) => void;
  setDockVisible: (visible: boolean) => void;
};

const getTopVisibleWindowId = (
  windows: DesktopStore["windows"],
): DesktopAppId | null =>
  Object.values(windows).reduce<DesktopWindowState | null>(
    (topWindow, currentWindow) => {
      if (!currentWindow || currentWindow.minimized) return topWindow;
      if (!topWindow || currentWindow.zIndex > topWindow.zIndex) {
        return currentWindow;
      }
      return topWindow;
    },
    null,
  )?.appId ?? null;

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
  openWindow: (appId) => {
    const currentState = get();
    const existingWindow = currentState.windows[appId];
    const zIndex = currentState.nextZIndex;

    if (
      existingWindow &&
      currentState.activeWindowId === appId &&
      !existingWindow.minimized
    ) {
      return;
    }

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
          state.activeWindowId === appId
            ? getTopVisibleWindowId(remainingWindows)
            : state.activeWindowId,
      };
    }),
  minimizeWindow: (appId) =>
    set((state) => {
      const windowState = state.windows[appId];
      if (!windowState) return state;

      const windows = {
        ...state.windows,
        [appId]: { ...windowState, minimized: true },
      };

      return {
        windows,
        activeWindowId:
          state.activeWindowId === appId
            ? getTopVisibleWindowId(windows)
            : state.activeWindowId,
      };
    }),
  restoreWindow: (appId) => get().openWindow(appId),
  focusWindow: (appId) => {
    const currentState = get();
    const windowState = currentState.windows[appId];

    if (
      !windowState ||
      windowState.minimized ||
      currentState.activeWindowId === appId
    ) {
      return;
    }

    const zIndex = currentState.nextZIndex;
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
}));
