import { mkdir, writeFile } from "node:fs/promises";
import { acknowledgement } from "../src/lib/email/acknowledgement.ts";

await mkdir("docs/email", { recursive: true });
for (const channel of ["form", "email"]) {
  const receipt = acknowledgement(
    channel,
    channel === "form" ? "preview-20261027" : undefined,
  );
  await writeFile(`docs/email/${channel}-confirmation.html`, receipt.html);
  await writeFile(`docs/email/${channel}-confirmation.txt`, receipt.text);
}
console.log(
  "Branded form and cPanel email previews written to docs/email. No email sent.",
);
