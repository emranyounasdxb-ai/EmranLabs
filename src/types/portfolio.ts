import type { LucideIcon } from "lucide-react";

export type ProjectStatus = "Active product ecosystem" | "In development";

export type PortfolioIdentity = {
  brand: string;
  tagline: string;
  role: string;
  introduction: string;
  focusAreas: readonly string[];
  workingPrinciples: readonly string[];
};

export type FocusArea = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

export type SkillItem = {
  name: string;
};

export type SkillGroup = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  skills: readonly SkillItem[];
};

export type ProjectCapability = {
  label: string;
};

export type PortfolioProject = {
  id: string;
  name: string;
  category: string;
  summary: string;
  description: string;
  status: ProjectStatus;
  platforms: readonly string[];
  capabilities: readonly ProjectCapability[];
  technologies: readonly string[];
  currentFocus: readonly string[];
};

export type JourneyCapability = {
  label: string;
  description: string;
};

export type JourneyChapter = {
  id: string;
  label: string;
  title: string;
  summary: string;
  description: string;
  capabilities: readonly JourneyCapability[];
  disciplines: readonly string[];
  relatedProducts: readonly string[];
  status: string;
  icon: LucideIcon;
};

export type CreativeLabStatus =
  | "Exploration"
  | "Concept direction"
  | "Prototype direction"
  | "Research theme"
  | "Planned experiment";

export type CreativeLab = {
  id: string;
  name: string;
  theme: string;
  summary: string;
  description: string;
  status: CreativeLabStatus;
  focusAreas: readonly string[];
  technologies: readonly string[];
  questions: readonly string[];
  icon: LucideIcon;
};

export type ContactChannel = {
  id: string;
  label: string;
  value: string;
  href: string;
  description: string;
  icon: LucideIcon;
  external: boolean;
};
