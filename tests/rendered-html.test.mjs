import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the pediatric field reference", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>PEDS\/\/FIELD｜孕婦・小兒・嬰兒・新生兒救護教學<\/title>/i);
  assert.match(html, /孕婦急症/);
  assert.match(html, /產後出血/);
  assert.match(html, /30–60 次／分/);
  assert.match(html, /Best Guess/);
  assert.match(html, /Rule of 50 速算/);
  assert.match(html, /PHPLS Midazolam/);
  assert.match(html, /心率藥物速算/);
  assert.match(html, /實際年齡層/);
  assert.match(html, /小兒急救藥物安全/);
});

test("keeps dose guardrails and mobile stacking in source", async () => {
  const [page, css] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(page, /教材未明列/);
  assert.match(page, /不把不同濃度累加/);
  assert.match(page, /第二人獨立複算/);
  assert.match(page, /0\.1 mg\/mL 製劑/);
  assert.match(page, /1 mg\/mL 製劑/);
  assert.match(css, /@media\(max-width:760px\).*\.output-grid\{grid-template-columns:1fr\}/s);
  assert.match(css, /\.zone-strip\{grid-template-columns:repeat\(3,1fr\)/);
  assert.match(css, /\.ruler-tabs\{grid-template-columns:1fr\}/);
});
