# 📝 研發結構化原子日誌 (ACTIVE_LOG.md)
> ⚠️ **【鐵律：只追加不修改 (Append-Only)】**  
> 本日誌記錄專案核心重大架構決策、Bug 修復與踩坑復盤，供後續 AI 代理人與工程師物理錨定。

---

### [2026-09-20] [UNREFINED] [workspace.html] 重構為畫廊優先 (Gallery-First) 雙層架構
- **類型**: `ARCH_DECISION` | `BUG_FIX`
- **代碼錨點**: `workspace.html` (L100~L700)
- **核心事實 / 決策理由**:
  - 前數十輪 AI 誤將「所見即所得編輯器」作為唯一的默認入口，強行將使用者困在三欄編輯介面中，把卡片清單與模板縮小成側邊欄或下拉選單，嚴重破壞使用者體驗。
  - 經由使用者反饋與「屍前驗屍 ✕ 第十人反對法則」，確認專案根基必須是「看板/大畫廊 (Gallery Dashboard)」：使用者進入系統必須直接看到寬大的卡片庫與模板庫，在卡片上直接提供預覽、複製分享連結、一鍵複製與編輯按鈕。
  - 點擊「編輯」才進入專屬編輯視圖，且頂部提供醒目的 `[← 返回卡片庫]` 導覽按鈕。
- **踩坑 / 失敗模式**:
  - 失敗模式：AI 代理人自以為「既然有 3D 即時預覽，使用者一定想直接編輯」，擅自省略畫廊首頁，導致多次修改均無法契合使用者需求。
- **防禦手段 / 測試背書**:
  - 將「畫廊優先鐵律 (Gallery-First Invariant)」寫入 `docs/STATE.md` 與 `docs/adr/ADR-001-gallery-first-architecture.md`，永久禁止任何代理人未經授權將首頁默認恢復為編輯模式。

---

### [2026-09-20] [UNREFINED] [arch] 固化 PRD、實施 Google Sheet 雲端持久化、社交動態預覽與目錄瘦身
- **類型**: `ARCH_DECISION` | `REFACTOR`
- **代碼錨點**: `docs/PRD.md`, `workspace.html`, `js/workspace.js`, `js/gas_client.js`, `gas/Card_Gateway.gs`, `cloudflare/worker_og_proxy.js`, `index.html`
- **核心事實 / 決策理由**:
  - 徹底根治「每改動一個數值就必須發起一次 git commit」的致命摩擦力，參考 `htmal-report` 的動態 SSOT 設計，但捨棄過度複雜的 Google Drive 依賴，採用精簡的「Google Sheet SSOT ＋ 輕量 GAS 網關」。
  - 徹底解決社群分享（LINE、FB、WhatsApp、WeChat）沒有卡片封面與專屬祝福圖文預覽的盲區：引入 `cloudflare/worker_og_proxy.js` 邊緣層，針對爬蟲 10ms 內動態注入 Open Graph `<meta>` 標籤，人類訪客透傳至 GitHub Pages。
  - 清理 100% 歷史冗餘廢代碼（未引用的 `app.js` 與 `components/` 5 個組件、`docs/archive/` 空目錄），收納音訊至 `assets/audio/In Love With You.mp3`。
  - 將 76KB 單體巨石 `workspace.html` 拆解為 `css/workspace.css` 與 `js/workspace.js`，並加入「☁️ 發布至雲端 (免 Commit)」與專屬短連結分享彈窗。
  - 升級 `index.html`，支援解析 `?id=` 參數、啟用 `localStorage` SWR 秒開與本地 `data/cards.json` 降級保底。
- **踩坑 / 失敗模式**:
  - 社群爬蟲（LINE Bot、Facebook External Hit）不跑客戶端 JavaScript，純 CSR 靜態網頁無法產生動態卡片預覽。必須於邊緣層（Cloudflare Worker）攔截並伺服器端吐出 Open Graph 標籤。
  - 音訊路徑遷移若未同步更新 `templates.json` 會導致載入 404；已全面採用相對路徑與相容設定消除隱患。
- **防禦手段 / 測試背書**:
  - 固化 `docs/PRD.md`，更新 `docs/STATE.md`。

---

### [2026-09-20] [UNREFINED] [workspace.html] 模板編輯大螢幕 WYSIWYG 與頂部視角控制項重構
- **類型**: `REFACTOR` | `UI_UX`
- **代碼錨點**: `workspace.html` (L558~L687, L918~L1389), `css/workspace.css`
- **核心事實 / 決策理由**:
  - 徹底剷除原本憋屈的模板彈窗，將模板設計工坊升級為與卡片編輯器完全對齊的全螢幕三欄 WYSIWYG 介面（左欄基礎版型、中欄 3D 實時預覽、右欄 Shader/粒子/色彩）。
  - 根據使用者紅框與箭頭明確指示，將「即時預覽模式：[手機] [桌面寬屏]」控制項由中央畫布搬遷至頂部導覽列 (Navbar) 右側，徹底淨空中間 3D 渲染舞台，手機畫框置中無任何懸浮按鈕遮擋文字。
  - 確立 PC 桌面端專屬原則：排版專為 PC 瀏覽器大螢幕打造，左右側邊欄獨立滾動，手機畫框自適應視窗高度 (`max-height: calc(100vh - 130px)`)。
- **踩坑 / 失敗模式**:
  - 失敗模式：先前版本將視角切換按鈕懸浮覆蓋在手機預覽畫面上方，遮蔽卡片標題文案，引發嚴重視覺衝突；經搬遷至 Navbar 後獲得根治。
  - 測試邊界守衛：嚴格恪守「測試是使用者工作」鐵律，AI 嚴禁私自喚醒瀏覽器，驗收全權交由使用者親自按 F5 體驗。
- **防禦手段 / 測試背書**:
  - 純靜態無編譯相容性，代碼在 `file:///` 協議下秒開無 CORS 阻礙。
