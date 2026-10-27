const sha = process.argv[2];
if (!/^[a-f0-9]{40}$/.test(sha ?? "")) throw new Error("Invalid commit");
const endpoint = new URL(
  "https://api.github.com/repos/emranyounasdxb-ai/EmranLabs/actions/workflows/quality.yml/runs",
);
endpoint.search = new URLSearchParams({
  branch: "main",
  event: "push",
  head_sha: sha,
  per_page: "5",
}).toString();
const response = await fetch(endpoint, {
  headers: {
    Accept: "application/vnd.github+json",
    "User-Agent": "EmranLabs-deploy",
  },
  signal: AbortSignal.timeout(15000),
});
if (!response.ok) throw new Error(`CI status unavailable (${response.status})`);
const data = await response.json();
const run = data.workflow_runs
  ?.filter(
    (item) =>
      item.head_sha === sha &&
      item.head_branch === "main" &&
      item.event === "push" &&
      item.repository?.full_name === "emranyounasdxb-ai/EmranLabs",
  )
  .sort((a, b) => b.id - a.id)[0];
if (run?.status !== "completed" || run.conclusion !== "success") {
  console.log("Waiting for successful quality checks for", sha);
  process.exit(1);
}
console.log("Quality checks passed for", sha);
