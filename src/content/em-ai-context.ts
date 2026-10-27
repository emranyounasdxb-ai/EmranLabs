import "server-only";

import {
  contactChannels,
  creativeLabs,
  focusAreas,
  journeyChapters,
  portfolioIdentity,
  portfolioProjects,
  skillGroups,
} from "@/content/portfolio-content";

const lines = (title: string, values: readonly string[]) =>
  `${title}: ${values.join(", ")}`;

export function buildEmAiPortfolioContext() {
  return [
    `Identity: ${portfolioIdentity.brand}. Tagline: ${portfolioIdentity.tagline}. Role: ${portfolioIdentity.role}. Introduction: ${portfolioIdentity.introduction}`,
    lines("Focus areas", portfolioIdentity.focusAreas),
    lines("Working principles", portfolioIdentity.workingPrinciples),
    `Capability areas: ${focusAreas.map((area) => `${area.title} - ${area.description}`).join(" | ")}`,
    `Skills: ${skillGroups.map((group) => `${group.title}: ${group.description}; ${group.skills.map((skill) => skill.name).join(", ")}`).join(" | ")}`,
    `Projects: ${portfolioProjects.map((project) => `${project.name} (${project.status}, ${project.category}): ${project.description} Platforms: ${project.platforms.join(", ")}. Capabilities: ${project.capabilities.map((capability) => capability.label).join(", ")}. Technologies: ${project.technologies.join(", ")}. Current focus: ${project.currentFocus.join(", ")}.`).join(" | ")}`,
    `Professional Journey: ${journeyChapters.map((chapter) => `${chapter.title} (${chapter.status}): ${chapter.summary} ${chapter.description} Disciplines: ${chapter.disciplines.join(", ")}. Related products: ${chapter.relatedProducts.join(", ")}.`).join(" | ")}`,
    `Creative Labs: ${creativeLabs.map((lab) => `${lab.name} (${lab.status}): ${lab.summary} ${lab.description} Focus: ${lab.focusAreas.join(", ")}. Technologies: ${lab.technologies.join(", ")}.`).join(" | ")}`,
    `Confirmed contact channels: ${contactChannels.map((channel) => `${channel.label}: ${channel.value} (${channel.href}) - ${channel.description}`).join(" | ")}`,
  ].join("\n");
}
