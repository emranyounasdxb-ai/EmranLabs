const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

// TypeScript 7 exposes its native CLI instead of the old transpileModule API.
// Compile the actual pure workspace modules once, then run the existing assertions.
const projectRoot = path.resolve(__dirname, "..");
const sourceRoot = path.join(projectRoot, "src/components/workspace");
const temporaryRoot = path.resolve(os.tmpdir());
const outputRoot = fs.mkdtempSync(
  path.join(temporaryRoot, "emranlabs-checks-"),
);
const compiledRoot = path.join(outputRoot, "compiled");
process.on("exit", () => {
  const target = path.resolve(outputRoot);
  if (
    path.dirname(target) === temporaryRoot &&
    path.basename(target).startsWith("emranlabs-checks-")
  ) {
    fs.rmSync(target, { recursive: true, force: true });
  }
});
const configFile = path.join(outputRoot, "tsconfig.json");
fs.writeFileSync(
  configFile,
  JSON.stringify({
    compilerOptions: {
      target: "ES2023",
      module: "Node16",
      moduleResolution: "Node16",
      strict: true,
      skipLibCheck: true,
      types: [],
      rootDir: sourceRoot,
      outDir: compiledRoot,
    },
    files: [
      "window-manager",
      "window-geometry",
      "desktop-location",
      "desktop-preferences",
      "widget-data",
    ].map((name) => path.join(sourceRoot, `${name}.ts`)),
  }),
);
const compiler = path.join(
  path.dirname(require.resolve("typescript/package.json")),
  "bin/tsc",
);
execFileSync(process.execPath, [compiler, "--project", configFile], {
  cwd: projectRoot,
  stdio: "inherit",
});
exports.load = (name) => {
  if (!/^[a-z-]+$/.test(name)) throw new Error("Invalid workspace module name");
  return require(path.join(compiledRoot, `${name}.js`));
};
