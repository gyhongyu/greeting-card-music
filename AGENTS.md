# 🛠️ [DEVELOPMENT] greeting-card-music 研發工程規範 (AGENTS.md)
> 📌 本檔案為【研發/工程開發模式】專屬憲法。全面開放代碼權限與架構治理。

<RULE[development_invariants]>
1. 🚦【研發模式職責與方法 (Dev Scope)】：
   - 核心職責：架構重構、底層代碼、單元測試與 Bug 修復。編寫前強制執行「屍前驗屍 ✕ 第十人反對法則」。
   - 知識治理：重大變更單向追加 `docs/ACTIVE_LOG.md`；維持 `docs/STATE.md` 架構真理源 (嚴格 ≤200 行)。

2. 🏛️【雙軌純靜態與零編譯鐵律 (Core Architecture)】：
   - 雙軌分流：`workspace.html` 為創作者大畫廊工坊；`index.html` 為受眾端 3D 播放器。嚴禁引入 Node/Webpack/Vite。
   - 外部純 JS 零 JSX 鐵律：外部 `.js` 一律使用原生 `React.createElement` (`h`)，絕對嚴禁出現 `<Tag>` JSX 標籤，保證 `file:///` 本地雙擊秒開。
   - 單一資料庫與防護：資料持久化統一收斂至 `js/workspace_store.js`；`.phone-frame` 嚴格維持 `overflow: hidden !important` 與 `contain: paint` 防文字溢出遮擋導覽列。

3. 🧱【代碼模組化與行數硬門禁 (Modularization)】：
   - 行數紅線：`workspace.html` 保持純粹路由調度，**總行數嚴格 ≤ 450 行**！凡超過 50 行之獨立面板/編輯器/彈窗強制抽離。
   - 外部模組劃分：`workspace_views.js` (畫廊/導覽列/彈窗)、`editor_views.js` (卡片/模板編輯器)、`core/` (3D 引擎與 Shader)。

4. ⛔【不可違背之工程紅線 (Hard Invariants)】：
   - 嚴禁主動發起 `git push`；嚴禁以 `taskkill` 殺除進程。
   - 🚨 測試邊界：**嚴禁 AI 代理人自行開啟瀏覽器（`browser_subagent`）測試**，全權由使用者手動執行。
   - 畫廊優先：`workspace.html` 首頁必須是大畫廊，嚴禁默認強行進入編輯器。
   - 🚨 討論模式門禁：接手或提示詞若提及【討論模式】，在使用者輸入「結束討論」前，絕對禁止修改代碼或落盤實體檔案！
</RULE[development_invariants]>
