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
  CreativeLab,
  FocusArea,
  JourneyChapter,
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

export const journeyChapters = [
  {
    id: "it-operations-leadership",
    label: "Capability evolution",
    title: "IT operations and technical leadership",
    summary:
      "Reliable technology operations with infrastructure awareness, access discipline, production support, and team collaboration.",
    description:
      "This direction centers on dependable IT operations and practical technical leadership. The focus is keeping technology environments organized, supportable, secure, and aligned with the needs of professional teams and production workflows.",
    capabilities: [
      {
        label: "Reliable technology operations",
        description:
          "Operational thinking for stable systems, structured support, and dependable access to business-critical tools.",
      },
      {
        label: "Infrastructure awareness",
        description:
          "Awareness of hosting, deployment environments, production constraints, and the operational impact of technical decisions.",
      },
      {
        label: "Team collaboration",
        description:
          "Clear coordination across technical and business conversations so delivery choices remain practical and maintainable.",
      },
    ],
    disciplines: [
      "Access and deployment discipline",
      "Production support",
      "Security-minded operations",
      "Team collaboration",
    ],
    relatedProducts: ["eDrive", "Aliyas360", "INAYA Domestic"],
    status: "Ongoing",
    icon: ServerCog,
  },
  {
    id: "architecture-product-systems",
    label: "Platform thinking",
    title: "Software architecture and product systems",
    summary:
      "Scalable application structure, secure system design, maintainable codebases, API foundations, and long-term product thinking.",
    description:
      "This chapter describes the product-building shift from isolated features toward durable software systems. The emphasis is architecture that can grow while remaining understandable, secure, and realistic to operate.",
    capabilities: [
      {
        label: "Scalable application structure",
        description:
          "Modular foundations for web, mobile, API, and data-driven product ecosystems.",
      },
      {
        label: "Secure system design",
        description:
          "Security by design across authentication, integrations, data access, and deployment choices.",
      },
      {
        label: "Maintainable codebases",
        description:
          "Clean implementation patterns that support long-term product delivery and future iteration.",
      },
    ],
    disciplines: [
      "API and database foundations",
      "Clean maintainable systems",
      "Long-term product thinking",
    ],
    relatedProducts: ["eDrive", "Aliyas360", "INAYA Domestic"],
    status: "Delivery discipline",
    icon: Layers3,
  },
  {
    id: "web-mobile-delivery",
    label: "Product delivery",
    title: "Web and mobile product delivery",
    summary:
      "Next.js, React, TypeScript, Tailwind CSS, React Native, Expo, authentication, notifications, and production deployment.",
    description:
      "This direction focuses on delivering professional web and mobile application experiences that connect product strategy with usable interfaces, typed engineering, and deployment readiness.",
    capabilities: [
      {
        label: "Web delivery",
        description:
          "Next.js, React, TypeScript, and Tailwind CSS for responsive product interfaces.",
      },
      {
        label: "Mobile delivery",
        description:
          "React Native, Expo, and Capacitor when appropriate for mobile product reach.",
      },
      {
        label: "Product readiness",
        description:
          "Authentication, push notifications, and deployment planning as part of delivery thinking.",
      },
    ],
    disciplines: [
      "Responsive interface delivery",
      "Authentication",
      "Push notifications",
      "Production deployment",
    ],
    relatedProducts: ["eDrive", "Aliyas360", "INAYA Domestic"],
    status: "Current focus",
    icon: Smartphone,
  },
  {
    id: "data-apis-cloud",
    label: "Delivery discipline",
    title: "Data, APIs, and cloud delivery",
    summary:
      "FastAPI, Supabase, PostgreSQL, API integrations, Docker, GitHub-based delivery, cPanel, WHM, and cloud deployment.",
    description:
      "This capability direction connects application interfaces to reliable data, APIs, integrations, and deployment workflows so products can move toward production-ready delivery.",
    capabilities: [
      {
        label: "API foundations",
        description:
          "FastAPI and integrations for structured product workflows and service coordination.",
      },
      {
        label: "Data foundations",
        description:
          "Supabase and PostgreSQL for practical product data models and persistence needs.",
      },
      {
        label: "Release workflows",
        description:
          "GitHub, Docker, cPanel, WHM, and cloud deployment as part of controlled delivery.",
      },
    ],
    disciplines: [
      "API integrations",
      "GitHub-based delivery",
      "Docker workflows",
      "Cloud deployment",
    ],
    relatedProducts: ["eDrive", "Aliyas360", "INAYA Domestic"],
    status: "Ongoing",
    icon: Cloud,
  },
  {
    id: "ai-automation",
    label: "Product-building focus",
    title: "AI solutions and business automation",
    summary:
      "AI-powered software solutions, business automation, CRM and ERP platform thinking, booking workflows, and operational efficiency.",
    description:
      "This direction explores where AI-powered software and automation can create practical business value while respecting safe boundaries, review needs, and maintainable operations.",
    capabilities: [
      {
        label: "AI-powered software solutions",
        description:
          "Product concepts where AI supports structured workflows rather than replacing accountability.",
      },
      {
        label: "Business automation",
        description:
          "Automation thinking for booking flows, operational handoffs, and repeated business processes.",
      },
      {
        label: "Platform coordination",
        description:
          "CRM and ERP platform thinking for connected business systems and clearer operations.",
      },
    ],
    disciplines: [
      "Practical business value",
      "Safe automation boundaries",
      "Operational efficiency",
    ],
    relatedProducts: ["eDrive", "Aliyas360", "INAYA Domestic"],
    status: "Platform thinking",
    icon: Workflow,
  },
  {
    id: "current-direction",
    label: "Current professional direction",
    title: "Current product-building direction",
    summary:
      "A current focus on eDrive, Aliyas360, and INAYA Domestic across web and mobile ecosystems with scalable product delivery.",
    description:
      "The current professional direction brings together IT management, software architecture, product delivery, automation, and production operations across the eDrive, Aliyas360, and INAYA Domestic product ecosystems.",
    capabilities: [
      {
        label: "Product ecosystem thinking",
        description:
          "Coordinating web and mobile needs across active product directions.",
      },
      {
        label: "Scalable delivery",
        description:
          "Keeping architecture, security, reliability, and maintainability visible during product decisions.",
      },
      {
        label: "Professional execution",
        description:
          "Balancing product ambition with production-ready delivery and practical business value.",
      },
    ],
    disciplines: [
      "Scalable architecture",
      "Security by design",
      "Performance and reliability",
      "Production-ready delivery",
    ],
    relatedProducts: ["eDrive", "Aliyas360", "INAYA Domestic"],
    status: "Current focus",
    icon: Rocket,
  },
] satisfies readonly JourneyChapter[];

export const creativeLabs = [
  {
    id: "adaptive-desktop-interfaces",
    name: "Adaptive Desktop Interfaces",
    theme: "Modern desktop-inspired web interaction",
    summary:
      "Exploring command-driven navigation, responsive window experiences, and accessibility-first behavior for portfolio-grade interfaces.",
    description:
      "This exploration studies how desktop-inspired interaction can remain original, responsive, accessible, and useful inside modern web products without copying operating-system assets.",
    status: "Exploration",
    focusAreas: [
      "Command-driven navigation",
      "Responsive windows",
      "Accessibility-first behavior",
    ],
    technologies: ["Next.js", "React", "TypeScript", "Tailwind CSS"],
    questions: [
      "What problem is this exploration trying to clarify?",
      "What constraints must a production version respect?",
      "What should remain simple for keyboard and touch users?",
    ],
    icon: Compass,
  },
  {
    id: "ai-workflow-concepts",
    name: "AI Workflow Concepts",
    theme: "AI-assisted product workflows",
    summary:
      "Researching structured human review, safe automation boundaries, and practical business value for AI-supported workflows.",
    description:
      "This research theme looks at where AI assistance may support product workflows while keeping review, accountability, and operational safety under human control.",
    status: "Research theme",
    focusAreas: [
      "Structured human review",
      "Safe automation boundaries",
      "Practical business value",
    ],
    technologies: [
      "Workflow mapping",
      "Product architecture",
      "Review patterns",
    ],
    questions: [
      "Which technologies are suitable?",
      "What should remain under human control?",
      "How should business value be validated before production use?",
    ],
    icon: Bot,
  },
  {
    id: "business-automation-blueprints",
    name: "Business Automation Blueprints",
    theme: "Booking, CRM, and ERP coordination",
    summary:
      "Concept direction for booking workflow automation, operational handoffs, and audit-friendly business processes.",
    description:
      "This concept direction frames how booking platforms, CRM thinking, ERP coordination, and operational handoffs could be modeled before implementation decisions are made.",
    status: "Concept direction",
    focusAreas: [
      "Booking workflows",
      "CRM and ERP coordination",
      "Audit-friendly processes",
    ],
    technologies: ["Process mapping", "API integrations", "Database modeling"],
    questions: [
      "What problem is this exploration trying to clarify?",
      "Where are manual approvals necessary?",
      "Which handoffs need traceability?",
    ],
    icon: BriefcaseBusiness,
  },
  {
    id: "mobile-product-prototypes",
    name: "Mobile Product Prototypes",
    theme: "Web-to-mobile product strategy",
    summary:
      "Prototype direction for React Native, Expo, authentication, notifications, and production readiness planning.",
    description:
      "This prototype direction evaluates mobile product patterns that could extend web ecosystems into practical mobile experiences when the product requirements justify it.",
    status: "Prototype direction",
    focusAreas: [
      "React Native and Expo",
      "Notifications",
      "Authentication",
      "Production readiness",
    ],
    technologies: ["React Native", "Expo", "Capacitor when appropriate"],
    questions: [
      "Which technologies are suitable?",
      "What constraints must a production version respect?",
      "What should remain consistent with the web platform?",
    ],
    icon: Smartphone,
  },
  {
    id: "cloud-delivery-experiments",
    name: "Cloud Delivery Experiments",
    theme: "Reliable release processes",
    summary:
      "Planned experiment direction for GitHub-based delivery, Docker workflows, cPanel Passenger, and cloud deployment.",
    description:
      "This planned experiment focuses on release discipline and deployment reliability for product ecosystems that need understandable, repeatable delivery paths.",
    status: "Planned experiment",
    focusAreas: [
      "GitHub-based delivery",
      "Docker workflows",
      "cPanel and Passenger",
      "Cloud deployment",
    ],
    technologies: ["GitHub", "Docker", "cPanel and WHM", "Cloud deployment"],
    questions: [
      "What constraints must a production version respect?",
      "Which release steps should be repeatable?",
      "How should rollback and review remain practical?",
    ],
    icon: Cloud,
  },
] satisfies readonly CreativeLab[];

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
