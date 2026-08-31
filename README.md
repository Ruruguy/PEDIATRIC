# PEDS//FIELD｜孕婦與兒少救護學習站

整合孕婦急症、新生兒、嬰兒、兒童、小兒生命徵象、互動小兒尺、OHCA 流程、技術教室與情境教學的院前救護學習網站。

## 線上版本

- Sites 正式版：<https://pediatric-rescue-learning.augusru.chatgpt.site/>
- GitHub Pages：上傳至 GitHub 並完成下方設定後產生。

## GitHub Pages 發布

建議使用 GitHub Actions：

1. 將本資料夾內的所有檔案上傳至 GitHub repository 的 `main` 分支。
2. 開啟 `Settings` → `Pages`。
3. `Build and deployment` 的 `Source` 選擇 `GitHub Actions`。
4. 到 `Actions` 等待 `Deploy GitHub Pages` 顯示綠色勾勾。

也可選擇 `Deploy from a branch`，指定 `main` 分支的 `/docs`；本上傳版已包含整合後的最新靜態網站。

## 本機開發

需要 Node.js 22：

```bash
npm ci
npm run dev
```

建立 GitHub Pages 靜態版本：

```bash
npm run build:github-pages
```

## 重要提醒

本站供 EMT 與專業救護教育訓練使用。藥物、輸液、骨內針、進階氣道、胸腔減壓及電氣治療，應依救護層級、地方現行 SOP 與醫療指導執行。

