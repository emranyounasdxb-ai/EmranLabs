import type { Metadata } from "next";
import { ServicesContent } from "@/components/workspace/services-content";
import { StandalonePage } from "@/components/workspace/standalone-page";
import { getSiteUrl } from "@/config/site";
export const metadata: Metadata = {
  title: "Web Design, Development & IT — Work with Emran",
  description:
    "Work directly with Emran Younas on responsive websites, web applications, business workflows and cloud and IT projects. Independent design and development in Dubai.",
  alternates: { canonical: getSiteUrl("/services") },
  openGraph: {
    title: "Work with Emran — EmranLabs",
    url: getSiteUrl("/services"),
    type: "website",
  },
};
export default function ServicesPage() {
  return (
    <StandalonePage>
      <ServicesContent />
    </StandalonePage>
  );
}
