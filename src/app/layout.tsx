import type { Metadata } from "next";
import { ConsentAwareGtm } from "@/components/analytics/consent-aware-gtm";
import { PortfolioJsonLd } from "@/components/seo/json-ld";
import { siteConfig } from "@/config/site";
import { getSiteVerification } from "@/lib/metadata/site-verification";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.brandName }],
  verification: getSiteVerification(),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <PortfolioJsonLd />
        <ConsentAwareGtm />
      </body>
    </html>
  );
}
