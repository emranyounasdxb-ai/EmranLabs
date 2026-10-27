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
export function parseDesktopLocation(search: string): DesktopLocation {
  const params = new URLSearchParams(search);
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
  const params = new URLSearchParams();
  if (app === "projects") {
    if (project) params.set("project", project);
    else if (collection !== "Overview") params.set("collection", collection);
  } else params.set("app", app);
  return params.size ? `/?${params}` : "/";
}
