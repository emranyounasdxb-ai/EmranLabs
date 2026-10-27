"use client";

import { useEffect, useState } from "react";

export function useDocumentVisibility() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const updateVisibility = () =>
      setVisible(document.visibilityState === "visible");
    updateVisibility();
    document.addEventListener("visibilitychange", updateVisibility);

    return () =>
      document.removeEventListener("visibilitychange", updateVisibility);
  }, []);

  return visible;
}
