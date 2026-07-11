"use client";

import { useEffect, useState } from "react";

type DeviceCapabilities = {
  desktopViewport: boolean;
  finePointer: boolean;
  saveData: boolean;
};

const getSaveDataPreference = () => {
  const connection = (
    navigator as Navigator & {
      connection?: { saveData?: boolean };
    }
  ).connection;

  return Boolean(connection?.saveData);
};

export function useDeviceCapabilities() {
  const [capabilities, setCapabilities] = useState<DeviceCapabilities>({
    desktopViewport: false,
    finePointer: false,
    saveData: false,
  });

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 1024px)");
    const pointerQuery = window.matchMedia("(pointer: fine)");
    const connection = (
      navigator as Navigator & {
        connection?: EventTarget & { saveData?: boolean };
      }
    ).connection;

    const updateCapabilities = () => {
      setCapabilities({
        desktopViewport: desktopQuery.matches,
        finePointer: pointerQuery.matches,
        saveData: getSaveDataPreference(),
      });
    };

    updateCapabilities();
    desktopQuery.addEventListener("change", updateCapabilities);
    pointerQuery.addEventListener("change", updateCapabilities);
    connection?.addEventListener?.("change", updateCapabilities);

    return () => {
      desktopQuery.removeEventListener("change", updateCapabilities);
      pointerQuery.removeEventListener("change", updateCapabilities);
      connection?.removeEventListener?.("change", updateCapabilities);
    };
  }, []);

  return capabilities;
}
