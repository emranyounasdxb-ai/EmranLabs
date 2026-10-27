import type { Metadata } from "next";
import { StandalonePage } from "@/components/workspace/standalone-page";
import { getSiteUrl } from "@/config/site";

export const metadata: Metadata = {
  title: "Privacy — Emran Labs",
  description:
    "How Emran Labs handles enquiries, website measurement and privacy choices.",
  alternates: { canonical: getSiteUrl("/privacy") },
};

export default function PrivacyPage() {
  return (
    <StandalonePage>
      <article className="contact-content contact-panel">
        <span className="eyebrow">PRIVACY AT EMRAN LABS</span>
        <h1>Your visit. Your choices.</h1>
        <p>
          Emran Younas operates Emran Labs. For privacy questions or requests,
          email <a href="mailto:helo@emranlabs.com">helo@emranlabs.com</a>.
        </p>
        <h2>Website measurement</h2>
        <p>
          When enabled, Microsoft Clarity helps us understand which parts of the
          website people use through clicks, interaction metrics, heatmaps and
          masked page recordings. It receives page addresses, browser and device
          information and interaction data. Without opt-in it uses limited
          cookieless measurement. If you allow Clarity, analytics cookies
          connect page visits and enable fuller session reporting. Microsoft
          advertising storage stays denied. We do not send custom visitor
          identifiers or link Clarity to advertising accounts.
        </p>
        <p>
          Cookieless measurement still sends data to Microsoft. It uses a new
          identifier for each page view, so returning-visitor counts, journeys
          between pages and duration reports can be incomplete. Text is masked
          before collection; our custom events use only public app, project and
          contact-channel names.
        </p>
        <p>
          Learn how Microsoft processes data in the{" "}
          <a
            href="https://privacy.microsoft.com/privacystatement"
            target="_blank"
            rel="noreferrer"
          >
            Microsoft Privacy Statement
          </a>
          . Measurement availability may depend on browser controls and
          applicable regional requirements.
        </p>
        <h2>Your controls</h2>
        <p>
          Open Privacy preferences on this page or in desktop Settings to turn
          all tracking off. Google Analytics, Meta Pixel, Clarity analytics
          cookies and any future LinkedIn integration have separate opt-ins.
          Choosing Use limited mode disables optional cookies and campaign tags
          while allowing limited cookieless Clarity measurement. Turn off all
          tracking stops that collection too. Do Not Track and Global Privacy
          Control disable our tracking integrations.
        </p>
        <p>
          We remember privacy choices on this device. Clearing browser storage
          resets those choices. Local previews send no analytics traffic.
        </p>
        <h2>Enquiries and personal workspace content</h2>
        <p>
          Contact details and project messages are used to handle your enquiry
          and send confirmation emails. Please avoid sending sensitive
          information through Contact or EM AI. Notes and appearance preferences
          stay in this browser; they are not included in our analytics event
          parameters.
        </p>
        <p>
          EM AI sends submitted messages to its configured AI service to
          generate a response. Its input and response text are masked from
          Clarity.
        </p>
      </article>
    </StandalonePage>
  );
}
