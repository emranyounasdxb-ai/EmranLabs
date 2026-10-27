export type ProjectStory = {
  role: string;
  responsibility: string;
  goal: string;
  approach: string[];
  outcome: string;
  gallery: { image: string; caption: string }[];
};
export const projectStories: Record<string, ProjectStory> = {
  edrive: {
    role: "Sole designer & developer",
    responsibility:
      "I designed and developed eDrive independently, taking responsibility for both the visitor experience and its implementation.",
    goal: "Help visitors compare water-sports experiences and turn their preferred package, date and guest details into a clear booking request.",
    approach: [
      "I organized jet ski and jet car packages into a clear discovery journey, with information visitors need before making a request.",
      "I built the request flow around package, time and guest details, with a booking reference, saving feedback and retry handling.",
      "I kept request submission distinct from booking confirmation and designed the staff workflow for availability, handover and collection follow-up.",
    ],
    outcome:
      "The live website connects package discovery, booking requests and reference-based lookup. Visitors can see what happens next without treating a request as a confirmed booking or payment.",
    gallery: [
      {
        image: "/images/projects/edrive-packages.webp",
        caption: "Package discovery — comparing the available experiences.",
      },
      {
        image: "/images/projects/edrive-booking.webp",
        caption:
          "Booking lookup — a dedicated place to follow up on a request.",
      },
    ],
  },
  inaya: {
    role: "Sole designer & developer",
    responsibility:
      "I handled INAYA’s design and development myself, including the bilingual layouts and service enquiry experience.",
    goal: "Make household service options, published pricing and enquiry requirements clear for both English- and Arabic-speaking visitors in the UAE.",
    approach: [
      "I structured services, pricing, service areas and guidance so visitors can understand their options before contacting the business.",
      "I built English and Arabic pages with localized navigation and right-to-left layouts for Arabic.",
      "I added form validation, clear delivery feedback and retained entries after errors. An accepted enquiry receives a reference and is distinguished from a confirmed booking.",
    ],
    outcome:
      "The live website provides a consistent bilingual service and enquiry journey. Visitors can explore the available information in their preferred language and prepare a more specific enquiry.",
    gallery: [
      {
        image: "/images/projects/inaya-services.webp",
        caption:
          "Service discovery — a structured view of household service options.",
      },
      {
        image: "/images/projects/inaya-arabic.webp",
        caption:
          "Arabic experience — localized content and right-to-left navigation.",
      },
    ],
  },
  emranlabs: {
    role: "Independent portfolio project",
    responsibility:
      "My personal workspace for presenting the projects I design and build, and the technical areas I work in.",
    goal: "Make a portfolio that feels familiar to explore while giving every project a clear, directly accessible story.",
    approach: [
      "A desktop-inspired interface with project folders, Quick Look, independent windows and keyboard navigation.",
      "A focused mobile layout with touch-friendly project cards and direct access to About, Services and Contact.",
      "Static project and profile pages, local optimized assets and restrained motion with accessibility preferences.",
    ],
    outcome:
      "The current local preview brings my projects, technical focus and contact details into one workspace. The desktop is still being refined locally before publication.",
    gallery: [
      {
        image: "/images/projects/emranlabs-about-customer.webp",
        caption:
          "About Emran — the person and technical focus behind the work.",
      },
      {
        image: "/images/projects/emranlabs-contact-customer.webp",
        caption:
          "Work with me — direct contact and website enquiries with an automated receipt.",
      },
    ],
  },
};
