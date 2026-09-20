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
   - 純 JS 隔離：外部 `.js` 檔（如 `js/workspace_store.js`, `core/ParticleEngine.js`）**絕對禁止包含 JSX 語法**；JSX 視圖組件一律保留在 HTML 內聯 Babel 塊中。
   - 單一真理庫：卡片與模板資料持久化、降級保底一律收斂至 `js/workspace_store.js`。

4. ⛔【不可違背之工程紅線 (Hard Invariants)】：
   - 嚴禁主動發起 `git push`；嚴禁以 `taskkill` 殺除核心進程。
   - 🚨 測試邊界：**嚴禁 AI 代理人自行開啟瀏覽器（`browser_subagent`）進行測試**，測試全權交由使用者手動執行。
   - 畫廊優先：`workspace.html` 預設首頁必須是卡片/模板大畫廊，嚴禁默認強行進入編輯器。
</RULE[development_invariants]>
