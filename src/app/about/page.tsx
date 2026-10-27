import type { Metadata } from "next";
import { AboutProfile } from "@/components/workspace/about-profile";
import { StandalonePage } from "@/components/workspace/standalone-page";
import { getSiteUrl } from "@/config/site";
export const metadata: Metadata = {
  title: "About Emran Younas — Independent Designer & Developer",
  description:
    "Meet Emran Younas, an independent designer and developer with an IT background in Microsoft 365, Azure, networks and cybersecurity. Explore his work at EmranLabs.",
  alternates: { canonical: getSiteUrl("/about") },
  openGraph: {
    title: "About Emran Younas",
    url: getSiteUrl("/about"),
    type: "profile",
    images: [
      {
        url: getSiteUrl("/images/profile/emran.webp"),
        width: 460,
        height: 460,
        alt: "Emran Younas",
      },
    ],
  },
};
export default function AboutPage() {
  return (
    <StandalonePage>
      <AboutProfile />
    </StandalonePage>
  );
}
