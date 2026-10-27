export const weatherCities = {
  dubai: {
    name: "Dubai",
    zone: "Asia/Dubai",
    latitude: 25.2048,
    longitude: 55.2708,
  },
  abuDhabi: {
    name: "Abu Dhabi",
    zone: "Asia/Dubai",
    latitude: 24.4539,
    longitude: 54.3773,
  },
  karachi: {
    name: "Karachi",
    zone: "Asia/Karachi",
    latitude: 24.8607,
    longitude: 67.0011,
  },
  london: {
    name: "London",
    zone: "Europe/London",
    latitude: 51.5072,
    longitude: -0.1276,
  },
  philadelphia: {
    name: "Philadelphia",
    zone: "America/New_York",
    latitude: 39.9526,
    longitude: -75.1652,
  },
} as const;
export type CityId = keyof typeof weatherCities;
export type WidgetId = "clock" | "calendar" | "weather";
export type WidgetPreferences = {
  city: CityId;
  fahrenheit: boolean;
  analog: boolean;
  visible: Record<WidgetId, boolean>;
  positions: Partial<Record<WidgetId, { x: number; y: number }>>;
};
export const defaultWidgets: WidgetPreferences = {
  city: "dubai",
  fahrenheit: false,
  analog: true,
  visible: { clock: true, calendar: true, weather: true },
  positions: {},
};
export const widgetStorageKey = "emranlabs-widgets-v1";
export function parseWidgets(raw: string | null): WidgetPreferences {
  try {
    const v = JSON.parse(raw ?? "null");
    if (!v) return defaultWidgets;
    const positions: WidgetPreferences["positions"] = {};
    for (const id of ["clock", "calendar", "weather"] as const) {
      const p = v.positions?.[id];
      if (p && Number.isFinite(p.x) && Number.isFinite(p.y))
        positions[id] = { x: Math.max(8, p.x), y: Math.max(42, p.y) };
    }
    return {
      city: Object.hasOwn(weatherCities, v.city) ? v.city : "dubai",
      fahrenheit: v.fahrenheit === true,
      analog: v.analog !== false,
      visible: {
        clock: v.visible?.clock !== false,
        calendar: v.visible?.calendar !== false,
        weather: v.visible?.weather !== false,
      },
      positions,
    };
  } catch {
    return defaultWidgets;
  }
}
export function dateInZone(now: Date, zone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: zone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (name: string) =>
    Number(parts.find((p) => p.type === name)?.value ?? 0);
  return {
    year: get("year"),
    month: get("month") - 1,
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
    second: get("second"),
  };
}
export function monthGrid(year: number, month: number) {
  const first = new Date(Date.UTC(year, month, 1));
  const start = (first.getUTCDay() + 6) % 7;
  const days = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return Array.from({ length: 42 }, (_, i) =>
    i >= start && i < start + days ? i - start + 1 : null,
  );
}
export type WeatherData = {
  city: CityId;
  observedAt: string;
  fetchedAt: number;
  temperature: number;
  apparent: number | null;
  source?: "met-no";
  code: number;
  isDay: boolean;
  wind: number;
  high: number;
  low: number;
  days: { date: string; code: number; high: number; low: number }[];
};
export function weatherDescription(code: number) {
  if (code === 0) return "Clear sky";
  if (code === 1) return "Mostly clear";
  if (code === 2) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if (code === 45 || code === 48) return "Foggy";
  if ([51, 53, 55, 56, 57].includes(code)) return "Drizzle";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "Rain";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "Snow";
  if (code >= 95) return "Thunderstorms";
  return "Weather conditions";
}
export function temperatureLabel(celsius: number, fahrenheit: boolean) {
  return Math.round(fahrenheit ? (celsius * 9) / 5 + 32 : celsius) + "°";
}
