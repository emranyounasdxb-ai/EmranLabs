const officialPlausibleOrigin = "https://plausible.io";

export type AnalyticsConfig = {
  enabled: boolean;
  domain: string;
  scriptUrl: string;
};

function isEnabled(value: string | undefined) {
  return value === "1" || value?.toLowerCase() === "true";
}

function isSafeScriptUrl(value: string) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return false;
    if (
      url.origin === officialPlausibleOrigin &&
      url.pathname === "/js/script.js"
    )
      return true;
    return (
      url.pathname.endsWith("/js/script.js") && !url.username && !url.password
    );
  } catch {
    return false;
  }
}

export function getAnalyticsConfig(): AnalyticsConfig | null {
  const enabled = isEnabled(process.env.NEXT_PUBLIC_ANALYTICS_ENABLED);
  const domain = process.env.NEXT_PUBLIC_ANALYTICS_DOMAIN?.trim();
  const candidate =
    process.env.NEXT_PUBLIC_ANALYTICS_SCRIPT_URL?.trim() ||
    `${officialPlausibleOrigin}/js/script.js`;
  if (!enabled || !domain || !isSafeScriptUrl(candidate)) return null;
  return { enabled, domain, scriptUrl: candidate };
}
