import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import Image from "next/image";
import { getSiteUrl } from "@/config/site";
import { serviceCatalog } from "@/components/workspace/service-catalog";
import { StandalonePage } from "@/components/workspace/standalone-page";
import { WorkingTogether } from "@/components/workspace/services-content";
import { ContactChannels } from "@/components/workspace/contact-channels";
import { projects } from "@/components/workspace/workspace-data";

export const dynamicParams = false;
export function generateStaticParams() {
  return serviceCatalog.map(({ id }) => ({ id }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const service = serviceCatalog.find((item) => item.id === id);
  if (!service) return {};
  return {
    title: `${service.collection} — Work directly with Emran`,
    description: service.summary,
    alternates: { canonical: getSiteUrl(`/services/${id}`) },
    openGraph: {
      title: `${service.collection} | Emran Labs`,
      description: service.summary,
      type: "website",
      url: getSiteUrl(`/services/${id}`),
      images: [
        { url: getSiteUrl("/opengraph-image"), width: 1200, height: 630 },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${service.collection} | Emran Labs`,
      description: service.summary,
      images: [getSiteUrl("/opengraph-image")],
    },
  };
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const service = serviceCatalog.find((item) => item.id === id);
  if (!service) notFound();
  const examples = projects.filter((project) =>
    (service.projects as readonly string[]).includes(project.id),
  );
  return (
    <StandalonePage>
      <article className="services-content service-detail">
        <span className="eyebrow">
          {service.collection.toUpperCase()} · EMRAN LABS
        </span>
        <h1>{service.title}</h1>
        <p className="services-lead">{service.description}</p>
        <a className="primary-button" href={`/contact/service/${service.id}`}>
          Discuss your project <ArrowRight size={15} />
        </a>
        <div className="service-scope">
          <section>
            <h2>What we can build together</h2>
            <ul>
              {service.deliverables.map((item) => (
                <li key={item}>
                  <Check size={16} />
                  {item}
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h2>A useful starting point</h2>
            <p>
              Bring whatever you already know. These questions help us shape the
              brief.
            </p>
            <ul>
              {service.questions.map((item) => (
                <li key={item}>
                  <ArrowRight size={15} />
                  {item}
                </li>
              ))}
            </ul>
          </section>
        </div>
        {!!examples.length && (
          <section className="service-examples">
            <span className="eyebrow">DESIGNED & BUILT BY EMRAN</span>
            <h2>Explore related work.</h2>
            <div>
              {examples.map((project) => (
                <a href={`/projects/${project.id}`} key={project.id}>
                  <Image
                    src={project.image}
                    alt={`${project.name} interface`}
                    width={640}
                    height={400}
                    sizes="(max-width:760px) 90vw, 350px"
                  />
                  <h3>
                    {project.name}
                    <ArrowRight size={15} />
                  </h3>
                  <p>{project.kind}</p>
                </a>
              ))}
            </div>
          </section>
        )}
        <WorkingTogether />
        <ContactChannels service={service.id} />
        <div className="service-next">
          <h2>Let’s start with your brief.</h2>
          <p>
            Scope, price, schedule and support are agreed before work starts.
          </p>
          <a className="primary-button" href={`/contact/service/${service.id}`}>
            Tell me about your project <ArrowRight size={15} />
          </a>
        </div>
      </article>
    </StandalonePage>
  );
}
