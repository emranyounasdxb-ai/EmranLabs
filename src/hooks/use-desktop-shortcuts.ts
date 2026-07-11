"use client";

import { useEffect } from "react";

import { useDesktopStore } from "@/stores/desktop-store";

const isEditableTarget = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  target.matches("input, textarea, select, [contenteditable='true']");

export function useDesktopShortcuts() {
  const commandCenterOpen = useDesktopStore((state) => state.commandCenterOpen);
  const setCommandCenterOpen = useDesktopStore(
    (state) => state.setCommandCenterOpen,
  );
  const activeWindowId = useDesktopStore((state) => state.activeWindowId);
  const closeWindow = useDesktopStore((state) => state.closeWindow);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandCenterOpen(true);
        return;
      }

      if (event.key !== "Escape") return;

      if (commandCenterOpen) {
        event.preventDefault();
        setCommandCenterOpen(false);
        return;
      }

      if (activeWindowId && !isEditableTarget(event.target)) {
        event.preventDefault();
        closeWindow(activeWindowId);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeWindowId, closeWindow, commandCenterOpen, setCommandCenterOpen]);
}
