const fs = require("node:fs/promises");
const sharp = require("sharp");
const native = {
  finder:
    "https://raw.githubusercontent.com/PuruVJ/macos-web/main/public/app-icons/finder/128.png",
  safari:
    "https://raw.githubusercontent.com/PuruVJ/macos-web/main/public/app-icons/safari/256.png",
  mail: "https://raw.githubusercontent.com/PuruVJ/macos-web/main/public/app-icons/mail/256.png",
  notes:
    "https://raw.githubusercontent.com/PuruVJ/macos-web/main/public/app-icons/notes/256.png",
  photos:
    "https://raw.githubusercontent.com/PuruVJ/macos-web/main/public/app-icons/photos/256.png",
  launchpad:
    "https://raw.githubusercontent.com/PuruVJ/macos-web/main/public/app-icons/launchpad/256.png",
  settings:
    "https://raw.githubusercontent.com/PuruVJ/macos-web/main/public/app-icons/system-preferences/256.png",
  vscode:
    "https://raw.githubusercontent.com/PuruVJ/macos-web/main/public/app-icons/vscode/256.png",
};
const logos = {
  react: "react/react-original.svg",
  next: "nextjs/nextjs-original.svg",
  python: "python/python-original.svg",
  node: "nodejs/nodejs-original.svg",
  flutter: "flutter/flutter-original.svg",
  github: "github/github-original.svg",
  linkedin: "linkedin/linkedin-original.svg",
  facebook: "facebook/facebook-original.svg",
};
async function get(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status}: ${url}`);
  return Buffer.from(await response.arrayBuffer());
}
(async () => {
  await fs.mkdir("public/icons", { recursive: true });
  await fs.mkdir("public/fonts", { recursive: true });
  await Promise.all(
    Object.entries(native).map(async ([name, url]) => {
      await sharp(await get(url))
        .trim()
        .resize(128, 128, { fit: "contain", background: "#0000" })
        .webp({ quality: 95 })
        .toFile(`public/icons/${name}.webp`);
      console.log(`Native icon: ${name}`);
    }),
  );
  await Promise.all(
    Object.entries(logos).map(async ([name, file]) => {
      const data = await get(
        `https://raw.githubusercontent.com/devicons/devicon/master/icons/${file}`,
      );
      if (!data.toString().includes("<svg")) throw new Error("Invalid SVG");
      await fs.writeFile(`public/icons/${name}.svg`, data);
      console.log(`Brand mark: ${name}`);
    }),
  );
  await fs.writeFile(
    "public/fonts/InterVariable.woff2",
    await get("https://rsms.me/inter/font-files/InterVariable.woff2?v=4.1"),
  );
  await fs.writeFile(
    "public/fonts/Inter-LICENSE.txt",
    await get(
      "https://raw.githubusercontent.com/rsms/inter/master/LICENSE.txt",
    ),
  );
  await fs.writeFile(
    "public/icons/macos-web-LICENSE.txt",
    await get(
      "https://raw.githubusercontent.com/PuruVJ/macos-web/main/LICENSE",
    ),
  );
  await fs.writeFile(
    "public/icons/devicon-LICENSE.txt",
    await get(
      "https://raw.githubusercontent.com/devicons/devicon/master/LICENSE",
    ),
  );
})();
