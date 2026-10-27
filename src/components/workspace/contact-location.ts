import { projects } from "./workspace-data";
import { workspaceTools } from "./workspace-tools";
import { getService } from "./service-catalog";
export type EnquiryContext = {
  project?: string;
  tool?: string;
  service?: string;
};

/** Only public catalog identifiers belong in shareable enquiry URLs. */
export function contactUrl(context: EnquiryContext = {}) {
  const project = projects.find(
    (item) => item.id === context.project || item.name === context.project,
  );
  const service = getService(context.service);
  const tool = workspaceTools.find(
    (item) => item.id === context.tool || item.collection === context.tool,
  );
  return (
    "/contact" +
    (project ? `/project/${project.id}` : "") +
    (service ? `/service/${service.id}` : "") +
    (tool ? `/tool/${tool.id}` : "")
  );
}

export function parseContactPath(pathname: string): EnquiryContext | null {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.shift() !== "contact" || parts.length % 2) return null;
  const seen = new Set<string>();
  const context: EnquiryContext = {};
  for (let index = 0; index < parts.length; index += 2) {
    const key = parts[index],
      value = parts[index + 1];
    if (seen.has(key)) return null;
    seen.add(key);
    if (key === "project") {
      const project = projects.find((item) => item.id === value);
      if (!project) return null;
      context.project = project.name;
    } else if (key === "service") {
      const service = getService(value);
      if (!service) return null;
      context.service = service.id;
    } else if (key === "tool") {
      const tool = workspaceTools.find((item) => item.id === value);
      if (!tool) return null;
      context.tool = tool.collection;
    } else return null;
  }
  return context;
}

export function parseContactLocation(
  pathname: string,
  search = "",
): EnquiryContext {
  if (pathname !== "/contact") return parseContactPath(pathname) ?? {};
  const params = new URLSearchParams(search);
  return {
    project: projects.find((item) => item.id === params.get("project"))?.name,
    service: getService(params.get("service") ?? undefined)?.id,
    tool: workspaceTools.find((item) => item.collection === params.get("tool"))
      ?.collection,
  };
}
