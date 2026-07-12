import { ExternalLink } from "lucide-react";

import {
  contactChannels,
  portfolioIdentity,
} from "@/content/portfolio-content";

import { ContactForm } from "./contact-form";
import { PortfolioSectionHeading } from "./portfolio-section-heading";

export function ContactApp() {
  return (
    <section className="space-y-5">
      <PortfolioSectionHeading
        eyebrow="Professional channels"
        title="Contact EMRAN LABS"
        description="Collaboration and product discussions can begin through the listed professional channels."
      />
      <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-4">
          <div className="rounded-[var(--radius-panel)] border border-[var(--glass-border)] bg-white/[0.04] p-5">
            <h3 className="font-heading text-xl font-semibold text-[var(--text-primary)]">
              {portfolioIdentity.brand}
            </h3>
            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
              {portfolioIdentity.role} focused on scalable, secure,
              professional, future-ready digital products.
            </p>
          </div>
          <ul className="grid gap-3" aria-label="Confirmed contact channels">
            {contactChannels.map((channel) => {
              const Icon = channel.icon;
              return (
                <li key={channel.id}>
                  <a
                    href={channel.href}
                    target={channel.external ? "_blank" : undefined}
                    rel={channel.external ? "noreferrer" : undefined}
                    aria-label={`Open ${channel.label}: ${channel.value}`}
                    className="flex min-h-20 items-center gap-4 rounded-2xl border border-[var(--glass-border)] bg-white/[0.04] p-4 text-[var(--text-primary)] transition hover:border-[rgba(23,227,192,0.42)] hover:bg-white/[0.07]"
                  >
                    <span className="grid size-11 shrink-0 place-items-center rounded-2xl border border-[var(--glass-border)] bg-white/[0.055]">
                      <Icon
                        aria-hidden="true"
                        className="size-5 text-[var(--color-signal)]"
                      />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="font-heading block text-base font-semibold">
                        {channel.label}
                      </span>
                      <span className="block text-sm break-words text-[var(--text-secondary)]">
                        {channel.value}
                      </span>
                      <span className="mt-1 block text-xs text-[var(--text-secondary)]">
                        {channel.description}
                      </span>
                    </span>
                    {channel.external && (
                      <ExternalLink
                        aria-hidden="true"
                        className="size-4 shrink-0 text-[var(--text-secondary)]"
                      />
                    )}
                  </a>
                </li>
              );
            })}
          </ul>
          <div className="rounded-2xl border border-[rgba(23,227,192,0.22)] bg-[rgba(23,227,192,0.06)] p-4 text-xs leading-5 text-[var(--text-secondary)]">
            The secure form is for professional inquiries only. Confirmed
            channels remain available if the form service is temporarily
            unavailable.
          </div>
          <div className="rounded-2xl border border-[var(--glass-border)] bg-white/[0.035] p-4 text-xs leading-5 text-[var(--text-secondary)]">
            Privacy note: optional privacy-respecting analytics may record only
            non-sensitive product interactions when configured. Contact
            inquiries are delivered to the configured mailbox. EM AI
            conversations are processed to generate a response. Please do not
            submit sensitive information.
          </div>
        </div>
        <ContactForm />
      </div>
    </section>
  );
}
