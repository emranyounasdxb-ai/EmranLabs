const path = require("node:path");
const sharp = require("sharp");

const root = path.resolve(__dirname, "..");
const captures = [
  ["creative-tools-desktop-2026-10-27.png", "emranlabs-customer.webp"],
  ["emranlabs-about-customer-source.png", "emranlabs-about-customer.webp"],
  ["emranlabs-contact-customer-source.png", "emranlabs-contact-customer.webp"],
];

async function main() {
  for (const [source, destination] of captures) {
    const result = await sharp(path.join(root, "docs/assets", source))
      .resize({ width: 1600, withoutEnlargement: true })
      .webp({ quality: 84, effort: 6 })
      .toFile(path.join(root, "public/images/projects", destination));
    console.log(
      `${destination}: ${result.width}x${result.height}, ${result.size} bytes`,
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
