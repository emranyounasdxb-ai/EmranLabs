import {
  Bot,
  BriefcaseBusiness,
  FlaskConical,
  FolderKanban,
  IdCard,
  Mail,
  Sparkles,
} from "lucide-react";

import type { DesktopApp } from "@/types/desktop";

export const desktopApps = [
  {
    id: "about",
    title: "About Identity",
    shortLabel: "About",
    icon: IdCard,
    defaultSize: { width: 560, height: 420 },
    defaultPosition: { x: 72, y: 92 },
    enabled: true,
  },
  {
    id: "skills",
    title: "Skills",
    shortLabel: "Skills",
    icon: Sparkles,
    defaultSize: { width: 600, height: 500 },
    defaultPosition: { x: 170, y: 130 },
    enabled: true,
  },
  {
    id: "portfolio",
    title: "Portfolio Projects",
    shortLabel: "Projects",
    icon: FolderKanban,
    defaultSize: { width: 620, height: 430 },
    defaultPosition: { x: 260, y: 104 },
    enabled: true,
  },
  {
    id: "creative-labs",
    title: "Creative Labs",
    shortLabel: "Labs",
    icon: FlaskConical,
    defaultSize: { width: 560, height: 420 },
    defaultPosition: { x: 126, y: 190 },
    enabled: false,
  },
  {
    id: "journey",
    title: "Professional Journey",
    shortLabel: "Journey",
    icon: BriefcaseBusiness,
    defaultSize: { width: 620, height: 460 },
    defaultPosition: { x: 310, y: 160 },
    enabled: false,
  },
  {
    id: "contact",
    title: "Contact",
    shortLabel: "Contact",
    icon: Mail,
    defaultSize: { width: 520, height: 380 },
    defaultPosition: { x: 390, y: 128 },
    enabled: true,
  },
  {
    id: "em-ai",
    title: "EM AI",
    shortLabel: "EM AI",
    icon: Bot,
    defaultSize: { width: 600, height: 440 },
    defaultPosition: { x: 220, y: 220 },
    enabled: false,
  },
] satisfies DesktopApp[];

export const desktopAppMap = new Map(desktopApps.map((app) => [app.id, app]));
