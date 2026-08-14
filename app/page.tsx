"use client";

import { useEffect, useMemo, useState } from "react";

type AgeKey = "newborn" | "infant" | "child";
type EmergencyKey = "breathing" | "arrest" | "choking" | "seizure" | "shock" | "trauma";

const ageProfiles = {
  newborn: {
    index: "01",
    short: "新生兒",
    range: "出生至未滿 28 日",
    headline: "先讓肺張開，心率才會上升。",
    description: "出生當下的復甦以保暖與有效通氣為核心。不要把新生兒流程直接套成一般嬰兒 CPR。",
    definition: "新生兒（neonate）是指出生後至未滿 28 日，也就是出生至完成第 27 日的嬰兒。",
    scope: "流程提醒：AHA 新生兒復甦流程主要處理出生時由胎內到胎外的轉銜；出生數日後的急症，應依病理生理、醫療指導及地方規範選擇新生兒或兒科流程。",
    watch: ["足月？肌張力好？有呼吸或哭聲？", "喘息、呼吸暫停或心率低於 100/分", "低體溫、持續發紺、呼吸費力"],
    actions: ["出生前團隊簡報與器材檢查", "保暖、擦乾、擺位、刺激，必要時清理氣道", "需要時在黃金一分鐘內開始正壓通氣", "以胸廓起伏及心率上升確認通氣有效"],
    equipment: ["保暖包覆", "新生兒面罩", "BVM / T-piece", "抽吸設備", "血氧與 ECG"],
    accent: "#eeb9a8",
  },
  infant: {
    index: "02",
    short: "嬰兒",
    range: "未滿一歲",
    headline: "頭大、舌大、氣道小，缺氧來得很快。",
    description: "嬰兒急救要主動處理擺位、分泌物與通氣；異物梗塞及胸外按壓手法均有專屬操作。",
    watch: ["餵食後嗆咳、無聲哭泣或發紺", "鼻翼搧動、胸肋凹陷、點頭式呼吸", "活力下降、軟趴、眼神呆滯或不易安撫"],
    actions: ["肩背墊高維持中立位置", "先用 PAT，再依 ABCDE 找出威脅", "嚴重梗塞採 5 背擊＋5 胸推", "CPR 採單手掌根或雙拇指環抱法"],
    equipment: ["嬰兒面罩", "肩墊", "兒童 AED 配件", "身長體重尺", "保暖毯"],
    accent: "#b9d9d4",
  },
  child: {
    index: "03",
    short: "兒童",
    range: "一歲至青春期",
    headline: "血壓下降是晚期，別錯過代償中的休克。",
    description: "兒童常用心率與血管收縮維持血壓。現場要看外觀、灌流及呼吸，不可只等監測數字變差。",
    watch: ["突然安靜、嗜睡或無法與照顧者互動", "皮膚蒼白、斑駁、CRT 延長、末梢冰冷", "高能量創傷、病史與傷勢不一致"],
    actions: ["60 秒內完成 PAT 並形成生理臆斷", "ABCDE／創傷採 XABCDE", "及早支援氧合、通氣與循環", "持續再評估並用 IMIST 完成交班"],
    equipment: ["尺寸化氣道器材", "兒童貼片", "止血與固定", "血糖監測", "保暖裝備"],
    accent: "#f1cd66",
  },
};

const emergencies: Record<EmergencyKey, { label: string; cue: string; steps: { title: string; detail: string }[]; note: string }> = {
  breathing: {
    label: "呼吸異常",
    cue: "喘鳴、哮鳴、胸凹、發紺、呼吸音變小，或孩子突然安靜。",
    steps: [
      { title: "先看 PAT", detail: "外觀與呼吸作功同時異常，應高度懷疑呼吸衰竭。" },
      { title: "打開氣道", detail: "依年齡擺位；分泌物明顯時才做必要抽吸，避免過度刺激。" },
      { title: "支援氧合／通氣", detail: "給氧；換氣不足時以合適面罩協助通氣，觀察胸廓起伏。" },
      { title: "辨識聲音", detail: "Stridor 指向上呼吸道；wheeze 多見下呼吸道；安靜胸是危險警訊。" },
      { title: "再評估與運送", detail: "追蹤意識、心率、呼吸作功、血氧與通氣反應。" },
    ],
    note: "孩子由吵鬧轉為安靜，不一定是改善，可能代表疲乏。",
  },
  arrest: {
    label: "心跳停止",
    cue: "無反應、無正常呼吸；醫療人員脈搏檢查不超過 10 秒。",
    steps: [
      { title: "啟動團隊", detail: "立即求援、開始 CPR，取得 AED／監視器與呼吸器材。" },
      { title: "高品質按壓", detail: "100–120 次／分，深度約胸廓前後徑 1/3，完整回彈並減少中斷。" },
      { title: "按壓與吹氣", detail: "單人 30:2；雙人 15:2。兒童心跳停止通常需要通氣。" },
      { title: "AED 儘早使用", detail: "優先使用兒童衰減器／貼片；依設備指示切換兒童模式。" },
      { title: "找可逆原因", detail: "確保氧合與通氣，依授權層級處理節律、血管通路與藥物。" },
    ],
    note: "2025 AHA：嬰兒不再建議兩指按壓，改用單手掌根或雙拇指環抱。",
  },
  choking: {
    label: "異物梗塞",
    cue: "無法有效咳嗽、說話或哭泣，呼吸聲消失／發紺。",
    steps: [
      { title: "先分嚴重度", detail: "仍能有效咳嗽：鼓勵咳嗽並密切觀察，不盲目挖取。" },
      { title: "嬰兒", detail: "反覆 5 次背擊＋5 次胸推；不可做腹部衝擊。" },
      { title: "兒童", detail: "反覆 5 次背擊＋5 次腹部衝擊，直到異物排出或失去反應。" },
      { title: "失去反應", detail: "安全置地並開始 CPR；開放氣道時只移除看得見的異物。" },
      { title: "後續", detail: "阻塞解除後仍應評估呼吸道損傷、殘留異物與呼吸狀況。" },
    ],
    note: "2025 更新讓兒童流程也從 5 次背擊開始；嬰兒仍禁止腹部衝擊。",
  },
  seizure: {
    label: "抽搐／意識改變",
    cue: "持續抽搐、反覆發作未恢復、低血糖、發燒或不明原因意識下降。",
    steps: [
      { title: "計時與保護", detail: "移開危險物、保護頭部，不壓制肢體、不在口中塞物。" },
      { title: "ABC 優先", detail: "維持氣道與氧合，抽搐後警覺呼吸抑制與分泌物。" },
      { title: "測量血糖", detail: "低血糖是可逆原因；處置濃度與劑量依地方 SOP。" },
      { title: "取得病史", detail: "發作時間、型態、發燒、既往癲癇、藥物、毒物與創傷。" },
      { title: "授權給藥", detail: "依層級與醫療指導選擇核准途徑並監測呼吸。" },
    ],
    note: "發作停止後仍須評估呼吸、意識與再發；不要只把它當成單純熱痙攣。",
  },
  shock: {
    label: "休克／灌流不良",
    cue: "心搏過速、CRT 延長、末梢冰冷、脈搏弱、尿量下降或意識改變。",
    steps: [
      { title: "辨識代償", detail: "血壓正常不能排除休克；兒童低血壓通常是晚期表現。" },
      { title: "控制原因", detail: "止血、處理過敏、支援呼吸並避免失溫。" },
      { title: "建立通路", detail: "危急且 IV 無法快速建立時，依授權考慮 IO。" },
      { title: "審慎補液", detail: "依病因、心肺狀況及地方 SOP 給予；每次處置後評估過量徵象。" },
      { title: "快速後送", detail: "動態評估 PAT／ABCDE，提前通知適當接收醫院。" },
    ],
    note: "灌流評估看的是趨勢：外觀、心率、脈搏品質、CRT、皮膚與意識。",
  },
  trauma: {
    label: "創傷／兒少保護",
    cue: "高能量機轉、致命性出血、頭頸傷、燒燙傷，或病史與傷勢不一致。",
    steps: [
      { title: "X：大出血", detail: "直接加壓優先；兒童總血量少，少量外觀看來也可能重要。" },
      { title: "A/B：氧合", detail: "頭大、氣道小；維持中立姿勢並避免過度通氣。" },
      { title: "C/D：循環神經", detail: "評估脈搏、CRT、皮膚、AVPU、瞳孔、肌張力與血糖。" },
      { title: "E：暴露後保暖", detail: "完整看傷口、瘀青與皮疹，檢查後立即覆蓋。" },
      { title: "保護與紀錄", detail: "記錄照顧者原話、時間線與傷勢位置，不誘導、不指控，依規定通報。" },
    ],
    note: "一歲以下骨折或頭部外傷、延遲就醫、敘述不一致，都需要提高警覺。",
  },
};

const skills = [
  { id: "pat", group: "評估", title: "60 秒 PAT", lead: "不碰孩子，先看出危急。", steps: ["外觀：肌張力、互動、安撫性、凝視、哭聲／語言", "呼吸作功：姿勢、胸凹、鼻翼搧動、異常呼吸音", "皮膚循環：蒼白、發紺、大理石斑", "整合成：穩定、呼吸窘迫／衰竭、休克、中樞異常或心肺衰竭", "接續 ABCDE 並反覆評估，不以 PAT 取代生命徵象"] },
  { id: "bvm", group: "氣道", title: "兒科 BVM 通氣", lead: "面罩密合、胸廓起伏、心率上升。", steps: ["選擇只覆蓋鼻口、不壓眼睛且不超過下巴的面罩", "依年齡與創傷狀況維持中立／嗅聞姿勢；嬰幼兒常需肩背墊", "EC 手法密合；兩人法優先由一人雙手固定面罩", "緩慢擠壓至可見胸廓起伏，避免過量、過快造成胃脹", "無效時重新擺位、檢查密合與阻塞；以心率、胸廓和血氧判斷"] },
  { id: "infant-cpr", group: "復甦", title: "嬰兒 CPR", lead: "2025：不再使用兩指按壓。", steps: ["確認無反應與呼吸異常，啟動救援並取得 AED", "脈搏檢查不超過 10 秒；符合條件立即按壓", "單人使用單手掌根；雙人優先雙拇指環抱", "速率 100–120／分，深度約 4 cm，完整回彈", "單人 30:2、雙人 15:2；AED 到達即使用兒童模式／配件"] },
  { id: "newborn-ppv", group: "新生兒", title: "新生兒正壓通氣", lead: "心率上升就是最重要的成效指標。", steps: ["出生前確認角色、保暖、面罩、通氣與抽吸設備", "出生後判斷足月、張力、呼吸／哭聲並做初步處置", "呼吸暫停／喘息或心率低於 100，開始通氣與監測", "看到胸廓起伏後持續有效通氣，依流程重評心率", "心率未上升時先做通氣矯正，再考慮替代氣道與後續處置"] },
  { id: "io", group: "通路", title: "骨內針 IO", lead: "危急時的可靠通路，不是最後才想起來。", steps: ["確認病人危急、IV 無法快速建立、授權層級與禁忌", "選擇合適部位與針長，定位骨性標記並無菌準備", "固定肢體，進針方向避開生長板；手不可置於針尖後方", "依器材規範確認針體穩定、沖注順暢且無軟組織腫脹", "牢固固定，輸注期間持續監測滲漏、腫脹、疼痛與循環"] },
  { id: "im", group: "給藥", title: "兒科 IM 注射", lead: "部位與針長，跟藥一樣重要。", steps: ["執行用藥五對並核對體重、濃度、總劑量與毫升數", "嬰幼兒優先評估股外側肌；較大兒童依肌肉量選擇部位", "定位、消毒並以合適針具垂直 90 度進針", "注射過程觀察病童反應；休克／心停時 IM 吸收不可靠", "安全處置針具，記錄部位、時間、藥物與治療反應"] },
  { id: "rectal", group: "給藥", title: "肛門給藥", lead: "隱私、體位、確認劑型。", steps: ["核對適應症、藥物、劑型、體重與地方規範", "說明操作並維護隱私；一般採左側臥，依情況調整", "戴手套、暴露必要範圍並觀察肛門周圍是否異常", "依劑型輕柔置入，避免強推造成黏膜傷害", "保持適當體位、觀察排出與療效並完成紀錄"] },
  { id: "tape", group: "器材", title: "身長體重尺", lead: "把記憶負擔交給核准工具。", steps: ["病童平躺、頭頂對準尺端，沿身體拉直到足跟", "讀取對應色帶或估算體重，向團隊大聲報讀", "依區段準備氣道、面罩、固定及急救器材", "藥物仍須確認濃度、劑量上限與地方 SOP", "把估算來源、體重與使用器材記錄於救護紀錄"] },
];

const cases = [
  { no: "A", age: "出生 40 秒", title: "沒有哭、肌張力差", vital: "HR 82／分", prompt: "你能在 20 秒內說出下一步嗎？", answer: "保暖、擺位並立即建立有效正壓通氣；以胸廓起伏與心率上升確認效果。" },
  { no: "B", age: "八個月", title: "進食後突然無聲發紺", vital: "有反應、無有效咳嗽", prompt: "胸推還是腹部衝擊？", answer: "嚴重嬰兒異物梗塞：反覆 5 次背擊與 5 次胸推，不做腹部衝擊。" },
  { no: "C", age: "四歲", title: "喘兩天，現在突然安靜", vital: "SpO₂ 88%／嗜睡", prompt: "這是好轉，還是衰竭？", answer: "外觀與呼吸皆異常，是呼吸衰竭警訊；立即支援氧合與通氣並快速後送。" },
  { no: "D", age: "六個月", title: "低處跌落後嗜睡", vital: "敘述反覆改變", prompt: "除了頭部評估，還少了什麼？", answer: "完整暴露、客觀記錄、兒虐／疏忽警覺與依規定通報；避免誘導詢問。" },
];

const assessmentRows = [
  ["正常", "正常", "正常", "穩定", "持續評估"],
  ["正常", "異常", "正常", "呼吸窘迫", "給氧、找原因"],
  ["異常", "異常", "正常", "呼吸衰竭", "立即支援通氣"],
  ["正常", "正常", "異常", "代償性休克", "控制原因、支援循環"],
  ["異常", "正常", "異常", "非代償性休克", "積極復甦、快速後送"],
  ["異常", "異常", "異常", "心肺衰竭／停止", "立即 CPR／復甦"],
];

const vitalSignRows = [
  { stage: "新生兒", age: "出生–未滿 28 日", heart: "120–160", breathing: "40–60", pressure: "SBP＜60" },
  { stage: "嬰兒", age: "未滿 1 歲", heart: "80–140", breathing: "30–40", pressure: "SBP＜70" },
  { stage: "幼兒", age: "約 1–3 歲", heart: "80–120", breathing: "25–30", pressure: "SBP＜70＋(年齡×2)" },
  { stage: "學齡前", age: "約 4–5 歲", heart: "70–115", breathing: "20–25", pressure: "SBP＜70＋(年齡×2)" },
  { stage: "學齡兒童", age: "約 6–10 歲", heart: "70–115", breathing: "15–25", pressure: "SBP＜70＋(年齡×2)" },
  { stage: "青少年", age: "大於 10 歲", heart: "70–90", breathing: "15–20", pressure: "SBP＜90" },
];

type RulerMode = "length" | "weight";
type OhcaKey = "newborn" | "infant" | "child";
type RhythmKey = "shockable" | "nonshockable";

const rulerZones = [
  { key: "gray", label: "灰", minCm: 46.8, maxCm: 59.2, minKg: 3, maxKg: 5, estimate: 4, color: "#9aa0a3", ink: "#102b31", cuffed: "3.0", uncuffed: "2.5", depth: "9–10.5" },
  { key: "pink", label: "粉紅", minCm: 59.2, maxCm: 66.9, minKg: 6, maxKg: 7, estimate: 6.5, color: "#ee7da2", ink: "#102b31", cuffed: "3.0", uncuffed: "3.5", depth: "10–10.5" },
  { key: "red", label: "紅", minCm: 66.9, maxCm: 74.2, minKg: 8, maxKg: 9, estimate: 8.5, color: "#d84a48", ink: "#fff", cuffed: "3.0", uncuffed: "3.5", depth: "10.5–11" },
  { key: "purple", label: "紫", minCm: 74.2, maxCm: 83.8, minKg: 10, maxKg: 11, estimate: 10.5, color: "#76549c", ink: "#fff", cuffed: "3.5", uncuffed: "4.0", depth: "11–12" },
  { key: "yellow", label: "黃", minCm: 83.8, maxCm: 95.4, minKg: 12, maxKg: 14, estimate: 13, color: "#efd05b", ink: "#102b31", cuffed: "4.0", uncuffed: "4.5", depth: "12.5–13.5" },
  { key: "white", label: "白", minCm: 95.4, maxCm: 108.3, minKg: 15, maxKg: 18, estimate: 16.5, color: "#f7f3e9", ink: "#102b31", cuffed: "4.5", uncuffed: "5.0", depth: "14–15" },
  { key: "blue", label: "藍", minCm: 108.3, maxCm: 121.5, minKg: 19, maxKg: 23, estimate: 21, color: "#318bc3", ink: "#fff", cuffed: "5.0", uncuffed: "5.5", depth: "15.5–16.5" },
  { key: "orange", label: "橘", minCm: 121.5, maxCm: 130.7, minKg: 24, maxKg: 29, estimate: 26.5, color: "#e6813e", ink: "#102b31", cuffed: "5.5–6.0", uncuffed: "—", depth: "17–19.5" },
  { key: "green", label: "綠", minCm: 130.7, maxCm: 143.3, minKg: 30, maxKg: 36, estimate: 33, color: "#4e9870", ink: "#fff", cuffed: "6.0–6.5", uncuffed: "—", depth: "18.5–20.5" },
] as const;

const formatNumber = (value: number) => Number(value.toFixed(value < 10 ? 2 : 1)).toString();

const lmaSizeFor = (weight: number) => {
  if (weight <= 5) return "1";
  if (weight <= 10) return "1.5";
  if (weight <= 20) return "2";
  if (weight <= 30) return "2.5";
  return "3";
};

const ohcaFlows: Record<OhcaKey, { label: string; scope: string; warning: string; accent: string; steps: { phase: string; title: string; detail: string; action: string; mnemonic?: string }[] }> = {
  newborn: {
    label: "出生時新生兒復甦",
    scope: "出生現場／尚有臍帶",
    warning: "只用於出生時的轉銜復甦。已離開出生情境而發生心跳停止者，依嬰兒／兒童 OHCA 與地方 SOP 處理。",
    accent: "#eeb9a8",
    steps: [
      { phase: "PREPARE", title: "產前簡報與器材檢查", detail: "確認角色、保暖、通氣、監測、進階氣道與血管通路器材；至少一人能執行有效通氣。", action: "口頭完成團隊簡報，確認保暖與 PPV 裝備可立即使用。" },
      { phase: "FIRST LOOK", title: "出生後快速判斷", detail: "足月？肌張力良好？有呼吸或哭聲？若皆是，繼續評估；任一否，進入處置。", action: "保暖、擦乾、擺位、刺激；只有需要時才清理氣道。", mnemonic: "抽、擦、暖、激、擺｜必要時抽吸・擦乾・保暖・刺激・擺位" },
      { phase: "VENTILATE", title: "呼吸暫停／喘息或 HR＜100", detail: "立即開始有效通氣，接上右手／手腕脈搏血氧，考慮心電監測。胸廓起伏與心率上升是最重要的成效指標。", action: "執行 PPV；若胸廓不起伏，立即做通氣矯正並考慮進階氣道。", mnemonic: "擺、吸、漏、壓｜重新擺位・必要時抽吸・檢查面罩漏氣・逐步調整通氣壓力" },
      { phase: "REASSESS", title: "評估心率並分流", detail: "先聽診心前區；可在臍帶根部觸摸臍動脈搏動，若臍帶不適用則觸摸上臂內側肱動脈。觸診只作快速估計，應以 ECG／聽診確認。", action: "HR≥100：依呼吸狀況支持；HR 60–99：持續有效 PPV；有效通氣後 HR＜60：進入胸部按壓。" },
      { phase: "COMPRESS", title: "HR＜60：按壓＋通氣", detail: "進階氣道或喉罩、100% 氧、建立 UVC／IO；胸部按壓與通氣協調為 3:1。", action: "雙拇指環抱按壓；持續約 60 秒後在不中斷通氣下重評心率。" },
      { phase: "MEDICATION", title: "仍 HR＜60：藥物與原因", detail: "依授權以 UVC／IO 給 Epinephrine，每 3–5 分鐘可追加；同時考慮低血容與氣胸。", action: "持續有效通氣與按壓，準備復甦後照護、家屬溝通、後送與團隊檢討。" },
    ],
  },
  infant: {
    label: "嬰兒 OHCA",
    scope: "未滿一歲／非出生轉銜",
    warning: "兒科心跳停止多與缺氧相關，不能只做 hands-only CPR；通氣品質和按壓同等重要。",
    accent: "#8fc9c5",
    steps: [
      { phase: "RECOGNIZE", title: "確認無反應與呼吸異常", detail: "確認環境安全、刺激並呼叫；無正常呼吸或只有瀕死喘息，立即啟動支援並取得 AED／監視器。", action: "指定人員：壓胸、氣道、AED、計時／紀錄、通路與藥物。" },
      { phase: "PULSE ≤10 SEC", title: "同步檢查呼吸與肱動脈", detail: "10 秒內無法明確摸到脈搏，視為心跳停止。若 HR＜60 且灌流不良，經氧合與通氣仍未改善，也開始 CPR。", action: "不要因反覆摸脈搏延誤按壓。" },
      { phase: "HIGH-QUALITY CPR", title: "立即按壓並有效通氣", detail: "100–120 次／分，深度約胸廓前後徑 1/3（約 4 cm），完整回彈、中斷＜10 秒。", action: "單人 30:2；雙人 15:2。2025：使用單手掌根或雙拇指環抱，不再使用兩指按壓。" },
      { phase: "MONITOR", title: "BVM 給氧並接上 AED／監視器", detail: "每口氣約 1 秒、看見胸廓起伏；避免過快、過量通氣。每 2 分鐘換手並重新判讀節律。", action: "優先用兒童衰減器／貼片；無法取得時依設備指示與地方規範使用現有 AED。" },
      { phase: "RHYTHM", title: "判讀：可電擊或不可電擊", detail: "可電擊：VF／pVT；不可電擊：Asystole／PEA。選擇下方節律後，依分支執行 2 分鐘循環。", action: "按壓持續到除顫器充電完成，清場電擊後立刻恢復 CPR。" },
      { phase: "ROSC / TRANSPORT", title: "每 2 分鐘重評與尋找原因", detail: "反覆節律判讀、換手、確認通氣與可逆原因；出現 ROSC 時轉入復甦後照護。", action: "持續監測氧合、通氣、灌流與血糖，提前通知接收醫院並依地方 SOP 後送。" },
    ],
  },
  child: {
    label: "兒童 OHCA",
    scope: "一歲至青春期",
    warning: "青春期後依成人流程。年齡不確定時，以是否出現青春期徵象及地方 SOP 決定流程。",
    accent: "#f1cd66",
    steps: [
      { phase: "RECOGNIZE", title: "確認無反應與呼吸異常", detail: "確認環境安全、刺激並呼叫；無正常呼吸或只有瀕死喘息，立即啟動支援並取得 AED／監視器。", action: "指定人員：壓胸、氣道、AED、計時／紀錄、通路與藥物。" },
      { phase: "PULSE ≤10 SEC", title: "同步檢查呼吸與頸／股動脈", detail: "10 秒內無法明確摸到脈搏，視為心跳停止。若 HR＜60 且灌流不良，經氧合與通氣仍未改善，也開始 CPR。", action: "不要因反覆摸脈搏延誤按壓。" },
      { phase: "HIGH-QUALITY CPR", title: "立即按壓並有效通氣", detail: "100–120 次／分，深度約胸廓前後徑 1/3（約 5 cm），完整回彈、中斷＜10 秒。", action: "依體型使用單手或雙手掌根；單人 30:2，雙人 15:2。" },
      { phase: "MONITOR", title: "BVM 給氧並接上 AED／監視器", detail: "每口氣約 1 秒、看見胸廓起伏；避免過快、過量通氣。每 2 分鐘換手並重新判讀節律。", action: "優先使用手動去顫器；若無，依設備指示使用兒童模式／衰減器或可取得的 AED。" },
      { phase: "RHYTHM", title: "判讀：可電擊或不可電擊", detail: "可電擊：VF／pVT；不可電擊：Asystole／PEA。選擇下方節律後，依分支執行 2 分鐘循環。", action: "按壓持續到除顫器充電完成，清場電擊後立刻恢復 CPR。" },
      { phase: "ROSC / TRANSPORT", title: "每 2 分鐘重評與尋找原因", detail: "反覆節律判讀、換手、確認通氣與可逆原因；出現 ROSC 時轉入復甦後照護。", action: "持續監測氧合、通氣、灌流與血糖，提前通知接收醫院並依地方 SOP 後送。" },
    ],
  },
};

const rhythmBranches: Record<RhythmKey, { label: string; subtitle: string; cycles: { title: string; detail: string }[] }> = {
  shockable: {
    label: "可電擊：VF／pVT",
    subtitle: "電擊與 CPR 交替，藥物時機不要提前。",
    cycles: [
      { title: "第 1 次電擊", detail: "2 J/kg（流程允許 2–4 J/kg；為教學一致性採 2 J/kg），立刻 CPR 2 分鐘並建立 IV／IO。" },
      { title: "第 2 次電擊", detail: "4 J/kg，立刻 CPR 2 分鐘；Epinephrine 0.01 mg/kg IV／IO，每 3–5 分鐘，考慮進階氣道與波形 ETCO₂。" },
      { title: "第 3 次及後續", detail: "≥4 J/kg，最高 10 J/kg 或成人最大劑量；CPR 2 分鐘，Amiodarone 5 mg/kg 或 Lidocaine 1 mg/kg，處理可逆原因。" },
    ],
  },
  nonshockable: {
    label: "不可電擊：Asystole／PEA",
    subtitle: "不要電擊；Epinephrine 越早越好。",
    cycles: [
      { title: "立即 CPR＋給藥", detail: "持續 CPR，建立 IV／IO；Epinephrine 0.01 mg/kg IV／IO 儘早給予，之後每 3–5 分鐘。" },
      { title: "每 2 分鐘重評", detail: "重新判讀節律與脈搏；考慮進階氣道與波形 ETCO₂，持續高品質 CPR。" },
      { title: "積極找可逆原因", detail: "低血容、缺氧、酸血症、低血糖、鉀離子異常、低體溫、張力性氣胸、心包填塞、毒物與血栓等。" },
    ],
  },
};

export default function Home() {
  const [age, setAge] = useState<AgeKey>("newborn");
  const [emergency, setEmergency] = useState<EmergencyKey>("breathing");
  const [skill, setSkill] = useState(skills[0].id);
  const [caseOpen, setCaseOpen] = useState<string | null>(null);
  const [completed, setCompleted] = useState<string[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [rulerMode, setRulerMode] = useState<RulerMode>("length");
  const [lengthCm, setLengthCm] = useState(92);
  const [measuredWeight, setMeasuredWeight] = useState(14);
  const [ohcaPath, setOhcaPath] = useState<OhcaKey>("infant");
  const [ohcaStep, setOhcaStep] = useState(0);
  const [ohcaRhythm, setOhcaRhythm] = useState<RhythmKey | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("peds-field-skills");
    if (saved) setCompleted(JSON.parse(saved));
  }, []);

  const markSkill = (id: string) => {
    const next = completed.includes(id) ? completed.filter((item) => item !== id) : [...completed, id];
    setCompleted(next);
    localStorage.setItem("peds-field-skills", JSON.stringify(next));
  };

  const currentAge = ageProfiles[age];
  const currentEmergency = emergencies[emergency];
  const currentSkill = skills.find((item) => item.id === skill) ?? skills[0];
  const percent = useMemo(() => Math.round((completed.length / skills.length) * 100), [completed]);
  const lengthZone = rulerZones.find((zone, index) => lengthCm >= zone.minCm && (lengthCm < zone.maxCm || index === rulerZones.length - 1)) ?? rulerZones[0];
  const weightZone = rulerZones.find((zone) => measuredWeight <= zone.maxKg) ?? rulerZones[rulerZones.length - 1];
  const activeZone = rulerMode === "length" ? lengthZone : weightZone;
  const workingWeight = rulerMode === "length" ? activeZone.estimate : measuredWeight;
  const outsideColorRange = rulerMode === "weight" && (measuredWeight < 3 || measuredWeight > 36);
  const activeOhca = ohcaFlows[ohcaPath];
  const currentOhcaStep = activeOhca.steps[ohcaStep];
  const ohcaProgress = Math.round(((ohcaStep + 1) / activeOhca.steps.length) * 100);
  const selectOhcaPath = (key: OhcaKey) => {
    setOhcaPath(key);
    setOhcaStep(0);
    setOhcaRhythm(null);
  };

  return (
    <main id="top">
      <header className="nav-shell">
        <a className="wordmark" href="#top"><span>PEDS</span><i>//</i><b>FIELD</b><small>兒少救護教學</small></a>
        <button className="menu-button" aria-label="開啟導覽" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? "關閉" : "目錄"}</button>
        <nav className={menuOpen ? "show" : ""} aria-label="網站導覽">
          <a href="#ages" onClick={() => setMenuOpen(false)}>年齡分流</a>
          <a href="#vitals" onClick={() => setMenuOpen(false)}>生命徵象</a>
          <a href="#navigator" onClick={() => setMenuOpen(false)}>急症導航</a>
          <a href="#ohca" onClick={() => setMenuOpen(false)}>OHCA 流程</a>
          <a href="#skills" onClick={() => setMenuOpen(false)}>技術教室</a>
          <a href="#ruler" onClick={() => setMenuOpen(false)}>互動小兒尺</a>
          <a href="#teaching" onClick={() => setMenuOpen(false)}>情境教學</a>
        </nav>
        <div className="nav-status"><span className="live-dot" />2025 指引版</div>
      </header>

      <section className="hero">
        <div className="hero-aside"><span>PREHOSPITAL</span><span>PEDIATRIC</span><span>LIFE SUPPORT</span></div>
        <div className="hero-main">
          <p className="kicker">院前兒少救護・專業訓練平台</p>
          <h1>先看見<br /><span className="hero-title-line">孩子的<em>不一樣</em></span></h1>
          <p className="hero-lede">新生兒、嬰兒、兒童，各有不同的生理威脅與技術細節。這裡只談一件事：如何在現場更快辨識、更準確處置。</p>
          <div className="hero-links"><a href="#navigator">進入急症導航 <span>↘</span></a><a href="#skills">打開技術教室</a></div>
        </div>
        <div className="hero-visual" aria-label="兒少救護三個年齡層">
          <div className="orbit orbit-a"><span>NEWBORN</span></div>
          <div className="orbit orbit-b"><span>INFANT</span></div>
          <div className="orbit orbit-c"><span>CHILD</span></div>
          <div className="center-mark"><b>ABC</b><small>看・聽・判斷</small></div>
        </div>
        <div className="hero-foot"><span>NO. 01</span><p>兒童不是縮小的成人。<br />不要等數字惡化，才相信孩子不穩定。</p><i>SCROLL ↓</i></div>
      </section>

      <section className="age-section" id="ages">
        <div className="section-label"><span>01</span><p>AGE-FIRST<br />年齡先行</p></div>
        <div className="age-content">
          <div className="section-title"><p>先確認眼前是哪一種病人</p><h2>三個年齡層，<br />三套現場重點。</h2></div>
          <div className="age-tabs" role="tablist">
            {(Object.keys(ageProfiles) as AgeKey[]).map((key) => {
              const item = ageProfiles[key];
              return <button key={key} className={age === key ? "active" : ""} onClick={() => setAge(key)} role="tab" aria-selected={age === key}><span>{item.index}</span><b>{item.short}</b><small>{item.range}</small></button>;
            })}
          </div>
          <article className="age-panel" style={{ "--age-accent": currentAge.accent } as React.CSSProperties}>
            <div className="age-statement"><span>{currentAge.index} / 03</span><h3>{currentAge.headline}</h3><p>{currentAge.description}</p>{"definition" in currentAge && <div className="newborn-definition"><b>定義</b><p>{currentAge.definition}</p><small>{currentAge.scope}</small></div>}</div>
            <div className="age-column danger"><h4>先看哪些危險訊號</h4><ul>{currentAge.watch.map((item) => <li key={item}>{item}</li>)}</ul></div>
            <div className="age-column action"><h4>現場處置主軸</h4><ol>{currentAge.actions.map((item, index) => <li key={item}><span>{index + 1}</span>{item}</li>)}</ol></div>
            <div className="equipment"><b>器材提示</b>{currentAge.equipment.map((item) => <span key={item}>{item}</span>)}</div>
          </article>
        </div>
      </section>

      <section className="vitals-section" id="vitals">
        <div className="vitals-heading">
          <div className="section-label"><span>02</span><p>VITAL SIGNS<br />生命徵象</p></div>
          <div><p className="micro">RESTING REFERENCE · TREND MATTERS</p><h2>先知道正常，<br />才看得見變化。</h2></div>
          <p>以下是資料夾內 EMT-P 教科書的年齡平均參考值，適合出勤初評與教學速查。請在孩子安靜、未哭鬧時量測，並以連續趨勢和整體表現判讀。</p>
        </div>

        <div className="vitals-table-wrap">
          <table className="vitals-table">
            <caption>小兒各年齡層安靜時生命徵象參考值</caption>
            <thead><tr><th scope="col">年齡層</th><th scope="col">年齡</th><th scope="col">心率 <small>bpm</small></th><th scope="col">呼吸率 <small>次／分</small></th><th scope="col">低血壓判定公式 <small>收縮壓 mmHg</small></th></tr></thead>
            <tbody>{vitalSignRows.map((row) => <tr key={row.stage}><th scope="row">{row.stage}</th><td>{row.age}</td><td><b>{row.heart}</b></td><td><b>{row.breathing}</b></td><td><b>{row.pressure}</b></td></tr>)}</tbody>
          </table>
        </div>

        <div className="vitals-notes">
          <article><span>01</span><div><b>血氧 SpO₂</b><p>健康兒童在海平面多為 97–100%；95–96% 應結合呼吸作功、灌流與趨勢重新評估，≤94% 視為異常警訊。新生兒出生最初數分鐘應使用出生轉銜目標，不可直接套用此值。</p></div></article>
          <article><span>02</span><div><b>體溫</b><p>新生兒正常腋溫為 36.5–37.5°C。其他年齡須記錄測量部位與方式；環境、發燒、包覆及運動都會影響讀值。</p></div></article>
          <article><span>03</span><div><b>低血壓是晚期警訊</b><p>新生兒 SBP＜60、嬰兒 SBP＜70、1–10 歲 SBP＜70＋(年齡×2)、大於 10 歲 SBP＜90 mmHg。血壓正常仍不能排除代償性休克。</p></div></article>
        </div>

        <div className="vitals-caution"><b>判讀提醒</b><p>哭鬧、疼痛、發燒、脫水、藥物與焦慮常使心率或呼吸率升高；睡眠與運動員體質可能較低。單次數字不能取代 PAT、ABCDE 與重複評估。</p></div>
        <div className="vitals-sources"><span>資料來源：</span><a href="https://rightdecisions.scot.nhs.uk/dgrefhelp-nhs-dumfries-galloway/admissions/paediatric-admissions/" target="_blank" rel="noreferrer">NHS 小兒生命徵象 ↗</a><a href="https://www.who.int/data/gho/indicator-metadata-registry/imr-details/normothermia-on-admission" target="_blank" rel="noreferrer">WHO 新生兒正常體溫 ↗</a></div>
      </section>

      <section className="navigator-section" id="navigator">
        <div className="navigator-head"><div className="section-label light"><span>03</span><p>DECISION<br />急症導航</p></div><div><p className="micro">FROM FIRST LOOK TO FIRST ACTION</p><h2>從第一眼，<br />走到第一個正確動作。</h2></div><p>這不是診斷工具，而是訓練現場優先順序：辨識生理威脅、先做會改變結果的處置，再反覆評估。</p></div>
        <div className="navigator-body">
          <div className="emergency-list" role="tablist">{(Object.keys(emergencies) as EmergencyKey[]).map((key, index) => <button key={key} className={emergency === key ? "active" : ""} onClick={() => setEmergency(key)}><span>{String(index + 1).padStart(2, "0")}</span>{emergencies[key].label}<i>→</i></button>)}</div>
          <article className="emergency-panel">
            <div className="emergency-title"><p>辨識線索</p><h3>{currentEmergency.label}</h3><blockquote>{currentEmergency.cue}</blockquote></div>
            <div className="flow">{currentEmergency.steps.map((step, index) => <div className="flow-step" key={step.title}><span>{index + 1}</span><div><b>{step.title}</b><p>{step.detail}</p></div></div>)}</div>
            <div className="field-note"><span>FIELD NOTE</span><p>{currentEmergency.note}</p></div>
          </article>
        </div>
      </section>

      <section className="ohca-section" id="ohca" style={{ "--ohca-accent": activeOhca.accent } as React.CSSProperties}>
        <div className="ohca-heading">
          <div className="section-label light"><span>04</span><p>OHCA FIELD FLOW<br />心肺停止流程</p></div>
          <div><p className="micro">SELECT AGE · FOLLOW STEPS · REASSESS</p><h2>出勤時，<br />照順序走。</h2></div>
          <p>先選病人所處情境，再依序完成辨識、復甦與重評。每一步都保留返回修正，適合手機或平板現場對照。</p>
        </div>

        <div className="ohca-scope-alert"><b>先選對流程</b><p><strong>出生當下仍在轉銜期</strong>使用新生兒復甦；已離開出生轉銜情境的嬰兒與兒童 OHCA，使用兒科 BLS／心跳停止流程。</p></div>

        <div className="ohca-tabs" role="tablist" aria-label="選擇心肺停止流程">
          {(Object.keys(ohcaFlows) as OhcaKey[]).map((key) => <button key={key} className={ohcaPath === key ? "active" : ""} onClick={() => selectOhcaPath(key)} role="tab" aria-selected={ohcaPath === key}><b>{ohcaFlows[key].label}</b><small>{ohcaFlows[key].scope}</small></button>)}
        </div>

        <div className="ohca-warning"><span>適用範圍</span><p>{activeOhca.warning}</p></div>

        <div className="ohca-workbench">
          <aside className="ohca-step-list" aria-label="流程步驟">
            {activeOhca.steps.map((step, index) => <button key={`${step.phase}-${step.title}`} className={index === ohcaStep ? "active" : index < ohcaStep ? "done" : ""} onClick={() => setOhcaStep(index)} aria-current={index === ohcaStep ? "step" : undefined}><span>{index < ohcaStep ? "✓" : String(index + 1).padStart(2, "0")}</span><div><small>{step.phase}</small><b>{step.title}</b></div></button>)}
          </aside>

          <article className="ohca-current" aria-live="polite">
            <div className="ohca-progress"><span>STEP {String(ohcaStep + 1).padStart(2, "0")} / {String(activeOhca.steps.length).padStart(2, "0")}</span><b>{ohcaProgress}%</b><i><em style={{ width: `${ohcaProgress}%` }} /></i></div>
            <p className="ohca-phase">{currentOhcaStep.phase}</p>
            <h3>{currentOhcaStep.title}</h3>
            <p className="ohca-detail">{currentOhcaStep.detail}</p>
            <div className="ohca-action"><span>現在要做</span><div><p>{currentOhcaStep.action}</p>{currentOhcaStep.mnemonic && <small className="ohca-mnemonic"><b>口訣</b>{currentOhcaStep.mnemonic}</small>}</div></div>

            {ohcaPath === "newborn" && <div className="newborn-pulse-panel">
              <div className="newborn-pulse-title"><span>NEWBORN PULSE CHECK</span><b>新生兒心率／脈動評估位置</b><p>觸診容易低估心率，不可作為出生復甦唯一依據。</p></div>
              <div className="newborn-pulse-grid">
                <article><span>01</span><div><b>臍動脈／臍帶根部</b><p>在臍帶靠近腹壁的根部，以食指與中指輕觸搏動；仍連接臍帶時可快速估計心率。</p></div></article>
                <article><span>02</span><div><b>肱動脈</b><p>手臂微外展，在上臂內側、肱二頭肌與肱三頭肌之間，以兩指輕壓觸診。</p></div></article>
                <article className="preferred"><span>✓</span><div><b>確認方式：心前區聽診／ECG</b><p>出生轉銜初評以心前區聽診；需要復甦時儘早使用 ECG。進行胸部按壓時應以 ECG 快速、連續評估心率。</p></div></article>
              </div>
            </div>}

            {ohcaPath !== "newborn" && ohcaStep === 4 && <div className="rhythm-panel">
              <div className="rhythm-title"><b>選擇節律</b><span>每次節律分析後重新選擇</span></div>
              <div className="rhythm-buttons">{(Object.keys(rhythmBranches) as RhythmKey[]).map((key) => <button key={key} className={ohcaRhythm === key ? "active" : ""} onClick={() => setOhcaRhythm(key)}><b>{rhythmBranches[key].label}</b><small>{rhythmBranches[key].subtitle}</small></button>)}</div>
              {ohcaRhythm && <div className="rhythm-cycles">{rhythmBranches[ohcaRhythm].cycles.map((cycle, index) => <div key={cycle.title}><span>{index + 1}</span><p><b>{cycle.title}</b><small>{cycle.detail}</small></p></div>)}</div>}
            </div>}

            <div className="ohca-controls">
              <button disabled={ohcaStep === 0} onClick={() => setOhcaStep((step) => Math.max(0, step - 1))}>← 上一步</button>
              <button className="reset" onClick={() => { setOhcaStep(0); setOhcaRhythm(null); }}>重新開始</button>
              <button className="next" disabled={ohcaStep === 4 && ohcaPath !== "newborn" && !ohcaRhythm} onClick={() => setOhcaStep((step) => Math.min(activeOhca.steps.length - 1, step + 1))}>{ohcaStep === activeOhca.steps.length - 1 ? "流程完成 ✓" : "完成並下一步 →"}</button>
            </div>
          </article>
        </div>

        <div className="ohca-field-strip"><div><b>2 min</b><span>CPR 循環後分析節律</span></div><div><b>3–5 min</b><span>Epinephrine 重複間隔</span></div><div><b>VENTILATE</b><span>避免過度換氣，確認胸廓起伏</span></div><div><b>LOCAL SOP</b><span>地方流程與醫療指導優先</span></div></div>
        <p className="ohca-disclaimer">此工具供訓練與現場認知輔助，不取代合格訓練、醫療指導、核准器材標示與所屬機關 SOP。</p>
        <div className="ohca-sources"><span>2025 AHA 參考：</span><a href="https://cpr.heart.org/-/media/CPR-Files/CPR-Guidelines-Files/2025-Algorithms/Algorithm-PALS-CA-250123.pdf" target="_blank" rel="noreferrer">兒科心跳停止流程 ↗</a><a href="https://cpr.heart.org/-/media/CPR-Files/CPR-Guidelines-Files/2025-Algorithms/1-2-Algorithm-Neonatal-Resuscitation-250129.pdf?sc_lang=en" target="_blank" rel="noreferrer">新生兒復甦流程 ↗</a></div>
      </section>

      <section className="pat-section">
        <div className="pat-intro"><p className="micro">PAT / PEDIATRIC ASSESSMENT TRIANGLE</p><h2>六十秒，<br />先形成生理臆斷。</h2><p>PAT 只用視覺與聽覺快速分類，不需要先碰觸孩子。完成後仍必須進入 ABCDE 與生命徵象評估。</p><div className="triangle" aria-label="兒童評估三角：外觀、呼吸作功、皮膚循環"><div className="tri-shape" aria-hidden="true" /><div className="tri-center"><b>PAT</b><small>60 秒初評</small></div><span className="tri-node tri-appearance"><i>01</i><b>外觀</b><small>Appearance</small></span><span className="tri-node tri-breathing"><i>02</i><b>呼吸作功</b><small>Work of Breathing</small></span><span className="tri-node tri-circulation"><i>03</i><b>皮膚循環</b><small>Circulation to Skin</small></span></div></div>
        <div className="pat-table" role="table" aria-label="PAT 生理分類">
          <div className="table-row table-head" role="row"><span>外觀</span><span>呼吸</span><span>循環</span><span>生理臆斷</span><span>第一優先</span></div>
          {assessmentRows.map((row) => <div className="table-row" role="row" key={row[3]}>{row.map((item, index) => <span key={`${index}-${item}`} className={item === "異常" ? "abnormal" : index === 3 ? "category" : ""}>{item}</span>)}</div>)}
        </div>
      </section>

      <section className="skills-section" id="skills">
        <div className="skills-head"><div className="section-label"><span>05</span><p>SKILL LAB<br />技術教室</p></div><div><p className="micro">ACTION + VERBALIZATION + REASSESSMENT</p><h2>把技術拆到<br />每一步都能被檢核。</h2></div><div className="skill-progress"><b>{percent}%</b><span>已完成 {completed.length} / {skills.length} 項</span><i><em style={{ width: `${percent}%` }} /></i></div></div>
        <div className="skill-workbench">
          <div className="skill-index">{skills.map((item, index) => <button key={item.id} className={skill === item.id ? "active" : ""} onClick={() => setSkill(item.id)}><span>{String(index + 1).padStart(2, "0")}</span><div><small>{item.group}</small><b>{item.title}</b></div>{completed.includes(item.id) && <i>✓</i>}</button>)}</div>
          <article className="skill-detail">
            <div className="skill-top"><div><span>{currentSkill.group} / PROCEDURE</span><h3>{currentSkill.title}</h3><p>{currentSkill.lead}</p></div><div className="procedure-mark">STEP<br /><b>01–05</b></div></div>
            <ol>{currentSkill.steps.map((step, index) => <li key={step}><span>{String(index + 1).padStart(2, "0")}</span><p>{step}</p></li>)}</ol>
            <div className="skill-actions"><button className={completed.includes(currentSkill.id) ? "done" : ""} onClick={() => markSkill(currentSkill.id)}>{completed.includes(currentSkill.id) ? "✓ 已完成檢核" : "標記已完成檢核"}</button><p>技術需由合格教官以實體器材進行最終確認。</p></div>
          </article>
        </div>
      </section>

      <section className="ruler-section" id="ruler" style={{ "--zone": activeZone.color, "--zone-ink": activeZone.ink } as React.CSSProperties}>
        <div className="ruler-heading">
          <div className="section-label"><span>06</span><p>PEDIATRIC TAPE<br />互動小兒尺</p></div>
          <div><p className="micro">MEASURE · PREPARE · CROSS-CHECK</p><h2>少背公式，<br />多一次安全複核。</h2></div>
          <p>先使用實測體重；無法取得時，身長色帶只能作為初始估算。結果用於教學演練，臨床仍須依核准工具、設備標示、醫療指導與地方 SOP。</p>
        </div>

        <div className="ruler-workbench">
          <div className="ruler-controls">
            <div className="ruler-tabs" role="tablist" aria-label="小兒尺輸入方式">
              <button className={rulerMode === "length" ? "active" : ""} onClick={() => setRulerMode("length")} role="tab" aria-selected={rulerMode === "length"}>身長估算</button>
              <button className={rulerMode === "weight" ? "active" : ""} onClick={() => setRulerMode("weight")} role="tab" aria-selected={rulerMode === "weight"}>實測體重</button>
            </div>

            {rulerMode === "length" ? <div className="ruler-input">
              <label htmlFor="length-input"><span>仰躺身長</span><b>{lengthCm.toFixed(1)}<small>cm</small></b></label>
              <input id="length-input" type="range" min="46.8" max="143.2" step="0.1" value={lengthCm} onChange={(event) => setLengthCm(Number(event.target.value))} />
              <div className="ruler-scale" aria-hidden="true"><span>46.8</span><i /><i /><i /><i /><i /><i /><i /><span>143.3 cm</span></div>
              <p>頭頂對準尺端，沿身體拉至足跟；色帶提供估算區間，不等於實際體重。</p>
            </div> : <div className="ruler-input">
              <label htmlFor="weight-input"><span>實測體重</span><b>{measuredWeight.toFixed(1)}<small>kg</small></b></label>
              <input id="weight-input" type="range" min="1" max="50" step="0.5" value={measuredWeight} onChange={(event) => setMeasuredWeight(Number(event.target.value))} />
              <div className="ruler-scale" aria-hidden="true"><span>1</span><i /><i /><i /><i /><i /><i /><i /><span>50 kg</span></div>
              <p>已知體重時，所有劑量計算皆以實測值優先；色帶只負責協助整理器材。</p>
            </div>}

            <div className="zone-strip" aria-label="小兒尺九個顏色區間">
              {rulerZones.map((zone) => <button key={zone.key} className={activeZone.key === zone.key ? "active" : ""} style={{ "--swatch": zone.color, "--swatch-ink": zone.ink } as React.CSSProperties} onClick={() => { setRulerMode("length"); setLengthCm((zone.minCm + zone.maxCm) / 2); }} aria-label={`${zone.label}色，${zone.minKg} 至 ${zone.maxKg} 公斤`}><span>{zone.label}</span><small>{zone.minKg}–{zone.maxKg}</small></button>)}
            </div>

            <div className="zone-result">
              <span>{activeZone.label}色區</span>
              <b>{rulerMode === "length" ? `${activeZone.minKg}–${activeZone.maxKg} kg` : `${formatNumber(workingWeight)} kg`}</b>
              <p>{rulerMode === "length" ? `教學估算採區間中值 ${formatNumber(workingWeight)} kg 計算` : outsideColorRange ? "超出九色尺常用範圍，僅以實測體重進行公式計算" : `對應 ${activeZone.label}色器材區，劑量仍以實測體重計算`}</p>
            </div>
          </div>

          <div className="ruler-output" aria-live="polite">
            <div className="output-top"><div><span>WORKING WEIGHT</span><b>{formatNumber(workingWeight)}<small>kg</small></b></div><p>每次給藥前口頭交叉核對：病人、體重、適應症、藥名、濃度、mg 與 mL。</p></div>
            <div className="output-grid">
              <article><span>01 / 電擊</span><h3>去顫能量</h3><dl><div><dt>第一次</dt><dd>{formatNumber(workingWeight * 2)} J</dd></div><div><dt>第二次</dt><dd>{formatNumber(workingWeight * 4)} J</dd></div><div><dt>後續</dt><dd>≥ {formatNumber(workingWeight * 4)} J</dd></div></dl><small>後續不超過 10 J/kg 或成人最大劑量。</small></article>
              <article><span>02 / 心停藥物</span><h3>IV／IO 劑量</h3><dl><div><dt>Epinephrine</dt><dd>{formatNumber(Math.min(workingWeight * .01, 1))} mg</dd></div><div><dt>0.1 mg/mL</dt><dd>{formatNumber(Math.min(workingWeight * .1, 10))} mL</dd></div><div><dt>Amiodarone</dt><dd>{formatNumber(Math.min(workingWeight * 5, 300))} mg</dd></div><div><dt>Lidocaine</dt><dd>{formatNumber(workingWeight)} mg</dd></div></dl><small>Epinephrine 每 3–5 分鐘；Amiodarone 後續單次上限另見流程。</small></article>
              <article><span>03 / 氣道</span><h3>起始尺寸</h3><dl><div><dt>有囊 ETT</dt><dd>{activeZone.cuffed} mm</dd></div><div><dt>無囊 ETT</dt><dd>{activeZone.uncuffed} mm</dd></div><div><dt>口角深度</dt><dd>{activeZone.depth} cm</dd></div><div><dt>LMA</dt><dd>Size {lmaSizeFor(workingWeight)}</dd></div></dl><small>準備相鄰尺寸；以胸廓、聽診、波形 ETCO₂ 及影像確認位置。</small></article>
              <article><span>04 / 循環</span><h3>補液速算</h3><dl><div><dt>10 mL/kg</dt><dd>{formatNumber(workingWeight * 10)} mL</dd></div><div><dt>20 mL/kg</dt><dd>{formatNumber(workingWeight * 20)} mL</dd></div></dl><small>依休克病因與地方 SOP 選擇；每次給予後重評呼吸、灌流與液體過量。</small></article>
            </div>
            <div className="ruler-warning"><b>教學安全界線</b><p>這不是 Broselow® 原廠產品、醫療器材或處方工具。身長估重可能低估實際體重；2025 年部分 AirLife Broselow Rainbow Tape 曾有 FDA Class I 召回，使用實體尺前應確認版次、批號與最新通知。</p></div>
            <div className="ruler-sources"><span>依據</span><a href="https://cpr.heart.org/-/media/CPR-Files/CPR-Guidelines-Files/2025-Algorithms/Algorithm-PALS-CA-250123.pdf" target="_blank" rel="noreferrer">2025 AHA/AAP 小兒心停流程 ↗</a><a href="https://www.oregon.gov/oha/PH/PROVIDERPARTNERRESOURCES/EMS/EMSFORCHILDREN/Documents/Broselow-Cart-Manual.pdf" target="_blank" rel="noreferrer">Oregon EMSC 器材尺寸手冊 ↗</a><a href="https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfRes/res.cfm?ID=213894" target="_blank" rel="noreferrer">FDA 召回通知 ↗</a></div>
          </div>
        </div>
      </section>

      <section className="teaching-section" id="teaching">
        <div className="teaching-title"><div className="section-label light"><span>07</span><p>TEACHING<br />情境教學</p></div><div><p className="micro">PAUSE · DECIDE · DEBRIEF</p><h2>不要只問「會不會」，<br />要看他何時做出決定。</h2></div></div>
        <div className="case-grid">{cases.map((item) => <article className={caseOpen === item.no ? "case open" : "case"} key={item.no}>
          <button onClick={() => setCaseOpen(caseOpen === item.no ? null : item.no)} aria-expanded={caseOpen === item.no}><span className="case-no">CASE {item.no}</span><small>{item.age}</small><h3>{item.title}</h3><p>{item.vital}</p><b>{item.prompt}</b><i>{caseOpen === item.no ? "收起" : "揭曉"} →</i></button>
          {caseOpen === item.no && <div className="answer"><span>教官重點</span><p>{item.answer}</p></div>}
        </article>)}</div>
        <div className="debrief-bar"><span>情境後固定問三題</span><div className="debrief-questions"><p><b>你第一眼看到什麼？</b><small>（訓練快速辨識外觀、呼吸作功與皮膚循環的異常。）</small></p><p><b>哪個威脅最先要處理？</b><small>（建立依生命威脅排序、優先處理最致命問題的判斷。）</small></p><p><b>什麼結果證明處置有效？</b><small>（確認能用可觀察的指標再次評估，並決定是否調整處置。）</small></p></div></div>
      </section>

      <section className="field-kit">
        <div><p className="micro">READY BEFORE THE CALL</p><h2>出勤前兒少器材確認</h2></div>
        <div className="kit-grid"><p>□ 新生兒／嬰兒／兒童面罩尺寸</p><p>□ BVM、氧氣與抽吸測試</p><p>□ 兒童 AED 模式／貼片／衰減器</p><p>□ 肩背墊、保暖與新生兒包覆</p><p>□ 身長體重尺與尺寸化器材</p><p>□ 最新藥物表與地方 SOP</p><p>□ IO 器材、針長及固定用品</p><p>□ 兒少保護紀錄與通報路徑</p></div>
      </section>

      <footer>
        <div className="footer-brand"><span>PEDS//FIELD</span><h2>看見差異，<br />做對第一步。</h2></div>
        <div className="footer-links"><b>專業參考</b><a href="https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines/pediatric-basic-life-support" target="_blank" rel="noreferrer">2025 Pediatric BLS ↗</a><a href="https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines/pediatric-advanced-life-support" target="_blank" rel="noreferrer">2025 Pediatric ALS ↗</a><a href="https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines/neonatal-resuscitation" target="_blank" rel="noreferrer">2025 Neonatal Resuscitation ↗</a></div>
        <div className="footer-scope"><b>使用範圍</b><p>供 EMT 與專業救護教育訓練使用。藥物、輸液、骨內針、進階氣道及電擊能量，應依救護層級、醫療指導及彰化縣現行 SOP 執行。</p></div>
        <p className="copyright">© 2026 PEDS//FIELD · 院前兒少救護教學</p>
      </footer>
    </main>
  );
}
