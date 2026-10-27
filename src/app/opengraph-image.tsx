import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";

export const alt = "Emran Labs — Ideas, built into reality.";
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
        color: "#233c50",
        background:
          "linear-gradient(135deg, #e9f4fa 0%, #d8eaf4 56%, #a4d1e7 100%)",
        fontFamily: "Arial",
      }}
    >
      <div style={{ letterSpacing: 6, fontSize: 20, color: "#4584a9" }}>
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
          Ideas, built into reality.
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 28,
            color: "#728b9d",
            maxWidth: 930,
          }}
        >
          Emran Younas · Software Developer · AI & Automation · Dubai
        </div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 24,
          color: "#68879d",
        }}
      >
        <span>AI · Software · Web · Mobile · Cloud</span>
        <span>emranlabs.com</span>
      </div>
    </div>,
    size,
  );
}
