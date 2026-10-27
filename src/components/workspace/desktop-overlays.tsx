"use client";
import { type ReactNode } from "react";
import { AnimatedDialog } from "./animated-dialog";
import {
  Check,
  LayoutGrid,
  Moon,
  PanelsTopLeft,
  Settings2,
  Sun,
  X,
} from "lucide-react";
import { AppIcon } from "./app-icon";
import { CalendarCard } from "./desktop-widgets";
import { accentColors, type Accent } from "./desktop-preferences";
import { weatherCities, type CityId } from "./widget-data";
import type { Appearance } from "./use-appearance";
import type { DesktopState } from "./window-manager";
import type { AppName, Collection, Project } from "./workspace-data";

function SystemDialog({
  open,
  onClose,
  label,
  className,
  children,
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  className: string;
  children: ReactNode;
}) {
  return (
    <AnimatedDialog
      open={open}
      onClose={onClose}
      className={`system-dialog ${className}`}
      label={label}
    >
      {children}
    </AnimatedDialog>
  );
}

export function ControlCenter({
  open,
  onClose,
  dark,
  onDark,
  appearance,
  onAppearanceMode,
  opaque,
  onOpaque,
  calm,
  onCalm,
  accent,
  onAccent,
  wallpaper,
  onWallpaper,
  onWidgets,
  onMission,
  onAppearance,
  onReset,
}: {
  open: boolean;
  onClose: () => void;
  dark: boolean;
  onDark: (v: boolean) => void;
  appearance: Appearance;
  onAppearanceMode: (v: Appearance) => void;
  opaque: boolean;
  onOpaque: (v: boolean) => void;
  calm: boolean;
  onCalm: (v: boolean) => void;
  accent: Accent;
  onAccent: (v: Accent) => void;
  wallpaper: "horizon" | "catalina";
  onWallpaper: (v: "horizon" | "catalina") => void;
  onWidgets: () => void;
  onMission: () => void;
  onAppearance: () => void;
  onReset: () => void;
}) {
  return (
    <SystemDialog
      open={open}
      onClose={onClose}
      label="Control Center"
      className="control-center"
    >
      <header>
        <h2>Control Center</h2>
        <button
          className="icon-button"
          onClick={onClose}
          aria-label="Close Control Center"
        >
          <X size={16} />
        </button>
      </header>
      <div className="control-tiles">
        <button
          className={dark ? "control-on" : ""}
          aria-pressed={dark}
          onClick={() => onDark(!dark)}
        >
          <span>{dark ? <Moon size={19} /> : <Sun size={19} />}</span>
          <strong>Appearance</strong>
          <small>
            {appearance === "system"
              ? `System · ${dark ? "Dark" : "Light"}`
              : dark
                ? "Dark"
                : "Light"}
          </small>
        </button>
        <button
          onClick={() => {
            onClose();
            onWidgets();
          }}
        >
          <span>
            <LayoutGrid size={19} />
          </span>
          <strong>Widgets</strong>
          <small>Clock, calendar, weather</small>
        </button>
      </div>
      <label className="appearance-mode-select">
        Appearance mode
        <select
          value={appearance}
          onChange={(e) => onAppearanceMode(e.target.value as Appearance)}
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="system">System</option>
        </select>
      </label>
      <section className="control-section">
        <h3>Accent colour</h3>
        <div className="accent-options">
          {Object.entries(accentColors).map(([key, value]) => (
            <button
              key={key}
              style={{ background: value }}
              aria-label={`${key} accent`}
              aria-pressed={accent === key}
              onClick={() => onAccent(key as Accent)}
            >
              {accent === key && <Check size={14} />}
            </button>
          ))}
        </div>
      </section>
      <section className="control-section">
        <h3>Wallpaper</h3>
        <div className="control-wallpapers">
          <button
            aria-pressed={wallpaper === "horizon"}
            onClick={() => onWallpaper("horizon")}
          >
            <img src="/images/emran-horizon.webp" alt="" />
            <span>Horizon</span>
          </button>
          <button
            aria-pressed={wallpaper === "catalina"}
            onClick={() => onWallpaper("catalina")}
          >
            <img src="/images/catalina-light.webp" alt="" />
            <span>Catalina</span>
          </button>
        </div>
      </section>
      <div className="control-switches">
        <label>
          <span>Reduce transparency</span>
          <input
            type="checkbox"
            checked={opaque}
            onChange={(e) => onOpaque(e.target.checked)}
          />
        </label>
        <label>
          <span>Reduce motion</span>
          <input
            type="checkbox"
            checked={calm}
            onChange={(e) => onCalm(e.target.checked)}
          />
        </label>
      </div>
      <button
        className="control-action"
        onClick={() => {
          onClose();
          onMission();
        }}
      >
        <PanelsTopLeft size={16} />
        Window overview <span>Alt + 9</span>
      </button>
      <footer>
        <button
          onClick={() => {
            onClose();
            onAppearance();
          }}
        >
          <Settings2 size={13} />
          All settings
        </button>
        <button
          onClick={() => {
            onReset();
            onClose();
          }}
        >
          Reset desktop layout
        </button>
      </footer>
    </SystemDialog>
  );
}

export function CalendarPopover({
  open,
  onClose,
  city,
  onCalendar,
}: {
  open: boolean;
  onClose: () => void;
  city: CityId;
  onCalendar: () => void;
}) {
  return (
    <SystemDialog
      open={open}
      onClose={onClose}
      label="Date and calendar"
      className="calendar-popover"
    >
      <CalendarCard city={city} />
      <button
        className="calendar-open"
        onClick={() => {
          onClose();
          onCalendar();
        }}
      >
        Open Calendar <PanelsTopLeft size={14} />
      </button>
    </SystemDialog>
  );
}

export function MissionControl({
  open,
  onClose,
  desktop,
  onOpen,
  titles,
  note,
  project,
  collection,
  projects,
  list,
  query,
  city,
  date,
  appearance,
  wallpaper,
}: {
  open: boolean;
  onClose: () => void;
  desktop: DesktopState;
  onOpen: (app: AppName) => void;
  titles: Record<AppName, string>;
  note: string;
  project: Project | null;
  collection: Collection;
  projects: Project[];
  list: boolean;
  query: string;
  city: CityId;
  date: Date | null;
  appearance: Appearance;
  wallpaper: "horizon" | "catalina";
}) {
  const icons: Record<AppName, string> = {
    projects: "finder",
    about: "finder",
    contact: "mail",
    notes: "notes",
    calendar: "calendar",
    settings: "settings",
    photos: "photos",
    trash: "trash",
    help: "launchpad",
    services: "vscode",
  };
  return (
    <SystemDialog
      open={open}
      onClose={onClose}
      label="Window overview"
      className="mission-control"
    >
      <header>
        <div>
          <span className="eyebrow">YOUR OPEN WINDOWS</span>
          <h2>A little room to see everything.</h2>
        </div>
        <button
          className="icon-button"
          onClick={onClose}
          aria-label="Close window overview"
        >
          <X size={20} />
        </button>
      </header>
      <div className="mission-grid">
        {desktop.windows.map((w) => (
          <button
            key={w.id}
            className={`mission-card ${desktop.active === w.id && !w.minimized ? "mission-active" : ""}`}
            onClick={() => {
              onClose();
              onOpen(w.id);
            }}
          >
            <div className={`mission-preview mission-${w.id}`}>
              <div className="mission-chrome">
                <i />
                <i />
                <i />
                <span>
                  {w.id === "projects"
                    ? (project?.name ?? collection)
                    : titles[w.id]}
                </span>
              </div>
              {w.id === "projects" ? (
                project ? (
                  <div className="mission-project-detail">
                    <img src={project.image} alt="" />
                    <strong>{project.name}</strong>
                    <span>{project.kind}</span>
                  </div>
                ) : (
                  <div
                    className={`mission-collection ${list ? "mission-list" : ""}`}
                  >
                    <p>
                      {collection}
                      {query && ` · “${query}”`}
                      <span>
                        {projects.length}{" "}
                        {projects.length === 1 ? "project" : "projects"}
                      </span>
                    </p>
                    <div className="mission-folders">
                      {projects.map((p) => (
                        <div key={p.id}>
                          <img src={p.image} alt="" />
                          <span>{p.name}</span>
                        </div>
                      ))}
                    </div>
                    {!projects.length && (
                      <p className="mission-empty-collection">
                        No matching projects
                      </p>
                    )}
                  </div>
                )
              ) : w.id === "notes" ? (
                <p className="mission-note">{note.slice(0, 230)}</p>
              ) : w.id === "calendar" ? (
                <div className="mission-calendar">
                  <AppIcon
                    name="calendar"
                    date={date}
                    timeZone={weatherCities[city].zone}
                  />
                  <strong>{weatherCities[city].name}</strong>
                  <span>
                    {date?.toLocaleDateString("en-US", {
                      timeZone: weatherCities[city].zone,
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              ) : w.id === "photos" ? (
                <div className="mission-wallpaper">
                  <img
                    src={
                      wallpaper === "horizon"
                        ? "/images/emran-horizon.webp"
                        : "/images/catalina-light.webp"
                    }
                    alt=""
                  />
                  <span>
                    {wallpaper === "horizon" ? "Horizon" : "Catalina"}
                  </span>
                </div>
              ) : (
                <div className="mission-app">
                  <AppIcon
                    name={icons[w.id]}
                    date={date}
                    timeZone={weatherCities[city].zone}
                  />
                  <strong>{titles[w.id]}</strong>
                  {w.id === "settings" && (
                    <small>
                      {appearance === "system"
                        ? "System appearance"
                        : `${appearance === "dark" ? "Dark" : "Light"} appearance`}
                    </small>
                  )}
                </div>
              )}
            </div>
            <span className="mission-caption">
              <AppIcon
                name={icons[w.id]}
                date={date}
                timeZone={weatherCities[city].zone}
              />
              <strong>
                {w.id === "projects"
                  ? (project?.name ?? collection)
                  : titles[w.id]}
              </strong>
              <small>{w.minimized ? "Minimized" : "Open"}</small>
            </span>
          </button>
        ))}
      </div>
      {desktop.windows.length === 0 && (
        <div className="mission-empty">
          <p>Your desktop is clear.</p>
          <button
            className="primary-button"
            onClick={() => {
              onClose();
              onOpen("projects");
            }}
          >
            Open Finder
          </button>
        </div>
      )}
      <footer>
        Choose a window to bring it forward. Escape returns to your desktop.
      </footer>
    </SystemDialog>
  );
}
