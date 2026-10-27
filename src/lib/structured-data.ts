import { contactChannels } from "@/content/portfolio-content";
import { projects } from "@/components/workspace/workspace-data";
import { siteConfig, getSiteUrl } from "@/config/site";

const sameAs = contactChannels
  .filter((channel) => channel.id === "linkedin")
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
    email: "helo@emranlabs.com",
    jobTitle: "IT Manager and software product builder",
    image: getSiteUrl("/images/profile/emran.webp"),
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
        itemListElement: projects.map((project, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "CreativeWork",
            name: project.name,
            description: project.summary,
            url: getSiteUrl(`/projects/${project.id}`),
            image: getSiteUrl(project.image),
            keywords: [project.kind, ...project.technologies],
          },
        })),
      },
    ],
  };
}
