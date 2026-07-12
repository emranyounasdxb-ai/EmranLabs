import {
  contactChannels,
  portfolioProjects,
} from "@/content/portfolio-content";
import { siteConfig, getSiteUrl } from "@/config/site";

const sameAs = contactChannels
  .filter((channel) => channel.id === "github" || channel.id === "linkedin")
  .map((channel) => channel.href);

export function getStructuredData() {
  const website = {
    "@type": "WebSite",
    "@id": getSiteUrl("/#website"),
    url: getSiteUrl("/"),
    name: siteConfig.name,
    description: siteConfig.description,
    inLanguage: "en",
  };

  const person = {
    "@type": "Person",
    "@id": getSiteUrl("/#person"),
    name: "Emran Younas",
    url: getSiteUrl("/"),
    sameAs,
    knowsAbout: [
      "Software architecture",
      "AI solutions",
      "SaaS applications",
      "Web applications",
      "Mobile applications",
      "Business automation",
      "Cloud delivery",
    ],
  };

  return {
    "@context": "https://schema.org",
    "@graph": [
      website,
      person,
      {
        "@type": "ProfilePage",
        "@id": getSiteUrl("/#profile"),
        url: getSiteUrl("/"),
        name: `${siteConfig.name} portfolio`,
        description: siteConfig.description,
        isPartOf: { "@id": website["@id"] },
        about: { "@id": person["@id"] },
        mainEntity: { "@id": person["@id"] },
      },
      {
        "@type": "ItemList",
        "@id": getSiteUrl("/#portfolio-projects"),
        name: "Confirmed EMRAN LABS portfolio projects",
        itemListElement: portfolioProjects.map((project, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "CreativeWork",
            name: project.name,
            description: project.summary,
            keywords: [project.category, ...project.technologies],
          },
        })),
      },
    ],
  };
}
