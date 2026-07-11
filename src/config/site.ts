const fallbackUrl = "http://localhost:3000";

export const siteConfig = {
  name: "EMRAN LABS",
  tagline: "Building the Future of AI & Digital Experiences",
  description:
    "Building the Future of AI & Digital Experiences through AI, design, development, and creative technology.",
  brandName: "EMRAN LABS",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? fallbackUrl,
};

export function getSiteUrl(path = "/") {
  const baseUrl = siteConfig.url.replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return new URL(normalizedPath, `${baseUrl}/`).toString();
}
