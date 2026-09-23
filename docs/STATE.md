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

6. **本地雙擊零編譯與純 JS 隔離鐵律 (Zero-Build & Zero-CORS Pure JS Invariant)**：
   - 專案維持純靜態架構，可由使用者在本地以 `file:///` 協議雙擊直接開啟。
   - **嚴禁引入 Node.js/Webpack/Vite 等構建工具**。
   - **純邏輯模組化規範**：外部 `.js` 檔案（如 `js/workspace_store.js`, `core/ParticleEngine.js`）**絕對禁止包含 JSX 語法**，以防觸發瀏覽器原生的 `Unexpected token '<'` 語法錯誤。
   - 資料儲存與 CRUD 一律統一收斂至 `js/workspace_store.js`（`WorkspaceStore`）單一真理源，創作者端與受眾端共享，杜絕代碼重複。

---

## 🗺️ 3. 模組職責地圖 (Architecture Map)

| 路徑 / 檔案 | 核心職責 | 關鍵依賴 / 語法規範 |
| :--- | :--- | :--- |
| `workspace.html` | 創作者大螢幕工坊：大畫廊看板、卡片/模板編輯器組裝 | React 18, Babel, Tailwind (內聯 JSX) |
| `index.html` | 受眾端終端播放器：開門解鎖 Web Audio、SWR 秒開、沉浸體驗 | React 18, Three.js (內聯 JSX) |
| `js/workspace_store.js` | 全域單一資料源：LocalStorage 持久化、JSON 降級保底、CRUD | 純 JS (嚴禁 JSX，零 CORS) |
| `js/workspace_views.js` | 工坊核心視圖庫：彈窗(預覽/分享)、導覽列(Navbar)、大畫廊展示 | React (純 JS / React.createElement，零 JSX) |
| `js/editor_views.js` | 編輯器視圖庫：卡片編輯器(CardEditorView)、模板工坊(TemplateEditorView) | React (純 JS / React.createElement，零 JSX) |
| `js/image_uploader.js` | 圖片極致 WebP 壓縮與 ImgBB 免費 CDN 直傳 | 純 JS (Canvas 等比縮小、WebP 80%、ImgBB API) |
| `core/CardEngine.js` | 卡片排版渲染引擎（星戰漫遊升空、精裝方盒卡片、照片輪播） | React, ParticleEngine (純 JS/React API) |
| `core/ParticleEngine.js` | 3D 前景粒子引擎（落櫻、星塵、流星、黑洞渦流、衛星巡航） | Three.js / Canvas 2D (純 JS，零 JSX) |
| `core/BackdropShader.js` | 3D 背景 Shader 渲染器（WebGL 絲綢金煙、軌道行星、賽博全息） | Three.js / WebGL (純 JS，零 JSX) |
| `js/config.js` | 全域前端設定檔（GAS 端點、分享短網域、預設資源） | 純 JS |
| `js/gas_client.js` | Google Sheet 雲端持久化與 SWR 本地快取客戶端 | Fetch API, localStorage |
| `css/workspace.css` | 工坊專用樣式、模擬設備框、雲端 Toast 動畫 | CSS |
| `styles/animations.css` | 賀卡動畫特效（星戰爬升、淡入淡出、漂浮） | CSS |
| `styles/templates.css` | 模板主題專屬色彩變數與字體定義 | CSS |
| `gas/Card_Gateway.gs` | Google Apps Script 萬能雲端網關（支援 save_card / get_card） | Google Apps Script |
| `cloudflare/worker_og_proxy.js` | Cloudflare Worker 邊緣社交預覽代理（爬蟲動態注入 OG） | Cloudflare Workers |
| `assets/audio/` | 本地高品質背景音樂（如 In Love With You.mp3） | 音訊資源 |
| `data/cards.json` | 內建精選卡片保底台帳（Offline Fallback） | JSON |
| `data/templates.json` | 旗艦風格模板規格庫台帳（Offline Fallback） | JSON |

---

## 📌 4. 已驗證與已固化成果 (Verified Milestones)
- [x] 根治頻繁 Git Commit：GAS 網關與 Google Sheet SSOT 客戶端落盤。
- [x] 根治社群分享無預覽：Cloudflare Worker 邊緣 OG 代理腳本就緒。
- [x] 專案目錄大掃除：清理 100% 廢代碼（`app.js`, `components/`），音訊收納至 `assets/audio/`。
- [x] 模組化瘦身：`workspace.html` 拆分為組件化裝配，抽離純 JS `js/workspace_store.js` 與 `js/editor_views.js` (≤ 450 行門禁)。
- [x] 播放器升級：`index.html` 移除 225 行重複粒子引擎，抽離 `WelcomeGate` 與 `AudioControls`。
- [x] 瀏覽器測試權限隔離：恪守「測試由使用者手動執行」鐵律，AI 嚴禁私自調用瀏覽器測試。
- [x] 首頁智慧分流與君子密碼門禁：`index.html` 根路徑跳轉工坊；`PasswordLockGate` (`10101010`) 本地記憶持久化。
- [x] 中秋 3D 特效與雙旗艦模板：超級明月 (`lunar-clouds`)、金桂飛花 (`osmanthus-petals`)、祈願天燈海 (`sky-lanterns`)、天上掉月餅 (`falling-mooncakes`) 與真實 3D 金箔月餅 (`golden-mooncake`) 透過 ImgBB 全域 CDN 閉環。
- [x] 模板工坊穩定性修復：預覽外框切換防拉伸 (`preview-frame` key)、月餅單例貼圖快取防消失 (`cachedMooncakeTex`)、移除示範按鈕 (CTA)。
