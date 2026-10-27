const sharp = require("sharp");
(async () => {
  await sharp("public/images/catalina-light.jpg")
    .resize(2304, 1296, { fit: "cover", position: "centre" })
    .webp({ quality: 86 })
    .toFile("public/images/catalina-light.webp");
  await sharp("public/images/catalina-day.jpg")
    .resize(2304, 1296, { fit: "cover", position: "centre" })
    .webp({ quality: 85 })
    .toFile("public/images/catalina-night.webp");
  console.log("Local wallpapers optimized");
})();
