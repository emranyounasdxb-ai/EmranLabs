"use client";

import { useEffect, useRef, useState } from "react";

import { useDeviceCapabilities } from "@/hooks/use-device-capabilities";
import { useDocumentVisibility } from "@/hooks/use-document-visibility";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

const DARK_BACKGROUND_VIDEO = "/videos/emranlabs-bg-dark.mp4";

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

      {canPlayVideo && videoReady && (
        <>
          <div className="absolute inset-0 bg-white/[0.025] backdrop-blur-[1.5px]" />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.055),rgba(255,255,255,0.012)_34%,rgba(255,255,255,0.025)_100%)]" />
          <div className="absolute inset-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),inset_0_0_90px_rgba(255,255,255,0.015)]" />
        </>
      )}

      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,5,10,0.34),rgba(2,5,10,0.08)_36%,rgba(2,4,9,0.14)_76%,rgba(2,4,10,0.28)),linear-gradient(180deg,rgba(2,4,9,0.08),transparent_48%,rgba(1,3,8,0.42))]" />
      <div className="desktop-grid absolute inset-0 opacity-[0.07]" />
      <div className="desktop-scanline absolute inset-0 opacity-[0.06]" />
      <div className="absolute inset-0 shadow-[inset_0_0_180px_rgba(0,0,0,0.42)]" />
    </div>
  );
}
