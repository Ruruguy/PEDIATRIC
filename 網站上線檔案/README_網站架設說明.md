# 小兒救護學習網站｜上線檔案說明

本資料夾已整理成兩種交付形式：

1. `小兒救護網站_Cloudflare直接部署包.zip`
   - 已完成建置。
   - 適合直接部署至 Cloudflare Workers，再綁定自己的網域。
   - 可保留互動小兒尺、情境切換、技術檢核等完整功能。

2. `小兒救護網站_完整原始碼.zip`
   - 包含網站程式、版面、圖片及建置設定。
   - 適合交給網站公司、資訊人員或放進 GitHub／GitLab 保存。

## 建議架站方式：Cloudflare Workers

目前網站是含互動功能的 React 網站，不建議只把 `client` 資料夾當成一般 HTML 上傳。請使用直接部署包內的完整 Worker 與靜態資源。

### 第一次部署

1. 安裝 Node.js 22 以上版本。
2. 解壓縮 `小兒救護網站_Cloudflare直接部署包.zip`。
3. 在解壓縮後的資料夾開啟終端機。
4. 執行 `npm install`。
5. 執行 `npm run login`，登入 Cloudflare。
6. 執行 `npm run deploy`。
7. Cloudflare 會回傳一個 `workers.dev` 網址，請先確認網站可正常開啟。

### 綁定自己的網域

1. 網域必須已加入同一個 Cloudflare 帳號，並成為啟用中的 Zone。
2. 進入 Cloudflare 控制台的 `Workers & Pages`。
3. 選擇名稱為 `peds-field-learning` 的 Worker。
4. 進入 `Domains`，選擇新增既有網域。
5. 輸入要使用的主機名稱，例如 `peds.example.com`。
6. 若該名稱已有 CNAME，須先排除衝突後再綁定。

## 交給網站公司的資料

請將以下兩個檔案交付：

- `小兒救護網站_完整原始碼.zip`
- 本份 `README_網站架設說明.md`

若廠商使用 Cloudflare Workers，也可直接交付 `小兒救護網站_Cloudflare直接部署包.zip`。

## 更新網站

網站內容更新後，請重新執行完整原始碼中的：

1. `npm install`
2. `npm run build`
3. 以新產生的 `dist/client` 與 `dist/server` 更新直接部署包。
4. 再執行 `npm run deploy`。

## 重要提醒

- 網站內含小兒急救劑量及器材尺寸的教學資訊，正式公開前應由醫療指導醫師或課程負責人完成內容審查。
- 小兒尺屬教學模擬工具，不是 Broselow® 原廠產品、醫療器材或處方工具。
- 網站公開後應定期檢查 AHA／AAP 指引、地方 SOP、器材版本及召回資訊。
- 若網域由其他公司代管，請勿任意修改 DNS；先由網域管理者確認設定方式。

