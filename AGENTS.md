# 🛠️ [DEVELOPMENT] greeting-card-music 研發工程規範 (AGENTS.md)
> 📌 本檔案為【研發/工程開發模式】專屬憲法。全面開放代碼權限與架構治理。

<RULE[development_invariants]>
1. 🚦【研發模式職責 (Development Scope)】：
   - 核心職責：架構重構、底層代碼編寫、單元測試、Bug 修復與知識治理。
   - 核心方法：編寫代碼或方案前強制執行「Pre-mortem 屍前驗屍 ✕ 第十人反對法則」。

2. 📚【研發知識治理 (DMC Protocol)】：
   - 單向追加：所有重大改動與踩坑必須主動追加至 `docs/ACTIVE_LOG.md`。
   - 單一真源：維護 `docs/STATE.md` 架構不變量 (嚴格 ≤200 行)。
   - 🚨 技能工程反饋：若本專案涉及技能研發或調用，嚴禁私造代碼，必須嚴格維護 `docs/incident_reports/` 工單與自動化測試閉環。

3. 🏛️【雙軌架構與零編譯純 JS 鐵律 (Core Architecture)】：
   - 雙軌分流：`workspace.html` 為創作者 PC 大螢幕畫廊工坊；`index.html` 為受眾端 3D 沉浸賀卡播放器。
   - 零編譯 Zero-CORS：本專案為純靜態架構，保證在 `file:///` 本地協議下雙擊秒開。嚴禁引入 Node.js/Webpack/Vite。
   - 純 JS 隔離：外部 `.js` 檔（如 `js/workspace_store.js`, `js/workspace_views.js`, `core/CardEngine.js`, `core/ParticleEngine.js`）**絕對禁止包含 JSX 語法**，一律採用原生 `React.createElement`；JSX 視圖組件僅允許保留在 HTML 內聯 Babel 塊中。
   - 單一真理庫：卡片與模板資料持久化、降級保底一律收斂至 `js/workspace_store.js`；雲端保存統一收斂至 Google Sheet SSOT。
   - 手機外框硬隔離：`.phone-frame` 與 `.desktop-frame` 必須保持 `overflow: hidden !important` 與 `contain: paint`，嚴禁任何 3D 文字或特效溢出遮擋 Navbar。
   - 導覽列純淨原則：頂部 Navbar 嚴禁放置未經核准的冗餘匯出按鈕；返回按鈕必須明確標記「保存並返回」，消弭儲存焦慮。

4. 🧱【代碼模組化與檔案行數硬性門禁 (Modularization Invariant)】：
   - 頂層路由行數紅線：`workspace.html` 必須保持為純粹的「頂層路由調度器」，**嚴格限制總行數 ≤ 450 行**！嚴禁無節制在 HTML 內堆砌視圖。
   - 嚴禁內聯巨型組件：凡超過 50 行之獨立面板、編輯器、自訂彈窗，嚴禁直接堆疊於 HTML 內聯 Babel 塊中，必須強制抽離至 `js/` 或 `core/` 專屬模組。
   - 外部模組分工體系：
     * `js/workspace_views.js`：導覽列、大畫廊展示、通用分享/規格預覽彈窗。
     * `js/editor_views.js`：卡片所見即所得編輯器 (`CardEditorView`)、模板設計工坊 (`TemplateEditorView`)。
     * `core/`：3D 核心渲染引擎 (`CardEngine`, `ParticleEngine`, `BackdropShader`)。
   - 零 JSX 外部鐵律：外部 `.js` 模組一律使用原生 `React.createElement` (`h`)，絕對嚴禁出現任何 `<Tag>` JSX 標籤，保證在 `file:///` 本地協議下雙擊秒開。

5. ⛔【不可違背之工程紅線 (Hard Invariants)】：
   - 嚴禁主動發起 `git push`；嚴禁以 `taskkill` 殺除核心進程。
   - 🚨 測試邊界：**嚴禁 AI 代理人自行開啟瀏覽器（`browser_subagent`）進行測試**，測試全權交由使用者手動執行。
   - 畫廊優先：`workspace.html` 預設首頁必須是卡片/模板大畫廊，嚴禁默認強行進入編輯器。
   - 🚨 討論模式門禁：接手或提示詞若提及【討論模式】，在使用者輸入「結束討論」前，絕對禁止修改代碼或落盤實體檔案！
</RULE[development_invariants]>
