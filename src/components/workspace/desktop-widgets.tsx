"use client";
import { AnimatedDialog } from "./animated-dialog";
import { useDesktopClock } from "./use-desktop-clock";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type PointerEvent,
} from "react";
import {
  ChevronLeft,
  ChevronRight,
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  GripHorizontal,
  Moon,
  RefreshCw,
  Settings2,
  Sun,
  X,
} from "lucide-react";
import {
  dateInZone,
  defaultWidgets,
  monthGrid,
  temperatureLabel,
  weatherCities,
  weatherDescription,
  type CityId,
  type WeatherData,
  type WidgetId,
  type WidgetPreferences,
} from "./widget-data";

export function CalendarCard({
  city = "dubai",
  expanded = false,
}: {
  city?: CityId;
  expanded?: boolean;
}) {
  const zone = weatherCities[city].zone;
  const now = useDesktopClock();
  const [offset, setOffset] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const today = now ? dateInZone(now, zone) : null;
  const month = today
    ? new Date(Date.UTC(today.year, today.month + offset, 1))
    : null;
  const year = month?.getUTCFullYear() ?? 2026,
    index = month?.getUTCMonth() ?? 0;
  const name =
    month?.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }) ?? "Calendar";
  return (
    <section
      className={`calendar-card ${expanded ? "expanded-calendar" : ""}`}
      aria-label="Calendar"
    >
      <header>
        <div>
          <span className="widget-kicker">
            {now?.toLocaleDateString("en-US", {
              weekday: "long",
              timeZone: zone,
            }) ?? "TODAY"}
          </span>
          <h2>{name}</h2>
        </div>
        <div className="calendar-navigation">
          <button
            aria-label="Previous month"
            onClick={() => {
              setOffset((v) => v - 1);
              setPicked(null);
            }}
          >
            <ChevronLeft size={15} />
          </button>
          <button
            aria-label="Next month"
            onClick={() => {
              setOffset((v) => v + 1);
              setPicked(null);
            }}
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </header>
      <div className="mini-month">
        <div className="weekdays">
          {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
            <span key={i}>{day}</span>
          ))}
        </div>
        <div className="month-days">
          {month &&
            monthGrid(year, index).map((day, i) => {
              const current =
                !!day &&
                today?.year === year &&
                today?.month === index &&
                today.day === day;
              const key = `${year}-${index}-${day}`;
              return day ? (
                <button
                  key={i}
                  className={`${current ? "is-today" : ""} ${picked === key ? "is-picked" : ""}`}
                  aria-label={`${name} ${day}${current ? ", today" : ""}`}
                  aria-current={current ? "date" : undefined}
                  aria-pressed={picked === key}
                  onClick={() => setPicked(key)}
                >
                  {day}
                </button>
              ) : (
                <span key={i} />
              );
            })}
        </div>
      </div>
      <footer>
        <span>{weatherCities[city].name}</span>
        <button
          onClick={() => {
            setOffset(0);
            setPicked(null);
          }}
        >
          Today
        </button>
      </footer>
      {expanded && (
        <p className="calendar-selection">
          {picked
            ? `Selected: ${name} ${picked.split("-").at(-1)}`
            : "Choose a date to explore the calendar."}
        </p>
      )}
    </section>
  );
}

function ClockCard({ preferences }: { preferences: WidgetPreferences }) {
  const now = useDesktopClock("second");
  const city = weatherCities[preferences.city];
  const time = now ? dateInZone(now, city.zone) : null;
  const formatted =
    now?.toLocaleTimeString("en-US", {
      timeZone: city.zone,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }) ?? "—:—";
  return (
    <section
      className={`clock-card ${preferences.analog ? "analog-layout" : "digital-layout"}`}
      aria-label={`Clock in ${city.name}`}
    >
      {preferences.analog && (
        <svg className="analog-face" viewBox="0 0 120 120" aria-hidden="true">
          <circle cx="60" cy="60" r="57" className="clock-face" />
          {Array.from({ length: 60 }, (_, i) => (
            <line
              key={i}
              x1="60"
              y1={i % 5 === 0 ? "9" : "7"}
              x2="60"
              y2={i % 5 === 0 ? "16" : "10"}
              transform={`rotate(${i * 6} 60 60)`}
              className={i % 5 === 0 ? "hour-mark" : "minute-mark"}
            />
          ))}
          {[12, 3, 6, 9].map((n, i) => (
            <text
              key={n}
              x={[60, 96, 60, 24][i]}
              y={[29, 64, 100, 64][i]}
              textAnchor="middle"
            >
              {n}
            </text>
          ))}
          <line
            x1="60"
            y1="64"
            x2="60"
            y2="34"
            transform={`rotate(${((time?.hour ?? 0) % 12) * 30 + (time?.minute ?? 0) / 2} 60 60)`}
            className="hour-hand"
          />
          <line
            x1="60"
            y1="67"
            x2="60"
            y2="22"
            transform={`rotate(${(time?.minute ?? 0) * 6} 60 60)`}
            className="minute-hand"
          />
          <line
            x1="60"
            y1="72"
            x2="60"
            y2="15"
            transform={`rotate(${(time?.second ?? 0) * 6} 60 60)`}
            className="second-hand"
          />
          <circle cx="60" cy="60" r="3" className="clock-pin" />
        </svg>
      )}
      <div className="clock-readout">
        <span className="widget-kicker">{city.name}</span>
        <time dateTime={now?.toISOString()}>
          {formatted.replace(/\s[AP]M/, "")}
          <small>{formatted.match(/[AP]M/)?.[0]}</small>
        </time>
        <span className="clock-date">
          {now?.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            timeZone: city.zone,
          }) ?? "Local time"}
        </span>
      </div>
    </section>
  );
}

export function WeatherSymbol({
  code,
  isDay = true,
  size = 30,
}: {
  code: number;
  isDay?: boolean;
  size?: number;
}) {
  const Icon =
    code === 0 || code === 1
      ? isDay
        ? Sun
        : Moon
      : code === 2
        ? CloudSun
        : code === 3
          ? Cloud
          : code === 45 || code === 48
            ? CloudFog
            : [51, 53, 55, 56, 57].includes(code)
              ? CloudDrizzle
              : [71, 73, 75, 77, 85, 86].includes(code)
                ? CloudSnow
                : code >= 95
                  ? CloudLightning
                  : CloudRain;
  return <Icon size={size} strokeWidth={1.5} aria-hidden="true" />;
}

function WeatherCard({ preferences }: { preferences: WidgetPreferences }) {
  const { city, fahrenheit } = preferences;
  const [data, setData] = useState<WeatherData | null>(null);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let alive = true;
    let controller: AbortController | null = null;
    let lastFetch = 0;
    const cacheKey = `emranlabs-weather-v1-${city}`;
    // Synchronize the loading state with the newly selected external feed.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setData(null);
    setBusy(true);
    setError(false);
    try {
      const saved = JSON.parse(localStorage.getItem(cacheKey) ?? "null");
      if (
        saved?.city === city &&
        Number.isFinite(saved.temperature) &&
        Array.isArray(saved.days) &&
        Date.now() - saved.fetchedAt < 86400000
      )
        setData(saved);
    } catch {}
    async function refresh() {
      controller?.abort();
      const requestController = new AbortController();
      controller = requestController;
      const timeout = setTimeout(() => requestController.abort(), 12000);
      setBusy(true);
      setError(false);
      try {
        const r = await fetch(`/api/weather?city=${city}`, {
          signal: requestController.signal,
        });
        if (!r.ok) throw new Error("Unavailable");
        const next: WeatherData = await r.json();
        if (!alive || controller !== requestController) return;
        setData(next);
        lastFetch = Date.now();
        try {
          localStorage.setItem(cacheKey, JSON.stringify(next));
        } catch {}
      } catch {
        if (alive && controller === requestController) setError(true);
      } finally {
        clearTimeout(timeout);
        if (alive && controller === requestController) setBusy(false);
      }
    }
    const start = setTimeout(() => void refresh(), 800);
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") void refresh();
    }, 900000);
    const visible = () => {
      if (
        document.visibilityState === "visible" &&
        Date.now() - lastFetch > 900000
      )
        void refresh();
    };
    document.addEventListener("visibilitychange", visible);
    return () => {
      alive = false;
      controller?.abort();
      clearTimeout(start);
      clearInterval(interval);
      document.removeEventListener("visibilitychange", visible);
    };
  }, [city, attempt]);
  return (
    <section
      className={`weather-card ${data?.isDay === false ? "weather-night" : "weather-day"}`}
      aria-label={`Weather in ${weatherCities[city].name}`}
      aria-busy={busy}
    >
      <header>
        <span>{weatherCities[city].name}</span>
        <button
          aria-label="Refresh weather"
          onClick={() => setAttempt((v) => v + 1)}
          disabled={busy}
        >
          <RefreshCw size={13} className={busy ? "is-refreshing" : ""} />
        </button>
      </header>
      {data ? (
        <>
          <div className="weather-current">
            <div>
              <strong>{temperatureLabel(data.temperature, fahrenheit)}</strong>
              <span>{weatherDescription(data.code)}</span>
            </div>
            <WeatherSymbol code={data.code} isDay={data.isDay} size={47} />
          </div>
          <p className="weather-range">
            H:{temperatureLabel(data.high, fahrenheit)} &nbsp; L:
            {temperatureLabel(data.low, fahrenheit)}{" "}
            <span>
              {data.apparent === null
                ? `Wind ${Math.round(data.wind)} km/h`
                : `Feels ${temperatureLabel(data.apparent, fahrenheit)}`}
            </span>
          </p>
          <div className="weather-days">
            {data.days.slice(1, 5).map((day) => (
              <div key={day.date}>
                <span>
                  {new Date(day.date + "T12:00:00Z").toLocaleDateString(
                    "en-US",
                    { weekday: "short", timeZone: "UTC" },
                  )}
                </span>
                <WeatherSymbol code={day.code} size={18} />
                <b>{temperatureLabel(day.high, fahrenheit)}</b>
              </div>
            ))}
          </div>
          <p className="weather-update">
            {error
              ? "Saved forecast · update unavailable"
              : `${data.source === "met-no" ? "Forecast" : "Updated"} ${data.observedAt.slice(11, 16)} · ${fahrenheit ? "°F" : "°C"}`}
          </p>
        </>
      ) : (
        <div className="weather-empty">
          <CloudSun size={34} />
          <strong>{error ? "Weather unavailable" : "Checking the sky…"}</strong>
          <span>
            {error
              ? "Check your connection and try again."
              : "Loading the latest forecast"}
          </span>
          {error && !busy && (
            <button onClick={() => setAttempt((v) => v + 1)}>Try again</button>
          )}
        </div>
      )}
      <footer>
        <a
          href={
            data?.source === "met-no" || !data
              ? "https://api.met.no/"
              : "https://open-meteo.com/"
          }
          target="_blank"
          rel="noreferrer"
          title="Forecast values rounded; daily ranges use available forecast hours."
        >
          Weather by{" "}
          {data?.source === "met-no" || !data ? "MET Norway" : "Open-Meteo"} ↗
        </a>
        <a
          href="https://creativecommons.org/licenses/by/4.0/"
          target="_blank"
          rel="noreferrer"
          aria-label="Weather data license: Creative Commons Attribution 4.0"
        >
          CC BY
        </a>
      </footer>
    </section>
  );
}

function WidgetFrame({
  id,
  editing,
  preferences,
  onChange,
  children,
}: {
  id: WidgetId;
  editing: boolean;
  preferences: WidgetPreferences;
  onChange: (value: WidgetPreferences) => void;
  children: ReactNode;
}) {
  const element = useRef<HTMLElement>(null);
  const gesture = useRef<{
    x: number;
    y: number;
    left: number;
    top: number;
  } | null>(null);
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null);
  const [viewport, setViewport] = useState({
    width: 1920,
    height: 975,
    widgetWidth: 240,
    widgetHeight: 252,
  });
  useEffect(() => {
    const update = () => {
      const rect = element.current?.getBoundingClientRect();
      setViewport({
        width: innerWidth,
        height: innerHeight,
        widgetWidth: rect?.width ?? 240,
        widgetHeight: rect?.height ?? 252,
      });
    };
    update();
    const observer = new ResizeObserver(update);
    if (element.current) observer.observe(element.current);
    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);
  const saved = drag ?? preferences.positions[id];
  const position = saved
    ? {
        left: Math.max(
          8,
          Math.min(saved.x, viewport.width - viewport.widgetWidth - 8),
        ),
        top: Math.max(
          42,
          Math.min(saved.y, viewport.height - viewport.widgetHeight - 84),
        ),
      }
    : {};
  function start(e: PointerEvent<HTMLButtonElement>) {
    if (e.button !== 0 || !element.current) return;
    const r = element.current.getBoundingClientRect();
    gesture.current = { x: e.clientX, y: e.clientY, left: r.left, top: r.top };
    e.currentTarget.setPointerCapture(e.pointerId);
    e.preventDefault();
  }
  function move(e: PointerEvent<HTMLButtonElement>) {
    const g = gesture.current;
    if (!g) return;
    const rect = element.current?.getBoundingClientRect();
    const h = rect?.height ?? 220;
    const w = rect?.width ?? 240;
    setDrag({
      x: Math.max(8, Math.min(innerWidth - w - 8, g.left + e.clientX - g.x)),
      y: Math.max(42, Math.min(innerHeight - h - 84, g.top + e.clientY - g.y)),
    });
  }
  function finish() {
    if (drag)
      onChange({
        ...preferences,
        positions: { ...preferences.positions, [id]: drag },
      });
    gesture.current = null;
    setDrag(null);
  }
  return (
    <aside
      ref={element}
      className={`desktop-widget widget-${id} ${editing ? "widget-editing" : ""} ${drag ? "widget-dragging" : ""}`}
      style={position as CSSProperties}
      aria-label={`${id} widget`}
    >
      {editing && (
        <div className="widget-edit-bar">
          <button
            aria-label={`Move ${id} widget. Use arrow keys to reposition.`}
            onPointerDown={start}
            onPointerMove={move}
            onPointerUp={finish}
            onPointerCancel={finish}
            onKeyDown={(e) => {
              if (
                !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(
                  e.key,
                )
              )
                return;
              e.preventDefault();
              const r = element.current!.getBoundingClientRect();
              const x = Math.max(
                8,
                Math.min(
                  innerWidth - r.width - 8,
                  r.left +
                    (e.key === "ArrowLeft"
                      ? -10
                      : e.key === "ArrowRight"
                        ? 10
                        : 0),
                ),
              );
              const y = Math.max(
                42,
                Math.min(
                  innerHeight - r.height - 84,
                  r.top +
                    (e.key === "ArrowUp"
                      ? -10
                      : e.key === "ArrowDown"
                        ? 10
                        : 0),
                ),
              );
              onChange({
                ...preferences,
                positions: { ...preferences.positions, [id]: { x, y } },
              });
            }}
          >
            <GripHorizontal size={17} />
            <span>{id}</span>
          </button>
          <button
            aria-label={`Hide ${id} widget`}
            onClick={() =>
              onChange({
                ...preferences,
                visible: { ...preferences.visible, [id]: false },
              })
            }
          >
            <X size={13} />
          </button>
        </div>
      )}
      {children}
    </aside>
  );
}

export function DesktopWidgets({
  preferences,
  onChange,
  editing,
  onEdit,
  editorOpen,
  onCloseEditor,
}: {
  preferences: WidgetPreferences;
  onChange: (value: WidgetPreferences) => void;
  editing: boolean;
  onEdit: (value: boolean) => void;
  editorOpen: boolean;
  onCloseEditor: () => void;
}) {
  return (
    <>
      <div
        className={`desktop-widget-layer ${editing ? "editing-widgets" : ""}`}
      >
        <button
          className="edit-widgets-button"
          onClick={() => onEdit(!editing)}
        >
          <Settings2 size={12} />
          {editing ? "Done" : "Edit widgets"}
        </button>
        {preferences.visible.clock && (
          <WidgetFrame
            id="clock"
            editing={editing}
            preferences={preferences}
            onChange={onChange}
          >
            <ClockCard preferences={preferences} />
          </WidgetFrame>
        )}
        {preferences.visible.calendar && (
          <WidgetFrame
            id="calendar"
            editing={editing}
            preferences={preferences}
            onChange={onChange}
          >
            <CalendarCard city={preferences.city} />
          </WidgetFrame>
        )}
        {preferences.visible.weather && (
          <WidgetFrame
            id="weather"
            editing={editing}
            preferences={preferences}
            onChange={onChange}
          >
            <WeatherCard key={preferences.city} preferences={preferences} />
          </WidgetFrame>
        )}
      </div>
      <AnimatedDialog
        open={editorOpen}
        onClose={onCloseEditor}
        className="widget-editor system-dialog"
        label="Widget gallery"
      >
        {editorOpen && (
          <>
            <header className="system-dialog-header">
              <div>
                <span className="eyebrow">YOUR DESKTOP, YOUR WAY</span>
                <h2>Widgets</h2>
              </div>
              <button
                className="icon-button"
                aria-label="Close widget gallery"
                onClick={onCloseEditor}
              >
                <X size={19} />
              </button>
            </header>
            <div className="widget-editor-controls">
              <label>
                City & time zone
                <select
                  value={preferences.city}
                  onChange={(e) =>
                    onChange({ ...preferences, city: e.target.value as CityId })
                  }
                >
                  {Object.entries(weatherCities).map(([id, c]) => (
                    <option key={id} value={id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Clock style
                <select
                  value={preferences.analog ? "analog" : "digital"}
                  onChange={(e) =>
                    onChange({
                      ...preferences,
                      analog: e.target.value === "analog",
                    })
                  }
                >
                  <option value="analog">Analog & digital</option>
                  <option value="digital">Digital</option>
                </select>
              </label>
              <label>
                Temperature
                <select
                  value={preferences.fahrenheit ? "f" : "c"}
                  onChange={(e) =>
                    onChange({
                      ...preferences,
                      fahrenheit: e.target.value === "f",
                    })
                  }
                >
                  <option value="c">Celsius · °C</option>
                  <option value="f">Fahrenheit · °F</option>
                </select>
              </label>
            </div>
            <div className="widget-gallery-previews">
              {(["clock", "calendar", "weather"] as const).map((id) => (
                <div key={id}>
                  <label className="widget-visibility">
                    <span>{id[0].toUpperCase() + id.slice(1)}</span>
                    <input
                      type="checkbox"
                      checked={preferences.visible[id]}
                      onChange={(e) =>
                        onChange({
                          ...preferences,
                          visible: {
                            ...preferences.visible,
                            [id]: e.target.checked,
                          },
                        })
                      }
                    />
                  </label>
                  <div className="widget-sample">
                    {id === "clock" ? (
                      <ClockCard preferences={preferences} />
                    ) : id === "calendar" ? (
                      <CalendarCard city={preferences.city} />
                    ) : (
                      <WeatherCard
                        key={preferences.city}
                        preferences={preferences}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
            <footer className="widget-editor-footer">
              <button
                className="secondary-button"
                onClick={() => onChange({ ...defaultWidgets })}
              >
                Reset widgets
              </button>
              <button
                className="primary-button"
                onClick={() => {
                  onCloseEditor();
                  onEdit(true);
                }}
              >
                Arrange on desktop
              </button>
              <small>
                Drag a widget’s handle, or use its arrow keys. Layout saves on
                this browser.
              </small>
            </footer>
          </>
        )}
      </AnimatedDialog>
    </>
  );
}
