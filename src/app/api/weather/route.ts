import {
  weatherCities,
  type CityId,
  type WeatherData,
} from "@/components/workspace/widget-data";
import {
  fetchForecast,
  normalizeForecast,
} from "@/lib/server/weather-forecast";

export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("city") ?? "dubai";
  if (!Object.hasOwn(weatherCities, id))
    return Response.json(
      { error: "Choose a supported city." },
      { status: 400 },
    );
  const city = weatherCities[id as CityId];
  const key = process.env.OPEN_METEO_API_KEY;
  if (!key) {
    try {
      const forecast = await fetchForecast(city.latitude, city.longitude);
      return Response.json(
        { ...normalizeForecast(forecast, city.zone), city: id },
        {
          headers: { "Cache-Control": "public, max-age=300, s-maxage=900" },
        },
      );
    } catch {
      return Response.json(
        { error: "Weather is temporarily unavailable. Please try again." },
        {
          status: 503,
          headers: { "Cache-Control": "no-store", "Retry-After": "900" },
        },
      );
    }
  }
  const endpoint = new URL(
    key
      ? "https://customer-api.open-meteo.com/v1/forecast"
      : "https://api.open-meteo.com/v1/forecast",
  );
  endpoint.search = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    current:
      "temperature_2m,apparent_temperature,is_day,weather_code,wind_speed_10m",
    daily: "weather_code,temperature_2m_max,temperature_2m_min",
    timezone: city.zone,
    forecast_days: "5",
    ...(key ? { apikey: key } : {}),
  }).toString();
  try {
    const response = await fetch(endpoint, {
      next: { revalidate: 900 },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error("Weather unavailable");
    const data = await response.json();
    const current = data.current,
      daily = data.daily;
    if (
      !current ||
      !daily ||
      ![
        current.temperature_2m,
        current.apparent_temperature,
        current.weather_code,
        current.wind_speed_10m,
        daily.temperature_2m_max?.[0],
        daily.temperature_2m_min?.[0],
      ].every(Number.isFinite)
    )
      throw new Error("Invalid weather response");
    const result: WeatherData = {
      city: id as CityId,
      observedAt: current.time,
      fetchedAt: Date.now(),
      temperature: current.temperature_2m,
      apparent: current.apparent_temperature,
      code: current.weather_code,
      isDay: current.is_day === 1,
      wind: current.wind_speed_10m,
      high: daily.temperature_2m_max[0],
      low: daily.temperature_2m_min[0],
      days: daily.time.map((date: string, i: number) => ({
        date,
        code: daily.weather_code[i],
        high: daily.temperature_2m_max[i],
        low: daily.temperature_2m_min[i],
      })),
    };
    return Response.json(result, {
      headers: { "Cache-Control": "public, max-age=300, s-maxage=900" },
    });
  } catch {
    return Response.json(
      { error: "Weather is temporarily unavailable. Please try again." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
