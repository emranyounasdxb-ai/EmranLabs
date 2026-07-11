"use client";

import dynamic from "next/dynamic";

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
    <div className="relative h-full w-full rounded-full bg-[radial-gradient(circle,rgba(23,227,192,0.16),rgba(123,92,255,0.06)_42%,transparent_70%)]">
      <div className="absolute inset-[21%] rounded-full border border-[rgba(23,227,192,0.22)]" />
      <div className="absolute inset-[34%] rounded-full bg-[radial-gradient(circle,rgba(23,227,192,0.2),transparent_68%)]" />
      <div className="absolute top-1/2 left-[18%] h-px w-[64%] -translate-y-1/2 bg-gradient-to-r from-transparent via-[rgba(23,227,192,0.26)] to-transparent" />
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
      <div className="absolute top-[13%] right-[6%] hidden aspect-square w-[min(34vw,29rem)] translate-x-[calc(var(--desktop-depth-x)*-0.38)] translate-y-[calc(var(--desktop-depth-y)*-0.38)] lg:block">
        {canMountDigitalCore ? (
          <EmranDigitalCore className="h-full w-full opacity-75" />
        ) : (
          <StaticDigitalCore />
        )}
      </div>
      <div className="absolute right-[12%] bottom-[18%] h-56 w-56 translate-x-[calc(var(--desktop-depth-x)*0.6)] translate-y-[calc(var(--desktop-depth-y)*0.6)] rounded-full bg-[var(--signature-gradient)] opacity-10 blur-3xl" />
      <div className="absolute top-[42%] left-[14%] h-px w-[38vw] rotate-[-18deg] bg-gradient-to-r from-transparent via-[rgba(23,227,192,0.28)] to-transparent opacity-60" />
    </div>
  );
}
