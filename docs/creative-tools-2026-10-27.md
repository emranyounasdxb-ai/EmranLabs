# Customer-facing creative tools update

This update is local only. No repository, hosting or account visibility settings were changed.

## Behavior

- Added Figma, Photoshop, Illustrator, Premiere Pro, After Effects, Blender, Unreal Engine, Cinema 4D and WordPress to the shared tool catalog.
- A wide Dock contains 28 icons, including the eight existing Mac apps, coding tools, creative tools, social/contact entries and Trash. The approved default 35px icons and 54px glass Dock are retained.
- When the available width is smaller, creative tools collapse into Design, Video & Motion and 3D & Games stacks. Development also becomes a stack when necessary. Layout considers the saved icon size and pinned favorites.
- Stack panels and Launchpad can pin favorites. Right-click an individual tool for its project collection and Keep in Dock setting. Pins persist locally and appear individually when space permits.
- Finder, Launchpad, Spotlight and collection URLs share the same tool list. Phones have a Browse tools button in the bottom navigation.
- Tool selections open project collections. New tools currently show an honest empty showcase until real projects are added; no project credits or software integrations were invented.
- GitHub profile/repository links were removed from the Dock, Launchpad, Connect widget, Contact, case studies, portfolio content and structured data. Project data no longer serializes repository URLs into page HTML.
- EmranLabs desktop, About and Contact preview captures were refreshed. Superseded captures were archived outside `public/`.

## Validation

- Production build and strict TypeScript completed successfully with the existing pinned dependencies.
- `check:desktop` passed lifecycle, state/URL, preferences, widgets and 400 window-boundary cases.
- The four new creative-tool scenarios passed in Chromium, Firefox and WebKit (12 passes). They cover all nine local icons/collections, widths from 761px through 1920px, maximum Dock size, pin persistence, light/dark stack accessibility and seven customer pages without repository destinations in their HTML.
- The combined existing-workspace, stack, mobile and visual regression run passed 38 checks. Five project-specific skips are intentional: phone behavior runs only in the phone project, while screenshot baselines run only in Chromium.
- After the final WordPress W-mark correction, the nine-tool/icon smoke test and visual review passed again in Chromium. The six approved visual surfaces also passed a separate comparison run against reviewed baselines.
- Real Chrome review covered the wide desktop, compact Design stack and 390px mobile Adobe search. No visible images were broken and the inspected final preview log contained no warnings/errors.

The local production preview remains available at `http://127.0.0.1:3000`. This update does not claim a new production performance score or publish any project.

## Captures

- `docs/assets/creative-tools-desktop-2026-10-27.png`
- `docs/assets/creative-tools-stack-2026-10-27.png`
- `docs/assets/creative-tools-mobile-2026-10-27.png`
- `docs/assets/creative-tools-final-preview.png` (final WordPress mark)

Asset provenance and screenshot reproduction are documented in `ASSETS.md`.
