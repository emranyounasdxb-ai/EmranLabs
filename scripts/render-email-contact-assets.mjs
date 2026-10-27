import { copyFile, mkdir, readFile } from "node:fs/promises";
import sharp from "sharp";

const directory = "docs/email/assets";
await mkdir(directory, { recursive: true });

// Small, static PNGs render consistently in email clients. No font glyphs or SVG
// markup are required in the message itself. Regenerate from the saved sources.
const tile = (top, bottom, artwork) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="132" height="132" viewBox="0 0 44 44"><defs><linearGradient id="tile" x2="0" y2="1"><stop stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient></defs><rect x=".5" y=".5" width="43" height="43" rx="13" fill="url(#tile)"/><rect x="1" y="1" width="42" height="42" rx="12.5" fill="none" stroke="#fff" stroke-opacity=".24"/>${artwork}</svg>`;
const phone = `<g transform="translate(10 10)" fill="#fff"><path d="M6.8 2.2c.6-.2 1.2.1 1.5.7l2 4.4c.2.5.1 1.1-.3 1.5l-1.7 1.6c1.2 2.4 3.1 4.3 5.5 5.5l1.6-1.7c.4-.4 1-.5 1.5-.3l4.4 2c.6.3.9.9.7 1.5l-.7 2.8c-.2.8-.9 1.3-1.7 1.3C10 21.5 2.5 14 2.5 4.4c0-.8.5-1.5 1.3-1.7z"/></g>`;
const whatsappSvg = await readFile(`${directory}/source/whatsapp.svg`, "utf8");
const whatsappPath = whatsappSvg.match(/<path d="([^"]+)"/)?.[1];
if (!whatsappPath) throw new Error("Missing saved WhatsApp brand path");
const whatsapp = `<g transform="translate(10 10)" fill="#fff"><path d="${whatsappPath}"/></g>`;
const sms = `<path fill="#fff" d="M35 20.5c0 6.1-5.8 10.9-13 10.9-1.5 0-3-.2-4.3-.6l-6.1 2.5 1.5-5.5C10.6 25.8 9 23.3 9 20.5c0-6.1 5.8-10.9 13-10.9s13 4.8 13 10.9z"/><g fill="#21a84b"><circle cx="16.2" cy="20.5" r="1.3"/><circle cx="22" cy="20.5" r="1.3"/><circle cx="27.8" cy="20.5" r="1.3"/></g>`;
for (const [name, svg] of [
  ["call-v1", tile("#36a1ff", "#0878ed", phone)],
  ["whatsapp-v1", tile("#32d56a", "#16ad4b", whatsapp)],
  ["sms-v1", tile("#72df67", "#25b84c", sms)],
]) {
  await sharp(Buffer.from(svg)).png().toFile(`${directory}/${name}.png`);
}
for (const country of ["ae", "pk"]) {
  await sharp(await readFile(`${directory}/source/${country}.svg`), {
    density: 600,
  })
    .resize({ width: 126, height: 84, fit: "contain", background: "#ffffff00" })
    .png()
    .toFile(`${directory}/flag-${country}-v1.png`);
}
// Include the same URLs in the future Next.js deployment as well as cPanel.
await mkdir("public/email-assets", { recursive: true });
for (const name of ["call", "whatsapp", "sms", "flag-ae", "flag-pk"]) {
  await copyFile(
    `${directory}/${name}-v1.png`,
    `public/email-assets/${name}-v1.png`,
  );
}
console.log("Generated five static contact icons/flags. No email sent.");
