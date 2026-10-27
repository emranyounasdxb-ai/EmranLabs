"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowUpRight, Check, Copy, Mail } from "lucide-react";
import { projects, socialLinks, socialLabels } from "./workspace-data";
import { workspaceTools } from "./workspace-tools";
import { confirmationFeedback } from "@/lib/email/delivery-flow";
import { ContactChannels } from "./contact-channels";
import { getService } from "./service-catalog";
import { trackEvent } from "@/lib/analytics/client";

export const contactEmail = "helo@emranlabs.com";
export type EnquiryContext = {
  project?: string;
  tool?: string;
  service?: string;
};
const services = {
  "Website or web application": "Web application",
  "Business workflow or automation": "SaaS or business automation",
  "Cloud & IT project": "Architecture or technical consultation",
  "Design, video or 3D project": "Product development",
  "Something else": "Other",
} as const;

export function ContactPanel({ context }: { context?: EnquiryContext }) {
  const [copied, setCopied] = useState("");
  const [urlContext, setUrlContext] = useState<EnquiryContext>({});
  const [available, setAvailable] = useState<boolean | null>(null);
  const [status, setStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");
  const [feedback, setFeedback] = useState("");
  const [draft, setDraft] = useState<{ subject: string; body: string } | null>(
    null,
  );
  const startedAt = useRef(0);
  const sending = useRef(false);
  const activeContext = context ?? urlContext;
  const selectedService = getService(activeContext.service);
  useEffect(() => {
    if (sending.current) return;
    setDraft(null);
    setStatus("idle");
    setFeedback("");
  }, [activeContext.project, activeContext.tool, activeContext.service]);
  useEffect(() => {
    startedAt.current = Date.now();
    if (!context) {
      const params = new URLSearchParams(location.search);
      // Read browser-only URL context once after the SSR form hydrates.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUrlContext({
        service: getService(params.get("service") ?? undefined)?.id,
        project: projects.find(
          (project) => project.id === params.get("project"),
        )?.name,
        tool: workspaceTools.find(
          (tool) => tool.collection === params.get("tool"),
        )?.collection,
      });
    }
    const controller = new AbortController();
    fetch("/api/contact", {
      signal: AbortSignal.any([controller.signal, AbortSignal.timeout(6000)]),
      cache: "no-store",
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => setAvailable(data?.available === true))
      .catch(() => {
        if (!controller.signal.aborted) setAvailable(false);
      });
    return () => controller.abort();
    // Enquiry context can change without discarding a message in progress.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  async function copy(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
    } catch {
      setCopied("Copy isn’t available. Select the text to copy it.");
    }
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending.current) return;
    const form = new FormData(event.currentTarget);
    const value = (key: string) => String(form.get(key) ?? "").trim();
    const name = value("name"),
      email = value("email"),
      message = value("message");
    const service = value("service") as keyof typeof services;
    const budget = value("budget"),
      timeframe = value("timeframe");
    const subject = (service + " enquiry from " + name).slice(0, 140);
    const contextLines = [
      activeContext.project && "Reference project: " + activeContext.project,
      activeContext.tool && "Tool / collection: " + activeContext.tool,
      selectedService && "Service focus: " + selectedService.collection,
      budget && "Budget: " + budget,
      timeframe && "Timeframe: " + timeframe,
    ].filter(Boolean);
    const body = [
      "Hi Emran,",
      "",
      message,
      "",
      "Service: " + service,
      ...contextLines,
      "Name: " + name,
      "Reply to: " + email,
    ].join("\n");
    setDraft({ subject, body });
    setCopied("");
    if (!available) {
      setStatus("idle");
      setFeedback("");
      return;
    }
    sending.current = true;
    setStatus("sending");
    setFeedback("");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(20000),
        body: JSON.stringify({
          name,
          email,
          inquiryType: services[service] ?? "Other",
          subject,
          message,
          consent: form.get("consent") === "on",
          website: value("website"),
          startedAt: startedAt.current,
          budget: budget || undefined,
          timeframe: timeframe || undefined,
          project: activeContext.project,
          tool: activeContext.tool,
          service: activeContext.service,
        }),
      });
      const result = await response.json();
      if (response.ok && result.ok === true) {
        trackEvent("generate_lead", {
          project: projects.find(
            (project) => project.name === activeContext.project,
          )?.id,
          service: selectedService?.id,
        });
        setStatus("success");
        setFeedback(
          result.confirmation === "sent" ||
            result.confirmation === "failed" ||
            result.confirmation === "suppressed"
            ? confirmationFeedback(result.confirmation)
            : "Your enquiry has been sent. I’ll reply to the email address you provided.",
        );
        setDraft(null);
      } else {
        setStatus("error");
        const code = result.error?.code ?? result.code;
        setFeedback(
          code === "RATE_LIMITED"
            ? "Please wait before trying again. You can also use the email draft below."
            : code === "CONTACT_UNAVAILABLE"
              ? "Website delivery is unavailable. Nothing was sent. Use the email draft below."
              : code === "VALIDATION_ERROR"
                ? "Please check your details and allow a few seconds before sending again."
                : "Your enquiry could not be sent. Your message is still here; try again later or use the email draft below.",
        );
      }
    } catch {
      setStatus("error");
      setFeedback(
        "Delivery could not be confirmed. Your message is still here. Check before resending, or use the email draft below.",
      );
    } finally {
      sending.current = false;
    }
  }
  return (
    <article className="contact-content contact-panel">
      <span className="eyebrow">LET’S BUILD SOMETHING USEFUL</span>
      <h1>
        Work with me<span>.</span>
      </h1>
      <p>
        I’m Emran, an independent designer and developer. Tell me what you’re
        working on, what needs to improve, and where you’d like to go.
      </p>
      <ContactChannels
        project={activeContext.project}
        service={activeContext.service}
      />
      <div className="contact-form-heading">
        <h2>Prefer to write it down?</h2>
        <p>Send a brief, and I’ll reply by email.</p>
      </div>
      <div className="email-card">
        <Mail size={21} />
        <a
          href={`mailto:${contactEmail}`}
          onClick={() =>
            trackEvent("contact_channel_clicked", {
              channel: "email",
              service: selectedService?.id,
            })
          }
        >
          {contactEmail}
        </a>
        <button
          className="icon-button"
          onClick={() => copy(contactEmail, "Email copied.")}
          aria-label="Copy email address"
        >
          <Copy size={16} />
        </button>
      </div>
      <form
        className="enquiry-form"
        onSubmit={submit}
        onChange={() => {
          if (status !== "sending") {
            setDraft(null);
            setStatus("idle");
            setFeedback("");
          }
        }}
      >
        {(activeContext.project || activeContext.tool || selectedService) && (
          <div className="enquiry-context">
            <span>Enquiry about</span>
            <strong>
              {[
                activeContext.project,
                activeContext.tool,
                selectedService?.collection,
              ]
                .filter(Boolean)
                .join(" · ")}
            </strong>
          </div>
        )}
        <fieldset disabled={status === "sending"} className="enquiry-fields">
          <div className="form-pair">
            <label>
              Your name
              <input
                name="name"
                autoComplete="name"
                required
                minLength={2}
                maxLength={80}
                placeholder="Your name"
              />
            </label>
            <label>
              Email address
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                maxLength={254}
                placeholder="you@company.com"
              />
            </label>
          </div>
          <label>
            What do you have in mind?
            <select
              name="service"
              key={selectedService?.id ?? activeContext.tool ?? "default"}
              defaultValue={
                selectedService?.enquiry ??
                ([
                  "Figma",
                  "Photoshop",
                  "Illustrator",
                  "Premiere Pro",
                  "After Effects",
                  "Blender",
                  "Unreal Engine",
                  "Cinema 4D",
                ].includes(activeContext.tool ?? "")
                  ? "Design, video or 3D project"
                  : activeContext.tool === "Python"
                    ? "Business workflow or automation"
                    : "Website or web application")
              }
            >
              {Object.keys(services).map((service) => (
                <option key={service}>{service}</option>
              ))}
            </select>
          </label>
          <details className="optional-project-details">
            <summary>
              Project details <span>Budget & timeframe · optional</span>
            </summary>
            <div className="form-pair">
              <label>
                Budget <span className="optional-label">(optional)</span>
                <select name="budget" defaultValue="">
                  <option value="">Let’s discuss</option>
                  <option>Under USD 1,000</option>
                  <option>USD 1,000–5,000</option>
                  <option>USD 5,000–10,000</option>
                  <option>USD 10,000+</option>
                </select>
              </label>
              <label>
                Timeframe <span className="optional-label">(optional)</span>
                <select name="timeframe" defaultValue="">
                  <option value="">Flexible</option>
                  <option>Within a month</option>
                  <option>1–3 months</option>
                  <option>3+ months</option>
                </select>
              </label>
            </div>
          </details>
          <label>
            A little about your project
            <textarea
              name="message"
              required
              minLength={20}
              maxLength={3000}
              rows={4}
              placeholder="What are you building, and what would a good result look like?"
            />
          </label>
          <label className="enquiry-honeypot" aria-hidden="true">
            Website
            <input name="website" tabIndex={-1} autoComplete="off" />
          </label>
          <label className="enquiry-consent">
            <input name="consent" type="checkbox" required />
            You may use these details to reply to my enquiry.
          </label>
          <button
            type="submit"
            className="primary-button"
            disabled={available === null || status === "success"}
          >
            {status === "sending"
              ? "Sending…"
              : status === "success"
                ? "Enquiry sent"
                : available === null
                  ? "Checking delivery…"
                  : available
                    ? "Send enquiry"
                    : "Prepare enquiry"}{" "}
            <ArrowUpRight size={15} />
          </button>
        </fieldset>
        <p className="form-hint">
          {available === null
            ? "Checking website email delivery."
            : available
              ? "Send directly to Emran. Your details are used to respond to this enquiry."
              : "Website delivery isn’t connected yet. Prepare your message and send it from your email app."}
        </p>
      </form>
      {feedback && (
        <p
          className={`enquiry-feedback ${status}`}
          role={status === "error" ? "alert" : "status"}
        >
          {feedback}
        </p>
      )}
      {draft && status !== "sending" && (
        <section
          className="enquiry-preview"
          aria-label="Enquiry preview"
          aria-live="polite"
        >
          <h2>
            {status === "error"
              ? "Your email fallback"
              : "Your enquiry is ready"}
          </h2>
          <strong>{draft.subject}</strong>
          <pre>{draft.body}</pre>
          <div className="project-actions">
            <a
              className="primary-button"
              href={`mailto:${contactEmail}?subject=${encodeURIComponent(draft.subject)}&body=${encodeURIComponent(draft.body)}`}
            >
              Open email draft <Mail size={15} />
            </a>
            <button
              className="secondary-button"
              onClick={() =>
                copy(
                  `To: ${contactEmail}\nSubject: ${draft.subject}\n\n${draft.body}`,
                  "Enquiry copied.",
                )
              }
            >
              Copy enquiry <Copy size={15} />
            </button>
          </div>
          <p className="form-hint">
            Opening this draft does not send it. Review it in your email app,
            then send when ready.
          </p>
        </section>
      )}
      <div className="contact-secondary">
        {Object.entries(socialLinks).map(([id, href]) => (
          <a key={id} href={href} target="_blank" rel="noreferrer">
            {socialLabels[id]} <ArrowUpRight size={14} />
          </a>
        ))}
        <span>Dubai · GST (UTC+4)</span>
      </div>
      <p role="status" className="copy-status">
        {copied && (
          <>
            <Check size={13} /> {copied}
          </>
        )}
      </p>
    </article>
  );
}
