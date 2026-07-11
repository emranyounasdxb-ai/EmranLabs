export function DesktopBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(23,227,192,0.16),transparent_30%),radial-gradient(circle_at_78%_10%,rgba(123,92,255,0.14),transparent_32%),linear-gradient(180deg,rgba(21,23,30,0.92),var(--color-void))]" />
      <div className="absolute inset-0 [background-image:linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] [background-size:48px_48px] opacity-35" />
      <div className="absolute right-[12%] bottom-[18%] h-56 w-56 rounded-full bg-[var(--signature-gradient)] opacity-10 blur-3xl" />
    </div>
  );
}
