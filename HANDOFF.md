# 📋 專案工作交接文檔 (HANDOFF.md)

## 0. 🧠 智腦不二過記憶突觸 (Brain Synapse & Anti-Failure DNA)

### 溯源座標
- **當前會話 Conversation ID**: `86dd579b-1e97-4269-8ea2-c1b34b138038`
- **上游會話 Conversation ID**: `aed6e7c1-3824-4f76-b063-9329f7ff20bb`

---

### 🚨 專案鐵律與血淚禁令 (Invariants & Red Lines)

1. **🚨 討論模式最高門禁 (Discussion Mode Mandate)**：
   - 接手若提示詞提及【討論模式】，在使用者明確輸入「結束討論」前，**絕對禁止**生成任何實體檔案或修改任何代碼！僅能進行架構探討、問題分析與方案審核。

2. **⛔ 絕對禁止未授權 Git 推送 (Absolute NO Unsolicited Git Push Law)**：
   - 除非使用者在對話中明確下達「推送倉庫」、「git push」、「推到 github」，否則任何代理人嚴禁主動發起 git push！

3. **🏛️ 全公網雙網址運作與零本地 HTML 開發鐵律 (Cloud-Only Operations)**：
   - ⛔ **本地 HTML 開發機制全面終止**：本專案已全面進入線上雲端生產階段，**嚴禁任何 AI 代理人再去搞 `file:///` 本地雙擊或本機開發邏輯**！那只是早期過渡期的開發過程，已全面作廢。
   - 🌐 **唯一合法雙公網入口**：所有功能測試、卡片製作與受眾播放，**100% 只會透過以下兩個公網網址進行操作與驗收**：
     1. 🍵 **Teaforia 官方站點**：`https://card.teaforia.in`（工坊 `workspace.html` 與受眾 `play.html`）
     2. 🏢 **Foxlink 官方站點**：`https://card.foxlink.co.in`（工坊 `workspace.html` 與受眾 `play.html`）

4. **👑 GAS 雲端 SSOT 絕對單一真理源與物理剷除本地參數常數鐵律 (Strict GAS SSOT & Zero-Local-Data Law)**：
   - **GAS 雲端資料庫（Google Sheet SSOT）為全系統唯一絕對單一真理源！**
   - ⛔ **本地假數據與常數全面剷除**：**絕對禁止在代碼中保留或硬編碼任何展示用卡片參數與模板參數**（如 `DEFAULT_TEMPLATES`、`DEFAULT_CARDS` 中的具體視覺特效與文字）！
   - ⛔ **嚴禁任何本地代碼覆蓋雲端**：所有卡片、模板之視覺特效、字級、仰角、音量、配樂與背景，**100% 必須由 GAS 雲端即時載入**！
   - 🚨 **嚴禁後門降級**：嚴禁任何代理人私自寫 `else { 拿本地常數... }` 的搶佔或降級邏輯！凡只要有機會覆蓋或取代 GAS 雲端真值的本地參數，一律視同破壞憲法之重大事故，必須物理級徹底刪除！

5. **🎨 模板發布與雲端真值同步鐵律 (Cloud SSOT Sync)**：
   - 新增/修改模板後，必須強制推送至 Google Sheet 覆寫雲端 SSOT：
     1. 三維核驗：`py scripts/sync_templates.py verify`
     2. 雲端推送：`py scripts/sync_templates.py push`（覆寫 Google Sheet SSOT）
     3. 技能指引：完整工作流請參閱 `.agents/skills/cardforge_template_manager/SKILL.md`。

6. **☁️ Google Drive 雲端儲存與零內聯字串鐵律 (Cloud Storage Invariant)**：
   - 嚴禁把 SRT 字幕全文、音訊 Base64、巨型文字塞進卡片欄位（會炸飛 LocalStorage 5MB 與 Google Sheet 50,000 字元上限）。
   - 一律由 `gas/Card_Gateway.gs` 上傳至 Google Drive 專用資料夾，卡片僅保存短網址。
   - 所有雲端資料夾映射與權限規範一律遵循 `.agents/skills/cardforge_cloud_storage/`。
     - 字幕 (`CardForge_Subtitles`)：**公開可編輯** (`ANYONE_WITH_LINK, EDIT`)，並同步保存 `subtitleEditUrl` 供線上跳轉編輯。
     - 音訊/視訊/相片 (`CardForge_Audio` / `Videos` / `Photos`)：公開唯讀 (`VIEW`)。

7. **⛔ 嚴禁在播放器中使用相對路徑做無參跳轉 (Zero-Relative-Redirect Invariant)**：
   - `play.html` 內部 100% 絕對禁止出現 `window.location.replace('workspace.html')`！

8. **⛔ 畫廊優先與 workspace.html 行數門禁**：
   - 首頁必須是大畫廊；`workspace.html` 保持純粹組裝，總行數嚴格 ≤ 450 行！

---

## 1. 系統現況與已固化基線 (System Baseline)

| 模組 / 元件 | 當前真實狀態 | 說明 |
| :--- | :--- | :--- |
| **視訊未點播放即偷跑** | ✅ 已修復固化 | [core/CardEngine.js](file:///e:/Projects/greeting-card-music/core/CardEngine.js) 移除 `autoPlay: true`，綁定 `isStarted` 狀態，開門前保持在第 0 秒靜態幀，點擊開門後視訊、音樂與字幕同步啟動。 |
| **未知鏡像 CDN 清理** | ✅ 已修復固化 | `play.html`、`workspace.html`、`index.html` 中的 `resource.trickle.so` 已全數替換為 Cloudflare 官方 CDNJS。 |
| **Worker 404 反代修復** | ✅ 已修復固化 | [cloudflare/worker_og_proxy.js](file:///e:/Projects/greeting-card-music/cloudflare/worker_og_proxy.js) 的 `proxyToGitHubPages` 注入 `Host: card.foxlink.co.in` 標頭重寫，解決自訂網域 404 問題。 |
| **架構憲法升級** | ✅ 已固化 | [AGENTS.md](file:///e:/Projects/greeting-card-music/AGENTS.md) 與 [docs/STATE.md](file:///e:/Projects/greeting-card-music/docs/STATE.md) 全面拔除本地 HTML 開發機制，確立全公網雙網址運作與 GAS 雲端 SSOT 絕對單一真理源。 |
| **模板治理技能** | ✅ 已固化 | [.agents/skills/cardforge_template_manager/SKILL.md](file:///e:/Projects/greeting-card-music/.agents/skills/cardforge_template_manager/SKILL.md) 與同步腳本全面移除 `file:///` 描述，嚴守雲端 SSOT。 |
| **遠端倉庫狀態** | 🟡 本地已更新 | 代碼與規則已修改完畢，嚴格恪守未授權禁止 Push 鐵律，等待指令。 |

---

## 2. 歷史翻車覆盤：血淚教訓，嚴禁再犯！(Root Cause & Pre-Mortem)

- **痛點病根**：
  過去 AI 代理人一直受「相容本地 `file:///` 雙擊秒開」過渡期觀念綁架，在代碼中到處安插本地常數保底（Fallback）。
- **翻車實例**：
  使用者在工坊將中秋卡模板切換為「天上掉月餅 (`falling-mooncakes`)」並成功發布至 GAS，但受眾端在線上播放時，`play.html` 卻私自去吃本地舊的 `DEFAULT_TEMPLATES`，硬生生把天上掉月餅覆蓋成金桂玉兔！
- **下一棒鐵律**：
  **專案不會再去開本地 HTML**！不再需要相容本地離線 demo，所有卡片與模板 100% 來自 GAS 雲端。

---

## 3. 下一棒代理人核心任務清單 (Next Agent Action Items)

> 🚨 **下一棒 AI 代理人接手後必須依序完成的代碼大掃除任務**：

1. **全面清查全專案代碼，徹底拔除所有以本地參數取代 GAS 的邏輯 (100% 防堵)**：
   - **清查目標 1：[`play.html`](file:///e:/Projects/greeting-card-music/play.html)**
     - 檢查並刪除第 251-255 行或類似的 `else { if (window.DEFAULT_TEMPLATES) ... }` 本地常數覆蓋邏輯。
     - 確保卡片與模板 100% 來自 GAS 雲端查詢與快取。
   - **清查目標 2：[`js/workspace_store.js`](file:///e:/Projects/greeting-card-music/js/workspace_store.js)**
     - 檢查 `loadInitialData()` 與 `WorkspaceStore`：移除任何以 `DEFAULT_TEMPLATES` 或本地 JSON 覆蓋或合併雲端真值的邏輯。
   - **清查目標 3：[`js/constants.js`](file:///e:/Projects/greeting-card-music/js/constants.js)**
     - 拔除具體卡片與模板的寫死假數據展示參數，僅保留純 UI 結構定義與下拉選單（如 `SHADER_OPTIONS`、`PARTICLE_OPTIONS`）。
   - **清查目標 4：[`js/workspace_views.js`](file:///e:/Projects/greeting-card-music/js/workspace_views.js) 與 [`js/editor_views.js`](file:///e:/Projects/greeting-card-music/js/editor_views.js)**
     - 確保任何新增、編輯、複製操作均以雲端 SSOT 資料為基準，嚴禁注入過期本地示範數據。

2. **公網雙網址在線驗收測試**：
   - 驗收 `https://card.teaforia.in` 與 `https://card.foxlink.co.in`。
   - 確保所有卡片播放完全忠實呈現 GAS 雲端設定的特效（例如「天上掉月餅」），不再被任何本地代碼竄改。

3. **恪守 Git 推送鐵律**：
   - 全部代碼修改完成並核驗後，必須向使用者報告並獲得明確指令，嚴禁私自發起 git push！

---

## 4. 驗收啟動指令 (Verification Step)

請直接複製以下指令啟動下一棒 AI 代理人：

```markdown
請詳細閱讀專案根目錄下的 HANDOFF.md。本專案已全面進入線上雲端生產階段，徹底終止本地 HTML 開發機制，僅在兩個公網網址（card.teaforia.in 與 card.foxlink.co.in）操作。請立即全面清查全專案代碼（play.html, workspace_store.js, constants.js 等），徹底拔除所有以本地參數取代 GAS 的邏輯，做到 100% 全防堵。
```

