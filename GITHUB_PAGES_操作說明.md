# GitHub Pages 發布操作

## 方法一：使用 GitHub Actions（建議）

1. 將本專案所有檔案上傳到 GitHub 儲存庫的 `main` 分支。
2. 開啟儲存庫的 `Settings` → `Pages`。
3. 在 `Build and deployment` 的 `Source` 選擇 `GitHub Actions`。
4. 開啟 `Actions` 頁面，等待 `Deploy GitHub Pages` 顯示綠色勾勾。
5. 回到 `Settings` → `Pages` 查看網站網址。

之後每次更新 `main` 分支，網站會自動重新建置與發布。

## 方法二：直接發布 docs 資料夾

本專案執行 `npm run build:github-pages` 後會產生 `docs/index.html`。

1. 將包含 `docs` 的專案推送到 GitHub。
2. 開啟 `Settings` → `Pages`。
3. `Source` 選擇 `Deploy from a branch`。
4. 分支選擇 `main`，資料夾選擇 `/docs`，按下 `Save`。

## 自訂網域

網站成功發布後，在 `Settings` → `Pages` → `Custom domain` 輸入網域。再依 GitHub 顯示的資訊至 DNS 供應商設定記錄。

## 常見問題

- 首頁 404：確認發布來源中最上層存在 `index.html`。
- 畫面沒有樣式：不可移動 `docs/assets`，並確認整個 `docs` 資料夾都有上傳。
- Actions 沒執行：確認 Pages 的 Source 已選擇 `GitHub Actions`，並到 Actions 頁面允許工作流程。
- 網址是 `帳號.github.io/儲存庫名稱/`：本專案已使用相對資源路徑，可支援這種子目錄網址。
