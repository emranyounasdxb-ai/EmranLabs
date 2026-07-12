"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="grid min-h-screen place-items-center bg-[var(--background-primary)] p-6 text-[var(--text-primary)]">
      <section className="max-w-xl rounded-[var(--radius-panel)] border border-[var(--glass-border)] bg-white/[0.045] p-8 shadow-[var(--shadow-panel)]">
        <p className="font-mono text-xs tracking-[0.22em] text-[var(--color-signal)] uppercase">
          System recovery
        </p>
        <h1 className="font-heading mt-3 text-3xl font-semibold">
          The desktop could not finish loading.
        </h1>
        <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
          No technical details or secrets are exposed here. Try reloading the
          EMRAN LABS desktop.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 rounded-full bg-[var(--color-signal)] px-5 py-2 text-sm font-semibold text-black"
        >
          Reload desktop
        </button>
      </section>
    </main>
  );
}
