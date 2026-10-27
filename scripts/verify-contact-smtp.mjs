import { createRequire } from "node:module";
import nodemailer from "nodemailer";
import { getContactSmtpConfig } from "../src/lib/server/contact-smtp-config.ts";

// Use Next's own dotenv expansion so this check matches the running website.
const require = createRequire(import.meta.url);
const nextRequire = createRequire(require.resolve("next/package.json"));
nextRequire("@next/env").loadEnvConfig(process.cwd());

const config = getContactSmtpConfig();
if (!config) {
  console.error(
    "SMTP configuration is incomplete or invalid. Check .env.local privately.",
  );
  process.exitCode = 1;
} else {
  const transport = nodemailer.createTransport(config);
  try {
    await transport.verify();
    console.log(
      "SMTP DNS, connection, TLS and mailbox authentication passed. No email was sent.",
    );
    console.log(
      "Sender acceptance and inbox delivery still require an approved form test.",
    );
  } catch (error) {
    // Never print the error object, SMTP conversation, environment or password.
    const code =
      typeof error?.code === "string" && /^[A-Z_0-9]+$/.test(error.code)
        ? error.code
        : "SMTP_CHECK_FAILED";
    console.error(`SMTP verification failed (${code}). No email was sent.`);
    process.exitCode = 1;
  } finally {
    transport.close();
  }
}
