import fs from "node:fs";
import path from "node:path";

const base = process.argv[2] || "http://127.0.0.1:3100";
const mapping = JSON.parse(fs.readFileSync(path.resolve("../docs/stitch-mapping.json"), "utf8"));
const routes = new Set(mapping.map(item => item.route).filter(route => route.startsWith("/")));
for (const route of ["/review/study?limit=3", "/review/study?word=pengyou", "/lessons/1/practice?word=pengyou", "/review/summary?source=lesson-1&count=1&word=pengyou"]) routes.add(route);
const reports = [];
const linkRoutes = new Set();

async function check(route) {
  const response = await fetch(new URL(route, base));
  const html = await response.text();
  for (const match of html.matchAll(/href="(\/[^"<>]*)"/g)) {
    const href = match[1].replaceAll("&amp;", "&");
    if (!href.startsWith("/_next/") && !href.startsWith("//") && !/\.(?:ico|jpg|svg|png)$/.test(href)) linkRoutes.add(href.split("#")[0]);
  }
  reports.push({ route, status: response.status, hasMain: /<main[\s>]/.test(html) });
  if (!response.ok) throw new Error(`${route}: HTTP ${response.status}`);
}

async function batch(items) {
  for (let i = 0; i < items.length; i += 6) {
    const results = await Promise.allSettled(items.slice(i, i + 6).map(check));
    const failed = results.filter(result => result.status === "rejected");
    if (failed.length) throw new AggregateError(failed.map(result => result.reason), "Route check failed");
  }
}

await batch([...routes]);
await batch([...linkRoutes].filter(route => !routes.has(route)));
const negatives = ["/collection/not-a-word", "/teachers/not-a-teacher", "/vocabulary/hsk-99", "/teachers/not-a-teacher/consultation", "/review/study?word=not-a-word", "/review/study?limit=0", "/lessons/1/practice?word=not-a-word", "/review/summary?source=bad&count=99"];
for (const route of negatives) {
  const response = await fetch(new URL(route, base));
  if (response.status !== 404) throw new Error(`Expected 404 for ${route}, got ${response.status}`);
}
const report = { base, checkedAt: new Date().toISOString(), routes: reports, negativeRoutes: negatives, result: "PASS" };
fs.mkdirSync(path.resolve("../docs/ui-validation"), { recursive: true });
fs.writeFileSync(path.resolve(process.argv[3] || "../docs/ui-validation/routes.json"), JSON.stringify(report, null, 2));
console.log(`PASS: ${reports.length} routes/internal links; ${negatives.length} invalid routes return 404.`);
