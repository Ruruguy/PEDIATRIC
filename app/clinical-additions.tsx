"use client";
import { useState } from "react";

export const clinicalSources = {
  pals: "https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines/pediatric-advanced-life-support",
  bls: "https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines/pediatric-basic-life-support",
  airway: "https://www.rch.org.au/clinicalguide/guideline_index/Emergency_airway_management/",
  sizing: "https://pie.med.utoronto.ca/anesthesiaqr/AnesthesiaQR_content/AnesthesiaQR_Pediatric_Laryngoscopy.html",
  asthma: "https://www.rch.org.au/clinicalguide/guideline_index/Acute_asthma/",
  croup: "https://www.rch.org.au/clinicalguide/guideline_index/Croup_Laryngotracheobronchitis/",
  dka: "https://cps.ca/en/documents/position/current-recommendations-for-management-of-paediatric-diabetic-ketoacidosis",
  special: "https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines/adult-and-pediatric-special-circumstances-of-resuscitation",
  pph: "https://www.who.int/publications/i/item/9789240115637/",
};
export const rhythmDoses = (kg: number) => ({
  atropine: Math.min(Math.max(kg * .02, .1), .5),
  adenosineFirst: Math.min(kg * .1, 6),
  adenosineSecond: Math.min(kg * .2, 12),
  amiodaroneFirst: Math.min(kg * 5, 300),
  amiodaroneRepeat: Math.min(kg * 5, 150),
});
export const airwayEstimate = (age: number) => ({ cuffed: age / 4 + 3.5, uncuffed: age / 4 + 4, depth: age / 2 + 12 });
const fmt = (v: number) => Number(v.toFixed(2));
const categories = [
  { title: "心律／循環", source: "pals", rows: [
    ["Atropine｜阿托品", "有脈緩脈，疑迷走神經張力增加或原發 AV block；IV／IO。先矯正低氧與通氣，並非所有緩脈都給。"],
    ["Adenosine｜腺苷", "規則窄 QRS SVT；快速 IV／IO 後立即沖管。規則單型寬 QRS 需依流程及專家判斷；不規則或多型寬 QRS 不直接套用。"],
    ["Amiodarone／Lidocaine", "頑固 VF／無脈 VT 的替代選擇；Amiodarone 首劑與後續上限不同。有脈心律的輸注方式不可照搬心停 bolus。"],
    ["Epinephrine／Norepinephrine 輸注", "休克持續時依病因、灌流及血流動力學選擇與滴定；這與心停 Epinephrine bolus 不同，需幫浦、連續監測及醫療指導。"],
    ["Sotalol／Procainamide", "難治性有脈心搏過速的專科選項；先完成適用的迷走刺激、Adenosine、同步整流與諮詢。需監測QT、QRS與血壓，不放入一般體重速算。"],
  ]},
  { title: "呼吸／過敏", source: "asthma", rows: [
    ["Salbutamol（Albuterol）｜Ventolin", "短效β₂促效劑（SABA），用於支氣管痙攣；MDI＋儲霧罐或霧化製劑依處方。Ventolin是商品名，不能只憑吸入器顏色認藥。"],
    ["Ipratropium bromide", "吸入抗膽鹼藥；中重度氣喘可與SABA合用。教材A＋B／單B必須先確認實際成分，不可從代號推定配方或每支劑量。"],
    ["Dexamethasone／Prednisolone", "類固醇用於適應症相符的哮吼或氣喘；藥物、嚴重度與途徑各有方案，不互換mg。無法立即解除呼吸道阻塞。"],
    ["Magnesium sulfate｜硫酸鎂", "嚴重氣喘的升級治療選項；另有特定心律或產科適應症。不同情境劑量、速度與監測不同，需醫療指導。"],
    ["抗組織胺／類固醇（過敏輔助）", "不能取代嚴重過敏第一線IM Epinephrine，也不能保證預防雙相反應；處理ABC與後送優先。"],
  ]},
  { title: "神經／代謝／毒物", source: "special", rows: [
    ["Midazolam", "癲癇重積之Benzodiazepine；本站原有PHPLS IM分段表。先查已給幾次、備妥通氣與抽吸；不可將IM、IN、IV劑量互換。"],
    ["Dextrose｜葡萄糖", "低血糖依年齡與核定方案選濃度，先mg或g再換mL；不同濃度不累加。本站原有Rule 50，未列年齡不外推。"],
    ["Insulin｜胰島素", "DKA治療需整合輸液、血鉀與血糖監測；單位是unit/kg/h，不是μg/kg/h。院前不自行快速矯正或給bolus。"],
    ["Naloxone｜納洛酮", "疑鴉片類中毒合併呼吸抑制時使用；先支持通氣。心停時不能延誤CPR／AED；途徑及製劑依SOP，持續觀察再鎮靜。"],
    ["Calcium／Sodium bicarbonate", "鈣劑與碳酸氫鈉不是小兒心停常規藥；只在特定電解質、毒物或其他明確適應症依流程使用。鈣鹽製劑不可等mL互換。"],
  ]},
  { title: "插管／鎮靜（專業程序）", source: "airway", rows: [
    ["Ketamine／Rocuronium", "RSI誘導與神經肌肉阻斷藥需分清用途；肌鬆不提供鎮靜止痛。先準備氧合、循環、失敗備援與插管後鎮靜，僅依授權與核定流程。"],
  ]},
  { title: "孕產婦補充（母體用藥）", source: "pph", rows: [
    ["TXA（Tranexamic acid）／子宮收縮藥", "產後出血的治療組合依產科／EMS protocol執行；不以小兒尺體重自動換算成人母體處方。子宮收縮藥需確認成分與禁忌。"],
    ["Magnesium sulfate／Calcium", "子癇用鎂須監測呼吸、反射與循環；鎂毒性處理由醫療指導決定鈣劑。不可套用小兒氣喘或心停用法。"],
  ]},
] as const;

export function RhythmReference({ weight }: { weight: number }) {
  const d = rhythmDoses(weight);
  return <section className="clinical-extra rhythm-extra"><h3>有脈搏心律｜Atropine・Adenosine</h3><dl><div><dt>Atropine 0.02 mg/kg IV／IO</dt><dd>{fmt(d.atropine)} mg</dd></div><div><dt>Adenosine 首次 0.1 mg/kg</dt><dd>{fmt(d.adenosineFirst)} mg</dd></div><div><dt>Adenosine 第二次 0.2 mg/kg</dt><dd>{fmt(d.adenosineSecond)} mg</dd></div></dl><p className="clinical-note">此表為一般小兒PALS，非出生時NRP用藥表。Atropine最低0.1 mg、單次最高0.5 mg，可重複一次，限適應症相符的緩脈。Adenosine首次最高6 mg、第二次最高12 mg，快速推注後立即沖管。此處顯示mg；mL須以手上濃度另核對。</p><a href={clinicalSources.pals} target="_blank" rel="noreferrer">AHA／AAP 2025 PALS 依據 ↗</a></section>;
}

export function AirwayReference() {
  const [age, setAge] = useState(4);
  const a = airwayEstimate(age);
  return <section className="clinical-extra airway-extra" aria-label="插管尺寸與深度補充"><h3>插管尺寸與口插深度｜年齡估算</h3><label>實際足歲（此公式示範限2–8歲）<input type="number" min="2" max="8" step="1" value={age} onChange={e => { const v = Number(e.target.value); if (Number.isInteger(v) && v >= 2 && v <= 8) setAge(v); }} /></label><dl><div><dt>有囊 ETT ID＝年齡÷4＋3.5</dt><dd>{fmt(a.cuffed)} mm</dd></div><div><dt>無囊 ETT ID＝年齡÷4＋4</dt><dd>{fmt(a.uncuffed)} mm</dd></div><div><dt>口插深度＝年齡÷2＋12</dt><dd>{fmt(a.depth)} cm（唇部起算）</dd></div></dl><p className="clinical-note"><b>大觀念：</b>公式顯示未取整的估算值，備妥最接近的可用管徑及相鄰±0.5 mm；依管型IFU、聲門通過情況與漏氣調整。嬰兒、早產兒與新生兒應查專用孕週／體重表，不套此足歲公式；色帶與年齡結果有差異時，回到體型、器材標記與臨床確認。</p><p className="clinical-note">深度是起始估算，不代表已在正確位置；觀察聲門標記、雙側胸廓與呼吸音，以持續波形ETCO₂確認及監測，必要時影像確認尖端。移位、頭頸變動或轉送後重查；cuff以壓力計及IFU調整，不以固定充氣mL判斷。</p><a href={clinicalSources.sizing} target="_blank" rel="noreferrer">University of Toronto 管徑／深度公式 ↗</a>{" · "}<a href={clinicalSources.airway} target="_blank" rel="noreferrer">RCH 緊急氣道與位置確認 ↗</a></section>;
}

export function MedicationReference({ maternal = false }: { maternal?: boolean }) {
  return <section className="clinical-extra medication-extra" id="medication-reference"><h3>藥物分類補充｜用途・途徑・重評</h3><p>急救速算見上方；下列補足流程與疾病學理提到的藥物。依救護層級、轄區SOP與醫療指導使用。更新／核對：2026-11-10。</p>{categories.filter(c => maternal || !c.title.startsWith("孕產婦")).map(c => <details key={c.title}><summary>{c.title}</summary><dl>{c.rows.map(([name, text]) => <div key={name}><dt>{name}</dt><dd>{text}</dd></div>)}</dl><p><a href={clinicalSources[c.source]} target="_blank" rel="noreferrer">分類參考來源 ↗</a>{c.title.startsWith("呼吸") && <> · <a href={clinicalSources.croup} target="_blank" rel="noreferrer">RCH哮吼 ↗</a></>}{c.title.startsWith("神經") && <> · <a href={clinicalSources.dka} target="_blank" rel="noreferrer">CPS DKA ↗</a></>}</p></details>)}<p className="clinical-note"><b>給藥大觀念：</b>先辨適應症，再核對體重來源、單次及累積上限、製劑濃度、途徑與時間；mg不等於mL，unit不等於mg。血管活性輸注、胰島素、鎮靜肌鬆及特殊解毒藥需專屬流程與監測，不能從小兒尺自動產生處方。</p></section>;
}
