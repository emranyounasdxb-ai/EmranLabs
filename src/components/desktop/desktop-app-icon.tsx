"use client";

import type { DesktopApp } from "@/types/desktop";

type DesktopAppIconProps = {
  app: DesktopApp;
  active?: boolean;
  minimized?: boolean;
  compact?: boolean;
  onClick: () => void;
};

export function DesktopAppIcon({
  app,
  active = false,
  minimized = false,
  compact = false,
  onClick,
}: DesktopAppIconProps) {
  const Icon = app.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!app.enabled}
      aria-label={
        app.enabled
          ? `Open ${app.title}`
          : `${app.title} is planned for a later phase`
      }
      title={app.enabled ? app.title : `${app.title} · Later phase`}
      className="group relative flex min-h-12 min-w-12 flex-col items-center justify-center gap-2 rounded-2xl border border-[var(--glass-border)] bg-white/[0.055] p-3 text-[var(--text-primary)] shadow-[var(--shadow-panel)] backdrop-blur-xl transition duration-[var(--duration-standard)] ease-[var(--motion-ease)] hover:border-[rgba(23,227,192,0.42)] hover:bg-white/[0.085] disabled:cursor-not-allowed disabled:opacity-45"
    >
      <Icon aria-hidden="true" className={compact ? "size-5" : "size-6"} />
      {!compact && (
        <span className="max-w-20 text-center text-xs leading-tight">
          {app.shortLabel}
        </span>
      )}
      {(active || minimized) && (
        <span className="absolute bottom-1 h-1 w-5 rounded-full bg-[var(--color-signal)] opacity-80" />
      )}
      {!app.enabled && (
        <span className="absolute -top-2 rounded-full border border-[var(--glass-border)] bg-[var(--color-slate)] px-2 py-0.5 text-[0.625rem] text-[var(--text-secondary)]">
          Soon
        </span>
      )}
    </button>
  );
}
