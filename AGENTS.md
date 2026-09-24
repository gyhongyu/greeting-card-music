# 🛠️ [DEVELOPMENT] greeting-card-music 研發工程規範 (AGENTS.md)
> 📌 本檔案為【研發/工程開發模式】專屬憲法。全面開放代碼權限與架構治理。

<RULE[development_invariants]>
1. 🚦【研發模式職責與方法 (Dev Scope)】：
   - 核心職責：架構重構、底層代碼、單元測試與 Bug 修復。編寫前強制執行「屍前驗屍 ✕ 第十人反對法則」。
   - 知識治理：重大變更單向追加 `docs/ACTIVE_LOG.md`；維持 `docs/STATE.md` 架構真理源 (嚴格 ≤200 行)。

2. 🏛️【全公網雙網址運作與零本地 HTML 開發鐵律 (Cloud-Only Operations)】：
   - ⛔ **本地 HTML 開發機制全面終止**：本專案已全面進入線上雲端生產階段，**嚴禁任何 AI 代理人再以 `file:///` 本地雙擊或本機開發邏輯設計代碼**！
   - 🌐 **唯一合法雙公網入口**：所有功能、卡片製作與受眾播放，**100% 只會透過以下兩個公網網址進行操作與驗收**：
     1. 🍵 **Teaforia 官方站點**：`https://card.teaforia.in`（工坊 `workspace.html` 與受眾 `play.html`）
     2. 🏢 **Foxlink 官方站點**：`https://card.foxlink.co.in`（工坊 `workspace.html` 與受眾 `play.html`）
   - 雙軌分流：`workspace.html` 為創作者工坊；`play.html` 為受眾端播放器；`index.html` 為智慧分流路由。
   - 單一資料庫與防護：資料持久化統一收斂至 `js/workspace_store.js`；`.phone-frame` 嚴格維持 `overflow: hidden !important` 與 `contain: paint` 防文字溢出遮擋導覽列。

3. 🧱【代碼模組化與行數硬門禁 (Modularization)】：
   - 行數紅線：`workspace.html` 保持純粹路由調度，**總行數嚴格 ≤ 450 行**！凡超過 50 行之獨立面板/編輯器/彈窗強制抽離。
   - 外部模組劃分：`workspace_views.js` (畫廊/導覽列/彈窗)、`editor_views.js` (卡片/模板編輯器)、`core/` (3D 引擎與 Shader)。

4. 📱【行動端 WebGL / Shader 安全鐵律 (Mobile Shader Invariant)】：
   - ⛔ 嚴禁雜湊崩潰：嚴禁在任何 GLSL 片段著色器中使用 `fract(sin(...) * 43758.5453)` 或類似的大數三角函數雜湊！在 ARM Mali 與 Qualcomm Adreno 等行動端 GPU 浮點精度截斷下，必產生災難性的多邊形碎片與晶體馬賽克。
   - ✅ 強制無三角函數安全雜湊：所有程序化噪聲/雜湊一律強制採用 Dave Hoskins `hash12` / `hash22` (無 sine 向量混淆演算法：`vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += vec3(dot(p3, p3.yzx + 33.33)); return fract((p3.x + p3.y) * p3.z);`)。
   - 🛡️ 精度與效能守護：片段著色器頭部必須包含 `#ifdef GL_FRAGMENT_PRECISION_HIGH ... precision highp float; ... #else precision mediump float; #endif`；DPR 嚴格限制 `Math.min(devicePixelRatio, 2)` 防行動端發燙崩潰。

5. 🎨【模板發布與雲端真值同步鐵律 (Cloud SSOT Sync)】：
   - ⛔ 嚴禁單邊落盤：新增或修改任何模板，必須強制依序推送至 Google Sheet SSOT (GAS)：
     1. `py scripts/sync_templates.py verify`（核驗一致性）
     2. `py scripts/sync_templates.py push`（推送至 Google Sheet 覆寫雲端 SSOT）
   - 🎛️ 介面同步率：凡涉及新參數（如視訊/字幕/字級），必須同時在 `js/editor_views.js` 的 `TemplateEditorView` 補齊輸入欄位。

6. ☁️【Google Drive 雲端儲存與零內聯字串鐵律 (Cloud Storage Invariant)】：
   - ⛔ 嚴禁內嵌大字串：大檔案（字幕/音訊/視訊）嚴禁將文字或 base64 塞入卡片欄位；一律經由 `Card_Gateway.gs` 上傳至 Google Drive 專屬資料夾，僅保存短 URL。
   - 📂 專案技能真理源：所有雲端資料夾映射與權限規範一律遵循 `.agents/skills/cardforge_cloud_storage/`。
     - 字幕 (`CardForge_Subtitles`)：強制為**公開可編輯** (`ANYONE_WITH_LINK, EDIT`)，並同步保存 `subtitleEditUrl` 供線上跳轉編輯。
     - 音訊/視訊/相片 (`CardForge_Audio` / `Videos` / `Photos`)：公開唯讀 (`VIEW`)。
   - 🛠️ 盤點指令：`py .agents\skills\cardforge_cloud_storage\scripts\cloud_storage.py map`。

7. 👑【GAS 雲端 SSOT 絕對單一真理源與物理剷除本地參數常數鐵律 (Strict GAS SSOT & Zero-Local-Data Law)】：
   - ⛔ **本地假數據與常數全面剷除**：**絕對禁止在代碼中保留或硬編碼任何卡片參數與模板參數**（如 `DEFAULT_TEMPLATES`、`DEFAULT_CARDS` 中的具體展示參數）！
   - ⛔ **嚴禁任何本地代碼覆蓋雲端**：**Google Apps Script (GAS) 雲端資料庫（Google Sheet SSOT）為全系統唯一絕對單一真理源！** 所有卡片、模板之視覺特效、字級、仰角、音量、配樂與背景，**100% 必須由 GAS 雲端即時載入**！
   - 🚨 **嚴禁後門降級**：嚴禁任何代理人私自寫 `else { 拿本地常數... }` 的搶佔或降級邏輯！凡只要有機會覆蓋或取代 GAS 雲端真值的本地參數，一律視同最高級別翻車事故，必須物理級徹底刪除！

8. ⛔【不可違背之工程紅線 (Hard Invariants)】：
   - 嚴禁主動發起 `git push`（除非使用者明確授權「推送倉庫/一起修改到位/push」）；嚴禁以 `taskkill` 殺除進程。
   - 🚨 測試邊界：**嚴禁 AI 代理人自行開啟瀏覽器（`browser_subagent`）測試**，全權由使用者手動執行。
   - 畫廊優先：`workspace.html` 首頁必須是大畫廊，嚴禁默認強行進入編輯器。
   - 🚨 討論模式門禁：接手或提示詞若提及【討論模式】，在使用者輸入「結束討論」前，絕對禁止修改代碼或落盤實體檔案！
</RULE[development_invariants]>
