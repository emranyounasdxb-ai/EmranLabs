import Link from "next/link";

export const metadata = { title: "404 — Desktop route unavailable" };

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-[var(--background-primary)] p-6 text-[var(--text-primary)]">
      <section className="max-w-xl rounded-[var(--radius-panel)] border border-[var(--glass-border)] bg-white/[0.045] p-8 text-center shadow-[var(--shadow-panel)]">
        <p className="font-mono text-xs tracking-[0.22em] text-[var(--color-signal)] uppercase">
          404
        </p>
        <h1 className="font-heading mt-3 text-3xl font-semibold">
          Desktop route unavailable
        </h1>
        <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
          This public route is not part of the EMRAN LABS desktop portfolio.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-full bg-[var(--color-signal)] px-5 py-2 text-sm font-semibold text-black"
        >
          Return to desktop
        </Link>
      </section>
    </main>
  );
}
