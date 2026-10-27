"use client";

import type { DesktopCommand } from "@/types/desktop";

type DesktopCommandItemProps = {
  command: DesktopCommand;
  active: boolean;
  disabled: boolean;
  onSelect: () => void;
  onPointerMove: () => void;
};

export function DesktopCommandItem({
  command,
  active,
  disabled,
  onSelect,
  onPointerMove,
}: DesktopCommandItemProps) {
  const Icon = command.icon;

  return (
    <button
      type="button"
      role="option"
      aria-selected={active}
      aria-disabled={disabled}
      disabled={disabled}
      onClick={onSelect}
      onPointerMove={onPointerMove}
      className="flex min-h-14 w-full items-center gap-3 rounded-2xl border border-transparent px-3 py-2 text-left transition duration-[var(--duration-standard)] ease-[var(--motion-ease)] hover:border-[var(--glass-border)] hover:bg-white/[0.055] disabled:cursor-not-allowed disabled:opacity-45 data-[active=true]:border-[rgba(23,227,192,0.42)] data-[active=true]:bg-white/[0.085]"
      data-active={active ? "true" : "false"}
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-[var(--glass-border)] bg-white/[0.055] text-[var(--text-primary)]">
        <Icon aria-hidden="true" className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-[var(--text-primary)]">
          {command.label}
        </span>
        {command.description && (
          <span className="block truncate text-xs text-[var(--text-secondary)]">
            {command.description}
          </span>
        )}
      </span>
    </button>
  );
}
