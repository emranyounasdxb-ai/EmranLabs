import "server-only";

import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";
import type { ContactRequestInput } from "@/lib/validation/contact";

const SMTP_TIMEOUT_MS = 10_000;

export function getContactSmtpConfig() {
  const port = Number.parseInt(process.env.CONTACT_SMTP_PORT ?? "", 10);
  const secure = process.env.CONTACT_SMTP_SECURE;
  if (!Number.isInteger(port) || port < 1 || port > 65535) return null;
  if (secure !== "true" && secure !== "false") return null;
  if (
    !process.env.CONTACT_SMTP_HOST ||
    !process.env.CONTACT_SMTP_USER ||
    !process.env.CONTACT_SMTP_PASSWORD ||
    !process.env.CONTACT_TO_EMAIL ||
    !process.env.CONTACT_FROM_EMAIL
  )
    return null;
  return {
    host: process.env.CONTACT_SMTP_HOST,
    port,
    secure: secure === "true",
    auth: {
      user: process.env.CONTACT_SMTP_USER,
      pass: process.env.CONTACT_SMTP_PASSWORD,
    },
  } satisfies SMTPTransport.Options;
}

export function hasContactConfig() {
  return Boolean(getContactSmtpConfig());
}

function cleanHeader(value: string) {
  return value.replace(/[\r\n]+/g, " ").trim();
}

export async function sendContactInquiry(
  input: ContactRequestInput,
  signal: AbortSignal,
) {
  const smtpConfig = getContactSmtpConfig();
  if (!smtpConfig) throw new Error("contact_unavailable");
  const transporter = nodemailer.createTransport({
    ...smtpConfig,
    connectionTimeout: SMTP_TIMEOUT_MS,
    greetingTimeout: SMTP_TIMEOUT_MS,
    socketTimeout: SMTP_TIMEOUT_MS,
  });
  const body = [
    "EMRAN LABS professional inquiry",
    "",
    `Inquiry type: ${input.inquiryType}`,
    `Name: ${input.name}`,
    `Email: ${input.email}`,
    `Company: ${input.company ?? "Not provided"}`,
    `Subject: ${input.subject}`,
    "",
    "Message:",
    input.message,
  ].join("\n");

  let abortHandler: (() => void) | null = null;
  const abortPromise = new Promise<never>((_, reject) => {
    abortHandler = () => {
      transporter.close();
      reject(new Error("contact_timeout"));
    };
    signal.addEventListener("abort", abortHandler, { once: true });
  });

  try {
    await Promise.race([
      transporter.sendMail({
        from: process.env.CONTACT_FROM_EMAIL,
        to: process.env.CONTACT_TO_EMAIL,
        replyTo: {
          name: cleanHeader(process.env.CONTACT_REPLY_NAME || input.name),
          address: input.email,
        },
        subject: `[EMRAN LABS Inquiry] ${cleanHeader(input.subject)}`,
        text: body,
      }),
      abortPromise,
    ]);
  } finally {
    if (abortHandler) signal.removeEventListener("abort", abortHandler);
    transporter.close();
  }
}
