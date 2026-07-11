import {
  Bot,
  BriefcaseBusiness,
  Cloud,
  Code2,
  Compass,
  Database,
  GitBranch,
  Globe2,
  Layers3,
  LockKeyhole,
  Rocket,
  ServerCog,
  ShieldCheck,
  Smartphone,
  Sparkles,
  UserRound,
  Workflow,
} from "lucide-react";

import type {
  ContactChannel,
  FocusArea,
  PortfolioIdentity,
  PortfolioProject,
  SkillGroup,
} from "@/types/portfolio";

export const portfolioIdentity = {
  brand: "EMRAN LABS",
  tagline: "Building the Future of AI & Digital Experiences",
  role: "IT Manager and software product builder",
  introduction:
    "EMRAN LABS is the personal technology brand and portfolio of an IT Manager and software product builder focused on scalable, secure, professional, future-ready digital products across software architecture, web applications, mobile applications, AI solutions, automation, cloud deployment, and product delivery.",
  focusAreas: [
    "AI-powered software solutions",
    "SaaS applications",
    "Mobile applications",
    "Web applications",
    "Business automation systems",
    "CRM and ERP platforms",
    "Booking platforms",
    "Real estate technology",
    "Travel and tourism technology",
    "Cloud-based solutions",
  ],
  workingPrinciples: [
    "Scalable architecture",
    "Security by design",
    "Performance and reliability",
    "Clean maintainable systems",
    "Long-term product thinking",
    "Production-ready delivery",
  ],
} satisfies PortfolioIdentity;

export const focusAreas = [
  {
    id: "architecture",
    title: "Software architecture",
    description:
      "Structured product foundations for web, mobile, cloud, and API ecosystems.",
    icon: Layers3,
  },
  {
    id: "ai-solutions",
    title: "AI solutions",
    description:
      "Practical AI-powered software experiences aligned with product workflows.",
    icon: Bot,
  },
  {
    id: "automation",
    title: "Business automation",
    description:
      "Systems that connect operations, booking flows, CRM, ERP, and delivery needs.",
    icon: Workflow,
  },
  {
    id: "deployment",
    title: "Production delivery",
    description:
      "Secure deployment paths using GitHub, Docker, cPanel, WHM, and cloud platforms.",
    icon: Rocket,
  },
] satisfies readonly FocusArea[];

export const skillGroups = [
  {
    id: "frontend",
    title: "Frontend Engineering",
    description:
      "Modern web interfaces with typed components, responsive layouts, and maintainable UI systems.",
    icon: Code2,
    skills: [
      { name: "Next.js" },
      { name: "React" },
      { name: "TypeScript" },
      { name: "Tailwind CSS" },
    ],
  },
  {
    id: "mobile",
    title: "Mobile Development",
    description:
      "Mobile application delivery paths for product ecosystems that need web and mobile reach.",
    icon: Smartphone,
    skills: [
      { name: "React Native" },
      { name: "Expo" },
      { name: "Capacitor when appropriate" },
      { name: "Push notifications" },
    ],
  },
  {
    id: "backend",
    title: "Backend and APIs",
    description:
      "API-first systems for product workflows, integrations, authentication, and operations.",
    icon: ServerCog,
    skills: [
      { name: "FastAPI" },
      { name: "Node.js when required" },
      { name: "API integrations" },
      { name: "Authentication" },
    ],
  },
  {
    id: "data-cloud",
    title: "Data and Cloud",
    description:
      "Reliable data foundations and deployment environments for future-ready products.",
    icon: Database,
    skills: [
      { name: "Supabase" },
      { name: "PostgreSQL" },
      { name: "Cloud deployment" },
      { name: "cPanel and WHM" },
    ],
  },
  {
    id: "product-systems",
    title: "Product Systems",
    description:
      "Business-focused platforms for bookings, property workflows, services, CRM, and ERP needs.",
    icon: BriefcaseBusiness,
    skills: [
      { name: "SaaS applications" },
      { name: "Booking platforms" },
      { name: "CRM and ERP platforms" },
      { name: "Business automation systems" },
    ],
  },
  {
    id: "engineering-ops",
    title: "Engineering Operations",
    description:
      "Delivery practices for secure, maintainable, production-oriented software products.",
    icon: ShieldCheck,
    skills: [
      { name: "GitHub" },
      { name: "Docker" },
      { name: "Production deployment" },
      { name: "Security by design" },
    ],
  },
] satisfies readonly SkillGroup[];

export const portfolioProjects = [
  {
    id: "edrive",
    name: "eDrive",
    category: "Water sports and tourism technology product",
    summary:
      "A business application ecosystem for water sports and tourism operations with web and mobile requirements.",
    description:
      "eDrive is an active product ecosystem focused on water sports and tourism technology. Relevant product areas include booking, customer experience, operations, deployment, and a professional web and mobile application foundation.",
    status: "Active product ecosystem",
    platforms: ["Web", "Mobile"],
    capabilities: [
      { label: "Booking" },
      { label: "Customer experience" },
      { label: "Operations" },
      { label: "Deployment" },
    ],
    technologies: [
      "Next.js",
      "React",
      "TypeScript",
      "FastAPI",
      "Supabase",
      "PostgreSQL",
    ],
    currentFocus: [
      "Product direction",
      "Platform architecture",
      "Web and mobile application requirements",
      "Operational workflows",
    ],
  },
  {
    id: "aliyas360",
    name: "Aliyas360",
    category: "Real estate technology platform",
    summary:
      "A web and mobile application ecosystem for property, customer, operational, and digital experience capabilities.",
    description:
      "Aliyas360 is an active real estate technology platform direction for a web and mobile application ecosystem. Its relevant capabilities span property workflows, customer experience, operations, and digital product delivery.",
    status: "In development",
    platforms: ["Web", "Mobile"],
    capabilities: [
      { label: "Property workflows" },
      { label: "Customer experience" },
      { label: "Operations" },
      { label: "Digital experience" },
    ],
    technologies: [
      "Next.js",
      "React",
      "TypeScript",
      "Supabase",
      "PostgreSQL",
      "API integrations",
    ],
    currentFocus: [
      "Product direction",
      "Platform architecture",
      "Web and mobile ecosystem",
      "Operational capabilities",
    ],
  },
  {
    id: "inaya-domestic",
    name: "INAYA Domestic",
    category: "Domestic services technology platform",
    summary:
      "A domestic services platform direction for booking, ERP, workforce, and management capabilities.",
    description:
      "INAYA Domestic is an active domestic services technology platform direction. Relevant product areas include booking workflows, ERP needs, workforce management, service operations, and web and mobile application delivery.",
    status: "In development",
    platforms: ["Web", "Mobile"],
    capabilities: [
      { label: "Booking" },
      { label: "ERP" },
      { label: "Workforce" },
      { label: "Management" },
    ],
    technologies: [
      "Next.js",
      "React",
      "TypeScript",
      "FastAPI",
      "Supabase",
      "PostgreSQL",
    ],
    currentFocus: [
      "Product direction",
      "Booking architecture",
      "Workforce workflows",
      "Web and mobile application needs",
    ],
  },
] satisfies readonly PortfolioProject[];

export const contactChannels = [
  {
    id: "website",
    label: "Official Website",
    value: "emranlabs.com",
    href: "https://emranlabs.com",
    description: "Primary website for EMRAN LABS.",
    icon: Globe2,
    external: true,
  },
  {
    id: "github",
    label: "GitHub",
    value: "github.com/emranyounasdxb-ai",
    href: "https://github.com/emranyounasdxb-ai",
    description: "Code and repository profile.",
    icon: GitBranch,
    external: true,
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    value: "linkedin.com/in/emran-younas-641903223",
    href: "https://www.linkedin.com/in/emran-younas-641903223/",
    description: "Professional profile and product discussion channel.",
    icon: UserRound,
    external: true,
  },
] satisfies readonly ContactChannel[];

export const engineeringPrincipleIcons = [
  ShieldCheck,
  LockKeyhole,
  Cloud,
  Compass,
  Sparkles,
  Rocket,
] as const;
