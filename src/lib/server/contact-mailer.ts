import "server-only";

import nodemailer from "nodemailer";
import type { ContactRequestInput } from "@/lib/validation/contact";

export function hasContactConfig() {
  return Boolean(
    process.env.CONTACT_SMTP_HOST &&
    process.env.CONTACT_SMTP_PORT &&
    process.env.CONTACT_SMTP_USER &&
    process.env.CONTACT_SMTP_PASSWORD &&
    process.env.CONTACT_TO_EMAIL &&
    process.env.CONTACT_FROM_EMAIL,
  );
}

function cleanHeader(value: string) {
  return value.replace(/[\r\n]+/g, " ").trim();
}

export async function sendContactInquiry(
  input: ContactRequestInput,
  signal: AbortSignal,
) {
  const transporter = nodemailer.createTransport({
    host: process.env.CONTACT_SMTP_HOST,
    port: Number.parseInt(process.env.CONTACT_SMTP_PORT ?? "587", 10),
    secure: process.env.CONTACT_SMTP_SECURE === "true",
    auth: {
      user: process.env.CONTACT_SMTP_USER,
      pass: process.env.CONTACT_SMTP_PASSWORD,
    },
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
  const sendPromise = transporter.sendMail({
    from: process.env.CONTACT_FROM_EMAIL,
    to: process.env.CONTACT_TO_EMAIL,
    replyTo: {
      name: cleanHeader(process.env.CONTACT_REPLY_NAME || input.name),
      address: input.email,
    },
    subject: `[EMRAN LABS Inquiry] ${cleanHeader(input.subject)}`,
    text: body,
  });
  const abortPromise = new Promise<never>((_, reject) =>
    signal.addEventListener("abort", () => reject(new Error("timeout")), {
      once: true,
    }),
  );
  await Promise.race([sendPromise, abortPromise]);
}
