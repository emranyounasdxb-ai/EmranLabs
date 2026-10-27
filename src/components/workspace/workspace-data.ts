import { workspaceTools, type ToolCollection } from "./workspace-tools";
import {
  serviceCatalog,
  getService,
  type ServiceCollection,
} from "./service-catalog";

export const socialLinks = {
  linkedin: "https://www.linkedin.com/in/emran-younas-641903223/",
  facebook: "https://www.facebook.com/profile.php?id=61591857599555",
  instagram: "https://www.instagram.com/emranlabs/",
  youtube: "https://www.youtube.com/@EmranLabs",
};
export const socialLabels: Record<string, string> = {
  linkedin: "LinkedIn",
  facebook: "Facebook",
  instagram: "Instagram",
  youtube: "YouTube",
};

export type Collection = "Overview" | ToolCollection | ServiceCollection;
export type AppName =
  | "projects"
  | "about"
  | "contact"
  | "notes"
  | "calendar"
  | "settings"
  | "photos"
  | "trash"
  | "help"
  | "services";
export const collections: Collection[] = [
  "Overview",
  ...serviceCatalog.map((service) => service.collection),
  ...workspaceTools.map((tool) => tool.collection),
];
export const projects = [
  {
    id: "edrive",
    name: "eDrive",
    kind: "Water sports & tourism",
    monogram: "e",
    logo: "/images/projects/edrive-brand-icon.webp",
    color: "#00a6b8",
    summary:
      "A water sports website for Dubai Islands, bringing jet ski and jet car packages, booking requests and guest support into one clear experience.",
    technologies: [
      "React",
      "Next.js",
      "TypeScript",
      "Tailwind CSS",
      "Supabase",
    ],
    status: "Live website",
    note: "Water sports discovery, booking requests and guest support",
    live: "https://edrivedubai.ae/",
    displayUrl: "edrivedubai.ae",
    image: "/images/projects/edrive.webp",
    features: [
      "Jet ski and jet car package discovery",
      "Booking requests and booking lookup",
      "Membership and customer support journeys",
    ],
  },
  {
    id: "inaya",
    name: "INAYA Domestic",
    kind: "Services & operations",
    monogram: "i",
    logo: "/images/projects/inaya-brand-icon.webp",
    color: "#a17a55",
    summary:
      "An English and Arabic domestic services website for the UAE, making service options, published pricing and enquiry preparation easy to explore.",
    technologies: [
      "React",
      "Next.js",
      "TypeScript",
      "Tailwind CSS",
      "next-intl",
    ],
    status: "Live website",
    note: "Bilingual services, pricing and enquiry journeys",
    live: "https://inayadomestic.ae/en/",
    displayUrl: "inayadomestic.ae",
    image: "/images/projects/inaya.webp",
    features: [
      "English and Arabic with RTL layouts",
      "Services, pricing and UAE service areas",
      "Enquiry preparation, FAQs and guides",
    ],
  },
  {
    id: "emranlabs",
    name: "EmranLabs",
    kind: "Personal digital workspace",
    monogram: "em",
    logo: "/icon.svg",
    color: "#2577dc",
    summary:
      "My personal corner of the internet. A desktop-inspired portfolio for exploring the things I build, the tools I use and the ideas I am working on.",
    technologies: ["React", "Next.js", "Node.js", "TypeScript"],
    status: "Local preview",
    note: "The workspace you are exploring now",
    live: null,
    displayUrl: "emranlabs.com · local preview",
    image: "/images/projects/emranlabs-customer.webp",
    features: [
      "An interactive desktop for exploring projects",
      "Search, keyboard shortcuts and window controls",
      "Static project pages with metadata and social previews",
    ],
  },
];
export type Project = (typeof projects)[number];

export function projectMatchesCollection(
  project: Project,
  collection: Collection,
) {
  if (collection === "Overview" || collection === "All Projects") return true;
  const service = getService(collection);
  return service
    ? (service.projects as readonly string[]).includes(project.id)
    : project.technologies.includes(collection);
}
