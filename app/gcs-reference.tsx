const verbalRows = [
  [5, "清醒；咿呀、牙牙學語或字詞符合平常能力", "定向正常，能適當對話"],
  [4, "字詞比平常少，或自發煩躁哭聲", "能對話，但內容混亂／定向混淆"],
  [3, "只在疼痛刺激時哭泣", "不適當的字詞，無法形成適當對話"],
  [2, "疼痛刺激時僅呻吟", "無法理解的聲音／呻吟，沒有可辨識字詞"],
  [1, "無語音／哭聲反應", "無語言反應"],
] as const;
export default function GcsVerbalReference({ compact = false }: { compact?: boolean }) {
 return <section className="gcs-verbal-reference" id="gcs-verbal" aria-labelledby="gcs-verbal-title"><h3 id="gcs-verbal-title">小兒 GCS｜V 語言反應與成人的差異</h3><p>幼兒尚未能完整說話，不能因不會回答姓名、時間或地點就扣分。先問照顧者平常能力，再觀察發聲與互動；突然比平常少說話、少發聲或互動變差才是重要變化。</p>{compact ? <details><summary>展開 V5–V1 對照表與記錄範例</summary><VerbalTable /></details> : <VerbalTable />}<p className="gcs-concept"><b>版本與年齡：</b>本表採 RCH《Altered conscious state》線上版，分＜4歲與≥4歲；不是所有機構的統一年齡界線。Pediatric GCS 有不同修正版；V3 的用語可能寫成「持續煩躁」或「只對疼痛哭」，不要把兩張表的列混合。依指定量表、發展能力與地方SOP記錄，趨勢追蹤使用同一版本。</p><p className="gcs-concept"><b>大觀念：</b>GCS 的 V 是最佳語言反應（Verbal）；AVPU 的 V 是對聲音有反應（Voice），兩者不能直接換算。先處理ABCDE與可逆原因，不為湊分延誤救命處置。</p><p className="gcs-concept"><b>插管／無法測試：</b>因氣管內管無法發聲時記 V-NT（Not testable）及原因，繼續記錄可評估的E、M；不能自動記V1或硬湊總分。若機關另有T註記格式，依其規範並清楚交班。鎮靜、肌鬆、聽語障礙、發展遲緩與語言差異也需註明，與平常基準比較。</p><p><a href="https://www.rch.org.au/clinicalguide/guideline_index/Altered_conscious_state/" target="_blank" rel="noreferrer">RCH 小兒GCS對照表 ↗</a>{" · "}<a href="https://www.glasgowcomascale.org/faq/" target="_blank" rel="noreferrer">GCS官方FAQ：兒童與NT記錄 ↗</a><small> 核對：2026-11-11；線上版未標示為AHA2025專用量表。</small></p></section>;
}
function VerbalTable() {
 return <><div className="gcs-table-scroll"><table><caption>RCH版最佳語言反應｜＜4歲與≥4歲對照</caption><thead><tr><th scope="col">V分數</th><th scope="col">＜4歲／幼兒描述</th><th scope="col">≥4歲／具相應語言能力者（成人相同描述）</th></tr></thead><tbody>{verbalRows.map(([score,young,older])=><tr key={score}><th scope="row">V{score}</th><td>{young}</td><td>{older}</td></tr>)}</tbody></table></div><p><b>交班範例：</b>「原本會說短句，目前字詞較平常少且自發煩躁哭聲，依本表V4；E、M另評，並記錄時間與處置前後變化。」單純怕生哭鬧不宜直接判為意識障礙，須結合安撫後表現與整體評估。</p></>;
}
