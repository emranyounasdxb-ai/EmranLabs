type DesktopShortcutHintProps = {
  keys: string[];
};

export function DesktopShortcutHint({ keys }: DesktopShortcutHintProps) {
  return (
    <span
      className="hidden items-center gap-1 md:inline-flex"
      aria-hidden="true"
    >
      {keys.map((key) => (
        <kbd
          key={key}
          className="rounded-md border border-[var(--glass-border)] bg-white/[0.06] px-1.5 py-0.5 font-mono text-[0.65rem] text-[var(--text-secondary)]"
        >
          {key}
        </kbd>
      ))}
    </span>
  );
}
