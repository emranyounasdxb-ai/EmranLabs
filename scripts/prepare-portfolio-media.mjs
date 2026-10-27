import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "public/images/social");
await mkdir(output, { recursive: true });
const catalog = [
  {
    id: "edrive",
    title: "eDrive",
    kind: "Water sports & tourism",
    line: "Discovery. Requests. Follow-up.",
    hero: "edrive",
    screens: ["edrive", "edrive-packages", "edrive-booking"],
    captions: [
      "Explore water-sports experiences.",
      "Compare packages before making a request.",
      "Follow up using the booking lookup.",
    ],
  },
  {
    id: "inaya",
    title: "INAYA Domestic",
    kind: "Services & operations",
    line: "A bilingual service experience.",
    hero: "inaya",
    screens: ["inaya", "inaya-services", "inaya-arabic"],
    captions: [
      "Discover the domestic-service business.",
      "Explore available services and options.",
      "Read the Arabic experience in a right-to-left layout.",
    ],
  },
  {
    id: "emranlabs",
    title: "EmranLabs",
    kind: "An independent digital workspace",
    line: "Ideas, built into reality.",
    hero: "emranlabs-customer",
  },
];
const escape = (s) => s.replaceAll("&", "&amp;").replaceAll("<", "&lt;");
for (const project of catalog) {
  const frame = Buffer.from(
    `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="bg" x2="1" y2="1"><stop stop-color="#f9fafc"/><stop offset="1" stop-color="#dde7f2"/></linearGradient></defs><rect width="1200" height="630" fill="url(#bg)"/><text x="60" y="82" font-family="Arial" font-size="21" fill="#536173" letter-spacing="3">EMRAN LABS</text><text x="60" y="245" font-family="Arial" font-weight="bold" font-size="43" fill="#202b3b">${escape(project.title)}</text><text x="60" y="289" font-family="Arial" font-size="21" fill="#536173">${escape(project.kind)}</text><text x="60" y="338" font-family="Arial" font-size="18" fill="#536173">${escape(project.line)}</text><text x="60" y="489" font-family="Arial" font-size="17" fill="#0069ce">Designed &amp; built by Emran Younas</text><text x="60" y="565" font-family="Arial" font-size="19" fill="#536173">emranlabs.com</text><rect x="465" y="106" width="690" height="437" rx="15" fill="#fff" stroke="#cbd7e5"/><circle cx="485" cy="122" r="4" fill="#ff6057"/><circle cx="500" cy="122" r="4" fill="#ffbd2e"/><circle cx="515" cy="122" r="4" fill="#28c840"/></svg>`,
  );
  const screenshot = await sharp(
    path.join(root, `public/images/projects/${project.hero}.webp`),
  )
    .resize(674, 404, { fit: "cover", position: "top" })
    .png()
    .toBuffer();
  await sharp(frame)
    .composite([{ input: screenshot, left: 473, top: 132 }])
    .png({ compressionLevel: 9 })
    .toFile(path.join(output, `${project.id}.png`));
  if (!project.screens) continue;
  await sharp(
    path.join(root, `docs/assets/${project.id}-mobile-source-2026-10-27.png`),
  )
    .webp({ quality: 86, effort: 6 })
    .toFile(
      path.join(root, `public/images/projects/${project.id}-mobile.webp`),
    );
  const args = ["-hide_banner", "-loglevel", "error", "-y"];
  for (const screen of project.screens)
    args.push(
      "-loop",
      "1",
      "-t",
      "6",
      "-framerate",
      "24",
      "-i",
      path.join(root, `public/images/projects/${screen}.webp`),
    );
  const filters =
    project.screens
      .map(
        (_, i) =>
          `[${i}:v]scale=1280:800:force_original_aspect_ratio=decrease,pad=1280:800:(ow-iw)/2:(oh-ih)/2:color=0xedf1f6,setsar=1,format=yuv420p[v${i}]`,
      )
      .join(";") + ";[v0][v1][v2]concat=n=3:v=1:a=0[out]";
  args.push(
    "-filter_complex",
    filters,
    "-map",
    "[out]",
    "-c:v",
    "libx264",
    "-crf",
    "23",
    "-preset",
    "fast",
    "-movflags",
    "+faststart",
    "-an",
    path.join(root, `public/videos/${project.id}-screen-tour.mp4`),
  );
  await new Promise((resolve, reject) => {
    const child = spawn("ffmpeg", args, {
      windowsHide: true,
      stdio: "inherit",
    });
    child.on("error", reject);
    child.on("exit", (code) =>
      code === 0 ? resolve() : reject(new Error(`ffmpeg exited ${code}`)),
    );
  });
  const vtt =
    "WEBVTT\n\n" +
    project.captions
      .map(
        (caption, i) =>
          `${i + 1}\n00:00:${String(i * 6).padStart(2, "0")}.000 --> 00:00:${String((i + 1) * 6).padStart(2, "0")}.000\n${caption}\n`,
      )
      .join("\n");
  await writeFile(
    path.join(root, `public/videos/${project.id}-screen-tour.vtt`),
    vtt,
  );
  console.log(
    `${project.id}: social image, mobile preview and 18-second captured-screen tour prepared.`,
  );
}
