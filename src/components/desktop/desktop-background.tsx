"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";

import { useDeviceCapabilities } from "@/hooks/use-device-capabilities";
import { useDocumentVisibility } from "@/hooks/use-document-visibility";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

const DARK_BACKGROUND_VIDEO = "/videos/emranlabs-bg-dark.mp4";

const WATER_DROPS = [
  { left: "7%", size: "13px", delay: "-2s", duration: "17s", drift: "18px", opacity: "0.34" },
  { left: "15%", size: "7px", delay: "-11s", duration: "20s", drift: "-10px", opacity: "0.27" },
  { left: "24%", size: "18px", delay: "-7s", duration: "24s", drift: "22px", opacity: "0.32" },
  { left: "32%", size: "9px", delay: "-15s", duration: "19s", drift: "-16px", opacity: "0.26" },
  { left: "40%", size: "15px", delay: "-5s", duration: "22s", drift: "12px", opacity: "0.31" },
  { left: "48%", size: "6px", delay: "-13s", duration: "18s", drift: "-8px", opacity: "0.24" },
  { left: "56%", size: "20px", delay: "-9s", duration: "26s", drift: "20px", opacity: "0.3" },
  { left: "63%", size: "10px", delay: "-3s", duration: "21s", drift: "-14px", opacity: "0.28" },
  { left: "70%", size: "8px", delay: "-17s", duration: "23s", drift: "10px", opacity: "0.25" },
  { left: "77%", size: "16px", delay: "-12s", duration: "25s", drift: "-18px", opacity: "0.31" },
  { left: "84%", size: "7px", delay: "-6s", duration: "18s", drift: "8px", opacity: "0.25" },
  { left: "91%", size: "12px", delay: "-19s", duration: "22s", drift: "-12px", opacity: "0.29" },
  { left: "19%", size: "5px", delay: "-4s", duration: "15s", drift: "6px", opacity: "0.22" },
  { left: "68%", size: "5px", delay: "-10s", duration: "16s", drift: "-6px", opacity: "0.22" },
] as const;

type WaterDropStyle = CSSProperties & {
  "--drop-left": string;
  "--drop-size": string;
  "--drop-delay": string;
  "--drop-duration": string;
  "--drop-drift": string;
  "--drop-opacity": string;
};

function StaticDesktopBackground() {
  return (
    <>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(18,164,146,0.16),transparent_34%),radial-gradient(circle_at_82%_8%,rgba(101,78,205,0.13),transparent_36%),linear-gradient(180deg,#11141d_0%,#080b12_52%,#03050a_100%)]" />
      <div className="desktop-grid absolute inset-0 opacity-[0.12]" />
      <div className="desktop-scanline absolute inset-0 opacity-[0.08]" />
      <div className="absolute top-[18%] left-[13%] h-px w-[42vw] rotate-[-16deg] bg-gradient-to-r from-transparent via-[rgba(38,188,168,0.18)] to-transparent" />
      <div className="absolute right-[10%] bottom-[12%] h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(91,76,183,0.08),transparent_70%)] blur-3xl" />
    </>
  );
}

function AnimatedWaterDrops() {
  return (
    <div className="video-water-drops absolute inset-0 overflow-hidden">
      <div className="video-condensation absolute inset-0" />
      {WATER_DROPS.map((drop) => {
        const style: WaterDropStyle = {
          "--drop-left": drop.left,
          "--drop-size": drop.size,
          "--drop-delay": drop.delay,
          "--drop-duration": drop.duration,
          "--drop-drift": drop.drift,
          "--drop-opacity": drop.opacity,
        };

        return (
          <span
            key={`${drop.left}-${drop.delay}`}
            className="video-water-drop"
            style={style}
          />
        );
      })}
    </div>
  );
}

export function DesktopBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);
  const reducedMotion = useReducedMotion();
  const documentVisible = useDocumentVisibility();
  const { desktopViewport, finePointer, saveData } = useDeviceCapabilities();

  const canPlayVideo =
    desktopViewport && finePointer && !reducedMotion && !saveData;

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !canPlayVideo) return;

    if (documentVisible) {
      void video.play().catch(() => {
        setVideoReady(false);
      });
    } else {
      video.pause();
    }
  }, [canPlayVideo, documentVisible]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden bg-[#05070d]"
    >
      <StaticDesktopBackground />

      {canPlayVideo && (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          disablePictureInPicture
          disableRemotePlayback
          tabIndex={-1}
          onCanPlay={() => setVideoReady(true)}
          onError={() => setVideoReady(false)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            videoReady ? "opacity-100" : "opacity-0"
          }`}
        >
          <source src={DARK_BACKGROUND_VIDEO} type="video/mp4" />
        </video>
      )}

      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,5,10,0.34),rgba(2,5,10,0.08)_36%,rgba(2,4,9,0.14)_76%,rgba(2,4,10,0.28)),linear-gradient(180deg,rgba(2,4,9,0.08),transparent_48%,rgba(1,3,8,0.42))]" />

      {canPlayVideo && videoReady && (
        <>
          <div className="absolute inset-0 bg-white/[0.008]" />
          <AnimatedWaterDrops />
        </>
      )}

      <div className="desktop-grid absolute inset-0 opacity-[0.07]" />
      <div className="desktop-scanline absolute inset-0 opacity-[0.06]" />
      <div className="absolute inset-0 shadow-[inset_0_0_180px_rgba(0,0,0,0.42)]" />
    </div>
  );
}
