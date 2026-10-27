"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

export type Appearance = "light" | "dark" | "system";
function subscribe(callback: () => void) {
  const media = matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}
const snapshot = () => matchMedia("(prefers-color-scheme: dark)").matches;
const serverSnapshot = () => false;

export function useAppearance() {
  const systemDark = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const [appearance, setAppearance] = useState<Appearance>("system");
  useEffect(() => {
    try {
      const saved = localStorage.getItem("emranlabs-appearance");
      if (saved === "light" || saved === "dark" || saved === "system") {
        // Hydrate browser-only preferences after the matching server render.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setAppearance(saved);
      } else {
        const legacy = localStorage.getItem("emranlabs-dark");
        if (legacy !== null)
          setAppearance(legacy === "true" ? "dark" : "light");
      }
    } catch {}
  }, []);
  function changeAppearance(next: Appearance) {
    setAppearance(next);
    try {
      localStorage.setItem("emranlabs-appearance", next);
    } catch {}
  }
  return {
    appearance,
    changeAppearance,
    dark: appearance === "system" ? systemDark : appearance === "dark",
  };
}
