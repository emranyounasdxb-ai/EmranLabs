"use client";

import { useEffect, useEffectEvent, useRef, useState, useReducer } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import {
  ArrowLeft,
  ArrowRight,
  BatteryFull,
  Check,
  ChevronRight,
  CircleHelp,
  FolderOpen,
  Grid2X2,
  List,
  MapPin,
  Search,
  SlidersHorizontal,
  Wifi,
  X,
} from "lucide-react";
import { AppIcon, Folder } from "./app-icon";
import { ApplicationDock } from "./application-dock";
import { CollectionSidebar } from "./collection-sidebar";
import { ToolCollectionIntro } from "./tool-collection-intro";
import type { EnquiryContext } from "./contact-panel";
import { getService, serviceCatalog } from "./service-catalog";
import { trackEvent } from "@/lib/analytics/client";
import { workspaceTools, type ToolId } from "./workspace-tools";
import { useDesktopClock } from "./use-desktop-clock";
import { AnimatedDialog } from "./animated-dialog";
import { Launchpad } from "./launchpad";
import { useAppearance } from "./use-appearance";
import {
  defaultDock,
  dockStorageKey,
  parseDock,
  type DockPreferences,
} from "./dock-preferences";
import {
  DesktopMenuStrip,
  MenuPopover,
  type MenuGroup,
  type MenuItem,
} from "./desktop-menu";
import { ManagedWindow, type WindowApi } from "./managed-window";
import { windowReducer, initialDesktopState } from "./window-manager";
import { desktopUrl, parseDesktopLocation } from "./desktop-location";
import { QuickLook, ProjectFolder } from "./quick-look";
import { DesktopWidgets, CalendarCard } from "./desktop-widgets";
import {
  CalendarPopover,
  ControlCenter,
  MissionControl,
} from "./desktop-overlays";
import { WindowZoomButton } from "./window-zoom-button";
import {
  accentColors,
  appNames,
  parseWorkspace,
  workspaceStorageKey,
  type Accent,
} from "./desktop-preferences";
import {
  defaultWidgets,
  parseWidgets,
  widgetStorageKey,
  weatherCities,
  type CityId,
  type WidgetPreferences,
} from "./widget-data";
import { resizeEdges } from "./window-geometry";
import {
  projects,
  projectMatchesCollection,
  socialLinks,
  type AppName,
  type Collection,
  type Project,
} from "./workspace-data";

function PanelLoading() {
  return (
    <p className="panel-loading" role="status">
      Opening…
    </p>
  );
}

const ContactPanel = dynamic(
  () => import("./contact-panel").then((module) => module.ContactPanel),
  { loading: PanelLoading },
);
const ServicesContent = dynamic(
  () => import("./services-content").then((module) => module.ServicesContent),
  { loading: PanelLoading },
);
const ProjectDetails = dynamic(
  () => import("./project-details").then((module) => module.ProjectDetails),
  { loading: PanelLoading },
);
const AboutProfile = dynamic(
  () => import("./about-profile").then((module) => module.AboutProfile),
  { loading: PanelLoading },
);
const WorkspaceGuide = dynamic(
  () => import("./about-profile").then((module) => module.WorkspaceGuide),
  { loading: PanelLoading },
);

const titles: Record<AppName, string> = {
  projects: "My workspace",
  about: "About Emran",
  contact: "Let's connect",
  notes: "Notes",
  calendar: "Calendar",
  settings: "Appearance",
  photos: "Coastline",
  trash: "Trash",
  help: "Workspace guide",
  services: "Work with me",
};
const menuNames: Record<AppName, string> = {
  projects: "Finder",
  about: "About",
  contact: "Mail",
  notes: "Notes",
  calendar: "Calendar",
  settings: "Appearance",
  photos: "Photos",
  trash: "Trash",
  help: "Help",
  services: "Services",
};
const initialNote =
  "A little space for your next big idea.\n\nWrite something here…";

function Clock({
  compact = false,
  city = "dubai",
}: {
  compact?: boolean;
  city?: CityId;
}) {
  const now = useDesktopClock();
  const time =
    now?.toLocaleTimeString("en-US", {
      timeZone: weatherCities[city].zone,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }) ?? "—:—";
  const date =
    now?.toLocaleDateString("en-GB", {
      timeZone: weatherCities[city].zone,
      weekday: "short",
      day: "numeric",
      month: "short",
    }) ?? weatherCities[city].name;
  return compact ? (
    <span className="menu-clock">
      {date}
      <span>{time}</span>
    </span>
  ) : (
    <>
      <time>{time.replace(/\s[AP]M/, "")}</time>
      <span>{weatherCities[city].name}</span>
    </>
  );
}

export function MacDesktop() {
  const [desktop, dispatchWindow] = useReducer(
    windowReducer,
    initialDesktopState,
  );
  const app = desktop.active;
  const activeApp = app;
  const visible = desktop.windows.some((w) => !w.minimized);
  const windowApis = useRef(new Map<AppName, WindowApi>());
  const [maximizedApps, setMaximizedApps] = useState<
    Partial<Record<AppName, boolean>>
  >({});
  const maximized = !!maximizedApps[app];
  const geometry = {
    snap: (side: "left" | "right") => windowApis.current.get(app)?.snap(side),
    resetWindow: () => windowApis.current.get(app)?.resetWindow(),
    toggleMaximize: () => windowApis.current.get(app)?.toggleMaximize(),
  };
  const [quickLook, setQuickLook] = useState<Project | null>(null);
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const [desktopSelection, setDesktopSelection] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [accent, setAccent] = useState<Accent>("blue");
  const [widgets, setWidgets] = useState<WidgetPreferences>(defaultWidgets);
  const [editingWidgets, setEditingWidgets] = useState(false);
  const [widgetGallery, setWidgetGallery] = useState(false);
  const [controlCenter, setControlCenter] = useState(false);
  const [calendarPopover, setCalendarPopover] = useState(false);
  const [missionControl, setMissionControl] = useState(false);
  const [launchpad, setLaunchpad] = useState(false);
  const [dockPreferences, setDockPreferences] =
    useState<DockPreferences>(defaultDock);
  const [zoomMenu, setZoomMenu] = useState<{
    id: AppName;
    x: number;
    y: number;
  } | null>(null);
  const [opaque, setOpaque] = useState(false);
  const [collection, setCollection] = useState<Collection>("Overview");
  const [selected, setSelected] = useState<Project | null>(null);

  const [list, setList] = useState(false);
  const [query, setQuery] = useState("");
  const [spotlight, setSpotlight] = useState("");
  const [spotlightSelection, setSpotlightSelection] = useState<string | null>(
    null,
  );
  const { dark, appearance, changeAppearance } = useAppearance();
  const [calm, setCalm] = useState(false);
  const [systemCalm, setSystemCalm] = useState(false);
  const [enquiryContext, setEnquiryContext] = useState<EnquiryContext>({});
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setSystemCalm(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);
  const [wallpaper, setWallpaper] = useState<"horizon" | "catalina">("horizon");
  const [sort, setSort] = useState<"featured" | "name" | "kind">("featured");
  const [showSidebar, setShowSidebar] = useState(true);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    project?: Project;
    dockApp?: AppName;
  } | null>(null);

  const [note, setNote] = useState(initialNote);
  const [noteStatus, setNoteStatus] = useState("Saved on this device");
  const [toast, setToast] = useState("");
  const calendarNow = useDesktopClock();
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const spotlightResults = [
    ...(spotlight.trim()
      ? serviceCatalog.map((service) => ({
          id: `service-${service.id}`,
          label: service.collection,
          subtitle: "For your business",
          search: `${service.collection} ${service.summary}`,
          icon: "folder",
          action: () => openCollection(service.collection),
        }))
      : []),
    ...(spotlight.trim()
      ? workspaceTools.map((tool) => ({
          id: `tool-${tool.id}`,
          label: tool.label,
          subtitle: "Project collection",
          search: `${tool.label} ${tool.search}`,
          icon: tool.id,
          action: () => openCollection(tool.collection),
        }))
      : []),
    ...projects.map((project) => ({
      id: `project-${project.id}`,
      label: project.name,
      subtitle: project.kind,
      search: `${project.name} ${project.technologies.join(" ")}`,
      icon: "folder",
      action: () => openProject(project),
    })),
    ...(["about", "contact", "notes", "settings", "calendar"] as AppName[]).map(
      (id) => ({
        id: `app-${id}`,
        label: titles[id],
        subtitle: "",
        search: titles[id],
        icon: id === "contact" ? "mail" : id === "about" ? "finder" : id,
        // Stored menu callback; openApp reads window refs only on activation.
        // eslint-disable-next-line react-hooks/refs
        action: () => openApp(id),
      }),
    ),
  ].filter((result) =>
    result.search.toLowerCase().includes(spotlight.trim().toLowerCase()),
  );
  const spotlightActive =
    spotlightResults.find((result) => result.id === spotlightSelection) ??
    spotlightResults[0];
  const spotlightActiveId = spotlightActive
    ? `spotlight-option-${spotlightActive.id}`
    : undefined;
  useEffect(() => {
    if (searchOpen && spotlightActiveId)
      document
        .getElementById(spotlightActiveId)
        ?.scrollIntoView({ block: "nearest" });
  }, [searchOpen, spotlightActiveId]);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(
        workspaceStorageKey,
        JSON.stringify({
          desktop,
          collection,
          project: selected?.id ?? null,
          list,
          sort,
          showSidebar,
        }),
      );
    } catch {}
  }, [ready, desktop, collection, selected, list, sort, showSidebar]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  function writeLocation(
    next: AppName,
    nextCollection = collection,
    project: string | null = selected?.id ?? null,
    replace = false,
  ) {
    const url = desktopUrl(next, nextCollection, project);
    if (location.pathname + location.search !== url)
      window.history[replace ? "replaceState" : "pushState"](null, "", url);
  }
  const applyLocation = useEffectEvent(() => {
    const next = parseDesktopLocation(location.search);
    if (next.app === "projects") {
      setCollection(next.collection);
      setSelected(projects.find((p) => p.id === next.project) ?? null);
    }
    setQuery("");
    setQuickLook(null);
    windowApis.current.get(next.app)?.restore();
    dispatchWindow({ type: "open", id: next.app });
  });
  function rememberEnquiryContext(context: EnquiryContext) {
    setEnquiryContext(context);
    try {
      sessionStorage.setItem(
        "emranlabs-enquiry-context",
        JSON.stringify(context),
      );
    } catch {}
  }
  function openApp(next: AppName, updateUrl = true) {
    if (next === "contact")
      rememberEnquiryContext({
        project: selected?.name,
        service: getService(collection)?.id,
        tool:
          collection !== "Overview" &&
          collection !== "All Projects" &&
          !getService(collection)
            ? collection
            : undefined,
      });
    trackEvent("application_opened", { app: next });
    windowApis.current.get(next)?.restore();
    dispatchWindow({ type: "open", id: next });
    setContextMenu(null);
    setZoomMenu(null);
    setSearchOpen(false);
    setLaunchpad(false);
    if (updateUrl) writeLocation(next);
  }
  function focusWindow(id: AppName) {
    if (activeApp === id) return;
    dispatchWindow({ type: "focus", id });
    writeLocation(id);
  }
  function finishDismiss(id: AppName, minimize: boolean) {
    const action = {
      type: minimize ? ("minimize" as const) : ("close" as const),
      id,
    };
    const next = windowReducer(desktop, action);
    dispatchWindow(action);
    writeLocation(next.active);
  }
  function dismissWindow(minimize: boolean, id = app) {
    windowApis.current.get(id)?.dismiss(minimize);
  }
  function openCollection(next: Collection) {
    const service = getService(next);
    if (service)
      trackEvent("service_collection_opened", { service: service.id });
    openApp("projects", false);
    setCollection(next);
    setSelected(null);
    setQuery("");
    setHighlighted(null);
    writeLocation("projects", next, null);
  }
  function openProject(project: Project) {
    openApp("projects", false);
    setSelected(project);
    setQuickLook(null);
    writeLocation("projects", collection, project.id);
  }
  function openSearch() {
    setLaunchpad(false);
    setContextMenu(null);
    setSpotlight("");
    setSpotlightSelection(null);
    setSearchOpen(true);
  }
  function changeWidgets(next: WidgetPreferences) {
    setWidgets(next);
    try {
      localStorage.setItem(widgetStorageKey, JSON.stringify(next));
    } catch {}
  }
  function changeAccent(next: Accent) {
    setAccent(next);
    try {
      localStorage.setItem("emranlabs-accent", next);
    } catch {}
  }
  function changeDark(value: boolean) {
    changeAppearance(value ? "dark" : "light");
  }
  function toggleDockPin(id: ToolId) {
    changeDock({
      ...dockPreferences,
      pinned: dockPreferences.pinned.includes(id)
        ? dockPreferences.pinned.filter((value) => value !== id)
        : [...dockPreferences.pinned, id],
    });
  }
  function changeDock(next: DockPreferences) {
    setDockPreferences(next);
    try {
      localStorage.setItem(dockStorageKey, JSON.stringify(next));
    } catch {}
  }
  function changeOpaque(value: boolean) {
    setOpaque(value);
    try {
      localStorage.setItem("emranlabs-opaque", String(value));
    } catch {}
  }
  function changeCalm(value: boolean) {
    setCalm(value);
    try {
      localStorage.setItem("emranlabs-calm", String(value));
    } catch {}
  }
  function resetDesktopLayout() {
    appNames.forEach((id) => {
      try {
        localStorage.removeItem(`emranlabs-frame-v2-${id}`);
      } catch {}
    });
    windowApis.current.forEach((api) => api.resetWindow());
    changeWidgets({ ...widgets, positions: {} });
    setEditingWidgets(false);
    if (!desktop.windows.some((w) => !w.minimized)) openApp("projects");
    setToast("Desktop layout reset. Your notes and open windows are kept.");
  }
  function activateDesktopFolder(
    id: string,
    action: () => void,
    event: React.MouseEvent,
  ) {
    if (
      event.detail === 0 ||
      !matchMedia("(hover: hover) and (pointer: fine)").matches ||
      innerWidth <= 760
    )
      action();
    else setDesktopSelection(id);
  }
  function changeWallpaper(next: "horizon" | "catalina") {
    setWallpaper(next);
    try {
      localStorage.setItem("emranlabs-wallpaper", next);
    } catch {}
  }
  function toggleMotion() {
    setCalm(!calm);
    try {
      localStorage.setItem("emranlabs-calm", String(!calm));
    } catch {}
  }
  function restoreWindow() {
    openApp(app, false);
  }
  async function copyLink(project?: Project) {
    try {
      await navigator.clipboard.writeText(
        project ? `${location.origin}/projects/${project.id}` : location.href,
      );
      setToast("Link copied to clipboard.");
    } catch {
      setToast(
        "Copy isn’t available in this browser. You can use the address bar instead.",
      );
    }
  }
  const handleShortcut = useEffectEvent((event: KeyboardEvent) => {
    if (document.querySelector("dialog[open]")) return;
    if (event.altKey && event.key === "9") {
      event.preventDefault();
      setMissionControl(true);
      return;
    }
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      openSearch();
      return;
    }
    if (event.key === "Escape") {
      if (searchOpen || quickLook) return;
      setContextMenu(null);
      if (selected && app === "projects") openCollection(collection);
      setQuery("");
      return;
    }
    if (
      (event.target as Element).closest(
        "input,textarea,select,[contenteditable=true],[role=menu]",
      )
    )
      return;
    if (
      event.altKey &&
      event.shiftKey &&
      ["ArrowLeft", "ArrowRight"].includes(event.key)
    ) {
      event.preventDefault();
      restoreWindow();
      geometry.snap(event.key === "ArrowLeft" ? "left" : "right");
      return;
    }
    if (event.key === "?") {
      event.preventDefault();
      openApp("help");
      return;
    }
    if (!event.altKey || event.ctrlKey || event.metaKey) return;
    const actions: Record<string, () => void> = {
      "1": () => openCollection("Overview"),
      "2": () => openCollection("All Projects"),
      "3": () => openApp("about"),
      "4": () => openApp("notes"),
      m: () => void dismissWindow(true),
      w: () => void dismissWindow(false),
      "0": () => {
        restoreWindow();
        geometry.resetWindow();
      },
      Enter: () => {
        restoreWindow();
        geometry.toggleMaximize();
      },
    };
    const action =
      actions[event.key.length === 1 ? event.key.toLowerCase() : event.key];
    if (action) {
      event.preventDefault();
      action();
    }
  });
  useEffect(() => {
    // Read device-local preferences after the server-rendered frame hydrates.
    const hydrationFrame = requestAnimationFrame(() => {
      try {
        const saved = parseWorkspace(localStorage.getItem(workspaceStorageKey));
        if (saved) {
          dispatchWindow({ type: "hydrate", state: saved.desktop });
          setCollection(saved.collection);
          setSelected(projects.find((p) => p.id === saved.project) ?? null);
          setList(saved.list);
          setSort(saved.sort);
          setShowSidebar(saved.showSidebar);
        }
        const params = new URLSearchParams(location.search);
        const linked = parseDesktopLocation(location.search);
        const matchesSavedView =
          saved &&
          desktopUrl(linked.app, linked.collection, linked.project) ===
            desktopUrl(saved.desktop.active, saved.collection, saved.project);
        if (
          !saved ||
          (!matchesSavedView &&
            ["app", "collection", "project"].some((key) => params.has(key)))
        )
          applyLocation();
        else
          window.history.replaceState(
            null,
            "",
            desktopUrl(saved.desktop.active, saved.collection, saved.project),
          );
        const savedAccent = localStorage.getItem("emranlabs-accent");
        if (savedAccent && Object.hasOwn(accentColors, savedAccent))
          setAccent(savedAccent as Accent);
        setWidgets(parseWidgets(localStorage.getItem(widgetStorageKey)));
        setNote(localStorage.getItem("emranlabs-notes") ?? initialNote);
        setDockPreferences(parseDock(localStorage.getItem(dockStorageKey)));
        try {
          const savedEnquiry = JSON.parse(
            sessionStorage.getItem("emranlabs-enquiry-context") || "{}",
          );
          setEnquiryContext({
            service: getService(savedEnquiry?.service)?.id,
            project: projects.find(
              (project) => project.name === savedEnquiry?.project,
            )?.name,
            tool: workspaceTools.find(
              (tool) => tool.collection === savedEnquiry?.tool,
            )?.collection,
          });
        } catch {}
        setOpaque(localStorage.getItem("emranlabs-opaque") === "true");
        setCalm(localStorage.getItem("emranlabs-calm") === "true");
        setWallpaper(
          localStorage.getItem("emranlabs-wallpaper") === "catalina"
            ? "catalina"
            : "horizon",
        );
      } catch {
        setNoteStatus("Notes are available for this visit");
        applyLocation();
      }
      setReady(true);
    });
    window.addEventListener("keydown", handleShortcut);
    window.addEventListener("popstate", applyLocation);
    return () => {
      cancelAnimationFrame(hydrationFrame);
      window.removeEventListener("keydown", handleShortcut);
      window.removeEventListener("popstate", applyLocation);
    };
  }, []);

  const shownProjects = projects
    .filter(
      (project) =>
        projectMatchesCollection(project, collection) &&
        `${project.name} ${project.kind} ${project.technologies.join(" ")}`
          .toLowerCase()
          .includes(query.toLowerCase()),
    )
    .sort((a, b) =>
      sort === "name"
        ? a.name.localeCompare(b.name)
        : sort === "kind"
          ? a.kind.localeCompare(b.kind)
          : 0,
    );
  const separator: MenuItem = { label: "", separator: true };
  const menuGroups: MenuGroup[] = [
    {
      label: "EmranLabs",
      items: [
        { label: "About Emran", action: () => openApp("about") },
        {
          label: "Workspace guide",
          action: () => openApp("help"),
          shortcut: "?",
        },
        separator,
        { label: "Appearance…", action: () => openApp("settings") },
        { label: "Change wallpaper…", action: () => openApp("photos") },
      ],
    },
    {
      label: menuNames[activeApp],
      items: [
        {
          label: "My workspace",
          action: () => openCollection("Overview"),
          shortcut: "Alt 1",
        },
        {
          label: "All Projects",
          action: () => openCollection("All Projects"),
          shortcut: "Alt 2",
        },
        {
          label: "About Emran",
          action: () => openApp("about"),
          shortcut: "Alt 3",
        },
        { label: "Notes", action: () => openApp("notes"), shortcut: "Alt 4" },
        { label: "Work with me", action: () => openApp("services") },
        separator,
        { label: "Appearance…", action: () => openApp("settings") },
        { label: "Keyboard shortcuts", action: () => openApp("help") },
      ],
    },
    {
      label: "File",
      items: [
        {
          label: "Open All Projects",
          action: () => openCollection("All Projects"),
        },
        { label: "Open Notes", action: () => openApp("notes") },
        { label: "Connect with Emran", action: () => openApp("contact") },
        separator,
        {
          label: "Close Window",
          action: () => void dismissWindow(false),
          disabled: !visible,
          shortcut: "Alt W",
        },
      ],
    },
    {
      label: "Edit",
      items: [
        {
          label: "Find a Project…",
          action: () => {
            openCollection("All Projects");
            requestAnimationFrame(() => searchRef.current?.focus());
          },
        },
        {
          label: "Search Workspace…",
          action: openSearch,
          shortcut: "⌘ / Ctrl K",
        },
        separator,
        {
          label: selected ? "Copy Project Link" : "Copy Portfolio Link",
          action: () => void copyLink(selected ?? undefined),
        },
      ],
    },
    {
      label: "View",
      items: [
        {
          label: "As Icons",
          checked: !list,
          action: () => {
            setList(false);
            openApp("projects");
          },
        },
        {
          label: "As List",
          checked: list,
          action: () => {
            setList(true);
            openApp("projects");
          },
        },
        separator,
        {
          label: "Featured Order",
          checked: sort === "featured",
          action: () => setSort("featured"),
        },
        {
          label: "Sort by Name",
          checked: sort === "name",
          action: () => setSort("name"),
        },
        {
          label: "Sort by Type",
          checked: sort === "kind",
          action: () => setSort("kind"),
        },
        separator,
        {
          label: "Show Sidebar",
          checked: showSidebar,
          action: () => setShowSidebar(!showSidebar),
        },
        { label: "Reduce Motion", checked: calm, action: toggleMotion },
      ],
    },
    {
      label: "Go",
      items: [
        {
          label: "Overview",
          action: () => openCollection("Overview"),
          shortcut: "Alt 1",
        },
        {
          label: "All Projects",
          action: () => openCollection("All Projects"),
          shortcut: "Alt 2",
        },
        {
          label: "About Emran",
          action: () => openApp("about"),
          shortcut: "Alt 3",
        },
        { label: "Notes", action: () => openApp("notes"), shortcut: "Alt 4" },
        { label: "Calendar", action: () => openApp("calendar") },
        separator,
        { label: "Search…", action: openSearch, shortcut: "⌘ / Ctrl K" },
      ],
    },
    {
      label: "Window",
      items: [
        ...desktop.windows.map((w) => ({
          label: `${titles[w.id]}${w.minimized ? " (minimized)" : ""}`,
          checked: w.id === activeApp && !w.minimized,
          action: () => openApp(w.id),
        })),
        separator,
        {
          label: "Minimize",
          action: () => void dismissWindow(true),
          disabled: !visible,
          shortcut: "Alt M",
        },
        {
          label: maximized ? "Restore Size" : "Maximize",
          action: () => {
            restoreWindow();
            geometry.toggleMaximize();
          },
          shortcut: "Alt ↵",
        },
        {
          label: "Tile Left",
          action: () => {
            restoreWindow();
            geometry.snap("left");
          },
        },
        {
          label: "Tile Right",
          action: () => {
            restoreWindow();
            geometry.snap("right");
          },
        },
        separator,
        {
          label: "Default Layout",
          action: () => {
            restoreWindow();
            geometry.resetWindow();
          },
          shortcut: "Alt 0",
        },
        {
          label: visible ? "Show Desktop" : "Show Window",
          action: () =>
            visible
              ? dispatchWindow({ type: "show-desktop" })
              : restoreWindow(),
        },
      ],
    },
    {
      label: "Help",
      items: [
        {
          label: "Workspace Guide",
          action: () => openApp("help"),
          shortcut: "?",
        },
        { label: "About Emran", action: () => openApp("about") },
        { label: "Get in Touch", action: () => openApp("contact") },
      ],
    },
  ];
  const chosenProject = selected ?? projects.find((p) => p.id === highlighted);
  menuGroups[1].items = [
    {
      label: `About ${menuNames[activeApp]}`,
      action: () => openApp(activeApp === "projects" ? "help" : activeApp),
    },
    {
      label: "Show all windows",
      action: () => setMissionControl(true),
      shortcut: "Alt 9",
    },
    separator,
    {
      label: `Hide ${menuNames[activeApp]}`,
      action: () => dismissWindow(true),
      disabled: !visible,
    },
    {
      label: `Close ${menuNames[activeApp]}`,
      action: () => dismissWindow(false),
      disabled: !visible,
    },
  ];
  if (activeApp === "projects") {
    menuGroups[2].items = [
      {
        label: "Open Selected Project",
        disabled: !chosenProject,
        action: () => chosenProject && openProject(chosenProject),
        shortcut: "Enter",
      },
      {
        label: "Quick Look",
        disabled: !chosenProject,
        action: () => chosenProject && setQuickLook(chosenProject),
        shortcut: "Space",
      },
      separator,
      ...menuGroups[2].items,
    ];
  } else {
    menuGroups[2].items = [
      {
        label: `Show ${menuNames[activeApp]}`,
        action: () => openApp(activeApp),
      },
      ...(activeApp === "notes"
        ? [
            {
              label: "Copy Note",
              action: async () => {
                try {
                  await navigator.clipboard.writeText(note);
                  setToast("Note copied.");
                } catch {
                  setToast("Select the note text to copy it.");
                }
              },
            },
          ]
        : []),
      ...(activeApp === "contact"
        ? [
            {
              label: "Copy Email Address",
              action: async () => {
                try {
                  await navigator.clipboard.writeText("helo@emranlabs.com");
                  setToast("Email copied.");
                } catch {
                  setToast("Email: helo@emranlabs.com");
                }
              },
            },
          ]
        : []),
      separator,
      {
        label: "Close Window",
        action: () => dismissWindow(false),
        disabled: !visible,
        shortcut: "Alt W",
      },
    ];
    menuGroups[3].items =
      activeApp === "notes"
        ? [
            {
              label: "Select All Note Text",
              action: () =>
                document
                  .querySelector<HTMLTextAreaElement>(
                    '[aria-label="Personal notes"]',
                  )
                  ?.select(),
            },
            {
              label: "Search Workspace…",
              action: openSearch,
              shortcut: "⌘ / Ctrl K",
            },
          ]
        : [
            {
              label: "Search Workspace…",
              action: openSearch,
              shortcut: "⌘ / Ctrl K",
            },
            { label: "Copy Page Link", action: () => void copyLink() },
          ];
    menuGroups[4].items = [
      { label: "Appearance…", action: () => openApp("settings") },
      { label: "Reduce Motion", checked: calm, action: toggleMotion },
    ];
  }
  menuGroups[4].items = [
    ...menuGroups[4].items,
    separator,
    { label: "Control Center", action: () => setControlCenter(true) },
    { label: "Widget Gallery…", action: () => setWidgetGallery(true) },
    {
      label: "Arrange Widgets",
      checked: editingWidgets,
      action: () => setEditingWidgets(!editingWidgets),
    },
  ];
  menuGroups[6].items = [
    ...menuGroups[6].items,
    separator,
    {
      label: "Window Overview",
      action: () => setMissionControl(true),
      shortcut: "Alt 9",
    },
    { label: "Reset Desktop Layout", action: resetDesktopLayout },
  ];
  let contextItems: MenuItem[] = contextMenu?.dockApp
    ? [
        {
          label: `Open ${menuNames[contextMenu.dockApp]}`,
          action: () => openApp(contextMenu.dockApp!),
        },
        {
          label: "Minimize Window",
          disabled: !desktop.windows.some(
            (w) => w.id === contextMenu.dockApp && !w.minimized,
          ),
          action: () => dismissWindow(true, contextMenu.dockApp!),
        },
        {
          label: "Close Window",
          disabled: !desktop.windows.some((w) => w.id === contextMenu.dockApp),
          action: () => dismissWindow(false, contextMenu.dockApp!),
        },
        separator,
        { label: "Show All Windows", action: () => setMissionControl(true) },
      ]
    : contextMenu?.project
      ? [
          {
            label: "Quick Look",
            shortcut: "Space",
            action: () => setQuickLook(contextMenu.project!),
          },
          {
            label: `Open ${contextMenu.project.name}`,
            action: () => openProject(contextMenu.project!),
          },
          {
            label: "Open in New Tab",
            action: () =>
              window.open(
                `/projects/${contextMenu.project!.id}`,
                "_blank",
                "noopener,noreferrer",
              ),
          },
          {
            label: "Copy Project Link",
            action: () => void copyLink(contextMenu.project),
          },
          separator,
          {
            label: "View All Projects",
            action: () => openCollection("All Projects"),
          },
        ]
      : [
          {
            label: "Open All Projects",
            action: () => openCollection("All Projects"),
          },
          { label: "About Emran", action: () => openApp("about") },
          separator,
          {
            label: "Show as Icons",
            checked: !list,
            action: () => {
              setList(false);
              openApp("projects");
            },
          },
          {
            label: "Show as List",
            checked: list,
            action: () => {
              setList(true);
              openApp("projects");
            },
          },
          separator,
          { label: "Change Wallpaper…", action: () => openApp("photos") },
          {
            label: "Default Window Layout",
            action: () => {
              restoreWindow();
              geometry.resetWindow();
            },
          },
        ];
  if (!contextMenu?.project && !contextMenu?.dockApp)
    contextItems = [
      ...contextItems,
      separator,
      { label: "Widget Gallery…", action: () => setWidgetGallery(true) },
      {
        label: editingWidgets ? "Finish Arranging Widgets" : "Arrange Widgets",
        action: () => setEditingWidgets(!editingWidgets),
      },
      { label: "Reset Desktop Layout", action: resetDesktopLayout },
    ];
  const wallpaperSource =
    wallpaper === "horizon"
      ? "/images/emran-horizon.webp"
      : dark
        ? "/images/catalina-night.webp"
        : "/images/catalina-light.webp";
  const socialAnchor = (
    icon: keyof typeof socialLinks,
    label: string,
    dock = false,
  ) => (
    <a
      className={dock ? "dock-item" : "social-icon"}
      aria-label={label}
      href={socialLinks[icon]}
      target="_blank"
      rel="noreferrer"
      key={icon}
    >
      <AppIcon name={icon} />
      {dock && <span className="dock-tooltip">{label} ↗</span>}
    </a>
  );

  return (
    <div
      className={`mac-desktop ${dark ? "dark" : ""} ${calm ? "calm" : ""} ${opaque ? "opaque" : ""} wallpaper-${wallpaper}`}
      data-accent={accent}
      onClickCapture={(event) => {
        // WebKit does not focus pointer-clicked buttons automatically. Explicit
        // modal triggers give native dialog.close() a reliable return target.
        (event.target as Element)
          .closest<HTMLElement>("[data-dialog-trigger]")
          ?.focus({ preventScroll: true });
      }}
      style={{ "--accent": accentColors[accent] } as React.CSSProperties}
      onContextMenu={(event) => {
        if (
          (event.target as Element).closest(
            "input,textarea,select,a:not(.project-folder),.menu-bar,.desktop-popover,.desktop-widget,.system-dialog",
          )
        )
          return;
        event.preventDefault();
        const dockApp = (event.target as Element).closest<HTMLElement>(
          "[data-dock-app]",
        )?.dataset.dockApp as AppName | undefined;
        const id = (event.target as Element).closest<HTMLElement>(
          "[data-project]",
        )?.dataset.project;
        setContextMenu({
          x: event.clientX,
          y: event.clientY,
          project: projects.find((project) => project.id === id),
          dockApp,
        });
        if (id) setHighlighted(id);
      }}
    >
      <Image
        src={wallpaperSource}
        alt=""
        fill
        sizes="100vw"
        preload
        quality={85}
        className="wallpaper"
      />
      <div className="wallpaper-shade" />
      <a href="#workspace-content" className="skip-link">
        Skip to portfolio
      </a>
      <header className="menu-bar">
        <DesktopMenuStrip
          groups={menuGroups}
          onOpen={() => setContextMenu(null)}
        />
        <div className="menu-right">
          <span className="menu-location">Dubai, UAE</span>
          <Wifi size={15} aria-label="Web workspace" />
          <BatteryFull size={20} aria-hidden="true" />
          <button
            data-dialog-trigger
            aria-label="Search workspace"
            onClick={openSearch}
          >
            <Search size={15} />
          </button>
          <button
            data-dialog-trigger
            aria-label="Open Control Center"
            aria-expanded={controlCenter}
            onClick={() => setControlCenter(true)}
          >
            <SlidersHorizontal size={15} />
          </button>
          <button
            className="menu-date-button"
            data-dialog-trigger
            aria-label="Open date and calendar"
            aria-expanded={calendarPopover}
            onClick={() => setCalendarPopover(true)}
          >
            <Clock compact city={widgets.city} />
          </button>
        </div>
      </header>

      <DesktopWidgets
        preferences={widgets}
        onChange={changeWidgets}
        editing={editingWidgets}
        onEdit={setEditingWidgets}
        editorOpen={widgetGallery}
        onCloseEditor={() => setWidgetGallery(false)}
      />
      <aside className="connect-widget glass">
        <div className="widget-heading">
          Connect <span className="status-dot" />
        </div>
        <div className="social-row">
          {socialAnchor("linkedin", "LinkedIn")}
          {socialAnchor("facebook", "Facebook")}
          {socialAnchor("instagram", "Instagram")}
          {socialAnchor("youtube", "YouTube")}
          <button
            className="social-icon"
            aria-label="All contact channels"
            onClick={() => openApp("contact")}
          >
            <AppIcon name="mail" />
          </button>
        </div>
        <button className="widget-website" onClick={() => openApp("about")}>
          emranlabs.com <ArrowRight size={12} />
        </button>
      </aside>
      <div className="desktop-folders">
        <button
          className={
            desktopSelection === "projects" ? "desktop-folder-selected" : ""
          }
          onClick={(e) =>
            activateDesktopFolder(
              "projects",
              () => openCollection("All Projects"),
              e,
            )
          }
          onDoubleClick={() => openCollection("All Projects")}
        >
          <Folder badge="" small />
          <span>All Projects</span>
        </button>
        <button
          className={
            desktopSelection === "about" ? "desktop-folder-selected" : ""
          }
          onClick={(e) =>
            activateDesktopFolder("about", () => openApp("about"), e)
          }
          onDoubleClick={() => openApp("about")}
        >
          <Folder badge="" small />
          <span>About Emran</span>
        </button>
      </div>

      <main id="workspace-content" tabIndex={-1}>
        {desktop.windows.map((entry, order) => {
          const app = entry.id;
          const title =
            app === "projects"
              ? (selected?.name ??
                (collection === "Overview"
                  ? "My workspace"
                  : collection === "All Projects"
                    ? collection
                    : collection + " Projects"))
              : titles[app];
          return (
            <ManagedWindow
              key={app}
              id={app}
              title={title}
              active={activeApp === app}
              minimized={entry.minimized}
              order={order}
              calm={calm}
              showSidebar={showSidebar}
              ref={(api) => {
                if (api) windowApis.current.set(app, api);
                else windowApis.current.delete(app);
              }}
              onFocus={() => focusWindow(app)}
              onDismiss={(minimize) => finishDismiss(app, minimize)}
              onMaximize={(value) =>
                setMaximizedApps((prev) => ({ ...prev, [app]: value }))
              }
            >
              {(geometry) => (
                <>
                  <header
                    className="finder-toolbar"
                    onPointerDown={(event) => geometry.start(event)}
                    onPointerMove={geometry.move}
                    onPointerUp={geometry.end}
                    onPointerCancel={geometry.end}
                    onDoubleClick={(event) => {
                      if (
                        !(event.target as HTMLElement).closest("button,input")
                      ) {
                        geometry.toggleMaximize();
                      }
                    }}
                  >
                    <div className="traffic-lights">
                      <button
                        className="close"
                        aria-label="Close window"
                        onClick={() => geometry.dismiss(false)}
                      >
                        <X size={8} />
                      </button>
                      <button
                        className="minimize"
                        aria-label="Minimize window"
                        onClick={() => geometry.dismiss(true)}
                      >
                        <span>−</span>
                      </button>
                      <WindowZoomButton
                        maximized={geometry.maximized}
                        onToggle={geometry.toggleMaximize}
                        onOptions={(x, y) => {
                          setContextMenu(null);
                          setZoomMenu({ id: app, x, y });
                        }}
                      />
                    </div>
                    <div className="toolbar-main">
                      <button
                        className="icon-button"
                        aria-label="Back to overview"
                        onClick={() =>
                          selected
                            ? openCollection(collection)
                            : openCollection("Overview")
                        }
                      >
                        <ArrowLeft size={17} />
                      </button>
                      <span className="toolbar-title">{title}</span>
                      {app === "projects" && (
                        <>
                          <div className="view-switch">
                            <button
                              className={!list ? "active" : ""}
                              aria-label="Grid view"
                              aria-pressed={!list}
                              onClick={() => {
                                setList(false);
                                openApp("projects");
                              }}
                            >
                              <Grid2X2 size={16} />
                            </button>
                            <button
                              className={list ? "active" : ""}
                              aria-label="List view"
                              aria-pressed={list}
                              onClick={() => {
                                setList(true);
                                openApp("projects");
                              }}
                            >
                              <List size={17} />
                            </button>
                          </div>
                          <label className="finder-search">
                            <Search size={14} />
                            <input
                              ref={searchRef}
                              aria-label="Search projects"
                              placeholder="Search"
                              value={query}
                              onChange={(event) => {
                                setQuery(event.target.value);
                                openApp("projects", false);
                                setSelected(null);
                              }}
                            />
                            <kbd>⌘ K</kbd>
                          </label>
                        </>
                      )}
                    </div>
                  </header>
                  <div className="finder-body">
                    {app === "projects" && (
                      <nav
                        className="finder-sidebar"
                        aria-label="Project collections"
                      >
                        <CollectionSidebar
                          collection={collection}
                          onSelect={openCollection}
                        />
                        <div className="sidebar-bottom">
                          <span className="sidebar-label">
                            A little about me
                          </span>
                          <button
                            onClick={() => openApp("about")}
                            className={activeApp === "about" ? "selected" : ""}
                          >
                            <span className="mini-avatar">
                              <Image
                                src="/images/profile/emran.webp"
                                alt=""
                                width={32}
                                height={32}
                              />
                            </span>
                            <span>Emran Younas</span>
                          </button>
                          <div className="sidebar-location">
                            <MapPin size={11} /> Based in Dubai
                          </div>
                        </div>
                      </nav>
                    )}
                    <div
                      className="finder-content"
                      key={
                        app === "projects" ? (selected?.id ?? collection) : app
                      }
                    >
                      {app === "projects" && !selected && (
                        <>
                          {collection === "Overview" ? (
                            <div className="welcome">
                              <div className="eyebrow">
                                <span /> THE EMRAN LABS WORKSPACE
                              </div>
                              <h1>
                                Ideas, built into reality<span>.</span>
                              </h1>
                              <p>
                                I’m Emran Younas, an IT Manager and software
                                product builder. I connect reliable technology
                                with useful digital experiences.
                              </p>
                              <div className="welcome-actions">
                                <button
                                  className="primary-button"
                                  onClick={() => openApp("contact")}
                                >
                                  Work with me <ArrowRight size={14} />
                                </button>
                                <button
                                  className="text-link"
                                  onClick={() => openApp("about")}
                                >
                                  A little about me <ArrowRight size={13} />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="collection-heading">
                              <h1>
                                {collection === "All Projects"
                                  ? "Made with curiosity."
                                  : (getService(collection)?.title ??
                                    `Built with ${collection}.`)}
                              </h1>
                              <p>
                                {getService(collection)?.summary ??
                                  "Explore the ideas taking shape at Emran Labs."}
                              </p>
                              {getService(collection) && (
                                <a
                                  className="text-link service-detail-link"
                                  href={`/services/${getService(collection)!.id}`}
                                >
                                  Explore this service <ArrowRight size={14} />
                                </a>
                              )}
                            </div>
                          )}
                          {(collection === "Overview" ||
                            collection === "All Projects") && (
                            <nav
                              className="business-shortcuts"
                              aria-label="Browse by business need"
                            >
                              <span>What are you looking to build?</span>
                              <div>
                                {serviceCatalog.slice(0, 4).map((service) => (
                                  <button
                                    key={service.id}
                                    onClick={() =>
                                      openCollection(service.collection)
                                    }
                                  >
                                    {service.collection}
                                    <ArrowRight size={13} />
                                  </button>
                                ))}
                              </div>
                            </nav>
                          )}
                          <div className="section-caption">
                            <h2>
                              {collection === "Overview"
                                ? "Selected projects"
                                : "Projects"}
                            </h2>
                            <span>
                              {shownProjects.length}{" "}
                              {shownProjects.length === 1
                                ? "project"
                                : "projects"}
                            </span>
                          </div>
                          <div
                            key={list ? "project-list" : "project-grid"}
                            className={`projects-grid ${list ? "list-view" : ""}`}
                          >
                            {shownProjects.map((project) => (
                              <a
                                href={`/projects/${project.id}`}
                                className={`project-folder ${highlighted === project.id ? "project-selected" : ""}`}
                                key={project.id}
                                data-project={project.id}
                                aria-current={
                                  highlighted === project.id
                                    ? "true"
                                    : undefined
                                }
                                onFocus={() => setHighlighted(project.id)}
                                onDoubleClick={(event) => {
                                  if (
                                    event.metaKey ||
                                    event.ctrlKey ||
                                    event.shiftKey ||
                                    event.altKey
                                  )
                                    return;
                                  event.preventDefault();
                                  openProject(project);
                                }}
                                onKeyDown={(event) => {
                                  if (event.key === "Enter") {
                                    event.preventDefault();
                                    openProject(project);
                                    return;
                                  }
                                  if (
                                    [
                                      "ArrowLeft",
                                      "ArrowRight",
                                      "ArrowUp",
                                      "ArrowDown",
                                      "Home",
                                      "End",
                                    ].includes(event.key)
                                  ) {
                                    event.preventDefault();
                                    const grid =
                                      event.currentTarget.parentElement!;
                                    const columns = list
                                      ? 1
                                      : getComputedStyle(
                                          grid,
                                        ).gridTemplateColumns.split(" ").length;
                                    const index = shownProjects.findIndex(
                                      (p) => p.id === project.id,
                                    );
                                    const delta =
                                      event.key === "ArrowLeft"
                                        ? -1
                                        : event.key === "ArrowRight"
                                          ? 1
                                          : event.key === "ArrowUp"
                                            ? -columns
                                            : columns;
                                    const nextIndex =
                                      event.key === "Home"
                                        ? 0
                                        : event.key === "End"
                                          ? shownProjects.length - 1
                                          : Math.max(
                                              0,
                                              Math.min(
                                                shownProjects.length - 1,
                                                index + delta,
                                              ),
                                            );
                                    const next = shownProjects[nextIndex];
                                    if (next) {
                                      setHighlighted(next.id);
                                      grid
                                        .querySelector<HTMLAnchorElement>(
                                          `[data-project="${next.id}"]`,
                                        )
                                        ?.focus();
                                    }
                                    return;
                                  }
                                  if (event.key === " ") {
                                    event.preventDefault();
                                    setQuickLook(project);
                                  }
                                }}
                                onClick={(event) => {
                                  if (
                                    event.ctrlKey ||
                                    event.metaKey ||
                                    event.shiftKey ||
                                    event.altKey
                                  )
                                    return;
                                  event.preventDefault();
                                  if (
                                    event.detail === 0 ||
                                    innerWidth <= 760 ||
                                    !matchMedia(
                                      "(hover: hover) and (pointer: fine)",
                                    ).matches
                                  )
                                    openProject(project);
                                  else setHighlighted(project.id);
                                }}
                              >
                                <ProjectFolder project={project} />
                                <div>
                                  <h3>{project.name}</h3>
                                  <p>{project.kind}</p>
                                </div>
                                <ChevronRight
                                  className="project-chevron"
                                  size={16}
                                />
                              </a>
                            ))}
                          </div>
                          {!shownProjects.length &&
                            (query ? (
                              <div className="empty-state">
                                <FolderOpen size={38} />
                                <h3>No matching projects</h3>
                                <p>Try a project name or a technology.</p>
                                <button
                                  className="text-link"
                                  onClick={() => setQuery("")}
                                >
                                  Clear search <ArrowRight size={14} />
                                </button>
                              </div>
                            ) : getService(collection) ? (
                              <section className="tool-collection-intro">
                                <span className="eyebrow">
                                  LET’S START WITH YOUR REQUIREMENTS
                                </span>
                                <h3>Discuss your {collection} project.</h3>
                                <p>{getService(collection)!.description}</p>
                                <a
                                  className="primary-button"
                                  href={`/contact?service=${getService(collection)!.id}`}
                                >
                                  Share your brief <ArrowRight size={14} />
                                </a>
                              </section>
                            ) : (
                              <ToolCollectionIntro
                                collection={collection}
                                onContact={() => openApp("contact")}
                                onProject={openProject}
                              />
                            ))}
                          {shownProjects.length > 0 && (
                            <div className="finder-hint">
                              <span className="hint-symbol">↗</span>
                              <span>
                                Good things start with curiosity.
                                <br />
                                <small>
                                  <span className="desktop-pointer-hint">
                                    Double-click to open · Select and press
                                    Space for Quick Look.
                                  </span>
                                  <span className="touch-pointer-hint">
                                    Tap a project to explore its story.
                                  </span>
                                </small>
                              </span>
                              <button
                                className="icon-button"
                                aria-label="Learn about Emran"
                                onClick={() => openApp("about")}
                              >
                                <CircleHelp size={17} />
                              </button>
                            </div>
                          )}
                        </>
                      )}
                      {app === "projects" && selected && (
                        <ProjectDetails
                          project={selected}
                          onBack={() => openCollection(collection)}
                          onContact={() => openApp("contact")}
                        />
                      )}
                      {app === "about" && (
                        <AboutProfile
                          onExplore={() => openCollection("All Projects")}
                        />
                      )}
                      {app === "contact" && (
                        <ContactPanel context={enquiryContext} />
                      )}
                      {app === "services" && (
                        <ServicesContent onContact={() => openApp("contact")} />
                      )}
                      {app === "notes" && (
                        <section className="notes-content">
                          <span className="eyebrow">YOUR SCRATCHPAD</span>
                          <h1>A thought worth keeping.</h1>
                          <textarea
                            aria-label="Personal notes"
                            value={note}
                            onChange={(event) => {
                              setNote(event.target.value);
                              try {
                                localStorage.setItem(
                                  "emranlabs-notes",
                                  event.target.value,
                                );
                                setNoteStatus("Saved on this device");
                              } catch {
                                setNoteStatus("Available for this visit only");
                              }
                            }}
                          />
                          <small>
                            <Check size={12} /> {noteStatus}
                          </small>
                        </section>
                      )}
                      {app === "calendar" && (
                        <CalendarCard city={widgets.city} expanded />
                      )}
                      {app === "settings" && (
                        <section className="settings-content">
                          <span className="eyebrow">MAKE YOURSELF AT HOME</span>
                          <h1>Your workspace, your way.</h1>
                          <fieldset className="dock-settings">
                            <legend>Privacy</legend>
                            <p className="setting-hint">
                              Manage analytics cookies, limited cookieless
                              measurement and campaign tools. Your choice stays
                              saved in this browser.
                            </p>
                            <button
                              className="secondary-button"
                              onClick={(event) =>
                                window.dispatchEvent(
                                  new CustomEvent("emranlabs:privacy-open", {
                                    detail: event.currentTarget,
                                  }),
                                )
                              }
                            >
                              Privacy preferences
                            </button>
                            <a className="secondary-button" href="/privacy">
                              Privacy notice
                            </a>
                          </fieldset>
                          <div
                            className="appearance-options"
                            role="group"
                            aria-label="Appearance mode"
                          >
                            {(["light", "dark", "system"] as const).map(
                              (mode) => (
                                <button
                                  key={mode}
                                  aria-pressed={appearance === mode}
                                  className={
                                    appearance === mode ? "chosen" : ""
                                  }
                                  onClick={() => changeAppearance(mode)}
                                >
                                  <span
                                    className={`appearance-preview ${mode}-preview`}
                                  />
                                  {mode === "system"
                                    ? "System"
                                    : mode === "dark"
                                      ? "Dark"
                                      : "Light"}
                                  {appearance === mode && <Check size={14} />}
                                </button>
                              ),
                            )}
                          </div>
                          <p className="setting-hint">
                            System follows your device’s light or dark
                            appearance.
                          </p>
                          <fieldset className="dock-settings">
                            <legend>Dock</legend>
                            <label className="setting-row">
                              <span>
                                <strong>Automatically hide the Dock</strong>
                                <small>
                                  Move to the bottom edge or focus an app to
                                  reveal it.
                                </small>
                              </span>
                              <input
                                type="checkbox"
                                checked={dockPreferences.autoHide}
                                onChange={(e) =>
                                  changeDock({
                                    ...dockPreferences,
                                    autoHide: e.target.checked,
                                  })
                                }
                              />
                            </label>
                            <label className="setting-row">
                              <span>
                                <strong>Magnification</strong>
                                <small>
                                  <span id="dock-magnification-status">
                                    {calm
                                      ? "Paused by Reduce Motion"
                                      : systemCalm
                                        ? "Paused by system Reduce Motion"
                                        : "Gently enlarge icons near the pointer."}
                                  </span>
                                </small>
                              </span>
                              <input
                                type="checkbox"
                                checked={dockPreferences.magnify}
                                aria-label="Magnification"
                                aria-describedby="dock-magnification-status"
                                onChange={(e) =>
                                  changeDock({
                                    ...dockPreferences,
                                    magnify: e.target.checked,
                                  })
                                }
                              />
                            </label>
                            <label className="dock-size-control">
                              <span>
                                Icon size{" "}
                                <output>{dockPreferences.size}px</output>
                              </span>
                              <input
                                type="range"
                                aria-label="Dock icon size"
                                min="30"
                                max="40"
                                step="1"
                                value={dockPreferences.size}
                                onChange={(e) =>
                                  changeDock({
                                    ...dockPreferences,
                                    size: Number(e.target.value),
                                  })
                                }
                              />
                              <small>
                                Scales down to fit smaller screens. Default:
                                35px.
                              </small>
                            </label>
                            <div className="dock-pinned-list">
                              <strong>Dock favourites</strong>
                              <small>
                                Pin tools in Launchpad or right-click a tool in
                                the Dock. Favourites stay visible when space
                                allows; every tool remains in its stack and
                                Launchpad.
                              </small>
                              {!!dockPreferences.pinned.length && (
                                <div>
                                  {dockPreferences.pinned.map((id) => {
                                    const tool = workspaceTools.find(
                                      (entry) => entry.id === id,
                                    );
                                    return (
                                      <button
                                        key={id}
                                        className="secondary-button"
                                        onClick={() => toggleDockPin(id)}
                                        aria-label={
                                          "Remove " +
                                          tool?.label +
                                          " from Dock favourites"
                                        }
                                      >
                                        {tool?.label}
                                        <X size={12} />
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                            <button
                              className="secondary-button"
                              onClick={() => changeDock({ ...defaultDock })}
                            >
                              Reset Dock preferences
                            </button>
                          </fieldset>
                          <label className="motion-setting">
                            <div>
                              <strong>Reduce motion</strong>
                              <span>
                                A quieter workspace with fewer animations.
                              </span>
                            </div>
                            <input
                              type="checkbox"
                              checked={calm}
                              onChange={(event) => {
                                setCalm(event.target.checked);
                                try {
                                  localStorage.setItem(
                                    "emranlabs-calm",
                                    String(event.target.checked),
                                  );
                                } catch {}
                              }}
                            />
                          </label>
                          <p className="muted">
                            Your device’s reduced-motion preference is also
                            respected.
                          </p>
                          <label className="setting-row transparency-setting">
                            <span>
                              <strong>Reduce transparency</strong>
                              <small>Solid surfaces for clearer reading.</small>
                            </span>
                            <input
                              type="checkbox"
                              checked={opaque}
                              onChange={(event) => {
                                setOpaque(event.target.checked);
                                try {
                                  localStorage.setItem(
                                    "emranlabs-opaque",
                                    String(event.target.checked),
                                  );
                                } catch {}
                              }}
                            />
                          </label>
                          <div className="settings-native-options">
                            <h2>Accent colour</h2>
                            <div className="accent-options">
                              {Object.entries(accentColors).map(
                                ([key, color]) => (
                                  <button
                                    key={key}
                                    style={{ background: color }}
                                    aria-label={`${key} accent`}
                                    aria-pressed={accent === key}
                                    onClick={() => changeAccent(key as Accent)}
                                  >
                                    {accent === key && <Check size={14} />}
                                  </button>
                                ),
                              )}
                            </div>
                            <div className="settings-native-actions">
                              <button
                                className="secondary-button"
                                onClick={() => setWidgetGallery(true)}
                              >
                                Edit widgets
                              </button>
                              <button
                                className="secondary-button"
                                onClick={() => setMissionControl(true)}
                              >
                                Window overview
                              </button>
                              <button
                                className="secondary-button"
                                onClick={resetDesktopLayout}
                              >
                                Reset desktop layout
                              </button>
                            </div>
                          </div>
                        </section>
                      )}
                      {app === "photos" && (
                        <section className="photos-content">
                          <div className="wallpaper-preview">
                            <Image
                              src={wallpaperSource}
                              alt={
                                wallpaper === "horizon"
                                  ? "Emran Horizon, an original sandstone coast wallpaper"
                                  : "Catalina Island above the Pacific Ocean"
                              }
                              fill
                              sizes="(max-width: 700px) 80vw, 650px"
                              quality={80}
                            />
                          </div>
                          <h1>A little room to think.</h1>
                          <p>Choose the view behind your next idea.</p>
                          <div
                            className="wallpaper-options"
                            aria-label="Choose wallpaper"
                          >
                            <button
                              aria-pressed={wallpaper === "horizon"}
                              onClick={() => changeWallpaper("horizon")}
                            >
                              <Image
                                src="/images/emran-horizon.webp"
                                alt=""
                                width={240}
                                height={135}
                              />
                              <span>
                                Emran Horizon <small>Original collection</small>
                              </span>
                              {wallpaper === "horizon" && <Check size={16} />}
                            </button>
                            <button
                              aria-pressed={wallpaper === "catalina"}
                              onClick={() => changeWallpaper("catalina")}
                            >
                              <Image
                                src="/images/catalina-light.webp"
                                alt=""
                                width={240}
                                height={135}
                              />
                              <span>
                                Catalina <small>Classic coast</small>
                              </span>
                              {wallpaper === "catalina" && <Check size={16} />}
                            </button>
                          </div>
                          <button
                            className="text-link"
                            onClick={() => openApp("settings")}
                          >
                            Personalize your workspace <ArrowRight size={14} />
                          </button>
                        </section>
                      )}
                      {app === "trash" && (
                        <section className="empty-state trash-state">
                          <AppIcon name="trash" />
                          <h1>A fresh start.</h1>
                          <p>
                            The trash is empty. Your best ideas are still out
                            there.
                          </p>
                          <button
                            className="text-link"
                            onClick={() => openCollection("Overview")}
                          >
                            Back to the workspace <ArrowRight size={14} />
                          </button>
                        </section>
                      )}
                      {app === "help" && <WorkspaceGuide />}
                    </div>
                  </div>
                  <footer className="finder-status">
                    <span>
                      {app === "projects"
                        ? selected
                          ? selected.kind
                          : `${shownProjects.length} items`
                        : "Emran Labs"}
                    </span>
                    <span className="status-right">
                      {app === "projects" ? (
                        <nav
                          className="workspace-page-links"
                          aria-label="Portfolio pages"
                        >
                          {(
                            [
                              ["about", "About"],
                              ["services", "Services"],
                              ["contact", "Contact"],
                            ] as const
                          ).map(([id, label]) => (
                            <a
                              key={id}
                              href={`/${id}`}
                              onClick={(event) => {
                                if (
                                  event.metaKey ||
                                  event.ctrlKey ||
                                  event.shiftKey ||
                                  event.altKey
                                )
                                  return;
                                event.preventDefault();
                                openApp(id);
                              }}
                            >
                              {label}
                            </a>
                          ))}
                        </nav>
                      ) : (
                        <>
                          Made with curiosity <span>✦</span>
                        </>
                      )}
                    </span>
                  </footer>
                  {!geometry.maximized &&
                    resizeEdges.map((edge) => (
                      <button
                        key={edge}
                        className={`resize-handle resize-${edge}`}
                        aria-label={`Resize window ${edge}`}
                        tabIndex={edge === "se" ? 0 : -1}
                        onPointerDown={(event) => geometry.start(event, edge)}
                        onPointerMove={geometry.move}
                        onPointerUp={geometry.end}
                        onPointerCancel={geometry.end}
                        onKeyDown={(event) => {
                          if (
                            [
                              "ArrowLeft",
                              "ArrowRight",
                              "ArrowUp",
                              "ArrowDown",
                            ].includes(event.key)
                          ) {
                            event.preventDefault();
                            geometry.keyboardResize(
                              event.key === "ArrowRight"
                                ? 24
                                : event.key === "ArrowLeft"
                                  ? -24
                                  : 0,
                              event.key === "ArrowDown"
                                ? 24
                                : event.key === "ArrowUp"
                                  ? -24
                                  : 0,
                            );
                          }
                        }}
                      />
                    ))}
                </>
              )}
            </ManagedWindow>
          );
        })}
        {!visible && (
          <section
            className="restore-workspace welcome-workspace glass"
            aria-label="Welcome to Emran Labs"
          >
            <span className="eyebrow">
              EMRAN LABS · INDEPENDENT DESIGNER & DEVELOPER
            </span>
            <h1>
              Hi, I’m Emran<span>.</span>
            </h1>
            <p>
              I design and build websites, web apps and useful business tools.
              From the first idea to the final details, you work directly with
              me.
            </p>
            <div className="welcome-actions">
              <button
                className="primary-button"
                onClick={() => openCollection("All Projects")}
              >
                View Projects <ArrowRight size={15} />
              </button>
              <button
                className="secondary-button"
                onClick={() => {
                  openApp("contact");
                  rememberEnquiryContext({});
                }}
              >
                Start a Project <ArrowRight size={15} />
              </button>
            </div>
            <small>Explore my work through the Dock below.</small>
          </section>
        )}
      </main>
      <div className="desktop-signature">
        A little desktop. A world of ideas.<span>EMRAN LABS</span>
      </div>
      <ApplicationDock
        preferences={dockPreferences}
        calm={calm}
        desktop={desktop}
        collection={collection}
        date={calendarNow}
        timeZone={weatherCities[widgets.city].zone}
        onApp={openApp}
        onCollection={openCollection}
        onLaunchpad={() => {
          setContextMenu(null);
          setLaunchpad(true);
        }}
        onPin={toggleDockPin}
        onOpenOverlay={() => setContextMenu(null)}
      />
      {contextMenu && (
        <MenuPopover
          label={
            contextMenu.dockApp
              ? `${menuNames[contextMenu.dockApp]} actions`
              : contextMenu.project
                ? "Project actions"
                : "Desktop actions"
          }
          items={contextItems}
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
        />
      )}
      {zoomMenu && (
        <MenuPopover
          label="Window layout"
          x={zoomMenu.x}
          y={zoomMenu.y}
          onClose={() => setZoomMenu(null)}
          items={[
            {
              label: maximizedApps[zoomMenu.id]
                ? "Restore Size"
                : "Fill Available Space",
              action: () =>
                windowApis.current.get(zoomMenu.id)?.toggleMaximize(),
            },
            {
              label: "Tile Window Left",
              action: () => windowApis.current.get(zoomMenu.id)?.snap("left"),
            },
            {
              label: "Tile Window Right",
              action: () => windowApis.current.get(zoomMenu.id)?.snap("right"),
            },
            separator,
            {
              label: "Default Window Position",
              action: () => windowApis.current.get(zoomMenu.id)?.resetWindow(),
            },
          ]}
        />
      )}
      <ControlCenter
        open={controlCenter}
        onClose={() => setControlCenter(false)}
        dark={dark}
        onDark={changeDark}
        appearance={appearance}
        onAppearanceMode={changeAppearance}
        opaque={opaque}
        onOpaque={changeOpaque}
        calm={calm}
        onCalm={changeCalm}
        accent={accent}
        onAccent={changeAccent}
        wallpaper={wallpaper}
        onWallpaper={changeWallpaper}
        onWidgets={() => setWidgetGallery(true)}
        onMission={() => setMissionControl(true)}
        onAppearance={() => openApp("settings")}
        onReset={resetDesktopLayout}
      />
      <CalendarPopover
        open={calendarPopover}
        onClose={() => setCalendarPopover(false)}
        city={widgets.city}
        onCalendar={() => openApp("calendar")}
      />
      <MissionControl
        open={missionControl}
        onClose={() => setMissionControl(false)}
        desktop={desktop}
        onOpen={openApp}
        titles={titles}
        note={note}
        project={selected}
        collection={collection}
        projects={shownProjects}
        list={list}
        query={query}
        city={widgets.city}
        date={calendarNow}
        appearance={appearance}
        wallpaper={wallpaper}
      />
      <Launchpad
        open={launchpad}
        onClose={() => setLaunchpad(false)}
        onApp={openApp}
        onCollection={openCollection}
        date={calendarNow}
        timeZone={weatherCities[widgets.city].zone}
        pinned={dockPreferences.pinned}
        onPin={toggleDockPin}
      />
      <QuickLook
        project={quickLook}
        onClose={() => setQuickLook(null)}
        onOpen={openProject}
        onChange={setQuickLook}
      />
      <nav className="mobile-navigation" aria-label="Mobile navigation">
        {(
          [
            ["projects", "Projects"],
            ["about", "About"],
            ["services", "Services"],
            ["contact", "Contact"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            aria-current={activeApp === id ? "page" : undefined}
            onClick={() =>
              id === "projects" ? openCollection("Overview") : openApp(id)
            }
          >
            {label}
          </button>
        ))}
        <button
          className="mobile-tools-button"
          data-dialog-trigger
          aria-label="Browse tools"
          onClick={() => {
            setContextMenu(null);
            setSearchOpen(false);
            setLaunchpad(true);
          }}
        >
          <Grid2X2 size={19} />
        </button>
        <button
          onClick={openSearch}
          data-dialog-trigger
          aria-label="Search apps"
        >
          <Search size={19} />
        </button>
      </nav>
      <AnimatedDialog
        label="Search workspace"
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        className="spotlight"
      >
        <div className="spotlight-search">
          <Search size={22} />
          <input
            autoFocus
            placeholder="Search your way around…"
            aria-label="Search workspace apps and projects"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={searchOpen}
            aria-controls="spotlight-results"
            aria-activedescendant={searchOpen ? spotlightActiveId : undefined}
            value={spotlight}
            onChange={(event) => {
              setSpotlight(event.target.value);
              setSpotlightSelection(null);
            }}
            onKeyDown={(event) => {
              if (
                event.nativeEvent.isComposing ||
                event.altKey ||
                event.ctrlKey ||
                event.metaKey
              )
                return;
              if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                event.preventDefault();
                if (!spotlightResults.length) return;
                const index = spotlightResults.findIndex(
                  (result) => result.id === spotlightActive?.id,
                );
                const next =
                  (index +
                    (event.key === "ArrowDown" ? 1 : -1) +
                    spotlightResults.length) %
                  spotlightResults.length;
                setSpotlightSelection(spotlightResults[next].id);
              } else if (event.key === "Enter" && spotlightActive) {
                event.preventDefault();
                spotlightActive.action();
              }
            }}
          />
          <button
            className="icon-button"
            aria-label="Close search"
            onClick={() => setSearchOpen(false)}
          >
            <X size={18} />
          </button>
        </div>
        <div
          className="spotlight-results"
          id="spotlight-results"
          role="listbox"
          aria-label="Projects and apps"
        >
          <span className="sidebar-label" role="presentation">
            Projects & places
          </span>
          {spotlightResults.map((result) => (
            <button
              key={result.id}
              id={`spotlight-option-${result.id}`}
              role="option"
              aria-selected={result.id === spotlightActive?.id}
              tabIndex={-1}
              onPointerMove={() => setSpotlightSelection(result.id)}
              onClick={result.action}
            >
              {result.icon === "folder" ? (
                <Folder small badge="" />
              ) : (
                <AppIcon
                  name={result.icon}
                  date={calendarNow}
                  timeZone={weatherCities[widgets.city].zone}
                />
              )}
              <span>
                {result.label}
                {result.subtitle && <small>{result.subtitle}</small>}
              </span>
              <ArrowRight size={16} />
            </button>
          ))}
        </div>
        {!spotlightResults.length && (
          <p className="no-results" role="status">
            Nothing here yet. Try “React”, “Notes” or “Emran”.
          </p>
        )}
        <div className="spotlight-footer">
          <span>↑ ↓ to browse · Enter to open</span>
          <kbd>esc to close</kbd>
        </div>
      </AnimatedDialog>
      <div className={`desktop-toast ${toast ? "shown" : ""}`} role="status">
        {toast}
      </div>
    </div>
  );
}
