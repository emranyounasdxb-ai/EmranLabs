import "server-only";

import nodemailer from "nodemailer";
import { createHash } from "node:crypto";
import type { ContactRequestInput } from "@/lib/validation/contact";
import { getContactSmtpConfig } from "@/lib/server/contact-smtp-config";
import { acknowledgement, receiptReference } from "@/lib/email/acknowledgement";
import { deliverWithConfirmation } from "@/lib/email/delivery-flow";
import { SlidingWindowRateLimiter } from "@/lib/server/rate-limit";

const confirmations = new SlidingWindowRateLimiter(1, 15 * 60 * 1000);

export function hasContactConfig() {
  return Boolean(getContactSmtpConfig());
}

function cleanHeader(value: string) {
  return value.replace(/[\r\n]+/g, " ").trim();
}

export async function sendContactInquiry(
  input: ContactRequestInput,
  signal: AbortSignal,
  requestId: string,
) {
  const smtpConfig = getContactSmtpConfig();
  if (!smtpConfig) throw new Error("contact_unavailable");
  if (signal.aborted) throw new Error("contact_timeout");
  const transporter = nodemailer.createTransport(smtpConfig);
  const body = [
    "EMRAN LABS professional inquiry",
    `Reference: ${receiptReference(requestId)}`,
    "",
    `Inquiry type: ${input.inquiryType}`,
    `Name: ${input.name}`,
    `Email: ${input.email}`,
    `Company: ${input.company ?? "Not provided"}`,
    `Subject: ${input.subject}`,
    `Reference project: ${input.project ?? "Not specified"}`,
    `Tool / collection: ${input.tool ?? "Not specified"}`,
    `Service focus: ${input.service ?? "Not specified"}`,
    `Budget: ${input.budget ?? "Let’s discuss"}`,
    `Timeframe: ${input.timeframe ?? "Flexible"}`,
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
    return await deliverWithConfirmation({
      notifyOwner: () =>
        Promise.race([
          transporter.sendMail({
            from: process.env.CONTACT_FROM_EMAIL,
            to: process.env.CONTACT_TO_EMAIL,
            replyTo: {
              name: cleanHeader(process.env.CONTACT_REPLY_NAME || input.name),
              address: input.email,
            },
            subject: `[EMRAN LABS Inquiry] ${cleanHeader(input.subject)}`,
            text: body,
            headers: {
              "Auto-Submitted": "auto-generated",
              "X-Auto-Response-Suppress": "All",
              "X-EmranLabs-Automated": "yes",
            },
            disableFileAccess: true,
            disableUrlAccess: true,
          }),
          abortPromise,
        ]),
      allowConfirmation: () =>
        confirmations.check(
          createHash("sha256").update(input.email).digest("hex"),
        ).allowed,
      confirmToVisitor: async () => {
        if (signal.aborted) throw new Error("contact_timeout");
        const receipt = acknowledgement("form", requestId);
        await Promise.race([
          transporter.sendMail({
            from: process.env.CONTACT_FROM_EMAIL,
            to: { address: input.email, name: "" },
            replyTo: {
              name: "Emran at EMRAN LABS",
              address: process.env.CONTACT_SMTP_USER!,
            },
            envelope: { from: "", to: input.email },
            ...receipt,
            headers: {
              "Auto-Submitted": "auto-replied",
              "X-Auto-Response-Suppress": "All",
              "X-EmranLabs-Automated": "yes",
            },
            disableFileAccess: true,
            disableUrlAccess: true,
          }),
          abortPromise,
        ]);
      },
    });
  } finally {
    if (abortHandler) signal.removeEventListener("abort", abortHandler);
    transporter.close();
  }
}
