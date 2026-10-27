import type { Metadata } from "next";
import { ContactPanel } from "@/components/workspace/contact-panel";
import { StandalonePage } from "@/components/workspace/standalone-page";
import { getSiteUrl } from "@/config/site";
export const metadata: Metadata = {
  title: "Contact Emran Younas — Discuss Your Project",
  description:
    "Contact Emran directly at helo@emranlabs.com to discuss a website, web application, automation or IT project. Prepare an enquiry or connect on LinkedIn.",
  alternates: { canonical: getSiteUrl("/contact") },
  openGraph: {
    title: "Contact Emran — EmranLabs",
    url: getSiteUrl("/contact"),
    type: "website",
  },
};
export default function ContactPage() {
  return (
    <StandalonePage>
      <ContactPanel />
    </StandalonePage>
  );
}
