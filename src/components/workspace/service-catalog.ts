export const serviceCatalog = [
  {
    id: "business-websites",
    collection: "Business Websites",
    title: "A clearer home for your business.",
    summary:
      "Websites that explain your services, show your work and make the next step easy for your customers.",
    description:
      "For service businesses and independent brands that need a considered, responsive website. I bring the page structure, interface and enquiry journey together, from the first brief to the finished experience.",
    enquiry: "Website or web application",
    projects: ["inaya", "edrive", "emranlabs"],
    deliverables: [
      "Page structure and content priorities",
      "Responsive interface design and development",
      "Service pages and contact journeys",
      "Search and sharing metadata",
      "Launch preparation and an agreed handover",
    ],
    questions: [
      "Who are your customers?",
      "Which services or products matter most?",
      "Do you have a current website, brand assets or content?",
    ],
  },
  {
    id: "booking-systems",
    collection: "Booking Systems",
    title: "From browsing to a clear request.",
    summary:
      "Package discovery, booking requests and follow-up journeys designed around the way your business works.",
    description:
      "A booking journey needs to be understandable for both the visitor and the person handling the request. We can define the information you need, availability decisions and the steps that follow submission before building the flow.",
    enquiry: "Website or web application",
    projects: ["edrive"],
    deliverables: [
      "Package or service discovery screens",
      "Request forms and validation",
      "Reference-based follow-up where needed",
      "Clear pending and confirmed states",
      "Integration requirements agreed in the brief",
    ],
    questions: [
      "What can a customer request or book?",
      "Who confirms availability?",
      "Are payments or an existing booking platform involved?",
    ],
  },
  {
    id: "business-automation",
    collection: "Business Automation",
    title: "Less repetition. Clearer next steps.",
    summary:
      "Practical forms, integrations and connected workflows that help information reach the right place.",
    description:
      "Start with a repeated task, the systems involved and the result you need. I can help map the workflow and develop a focused integration, with useful status feedback and failure handling. eDrive shows related request and follow-up work; the scope of your automation is agreed separately.",
    enquiry: "Business workflow or automation",
    projects: ["edrive"],
    deliverables: [
      "A map of the current and proposed workflow",
      "Data inputs, outputs and integration requirements",
      "A focused form, API or automation implementation",
      "Validation and failure handling",
      "Testing against the agreed workflow",
    ],
    questions: [
      "Which task do you repeat?",
      "What tools and data sources are involved?",
      "Which decisions still need a person?",
    ],
  },
  {
    id: "interface-design",
    collection: "Interface Design",
    title: "Interfaces with a clear purpose.",
    summary:
      "Thoughtful screens and user journeys for websites and web applications, designed by the person building them.",
    description:
      "I designed and developed eDrive and INAYA independently. My interface work focuses on helping people understand their options and complete the next step, with attention to typography, responsive layouts and useful interaction details.",
    enquiry: "Design, video or 3D project",
    projects: ["inaya", "edrive", "emranlabs"],
    deliverables: [
      "User journeys and page hierarchy",
      "Screen layouts and visual direction",
      "Reusable interface patterns",
      "Responsive and interaction states",
      "Implementation or handover scope agreed up front",
    ],
    questions: [
      "What should the user be able to do?",
      "Are we improving something existing or starting fresh?",
      "Which screens and device sizes matter most?",
    ],
  },
  {
    id: "cloud-it",
    collection: "Cloud & IT",
    title: "A considered technical foundation.",
    summary:
      "Discuss cloud infrastructure, Microsoft 365, networks and the operational needs behind your software.",
    description:
      "My background includes IT operations, Microsoft 365, Azure and network administration. Share your current environment and the problem you need to solve so we can establish a suitable scope. A public Cloud & IT case study is not available yet.",
    enquiry: "Cloud & IT project",
    projects: [],
    deliverables: [
      "A review of the stated technical requirements",
      "Proposed scope and dependencies",
      "Implementation steps for the agreed environment",
      "Verification and handover documentation",
    ],
    questions: [
      "What environment do you use today?",
      "What needs to change or improve?",
      "What access, availability or operational constraints apply?",
    ],
  },
] as const;

export type ServiceId = (typeof serviceCatalog)[number]["id"];
export type ServiceCollection = (typeof serviceCatalog)[number]["collection"];
export function getService(value?: string) {
  return serviceCatalog.find(
    (service) => service.id === value || service.collection === value,
  );
}

export const projectProcess = [
  [
    "01",
    "Understand",
    "We discuss the people using it, the problem and your priorities.",
  ],
  [
    "02",
    "Agree the scope",
    "Deliverables, schedule, price and revision stages are agreed before the project begins.",
  ],
  [
    "03",
    "Design & build",
    "You work directly with me as the interface and implementation take shape.",
  ],
  [
    "04",
    "Review & hand over",
    "We review the agreed work, prepare the handover and confirm any ongoing support separately.",
  ],
] as const;

export const serviceFaqs = [
  [
    "Who will work on my project?",
    "I’m Emran Younas, an independent designer and developer. You work directly with me on design, development and project communication.",
  ],
  [
    "How much will it cost, and how long will it take?",
    "That depends on the scope, content, integrations and review needs. Share your brief and I’ll discuss the requirements with you before proposing a price or schedule.",
  ],
  [
    "How do revisions work?",
    "We agree the review stages and included revisions in the project scope. If your requirements change, we discuss the effect on the work, price and schedule before proceeding.",
  ],
  [
    "What happens after launch?",
    "Handover and any ongoing maintenance or support are agreed as part of the proposal. Hosting, subscriptions and third-party services are identified separately where relevant.",
  ],
  [
    "Does sending an enquiry book the project?",
    "No. The automated email confirms that your enquiry was received. A project starts only after we have discussed and agreed the scope and terms.",
  ],
] as const;
