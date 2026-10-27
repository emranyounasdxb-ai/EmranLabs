export type WindowFrame = {
  x: number;
  y: number;
  width: number;
  height: number;
};
export type ResizeEdge = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";
export const resizeEdges: ResizeEdge[] = [
  "n",
  "s",
  "e",
  "w",
  "ne",
  "nw",
  "se",
  "sw",
];
const clamp = (n: number, min: number, max: number) =>
  Math.min(Math.max(n, min), Math.max(min, max));
export function resizeFrame(
  start: WindowFrame,
  edge: ResizeEdge,
  dx: number,
  dy: number,
  vw: number,
  vh: number,
): WindowFrame {
  const minimumWidth = Math.min(620, vw - 24, start.width),
    minimumHeight = Math.min(380, vh - 130, start.height);
  let left = start.x,
    top = start.y,
    right = start.x + start.width,
    bottom = start.y + start.height;
  if (edge.includes("w")) left = clamp(start.x + dx, 8, right - minimumWidth);
  if (edge.includes("e"))
    right = clamp(right + dx, left + minimumWidth, vw - 8);
  if (edge.includes("n")) top = clamp(start.y + dy, 38, bottom - minimumHeight);
  if (edge.includes("s"))
    bottom = clamp(bottom + dy, top + minimumHeight, vh - 86);
  return { x: left, y: top, width: right - left, height: bottom - top };
}
