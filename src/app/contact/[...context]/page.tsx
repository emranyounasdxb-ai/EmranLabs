import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContactPanel } from "@/components/workspace/contact-panel";
import { parseContactPath } from "@/components/workspace/contact-location";
import { StandalonePage } from "@/components/workspace/standalone-page";
import { getSiteUrl } from "@/config/site";

export const metadata: Metadata = {
  title: "Discuss Your Project — Emran Labs",
  alternates: { canonical: getSiteUrl("/contact") },
  robots: { index: false, follow: true },
};
export default async function ContextContactPage({
  params,
}: {
  params: Promise<{ context: string[] }>;
}) {
  const { context: segments } = await params;
  const context = parseContactPath(`/contact/${segments.join("/")}`);
  if (!context) notFound();
  return (
    <StandalonePage>
      <ContactPanel context={context} />
    </StandalonePage>
  );
}
