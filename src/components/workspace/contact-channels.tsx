"use client";

import Image from "next/image";
import { trackEvent } from "@/lib/analytics/client";
import { projects } from "./workspace-data";
import { getService } from "./service-catalog";

export const contactNumbers = [
  {
    country: "United Arab Emirates",
    region: "uae",
    display: "+971 52 385 7572",
    digits: "971523857572",
    flag: "ae",
  },
  {
    country: "Pakistan",
    region: "pakistan",
    display: "+92 323 3333898",
    digits: "923233333898",
    flag: "pk",
  },
] as const;

export function whatsappUrl(
  digits: string,
  project?: string,
  service?: string,
) {
  const confirmedProject = projects.find(
    (item) => item.id === project || item.name === project,
  );
  const confirmedService = getService(service);
  const text = confirmedProject
    ? `Hi Emran, I saw your ${confirmedProject.name} project on Emran Labs and would like to discuss something similar.`
    : confirmedService
      ? `Hi Emran, I’d like to discuss ${confirmedService.collection.toLowerCase()} for my business.`
      : "Hi Emran, I found your work on Emran Labs and would like to discuss a project.";
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

export function ContactChannels({
  project,
  service,
}: {
  project?: string;
  service?: string;
}) {
  const projectId = projects.find(
    (item) => item.id === project || item.name === project,
  )?.id;
  return (
    <section
      className="direct-contact"
      aria-label="Call, WhatsApp or text Emran"
    >
      <header>
        <div>
          <span className="eyebrow">A DIRECT CONVERSATION</span>
          <h2>Let’s talk about your idea.</h2>
        </div>
        <span className="contact-personal">With Emran, personally.</span>
      </header>
      <div className="contact-country-grid">
        {contactNumbers.map((number) => (
          <div className="contact-country-card" key={number.region}>
            <span className="country-flag">
              <Image
                unoptimized
                src={`/email-assets/flag-${number.flag}-v1.png`}
                width={36}
                height={24}
                alt={`${number.country} flag`}
              />
            </span>
            <strong>{number.display}</strong>
            <span className="country-name">{number.country}</span>
            <div className="contact-channel-actions">
              {(
                [
                  {
                    channel: "call",
                    label: "Call",
                    href: `tel:+${number.digits}`,
                    icon: "call",
                  },
                  {
                    channel: "whatsapp",
                    label: "WhatsApp",
                    href: whatsappUrl(number.digits, project, service),
                    icon: "whatsapp",
                  },
                  {
                    channel: "sms",
                    label: "SMS",
                    href: `sms:+${number.digits}`,
                    icon: "sms",
                  },
                ] as const
              ).map((action) => (
                <a
                  key={action.channel}
                  href={action.href}
                  aria-label={`${action.label} Emran — ${number.country}`}
                  {...(action.channel === "whatsapp"
                    ? { target: "_blank", rel: "noreferrer" }
                    : {})}
                  onClick={() =>
                    trackEvent("contact_channel_clicked", {
                      channel: action.channel,
                      region: number.region,
                      project: projectId,
                      service: getService(service)?.id,
                    })
                  }
                >
                  <Image
                    unoptimized
                    src={`/email-assets/${action.icon}-v1.png`}
                    width={28}
                    height={28}
                    alt=""
                  />
                  <span>{action.label}</span>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
