import { notFound } from "next/navigation";
import { TrackingConsent } from "@/components/seo/tracking-consent";
import { getAnalyticsConfig } from "@/lib/analytics/config";

export const metadata = {
  title: "Consent preview — Emran Labs",
  robots: { index: false, follow: false },
};

export default function PrivacyPreview() {
  if (process.env.NODE_ENV !== "development") notFound();
  const config = getAnalyticsConfig();
  if (!config) notFound();
  return (
    <main
      style={{
        minHeight: "100dvh",
        background: "linear-gradient(145deg, #eef2f8, #f7f8fb 55%, #e9eff9)",
        padding: "48px 18px",
        fontFamily: "var(--font-body)",
        color: "#1d1d1f",
      }}
    >
      <div style={{ maxWidth: 460, margin: "0 auto 24px" }}>
        <p
          style={{
            fontSize: 11,
            letterSpacing: 1.5,
            color: "#596472",
            margin: "0 0 9px",
          }}
        >
          EMRAN LABS / LOCAL REVIEW
        </p>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 600,
            letterSpacing: -1,
            margin: "0 0 10px",
          }}
        >
          Your privacy. Your choice.
        </h1>
        <p style={{ fontSize: 13, lineHeight: 1.6, color: "#596472" }}>
          First-visit privacy controls. Saved choices keep the desktop clear;
          Settings can reopen this panel. Localhost never sends tracking events.
        </p>
      </div>
      <TrackingConsent config={config} inline />
    </main>
  );
}
