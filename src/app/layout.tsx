import type { Metadata, Viewport } from "next";
import { AnalyticsScript } from "@/components/seo/analytics-script";
import { StructuredData } from "@/components/seo/structured-data";
import { siteConfig, getSiteUrl } from "@/config/site";
import { getAnalyticsConfig } from "@/lib/analytics/config";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — Futuristic Technology Portfolio`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.creatorName, url: siteConfig.url }],
  creator: siteConfig.creatorName,
  alternates: { canonical: getSiteUrl("/") },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  openGraph: {
    type: "profile",
    url: getSiteUrl("/"),
    title: `${siteConfig.name} — Futuristic Technology Portfolio`,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: getSiteUrl("/opengraph-image"),
        width: 1200,
        height: 630,
        alt: "EMRAN LABS futuristic technology portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — Futuristic Technology Portfolio`,
    description: siteConfig.description,
    images: [getSiteUrl("/twitter-image")],
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: siteConfig.themeColor,
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const analytics = getAnalyticsConfig();
  return (
    <html lang="en">
      <body>
        <StructuredData />
        {analytics && <AnalyticsScript config={analytics} />}
        {children}
      </body>
    </html>
  );
}
