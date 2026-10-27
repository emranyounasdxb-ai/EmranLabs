import Link from "next/link";
import type { ReactNode } from "react";
export function StandalonePage({ children }: { children: ReactNode }) {
  return (
    <main className="standalone-content">
      <nav className="standalone-nav" aria-label="Portfolio pages">
        <Link href="/">em. / Workspace</Link>
        <Link href="/about">About</Link>
        <Link href="/services">Services</Link>
        <Link href="/contact">Contact</Link>
        <Link href="/privacy">Privacy</Link>
      </nav>
      {children}
    </main>
  );
}
