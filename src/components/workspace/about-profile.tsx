import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Cloud, Code2, Workflow } from "lucide-react";
import { socialLinks } from "./workspace-data";

export function AboutProfile({ onExplore }: { onExplore?: () => void }) {
  return (
    <article className="about-profile">
      <div className="profile-intro">
        <Image
          className="profile-portrait"
          src="/images/profile/emran.webp"
          alt="Emran Younas"
          width={120}
          height={120}
          quality={85}
        />
        <div>
          <span className="eyebrow">THE PERSON BEHIND EMRAN LABS</span>
          <h1>
            Emran Younas<span>.</span>
          </h1>
          <p>IT Manager & software product builder</p>
          <span className="profile-location">Dubai, United Arab Emirates</span>
        </div>
      </div>
      <p className="profile-statement">
        Reliable systems. Useful software.
        <br />
        <span>A little curiosity in everything I build.</span>
      </p>
      <p className="profile-bio">
        I work independently, handling the design and development of my projects
        myself. My work connects day-to-day IT operations with the products
        people use. I work across cloud infrastructure, Microsoft 365, Azure,
        networks and cybersecurity, while building web applications and
        exploring practical AI and automation.
      </p>
      <h2>Where I focus</h2>
      <div className="profile-focus-list">
        <section>
          <span>
            <Cloud size={20} />
          </span>
          <div>
            <h3>Cloud & IT operations</h3>
            <p>
              Infrastructure, Microsoft 365, Azure, network administration and
              cybersecurity.
            </p>
          </div>
        </section>
        <section>
          <span>
            <Code2 size={20} />
          </span>
          <div>
            <h3>Software & digital experiences</h3>
            <p>
              React, Next.js and TypeScript products for services, bookings and
              business workflows.
            </p>
          </div>
        </section>
        <section>
          <span>
            <Workflow size={20} />
          </span>
          <div>
            <h3>Automation & connected systems</h3>
            <p>
              Exploring AI, integrations and simpler ways to get everyday work
              done.
            </p>
          </div>
        </section>
      </div>
      <div className="profile-actions">
        {onExplore ? (
          <button className="primary-button" onClick={onExplore}>
            Explore my work <ArrowRight size={14} />
          </button>
        ) : (
          <Link className="primary-button" href="/?collection=All+Projects">
            Explore my work <ArrowRight size={14} />
          </Link>
        )}
        <a
          className="text-link"
          href={socialLinks.linkedin}
          target="_blank"
          rel="noreferrer"
        >
          Experience on LinkedIn <ArrowUpRight size={14} />
        </a>
      </div>
    </article>
  );
}

export function WorkspaceGuide() {
  const shortcuts = [
    ["Search apps & projects", "⌘ / Ctrl + K"],
    ["Overview", "Alt + 1"],
    ["All Projects", "Alt + 2"],
    ["About Emran", "Alt + 3"],
    ["Notes", "Alt + 4"],
    ["Window overview", "Alt + 9"],
    ["Open the selected project", "Enter"],
    ["Minimize window", "Alt + M"],
    ["Maximize / restore", "Alt + Enter"],
    ["Close window", "Alt + W"],
    ["Reset window layout", "Alt + 0"],
    ["Tile left / right", "Alt + Shift + ← / →"],
    ["Open this guide", "?"],
    ["Quick Look on a focused project", "Space"],
    ["Back / dismiss a menu", "Esc"],
  ];
  return (
    <article className="workspace-guide">
      <span className="eyebrow">A FEW LITTLE SHORTCUTS</span>
      <h1>Make yourself at home.</h1>
      <p>
        Select a folder with one click, then double-click or press Enter to open
        it. Browse by technology, or use the dock to find your way around. On
        touch screens, tap once to open.
      </p>
      <div className="guide-tips">
        <p>
          <strong>A workspace that stays with you</strong> Open Projects, About
          and Notes together. Click a window to bring it forward; minimize it
          and use its dock icon or the Window menu to restore it. On a phone,
          switch apps from the bottom navigation or Search.
        </p>
        <p>
          <strong>A quick closer look</strong> Focus a project with Tab and
          press Space, or right-click its folder and choose Quick Look. Use the
          arrow keys to browse projects.
        </p>
        <p>
          <strong>Move & resize</strong> Drag the title bar or any edge on
          desktop. Double-click the title bar to maximize. Focus the
          bottom-right resize handle and use arrow keys to resize with a
          keyboard.
        </p>
        <p>
          <strong>Right-click to explore</strong> Right-click a folder for
          project actions, or the desktop for view and wallpaper options. Use
          arrow keys inside menus.
        </p>
        <p>
          <strong>Your preferences stay here</strong> Appearance, wallpaper and
          notes are saved in this browser. Reduce motion in Appearance for a
          quieter workspace. Window positions, views and widgets are remembered
          too. The green window button offers layout options on hover,
          right-click or Arrow Down.
        </p>
        <p>
          <strong>A useful little glance</strong> Clock, calendar and weather
          widgets use your selected city. Open Control Center to change their
          city, clock style or temperature units. Choose Edit widgets to drag
          them, or use a focused move handle’s arrow keys. Window → Reset
          Desktop Layout restores their positions.
        </p>
      </div>
      <h2>Keyboard shortcuts</h2>
      <dl>
        {shortcuts.map(([label, key]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>
              <kbd>{key}</kbd>
            </dd>
          </div>
        ))}
      </dl>
      <p className="guide-footnote">
        Shortcuts work when you’re not typing in a field. On Mac, Alt is the
        Option key.
      </p>
    </article>
  );
}
