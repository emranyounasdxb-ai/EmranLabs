const assert = require("node:assert/strict");
const { load } = require("./load-workspace-checks.cjs");
const { resizeFrame, resizeEdges } = load("window-geometry");
let cases = 0;
for (const [start, vw, vh] of [
  [{ x: 200, y: 120, width: 900, height: 600 }, 1600, 1000],
  [{ x: 10, y: 42, width: 486, height: 672 }, 1000, 800],
]) {
  for (const edge of resizeEdges)
    for (const dx of [-2000, -100, 0, 100, 2000])
      for (const dy of [-2000, -100, 0, 100, 2000]) {
        const result = resizeFrame(start, edge, dx, dy, vw, vh);
        assert.ok(
          result.x >= 8 && result.y >= 38,
          "Top and left stay in the desktop",
        );
        assert.ok(
          result.x + result.width <= vw - 8 &&
            result.y + result.height <= vh - 86,
          "Bottom and right leave room for the dock",
        );
        assert.ok(
          result.width >= Math.min(620, start.width) &&
            result.height >= Math.min(380, start.height),
          "Window stays usable at minimum size",
        );
        if (edge.includes("w"))
          assert.equal(
            result.x + result.width,
            start.x + start.width,
            "West resize anchors the east edge",
          );
        if (edge.includes("n"))
          assert.equal(
            result.y + result.height,
            start.y + start.height,
            "North resize anchors the south edge",
          );
        cases++;
      }
}
console.log(`${cases} window-boundary cases passed.`);
