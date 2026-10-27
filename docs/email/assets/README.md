# Email contact assets

Five small PNGs used by the Call, WhatsApp and SMS actions and country labels. Regenerate with `node scripts/render-email-contact-assets.mjs` through the pinned project runtime.

- Phone and Messages artwork: custom vectors authored for EMRAN LABS.
- WhatsApp mark: [Simple Icons](https://github.com/simple-icons/simple-icons), source saved in `source/whatsapp.svg`; the repository's CC0 license is saved alongside it. Brand ownership remains with WhatsApp.
- UAE and Pakistan flags: [country-flags](https://github.com/hampusborgos/country-flags), source SVGs saved in `source/`. These are standard national flag designs.

The generator also copies the five PNGs into `public/email-assets/`, preserving the same paths in a future Next.js deployment. These PNGs are the only public files required for email rendering. Source files and local configuration must not be uploaded. The website itself remains local.
