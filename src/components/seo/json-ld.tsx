import { getSiteUrl, siteConfig } from "@/config/site";
import {
  portfolioIdentity,
  portfolioProjects,
} from "@/content/portfolio-content";

type JsonLdObject = Record<string, unknown>;

function serializeJsonLd(value: JsonLdObject | JsonLdObject[]) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function PortfolioJsonLd() {
  const canonicalUrl = getSiteUrl("/");
  const personId = `${canonicalUrl}#person`;
  const websiteId = `${canonicalUrl}#website`;

  const graph: JsonLdObject[] = [
    {
      "@type": "WebSite",
      "@id": websiteId,
      name: siteConfig.name,
      url: canonicalUrl,
      description: siteConfig.description,
      inLanguage: "en",
    },
    {
      "@type": "ProfilePage",
      "@id": `${canonicalUrl}#profile-page`,
      url: canonicalUrl,
      name: siteConfig.name,
      description: portfolioIdentity.introduction,
      isPartOf: { "@id": websiteId },
      about: { "@id": personId },
      inLanguage: "en",
    },
    {
      "@type": "Person",
      "@id": personId,
      name: siteConfig.brandName,
      alternateName: portfolioIdentity.brand,
      description: portfolioIdentity.introduction,
      url: canonicalUrl,
      knowsAbout: portfolioIdentity.focusAreas,
    },
    {
      "@type": "ItemList",
      "@id": `${canonicalUrl}#portfolio-projects`,
      name: "Confirmed EMRAN LABS portfolio projects",
      itemListElement: portfolioProjects.map((project, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: project.name,
        description: project.summary,
        url: `${canonicalUrl}#${project.id}`,
      })),
    },
  ];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: serializeJsonLd({
          "@context": "https://schema.org",
          "@graph": graph,
        }),
      }}
    />
  );
}

export const __testing = { serializeJsonLd };
