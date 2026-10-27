const fs = require("node:fs/promises");
const path = require("node:path");
const sharp = require("sharp");

(async () => {
  const source = process.argv[2];
  if (!source) throw new Error("Pass the generated wallpaper PNG path.");
  const directory = path.join(process.cwd(), "public", "images");
  await fs.mkdir(directory, { recursive: true });
  await sharp(source)
    .webp({ quality: 84, effort: 6 })
    .toFile(path.join(directory, "coastline.webp"));
  const image = await fs.stat(path.join(directory, "coastline.webp"));
  console.log(`Wallpaper optimized: ${Math.round(image.size / 1024)} KB`);
})();
