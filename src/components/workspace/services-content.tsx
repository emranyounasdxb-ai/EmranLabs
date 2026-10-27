import Link from "next/link";
import {
  ArrowRight,
  Globe,
  CalendarCheck,
  Workflow,
  PenTool,
  Cloud,
  Check,
} from "lucide-react";
import { serviceCatalog, projectProcess, serviceFaqs } from "./service-catalog";

const icons = [Globe, CalendarCheck, Workflow, PenTool, Cloud];

export function WorkingTogether() {
  return (
    <>
      <section
        className="working-together"
        aria-labelledby="working-together-title"
      >
        <span className="eyebrow">A CLEAR WAY FORWARD</span>
        <h2 id="working-together-title">
          From first conversation to handover.
        </h2>
        <ol className="project-process">
          {projectProcess.map(([step, title, text]) => (
            <li key={step}>
              <span>{step}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ol>
      </section>
      <section className="service-faqs" aria-labelledby="service-faqs-title">
        <h2 id="service-faqs-title">A few things you might be wondering.</h2>
        {serviceFaqs.map(([question, answer]) => (
          <details key={question}>
            <summary>{question}</summary>
            <p>{answer}</p>
          </details>
        ))}
      </section>
    </>
  );
}

export function ServicesContent({ onContact }: { onContact?: () => void }) {
  return (
    <article className="services-content">
      <span className="eyebrow">INDEPENDENT BY DESIGN</span>
      <h1>
        Good ideas deserve
        <br />a thoughtful build.
      </h1>
      <p className="services-lead">
        Websites, useful workflows and considered interfaces. You work directly
        with me, Emran, from the first conversation to the final details.
      </p>
      <div className="service-list customer-service-list">
        {serviceCatalog.map((service, index) => {
          const Icon = icons[index];
          return (
            <section key={service.id}>
              <Icon size={23} />
              <div>
                <span>
                  0{index + 1} / {service.collection.toUpperCase()}
                </span>
                <h2>{service.title}</h2>
                <p>{service.summary}</p>
                <ul>
                  {service.deliverables.slice(0, 3).map((item) => (
                    <li key={item}>
                      <Check size={13} />
                      {item}
                    </li>
                  ))}
                </ul>
                <a href={`/services/${service.id}`}>
                  What’s included <ArrowRight size={14} />
                </a>
              </div>
            </section>
          );
        })}
      </div>
      <WorkingTogether />
      <div className="service-next">
        <h2>Tell me what you have in mind.</h2>
        <p>
          Share the problem, your priorities and any references. We can work out
          the right next step together.
        </p>
        {onContact ? (
          <button className="primary-button" onClick={onContact}>
            Start a conversation <ArrowRight size={15} />
          </button>
        ) : (
          <Link className="primary-button" href="/contact">
            Start a conversation <ArrowRight size={15} />
          </Link>
        )}
      </div>
    </article>
  );
}
