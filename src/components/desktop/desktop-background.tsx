"use client";

import dynamic from "next/dynamic";

import { WORLD_MAP_PATH } from "@/data/world-map-path";
import { useDeviceCapabilities } from "@/hooks/use-device-capabilities";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

const EmranDigitalCore = dynamic(
  () =>
    import("@/components/three/emran-digital-core").then(
      (module) => module.EmranDigitalCore,
    ),
  {
    ssr: false,
    loading: () => <StaticDigitalCore />,
  },
);

function StaticDigitalCore() {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-full border border-[rgba(80,238,220,0.2)] bg-[#06111d] shadow-[0_0_70px_rgba(23,227,192,0.14)]">
      <svg
        aria-hidden="true"
        viewBox="0 0 2048 1024"
        className="absolute inset-[2%] h-[96%] w-[96%] opacity-70"
      >
        <path
          d={WORLD_MAP_PATH}
          fill="#0b3f4d"
          fillRule="evenodd"
          stroke="#51f4de"
          strokeWidth="3"
        />
      </svg>
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_34%_26%,rgba(107,246,224,0.18),transparent_36%),radial-gradient(circle,transparent_54%,rgba(3,8,18,0.72)_78%)]" />
      <div className="absolute inset-[-8%] rounded-full border border-[rgba(23,227,192,0.18)]" />
      <div className="absolute inset-[-17%] rotate-[28deg] rounded-full border border-[rgba(123,92,255,0.18)]" />
    </div>
  );
}

export function DesktopBackground() {
  const reducedMotion = useReducedMotion();
  const { desktopViewport, finePointer, saveData } = useDeviceCapabilities();
  const canMountDigitalCore =
    desktopViewport && finePointer && !reducedMotion && !saveData;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(23,227,192,0.18),transparent_30%),radial-gradient(circle_at_78%_10%,rgba(123,92,255,0.14),transparent_32%),linear-gradient(180deg,rgba(21,23,30,0.94),var(--color-void))]" />
      <div className="desktop-atmosphere absolute inset-[-8%] opacity-80" />
      <div className="desktop-grid absolute inset-0 opacity-35" />
      <div className="desktop-scanline absolute inset-0 opacity-30" />
      <div className="absolute top-[5%] right-[-1%] hidden aspect-square w-[min(46vw,43rem)] translate-x-[calc(var(--desktop-depth-x)*-0.42)] translate-y-[calc(var(--desktop-depth-y)*-0.42)] lg:block">
        {canMountDigitalCore ? (
          <EmranDigitalCore className="h-full w-full opacity-95" />
        ) : (
          <StaticDigitalCore />
        )}
      </div>
      <div className="absolute right-[8%] bottom-[10%] h-72 w-72 translate-x-[calc(var(--desktop-depth-x)*0.6)] translate-y-[calc(var(--desktop-depth-y)*0.6)] rounded-full bg-[var(--signature-gradient)] opacity-[0.14] blur-3xl" />
      <div className="absolute top-[42%] left-[14%] h-px w-[38vw] rotate-[-18deg] bg-gradient-to-r from-transparent via-[rgba(23,227,192,0.28)] to-transparent opacity-60" />
    </div>
  );
}
