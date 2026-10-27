"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import {
  ChevronRight,
  FolderOpen,
  Home,
  BriefcaseBusiness,
} from "lucide-react";
import { AppIcon } from "./app-icon";
import {
  projects,
  projectMatchesCollection,
  type Collection,
} from "./workspace-data";
import { serviceCatalog, getService } from "./service-catalog";
import { toolGroups, workspaceTools } from "./workspace-tools";

const storageKey = "emranlabs-sidebar-v1";

export function CollectionSidebar({
  collection,
  onSelect,
}: {
  collection: Collection;
  onSelect: (collection: Collection) => void;
}) {
  const [collapsed, setCollapsed] = useState<string[]>([]);
  const [previousCollection, setPreviousCollection] = useState(collection);
  const selected = useRef<HTMLButtonElement | null>(null);
  // Adjust before paint when navigation selects a tool in a collapsed group.
  if (previousCollection !== collection) {
    setPreviousCollection(collection);
    const group = toolGroups.find((item) =>
      item.tools.some((tool) => tool.collection === collection),
    );
    if (group && collapsed.includes(group.id))
      setCollapsed(collapsed.filter((id) => id !== group.id));
  }
  useEffect(() => {
    try {
      const saved: unknown = JSON.parse(
        localStorage.getItem(storageKey) || "[]",
      );
      if (Array.isArray(saved))
        // Browser-only storage is read once after the SSR sidebar hydrates.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCollapsed(
          saved.filter((id) =>
            toolGroups.some(
              (group) =>
                group.id === id &&
                !group.tools.some((tool) => tool.collection === collection),
            ),
          ),
        );
    } catch {}
    // Read saved groups only when this sidebar mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (matchMedia("(min-width: 761px)").matches)
      selected.current?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [collection, collapsed]);
  function toggle(id: string) {
    const next = collapsed.includes(id)
      ? collapsed.filter((item) => item !== id)
      : [...collapsed, id];
    setCollapsed(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {}
  }
  function item(value: Collection) {
    const tool = workspaceTools.find((tool) => tool.collection === value);
    const count = projects.filter((project) =>
      projectMatchesCollection(project, value),
    ).length;
    return (
      <button
        key={value}
        ref={collection === value ? selected : undefined}
        className={`collection-item ${collection === value ? "selected" : ""}`}
        aria-label={value}
        aria-current={collection === value ? "page" : undefined}
        onClick={() => onSelect(value)}
      >
        {value === "Overview" ? (
          <Home size={18} />
        ) : value === "All Projects" ? (
          <FolderOpen size={18} />
        ) : getService(value) ? (
          <BriefcaseBusiness size={18} />
        ) : (
          <AppIcon name={tool?.id ?? "finder"} />
        )}
        <span>{value}</span>
        <span className="collection-count" aria-label={`${count} projects`}>
          {count}
        </span>
      </button>
    );
  }
  return (
    <>
      <span className="sidebar-label">Favourites</span>
      {item("Overview")}
      {item("All Projects")}
      <span className="sidebar-label">For your business</span>
      {serviceCatalog.map((service) => item(service.collection))}
      {toolGroups.map((group) => (
        <Fragment key={group.id}>
          <button
            className="sidebar-group-toggle"
            aria-expanded={!collapsed.includes(group.id)}
            aria-controls={`collections-${group.id}`}
            onClick={() => toggle(group.id)}
          >
            <span>{group.label}</span>
            <ChevronRight size={12} />
          </button>
          <div
            id={`collections-${group.id}`}
            className="sidebar-group-items"
            hidden={collapsed.includes(group.id)}
          >
            {group.tools
              .filter((tool) => tool.collection !== "All Projects")
              .map((tool) => item(tool.collection))}
          </div>
        </Fragment>
      ))}
    </>
  );
}
