export type ProductionToolStatus =
  | "implemented"
  | "configuration-required"
  | "external-setup-required"
  | "active-after-deployment"
  | "not-applicable-to-code";

export type ProductionTool = {
  readonly name: string;
  readonly applicationCodeStatus: ProductionToolStatus;
  readonly externalSetupStatus: ProductionToolStatus;
  readonly requiredIdentifier: string;
  readonly configuredIn: string;
  readonly verificationMethod: string;
  readonly privacyRequirement: string;
  readonly responsibility: string;
};

export const productionTools = [
  {
    name: "Google Analytics 4",
    applicationCodeStatus: "not-applicable-to-code",
    externalSetupStatus: "external-setup-required",
    requiredIdentifier: "GA4 Measurement ID configured inside GTM only",
    configuredIn: "Google Tag Manager container",
    verificationMethod: "GA4 Realtime and Tag Assistant after consent",
    privacyRequirement:
      "Runs only after analytics consent through GTM; no Contact or EM AI content.",
    responsibility: "Privacy-aware aggregate traffic analytics.",
  },
  {
    name: "Google Tag Manager",
    applicationCodeStatus: "configuration-required",
    externalSetupStatus: "external-setup-required",
    requiredIdentifier: "NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID",
    configuredIn: "Application environment and GTM dashboard",
    verificationMethod: "Tag Assistant consent and container preview checks",
    privacyRequirement:
      "Loaded only after analytics consent; Consent Mode V2 keeps ad signals denied.",
    responsibility: "Consent-gated tag container for GA4 and Clarity.",
  },
  {
    name: "Google Search Console",
    applicationCodeStatus: "configuration-required",
    externalSetupStatus: "external-setup-required",
    requiredIdentifier:
      "Cloudflare DNS TXT token; optional NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION for URL-prefix fallback",
    configuredIn: "Cloudflare DNS or optional Next.js metadata verification",
    verificationMethod:
      "Domain verification, sitemap submission, URL inspection",
    privacyRequirement: "No tracking script and no credentials in code.",
    responsibility: "Search ownership verification and indexing diagnostics.",
  },
  {
    name: "Microsoft Clarity",
    applicationCodeStatus: "not-applicable-to-code",
    externalSetupStatus: "external-setup-required",
    requiredIdentifier: "Clarity project ID configured inside GTM",
    configuredIn: "Google Tag Manager and Clarity dashboard",
    verificationMethod:
      "Network checks confirm no collection before consent or with DNT",
    privacyRequirement:
      "Configured through GTM after consent with sensitive masking enabled.",
    responsibility: "Consent-gated behavior analytics and session insights.",
  },
  {
    name: "Cloudflare",
    applicationCodeStatus: "not-applicable-to-code",
    externalSetupStatus: "external-setup-required",
    requiredIdentifier: "Cloudflare zone and DNS records managed externally",
    configuredIn: "Cloudflare dashboard",
    verificationMethod: "Manual SSL, DNS, proxy, cache, and redirect checks",
    privacyRequirement:
      "No application credentials; API and user-specific responses are not cached.",
    responsibility: "Production DNS, proxy, SSL, and edge controls.",
  },
  {
    name: "Bing Webmaster Tools",
    applicationCodeStatus: "configuration-required",
    externalSetupStatus: "external-setup-required",
    requiredIdentifier:
      "Google import, DNS token, or optional NEXT_PUBLIC_BING_SITE_VERIFICATION",
    configuredIn:
      "Bing dashboard, Cloudflare DNS, or optional Next.js metadata verification",
    verificationMethod:
      "Property verification, sitemap submission, crawl coverage review",
    privacyRequirement:
      "No analytics tracking code and no credentials in code.",
    responsibility: "Bing indexing diagnostics and sitemap submission.",
  },
  {
    name: "Sentry",
    applicationCodeStatus: "implemented",
    externalSetupStatus: "configuration-required",
    requiredIdentifier:
      "NEXT_PUBLIC_SENTRY_DSN plus server-side SENTRY_ORG, SENTRY_PROJECT, SENTRY_AUTH_TOKEN when uploading source maps",
    configuredIn: "Application runtime/build environment and Sentry dashboard",
    verificationMethod:
      "Protected development test capture and dashboard event review",
    privacyRequirement:
      "sendDefaultPii=false; headers, request bodies, query strings, Contact, and EM AI content are stripped.",
    responsibility:
      "Application error monitoring for client, server, route-handler, and React failures.",
  },
  {
    name: "UptimeRobot",
    applicationCodeStatus: "implemented",
    externalSetupStatus: "external-setup-required",
    requiredIdentifier: "HTTPS monitor for https://emranlabs.com/api/health",
    configuredIn: "UptimeRobot dashboard",
    verificationMethod: "HTTP 200 from GET or HEAD with no-store headers",
    privacyRequirement:
      "Health endpoint exposes no secrets, versions, dependency state, or user data.",
    responsibility: "External uptime monitoring.",
  },
  {
    name: "Ahrefs Webmaster Tools",
    applicationCodeStatus: "not-applicable-to-code",
    externalSetupStatus: "external-setup-required",
    requiredIdentifier: "GSC import or Ahrefs-supported DNS/file verification",
    configuredIn: "Ahrefs dashboard and optional Cloudflare DNS",
    verificationMethod: "Site Audit, sitemap check, and crawlability review",
    privacyRequirement:
      "No Ahrefs API credentials or tracking script in application code.",
    responsibility: "SEO auditing and crawl issue discovery.",
  },
  {
    name: "Rich Schema / JSON-LD",
    applicationCodeStatus: "implemented",
    externalSetupStatus: "not-applicable-to-code",
    requiredIdentifier: "None",
    configuredIn: "Typed application metadata and JSON-LD components",
    verificationMethod:
      "Automated serialization checks plus Rich Results and Schema.org validators",
    privacyRequirement:
      "Factual portfolio data only; no user-generated Contact or EM AI content.",
    responsibility: "Structured search context for the portfolio.",
  },
] as const satisfies readonly ProductionTool[];
