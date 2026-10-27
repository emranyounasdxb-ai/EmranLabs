"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Search } from "lucide-react";
import type { KeyboardEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  commandCenterMotionVariants,
  motionTransitions,
  overlayMotionVariants,
} from "@/config/motion";
import { desktopCommands } from "@/config/desktop-commands";
import { useDesktopStore } from "@/stores/desktop-store";
import type { DesktopCommand, DesktopCommandAction } from "@/types/desktop";

import { DesktopCommandItem } from "./desktop-command-item";
import { DesktopShortcutHint } from "./desktop-shortcut-hint";

const categoryLabels: Record<DesktopCommand["category"], string> = {
  application: "Applications",
  "desktop-action": "Desktop actions",
  planned: "Planned",
};

const focusableSelector =
  'button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';

const commandMatchesQuery = (command: DesktopCommand, query: string) => {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return true;

  return [command.label, command.description, ...command.keywords].some(
    (value) => value?.toLowerCase().includes(normalizedQuery),
  );
};

export function DesktopCommandCenter() {
  const commandCenterOpen = useDesktopStore((state) => state.commandCenterOpen);
  const setCommandCenterOpen = useDesktopStore(
    (state) => state.setCommandCenterOpen,
  );
  const windows = useDesktopStore((state) => state.windows);
  const activeWindowId = useDesktopStore((state) => state.activeWindowId);
  const openWindow = useDesktopStore((state) => state.openWindow);
  const minimizeWindow = useDesktopStore((state) => state.minimizeWindow);
  const closeWindow = useDesktopStore((state) => state.closeWindow);
  const closeAllWindows = useDesktopStore((state) => state.closeAllWindows);
  const restoreAllWindows = useDesktopStore((state) => state.restoreAllWindows);
  const resetDesktopLayout = useDesktopStore(
    (state) => state.resetDesktopLayout,
  );

  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  const availability = useMemo(() => {
    const openWindows = Object.values(windows);
    return {
      hasActiveWindow: Boolean(activeWindowId),
      hasOpenWindows: openWindows.length > 0,
      hasMinimizedWindows: openWindows.some(
        (windowState) => windowState.minimized,
      ),
    };
  }, [activeWindowId, windows]);

  const isCommandAvailable = useCallback(
    (command: DesktopCommand) => {
      if (command.availability === "always") return true;
      if (command.availability === "has-active-window")
        return availability.hasActiveWindow;
      if (command.availability === "has-open-windows")
        return availability.hasOpenWindows;
      if (command.availability === "has-minimized-windows")
        return availability.hasMinimizedWindows;
      return false;
    },
    [availability],
  );

  const filteredCommands = useMemo(
    () =>
      desktopCommands.filter((command) => commandMatchesQuery(command, query)),
    [query],
  );

  const enabledFilteredCommands = useMemo(
    () => filteredCommands.filter(isCommandAvailable),
    [filteredCommands, isCommandAvailable],
  );

  const groupedCommands = useMemo(
    () =>
      filteredCommands.reduce<
        Partial<Record<DesktopCommand["category"], DesktopCommand[]>>
      >((groups, command) => {
        groups[command.category] = [
          ...(groups[command.category] ?? []),
          command,
        ];
        return groups;
      }, {}),
    [filteredCommands],
  );

  const closeCommandCenter = useCallback(() => {
    setCommandCenterOpen(false);
  }, [setCommandCenterOpen]);

  const executeAction = useCallback(
    (action: DesktopCommandAction) => {
      if (action.type === "open-app") openWindow(action.appId);
      if (action.type === "minimize-active-window" && activeWindowId)
        minimizeWindow(activeWindowId);
      if (action.type === "close-active-window" && activeWindowId)
        closeWindow(activeWindowId);
      if (action.type === "close-all-windows") closeAllWindows();
      if (action.type === "restore-all-windows") restoreAllWindows();
      if (action.type === "reset-desktop-layout") resetDesktopLayout();
      closeCommandCenter();
    },
    [
      activeWindowId,
      closeAllWindows,
      closeCommandCenter,
      closeWindow,
      minimizeWindow,
      openWindow,
      resetDesktopLayout,
      restoreAllWindows,
    ],
  );

  useEffect(() => {
    if (!commandCenterOpen) return;

    openerRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    window.setTimeout(() => {
      setQuery("");
      setActiveIndex(0);
      inputRef.current?.focus();
    }, 0);
  }, [commandCenterOpen]);

  const restoreOpenerFocus = useCallback(() => {
    openerRef.current?.focus();
    openerRef.current = null;
  }, []);

  const safeActiveIndex = Math.min(
    activeIndex,
    Math.max(enabledFilteredCommands.length - 1, 0),
  );
  const activeCommand = enabledFilteredCommands[safeActiveIndex];

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) =>
        enabledFilteredCommands.length === 0
          ? 0
          : (index + 1) % enabledFilteredCommands.length,
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) =>
        enabledFilteredCommands.length === 0
          ? 0
          : (index - 1 + enabledFilteredCommands.length) %
            enabledFilteredCommands.length,
      );
      return;
    }

    if (event.key === "Enter" && activeCommand) {
      event.preventDefault();
      executeAction(activeCommand.action);
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      closeCommandCenter();
      return;
    }

    if (event.key === "Tab" && dialogRef.current) {
      const focusableElements = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(focusableSelector),
      );
      const firstElement = focusableElements.at(0);
      const lastElement = focusableElements.at(-1);
      if (!firstElement || !lastElement) return;

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  };

  return (
    <AnimatePresence onExitComplete={restoreOpenerFocus}>
      {commandCenterOpen && (
        <motion.div
          variants={overlayMotionVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={motionTransitions.fast}
          className="fixed inset-0 z-[500] flex items-end justify-center bg-black/45 px-3 py-4 backdrop-blur-sm sm:items-center sm:p-6"
          onPointerDown={closeCommandCenter}
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="command-center-title"
            variants={commandCenterMotionVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={motionTransitions.standard}
            className="max-h-[min(86dvh,44rem)] w-full max-w-2xl overflow-hidden rounded-[1.75rem] border border-[var(--glass-border)] bg-[rgba(11,12,16,0.92)] shadow-[var(--shadow-panel)] backdrop-blur-2xl"
            onKeyDown={handleKeyDown}
            onPointerDown={(event) => event.stopPropagation()}
          >
            <div className="border-b border-[var(--glass-border)] p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2
                    id="command-center-title"
                    className="font-heading text-lg font-semibold tracking-[-0.03em] text-[var(--text-primary)]"
                  >
                    Command Center
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Search applications and desktop actions.
                  </p>
                </div>
                <DesktopShortcutHint keys={["Esc"]} />
              </div>
              <label className="sr-only" htmlFor="desktop-command-search">
                Search commands
              </label>
              <div className="flex min-h-12 items-center gap-3 rounded-2xl border border-[var(--glass-border)] bg-white/[0.055] px-4">
                <Search
                  aria-hidden="true"
                  className="size-4 text-[var(--color-signal)]"
                />
                <input
                  ref={inputRef}
                  id="desktop-command-search"
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setActiveIndex(0);
                  }}
                  placeholder="Search apps and actions"
                  className="min-w-0 flex-1 bg-transparent text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-secondary)]"
                  autoComplete="off"
                />
              </div>
            </div>

            <div
              className="max-h-[52dvh] overflow-y-auto p-3 sm:p-4"
              role="listbox"
              aria-label="Command results"
            >
              {filteredCommands.length === 0 && (
                <p className="rounded-2xl border border-[var(--glass-border)] bg-white/[0.035] px-4 py-6 text-center text-sm text-[var(--text-secondary)]">
                  No commands match your search.
                </p>
              )}

              {Object.entries(groupedCommands).map(([category, commands]) => (
                <section key={category} className="mb-4 last:mb-0">
                  <h3 className="px-3 pb-2 font-mono text-[0.68rem] tracking-[0.22em] text-[var(--text-secondary)] uppercase">
                    {categoryLabels[category as DesktopCommand["category"]]}
                  </h3>
                  <div className="space-y-1">
                    {commands.map((command) => {
                      const commandIndex = enabledFilteredCommands.findIndex(
                        (enabledCommand) => enabledCommand.id === command.id,
                      );
                      const disabled = !isCommandAvailable(command);
                      return (
                        <DesktopCommandItem
                          key={command.id}
                          command={command}
                          active={commandIndex === safeActiveIndex && !disabled}
                          disabled={disabled}
                          onPointerMove={() => {
                            if (commandIndex >= 0) setActiveIndex(commandIndex);
                          }}
                          onSelect={() => {
                            if (!disabled) executeAction(command.action);
                          }}
                        />
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
