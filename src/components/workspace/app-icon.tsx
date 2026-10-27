/* eslint-disable @next/next/no-img-element -- Tiny, pre-optimized local icons and SVGs are served directly at fixed dimensions. */
import { Code2 } from "lucide-react";

const nativeIcons = new Set([
  "finder",
  "safari",
  "mail",
  "notes",
  "photos",
  "launchpad",
  "settings",
  "vscode",
]);
const brandIcons = new Set([
  "react",
  "next",
  "python",
  "node",
  "flutter",
  "figma",
  "photoshop",
  "illustrator",
  "premierepro",
  "aftereffects",
  "blender",
  "unrealengine",
  "cinema4d",
  "wordpress",
  "linkedin",
  "facebook",
]);

export function AppIcon({
  name,
  className = "",
  date,
  timeZone = "Asia/Dubai",
}: {
  name: string;
  className?: string;
  date?: Date | null;
  timeZone?: string;
}) {
  const native = nativeIcons.has(name);
  const brand = brandIcons.has(name);
  return (
    <span
      className={`app-icon icon-${name} ${native ? "native-art" : ""} ${brand ? "brand-art" : ""} ${className}`}
      aria-hidden="true"
    >
      {(native || brand) && (
        <img
          src={`/icons/${name}.${native || name === "wordpress" ? "webp" : "svg"}`}
          alt=""
          width={128}
          height={128}
          draggable={false}
          decoding="async"
        />
      )}
      {name === "calendar" && (
        <>
          <small>
            {date
              ?.toLocaleDateString("en-US", {
                month: "short",
                timeZone,
              })
              .toUpperCase() ?? "DAY"}
          </small>
          <b>
            {date?.toLocaleDateString("en-US", {
              day: "numeric",
              timeZone,
            }) ?? "—"}
          </b>
        </>
      )}
      {name === "instagram" && (
        <svg viewBox="0 0 40 40" fill="none" stroke="white" strokeWidth="2.7">
          <rect x="7.5" y="7.5" width="25" height="25" rx="7.5" />
          <circle cx="20" cy="20" r="6.5" />
          <circle cx="28" cy="12" r="1.7" fill="white" stroke="none" />
        </svg>
      )}
      {name === "youtube" && (
        <svg viewBox="0 0 40 40">
          <rect x="4" y="9" width="32" height="23" rx="7" fill="#ff0034" />
          <path d="m17 15 10 6-10 6Z" fill="white" />
        </svg>
      )}
      {name === "trash" && (
        <svg viewBox="0 0 40 40" fill="none">
          <defs>
            <linearGradient id="trash-metal">
              <stop stopColor="#f9fafc" />
              <stop offset=".32" stopColor="#c8cdd3" />
              <stop offset=".7" stopColor="#f3f5f8" />
              <stop offset="1" stopColor="#9da6b2" />
            </linearGradient>
          </defs>
          <path
            d="m8 8 3 28q9 5 18 0l3-28"
            fill="url(#trash-metal)"
            stroke="#a5afbb"
            strokeWidth=".8"
          />
          <path
            d="m11 13 2 20m3-20 1 22m3-22v23m4-23-1 22m5-22-2 20"
            stroke="#99a4b3"
            strokeWidth=".7"
          />
          <ellipse
            cx="20"
            cy="8"
            rx="12"
            ry="4.5"
            fill="#e7eaee"
            stroke="#9aa6b3"
          />
          <ellipse cx="20" cy="8" rx="9.5" ry="2.5" fill="#aeb8c4" />
          <path
            d="m13 7 1-5 8 2 4-2 3 5"
            fill="#fafbfc"
            stroke="#c2c9d1"
            strokeWidth=".7"
          />
        </svg>
      )}
      {name === "code" && <Code2 size={28} />}
    </span>
  );
}

export function Folder({
  badge = "react",
  small = false,
}: {
  badge?: string;
  small?: boolean;
}) {
  return (
    <span className={`mac-folder ${small ? "small" : ""}`} aria-hidden="true">
      <img
        className="folder-art"
        src="/icons/folder.svg"
        alt=""
        width={128}
        height={110}
        draggable={false}
      />
      {badge && (
        <span className="folder-badge">
          <AppIcon name={badge} />
        </span>
      )}
    </span>
  );
}
