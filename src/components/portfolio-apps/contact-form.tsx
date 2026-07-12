"use client";

import { cloneElement, useRef, useState } from "react";
import { Send } from "lucide-react";
import { contactInquiryTypes, type ContactFormValues } from "@/types/contact";
import type { ApiErrorResponse } from "@/types/em-ai";
import { trackEvent } from "@/lib/analytics/client";

const CONTACT_STATUS_ID = "contact-status";

const initial = (): ContactFormValues => ({
  name: "",
  email: "",
  company: "",
  inquiryType: "Product development",
  subject: "",
  message: "",
  consent: false,
  website: "",
  startedAt: Date.now(),
});

async function readApiResponse(response: Response) {
  try {
    return (await response.json()) as
      { ok: true; message: string; requestId?: string } | ApiErrorResponse;
  } catch {
    return {
      ok: false as const,
      code: "INTERNAL_ERROR" as const,
      message:
        "The service returned an unexpected response. Please try again later.",
      requestId: "unavailable",
    };
  }
}

function mapContactMessage(data: ApiErrorResponse) {
  if (data.code === "RATE_LIMITED")
    return "Please wait before sending another inquiry.";
  if (data.code === "CONTACT_UNAVAILABLE")
    return "The inquiry form is temporarily unavailable. Please use the confirmed professional channels.";
  if (data.code === "VALIDATION_ERROR") return data.message;
  return "The inquiry could not be sent right now. Please try again later or use a confirmed channel.";
}

export function ContactForm() {
  const [values, setValues] = useState<ContactFormValues>(() => initial());
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState(
    "Use this form for professional product, software, AI, web, mobile, architecture, and collaboration inquiries.",
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fieldRefs = useRef<
    Record<
      string,
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null
    >
  >({});
  const summaryRef = useRef<HTMLDivElement>(null);

  function update<K extends keyof ContactFormValues>(
    key: K,
    value: ContactFormValues[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setErrors({});
    setStatus("Sending inquiry securely…");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await readApiResponse(response);
      if (data.ok) {
        setStatus(data.message);
        setValues(initial());
        trackEvent("contact_form_submitted");
      } else {
        const nextErrors = data.fieldErrors ?? {};
        setStatus(mapContactMessage(data));
        setErrors(nextErrors);
        setTimeout(() => {
          const first = Object.keys(nextErrors)[0];
          if (first && fieldRefs.current[first])
            fieldRefs.current[first]?.focus();
          else summaryRef.current?.focus();
        }, 0);
      }
    } catch {
      setStatus(
        "The inquiry could not be sent right now. Please try again later or use a confirmed channel.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-4 rounded-[var(--radius-panel)] border border-[var(--glass-border)] bg-white/[0.035] p-5"
      noValidate
    >
      <div>
        <h3 className="font-heading text-lg font-semibold text-[var(--text-primary)]">
          Secure inquiry form
        </h3>
        <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
          Do not include passwords, API keys, financial details, medical
          information, or other sensitive data.
        </p>
      </div>
      {Object.keys(errors).length > 0 && (
        <div
          ref={summaryRef}
          tabIndex={-1}
          className="rounded-2xl border border-red-200/50 bg-red-200/10 p-3 text-sm text-red-100"
          role="alert"
        >
          Please review the highlighted fields before sending.
        </div>
      )}
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={values.website}
        onChange={(e) => update("website", e.target.value)}
        className="hidden"
        aria-hidden="true"
      />
      <div className="grid gap-3 md:grid-cols-2">
        <Field
          id="contact-name"
          name="name"
          label="Name"
          required
          error={errors.name}
          inputRef={(node) => {
            fieldRefs.current.name = node;
          }}
        >
          <input
            required
            value={values.name}
            onChange={(e) => update("name", e.target.value)}
            maxLength={80}
          />
        </Field>
        <Field
          id="contact-email"
          name="email"
          label="Email"
          required
          error={errors.email}
          inputRef={(node) => {
            fieldRefs.current.email = node;
          }}
        >
          <input
            required
            type="email"
            value={values.email}
            onChange={(e) => update("email", e.target.value)}
            maxLength={254}
          />
        </Field>
      </div>
      <Field
        id="contact-company"
        name="company"
        label="Company or organization"
        help="Optional."
        error={errors.company}
        inputRef={(node) => {
          fieldRefs.current.company = node;
        }}
      >
        <input
          value={values.company}
          onChange={(e) => update("company", e.target.value)}
          maxLength={120}
        />
      </Field>
      <Field
        id="contact-inquiry-type"
        name="inquiryType"
        label="Inquiry type"
        required
        error={errors.inquiryType}
        inputRef={(node) => {
          fieldRefs.current.inquiryType = node;
        }}
      >
        <select
          value={values.inquiryType}
          onChange={(e) =>
            update(
              "inquiryType",
              e.target.value as ContactFormValues["inquiryType"],
            )
          }
        >
          {contactInquiryTypes.map((type) => (
            <option key={type}>{type}</option>
          ))}
        </select>
      </Field>
      <Field
        id="contact-subject"
        name="subject"
        label="Subject"
        required
        error={errors.subject}
        inputRef={(node) => {
          fieldRefs.current.subject = node;
        }}
      >
        <input
          required
          value={values.subject}
          onChange={(e) => update("subject", e.target.value)}
          maxLength={140}
        />
      </Field>
      <Field
        id="contact-message"
        name="message"
        label="Message"
        required
        error={errors.message}
        inputRef={(node) => {
          fieldRefs.current.message = node;
        }}
        textarea
      >
        <textarea
          required
          value={values.message}
          onChange={(e) => update("message", e.target.value)}
          maxLength={3000}
        />
      </Field>
      <div>
        <label
          htmlFor="contact-consent"
          className="flex gap-3 text-sm text-[var(--text-secondary)]"
        >
          <input
            id="contact-consent"
            ref={(node) => {
              fieldRefs.current.consent = node;
            }}
            type="checkbox"
            required
            checked={values.consent}
            onChange={(e) => update("consent", e.target.checked)}
            aria-invalid={Boolean(errors.consent)}
            aria-describedby={`contact-consent-help${errors.consent ? " contact-consent-error" : ""}`}
            className="mt-1 size-4"
          />
          <span>
            <span aria-hidden="true">*</span> I consent to EMRAN LABS receiving
            this inquiry by email and understand the configured mailbox will
            store the delivered message.
          </span>
        </label>
        <p
          id="contact-consent-help"
          className="mt-1 text-xs text-[var(--text-secondary)]"
        >
          Required to send the inquiry.
        </p>
        {errors.consent && (
          <p id="contact-consent-error" className="mt-1 text-xs text-red-200">
            Error: {errors.consent}
          </p>
        )}
      </div>
      <p
        id={CONTACT_STATUS_ID}
        aria-live="polite"
        className="text-xs leading-5 text-[var(--text-secondary)]"
      >
        {status}
      </p>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--color-signal)] px-5 py-2 text-sm font-semibold text-black disabled:opacity-50"
      >
        <Send className="size-4" />
        {pending ? "Sending…" : "Send inquiry"}
      </button>
    </form>
  );
}

function Field({
  id,
  name,
  label,
  help,
  error,
  required,
  children,
  inputRef,
  textarea = false,
}: {
  id: string;
  name: string;
  label: string;
  help?: string;
  error?: string;
  required?: boolean;
  children: React.ReactElement<Record<string, unknown>>;
  inputRef: (
    node: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null,
  ) => void;
  textarea?: boolean;
}) {
  const helpId = `${id}-help`;
  const errorId = `${id}-error`;
  const describedBy = [
    help ? helpId : null,
    error ? errorId : null,
    CONTACT_STATUS_ID,
  ]
    .filter(Boolean)
    .join(" ");
  const className = `w-full rounded-2xl border ${error ? "border-red-200/70" : "border-[var(--glass-border)]"} bg-white/[0.045] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[rgba(23,227,192,0.55)] ${textarea ? "min-h-32 resize-none" : ""}`;
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="text-sm font-medium text-[var(--text-primary)]"
      >
        {label} {required && <span aria-hidden="true">*</span>}
      </label>
      {required && <span className="sr-only">Required</span>}
      {help && (
        <p id={helpId} className="text-xs text-[var(--text-secondary)]">
          {help}
        </p>
      )}
      {cloneElement(children, {
        id,
        name,
        ref: inputRef,
        className,
        "aria-invalid": Boolean(error),
        "aria-describedby": describedBy || undefined,
      })}
      {error && (
        <p id={errorId} className="text-xs text-red-200">
          Error: {error}
        </p>
      )}
    </div>
  );
}
