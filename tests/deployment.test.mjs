import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { normalizeForecast } from "../src/lib/server/weather-forecast.ts";

test("deployment requires successful checks for the exact main commit", () => {
  const sha = "a".repeat(40);
  const passing = {
    id: 1,
    head_sha: sha,
    head_branch: "main",
    event: "push",
    repository: { full_name: "emranyounasdxb-ai/EmranLabs" },
    status: "completed",
    conclusion: "success",
  };
  for (const [runs, expected] of [
    [[], 1],
    [[passing], 0],
    [[{ ...passing, head_sha: "b".repeat(40) }], 1],
    [[{ ...passing, conclusion: "failure" }], 1],
    [
      [passing, { ...passing, id: 2, status: "in_progress", conclusion: null }],
      1,
    ],
  ]) {
    const code = `process.argv[2]=${JSON.stringify(sha)}; globalThis.fetch=async()=>({ok:true,json:async()=>({workflow_runs:${JSON.stringify(runs)}})}); await import(${JSON.stringify(new URL("../scripts/check-deploy-ci.mjs", import.meta.url).href)});`;
    assert.equal(
      spawnSync(process.execPath, ["--input-type=module", "-e", code]).status,
      expected,
    );
  }
});

test("weather converts metres/sec and groups forecast dates in the city timezone", () => {
  const point = (time, temperature) => ({
    time,
    data: {
      instant: { details: { air_temperature: temperature, wind_speed: 5 } },
      next_1_hours: { summary: { symbol_code: "clearsky_night" } },
    },
  });
  const result = normalizeForecast(
    {
      properties: {
        timeseries: [
          point("2026-10-27T20:00:00Z", 25),
          point("2026-10-27T21:00:00Z", 24),
        ],
      },
    },
    "Asia/Dubai",
    Date.parse("2026-10-27T20:00:00Z"),
  );
  assert.equal(result.days[0].date, "2026-10-28");
  assert.equal(result.wind, 18);
  assert.equal(result.low, 24);
  assert.equal(result.isDay, false);
  assert.equal(result.apparent, null);
  assert.throws(() =>
    normalizeForecast({ properties: { timeseries: [] } }, "Asia/Dubai"),
  );
});
