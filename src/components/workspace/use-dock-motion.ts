"use client";

import { useEffect, useRef } from "react";

/** One spring loop for the dock, with transform-only frames and no React rerenders. */
export function useDockMotion(
  reduceMotion: boolean,
  magnify = true,
  layoutKey = "",
) {
  const dockRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const dock = dockRef.current;
    if (!dock) return;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const pointer = matchMedia("(hover: hover) and (pointer: fine)");
    const items = Array.from(dock.querySelectorAll<HTMLElement>(".dock-item"));
    const states = items.map(() => ({ value: 0, velocity: 0, target: 0 }));
    const launches = new Map<HTMLElement, Animation>();
    let frame = 0;
    let last = 0;
    let centers: number[] = [];
    let pointerX: number | null = null;
    let dirty = true;
    function measure() {
      const dockLeft = dock!.getBoundingClientRect().left;
      centers = items.map((item) => {
        let left = item.offsetLeft;
        let parent = item.offsetParent as HTMLElement | null;
        while (parent && parent !== dock) {
          left += parent.offsetLeft;
          parent = parent.offsetParent as HTMLElement | null;
        }
        return dockLeft + left + item.offsetWidth / 2;
      });
      dirty = false;
    }
    function tick(now: number) {
      if (dirty && pointerX !== null) measure();
      if (pointerX !== null)
        states.forEach((state, i) => {
          const distance = Math.abs(pointerX! - centers[i]);
          state.target =
            distance < 112 ? (Math.cos((distance / 112) * Math.PI) + 1) / 2 : 0;
        });
      const step = Math.min((now - (last || now - 16.67)) / 1000, 0.025);
      last = now;
      let moving = false;
      states.forEach((state) => {
        state.velocity +=
          ((state.target - state.value) * 270 - state.velocity * 25) * step;
        state.value += state.velocity * step;
        if (
          Math.abs(state.target - state.value) > 0.001 ||
          Math.abs(state.velocity) > 0.005
        )
          moving = true;
        else {
          state.value = state.target;
          state.velocity = 0;
        }
      });
      const total = states.reduce((sum, state) => sum + state.value, 0);
      let prefix = 0;
      states.forEach((state, index) => {
        const influence = state.value;
        items[index].style.setProperty(
          "--dock-scale",
          String(1 + influence * 0.42),
        );
        items[index].style.setProperty("--dock-lift", `${-influence * 9}px`);
        // Expand neighbouring spacing without changing layout or the thin glass bar.
        const shift = (2 * prefix + influence - total) * 5.5;
        prefix += influence;
        items[index].style.setProperty("--dock-shift", `${shift}px`);
      });
      frame = moving ? requestAnimationFrame(tick) : 0;
      if (!moving) {
        last = 0;
        delete dock!.dataset.moving;
      }
    }
    function wake() {
      if (!frame) {
        dock!.dataset.moving = "true";
        frame = requestAnimationFrame(tick);
      }
    }
    function move(event: PointerEvent) {
      if (reduceMotion || !magnify || media.matches || !pointer.matches) return;
      pointerX = event.clientX;
      wake();
    }
    function leave() {
      pointerX = null;
      states.forEach((state) => {
        state.target = 0;
      });
      wake();
    }
    function resize() {
      dirty = true;
      if (pointerX !== null) wake();
    }
    function motionPreferenceChanged() {
      if (!media.matches) {
        leave();
        return;
      }
      cancelAnimationFrame(frame);
      frame = 0;
      last = 0;
      pointerX = null;
      delete dock!.dataset.moving;
      states.forEach((state) => {
        state.value = 0;
        state.target = 0;
        state.velocity = 0;
      });
      launches.forEach((animation) => animation.cancel());
      launches.clear();
      items.forEach((item) => {
        item.style.setProperty("--dock-scale", "1");
        item.style.setProperty("--dock-lift", "0px");
        item.style.setProperty("--dock-shift", "0px");
      });
    }
    const observer = new ResizeObserver(resize);
    observer.observe(dock);
    function launch(event: MouseEvent) {
      if (reduceMotion || media.matches) return;
      const button = (event.target as Element).closest("button.dock-item");
      const icon = button?.querySelector<HTMLElement>(".app-icon");
      if (!icon) return;
      launches.get(icon)?.cancel();
      const animation = icon.animate(
        [
          { translate: "0 0", offset: 0 },
          { translate: "0 -12px", offset: 0.36 },
          { translate: "0 0", offset: 0.7 },
          { translate: "0 -3px", offset: 0.86 },
          { translate: "0 0", offset: 1 },
        ],
        { id: "dock-launch", duration: 460, easing: "ease-out" },
      );
      launches.set(icon, animation);
      animation.onfinish = () => {
        if (launches.get(icon) === animation) launches.delete(icon);
      };
    }
    dock.addEventListener("pointermove", move);
    dock.addEventListener("pointerleave", leave);
    dock.addEventListener("click", launch);
    media.addEventListener("change", motionPreferenceChanged);
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", resize);
      delete dock.dataset.moving;
      dock.removeEventListener("pointermove", move);
      dock.removeEventListener("pointerleave", leave);
      dock.removeEventListener("click", launch);
      media.removeEventListener("change", motionPreferenceChanged);
      launches.forEach((animation) => animation.cancel());
      items.forEach((item) => {
        for (const name of ["--dock-scale", "--dock-lift", "--dock-shift"])
          item.style.removeProperty(name);
      });
    };
  }, [reduceMotion, magnify, layoutKey]);
  return dockRef;
}
