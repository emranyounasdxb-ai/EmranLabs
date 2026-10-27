"use client";

import {
  useImperativeHandle,
  useRef,
  useState,
  useEffect,
  useEffectEvent,
  useLayoutEffect,
  type ReactNode,
  type Ref,
} from "react";
import { useWindowFrame } from "./use-window-frame";
import type { AppName } from "./workspace-data";

type Geometry = ReturnType<typeof useWindowFrame>;
export type WindowApi = Pick<Geometry, "snap" | "resetWindow"> & {
  toggleMaximize: () => void;
  dismiss: (minimize: boolean) => void;
  restore: () => void;
};

export function ManagedWindow({
  id,
  title,
  active,
  minimized,
  order,
  calm,
  showSidebar,
  ref,
  onFocus,
  onDismiss,
  onMaximize,
  children,
}: {
  id: AppName;
  title: string;
  active: boolean;
  minimized: boolean;
  order: number;
  calm: boolean;
  showSidebar: boolean;
  ref: Ref<WindowApi>;
  onFocus: () => void;
  onDismiss: (minimize: boolean) => void;
  onMaximize: (value: boolean) => void;
  children: (
    geometry: Omit<Geometry, "windowRef"> & {
      dismiss: (minimize: boolean) => void;
    },
  ) => ReactNode;
}) {
  const { windowRef, ...geometry } = useWindowFrame(id);
  const dismissal = useRef<Animation | null>(null);
  const incarnation = useRef(0);
  const [initialOrder] = useState(order);
  const previousMinimized = useRef(minimized);
  const arrival = useRef<Animation | null>(null);
  const dismissalAction = useRef(onDismiss);
  useLayoutEffect(() => {
    dismissalAction.current = onDismiss;
  });
  const reportMaximize = useEffectEvent(onMaximize);
  useEffect(() => {
    reportMaximize(geometry.maximized);
  }, [geometry.maximized]);
  useEffect(
    () => () => {
      incarnation.current++;
      dismissal.current?.cancel();
      arrival.current?.cancel();
    },
    [],
  );
  useEffect(() => {
    const restoring = previousMinimized.current && !minimized;
    previousMinimized.current = minimized;
    if (
      !restoring ||
      calm ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const element = windowRef.current;
    if (!element) return;
    const r = element.getBoundingClientRect();
    const target = document
      .querySelector(`[data-dock-app="${id}"]`)
      ?.getBoundingClientRect();
    const x =
      target && target.width
        ? target.x + target.width / 2 - (r.x + r.width / 2)
        : 0;
    const y = target && target.width ? target.y - (r.y + r.height / 2) : 55;
    arrival.current?.cancel();
    arrival.current = element.animate(
      [
        {
          transform: `translateX(calc(-50% + ${x}px)) translateY(${y}px) scale(.06)`,
          opacity: 0,
        },
        { transform: "translateX(-50%) scale(1)", opacity: 1 },
      ],
      { duration: 380, easing: "cubic-bezier(.2,.8,.2,1)" },
    );
  }, [minimized, calm, id, windowRef]);
  function restore() {
    incarnation.current++;
    dismissal.current?.cancel();
    dismissal.current = null;
  }
  const toggleMaximize = () => {
    geometry.toggleMaximize();
  };
  const resetWindow = () => {
    geometry.resetWindow();
  };
  const snap: Geometry["snap"] = (side) => {
    geometry.snap(side);
  };
  async function dismiss(minimize: boolean) {
    if (dismissal.current) return;
    const element = windowRef.current;
    const token = ++incarnation.current;
    arrival.current?.cancel();
    if (
      element &&
      !calm &&
      !matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      const rect = element.getBoundingClientRect();
      const target = document
        .querySelector(`[data-dock-app="${id}"]`)
        ?.getBoundingClientRect();
      const x =
        target && target.width
          ? target.x + target.width / 2 - (rect.x + rect.width / 2)
          : 0;
      const y =
        target && target.width ? target.y - (rect.y + rect.height / 2) : 55;
      const animation = element.animate(
        [
          { transform: "translateX(-50%) scale(1)", opacity: 1 },
          {
            transform: minimize
              ? `translateX(calc(-50% + ${x}px)) translateY(${y}px) scale(.06)`
              : "translateX(-50%) scale(.97)",
            opacity: 0,
          },
        ],
        {
          duration: minimize ? 380 : 180,
          easing: "cubic-bezier(.2,.8,.2,1)",
          fill: "forwards",
        },
      );
      dismissal.current = animation;
      try {
        await animation.finished;
      } catch {
        return;
      }
      if (token !== incarnation.current) return;
      dismissalAction.current(minimize);
      animation.cancel();
      dismissal.current = null;
    } else dismissalAction.current(minimize);
  }
  useImperativeHandle(ref, () => ({
    toggleMaximize,
    resetWindow,
    snap,
    dismiss,
    restore,
  }));
  const offset =
    id === "projects"
      ? {}
      : {
          left: `calc(50% + ${Math.min(initialOrder, 4) * 24}px)`,
          top: `calc(11vh + ${Math.min(initialOrder, 4) * 22}px)`,
        };
  return (
    <section
      ref={windowRef}
      aria-label={title}
      data-window-app={id}
      data-window-active={active}
      hidden={minimized}
      onPointerDownCapture={onFocus}
      onFocusCapture={onFocus}
      className={`finder-window managed-window ${active ? "window-active" : "window-inactive"} ${id !== "projects" ? "utility-window" : ""} ${geometry.maximized ? "maximized" : ""} ${geometry.placed ? "placed" : ""} ${geometry.interacting ? "interacting" : ""} ${!showSidebar ? "sidebar-hidden" : ""}`}
      style={{
        ...(!geometry.placed && !geometry.maximized ? offset : {}),
        ...geometry.style,
        zIndex: order + 10,
      }}
    >
      {/* These callbacks read DOM refs only when invoked by user events.
          The render prop receives callbacks and state, never a DOM ref. */}
      {/* eslint-disable-next-line react-hooks/refs */}
      {children({ ...geometry, toggleMaximize, resetWindow, snap, dismiss })}
    </section>
  );
}
