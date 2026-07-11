import { GlassPanel } from "@/components/ui/glass-panel";
import { siteConfig } from "@/config/site";

const pillars = ["AI", "DESIGN", "DEVELOPMENT"];

export default function Home() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-[var(--space-page)] py-16">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(23,227,192,0.12),transparent_34%),linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:auto,48px_48px,48px_48px]" />
      <div className="absolute top-1/2 left-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--signature-gradient)] opacity-15 blur-3xl" />

      <GlassPanel
        aria-labelledby="foundation-title"
        className="relative z-10 w-full max-w-4xl"
      >
        <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-4">
            <p className="font-mono text-xs tracking-[0.32em] text-[var(--color-signal)] uppercase">
              Digital Universe Initializing
            </p>
            <div className="space-y-5">
              <h1
                id="foundation-title"
                className="font-heading text-5xl font-semibold tracking-[-0.06em] text-balance sm:text-7xl lg:text-8xl"
              >
                {siteConfig.name}
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-[var(--text-secondary)] sm:text-xl">
                {siteConfig.tagline}
              </p>
            </div>
          </div>

          <ul className="grid gap-3 sm:grid-cols-3" aria-label="Brand pillars">
            {pillars.map((pillar) => (
              <li key={pillar}>
                <a
                  href={`#${pillar.toLowerCase()}`}
                  className="block rounded-[var(--radius-control)] border border-[var(--glass-border)] px-5 py-3 text-center font-mono text-xs tracking-[0.28em] text-[var(--text-primary)] transition-colors duration-[var(--duration-standard)] ease-[var(--motion-ease)] hover:border-[var(--color-signal)] hover:text-[var(--color-signal)]"
                >
                  {pillar}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </GlassPanel>
    </main>
  );
}
