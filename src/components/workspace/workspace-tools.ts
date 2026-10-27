/** One catalog powers the Dock, Launchpad, sidebar and collection URLs. */
export const toolGroups = [
  {
    id: "development",
    label: "Development",
    heading: "Coding collections",
    tools: [
      {
        id: "vscode",
        label: "VS Code",
        collection: "All Projects",
        search: "code websites apps",
      },
      {
        id: "react",
        label: "React",
        collection: "React",
        search: "web applications",
      },
      {
        id: "next",
        label: "Next.js",
        collection: "Next.js",
        search: "websites",
      },
      {
        id: "python",
        label: "Python",
        collection: "Python",
        search: "automation",
      },
      {
        id: "node",
        label: "Node.js",
        collection: "Node.js",
        search: "backend",
      },
      {
        id: "flutter",
        label: "Flutter",
        collection: "Flutter",
        search: "mobile apps",
      },
      {
        id: "wordpress",
        label: "WordPress",
        collection: "WordPress",
        search: "websites cms",
      },
    ],
  },
  {
    id: "design",
    label: "Design",
    heading: "Design",
    tools: [
      {
        id: "figma",
        label: "Figma",
        collection: "Figma",
        search: "ui ux interfaces prototypes",
      },
      {
        id: "photoshop",
        label: "Photoshop",
        collection: "Photoshop",
        search: "adobe photo image editing",
      },
      {
        id: "illustrator",
        label: "Illustrator",
        collection: "Illustrator",
        search: "adobe branding vector illustration",
      },
    ],
  },
  {
    id: "motion",
    label: "Video & Motion",
    heading: "Video & Motion",
    tools: [
      {
        id: "premierepro",
        label: "Premiere Pro",
        collection: "Premiere Pro",
        search: "adobe video editing",
      },
      {
        id: "aftereffects",
        label: "After Effects",
        collection: "After Effects",
        search: "adobe animation motion vfx",
      },
    ],
  },
  {
    id: "three-d",
    label: "3D & Games",
    heading: "3D & Games",
    tools: [
      {
        id: "blender",
        label: "Blender",
        collection: "Blender",
        search: "3d rendering animation",
      },
      {
        id: "unrealengine",
        label: "Unreal Engine",
        collection: "Unreal Engine",
        search: "3d games interactive environments",
      },
      {
        id: "cinema4d",
        label: "Cinema 4D",
        collection: "Cinema 4D",
        search: "3d c4d rendering motion maxon",
      },
    ],
  },
] as const;

export type Tool = (typeof toolGroups)[number]["tools"][number];
export type ToolId = Tool["id"];
export type ToolCollection = Tool["collection"];
export type ToolGroupId = (typeof toolGroups)[number]["id"];
export const workspaceTools: readonly Tool[] = toolGroups.flatMap<Tool>(
  (group) => [...group.tools],
);
export const toolIds: readonly string[] = workspaceTools.map((tool) => tool.id);

export type DockToolGroup = {
  id: ToolGroupId;
  label: string;
  visible: Tool[];
  stacked: Tool[];
};

export function dockIconSize(width: number, preferred: number) {
  return width > 1000
    ? preferred
    : Math.min(preferred, Math.max(29, Math.min(35, width * 0.066 - 21.23)));
}

/** Keep the fixed Mac/social apps, then group tools before their icons get cramped. */
export function layoutDock(
  width: number,
  preferred: number,
  pinned: readonly ToolId[],
): DockToolGroup[] {
  const small = width <= 1000;
  const size = dockIconSize(width, preferred);
  const gap = small ? 4 : 8;
  const navGap = small ? 4 : 7;
  const fits = (groups: DockToolGroup[]) => {
    // Eight Mac apps, four social/contact icons, Trash, four tool groups.
    const count =
      13 +
      groups.reduce(
        (sum, group) =>
          sum + group.visible.length + Number(!!group.stacked.length),
        0,
      );
    const estimated =
      count * size + (count - 7) * gap + 6 * (7 + 2 * navGap) + 20;
    return estimated <= width - 64;
  };
  const make = (mode: "full" | "creative-stacks" | "all-stacks") =>
    toolGroups.map((group): DockToolGroup => {
      const expanded =
        mode === "full" ||
        (mode === "creative-stacks" && group.id === "development");
      return {
        id: group.id,
        label: group.label,
        visible: expanded ? [...group.tools] : [],
        stacked: expanded ? [] : [...group.tools],
      };
    });
  const full = make("full");
  if (fits(full)) return full;
  let result = make("creative-stacks");
  if (!fits(result)) result = make("all-stacks");
  for (const id of pinned) {
    const candidate = result.map((group) => {
      const tool = group.stacked.find((item) => item.id === id);
      return tool
        ? {
            ...group,
            visible: [...group.visible, tool],
            stacked: group.stacked.filter((item) => item.id !== id),
          }
        : group;
    });
    if (fits(candidate)) result = candidate;
  }
  return result;
}
