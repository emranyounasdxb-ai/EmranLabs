type ForecastPoint = {
  time: string;
  data: {
    instant: { details: { air_temperature: number; wind_speed: number } };
    next_1_hours?: { summary: { symbol_code: string } };
    next_6_hours?: { summary: { symbol_code: string } };
    next_12_hours?: { summary: { symbol_code: string } };
  };
};
type Forecast = { properties: { timeseries: ForecastPoint[] } };
const cache = new Map<
  string,
  {
    data?: Forecast;
    expires: number;
    modified?: string;
    pending?: Promise<Forecast>;
  }
>();

export async function fetchForecast(
  latitude: number,
  longitude: number,
): Promise<Forecast> {
  const coordinates = `lat=${latitude.toFixed(4)}&lon=${longitude.toFixed(4)}`;
  let entry = cache.get(coordinates);
  if (entry?.pending) return entry.pending;
  if (entry && Date.now() < entry.expires) {
    if (entry.data) return entry.data;
    throw new Error("Weather retry cooldown");
  }
  entry ??= { expires: 0 };
  cache.set(coordinates, entry);
  const current = entry;
  current.pending = (async () => {
    try {
      const response = await fetch(
        `https://api.met.no/weatherapi/locationforecast/2.0/compact?${coordinates}`,
        {
          headers: {
            "User-Agent":
              "EmranLabs/1.0 https://emranlabs.com helo@emranlabs.com",
            ...(current.modified
              ? { "If-Modified-Since": current.modified }
              : {}),
          },
          cache: "no-store",
          signal: AbortSignal.timeout(10000),
        },
      );
      if (!response.ok && response.status !== 304)
        throw new Error("Weather provider unavailable");
      const data: Forecast =
        response.status === 304 ? current.data! : await response.json();
      if (
        !Array.isArray(data?.properties?.timeseries) ||
        !data.properties.timeseries.length
      )
        throw new Error("Invalid forecast");
      const expires = Date.parse(response.headers.get("Expires") ?? "");
      current.expires = Math.max(
        Date.now() + 15 * 60_000,
        Number.isFinite(expires) ? expires : 0,
      );
      current.modified =
        response.headers.get("Last-Modified") ?? current.modified;
      current.data = data;
      return data;
    } catch (error) {
      current.expires = Date.now() + 15 * 60_000;
      current.data = undefined;
      current.modified = undefined;
      throw error;
    } finally {
      current.pending = undefined;
    }
  })();
  return current.pending;
}

function symbol(point: ForecastPoint) {
  return (
    (
      point.data.next_1_hours ??
      point.data.next_6_hours ??
      point.data.next_12_hours
    )?.summary?.symbol_code ?? "cloudy"
  );
}
function condition(value: string) {
  if (value.includes("thunder")) return 95;
  if (value.includes("snow") || value.includes("sleet")) return 73;
  if (value.includes("rain")) return 63;
  if (value.includes("fog")) return 45;
  if (value.startsWith("clearsky")) return 0;
  if (value.startsWith("fair")) return 1;
  if (value.startsWith("partlycloudy")) return 2;
  return 3;
}
export function normalizeForecast(
  data: Forecast,
  zone: string,
  now = Date.now(),
) {
  const points = data.properties.timeseries.filter(
    (point) => Date.parse(point.time) >= now - 60 * 60_000,
  );
  const first = points[0];
  if (
    !first ||
    !Number.isFinite(first.data.instant.details.air_temperature) ||
    !Number.isFinite(first.data.instant.details.wind_speed)
  )
    throw new Error("Current forecast unavailable");
  const dateFormat = new Intl.DateTimeFormat("en-CA", {
    timeZone: zone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const groups = new Map<string, ForecastPoint[]>();
  for (const point of points) {
    const date = dateFormat.format(new Date(point.time));
    const group = groups.get(date) ?? [];
    group.push(point);
    groups.set(date, group);
  }
  const days = [...groups].slice(0, 5).map(([date, group]) => {
    const temperatures = group
      .map((point) => point.data.instant.details.air_temperature)
      .filter(Number.isFinite);
    if (!temperatures.length) throw new Error("Invalid daily forecast");
    return {
      date,
      code: condition(symbol(group[Math.floor(group.length / 2)])),
      high: Math.max(...temperatures),
      low: Math.min(...temperatures),
    };
  });
  const time = new Intl.DateTimeFormat("en-GB", {
    timeZone: zone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(first.time));
  return {
    observedAt: `${days[0].date}T${time}`,
    fetchedAt: now,
    temperature: first.data.instant.details.air_temperature,
    apparent: null,
    wind: first.data.instant.details.wind_speed * 3.6,
    code: condition(symbol(first)),
    isDay: !symbol(first).endsWith("_night"),
    high: days[0].high,
    low: days[0].low,
    days,
    source: "met-no" as const,
  };
}
