"use client";

import { useEffect, useMemo, useState } from "react";

type AgeKey = "newborn" | "infant" | "child";
type EmergencyKey = "breathing" | "arrest" | "choking" | "seizure" | "shock" | "trauma";
type ApgarKey = "appearance" | "pulse" | "grimace" | "activity" | "respiration";
type ApgarTime = 1 | 5 | 10 | 15 | 20;
type ApgarScores = Record<ApgarKey, number | null>;
type MaternalKey = "assessment" | "birth" | "complication" | "pph" | "eclampsia" | "trauma" | "arrest";

const maternalGuides: Record<MaternalKey, { label: string; cue: string; priority: string; steps: string[]; avoid: string }> = {
  assessment: { label: "孕婦評估", cue: "腹痛、出血、破水、頭痛／視覺異常、呼吸困難、胎動減少，或任何不穩定生命徵象。", priority: "母體復甦優先；胎兒最好的早期治療，是改善母體氧合與灌流。", steps: ["ABCDE；問 G/P、孕週／預產期、產檢與高風險病史", "問陣痛起始、持續與間隔；破水時間、顏色、氣味與量", "記錄出血量與趨勢；少量陰道出血不能排除腹腔內出血或胎盤早期剝離", "非心停且約 20 週以上，可依傷勢與固定需求採左側傾／左側臥", "及早決定產科、創傷或新生兒資源並預警"], avoid: "不要只因血壓正常就排除休克；孕期代償可能掩蓋早期失血。" },
  birth: { label: "即將生產", cue: "胎頭／先露部可見、會陰膨出、強烈便意或不自主用力；陣痛持續密集加強。", priority: "以胎頭露出、產程進展、運送時間與 SOP 綜合判斷；陣痛每 3–5 分鐘不是單獨接生依據。", steps: ["保護隱私、保暖、鋪巾並備妥母嬰兩套復甦器材", "支持胎頭自然產出並控制速度，不拉扯胎頭或胎兒", "檢查臍帶繞頸；緊繞且妨礙生產時才依 SOP／醫療指導處理", "等待自然旋轉與肩膀產出；立即接住、擦乾、保暖並評估新生兒", "無需立即復甦者延遲夾臍至少 60 秒；不要為延遲夾臍而延誤通氣"], avoid: "不強拉胎頭、不牽拉臍帶或胎盤；胎盤自然產出後保存送醫。" },
  complication: { label: "難產／臍帶", cue: "破水後臍帶外露、胎頭已出但肩膀未出，或臀位／肢體先露。", priority: "立即呼叫醫療指導並預警具緊急剖腹產能力醫院。", steps: ["臍帶脫垂：膝胸臥或骨盆抬高；依訓練持續抬高先露部", "外露臍帶以溫濕無菌敷料輕覆；不反覆觸摸、不塞回", "肩難產：McRoberts 姿勢＋恥骨上加壓並記錄胎頭產出時間", "臀位：支持已自然產出的部分、不拉扯，避免壓迫臍帶", "快速後送；已開始的手動減壓途中持續至手術團隊接手"], avoid: "肩難產不可子宮底加壓、不可拉頭；臍帶脫垂不可嘗試推回臍帶。" },
  pph: { label: "產後出血", cue: "失血約 300 mL 且生命徵象異常，或約 500 mL；任何持續大量出血、休克或惡化趨勢皆視為危急。", priority: "邊控制出血、保暖與復甦，邊啟動產科與大量出血資源。", steps: ["外部子宮底按摩；不要將手伸入產道", "外陰明顯撕裂出血可用乾淨敷料直接加壓；勿填塞陰道", "監測、保暖、建立大口徑 IV／IO；晶質液依反應與 SOP，避免無限制灌注", "TXA、子宮收縮藥及血品僅依 EMS protocol／醫療指導", "胎盤未出不可牽拉臍帶；已產出則保存送醫"], avoid: "不要等待達到固定估算量才處理；目測出血量常被低估。" },
  eclampsia: { label: "子癇／高血壓", cue: "20 週後或產後：SBP ≥160 或 DBP ≥110、劇烈頭痛、視覺異常、右上腹痛、呼吸困難、意識改變或癲癇。", priority: "保護氣道、氧合／通氣、避免受傷、左側傾並快速後送。", steps: ["記錄發作時間並排除低血糖等可逆原因", "不要壓制肢體、不要在口內塞物；抽搐後重新評估呼吸", "持續監測血壓、SpO₂、心律、意識與再發", "硫酸鎂僅依層級、protocol 與醫療指導", "使用鎂劑時監測呼吸、反射與循環，備妥鈣劑處理毒性"], avoid: "不能只靠水腫或蛋白尿排除／確認子癇前症。" },
  trauma: { label: "孕婦創傷", cue: "任何創傷合併腹痛、子宮壓痛／收縮、陰道出血、破水、胎動減少或異常灌流。", priority: "XABCDE 不變；母體優先，並用孕期生理重新解讀正常數字。", steps: ["先控制致命性出血並防失溫；正常血壓不能排除顯著失血", "呼吸道較易水腫且去飽和較快，及早準備困難氣道", "約 20 週以上、非心停時左側傾／左側臥，同時兼顧脊椎固定", "重大外傷送創傷中心並預警產科／新生兒團隊", "可存活孕週外傷通常需院內至少 4–6 小時正式觀察與胎兒評估"], avoid: "即使撞擊看似輕微且暫無症狀，也不宜因單次正常檢查而輕率拒送。" },
  arrest: { label: "孕婦心跳停止", cue: "無反應、無正常呼吸；辨認後立刻依成人 BLS／ALS 啟動復甦。", priority: "仰臥硬平面高品質 CPR＋持續手動向左推移子宮；標準電擊能量與藥物。", steps: ["立即 CPR、AED／去顫；不要降低電擊能量", "子宮底達臍部或以上：持續手動向左推移子宮，不以側躺取代有效按壓", "早期氣道；IV 優先置於橫膈以上", "立即啟動產科、新生兒、麻醉與外科資源", "未 ROSC 且子宮底達臍部：從辨認心停即準備復甦性分娩，目標 5 分鐘內完成；院前依系統能力與醫療指導"], avoid: "不要為胎兒監測中斷母體復甦；分娩後由另一團隊立即處理新生兒。" },
};

const ageProfiles = {
  newborn: {
    index: "01",
    short: "新生兒",
    range: "出生後 1 個月內",
    headline: "先讓肺張開，心率才會上升。",
    description: "出生當下的復甦以保暖與有效通氣為核心。不要把新生兒流程直接套成一般嬰兒 CPR。",
    definition: "本學習站將新生兒定義為出生後 1 個月內的嬰兒。PHPLS 藥物表若另列＜28 日門檻，仍依教材原表執行。",
    scope: "流程提醒：AHA 新生兒復甦流程主要處理出生時由胎內到胎外的轉銜；出生數日後的急症，應依病理生理、醫療指導及地方規範選擇新生兒或兒科流程。",
    watch: ["足月？肌張力好？有呼吸或哭聲？", "喘息、呼吸暫停或心率低於 100/分", "低體溫、持續發紺、呼吸費力"],
    actions: ["無需立即復甦者延遲夾臍至少 60 秒", "保暖、擦乾、擺位、刺激；不常規抽吸", "需要時在黃金一分鐘內開始 PPV：30–60 次／分、每次充氣 0.5–1 秒", "以胸廓起伏及心率上升確認通氣有效"],
    equipment: ["保暖包覆", "新生兒面罩", "BVM / T-piece", "抽吸設備", "血氧與 ECG"],
    accent: "#eeb9a8",
  },
  infant: {
    index: "02",
    short: "嬰兒",
    range: "出生滿 1 個月後至未滿 1 歲",
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

const apgarItems: { key: ApgarKey; letter: string; label: string; options: [string, string, string] }[] = [
  { key: "appearance", letter: "A", label: "Appearance｜外觀／膚色", options: ["全身蒼白或發紺", "軀幹紅、四肢發紺", "全身紅潤"] },
  { key: "pulse", letter: "P", label: "Pulse｜心率", options: ["無心率", "＜100／分", "≥100／分"] },
  { key: "grimace", letter: "G", label: "Grimace｜刺激反應", options: ["無反應", "皺眉／反應弱", "咳、噴嚏、哭或退縮"] },
  { key: "activity", letter: "A", label: "Activity｜肌張力", options: ["鬆軟", "四肢輕度屈曲", "主動活動"] },
  { key: "respiration", letter: "R", label: "Respiration｜呼吸", options: ["無呼吸", "慢、不規則或弱哭", "呼吸佳、強哭"] },
];
const apgarTimes: ApgarTime[] = [1, 5, 10, 15, 20];
const blankApgar = (): ApgarScores => ({ appearance: null, pulse: null, grimace: null, activity: null, respiration: null });

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
      { title: "測量並處置血糖", detail: "低血糖是可逆原因；確認能否安全吞嚥，無法口服時依 Rule of 50 教學表或現行地方 SOP 給予葡萄糖，並於 5–10 分鐘重測。" },
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
      { title: "X：大出血", detail: "直接加壓優先；兒童總血量少，少量外觀看來也可能重要。PHPLS 教材估算總血量：嬰兒約 80 mL/kg、1–3 歲約 75 mL/kg、3 歲以上約 70 mL/kg。" },
      { title: "A/B：氧合", detail: "頭大、氣道小；維持中立姿勢並避免過度通氣。" },
      { title: "C/D：循環神經", detail: "評估脈搏、CRT、皮膚、AVPU、瞳孔、肌張力與血糖。" },
      { title: "E：暴露後保暖", detail: "完整看傷口、瘀青與皮疹，檢查後立即覆蓋。" },
      { title: "保護與紀錄", detail: "以 TEN-4-FACESp 篩檢高風險瘀傷；記錄照顧者原話、時間線與傷勢位置，不誘導、不指控，依規定通報。" },
    ],
    note: "TEN-4-FACESp 是篩檢工具、不是診斷；一歲以下骨折或頭部外傷、延遲就醫、敘述不一致都需提高警覺。",
  },
};

type Skill = { id: string; group: string; title: string; lead: string; mnemonic: string; steps: string[]; success: string; pitfalls: string[] };

const skills: Skill[] = [
  { id: "pat", group: "評估", title: "60 秒 PAT", lead: "不碰孩子，先看出危急。", mnemonic: "看、聽、合｜看外觀・聽呼吸・合併皮膚循環", steps: ["先看外觀：肌張力、互動、安撫性、凝視、哭聲／語言", "再看呼吸作功：姿勢、胸凹、鼻翼搧動與異常呼吸音", "看皮膚循環：蒼白、發紺與大理石斑", "整合生理臆斷：穩定、呼吸窘迫／衰竭、休克、中樞異常或心肺衰竭", "接續 ABCDE；創傷則從 XABCDE 開始，並持續重評"], success: "60 秒內說出生理威脅與第一優先處置。", pitfalls: ["先碰孩子、先量血壓而錯過第一眼", "把 PAT 當完整評估，沒有接續 ABCDE"] },
  { id: "bvm", group: "氣道", title: "兒科 BVM 通氣", lead: "面罩密合、胸廓起伏、心率上升。", mnemonic: "罩、擺、扣、擠、看｜無效再做：擺、吸、漏、壓", steps: ["選面罩：只覆蓋鼻口，不壓眼睛、不超過下巴", "擺位：維持中立／嗅聞姿勢；嬰幼兒依體型在肩背下墊高", "密合：EC 扣罩；兩人法由一人雙手密合、一人擠壓", "每口約 1 秒，僅擠到看見胸廓起伏，避免過快或過量；設備可監測時，潮氣量參考為新生兒 4–6 mL/kg、嬰兒與兒童 6–8 mL/kg", "胸廓不起伏：依『擺、吸、漏、壓』重新擺位、必要時抽吸、檢查漏氣、逐步調壓；完整 MRSOPA 還包括張口與替代氣道，每做一項就重看胸廓與心率"], success: "胸廓可見起伏、心率上升，且沒有明顯漏氣或胃部過度膨脹。", pitfalls: ["面罩壓眼或超過下巴", "只加大壓力，沒有先修正擺位與密合"] },
  { id: "infant-cpr", group: "復甦", title: "嬰兒／兒童 CPR＋AED", lead: "按得深、回得全、中斷短；AED 到就用。", mnemonic: "安、叫、查、叫、C-A-B-D｜AED：開、貼、插、電", steps: ["安：確認安全與 PPE；叫：檢查反應並呼救、啟動支援", "查：同步看呼吸與摸脈搏，不超過 10 秒；嬰兒肱動脈、兒童頸／股動脈", "C：100–120／分、胸廓前後徑 1/3；嬰兒約 4 cm、兒童約 5 cm，完整回彈", "A／B：單人 30:2、雙人 15:2；每口約 1 秒並確認胸廓起伏", "D：AED 開機、貼片、插接頭、依指示電擊；電擊後立即恢復 CPR 2 分鐘"], success: "按壓速率與深度合格、中斷少於 10 秒、每次通氣看見胸廓起伏。", pitfalls: ["2025 嬰兒仍用兩指按壓；應改單手掌根或雙拇指環抱", "電擊後先摸脈搏，延誤恢復按壓"] },
  { id: "choking", group: "復甦", title: "小兒異物梗塞", lead: "先分有效咳嗽與嚴重梗塞；看不見就不盲挖。", mnemonic: "咳、五背、五推、倒、壓、看", steps: ["咳：仍能有效咳嗽、發聲或哭泣，鼓勵咳嗽並持續觀察", "嚴重梗塞且有反應：嬰兒反覆 5 背擊＋5 胸推；兒童反覆 5 背擊＋5 腹部衝擊", "倒：失去反應時安全置於堅硬平面，呼救並啟動 CPR", "壓：從胸外按壓開始；每次開放氣道準備通氣時檢查口腔", "看：只移除清楚看得到的異物；解除後重評呼吸、殘留異物與氣道損傷"], success: "能正確依年齡選擇推擊位置，失去反應後無延誤開始 CPR，且不盲目挖取。", pitfalls: ["對嬰兒做腹部衝擊", "孩子仍能有效咳嗽時急著拍打，或看不到異物仍伸手盲挖"] },
  { id: "newborn-ppv", group: "新生兒", title: "新生兒初步處置與 PPV", lead: "先把肺打開；心率上升是最佳成效指標。", mnemonic: "初步：擦、暖、激、擺｜校正：擺、吸、漏、壓", steps: ["出生前團隊簡報、保暖並完成通氣、必要抽吸、監測與進階器材檢查；無需立即復甦者延遲夾臍至少 60 秒", "快速問：足月？肌張力良好？有呼吸或哭聲？任一否即做初步處置", "擦乾、保暖、刺激與擺位；即使胎便污染也不常規抽吸，只有氣道疑似阻塞才處理", "呼吸暫停／喘息或 HR＜100：黃金一分鐘內開始 PPV，30–60 次／分、每次充氣 0.5–1 秒；接右手／手腕血氧並考慮 ECG", "胸廓不起伏或心率不升：做通氣校正；有效通氣 30 秒後 HR＜60 才進入 3:1 按壓"], success: "胸廓起伏且心率上升；依心率 ≥100、60–99、＜60 正確分流。", pitfalls: ["把例行抽吸當成每位新生兒必做", "尚未建立至少 30 秒有效通氣就急著按壓或給藥"] },
  { id: "io", group: "通路", title: "骨內針 IO", lead: "選點準、落空停、抽沖看腫。", mnemonic: "選、找、排、固、九、線、落、抽、沖、腫、固、記", steps: ["選針與選點：依軟組織深度選長度；優先依 SOP 選近端脛骨等核准部位", "找骨標、消毒、預充延長管並固定肢體；操作手不可放在針尖後方", "90 度進針；確認皮外仍看得到至少 5 mm 標線後才啟動鑽針", "感到阻力突然降低即停止，移除針芯並立刻投入利器盒", "確認穩定、回抽；以 2–5 mL 生理食鹽水沖管並看有無腫脹，最後固定、記時、持續監測"], success: "針體穩定、沖注順暢，周圍沒有滲漏或腫脹。", pitfalls: ["未見 5 mm 標線仍進針，可能針長不足", "只靠是否抽到骨髓判斷成功，沒有沖管與觀察腫脹"] },
  { id: "im", group: "給藥", title: "兒科 IM 注射", lead: "先核對與定位，再談進針；心停與嚴重休克不走 IM。", mnemonic: "五對、備抽、定位、消毒、九十、注錄", steps: ["五對：病人、藥物、劑量、途徑、時間；再核對體重、濃度、總量與 mL", "適應症：IM 可用於過敏 Epinephrine、癲癇 Midazolam 等核准情境；心跳停止或嚴重休克因周邊灌流差，不建議用 IM 給急救藥", "定位：新生兒／嬰兒與 1–3 歲優先股外側肌；3 歲以上依肌肉量與藥量評估三角肌、股外側肌或腹臀區，避免背臀區", "針具：PHPLS 教材列 22–25G；嬰幼兒常用約 25 mm，較大兒童依部位、肌肉與皮下厚度個別選 16–32 mm", "無菌備抽、消毒待乾，以 90 度快速進針；平穩注入、拔針處理針具，紀錄部位、時間、藥物、劑量與反應"], success: "劑量與 mL 計算正確、部位定位安全、全程無菌且完成紀錄監測。", pitfalls: ["在心停或嚴重休克仍選 IM，忽略吸收不可靠", "把年齡固定綁定單一針具，或使用背臀肌區造成神經與血管風險"] },
  { id: "inhaled-meds", group: "給藥", title: "呼吸藥物｜Wheezing vs Croup", lead: "先辨呼吸音，再選藥物與途徑；兩條路徑不可混用。", mnemonic: "辨、核、給、流、評", steps: ["辨：Wheezing／哮鳴多指向下呼吸道；Croup／哮吼常見吸氣性 stridor，先評估是否呼吸衰竭", "WHEEZING：協助核准的病童自備 MDI／DPI，每次 2 噴、每噴間隔 1 分鐘；運送超過 20 分鐘可依流程每 20 分鐘再給", "WHEEZING：IH A＋B／單 B，未滿 5 歲約半支並以 N/S 稀釋至 4 mL；氧氣 6 L/min 霧化，避免接潮氣瓶影響效率", "嚴重 WHEEZING：PHPLS 教材列聯絡醫療指導後考慮 Epinephrine 0.3–0.5 mg SC、角度 10–30°；心臟病、高血壓、心律不整或 HR≥150／分為禁忌", "CROUP：IH Epinephrine 0.5 mg/kg、不稀釋；PHPLS 教材列＜4 歲上限 2.5 mg、＞4 歲上限 5 mg，4 歲整依 SOP／醫療指導", "評：每次後重看呼吸作功、呼吸音、意識、心率與 SpO₂；準備處理疲乏、安靜胸或通氣不足"], success: "能先說出 WHEEZING 或 CROUP，再正確核對藥物、途徑、上限與給藥後反應。", pitfalls: ["把嚴重過敏的 IM、嚴重 wheezing 的 SC 與哮吼的 IH Epinephrine 混為一談", "未滿 1 歲、心肌梗塞病史或明顯心衰竭呼吸窘迫仍未核對 A＋B／單 B 禁忌"] },
  { id: "hypoglycemia", group: "給藥", title: "低血糖｜PHPLS 年齡分段", lead: "先確認血糖與吞嚥，只顯示目前年齡對應方案。", mnemonic: "測、吞、選、給、再測", steps: ["測：意識改變、抽搐或灌流不良應立即量血糖；PHPLS 教材以血糖＜60 mg/dL 為警戒，未滿 1 歲嬰兒標示＜45 mg/dL", "吞：清醒且可安全吞嚥者依 SOP 優先口服葡萄糖；意識不清、抽搐或吞嚥不安全者不可強行口服", "選：依實際年齡選目前一列，不把不同濃度累加；新生兒＜28 日為新版例外 D10W 2 mL/kg（0.2 g/kg）", "給：PHPLS 表列嬰兒＜1 歲 D10W 5 mL/kg、1–3 歲 D25W 2 mL/kg、青少年／已有第二性徵 D50W 1 mL/kg；4 歲至青春期前未在該頁獨立列示，不自行外推", "再測：給藥後 5–10 分鐘重測血糖與意識，持續低血糖依 SOP 重複或接續輸注，並找出藥物、禁食、感染、代謝或內分泌原因"], success: "血糖與神經狀態改善，且完成重測、原因評估、持續監測與後送。", pitfalls: ["把各年齡列出的不同濃度全部給完；每次只使用目前年齡對應方案", "忽略高濃度葡萄糖的高滲透壓、外滲與靜脈傷害風險", "把＜28 日新生兒 D10W 2 mL/kg 誤寫回舊版 D5W 10 mL/kg"] },
  { id: "rectal", group: "給藥", title: "肛門給藥", lead: "先顧隱私，再擺位、置入與留藥。", mnemonic: "核、解、擺、潤、塞、夾、看", steps: ["核：核對適應症、藥物、劑型、體重、劑量與禁忌；若單次小於一顆，打開包裝前先用乾淨剪刀裁去多餘部分", "解：向照顧者與孩子說明，維護隱私、戴手套並檢查肛門周圍", "擺：兒童採左側臥並提起臀部；新生兒或小嬰兒可仰臥抬高雙腿，無法側臥且躁動時依情況採俯臥", "潤、塞：潤滑後讓塞劑尖端朝內，輕柔推入並通過括約肌，不可強推", "夾、看：塞劑完全進入後輕夾雙臀約 10–15 秒，觀察是否排出、療效與不良反應並紀錄"], success: "藥物未立即排出、沒有出血或黏膜損傷，且完成療效與副作用評估。", pitfalls: ["未說明或未遮蔽，忽略兒童隱私與心理壓力", "強行置入或用手指深推藥物"] },
  { id: "trauma-xabcde", group: "創傷", title: "小兒創傷 XABCDE", lead: "先止住會死人的出血，再維持氣道、通氣、灌流與保暖。", mnemonic: "止、道、呼、循、神、露暖", steps: ["X 止血：直接加壓優先；快速評估出血量與止血成效，避免因孩子體型小而低估", "A 氣道：依頭大、枕部突出的特性用肩背墊維持中立位置；只在需要時抽吸，避免盲目手指挖取", "B 呼吸：觀察胸廓與呼吸作功，避免過度通氣；疑張力性氣胸且具資格時，C-TECC 2025 優先第 5 肋間前腋線、第 2 肋間鎖骨中線為替代，仍依地方 SOP", "C 循環：脈搏、CRT、皮膚與意識一起看；疑出血性休克優先止血與血品，避免固定反覆晶質液", "D／E：AVPU／GCS、瞳孔、肌張力與血糖；以 TEN-4-FACESp 檢視高風險瘀傷，暴露後立即保暖並以 IMIST 交班"], success: "能在一分鐘內指出最先致命問題、完成止血與中立擺位，並用重評結果證明處置有效。", pitfalls: ["等血壓下降才承認休克；兒童低血壓常是晚期", "把 TEN-4-FACESp 當診斷，或忽略依地方規定紀錄與通報"] },
  { id: "trm", group: "團隊", title: "院前 TRM 與封閉迴路", lead: "角色清楚、指令複誦、執行回報，才能減少 CPR 中斷。", mnemonic: "指、覆、做、報、再總結", steps: ["Leader 指派：壓胸、氣道、IV／IO 與藥物、監測／去顫；人力不足時先保住壓胸與去顫", "指令要說清楚對象、任務、劑量／時間與完成標準", "接受者覆誦，執行後主動回報；看到壓胸品質下降、漏藥或中斷過久要立即建設性提醒", "Leader 定期重新評估並歸納：目前節律、最近一次藥物／電擊、下一步與可逆原因", "每次事件後 debrief：找出卡點、中斷原因與下次可練的具體行為"], success: "每個任務都有姓名、覆誦與完成回報，Leader 能隨時說出目前狀態與下一步。", pitfalls: ["多人同時下令或都擠在同一任務，卻沒有人管時間與壓胸品質", "成員看見問題但因年資或角色沒有說出口"] },
  { id: "tape", group: "器材", title: "體重估算｜身長尺＋Best Guess", lead: "實測優先；身長尺不可用時，年齡公式才是備援。", mnemonic: "實、問、尺、猜、核", steps: ["實：能安全量測時使用公斤制實測體重，不用估算值取代", "問：無法立即秤重時，先詢問照顧者近期可靠體重並確認單位", "尺：不知道體重時優先使用核准的身長／體型估重工具，仰躺由頭頂量至足跟", "猜：仍無法取得時才用 Best Guess——1–11 個月：（月齡＋9）÷2；1–4 歲：2×（足歲＋5）；5–14 歲：4×足歲，結果單位為 kg", "核：口頭標示『估算體重』，由第二人複算；藥物濃度、劑量上限、器材標示與地方 SOP 再確認並持續尋找實際體重"], success: "清楚說明體重來源與估算方法，計算一致，所有藥物和器材選擇均完成第二人複核。", pitfalls: ["有實測或照顧者可靠體重仍套用年齡公式", "把月齡當足歲或選錯公式分段", "忽略體型、營養狀態與族群差異；Best Guess 可能高估或低估"] },
  { id: "medications", group: "給藥", title: "小兒急救藥物安全", lead: "先確認適應症，再從 mg 算到 mL。", mnemonic: "症、重、量、濃、核、給、評", steps: ["症：確認適應症、禁忌症、給藥途徑與自身救護層級授權", "重：依序採實測體重、照顧者近期可靠體重、核准身長／體型估重工具；最後才用年齡公式，且一律以 kg 計算", "量：依 mg/kg 計算所需 mg，套用單次與總劑量上限；固定分段劑量則不可自行外推", "濃：核對手上製劑濃度，再把 mg 換算成 mL；Epinephrine 必須特別確認濃度與途徑", "核、給、評：由第二人獨立複算後給藥，記錄時間並持續重評適應症、呼吸、循環、意識、療效與不良反應"], success: "醫囑／適應症、體重來源、mg、濃度、mL、上限及途徑均一致，給藥後有明確重評結果。", pitfalls: ["只背 mL，沒有先確認藥物濃度", "混淆心停 IV／IO 與過敏 IM 的 Epinephrine 製劑", "體重或計算不確定時仍單人給藥，未停下來交叉核對"] },
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
  { key: "newborn", stage: "新生兒", age: "出生後 1 個月內", heart: "120–160", breathing: "40–60", pressure: "約 80/40", hypotension: "SBP＜60 mmHg", tidal: "4–6" },
  { key: "infant", stage: "嬰兒", age: "出生滿 1 個月後–未滿 1 歲", heart: "80–140", breathing: "30–40", pressure: "約 82/44", hypotension: "SBP＜70 mmHg", tidal: "6–8" },
  { key: "toddler", stage: "幼兒", age: "約 1–3 歲", heart: "80–120", breathing: "25–30", pressure: "約 86/50", hypotension: "SBP＜70＋(年齡×2)", tidal: "6–8" },
  { key: "preschool", stage: "學齡前", age: "約 4–5 歲", heart: "70–115", breathing: "20–25", pressure: "約 90/52", hypotension: "SBP＜70＋(年齡×2)", tidal: "6–8" },
  { key: "school", stage: "學齡兒童", age: "約 6–10 歲", heart: "70–115", breathing: "15–25", pressure: "約 94/54–100/60", hypotension: "SBP＜70＋(年齡×2)", tidal: "6–8" },
  { key: "adolescent", stage: "青少年", age: "大於 10 歲", heart: "70–90", breathing: "15–20", pressure: "約 110/64", hypotension: "SBP＜90 mmHg", tidal: "6–8" },
] as const;

type RulerMode = "length" | "weight" | "bestGuess";
type BestGuessAgeUnit = "months" | "years";
type VitalStageKey = (typeof vitalSignRows)[number]["key"];
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

const vitalStageForBestGuess = (unit: BestGuessAgeUnit, years: number): VitalStageKey => {
  if (unit === "months") return "infant";
  if (years <= 3) return "toddler";
  if (years <= 5) return "preschool";
  if (years <= 10) return "school";
  return "adolescent";
};

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
      { phase: "VENTILATE", title: "呼吸暫停／喘息或 HR＜100", detail: "黃金一分鐘內開始有效通氣：30–60 次／分，每次充氣 0.5–1 秒；接上右手／手腕脈搏血氧並考慮心電監測。", action: "以胸廓起伏與心率上升確認成效；若無效，立即做通氣矯正並考慮進階氣道。", mnemonic: "擺、吸、漏、壓｜重新擺位・必要時抽吸・檢查面罩漏氣・逐步調整通氣壓力" },
      { phase: "REASSESS", title: "評估心率並分流", detail: "先聽診心前區；可在臍帶根部觸摸臍動脈搏動，若臍帶不適用則觸摸上臂內側肱動脈。觸診只作快速估計，應以 ECG／聽診確認。", action: "HR≥100：依呼吸狀況支持；HR 60–99：持續有效 PPV；有效通氣後 HR＜60：進入胸部按壓。" },
      { phase: "COMPRESS", title: "HR＜60：按壓＋通氣", detail: "進階氣道或喉罩、100% 氧、建立 UVC／IO；胸部按壓與通氣協調為 3:1。", action: "雙拇指環抱按壓；持續約 60 秒後在不中斷通氣下重評心率。" },
      { phase: "MEDICATION", title: "仍 HR＜60：藥物與原因", detail: "AHA 2025：Epinephrine IV／低位 UVC／IO 0.01–0.03 mg/kg；建立血管路徑中可 ET 0.05–0.1 mg/kg，必要時每 3–5 分鐘並優先改走血管內。PHPLS 的 0.02 mg/kg 位於此範圍內。", action: "持續有效通氣與按壓；考慮低血容、氣胸等原因，準備復甦後照護與後送。" },
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
  const [bestGuessAgeUnit, setBestGuessAgeUnit] = useState<BestGuessAgeUnit>("years");
  const [bestGuessMonths, setBestGuessMonths] = useState(6);
  const [bestGuessYears, setBestGuessYears] = useState(4);
  const [vitalStage, setVitalStage] = useState<VitalStageKey>("preschool");
  const [ohcaPath, setOhcaPath] = useState<OhcaKey>("infant");
  const [ohcaStep, setOhcaStep] = useState(0);
  const [ohcaRhythm, setOhcaRhythm] = useState<RhythmKey | null>(null);
  const [apgarTime, setApgarTime] = useState<ApgarTime>(1);
  const [maternalGuide, setMaternalGuide] = useState<MaternalKey>("assessment");
  const [apgarByTime, setApgarByTime] = useState<Record<ApgarTime, ApgarScores>>({ 1: blankApgar(), 5: blankApgar(), 10: blankApgar(), 15: blankApgar(), 20: blankApgar() });

  useEffect(() => {
    const saved = localStorage.getItem("peds-field-skills");
    // Reading a prior learner checklist requires one client-side hydration update.
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
  const bestGuessWeight = bestGuessAgeUnit === "months" ? (bestGuessMonths + 9) / 2 : bestGuessYears <= 4 ? 2 * (bestGuessYears + 5) : 4 * bestGuessYears;
  const bestGuessZone = rulerZones.find((zone) => bestGuessWeight <= zone.maxKg) ?? rulerZones[rulerZones.length - 1];
  const activeZone = rulerMode === "length" ? lengthZone : rulerMode === "weight" ? weightZone : bestGuessZone;
  const workingWeight = rulerMode === "length" ? activeZone.estimate : rulerMode === "weight" ? measuredWeight : bestGuessWeight;
  const outsideColorRange = rulerMode !== "length" && (workingWeight < 3 || workingWeight > 36);
  const bestGuessFormula = bestGuessAgeUnit === "months" ? `（${bestGuessMonths}＋9）÷2` : bestGuessYears <= 4 ? `2×（${bestGuessYears}＋5）` : `4×${bestGuessYears}`;
  const selectedVitalSigns = vitalSignRows.find((row) => row.key === vitalStage) ?? vitalSignRows[3];
  const tidalRange = selectedVitalSigns.key === "newborn" ? [4, 6] : [6, 8];
  const midazolamDose = workingWeight > 40 ? { mg: 10, mL: 2 } : workingWeight >= 13 ? { mg: 5, mL: 1 } : null;
  const croupEpinephrineMax = ["newborn", "infant", "toddler"].includes(vitalStage) ? 2.5 : vitalStage === "preschool" ? null : 5;
  const croupEpinephrineDose = croupEpinephrineMax === null ? null : Math.min(workingWeight * .5, croupEpinephrineMax);
  const phplsGlucose = vitalStage === "newborn"
    ? { label: "D10W｜2 mL/kg", volume: workingWeight * 2, note: "PHPLS＜28 日新版列示（0.2 g/kg）" }
    : vitalStage === "infant"
      ? { label: "D10W｜5 mL/kg", volume: workingWeight * 5, note: "嬰兒＜1 歲" }
      : vitalStage === "toddler"
        ? { label: "D25W｜2 mL/kg", volume: workingWeight * 2, note: "幼兒 1–3 歲" }
        : vitalStage === "adolescent"
          ? { label: "D50W｜1 mL/kg", volume: workingWeight, note: "青少年或已有第二性徵" }
          : null;
  const diclofenac = ["newborn", "infant"].includes(vitalStage)
    ? { dose: "未滿 1 歲不依本卡給藥", detail: "TFDA 仿單列一歲以上；依醫療指導" }
    : workingWeight > 12
      ? { dose: "1 顆｜12.5 mg", detail: "PHPLS：體重＞12 kg" }
      : workingWeight > 6
        ? { dose: "½ 顆｜6.25 mg", detail: "PHPLS：體重＞6 kg 至 12 kg" }
        : { dose: "教材未列示", detail: "體重≤6 kg，不自行外推" };
  const activeOhca = ohcaFlows[ohcaPath];
  const currentOhcaStep = activeOhca.steps[ohcaStep];
  const ohcaProgress = Math.round(((ohcaStep + 1) / activeOhca.steps.length) * 100);
  const currentApgar = apgarByTime[apgarTime];
  const apgarAnswered = Object.values(currentApgar).filter((value) => value !== null).length;
  const apgarTotal = Object.values(currentApgar).reduce<number>((sum, value) => sum + (value ?? 0), 0);
  const apgarSummary = apgarAnswered < 5 ? `尚有 ${5 - apgarAnswered} 項未評` : apgarTotal >= 7 ? "7–10｜狀況較穩定" : apgarTotal >= 4 ? "4–6｜中度異常" : "0–3｜低分";
  const setApgarScore = (key: ApgarKey, score: number) => setApgarByTime((current) => ({ ...current, [apgarTime]: { ...current[apgarTime], [key]: score } }));
  const resetApgar = () => setApgarByTime((current) => ({ ...current, [apgarTime]: blankApgar() }));
  const currentMaternalGuide = maternalGuides[maternalGuide];
  const selectOhcaPath = (key: OhcaKey) => {
    setOhcaPath(key);
    setOhcaStep(0);
    setOhcaRhythm(null);
  };

  return (
    <main id="top">
      <header className="nav-shell">
        <a className="wordmark" href="#top"><span>PEDS</span><i>{"//"}</i><b>FIELD</b><small>兒少救護教學</small></a>
        <button className="menu-button" aria-label="開啟導覽" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? "關閉" : "目錄"}</button>
        <nav className={menuOpen ? "show" : ""} aria-label="網站導覽">
          <a href="#maternal" onClick={() => setMenuOpen(false)}>孕婦急症</a>
          <a href="#ages" onClick={() => setMenuOpen(false)}>年齡分流</a>
          <a href="#vitals" onClick={() => setMenuOpen(false)}>生命徵象</a>
          <a href="#navigator" onClick={() => setMenuOpen(false)}>急症導航</a>
          <a href="#ohca" onClick={() => setMenuOpen(false)}>OHCA 流程</a>
          <a href="#skills" onClick={() => setMenuOpen(false)}>技術教室</a>
          <a href="#ruler" onClick={() => setMenuOpen(false)}>互動小兒尺</a>
          <a href="#teaching" onClick={() => setMenuOpen(false)}>情境教學</a>
        </nav>
        <div className="nav-status"><span className="live-dot" />2026 整合校正版</div>
      </header>

      <section className="hero">
        <div className="hero-aside"><span>PREHOSPITAL</span><span>PEDIATRIC</span><span>LIFE SUPPORT</span></div>
        <div className="hero-main">
          <p className="kicker">院前兒少救護・專業訓練平台</p>
          <h1>先看見<br /><span className="hero-title-line">孩子的<em>不一樣</em></span></h1>
          <p className="hero-lede">以小兒救護學習站與小兒尺為核心，整合孕婦、新生兒、嬰兒與兒童的現場判斷、流程與安全複核。</p>
          <div className="hero-links"><a href="#navigator">進入小兒導航 <span>↘</span></a><a href="#maternal">打開孕婦分類</a></div>
        </div>
        <div className="hero-visual" aria-label="兒少救護三個年齡層">
          <div className="orbit orbit-a"><span>NEWBORN</span></div>
          <div className="orbit orbit-b"><span>INFANT</span></div>
          <div className="orbit orbit-c"><span>CHILD</span></div>
          <div className="center-mark"><b>ABC</b><small>看・聽・判斷</small></div>
        </div>
        <div className="hero-foot"><span>NO. 01</span><p>兒童不是縮小的成人。<br />不要等數字惡化，才相信孩子不穩定。</p><i>SCROLL ↓</i></div>
      </section>

      <section className="maternal-section" id="maternal">
        <div className="maternal-heading">
          <div className="section-label light"><span>00</span><p>MATERNAL<br />孕婦急症</p></div>
          <div><p className="micro">MOTHER FIRST · BIRTH READY</p><h2>先穩定母體，<br />再判斷產科威脅。</h2></div>
          <p>給救護現場的獨立孕婦入口。先選目前情境，再依母體 ABC、產程與時間壓力執行；侵入性處置、藥物及院前復甦性分娩皆依授權與醫療指導。</p>
        </div>
        <div className="maternal-workbench">
          <div className="maternal-tabs" role="tablist" aria-label="孕婦急症分類">
            {(Object.keys(maternalGuides) as MaternalKey[]).map((key, index) => <button key={key} className={maternalGuide === key ? "active" : ""} onClick={() => setMaternalGuide(key)} role="tab" aria-selected={maternalGuide === key}><span>{String(index + 1).padStart(2, "0")}</span><b>{maternalGuides[key].label}</b></button>)}
          </div>
          <article className="maternal-panel" aria-live="polite">
            <p className="maternal-cue"><b>辨認</b>{currentMaternalGuide.cue}</p>
            <h3>{currentMaternalGuide.label}</h3>
            <div className="maternal-priority"><span>第一優先</span><p>{currentMaternalGuide.priority}</p></div>
            <ol>{currentMaternalGuide.steps.map((step, index) => <li key={step}><span>{String(index + 1).padStart(2, "0")}</span><p>{step}</p></li>)}</ol>
            <div className="maternal-avoid"><b>不要做</b><p>{currentMaternalGuide.avoid}</p></div>
          </article>
        </div>
        <div className="maternal-sources"><span>最新版校正來源：</span><a href="https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines" target="_blank" rel="noreferrer">AHA 2025 CPR／ECC ↗</a><a href="https://www.who.int/publications/b/81071" target="_blank" rel="noreferrer">WHO 2025 產後出血 ↗</a><a href="https://www.east.org/education-resources/practice-management-guidelines/details/trauma-in-pregnancy-a-systematic-review-metaanalysis-and-practice-management-guideline-from-the-east" target="_blank" rel="noreferrer">EAST 2025 孕婦創傷 ↗</a></div>
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
          {age === "newborn" && <section className="newborn-oxygen-guide" aria-labelledby="newborn-fio2-title">
            <div className="newborn-oxygen-heading"><p>NEWBORN OXYGEN START</p><h3 id="newborn-fio2-title">出生週數，決定復甦起始 FiO₂。</h3><span>限出生當下轉銜／復甦；先判斷是否需要呼吸支持，再依右手血氧與心率滴定。</span></div>
            <div className="newborn-oxygen-table-wrap"><table><caption>需要呼吸支持的新生兒：出生週數與初始氧氣濃度</caption><thead><tr><th>出生週數</th><th>初始 FiO₂</th><th>現場判斷</th></tr></thead><tbody><tr><th>≥35 週</th><td><strong>21%</strong><small>室內空氣</small></td><td>初始不加額外氧；若需要 PPV／CPAP，仍依器材建立氣體流量。</td></tr><tr><th>32–34+6 週</th><td><strong>21–30%</strong><small>依反應滴定</small></td><td>備妥空氧混合器，由低濃度開始並依導管前 SpO₂ 與心率調整。</td></tr><tr><th>＜32 週</th><td><strong>30–100%</strong><small>個別化滴定</small></td><td>依 AHA 2025 從 30–100% 範圍個別化起始，使用導管前 SpO₂ 與心率快速調整。</td></tr></tbody></table></div>
            <div className="newborn-oxygen-targets"><b>右手／手腕 SpO₂ 目標</b><span>3 分鐘 <strong>70–75%</strong></span><span>5 分鐘 <strong>80–85%</strong></span><span>10 分鐘 <strong>85–95%</strong></span><small>每 30 秒檢查氧氣設定與 SpO₂；若 SpO₂＞95%，下調氧氣。</small></div>
            <div className="newborn-oxygen-caution"><b>FiO₂ 不是流量 L/min</b><p>FiO₂ 是氧氣濃度；流量是驅動 T-piece、CPAP 或 BVM 的氣體量，須依器材說明與地方 SOP 設定。FiO₂ 21% 不代表不需要器材流量。胸外按壓期間使用 FiO₂ 100%，取得可靠 SpO₂ 後再滴定。</p></div>
            <div className="newborn-oxygen-caution"><b>本站採用版本</b><p>衝突時以 AHA／AAP 2025 為本站主表；PHPLS／地方教材與 RCUK 的分組差異保留作課堂比較，實際出勤仍依機關現行 SOP。</p></div>
            <a className="newborn-oxygen-source" href="https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines/neonatal-resuscitation" target="_blank" rel="noreferrer">主表｜AHA／AAP 2025 Neonatal Resuscitation ↗</a>
          </section>}
          {age === "newborn" && <section className="apgar-guide" aria-labelledby="apgar-guide-title">
            <div className="apgar-guide-head"><div><p>ASSESS · RECORD · REASSESS</p><h3 id="apgar-guide-title">APGAR SCORE</h3><span>A Appearance · P Pulse · G Grimace · A Activity · R Respiration</span></div><div className="apgar-guide-total"><strong>{apgarAnswered === 5 ? apgarTotal : "—"}<small>/10</small></strong><b>{apgarTime} 分鐘｜{apgarSummary}</b></div></div>
            <div className="apgar-guide-times" aria-label="選擇 APGAR 評估時間">{apgarTimes.map((time) => { const values = Object.values(apgarByTime[time]); const complete = values.every((value) => value !== null); const total = values.reduce<number>((sum, value) => sum + (value ?? 0), 0); return <button key={time} className={apgarTime === time ? "active" : ""} onClick={() => setApgarTime(time)} aria-pressed={apgarTime === time}><span>{time} 分鐘</span><b>{complete ? total : "—"}</b></button>; })}<button className="reset" onClick={resetApgar}>清除此時間</button></div>
            <div className="apgar-score-grid">{apgarItems.map((item) => <article key={item.key}><header><strong>{item.letter}</strong><b>{item.label}</b></header><div>{item.options.map((description, score) => <button key={score} className={currentApgar[item.key] === score ? "active" : ""} onClick={() => setApgarScore(item.key, score)} aria-pressed={currentApgar[item.key] === score}><b>{score} 分</b><small>{description}</small></button>)}</div></article>)}</div>
            <div className="apgar-guide-note"><b>先復甦、再計分</b><p>APGAR 不用來決定是否開始復甦，也不能延誤黃金一分鐘處置。所有新生兒於 1、5 分鐘記錄；若 5 分鐘＜7，之後每 5 分鐘重評至 20 分鐘。</p></div>
            <div className="apgar-guide-limit"><p>5 分鐘的 7–10、4–6、0–3 分類僅供足月／晚期早產兒紀錄參考。早產、母體藥物與復甦措施會影響分數；不能單獨診斷窒息或預測個別神經學結果。膚色具主觀性，氧合請看血氧監測。</p><a href="https://www.acog.org/clinical/clinical-guidance/committee-opinion/articles/2015/10/the-apgar-score" target="_blank" rel="noreferrer">AAP／ACOG APGAR 指引 ↗</a><a href="https://www.resus.org.uk/professional-library/2025-resuscitation-guidelines/newborn-resuscitation-and-support-transition-infants-birth" target="_blank" rel="noreferrer">RCUK 2025 新生兒紀錄建議 ↗</a></div>
          </section>}
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
            <thead><tr><th scope="col">年齡層</th><th scope="col">年齡</th><th scope="col">心率 <small>bpm</small></th><th scope="col">呼吸率 <small>次／分</small></th><th scope="col">正常血壓平均值 <small>mmHg｜安靜時約略參考</small></th><th scope="col">潮氣量參考 <small>mL/kg／每口</small></th></tr></thead>
            <tbody>{vitalSignRows.map((row) => <tr key={row.stage}><th scope="row">{row.stage}</th><td>{row.age}</td><td><b>{row.heart}</b></td><td><b>{row.breathing}</b></td><td className="bp-cell"><b>{row.pressure}</b><small><span>補充｜低血壓警戒</span>{row.hypotension}</small></td><td><b>{row.tidal}</b></td></tr>)}</tbody>
          </table>
        </div>

        <div className="vitals-notes">
          <article><span>01</span><div><b>血氧 SpO₂</b><p>健康兒童在海平面多為 97–100%；95–96% 應結合呼吸作功、灌流與趨勢重新評估，≤94% 視為異常警訊。新生兒出生最初數分鐘應使用出生轉銜目標，不可直接套用此值。</p></div></article>
          <article><span>02</span><div><b>體溫</b><p>新生兒正常腋溫為 36.5–37.5°C。其他年齡須記錄測量部位與方式；環境、發燒、包覆及運動都會影響讀值。</p></div></article>
          <article><span>03</span><div><b>補充｜低血壓警戒公式</b><p>新生兒 SBP＜60、嬰兒 SBP＜70、1–10 歲 SBP＜70＋(年齡×2)、大於 10 歲 SBP＜90 mmHg。此公式是低血壓警戒門檻，不是正常平均血壓；血壓正常仍不能排除代償性休克。</p></div></article>
          <article><span>04</span><div><b>潮氣量參考</b><p>新生兒約 4–6 mL/kg／每口，嬰兒與兒童約 6–8 mL/kg／每口。這是設備可監測容量時的教學參考；手壓 BVM 應每口約 1 秒，只給到可見胸廓起伏，並以心率、氧合、ETCO₂ 與臨床反應反覆調整。</p></div></article>
        </div>

        <div className="vitals-caution"><b>判讀提醒</b><p>哭鬧、疼痛、發燒、脫水、藥物與焦慮常使心率或呼吸率升高；睡眠與運動員體質可能較低。單次數字不能取代 PAT、ABCDE 與重複評估。</p></div>
        <div className="vitals-sources"><span>資料來源：</span><a href="https://rightdecisions.scot.nhs.uk/dgrefhelp-nhs-dumfries-galloway/admissions/paediatric-admissions/" target="_blank" rel="noreferrer">NHS 小兒生命徵象 ↗</a><a href="https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines/pediatric-advanced-life-support" target="_blank" rel="noreferrer">2025 AHA/AAP PALS ↗</a><a href="https://www.who.int/data/gho/indicator-metadata-registry/imr-details/normothermia-on-admission" target="_blank" rel="noreferrer">WHO 新生兒正常體溫 ↗</a></div>
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
            <div className="skill-mnemonic"><span>MEMORY / 口訣</span><b>{currentSkill.mnemonic}</b></div>
            <ol>{currentSkill.steps.map((step, index) => <li key={step}><span>{String(index + 1).padStart(2, "0")}</span><p>{step}</p></li>)}</ol>
            <div className="skill-check-grid"><div className="skill-success"><span>✓</span><p><b>證明操作有效</b>{currentSkill.success}</p></div><div className="skill-pitfalls"><b>常見失分點</b>{currentSkill.pitfalls.map((item) => <p key={item}>× {item}</p>)}</div></div>
            <div className="skill-actions"><button className={completed.includes(currentSkill.id) ? "done" : ""} onClick={() => markSkill(currentSkill.id)}>{completed.includes(currentSkill.id) ? "✓ 已完成檢核" : "標記已完成檢核"}</button><p>技術需由合格教官以實體器材進行最終確認。</p></div>
          </article>
        </div>
      </section>

      <section className="ruler-section" id="ruler" style={{ "--zone": activeZone.color, "--zone-ink": activeZone.ink } as React.CSSProperties}>
        <div className="ruler-heading">
          <div className="section-label"><span>06</span><p>PEDIATRIC TAPE<br />互動小兒尺</p></div>
          <div><p className="micro">MEASURE · PREPARE · CROSS-CHECK</p><h2>少背公式，<br />多一次安全複核。</h2></div>
          <p>依序採用實測公斤數、照顧者近期可靠體重、核准身長／體型估重工具；都無法取得時，才以 Best Guess 年齡公式作備援。任何估算都須口頭標示並由第二人複核。</p>
        </div>

        <div className="ruler-workbench">
          <div className="ruler-controls">
            <div className="ruler-tabs" role="tablist" aria-label="小兒尺輸入方式">
              <button className={rulerMode === "length" ? "active" : ""} onClick={() => setRulerMode("length")} role="tab" aria-selected={rulerMode === "length"}>身長估算</button>
              <button className={rulerMode === "weight" ? "active" : ""} onClick={() => setRulerMode("weight")} role="tab" aria-selected={rulerMode === "weight"}>實測體重</button>
              <button className={rulerMode === "bestGuess" ? "active" : ""} onClick={() => { setRulerMode("bestGuess"); setVitalStage(vitalStageForBestGuess(bestGuessAgeUnit, bestGuessYears)); }} role="tab" aria-selected={rulerMode === "bestGuess"}>Best Guess</button>
            </div>

            {rulerMode === "length" ? <div className="ruler-input">
              <label htmlFor="length-input"><span>仰躺身長</span><b>{lengthCm.toFixed(1)}<small>cm</small></b></label>
              <input id="length-input" type="range" min="46.8" max="143.2" step="0.1" value={lengthCm} onChange={(event) => setLengthCm(Number(event.target.value))} />
              <div className="ruler-scale" aria-hidden="true"><span>46.8</span><i /><i /><i /><i /><i /><i /><i /><span>143.3 cm</span></div>
              <p>頭頂對準尺端，沿身體拉至足跟；色帶提供估算區間，不等於實際體重。</p>
            </div> : rulerMode === "weight" ? <div className="ruler-input">
              <label htmlFor="weight-input"><span>實測體重</span><b>{measuredWeight.toFixed(1)}<small>kg</small></b></label>
              <input id="weight-input" type="range" min="1" max="50" step="0.5" value={measuredWeight} onChange={(event) => setMeasuredWeight(Number(event.target.value))} />
              <div className="ruler-scale" aria-hidden="true"><span>1</span><i /><i /><i /><i /><i /><i /><i /><span>50 kg</span></div>
              <p>已知體重時，所有劑量計算皆以實測值優先；色帶只負責協助整理器材。</p>
            </div> : <div className="ruler-input best-guess-input">
              <div className="best-guess-kind" role="group" aria-label="Best Guess 年齡單位">
                <button className={bestGuessAgeUnit === "months" ? "active" : ""} onClick={() => { setBestGuessAgeUnit("months"); setVitalStage(bestGuessMonths <= 1 ? "newborn" : "infant"); }}>1–11 個月／月齡</button>
                <button className={bestGuessAgeUnit === "years" ? "active" : ""} onClick={() => { setBestGuessAgeUnit("years"); setVitalStage(vitalStageForBestGuess("years", bestGuessYears)); }}>1–14 歲／足歲</button>
              </div>
              {bestGuessAgeUnit === "months" ? <>
                <label htmlFor="best-guess-months"><span>月齡</span><b>{bestGuessMonths}<small>個月</small></b></label>
                <input id="best-guess-months" type="range" min="1" max="11" step="1" value={bestGuessMonths} onChange={(event) => { const months = Number(event.target.value); setBestGuessMonths(months); setVitalStage(months <= 1 ? "newborn" : "infant"); }} />
                <div className="ruler-scale" aria-hidden="true"><span>1 個月</span><i /><i /><i /><i /><i /><span>11 個月</span></div>
              </> : <>
                <label htmlFor="best-guess-years"><span>足歲</span><b>{bestGuessYears}<small>歲</small></b></label>
                <input id="best-guess-years" type="range" min="1" max="14" step="1" value={bestGuessYears} onChange={(event) => { const years = Number(event.target.value); setBestGuessYears(years); setVitalStage(vitalStageForBestGuess("years", years)); }} />
                <div className="ruler-scale" aria-hidden="true"><span>1 歲</span><i /><i /><i /><i /><i /><i /><span>14 歲</span></div>
              </>}
              <div className="best-guess-formula"><span>BEST GUESS</span><b>{bestGuessFormula}＝{formatNumber(bestGuessWeight)} kg</b></div>
              <p>1–11 個月：（月齡＋9）÷2；1–4 歲：2×（足歲＋5）；5–14 歲：4×足歲。只在無法取得實測、可靠病史或身長估重時使用。</p>
            </div>}

            <div className="zone-strip" aria-label="小兒尺九個顏色區間">
              {rulerZones.map((zone) => <button key={zone.key} className={activeZone.key === zone.key ? "active" : ""} style={{ "--swatch": zone.color, "--swatch-ink": zone.ink } as React.CSSProperties} onClick={() => { setRulerMode("length"); setLengthCm((zone.minCm + zone.maxCm) / 2); }} aria-label={`${zone.label}色，${zone.minKg} 至 ${zone.maxKg} 公斤`}><span>{zone.label}</span><small>{zone.minKg}–{zone.maxKg}</small></button>)}
            </div>

            <div className="zone-result">
              <span>{rulerMode === "bestGuess" ? "BEST GUESS 估算" : `${activeZone.label}色區`}</span>
              <b>{rulerMode === "length" ? `${activeZone.minKg}–${activeZone.maxKg} kg` : `${formatNumber(workingWeight)} kg`}</b>
              <p>{rulerMode === "length" ? `教學估算採區間中值 ${formatNumber(workingWeight)} kg 計算` : rulerMode === "bestGuess" ? outsideColorRange ? `${bestGuessFormula}；估算值超出九色尺常用範圍，不套用色區器材尺寸` : `${bestGuessFormula}；約對應 ${activeZone.label}色器材區，器材尺寸仍須依病童體型與設備標示確認` : outsideColorRange ? "超出九色尺常用範圍，僅以實測體重進行公式計算" : `對應 ${activeZone.label}色器材區，劑量仍以實測體重計算`}</p>
            </div>

            <label className="ruler-age-selector" htmlFor="ruler-age-stage"><span>實際年齡層</span><select id="ruler-age-stage" value={vitalStage} onChange={(event) => setVitalStage(event.target.value as VitalStageKey)}>{vitalSignRows.map((row) => <option key={row.key} value={row.key}>{row.stage}｜{row.age}</option>)}</select><small>控制潮氣量、低血糖與年齡限制；請勿只用估算體重反推年齡。</small></label>
          </div>

          <div className="ruler-output" aria-live="polite">
            <div className="output-top"><div><span>{rulerMode === "bestGuess" ? "ESTIMATED WEIGHT" : "WORKING WEIGHT"}</span><b>{formatNumber(workingWeight)}<small>kg</small></b></div><p>{rulerMode === "bestGuess" ? `目前體重來自 Best Guess：${bestGuessFormula}。須口頭說明為估算值；` : ""}每次給藥前交叉核對病人、體重來源、適應症、藥名、濃度、mg 與 mL。</p></div>
            <div className="output-grid">
              <article><span>01 / 電擊</span><h3>去顫能量</h3><dl><div><dt>第一次</dt><dd>{formatNumber(workingWeight * 2)} J</dd></div><div><dt>第二次</dt><dd>{formatNumber(workingWeight * 4)} J</dd></div><div><dt>後續</dt><dd>≥ {formatNumber(workingWeight * 4)} J</dd></div></dl><small>後續不超過 10 J/kg 或成人最大劑量。</small></article>
              <article><span>02 / 急救藥物</span><h3>依問題 × 途徑整合</h3><dl><div><dt>OHCA｜Epinephrine IV／IO</dt><dd>{formatNumber(Math.min(workingWeight * .01, 1))} mg</dd></div><div><dt>0.1 mg/mL 製劑｜IV／IO</dt><dd>{formatNumber(Math.min(workingWeight * .1, 10))} mL</dd></div><div><dt>嚴重過敏｜Epinephrine IM</dt><dd>{formatNumber(Math.min(workingWeight * .01, .3))} mg＝{formatNumber(Math.min(workingWeight * .01, .3))} mL</dd></div><div><dt>VF／無脈 VT｜Amiodarone IV／IO</dt><dd>{formatNumber(Math.min(workingWeight * 5, 300))} mg</dd></div><div><dt>替代｜Lidocaine IV／IO</dt><dd>{formatNumber(workingWeight)} mg</dd></div></dl><small>OHCA：Epinephrine 0.01 mg/kg，單次上限 1 mg、每 3–5 分鐘。嚴重過敏：1 mg/mL 製劑 IM 0.01 mg/kg，單次上限 0.3 mg，必要時每 5–10 分鐘依流程重複。適應症、濃度與途徑不可互換。</small></article>
              <article><span>03 / 氣道</span><h3>起始尺寸</h3><dl><div><dt>有囊 ETT</dt><dd>{outsideColorRange ? "依 SOP" : `${activeZone.cuffed} mm`}</dd></div><div><dt>無囊 ETT</dt><dd>{outsideColorRange ? "依 SOP" : `${activeZone.uncuffed} mm`}</dd></div><div><dt>口角深度</dt><dd>{outsideColorRange ? "依 SOP" : `${activeZone.depth} cm`}</dd></div><div><dt>LMA</dt><dd>Size {lmaSizeFor(workingWeight)}</dd></div></dl><small>準備相鄰尺寸；超出色帶範圍時不套用色區尺寸。以胸廓、聽診、波形 ETCO₂ 及影像確認位置。</small></article>
              <article><span>05 / 通氣</span><h3>潮氣量速算</h3><dl><div><dt>{selectedVitalSigns.stage}｜{tidalRange[0]}–{tidalRange[1]} mL/kg</dt><dd>{formatNumber(workingWeight * tidalRange[0])}–{formatNumber(workingWeight * tidalRange[1])} mL</dd></div><div><dt>目前年齡帶</dt><dd>{selectedVitalSigns.age}</dd></div></dl><small>僅作設備可監測容量時的起始參考；手壓 BVM 不應追求把氣囊擠完，以可見胸廓起伏、心率、血氧與波形 ETCO₂ 調整。</small></article>
              <article><span>04 / 循環</span><h3>補液速算</h3><dl><div><dt>10 mL/kg</dt><dd>{formatNumber(workingWeight * 10)} mL</dd></div><div><dt>20 mL/kg</dt><dd>{formatNumber(workingWeight * 20)} mL</dd></div></dl><small>先分病因：敗血／分布性休克可依 SOP 分次給予並每次重評；疑出血性休克優先止血與血品，避免固定反覆晶質液；心因性休克需更小量、更審慎。</small></article>
              <article><span>07 / 有脈搏心律</span><h3>心率藥物速算</h3><dl><div><dt>Atropine｜0.02 mg/kg</dt><dd>{formatNumber(Math.min(Math.max(workingWeight * .02, .1), .5))} mg</dd></div><div><dt>Adenosine｜首次 0.1 mg/kg</dt><dd>{formatNumber(Math.min(workingWeight * .1, 6))} mg</dd></div><div><dt>Adenosine｜第二次 0.2 mg/kg</dt><dd>{formatNumber(Math.min(workingWeight * .2, 12))} mg</dd></div></dl><small>Atropine：症狀性心搏過緩且疑迷走神經張力增加或原發性 AV block，最低 0.1 mg、單次上限 0.5 mg，可重複一次。Adenosine：規則窄 QRS SVT，快速 IV／IO 推注後立即沖管。</small></article>
              <article><span>06 / 低血糖</span><h3>Rule of 50 速算</h3><dl><div><dt>{phplsGlucose?.label ?? "目前年齡對應"}</dt><dd>{phplsGlucose ? `${formatNumber(phplsGlucose.volume)} mL` : "PHPLS 表未明列"}</dd></div></dl><small>{phplsGlucose ? phplsGlucose.note : "4 歲至青春期前未在 PHPLS 該頁獨立列示，不自行外推濃度。"} 每次只使用目前年齡對應方案；依機關 SOP／醫療指導，給藥後 5–10 分鐘重測。</small></article>
              <article><span>08 / 癲癇重積</span><h3>PHPLS Midazolam</h3><dl><div><dt>體重分段</dt><dd>{workingWeight > 40 ? "＞40 kg" : workingWeight >= 13 ? "13–40 kg" : "＜13 kg"}</dd></div><div><dt>IM 單次劑量</dt><dd>{midazolamDose ? `${midazolamDose.mg} mg` : "教材未明列"}</dd></div><div><dt>5 mg/mL 製劑</dt><dd>{midazolamDose ? `${midazolamDose.mL} mL` : "依 SOP／醫療指導"}</dd></div></dl><small>PHPLS 教材為固定體重分段、單次 IM 劑量，不把未明列的 ＜13 kg 自行外推；教材實務抽藥最小單位為 0.1 mL＝0.5 mg。給藥前備妥通氣與抽吸，給藥後持續監測。</small></article>
              <article><span>09 / 呼吸藥物</span><h3>WHEEZING 與 CROUP 分開看</h3><dl><div><dt>WHEEZING｜自備 MDI／DPI</dt><dd>2 噴／次</dd></div><div><dt>WHEEZING｜每噴間隔</dt><dd>1 分鐘</dd></div><div><dt>WHEEZING｜送醫＞20 分鐘</dt><dd>每 20 分鐘可再給</dd></div><div><dt>WHEEZING｜IH A+B／單 B，＜5 歲</dt><dd>½ 支，N/S 至 4 mL</dd></div><div><dt>嚴重 WHEEZING｜Epinephrine SC</dt><dd>0.3–0.5 mg</dd></div><div><dt>CROUP 哮吼｜Epinephrine IH 0.5 mg/kg</dt><dd>{croupEpinephrineDose === null ? "4–5 歲帶：核對實際年齡" : `${formatNumber(croupEpinephrineDose)} mg`}</dd></div><div><dt>CROUP 哮吼｜PHPLS 上限</dt><dd>{croupEpinephrineMax === null ? "依實際年齡／SOP" : `${croupEpinephrineMax} mg`}</dd></div></dl><small>WHEEZING：A＋B／單 B 以氧氣 6 L/min 霧化；SC Epinephrine 僅限嚴重病人、先聯絡醫療指導並核對心血管禁忌。CROUP：Epinephrine 不稀釋；＜4 歲上限 2.5 mg、＞4 歲上限 5 mg。途徑不可混用。</small></article>
              <article><span>10 / 退燒塞劑</span><h3>Diclofenac 12.5 mg／顆</h3><dl><div><dt>目前年齡與體重</dt><dd>{selectedVitalSigns.stage}｜{formatNumber(workingWeight)} kg</dd></div><div><dt>PHPLS 速查</dt><dd>{diclofenac.dose}</dd></div></dl><small>{diclofenac.detail}。TFDA 仿單列為處方藥且兒童用法限一歲以上；先核對 NSAID 禁忌、適應症、地方 SOP 與醫療指導。塞劑尖端朝內，完全置入後輕夾雙臀 10–15 秒。</small></article>
            </div>
            <div className="ruler-warning"><b>教學安全界線</b><p>實測公斤數與照顧者近期可靠體重優先；身長／體型估重通常比單純年齡公式精確。Best Guess 只提供族群平均估算，可能因體型、營養及族群差異高估或低估。這不是 Broselow® 原廠產品、醫療器材或處方工具；使用實體尺前應確認版次、批號與最新通知。</p></div>
            <div className="ruler-sources"><span>依據｜含 PHPLS 教材劑量表</span><a href="https://www.fda.gov.tw/tc/includes/GetFile.ashx?id=f636694231199735860" target="_blank" rel="noreferrer">TFDA Diclofenac 栓劑仿單 ↗</a><a href="https://pubmed.ncbi.nlm.nih.gov/18021105/" target="_blank" rel="noreferrer">Best Guess 原始研究 ↗</a><a href="https://www.sciencedirect.com/science/article/pii/S0300957213008873" target="_blank" rel="noreferrer">2014 體重估算比較研究 ↗</a><a href="https://cpr.heart.org/-/media/CPR-Files/CPR-Guidelines-Files/2025-Algorithms/Algorithm-PALS-CA-250123.pdf" target="_blank" rel="noreferrer">2025 AHA/AAP 小兒心停流程 ↗</a><a href="https://cpr.heart.org/-/media/CPR-Files/CPR-Guidelines-Files/2025-Algorithms/Algorithm-PALS-Bradycardia-250121.pdf" target="_blank" rel="noreferrer">2025 AHA/AAP 心搏過緩流程 ↗</a><a href="https://cpr.heart.org/-/media/CPR-Files/CPR-Guidelines-Files/2025-Algorithms/Algorithm-PALS-Tachyarrhythmia-250117.pdf?sc_lang=en" target="_blank" rel="noreferrer">2025 AHA/AAP 心搏過速流程 ↗</a><a href="https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines/neonatal-resuscitation" target="_blank" rel="noreferrer">2025 AHA/AAP 新生兒復甦 ↗</a><a href="https://www.resus.org.uk/professional-library/2025-resuscitation-guidelines/paediatric-basic-life-support-guidelines" target="_blank" rel="noreferrer">2025 RCUK 兒科生命支持 ↗</a><a href="https://iris.who.int/bitstream/handle/10665/382772/9789240114067-eng.pdf?sequence=1" target="_blank" rel="noreferrer">WHO 到院前緊急照護 ↗</a><a href="https://iris.who.int/bitstream/handle/10665/206540/9789241510264_eng.pdf?sequence=1" target="_blank" rel="noreferrer">WHO 新生兒復甦氣囊技術文件 ↗</a><a href="https://www.oregon.gov/oha/PH/PROVIDERPARTNERRESOURCES/EMS/EMSFORCHILDREN/Documents/Broselow-Cart-Manual.pdf" target="_blank" rel="noreferrer">Oregon EMSC 器材尺寸手冊 ↗</a><a href="https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfRes/res.cfm?ID=213894" target="_blank" rel="noreferrer">FDA 召回通知 ↗</a></div>
          </div>
        </div>
      </section>

      <section className="correction-section" id="corrections">
        <div><p className="micro">VERSION CONTROL · 2026-08-30</p><h2>合併後採用的新版校正</h2><p>兩個原網站為主體；後續教材只補齊缺項與修正衝突。以下是最容易混用的版本差異。</p></div>
        <div className="correction-grid">
          <article><span>新生兒 PPV</span><b>30–60 次／分</b><p>每次充氣 0.5–1 秒；有效通氣 30 秒後 HR 仍＜60 才進入 3:1 按壓。</p></article>
          <article><span>延遲夾臍</span><b>至少 60 秒</b><p>限無需立即復甦者；需要通氣時不可為等待夾臍而延誤。</p></article>
          <article><span>早產兒氧氣</span><b>＜32 週：30–100%</b><p>依 AHA 2025 個別化起始，並由右手／手腕 SpO₂ 與心率滴定。</p></article>
          <article><span>新生兒 Epinephrine</span><b>IV／UVC／IO 0.01–0.03 mg/kg</b><p>ET 0.05–0.1 mg/kg 僅作建立血管路徑中的橋接；每 3–5 分鐘。</p></article>
          <article><span>產後出血</span><b>300 mL＋異常，或 500 mL</b><p>不等固定門檻；持續出血與生理惡化應立即升級。</p></article>
          <article><span>兒科出血性休克</span><b>止血與血品優先</b><p>補液卡保留速算，但不再暗示固定反覆晶質液。</p></article>
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
        <div className="footer-brand"><span>PEDS//FIELD + MATERNAL</span><h2>看見差異，<br />做對第一步。</h2></div>
        <div className="footer-links"><b>專業參考</b><a href="https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines/pediatric-basic-life-support" target="_blank" rel="noreferrer">2025 Pediatric BLS ↗</a><a href="https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines/pediatric-advanced-life-support" target="_blank" rel="noreferrer">2025 Pediatric ALS ↗</a><a href="https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines/neonatal-resuscitation" target="_blank" rel="noreferrer">2025 Neonatal Resuscitation ↗</a></div>
        <div className="footer-scope"><b>使用範圍</b><p>供 EMT 與專業救護教育訓練使用。藥物、輸液、骨內針、進階氣道及電擊能量，應依救護層級、醫療指導及彰化縣現行 SOP 執行。</p></div>
        <p className="copyright">© 2026 PEDS//FIELD · 孕婦與兒少院前救護教學 · 整合校正 2026-08-30</p>
      </footer>
    </main>
  );
}
