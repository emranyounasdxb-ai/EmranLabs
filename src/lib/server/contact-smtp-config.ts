import type SMTPTransport from "nodemailer/lib/smtp-transport";

// Shared by the server mailer and the local, non-sending connection check.
export function getContactSmtpConfig(env: NodeJS.ProcessEnv = process.env) {
  const portText = env.CONTACT_SMTP_PORT ?? "";
  const port = Number(portText);
  const secure = env.CONTACT_SMTP_SECURE;
  if (
    !/^\d+$/.test(portText) ||
    !Number.isInteger(port) ||
    port < 1 ||
    port > 65535
  )
    return null;
  if (secure !== "true" && secure !== "false") return null;
  if (port === 465 && secure !== "true") return null;
  if (
    !env.CONTACT_SMTP_HOST ||
    !env.CONTACT_SMTP_USER ||
    !env.CONTACT_SMTP_PASSWORD ||
    !env.CONTACT_TO_EMAIL ||
    !env.CONTACT_FROM_EMAIL
  )
    return null;
  return {
    host: env.CONTACT_SMTP_HOST,
    port,
    secure: secure === "true",
    requireTLS: secure === "false",
    tls: { minVersion: "TLSv1.2", rejectUnauthorized: true },
    auth: { user: env.CONTACT_SMTP_USER, pass: env.CONTACT_SMTP_PASSWORD },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 10_000,
    logger: false,
    debug: false,
  } satisfies SMTPTransport.Options;
}
