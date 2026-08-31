# GitHub 上傳檢查表

## 上傳方式

- 上傳本資料夾「裡面的全部內容」，不要只上傳 `docs` 或單一 `index.html`。
- 建議使用 GitHub Desktop，能完整保留 `.github/workflows/pages.yml`。
- 若使用 GitHub 網頁介面，確認 `.github`、`app`、`docs`、`github-static`、`public` 都有出現在 repository。

## 已包含

- 網站原始碼：`app/`
- GitHub Pages 靜態入口：`index.html` 與 `docs/`
- 自動發布流程：`.github/workflows/pages.yml`
- 靜態建置入口：`github-static/`
- 圖片與圖示：`public/`
- 套件與建置設定：`package.json`、`package-lock.json`、Vite／TypeScript 設定
- 合併與版本紀錄：`MERGE_NOTES.md`

## 已排除

- `.git/`：原專案版本紀錄與非 GitHub remote
- `.openai/`：Sites 專用發布識別
- `node_modules/`：可由 `npm ci` 重新安裝
- `.next/`、`.vinext/`、`.wrangler/`、`dist/`：本機建置快取與輸出
- `.env*`：環境變數與可能的敏感資料

## Pages 設定

首選：`Settings` → `Pages` → `Source: GitHub Actions`。

備用：`Deploy from a branch` → `main` → `/docs`。

