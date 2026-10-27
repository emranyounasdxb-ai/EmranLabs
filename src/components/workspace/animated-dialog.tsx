"use client";

import {
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEventHandler,
  type ReactNode,
  type CSSProperties,
} from "react";

/** Keep the modal and its content present through exit, including Escape. */
export function AnimatedDialog({
  open,
  onClose,
  label,
  className,
  children,
  onKeyDown,
  style,
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  className: string;
  children: ReactNode;
  onKeyDown?: KeyboardEventHandler<HTMLDialogElement>;
  style?: CSSProperties;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [retained, setRetained] = useState<ReactNode>(null);

  useLayoutEffect(() => {
    // Snapshot the committed content before native dialog exit animation.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (open) setRetained(children);
  }, [open, children]);

  useLayoutEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open) {
      delete element.dataset.closing;
      if (!element.open) element.showModal();
      return;
    }
    if (!element.open) return;
    let finished = false;
    const timeout = setTimeout(() => finish(), 220);
    const finish = () => {
      if (finished) return;
      finished = true;
      clearTimeout(timeout);
      element.close();
      delete element.dataset.closing;
      setRetained(null);
    };
    if (
      element.closest(".calm") ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      finish();
      return;
    }
    element.dataset.closing = "true";
    const ended = (event: AnimationEvent) => {
      if (event.target === element && event.animationName === "dialog-leave")
        finish();
    };
    element.addEventListener("animationend", ended);
    // A fallback also releases the modal if animation events are suppressed.
    return () => {
      clearTimeout(timeout);
      element.removeEventListener("animationend", ended);
      delete element.dataset.closing;
    };
  }, [open]);

  return (
    <dialog
      ref={dialog}
      className={className}
      style={style}
      aria-label={label}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClose={() => {
        if (!dialog.current?.open) onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      onKeyDown={onKeyDown}
    >
      {open ? children : retained}
    </dialog>
  );
}
