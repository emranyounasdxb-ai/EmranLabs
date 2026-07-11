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

export type ContactChannel = {
  id: string;
  label: string;
  value: string;
  href: string;
  description: string;
  icon: LucideIcon;
  external: boolean;
};
