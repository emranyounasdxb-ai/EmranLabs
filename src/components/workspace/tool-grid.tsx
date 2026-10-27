"use client";

import { Pin } from "lucide-react";
import { AppIcon } from "./app-icon";
import type { Tool, ToolId } from "./workspace-tools";

export function ToolGrid({
  tools,
  pinned,
  onOpen,
  onPin,
}: {
  tools: readonly Tool[];
  pinned: readonly ToolId[];
  onOpen: (tool: Tool) => void;
  onPin: (id: ToolId) => void;
}) {
  return (
    <div className="launchpad-grid tool-grid">
      {tools.map((tool) => {
        const kept = pinned.includes(tool.id);
        return (
          <div className="tool-tile" key={tool.id}>
            <button
              className="tool-open"
              onClick={() => onOpen(tool)}
              aria-label={tool.label}
            >
              <AppIcon name={tool.id} />
              <span>{tool.label}</span>
            </button>
            <button
              className="tool-pin"
              aria-label={`${kept ? "Remove" : "Keep"} ${tool.label} ${kept ? "from" : "in"} Dock`}
              aria-pressed={kept}
              title={
                kept
                  ? "Remove from Dock favourites"
                  : "Keep in Dock when space allows"
              }
              onClick={() => onPin(tool.id)}
            >
              <Pin size={12} fill={kept ? "currentColor" : "none"} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
