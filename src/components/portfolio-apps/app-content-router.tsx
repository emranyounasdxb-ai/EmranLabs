import type { DesktopAppId } from "@/types/desktop";

import { AboutIdentityApp } from "./about-identity-app";
import { ContactApp } from "./contact-app";
import { PortfolioProjectsApp } from "./portfolio-projects-app";
import { SkillsApp } from "./skills-app";

type AppContentRouterProps = {
  appId: DesktopAppId;
};

export function AppContentRouter({ appId }: AppContentRouterProps) {
  if (appId === "about") return <AboutIdentityApp />;
  if (appId === "skills") return <SkillsApp />;
  if (appId === "portfolio") return <PortfolioProjectsApp />;
  if (appId === "contact") return <ContactApp />;

  return <p>This application is planned for a later phase.</p>;
}
