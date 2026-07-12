import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";

export const alt = "EMRAN LABS futuristic technology portfolio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        color: "white",
        background:
          "radial-gradient(circle at 25% 20%, rgba(23,227,192,.30), transparent 28%), radial-gradient(circle at 82% 66%, rgba(123,92,255,.28), transparent 32%), linear-gradient(135deg, #07080d 0%, #111520 56%, #050608 100%)",
        fontFamily: "Arial",
      }}
    >
      <div style={{ letterSpacing: 8, fontSize: 24, color: "#17e3c0" }}>
        {siteConfig.name}
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            fontSize: 74,
            fontWeight: 800,
            lineHeight: 1.02,
            maxWidth: 900,
          }}
        >
          Futuristic Technology Portfolio
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 28,
            color: "#c9d4df",
            maxWidth: 930,
          }}
        >
          {siteConfig.description}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 24,
          color: "#9fb0c1",
        }}
      >
        <span>AI · Software · Web · Mobile · Cloud</span>
        <span>emranlabs.com</span>
      </div>
    </div>,
    size,
  );
}
