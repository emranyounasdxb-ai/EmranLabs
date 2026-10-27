// TypeScript 7 has no JavaScript compiler API. Keep the application on TS 7
// while giving the current ESLint parser Microsoft's supported API bridge.
const lintCompilerConsumers = new Set([
  "typescript-eslint",
  "@typescript-eslint/parser",
  "@typescript-eslint/typescript-estree",
  "@typescript-eslint/project-service",
  "@typescript-eslint/tsconfig-utils",
  "@typescript-eslint/utils",
  "@typescript-eslint/eslint-plugin",
  "@typescript-eslint/type-utils",
]);

module.exports = {
  hooks: {
    readPackage(pkg) {
      if (pkg.version === "8.72.1" && lintCompilerConsumers.has(pkg.name)) {
        if (pkg.peerDependencies) delete pkg.peerDependencies.typescript;
        if (pkg.peerDependenciesMeta)
          delete pkg.peerDependenciesMeta.typescript;
        pkg.dependencies = {
          ...pkg.dependencies,
          typescript: "npm:@typescript/typescript6@6.0.2",
        };
      }
      return pkg;
    },
  },
};
