import type { Metadata, Viewport } from "next";
import { GoogleTagManagerConsent } from "@/components/seo/google-tag-manager-consent";
import { StructuredData } from "@/components/seo/structured-data";
import { WebVitals } from "@/components/seo/web-vitals";
import { siteConfig, getSiteUrl } from "@/config/site";
import { getAnalyticsConfig } from "@/lib/analytics/config";

import "../styles/workspace.css";
import "../styles/desktop-materials.css";
import "../styles/desktop-features.css";
import "../styles/desktop-experience.css";
import "../styles/desktop-native.css";
import "../styles/desktop-motion.css";
import "../styles/desktop-refinements.css";
import "../styles/creative-tools.css";
import "../styles/customer-experience.css";
import "../styles/customer-polish.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `Emran Younas — Software Developer & AI Automation | Emran Labs`,
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
    icon: "/icon.svg",
  },
  openGraph: {
    type: "profile",
    url: getSiteUrl("/"),
    title: "Emran Younas — Ideas, built into reality.",
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: getSiteUrl("/opengraph-image"),
        width: 1200,
        height: 630,
        alt: "Emran Labs — Software, AI and useful digital experiences",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Emran Younas — Ideas, built into reality.",
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
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const analytics = getAnalyticsConfig();
  return (
    <html lang="en">
      <head>
        <link
          rel="preload"
          href="/fonts/InterLatin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <StructuredData />
        <WebVitals />
        {analytics && <GoogleTagManagerConsent config={analytics} />}
        {children}
      </body>
    </html>
  );
}
