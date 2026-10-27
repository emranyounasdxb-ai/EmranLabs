# Local desktop assets

The preview serves all fonts, artwork and wallpaper from this checkout. No third-party asset host is contacted at runtime.

| Asset                                                                                    | Source and notes                                                                                                                                                                                                                                                                                                                      |
| ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Inter variable font                                                                      | [Inter by Rasmus Andersson](https://rsms.me/inter/), SIL Open Font License. License retained in `public/fonts/Inter-LICENSE.txt`. macOS uses its installed system font; other platforms fall back to this local font.                                                                                                                 |
| Finder, Safari, Mail, Notes, Photos, Launchpad, System Settings and VS Code icon artwork | Downloaded from [Puru Vijay's macos-web asset collection](https://github.com/PuruVJ/macos-web/tree/main/public/app-icons), trimmed and converted to 128px WebP. Repository MIT notice retained in `public/icons/macos-web-LICENSE.txt`; that software license does not itself grant rights to the Apple or third-party brand artwork. |
| Coding and social marks                                                                  | Original SVG marks from [Devicon](https://github.com/devicons/devicon/tree/master/icons). License retained in `public/icons/devicon-LICENSE.txt`. Marks identify the associated platforms.                                                                                                                                            |
| Catalina day and night wallpaper                                                         | Local copies from [macos-web wallpapers](https://github.com/PuruVJ/macos-web/tree/main/public/wallpapers), optimized to WebP. Apple macOS reference wallpaper used in this local design prototype. Final public-release artwork should be owned or licensed for that use.                                                             |
| Folder, calendar, Instagram, YouTube and trash treatment                                 | Local SVG/CSS implementation in `app-icon.tsx` and `public/icons/folder.svg`.                                                                                                                                                                                                                                                         |
| Emran Horizon wallpaper                                                                  | `public/images/emran-horizon.webp`, the default original wallpaper generated with built-in Imagegen. Source PNG and full prompt are retained in `docs/assets/` and `docs/wallpaper-generation.md`. Dark appearance applies a restrained color treatment.                                                                              |
| Project screenshots                                                                      | Real browser captures of [eDrive](https://edrivedubai.ae/) and [INAYA](https://inayadomestic.ae/en/) on 26 October 2026, plus the current local EmranLabs desktop. Source PNGs and optimized WebP versions are in `public/images/projects/`.                                                                                          |
| Emran Younas portrait                                                                    | Public avatar from the user's [GitHub profile](https://github.com/emranyounasdxb-ai), source `https://avatars.githubusercontent.com/u/292407963?v=4`. Original and optimized copies are in `public/images/profile/`.                                                                                                                  |
| Earlier generated coastal wallpaper                                                      | `public/images/coastline.webp`, retained from the first prototype; generated with Imagegen from the approved mockup.                                                                                                                                                                                                                  |

The desktop is an Emran Labs portfolio concept inspired by macOS, with Emran Labs branding. There is no affiliation with Apple or the other platforms depicted.

Asset preparation: `scripts/prepare-desktop-assets.cjs` and `scripts/optimize-wallpapers.cjs`.

## Creative tool additions — 27 October 2026

Figma, Photoshop, Illustrator, Premiere Pro, After Effects, Blender and Unreal Engine use the original SVG marks from Devicon's matching icon directories. Their retained Devicon license applies to this asset collection; the marks identify the respective products. Cinema 4D uses Maxon's current SVG from its [official product page](https://www.maxon.net/en/cinema-4d), downloaded from `https://mxwebnuxtprod01.blob.core.windows.net/media/images/Products/Cinema-4D/C4D_icon.svg`. WordPress uses its official [W mark](https://wordpress.org/about/logos/) from `https://s.w.org/style/images/about/WordPress-logotype-wmark.png?0=`, trimmed and optimized to a 128px transparent WebP. Its source PNG is retained in `docs/assets/wordpress-wmark-source.png`. All nine icons are served locally from `public/icons/`.

The EmranLabs desktop, About and Contact screenshots were refreshed from the local browser after removing customer-facing GitHub links. The new `emranlabs*-customer.webp` captures are optimized by `scripts/prepare-customer-captures.cjs`; source PNGs are in `docs/assets/`. The six superseded EmranLabs PNG/WebP captures are archived in `docs/assets/previous-project-captures/`, outside the public asset directory. The original eDrive and INAYA captures are unchanged.

Project folder badges now use the actual eDrive and INAYA emblems from their owned websites, saved locally as `public/images/projects/edrive-brand-icon.webp` and `inaya-brand-icon.webp`. Exact source URLs, source copies, dimensions and processing are recorded in `docs/project-brand-assets.md`. Clock hands and calendar cells are rendered as SVG/HTML; weather condition symbols use the existing Lucide icon set with Open-Meteo data and visible attribution.

## Case study captures and font delivery

Additional real browser captures made on 26 October 2026:

- eDrive packages: `https://edrivedubai.ae/rentals/`; booking lookup: `https://edrivedubai.ae/my-booking/`.
- INAYA services: `https://inayadomestic.ae/en/services/`; Arabic services: `https://inayadomestic.ae/ar/services/` (RTL).
- EmranLabs About desktop panel and standalone Contact page from the local preview.

The eDrive and INAYA `*-source.png` captures and optimized `.webp` files live in `public/images/projects/`. Current EmranLabs source captures are in `docs/assets/`, with their optimized WebP versions in `public/images/projects/`; earlier captures are archived as described above. Each case study presents its main capture and two supporting images. No booking or enquiry was submitted to the live projects while capturing them.

`InterLatin.woff2` is a subset of the retained `InterVariable.woff2`, generated with FontTools 4.67.0 and Brotli 1.2.1. It retains variable weights and layout features, Latin characters, punctuation, arrows and interface symbols; other scripts fall back to installed system fonts. Size: 105,500 bytes versus 352,240 bytes for the original. The SIL OFL remains in `public/fonts/Inter-LICENSE.txt`.

Reproduce with FontTools and Brotli available:

```powershell
python -m fontTools.subset public/fonts/InterVariable.woff2 --unicodes=U+0000-00FF,U+2000-206F,U+2190-21FF,U+2300-23FF,U+2700-27BF --layout-features='*' --flavor=woff2 --output-file=public/fonts/InterLatin.woff2
```
