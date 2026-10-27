"use client";

import { useSyncExternalStore } from "react";

export const workspaceEntryKey = "emranlabs-workspace-entered-v1";
const entryEvent = "emranlabs:workspace-entered";
let enteredInMemory = false;

function hasEntered() {
  if (typeof window === "undefined") return false;
  try {
    return (
      enteredInMemory || sessionStorage.getItem(workspaceEntryKey) === "true"
    );
  } catch {
    return enteredInMemory;
  }
}

function subscribe(notify: () => void) {
  window.addEventListener(entryEvent, notify);
  return () => window.removeEventListener(entryEvent, notify);
}

/** Remember entry for this tab only. Visitor names are never persisted. */
export function enterWorkspace() {
  enteredInMemory = true;
  try {
    sessionStorage.setItem(workspaceEntryKey, "true");
  } catch {
    // A blocked browser store must not prevent guest access.
  }
  window.dispatchEvent(new Event(entryEvent));
}

export function useWorkspaceEntry() {
  return useSyncExternalStore(subscribe, hasEntered, () => false);
}

export function isWorkspacePath(pathname: string) {
  return pathname === "/" || pathname.startsWith("/workspace/");
}
