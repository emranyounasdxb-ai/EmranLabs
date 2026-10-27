"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Check } from "lucide-react";

export type MenuItem = {
  label: string;
  action?: () => void;
  shortcut?: string;
  checked?: boolean;
  disabled?: boolean;
  separator?: boolean;
};
export type MenuGroup = { label: string; items: MenuItem[] };

export function MenuPopover({
  label,
  items,
  x,
  y,
  onClose,
  onStep,
}: {
  label: string;
  items: MenuItem[];
  x: number;
  y: number;
  onClose: () => void;
  onStep?: (direction: number) => void;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const dismiss = useRef(onClose);
  useLayoutEffect(() => {
    dismiss.current = onClose;
  });
  useLayoutEffect(() => {
    const element = panel.current;
    if (!element) return;
    returnFocus.current = document.activeElement as HTMLElement | null;
    const bounds = element.getBoundingClientRect();
    element.style.left = `${Math.max(8, Math.min(x, innerWidth - bounds.width - 8))}px`;
    element.style.top = `${Math.max(34, Math.min(y, innerHeight - bounds.height - 12))}px`;
    element.querySelector<HTMLButtonElement>("button:not(:disabled)")?.focus();
  }, [label, x, y]);
  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (
        !panel.current?.contains(event.target as Node) &&
        !(event.target as Element).closest?.("[data-desktop-menu-trigger]")
      )
        dismiss.current();
    };
    document.addEventListener("pointerdown", outside);
    const resize = () => dismiss.current();
    window.addEventListener("resize", resize);
    return () => {
      document.removeEventListener("pointerdown", outside);
      window.removeEventListener("resize", resize);
    };
  }, []);
  return (
    <div
      ref={panel}
      role="menu"
      aria-label={label}
      className="desktop-popover"
      style={{ left: x, top: y }}
      onKeyDown={(event) => {
        const buttons = Array.from(
          panel.current?.querySelectorAll<HTMLButtonElement>(
            "button:not(:disabled)",
          ) ?? [],
        );
        const index = buttons.indexOf(
          document.activeElement as HTMLButtonElement,
        );
        if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
          event.preventDefault();
          const next =
            event.key === "Home"
              ? 0
              : event.key === "End"
                ? buttons.length - 1
                : (index +
                    (event.key === "ArrowDown" ? 1 : -1) +
                    buttons.length) %
                  buttons.length;
          buttons[next]?.focus();
        } else if (event.key === "Escape" || event.key === "Tab") {
          if (event.key === "Escape") event.preventDefault();
          event.stopPropagation();
          onClose();
          const trigger = document.querySelector<HTMLButtonElement>(
            `[data-desktop-menu-trigger="${label}"]`,
          );
          (trigger ?? returnFocus.current)?.focus();
        } else if (
          onStep &&
          (event.key === "ArrowLeft" || event.key === "ArrowRight")
        ) {
          event.preventDefault();
          onStep(event.key === "ArrowRight" ? 1 : -1);
        }
      }}
    >
      {items.map((item, index) =>
        item.separator ? (
          <div
            className="popover-separator"
            role="separator"
            key={`separator-${index}`}
          />
        ) : (
          <button
            role={item.checked === undefined ? "menuitem" : "menuitemcheckbox"}
            aria-checked={item.checked}
            disabled={item.disabled}
            tabIndex={-1}
            key={item.label}
            onPointerMove={(event) => {
              // Mouse and keyboard share one active row, including when the
              // pointer remains over a different row during arrow navigation.
              if (document.activeElement !== event.currentTarget)
                event.currentTarget.focus({ preventScroll: true });
            }}
            onClick={() => {
              onClose();
              item.action?.();
            }}
          >
            <span className="menu-check">
              {item.checked && <Check size={13} />}
            </span>
            <span>{item.label}</span>
            {item.shortcut && <kbd>{item.shortcut}</kbd>}
          </button>
        ),
      )}
    </div>
  );
}

export function DesktopMenuStrip({
  groups,
  onOpen,
}: {
  groups: MenuGroup[];
  onOpen: () => void;
}) {
  const [open, setOpen] = useState<{
    index: number;
    x: number;
    y: number;
  } | null>(null);
  const nav = useRef<HTMLElement>(null);
  function show(index: number) {
    const button = nav.current?.querySelectorAll<HTMLButtonElement>(
      "[data-desktop-menu-trigger]",
    )[index];
    if (!button) return;
    const rect = button.getBoundingClientRect();
    onOpen();
    setOpen({ index, x: rect.left - 7, y: rect.bottom + 5 });
  }
  return (
    <nav ref={nav} className="menu-left" aria-label="Desktop menu">
      {groups.map((group, index) => (
        <button
          key={group.label}
          data-desktop-menu-trigger={group.label}
          className={`${index === 0 ? "em-monogram" : index === 1 ? "menu-app" : "desktop-menu-item"} ${open?.index === index ? "menu-is-open" : ""}`}
          aria-label={index === 0 ? "EmranLabs menu" : group.label}
          aria-haspopup="menu"
          aria-expanded={open?.index === index}
          onClick={() => (open?.index === index ? setOpen(null) : show(index))}
          onPointerEnter={() => {
            if (open && open.index !== index) show(index);
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
              event.preventDefault();
              show(index);
            }
          }}
        >
          {index === 0 ? (
            <>
              em<span>.</span>
            </>
          ) : (
            group.label
          )}
        </button>
      ))}
      {open && (
        <MenuPopover
          key={open.index}
          label={groups[open.index].label}
          items={groups[open.index].items}
          x={open.x}
          y={open.y}
          onClose={() => setOpen(null)}
          onStep={(direction) =>
            show((open.index + direction + groups.length) % groups.length)
          }
        />
      )}
    </nav>
  );
}
