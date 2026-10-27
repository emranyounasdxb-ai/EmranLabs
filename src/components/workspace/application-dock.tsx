"use client";

import {
  Fragment,
  useEffect,
  useState,
  type CSSProperties,
  type MouseEvent,
} from "react";
import { X } from "lucide-react";
import { AppIcon } from "./app-icon";
import { AnimatedDialog } from "./animated-dialog";
import { MenuPopover } from "./desktop-menu";
import { ToolGrid } from "./tool-grid";
import { useDockMotion } from "./use-dock-motion";
import {
  layoutDock,
  toolGroups,
  type Tool,
  type ToolId,
  type ToolGroupId,
} from "./workspace-tools";
import {
  socialLinks,
  socialLabels,
  type AppName,
  type Collection,
} from "./workspace-data";
import type { DockPreferences } from "./dock-preferences";
import type { DesktopState } from "./window-manager";

const macApps: { icon: string; label: string; app?: AppName }[] = [
  { icon: "finder", label: "Finder · All Projects", app: "projects" },
  { icon: "launchpad", label: "Launchpad" },
  { icon: "safari", label: "Safari · Web projects" },
  { icon: "mail", label: "Mail · Connect", app: "contact" },
  { icon: "calendar", label: "Calendar", app: "calendar" },
  { icon: "notes", label: "Notes", app: "notes" },
  { icon: "photos", label: "Photos · Wallpaper", app: "photos" },
  { icon: "settings", label: "System Settings", app: "settings" },
];

export function ApplicationDock({
  preferences,
  calm,
  desktop,
  collection,
  date,
  timeZone,
  onApp,
  onCollection,
  onLaunchpad,
  onPin,
  onOpenOverlay,
}: {
  preferences: DockPreferences;
  calm: boolean;
  desktop: DesktopState;
  collection: Collection;
  date: Date | null;
  timeZone: string;
  onApp: (app: AppName) => void;
  onCollection: (collection: Collection) => void;
  onLaunchpad: () => void;
  onPin: (id: ToolId) => void;
  onOpenOverlay: () => void;
}) {
  const [width, setWidth] = useState(0);
  const [stack, setStack] = useState<{
    id: ToolGroupId;
    center: number;
  } | null>(null);
  const [stackOpen, setStackOpen] = useState(false);
  const [menu, setMenu] = useState<{ tool: Tool; x: number; y: number } | null>(
    null,
  );
  useEffect(() => {
    const resize = () => {
      setWidth(innerWidth);
      setStackOpen(false);
      setMenu(null);
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);
  const groups = layoutDock(width, preferences.size, preferences.pinned);
  const layoutKey = groups
    .map(
      (group) =>
        `${group.id}:${group.visible.map((tool) => tool.id).join(",")}:${!!group.stacked.length}`,
    )
    .join("|");
  const dockRef = useDockMotion(calm, preferences.magnify, layoutKey);
  const selectedStack = toolGroups.find((group) => group.id === stack?.id);
  const separator = <span className="dock-separator" aria-hidden="true" />;
  function toolMenu(event: MouseEvent, tool: Tool) {
    event.preventDefault();
    event.stopPropagation();
    onOpenOverlay();
    (event.currentTarget as HTMLElement).focus({ preventScroll: true });
    setMenu({ tool, x: event.clientX, y: event.clientY - 90 });
  }
  return (
    <>
      <div
        className={`dock-reveal-zone ${preferences.autoHide ? "dock-auto-hide" : ""}`}
      >
        <nav
          ref={dockRef}
          className="dock application-dock"
          aria-label="Application dock"
          style={
            {
              "--preferred-dock-size": `${preferences.size}px`,
            } as CSSProperties
          }
        >
          <div className="dock-group" role="group" aria-label="Mac apps">
            {macApps.map((item) => (
              <button
                key={item.icon}
                data-dialog-trigger
                data-dock-app={item.app}
                className={`dock-item ${item.app && desktop.windows.some((window) => window.id === item.app) ? "running" : ""}`}
                aria-label={item.label}
                onClick={() =>
                  item.app
                    ? onApp(item.app)
                    : item.icon === "launchpad"
                      ? onLaunchpad()
                      : onCollection("Next.js")
                }
              >
                <AppIcon name={item.icon} date={date} timeZone={timeZone} />
                <span className="dock-tooltip">{item.label}</span>
              </button>
            ))}
          </div>
          {groups.map((group) => (
            <Fragment key={group.id}>
              {separator}
              <div className="dock-group" role="group" aria-label={group.label}>
                {group.visible.map((tool) => (
                  <button
                    key={tool.id}
                    className={`dock-item ${desktop.active === "projects" && collection === tool.collection ? "running" : ""}`}
                    data-dock-tool={tool.id}
                    aria-label={`${tool.label} projects`}
                    onClick={() => onCollection(tool.collection)}
                    onContextMenu={(event) => toolMenu(event, tool)}
                  >
                    <AppIcon name={tool.id} />
                    <span className="dock-tooltip">{tool.label}</span>
                  </button>
                ))}
                {!!group.stacked.length && (
                  <button
                    className="dock-item dock-stack-trigger"
                    data-dialog-trigger
                    data-dock-stack={group.id}
                    aria-label={`${group.label} tools`}
                    aria-haspopup="dialog"
                    aria-expanded={stackOpen && stack?.id === group.id}
                    onClick={(event) => {
                      onOpenOverlay();
                      const rect = event.currentTarget.getBoundingClientRect();
                      setStack({
                        id: group.id,
                        center: rect.left + rect.width / 2,
                      });
                      setStackOpen(true);
                    }}
                  >
                    <span
                      className={`app-icon tool-stack-art stack-${group.id}`}
                      aria-hidden="true"
                    >
                      {group.stacked.slice(0, 4).map((tool) => (
                        <AppIcon key={tool.id} name={tool.id} />
                      ))}
                    </span>
                    <span className="dock-tooltip">{group.label}</span>
                  </button>
                )}
              </div>
            </Fragment>
          ))}
          {separator}
          <div className="dock-group" role="group" aria-label="Social links">
            {Object.entries(socialLinks).map(([id, href]) => (
              <a
                key={id}
                className="dock-item"
                aria-label={socialLabels[id]}
                href={href}
                target="_blank"
                rel="noreferrer"
              >
                <AppIcon name={id} />
                <span className="dock-tooltip">{socialLabels[id]} ↗</span>
              </a>
            ))}
          </div>
          {separator}
          <button
            className="dock-item"
            aria-label="Trash"
            onClick={() => onApp("trash")}
          >
            <AppIcon name="trash" />
            <span className="dock-tooltip">Trash</span>
          </button>
        </nav>
      </div>
      <AnimatedDialog
        open={stackOpen}
        onClose={() => setStackOpen(false)}
        label={`${selectedStack?.label ?? "Workspace"} tools`}
        className="system-dialog dock-stack"
        style={{
          left: Math.max(
            16,
            Math.min(
              (stack?.center ?? width / 2) - 210,
              width - Math.min(420, width - 32) - 16,
            ),
          ),
        }}
      >
        {selectedStack && (
          <>
            <header className="dock-stack-header">
              <div>
                <span className="eyebrow">EXPLORE MY WORK</span>
                <h2>{selectedStack.label}</h2>
              </div>
              <button
                className="icon-button"
                aria-label="Close tools"
                onClick={() => setStackOpen(false)}
              >
                <X size={18} />
              </button>
            </header>
            <ToolGrid
              tools={selectedStack.tools}
              pinned={preferences.pinned}
              onPin={onPin}
              onOpen={(tool) => {
                setStackOpen(false);
                onCollection(tool.collection);
              }}
            />
            <p className="dock-stack-hint">
              Open a tool to explore its projects. Pin favourites for quick
              access when space allows.
            </p>
          </>
        )}
      </AnimatedDialog>
      {menu && (
        <MenuPopover
          label={`${menu.tool.label} actions`}
          x={menu.x}
          y={menu.y}
          onClose={() => setMenu(null)}
          items={[
            {
              label: "Explore projects",
              action: () => onCollection(menu.tool.collection),
            },
            {
              label: "Keep in Dock",
              checked: preferences.pinned.includes(menu.tool.id),
              action: () => onPin(menu.tool.id),
            },
          ]}
        />
      )}
    </>
  );
}
