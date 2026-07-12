import { readFileSync } from "node:fs";

const source = readFileSync("src/components/seo/json-ld.tsx", "utf8");
const requiredTokens = [
  '"@type": "WebSite"',
  '"@type": "ProfilePage"',
  '"@type": "Person"',
  '"@type": "ItemList"',
  'replace(/</g, "\\\\u003c")',
  "portfolioProjects.map",
];

const missing = requiredTokens.filter((token) => !source.includes(token));
const forbidden = [
  "Review",
  "AggregateRating",
  "foundingDate",
  "streetAddress",
];
const presentForbidden = forbidden.filter((token) => source.includes(token));

if (missing.length > 0 || presentForbidden.length > 0) {
  console.error(
    JSON.stringify({ ok: false, missing, presentForbidden }, null, 2),
  );
  process.exit(1);
}

console.log(JSON.stringify({ ok: true, checked: requiredTokens.length }));
