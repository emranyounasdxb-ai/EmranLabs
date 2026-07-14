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
    <div className="relative h-full w-full overflow-hidden rounded-full border border-[rgba(107,190,225,0.22)] bg-[#030812] shadow-[0_0_90px_rgba(42,126,180,0.22)]">
      <div
        className="absolute inset-0 scale-[1.03] rounded-full opacity-90"
        style={{
          backgroundImage: "url('/textures/earth/earth-atmosphere.jpg')",
          backgroundPosition: "68% center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "205% 100%",
        }}
      />
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_72%_18%,rgba(218,244,255,0.18),transparent_28%),radial-gradient(circle_at_45%_46%,transparent_48%,rgba(0,5,13,0.88)_82%)]" />
      <div className="absolute inset-[-1%] rounded-full border border-[rgba(105,202,255,0.32)] shadow-[0_0_42px_rgba(73,163,219,0.3)]" />
      <div className="absolute inset-[-13%] rotate-[23deg] rounded-full border border-[rgba(101,160,205,0.13)]" />
      <div className="absolute inset-[-22%] rotate-[-18deg] rounded-full border border-[rgba(101,160,205,0.09)]" />
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
      <div className="absolute top-[2%] right-[-2%] hidden aspect-square w-[min(50vw,48rem)] translate-x-[calc(var(--desktop-depth-x)*-0.42)] translate-y-[calc(var(--desktop-depth-y)*-0.42)] lg:block">
        {canMountDigitalCore ? (
          <EmranDigitalCore className="h-full w-full opacity-100" />
        ) : (
          <StaticDigitalCore />
        )}
      </div>
      <div className="absolute right-[8%] bottom-[10%] h-72 w-72 translate-x-[calc(var(--desktop-depth-x)*0.6)] translate-y-[calc(var(--desktop-depth-y)*0.6)] rounded-full bg-[var(--signature-gradient)] opacity-[0.1] blur-3xl" />
      <div className="absolute top-[42%] left-[14%] h-px w-[38vw] rotate-[-18deg] bg-gradient-to-r from-transparent via-[rgba(23,227,192,0.28)] to-transparent opacity-60" />
    </div>
  );
}
