import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/config/site";
import { projects } from "@/components/workspace/workspace-data";
import { serviceCatalog } from "@/components/workspace/service-catalog";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: getSiteUrl("/"),
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    ...["/about", "/services", "/contact"].map((path) => ({
      url: getSiteUrl(path),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...projects.map((project) => ({
      url: getSiteUrl(`/projects/${project.id}`),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...serviceCatalog.map((service) => ({
      url: getSiteUrl(`/services/${service.id}`),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
