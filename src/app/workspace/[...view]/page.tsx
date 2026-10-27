import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MacDesktop } from "@/components/workspace/mac-desktop";
import { desktopRoutes } from "@/components/workspace/desktop-location";

export const dynamicParams = false;
export const metadata: Metadata = {
  title: "Workspace — Emran Labs",
  // Search engines use the dedicated public project, service and contact pages.
  robots: { index: false, follow: true },
};
export function generateStaticParams() {
  return desktopRoutes.map(({ path }) => ({ view: path.split("/").slice(2) }));
}
export default async function WorkspacePage({
  params,
}: {
  params: Promise<{ view: string[] }>;
}) {
  const { view } = await params;
  if (
    !desktopRoutes.some(({ path }) => path === `/workspace/${view.join("/")}`)
  )
    notFound();
  return <MacDesktop />;
}
