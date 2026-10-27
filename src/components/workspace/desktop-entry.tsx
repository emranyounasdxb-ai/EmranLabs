"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BatteryFull, UserRound, Wifi } from "lucide-react";
import { enterWorkspace, useWorkspaceEntry } from "./entry-session";
import { useDesktopClock } from "./use-desktop-clock";
import styles from "./desktop-entry.module.css";

export function DesktopEntry({ children }: { children: ReactNode }) {
  const entered = useWorkspaceEntry();
  const [hydrated, setHydrated] = useState(false);
  const [phase, setPhase] = useState<"entry" | "welcome" | "leaving">("entry");
  const [name, setName] = useState("");
  const [greeting, setGreeting] = useState("");
  const [reduceMotion, setReduceMotion] = useState(false);
  const panel = useRef<HTMLElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const didEnter = useRef(false);
  const now = useDesktopClock();
  const time = now?.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const date = now?.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => {
      let preference = false;
      try {
        preference = localStorage.getItem("emranlabs-calm") === "true";
      } catch {}
      setReduceMotion(media.matches || preference);
    };
    const frame = requestAnimationFrame(() => {
      setHydrated(true);
      syncMotion();
    });
    media.addEventListener("change", syncMotion);
    return () => {
      cancelAnimationFrame(frame);
      media.removeEventListener("change", syncMotion);
    };
  }, []);

  useEffect(() => {
    if (!hydrated || entered) return;
    // Keep the phone keyboard closed until the visitor chooses the name field.
    if (matchMedia("(pointer: fine)").matches)
      input.current?.focus({ preventScroll: true });
    else panel.current?.focus({ preventScroll: true });
  }, [hydrated, entered]);

  useEffect(() => {
    if (phase === "entry" || entered) return;
    const timer = setTimeout(
      () => {
        if (phase === "welcome") setPhase("leaving");
        else {
          didEnter.current = true;
          enterWorkspace();
          setName("");
          setGreeting("");
        }
      },
      phase === "welcome" ? 1100 : reduceMotion ? 0 : 650,
    );
    return () => clearTimeout(timer);
  }, [phase, entered, reduceMotion]);

  useEffect(() => {
    if (!entered || !didEnter.current) return;
    const frame = requestAnimationFrame(() => {
      document
        .querySelector<HTMLButtonElement>(".mac-desktop .menu-bar button")
        ?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [entered]);

  function begin(guest = false) {
    if (!hydrated || phase !== "entry") return;
    const visitor = guest ? "" : name.trim().replace(/\s+/g, " ").slice(0, 40);
    setGreeting(visitor);
    setPhase("welcome");
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    begin();
  }

  return (
    <div
      className={styles.shell}
      data-entry-phase={entered ? "entered" : phase}
      data-calm={reduceMotion}
    >
      <div
        className={styles.desktop}
        inert={!entered}
        aria-hidden={!entered || undefined}
      >
        {children}
      </div>
      {!entered && (
        <section
          ref={panel}
          role="dialog"
          aria-modal="true"
          aria-label="Welcome to Emran Labs"
          aria-describedby="workspace-entry-description"
          tabIndex={-1}
          className={styles.screen}
          data-workspace-entry
          data-phase={phase}
          data-clarity-mask="true"
          onKeyDown={(event) => {
            if (event.key !== "Tab") return;
            const controls = Array.from(
              event.currentTarget.querySelectorAll<HTMLElement>(
                "input:not(:disabled), button:not(:disabled), a[href]",
              ),
            ).filter((element) => element.getClientRects().length);
            const first = controls[0],
              last = controls.at(-1);
            if (!first) {
              event.preventDefault();
              return;
            }
            if (
              event.shiftKey &&
              (document.activeElement === first ||
                document.activeElement === panel.current)
            ) {
              event.preventDefault();
              last?.focus();
            } else if (
              !event.shiftKey &&
              (document.activeElement === last ||
                document.activeElement === panel.current)
            ) {
              event.preventDefault();
              first.focus();
            }
          }}
        >
          <Image
            src="/images/emran-horizon.webp"
            alt=""
            fill
            sizes="100vw"
            preload
            quality={85}
            className={styles.wallpaper}
          />
          <div className={styles.shade} />
          <header className={styles.header}>
            <span className={styles.brand}>
              <b>em.</b>
              <span>Emran Labs</span>
            </span>
            <span className={styles.system} aria-hidden="true">
              <Wifi size={16} />
              <BatteryFull size={21} />
            </span>
          </header>
          <div className={styles.clock} aria-hidden="true">
            <p>{date || "Make yourself at home."}</p>
            <time>{time || "—:—"}</time>
          </div>
          <div className={styles.identity}>
            <div className={styles.avatar} aria-hidden="true">
              <UserRound size={40} strokeWidth={1.4} />
            </div>
            <h1>Emran Labs</h1>
            <p id="workspace-entry-description">
              A little curiosity. A world of possibilities.
            </p>
            <form
              onSubmit={submit}
              className={styles.form}
              aria-label="Enter the workspace"
            >
              <fieldset disabled={!hydrated || phase !== "entry"}>
                <div className={styles.nameField}>
                  <label className="sr-only" htmlFor="workspace-visitor-name">
                    Your name (optional)
                  </label>
                  <input
                    id="workspace-visitor-name"
                    ref={input}
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Your name"
                    maxLength={40}
                    autoComplete="off"
                    autoCapitalize="words"
                    spellCheck={false}
                    enterKeyHint="go"
                    data-clarity-mask="true"
                  />
                  <button type="submit" aria-label="Enter workspace">
                    <ArrowRight size={19} />
                  </button>
                </div>
                <button
                  type="button"
                  className={styles.guest}
                  onClick={() => begin(true)}
                >
                  Enter as Guest <ArrowRight size={14} />
                </button>
              </fieldset>
            </form>
            <p className={styles.hint}>
              Your name is optional. No account needed.
            </p>
          </div>
          <div
            className={styles.greeting}
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            {phase !== "entry" && (
              <>
                <span className={styles.welcomeMark} aria-hidden="true">
                  em.
                </span>
                <h2>
                  {greeting ? `Welcome, ${greeting}.` : "Welcome, guest."}
                </h2>
                <p>Make yourself at home.</p>
                <span className={styles.progress} aria-hidden="true">
                  <i />
                </span>
              </>
            )}
          </div>
          <footer className={styles.footer}>
            <span>Thoughtfully designed. Personally built.</span>
            <Link href="/privacy" prefetch={false}>
              Privacy
            </Link>
          </footer>
          <noscript>
            <div className={styles.fallback}>
              Explore Emran’s work:{" "}
              <Link href="/projects/edrive" prefetch={false}>
                Projects
              </Link>{" "}
              ·{" "}
              <Link href="/services" prefetch={false}>
                Services
              </Link>{" "}
              ·{" "}
              <Link href="/contact" prefetch={false}>
                Contact
              </Link>
            </div>
          </noscript>
        </section>
      )}
    </div>
  );
}
