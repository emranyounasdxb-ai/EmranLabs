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
    loading: () => <StaticCinematicWorld />,
  },
);

function StaticCinematicWorld() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#040711]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_17%_15%,rgba(20,172,157,0.18),transparent_32%),radial-gradient(circle_at_78%_14%,rgba(105,78,214,0.17),transparent_34%),linear-gradient(180deg,#10141f_0%,#060912_54%,#02040a_100%)]" />
      <div className="absolute top-[11%] right-[7%] aspect-square w-[min(30vw,29rem)]">
        <div className="absolute inset-[-18%] rounded-full bg-[radial-gradient(circle,rgba(53,152,204,0.13),transparent_68%)] blur-2xl" />
        <div className="relative h-full w-full overflow-hidden rounded-full bg-[#020711] shadow-[0_0_70px_rgba(36,115,162,0.2)]">
          <div
            className="absolute inset-0 scale-[1.015] rounded-full opacity-90"
            style={{
              backgroundImage: "url('/textures/earth/earth-atmosphere.jpg')",
              backgroundPosition: "68% center",
              backgroundRepeat: "no-repeat",
              backgroundSize: "205% 100%",
            }}
          />
          <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_78%_18%,rgba(223,244,255,0.1),transparent_26%),radial-gradient(circle_at_34%_52%,transparent_44%,rgba(0,3,10,0.86)_84%)]" />
          <div className="absolute inset-[-0.6%] rounded-full border border-[rgba(98,190,229,0.2)] shadow-[0_0_24px_rgba(73,163,219,0.16)]" />
        </div>
        <div className="absolute inset-[-22%] rotate-[19deg] rounded-full border border-[rgba(112,160,197,0.06)]" />
        <div className="absolute inset-[-34%] rotate-[-26deg] rounded-full border border-[rgba(112,160,197,0.045)]" />
      </div>
      <div className="absolute top-[22%] left-[12%] h-64 w-[38vw] rotate-[-14deg] bg-[radial-gradient(ellipse,rgba(33,142,139,0.12),transparent_66%)] blur-2xl" />
      <div className="absolute inset-0 opacity-35 [background-image:radial-gradient(rgba(159,213,235,0.55)_0.65px,transparent_0.65px)] [background-size:42px_42px]" />
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
      className="pointer-events-none absolute inset-0 overflow-hidden bg-[#040711]"
    >
      {canMountDigitalCore ? (
        <EmranDigitalCore className="absolute inset-0 h-full w-full opacity-100" />
      ) : (
        <StaticCinematicWorld />
      )}

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(23,227,192,0.1),transparent_33%),radial-gradient(circle_at_78%_8%,rgba(123,92,255,0.08),transparent_34%)]" />
      <div className="desktop-grid absolute inset-0 opacity-[0.16]" />
      <div className="desktop-scanline absolute inset-0 opacity-[0.16]" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,5,10,0.08),transparent_36%,transparent_72%,rgba(2,4,10,0.14)),linear-gradient(180deg,rgba(2,4,9,0.02),transparent_58%,rgba(1,3,8,0.38))]" />
      <div className="absolute inset-0 shadow-[inset_0_0_180px_rgba(0,0,0,0.36)]" />
    </div>
  );
}
