import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProjectDetails } from "@/components/workspace/project-details";
import { projects } from "@/components/workspace/workspace-data";
import { getSiteUrl } from "@/config/site";

export function generateStaticParams() {
  return projects.map((project) => ({ id: project.id }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const project = projects.find((item) => item.id === id);
  if (!project) return {};
  return {
    title: `${project.name} — ${project.kind}`,
    description: project.summary,
    alternates: { canonical: getSiteUrl(`/projects/${id}`) },
    openGraph: {
      title: `${project.name} | Emran Labs`,
      description: project.summary,
      url: getSiteUrl(`/projects/${id}`),
      type: "website",
      images: [
        {
          url: getSiteUrl(`/images/social/${id}.png`),
          width: 1200,
          height: 630,
          alt: `${project.name} — designed and built by Emran Younas`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${project.name} | Emran Labs`,
      description: project.summary,
      images: [getSiteUrl(`/images/social/${id}.png`)],
    },
  };
}
export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = projects.find((item) => item.id === id);
  if (!project) notFound();
  return (
    <main className="project-page">
      <div className="project-page-inner">
        <Link href="/" className="text-link back-link">
          <ArrowLeft size={15} /> Back to the workspace
        </Link>
        <ProjectDetails project={project} />
      </div>
    </main>
  );
}
