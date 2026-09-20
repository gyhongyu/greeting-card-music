# 🏛️ 專案當前狀態與架構憲法 (STATE.md)
> ⚠️ **【治理紀律：本檔案嚴格保持 ≤ 200 行，為專案唯一單一真理庫 (SSOT)】**  
> 最後校準日期：2026-09-20 | 狀態：v2.0 雙軌雲端架構穩態

---

## 🎯 1. 專案定位 (Mission & Scope)
- **專案名稱**：CardForge (greeting-card-music)
- **核心價值**：人類 × AI 雙引擎可視化 3D 動態音樂賀卡與旗艦模板工坊。具備免 Git Commit 雲端持久化、社交動態預覽（Open Graph 注入）與極致 WebGL 沉浸體驗。
- **運行架構**：三角雙軌架構（GitHub Pages 純靜態託管 ＋ Google Sheet 雲端 SSOT ＋ Cloudflare Worker 邊緣社交預覽）。

---

## ⛔ 2. 不可違背之架構不變量 (Hard Invariants)

1. **畫廊優先鐵律 (Gallery-First Invariant)**：
   - `workspace.html` 預設進入視圖**必須且只能是「首頁大畫廊看板 (Gallery Dashboard)」**。
   - **絕對嚴禁默認強行進入三欄編輯模式**。卡片庫與模板庫必須是寬大的卡片展示架（Cards Grid），具備預覽、雲端分享、複製與編輯按鈕。
   - 只有使用者明確點擊「編輯卡片」或「＋新增卡片」時，才切換進入編輯器視圖；且頂部必須具備顯眼的 `[← 返回卡片庫]` 按鈕。

2. **卡片與模板物理徹底解耦 (Decoupled Card vs Template)**：
   - **模板 (Templates)**：純視覺規範（3D WebGL Shader、Three.js 粒子特效、排版配色）。僅供視覺試看，嚴禁直接發布給受眾。
   - **卡片 (Cards)**：具體卡片實例（稱謂、賀詞正文、照片、署名、關聯 templateId）。

3. **免 Git Commit 雲端持久化 (Cloud SSOT & SWR)**：
   - 卡片修改直接由前端打 Google Apps Script (GAS) 網關寫入 Google Sheet，徹底終結「每改一個數值就必須做一次 git commit」之痛點。
   - 採用 SWR（Stale-While-Revalidate）雙層快取：本地 `localStorage` 0ms 秒開，背景非同步同步最新卡片。

4. **邊緣社交預覽 (Edge OG Injection)**：
   - 透過 Cloudflare Worker 探測 LINE / FB / WhatsApp 爬蟲，動態注入 `<meta property="og:...">`，確保分享連結 100% 呈現卡片專屬圖文預覽。

5. **受眾端純淨極致沉浸 (Audience Player Isolation)**：
   - `index.html` 專門用於受眾點擊分享連結（`?id=xxx`）時全螢幕播放，嚴禁混入任何後台編輯控制元件。
   - 具備離線降級容災能力（Fallback to `data/cards.json`），確保永不白屏。

---

## 🗺️ 3. 模組職責地圖 (Architecture Map)

| 路徑 / 檔案 | 核心職責 | 關鍵依賴 |
| :--- | :--- | :--- |
| `workspace.html` | 工坊總台骨架：大畫廊看板、卡片/模板切換入口 | React 18, Babel, Tailwind |
| `index.html` | 受眾端公開播放器：SWR 秒開、雲端短 ID 解析、音樂沉浸 | React 18, Three.js, BackdropShader |
| `core/CardEngine.js` | 卡片排版渲染引擎（星戰漫遊升空、精裝方盒卡片、照片輪播） | React, ParticleEngine |
| `core/ParticleEngine.js` | 3D 前景粒子引擎（落櫻、星塵、流星、黑洞渦流、衛星巡航） | Three.js / Canvas 2D |
| `core/BackdropShader.js` | 3D 背景 Shader 渲染器（WebGL 絲綢金煙、軌道行星、賽博全息） | Three.js / WebGL |
| `js/config.js` | 全域前端設定檔（GAS 端點、分享短網域、預設資源） | 純 JS |
| `js/gas_client.js` | Google Sheet 雲端持久化與 SWR 本地快取客戶端 | Fetch API, localStorage |
| `js/workspace.js` | 工坊核心業務邏輯：大畫廊、微調 Modal、即時預覽、雲端發布 | React 18, GasClient |
| `css/workspace.css` | 工坊專用樣式、模擬設備框、雲端 Toast 動畫 | CSS |
| `gas/Card_Gateway.gs` | Google Apps Script 萬能雲端網關（支援 save_card / get_card） | Google Apps Script |
| `cloudflare/worker_og_proxy.js` | Cloudflare Worker 邊緣社交預覽代理（爬蟲動態注入 OG） | Cloudflare Workers |
| `assets/audio/` | 本地收納之高品質背景音訊（如 In Love With You.mp3） | MP3 |
| `data/cards.json` | 內建精選卡片保底台帳（Offline Fallback） | JSON |
| `data/templates.json` | 旗艦風格模板規格庫台帳（Offline Fallback） | JSON |

---

## 📌 4. 已驗證與已固化成果 (Verified Milestones)
- [x] 根治頻繁 Git Commit：GAS 網關與 Google Sheet SSOT 客戶端落盤。
- [x] 根治社群分享無預覽：Cloudflare Worker 邊緣 OG 代理腳本就緒。
- [x] 專案目錄大掃除：清理 100% 廢代碼（`app.js`, `components/`），音訊收納至 `assets/audio/`。
- [x] 模組化瘦身：`workspace.html` 由 76KB 單檔巨石拆分為 `css/workspace.css` 與 `js/workspace.js`。
- [x] 播放器升級：`index.html` 支援 `?id=` 參數、SWR 秒開與本地防崩潰保底。
