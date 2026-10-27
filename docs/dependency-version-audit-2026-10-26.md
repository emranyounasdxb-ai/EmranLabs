# Dependency version comparison — 26 October 2026

Checked at 2026-10-26T19:19:18.554Z. Installed npm versions were read from node_modules; declared versions from package.json. Latest stable versions were fetched directly from npm registry /latest endpoints. This report did not upgrade any dependencies.

## LTS and stable are different

Node.js latest LTS is v24.22.1; installed v22.23.2; latest 22.x patch v22.23.4. Latest Current is v26.12.1 and is not yet LTS in this snapshot. [Official releases](https://nodejs.org/en/about/previous-releases). Next.js 16 is Active LTS, with latest stable patch 16.4.3. [Support policy](https://nextjs.org/support-policy). For other packages below, latest means the registry stable tag; no LTS status is inferred.

| Package                                                                                      | Installed | Latest stable | Difference               | Actual role                                                                    |
| -------------------------------------------------------------------------------------------- | --------- | ------------- | ------------------------ | ------------------------------------------------------------------------------ |
| [class-variance-authority](https://registry.npmjs.org/class-variance-authority/latest)       | 0.7.1     | 0.7.1         | Same                     | Installed helper; no current source import found                               |
| [clsx](https://registry.npmjs.org/clsx/latest)                                               | 2.1.1     | 2.1.1         | Same                     | Retained shared utility                                                        |
| [framer-motion](https://registry.npmjs.org/framer-motion/latest)                             | 12.42.2   | 14.6.0        | Major version difference | Retained legacy UI; new desktop uses CSS/Web Animations                        |
| [lucide-react](https://registry.npmjs.org/lucide-react/latest)                               | 1.24.0    | 1.61.0        | Minor version difference | Active interface icons                                                         |
| [next](https://registry.npmjs.org/next/latest)                                               | 16.2.10   | 16.4.3        | Minor version difference | Active desktop and prerendered portfolio; Next.js 16 Active LTS                |
| [nodemailer](https://registry.npmjs.org/nodemailer/latest)                                   | 9.0.3     | 10.2.1        | Major version difference | Retained SMTP API; current desktop contact flow prepares an email draft        |
| [openai](https://registry.npmjs.org/openai/latest)                                           | 6.46.0    | 7.44.0        | Major version difference | Retained AI API; not called by the new desktop                                 |
| [react](https://registry.npmjs.org/react/latest)                                             | 19.2.7    | 19.3.1        | Minor version difference | Active desktop UI                                                              |
| [react-dom](https://registry.npmjs.org/react-dom/latest)                                     | 19.2.7    | 19.3.1        | Minor version difference | Active UI rendering                                                            |
| [tailwind-merge](https://registry.npmjs.org/tailwind-merge/latest)                           | 3.6.0     | 3.7.0         | Minor version difference | Retained shared utility                                                        |
| [zod](https://registry.npmjs.org/zod/latest)                                                 | 4.4.3     | 4.6.7         | Minor version difference | Retained API request validation                                                |
| [zustand](https://registry.npmjs.org/zustand/latest)                                         | 5.0.14    | 5.0.16        | Patch difference         | Retained legacy desktop store; new desktop uses React state                    |
| [@eslint/eslintrc](https://registry.npmjs.org/%40eslint%2Feslintrc/latest)                   | 3.3.5     | 3.3.7         | Patch difference         | Installed compatibility utility; current ESLint config uses flat configuration |
| [@tailwindcss/postcss](https://registry.npmjs.org/%40tailwindcss%2Fpostcss/latest)           | 4.3.2     | 4.3.3         | Patch difference         | CSS build plugin                                                               |
| [@types/node](https://registry.npmjs.org/%40types%2Fnode/latest)                             | 22.20.1   | 26.6.5        | Major version difference | TypeScript definitions; align with corresponding runtime/library               |
| [@types/nodemailer](https://registry.npmjs.org/%40types%2Fnodemailer/latest)                 | 8.0.1     | 8.0.2         | Patch difference         | TypeScript definitions; align with corresponding runtime/library               |
| [@types/react](https://registry.npmjs.org/%40types%2Freact/latest)                           | 19.2.17   | 19.3.0        | Minor version difference | TypeScript definitions; align with corresponding runtime/library               |
| [@types/react-dom](https://registry.npmjs.org/%40types%2Freact-dom/latest)                   | 19.2.3    | 19.3.0        | Minor version difference | TypeScript definitions; align with corresponding runtime/library               |
| [eslint](https://registry.npmjs.org/eslint/latest)                                           | 9.39.4    | 10.13.0       | Major version difference | Configured code checks                                                         |
| [eslint-config-next](https://registry.npmjs.org/eslint-config-next/latest)                   | 16.2.10   | 16.4.3        | Minor version difference | Next.js lint configuration                                                     |
| [prettier](https://registry.npmjs.org/prettier/latest)                                       | 3.9.5     | 3.9.10        | Patch difference         | Code formatting                                                                |
| [prettier-plugin-tailwindcss](https://registry.npmjs.org/prettier-plugin-tailwindcss/latest) | 0.8.0     | 0.8.1         | Patch difference         | Formatting plugin                                                              |
| [tailwindcss](https://registry.npmjs.org/tailwindcss/latest)                                 | 4.3.2     | 4.3.3         | Patch difference         | CSS build                                                                      |
| [typescript](https://registry.npmjs.org/typescript/latest)                                   | 5.9.3     | 7.0.2         | Major version difference | Build and type checks                                                          |
| [pnpm](https://registry.npmjs.org/pnpm/latest)                                               | 11.11.0   | 12.15.0       | Major version difference | Package manager                                                                |
| [corepack](https://registry.npmjs.org/corepack/latest)                                       | 0.34.6    | 0.36.0        | Minor version difference | Package manager launcher                                                       |
| [sharp](https://registry.npmjs.org/sharp/latest)                                             | 0.34.5    | 0.35.5        | Minor version difference | Asset optimization; installed through Next.js                                  |

## Type definitions

The globally latest @types/node 26.6.5 follows Node 26. For this project’s installed Node 22 use the 22.x line (latest 22.20.5). For Node 24 LTS use the 24.x line (latest 24.19.2). The project currently restricts Node to >=22.0.0 <23, so changing the runtime major also requires updating and testing that constraint.

## Asset helpers

- fonttools: used 4.67.0, latest stable 4.67.0. [Registry](https://pypi.org/project/fonttools/). Used versions are recorded in ASSETS.md.
- Brotli: used 1.2.1, latest stable 1.2.1. [Registry](https://pypi.org/project/Brotli/). Used versions are recorded in ASSETS.md.

## Browser and external tools

- Desktop motion uses CSS transitions, Web Animations API and requestAnimationFrame; no independently installed package version.
- Weather uses the Open-Meteo v1 forecast endpoint through /api/weather; this is a hosted API version, not an LTS package.
- Codex code editing/terminal tools, Context7 documentation, Chrome/CUA browser verification and Imagegen asset creation were used during development. Exact service/backend build versions are not exposed in this task and are not claimed.

Newer versions listed here are not proof of compatibility. Major upgrades, especially TypeScript, pnpm and ESLint, need migration review and a production build.
