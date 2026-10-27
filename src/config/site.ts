const productionUrl = "https://emranlabs.com";
const fallbackUrl =
  process.env.NODE_ENV === "production"
    ? productionUrl
    : "http://localhost:3000";

function normalizeSiteUrl(value: string | undefined) {
  const candidate = value?.trim() || fallbackUrl;
  try {
    const url = new URL(candidate);
    url.hash = "";
    url.search = "";
    url.pathname = "";
    return url.toString().replace(/\/$/, "");
  } catch {
    return fallbackUrl;
  }
}

export const siteConfig = {
  name: "EMRAN LABS",
  tagline: "Building the Future of AI & Digital Experiences",
  description:
    "EmranLabs is the personal portfolio of Emran Younas, an independent designer, developer and IT professional in Dubai. Explore websites, web applications and useful business workflows designed and built by Emran.",
  brandName: "EMRAN LABS",
  creatorName: "Emran Younas",
  url: normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL),
  themeColor: "#d6e8f3",
};

export function getSiteUrl(path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalizedPath, `${siteConfig.url}/`).toString();
}
