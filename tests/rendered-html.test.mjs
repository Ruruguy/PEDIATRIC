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
  assert.match(html, /急救流程圖/);
  assert.match(html, /嬰兒 OHCA/);
  assert.match(html, /不同年齡層/);
  assert.match(html, /雙拇指環抱法優先/);
  assert.match(html, /避免超過 6 cm/);
  assert.match(html, /90 次／分/);
  assert.match(html, /快速輸液/);
  assert.match(html, /首小時累積警戒/);
  assert.match(html, /40–60 是警戒線，不是目標線/);
  assert.match(html, /創傷出血：晶體液反應不佳，就要轉向血品/);
  assert.match(html, /pRBC 10 mL\/kg/);
  assert.match(html, /不要為了達到 40–60 mL\/kg 而延遲止血/);
  assert.match(html, /4 歲以下：V 分數看的是發展適齡反應/);
  assert.match(html, /體重 ≤30 kg 兒童/);
  assert.match(html, /第 1–4 項任兩項/);
  assert.match(html, /瘀青顏色不能定年齡/);
  assert.match(html, /一般傷害＞72 小時、嚴重傷害＞24 小時/);
  assert.match(html, /於 24 小時內/);
  assert.match(html, /知道為什麼/);
  assert.match(html, /是否可分割及置入方向不可自行假設/);
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
  assert.match(page, /Pediatric BLS/);
  assert.match(page, /直接從胸外按壓開始 CPR/);
  assert.match(page, /不先給甦醒球兩口氣/);
  assert.match(page, /5 次背擊＋5 次胸推/);
  assert.match(page, /出生時新生兒/);
  assert.match(page, /AHA 2025 已移除兩指法/);
  assert.match(page, /每次後重評/);
  assert.match(page, /疑心因性休克/);
  assert.match(page, /新生兒避免三角肌/);
  assert.match(page, /肛門疾患、直腸炎、直腸出血/);
  assert.match(page, /大腿前外側的中間三分之一/);
  assert.match(page, /肩峰下方倒三角形/);
  assert.match(page, /保護隱私、左側臥、依處方核藥/);
  assert.match(page, /平衡血品或全血策略/);
  assert.match(page, /血品種類、相容性、保存／加溫/);
  assert.match(await readFile(new URL("../app/gcs-reference.tsx", import.meta.url), "utf8"), /V3 的用語可能寫成「持續煩躁」或「只對疼痛哭」/);
  assert.match(page, /視網膜出血/);
  assert.match(page, /香菸樣圓形接觸傷/);
  assert.match(page, /無人目擊合併嚴重傷勢/);
  assert.match(page, /INSULIN DEFICIENCY/);
  assert.match(css, /\.compression-table tbody th\{position:sticky;left:0/);
  assert.match(css, /@media\(max-width:760px\).*\.output-grid\{grid-template-columns:1fr\}/s);
  assert.match(css, /\.flow-branches\{grid-template-columns:1fr/);
  assert.match(css, /\.zone-strip\{grid-template-columns:repeat\(3,1fr\)/);
  assert.match(css, /\.ruler-tabs\{grid-template-columns:1fr\}/);
  assert.match(css, /\.procedure-visual-grid\{display:grid;grid-template-columns:1fr 1fr\}/);
  assert.match(css, /\.clinical-reference-section\{padding:110px/);
  assert.match(css, /\.pathology-workbench\{display:grid/);
});
