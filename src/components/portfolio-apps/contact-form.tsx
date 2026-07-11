"use client";

import { useMemo, useState } from "react";
import { Send } from "lucide-react";
import { contactInquiryTypes, type ContactFormValues } from "@/types/contact";
import type { ApiErrorResponse } from "@/types/em-ai";

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

export function ContactForm() {
  const [values, setValues] = useState<ContactFormValues>(() => initial());
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState(
    "Use this form for professional product, software, AI, web, mobile, architecture, and collaboration inquiries.",
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const describedBy = useMemo(() => "contact-status", []);
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
      const data = (await response.json()) as
        { ok: true; message: string } | ApiErrorResponse;
      if (data.ok) {
        setStatus(data.message);
        setValues(initial());
      } else {
        setStatus(data.message);
        setErrors(data.fieldErrors ?? {});
      }
    } catch {
      setStatus(
        "The inquiry could not be sent right now. Please try again later or use a confirmed channel.",
      );
    } finally {
      setPending(false);
    }
  }
  const field =
    "w-full rounded-2xl border border-[var(--glass-border)] bg-white/[0.045] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[rgba(23,227,192,0.55)]";
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
        <Field label="Name" error={errors.name}>
          <input
            className={field}
            required
            value={values.name}
            onChange={(e) => update("name", e.target.value)}
            maxLength={80}
          />
        </Field>
        <Field label="Email" error={errors.email}>
          <input
            className={field}
            required
            type="email"
            value={values.email}
            onChange={(e) => update("email", e.target.value)}
            maxLength={254}
          />
        </Field>
      </div>
      <Field label="Company or organization (optional)" error={errors.company}>
        <input
          className={field}
          value={values.company}
          onChange={(e) => update("company", e.target.value)}
          maxLength={120}
        />
      </Field>
      <Field label="Inquiry type" error={errors.inquiryType}>
        <select
          className={field}
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
      <Field label="Subject" error={errors.subject}>
        <input
          className={field}
          required
          value={values.subject}
          onChange={(e) => update("subject", e.target.value)}
          maxLength={140}
        />
      </Field>
      <Field label="Message" error={errors.message}>
        <textarea
          className={`${field} min-h-32 resize-none`}
          required
          value={values.message}
          onChange={(e) => update("message", e.target.value)}
          maxLength={3000}
        />
      </Field>
      <label className="flex gap-3 text-sm text-[var(--text-secondary)]">
        <input
          type="checkbox"
          checked={values.consent}
          onChange={(e) => update("consent", e.target.checked)}
          className="mt-1 size-4"
        />
        I consent to EMRAN LABS receiving this inquiry by email and understand
        the configured mailbox will store the delivered message.
      </label>
      {errors.consent && (
        <p className="text-xs text-red-200">{errors.consent}</p>
      )}
      <p
        id={describedBy}
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
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-[var(--text-primary)]">
        {label}
      </span>
      {children}
      {error && <span className="block text-xs text-red-200">{error}</span>}
    </label>
  );
}
