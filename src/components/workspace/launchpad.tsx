"use client";

import { useEffect, useRef, useState } from "react";
import { Search, X, ArrowUpRight } from "lucide-react";
import { AnimatedDialog } from "./animated-dialog";
import { AppIcon } from "./app-icon";
import {
  socialLinks,
  socialLabels,
  type AppName,
  type Collection,
} from "./workspace-data";
import { toolGroups, type ToolId } from "./workspace-tools";
import { ToolGrid } from "./tool-grid";

const apps: [AppName, string, string][] = [
  ["projects", "Finder", "finder"],
  ["about", "About Emran", "finder"],
  ["services", "Services", "vscode"],
  ["contact", "Mail", "mail"],
  ["calendar", "Calendar", "calendar"],
  ["notes", "Notes", "notes"],
  ["photos", "Photos", "photos"],
  ["settings", "Settings", "settings"],
  ["help", "Workspace guide", "launchpad"],
  ["trash", "Trash", "trash"],
];

export function Launchpad({
  open,
  onClose,
  onApp,
  onCollection,
  date,
  timeZone,
  pinned,
  onPin,
}: {
  open: boolean;
  onClose: () => void;
  onApp: (app: AppName) => void;
  onCollection: (collection: Collection) => void;
  date: Date | null;
  timeZone: string;
  pinned: readonly ToolId[];
  onPin: (id: ToolId) => void;
}) {
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (open) searchRef.current?.focus();
  }, [open]);
  const matches = (text: string) =>
    text.toLowerCase().includes(query.trim().toLowerCase());
  const appResults = apps.filter(([, label]) => matches(label));
  const toolResults = toolGroups
    .map((group) => ({
      ...group,
      results: group.tools.filter((tool) =>
        matches(`${tool.label} ${tool.search} ${group.label}`),
      ),
    }))
    .filter((group) => group.results.length);
  const socials = Object.entries(socialLinks).filter(([label]) =>
    matches(label),
  );
  function close() {
    onClose();
    setQuery("");
  }
  return (
    <AnimatedDialog
      open={open}
      onClose={close}
      label="Launchpad"
      className="system-dialog launchpad"
    >
      <header className="launchpad-header">
        <div>
          <span className="eyebrow">YOUR WORKSPACE</span>
          <h2>Launchpad</h2>
        </div>
        <button
          className="icon-button"
          aria-label="Close Launchpad"
          onClick={close}
        >
          <X size={20} />
        </button>
      </header>
      <label className="launchpad-search">
        <Search size={19} />
        <input
          ref={searchRef}
          autoFocus
          aria-label="Search Launchpad"
          placeholder="Find an app, tool or social link"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </label>
      <div className="launchpad-content">
        {!!appResults.length && (
          <section aria-label="Workspace apps">
            <h3>Workspace apps</h3>
            <div className="launchpad-grid">
              {appResults.map(([id, label, icon]) => (
                <button
                  key={id}
                  onClick={() => {
                    close();
                    onApp(id);
                  }}
                >
                  <AppIcon name={icon} date={date} timeZone={timeZone} />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </section>
        )}
        {toolResults.map((group) => (
          <section key={group.id} aria-label={group.heading}>
            <h3>{group.heading}</h3>
            <ToolGrid
              tools={group.results}
              pinned={pinned}
              onPin={onPin}
              onOpen={(tool) => {
                close();
                onCollection(tool.collection);
              }}
            />
          </section>
        ))}
        {!!socials.length && (
          <section aria-label="Social links">
            <h3>Social links</h3>
            <div className="launchpad-grid">
              {socials.map(([label, url]) => (
                <a key={label} href={url} target="_blank" rel="noreferrer">
                  <AppIcon name={label} />
                  <span>
                    {socialLabels[label]}
                    <ArrowUpRight size={12} />
                  </span>
                </a>
              ))}
            </div>
          </section>
        )}
        {!appResults.length && !toolResults.length && !socials.length && (
          <p className="no-results" role="status">
            No apps found. Try “Notes”, “React” or “LinkedIn”.
          </p>
        )}
      </div>
      <footer>
        Open a tool to explore its projects · Pin favourites · Esc to close
      </footer>
    </AnimatedDialog>
  );
}
