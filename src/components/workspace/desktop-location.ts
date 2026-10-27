import {
  collections,
  projects,
  type AppName,
  type Collection,
} from "./workspace-data";

const apps: AppName[] = [
  "projects",
  "about",
  "contact",
  "notes",
  "calendar",
  "settings",
  "photos",
  "trash",
  "help",
  "services",
];
export type DesktopLocation = {
  app: AppName;
  collection: Collection;
  project: string | null;
};
const overview: DesktopLocation = {
  app: "projects",
  collection: "Overview",
  project: null,
};
export function collectionSlug(collection: Collection) {
  return collection
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
export const desktopRoutes: { path: string; location: DesktopLocation }[] = [
  ...apps
    .filter((app) => app !== "projects")
    .map((app) => ({
      path: `/workspace/${app}`,
      location: { ...overview, app },
    })),
  ...collections
    .filter((collection) => collection !== "Overview")
    .map((collection) => ({
      path:
        collection === "All Projects"
          ? "/workspace/projects"
          : `/workspace/collections/${collectionSlug(collection)}`,
      location: { ...overview, collection },
    })),
  ...projects.map((project) => ({
    path: `/workspace/projects/${project.id}`,
    location: { ...overview, project: project.id },
  })),
];

/** Read clean paths and old shared query links during the migration. */
export function parseDesktopLocation(input: string): DesktopLocation {
  const url = new URL(
    input.startsWith("/") || input.startsWith("?") ? input : `?${input}`,
    "https://emranlabs.com",
  );
  const clean = desktopRoutes.find((route) => route.path === url.pathname);
  if (clean) return clean.location;
  const params = url.searchParams;
  const project =
    projects.find((p) => p.id === params.get("project"))?.id ?? null;
  const app = apps.find((a) => a === params.get("app")) ?? "projects";
  const collection =
    collections.find((c) => c === params.get("collection")) ?? "Overview";
  return { app: project ? "projects" : app, collection, project };
}
export function desktopUrl(
  app: AppName,
  collection: Collection = "Overview",
  project?: string | null,
) {
  if (app !== "projects") return `/workspace/${app}`;
  if (project && projects.some((item) => item.id === project))
    return `/workspace/projects/${project}`;
  if (collection === "All Projects") return "/workspace/projects";
  return collection !== "Overview" && collections.includes(collection)
    ? `/workspace/collections/${collectionSlug(collection)}`
    : "/";
}
