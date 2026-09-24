# 📋 專案工作交接文檔 (HANDOFF.md)

## 0. 🧠 智腦不二過記憶突觸 (Brain Synapse & Anti-Failure DNA)

### 溯源座標
- **當前會話 Conversation ID**: `18d7d840-bfa5-4b9e-8e31-dcdc5136d0d1`
- **上游會話 Conversation ID**: `86dd579b-1e97-4269-8ea2-c1b34b138038`

---

### 🚨 專案鐵律與血淚禁令 (Invariants & Red Lines)

1. **🚨 討論模式最高門禁 (Discussion Mode Mandate)**：
   - 接手若提示詞提及【討論模式】，在使用者明確輸入「結束討論」前，**絕對禁止**生成任何實體檔案或修改任何代碼！僅能進行架構探討、問題分析與方案審核。

2. **⛔ 絕對禁止未授權 Git 推送 (Absolute NO Unsolicited Git Push Law)**：
   - 除非使用者在對話中明確下達「推送倉庫」、「git push」、「推到 github」，否則任何代理人嚴禁主動發起 git push！

3. **🏛️ 全公網雙網址運作與零本地 HTML 開發鐵律 (Cloud-Only Operations)**：
   - ⛔ **本地 HTML 開發機制全面終止**：本專案已全面進入線上雲端生產階段，**嚴禁任何 AI 代理人再去搞 `file:///` 本地雙擊或本機開發邏輯**！
   - 🌐 **唯一合法雙公網入口**：所有功能測試、卡片製作與受眾播放，**100% 只會透過以下兩個公網網址進行操作與驗收**：
     1. 🍵 **Teaforia 官方站點**：`https://card.teaforia.in`（工坊 `workspace.html` 與受眾 `play.html`）
     2. 🏢 **Foxlink 官方站點**：`https://card.foxlink.co.in`（工坊 `workspace.html` 與受眾 `play.html`）

4. **👑 GAS 雲端 SSOT 絕對單一真理源與物理剷除本地參數常數鐵律 (Strict GAS SSOT & Zero-Local-Data Law)**：
   - **GAS 雲端資料庫（Google Sheet SSOT）為全系統唯一絕對單一真理源！**
   - ⛔ **本地假數據與常數全面剷除**：**絕對禁止在代碼中保留或硬編碼任何展示用卡片參數與模板參數**（如 `DEFAULT_TEMPLATES`、`DEFAULT_CARDS` 中的具體視覺特效與文字）！
   - ⛔ **嚴禁任何本地代碼覆蓋雲端**：所有卡片、模板之視覺特效、字級、仰角、音量、配樂與背景，**100% 必須由 GAS 雲端即時載入**！

5. **🎨 模板發布與雲端真值同步鐵律 (Cloud SSOT Sync)**：
   - 新增/修改模板後，必須強制推送至 Google Sheet 覆寫雲端 SSOT：
     1. 三維核驗：`py scripts/sync_templates.py verify`
     2. 雲端推送：`py scripts/sync_templates.py push`（覆寫 Google Sheet SSOT）
     3. 技能指引：完整工作流請參閱 `.agents/skills/cardforge_template_manager/SKILL.md`。

6. **☁️ Google Drive 雲端儲存與零內聯字串鐵律 (Cloud Storage Invariant)**：
   - 嚴禁把 SRT 字幕全文、音訊 Base64、巨型文字塞進卡片欄位（會炸飛 LocalStorage 5MB 與 Google Sheet 50,000 字元上限）。
   - 一律由 `gas/Card_Gateway.gs` 上傳至 Google Drive 專用資料夾，卡片僅保存短網址。

---

## 1. 系統現況與已固化基線 (System Baseline)

| 模組 / 元件 | 當前真實狀態 | 說明 |
| :--- | :--- | :--- |
| **分享導語去重與自由編輯** | ✅ 已修復固化 | [js/editor_views.js](file:///e:/Projects/greeting-card-music/js/editor_views.js) 移除強制前綴徽章，導語所見即所得；[js/workspace_views.js](file:///e:/Projects/greeting-card-music/js/workspace_views.js) 當導語不含 `{name}` 時尊重原創文字，不再強加重複稱謂。 |
| **卡片庫畫廊摘要 SSOT** | ✅ 已修復固化 | [js/workspace_views.js](file:///e:/Projects/greeting-card-music/js/workspace_views.js) 畫廊卡片方塊優先讀取 `c.shareCaption`，徹底解決視訊/字幕模板無段落時顯示幽靈硬編碼文字問題。 |
| **GAS 雲端 SSOT Description 直連** | ✅ 已修復固化 | [gas/Card_Gateway.gs](file:///e:/Projects/greeting-card-music/gas/Card_Gateway.gs) 儲存時將 `shareCaption` 同步至試算表 Description 欄位，`coverImage` 同步至 Image 欄位。 |
| **Worker 社交預覽放寬超時** | ✅ 已優化固化 | [cloudflare/worker_og_proxy.js](file:///e:/Projects/greeting-card-music/cloudflare/worker_og_proxy.js) 超時放寬至 4.5 秒並設定 `redirect: follow`，完整銜接 GAS 查詢。 |
| **網址格式與多媒體破快取** | ✅ 已修復固化 | 拔除 `/p/` 微信短路徑，採用標準 `/?id=...&to=...`，多媒體掛載版本號破快取。 |

---

## 2. 歷史翻車與深水區問題排查：為什麼 WhatsApp 預覽文字還是舊的/錯的？(Root Cause)

### 📌 使用者提出的最新痛點
使用者在 WhatsApp 看到兩個現象（如截圖所示）：
1. 綠色對話框頂部的**卡片預覽方塊**：
   - 上面那張卡顯示：「在特別時刻，為您獻上最真摯的祝福」
   - 下面那張卡顯示：「為您獻上一份充滿星空、音樂與真摯祝福的專屬多媒體賀卡」
   - **都不是使用者在編輯器輸入框填寫的那段字（`Happy Birthday, My Love, This is My Creations, hope you will like it!`）！**
2. 綠色對話框內部的**外帶導語文字**：
   - 上面顯示：`Dear My Love, Happy Birthday, My Love, This is My Creations, hope you will like it!`
   - 下面顯示：`My Love ，Happy Birthday, My Love, This is My Creations, hope you will like it!`
   - **名字被重複拼了兩次（`My Love` 出現了兩次）！**

### 🔍 根本原因精準定位（下一棒代理人必讀！）

#### 原因 A：WhatsApp 預覽框（OG Description）文字不對的病根
- **病根 1（靜態頁面未動態注入）**：
  GitHub Pages 是純靜態伺服器，[play.html](file:///e:/Projects/greeting-card-music/play.html) 裡的 `<meta property="og:description">` 是死文字。
- **病根 2（Cloudflare Worker 未部署或 DNS 未走 Worker）**：
  雖然本地檔案 [cloudflare/worker_og_proxy.js](file:///e:/Projects/greeting-card-music/cloudflare/worker_og_proxy.js) 已經修改了優先讀取 `card.shareCaption`，但**尚未部署到 Cloudflare 線上 Worker**，且網域的 DNS 如果是直連 GitHub Pages 而非通過 Worker 代理，WhatsApp 爬蟲就永遠抓不到動態的 OG 標籤。
- **病根 3（WhatsApp 爬蟲快取）**：
  WhatsApp 伺服器對已爬取過的 URL 會進行長達數天的快取，若 URL 未加版本參數，WhatsApp 不會重新造訪伺服器抓取最新預覽。

#### 原因 B：導語名字重複兩次的病根（`My Love` 重複）
- 在 [js/editor_views.js](file:///e:/Projects/greeting-card-music/js/editor_views.js#L869)：
  編輯器保存時執行了：`fullCaption = ${inheritedPrefix}${newBody}`（例如：`{name}，Happy Birthday, My Love...`，此時 `newBody` 裡使用者自己又寫了一次 `My Love`）。
- 到了 [js/workspace_views.js](file:///e:/Projects/greeting-card-music/js/workspace_views.js#L168-L174)：
  分發台在組裝 `fullShareMessage` 時，又把 `{name}` 取代成了 `saluteText`（例如 `My Love ，` 或 `Dear My Love, `）！
  👉 **兩者疊加，導致外帶訊息變成：`My Love ，Happy Birthday, My Love...`（名字重複出現兩次）！**

---

## 3. 下一棒代理人核心任務清單 (Next Agent Action Items)

1. **修復導語稱謂重複疊加 BUG**：
   - 審查 [js/editor_views.js](file:///e:/Projects/greeting-card-music/js/editor_views.js) 與 [js/workspace_views.js](file:///e:/Projects/greeting-card-music/js/workspace_views.js) 的稱謂拼接邏輯。
   - 確保 `{name}` 或前綴稱呼只在最開頭出現一次，若使用者的內容中已包含稱謂或不需要前綴，自動去重，杜絕 `My Love, ... My Love` 重複現象。

2. **徹底解決 WhatsApp 預覽方塊文字（OG 描述）**：
   - 確保卡片儲存至 GAS 雲端資料庫時，`description` 欄位同步寫入使用者填寫的 `shareCaption`（去除 `{name}` 標籤後的乾淨文字）。
   - 驗證或指引使用者將最新版 [cloudflare/worker_og_proxy.js](file:///e:/Projects/greeting-card-music/cloudflare/worker_og_proxy.js) 部署到 Cloudflare Worker，確保爬蟲能 100% 讀取到每張卡的自訂寄語。

3. **恪守專案鐵律**：
   - 嚴禁未經授權主動發起 `git push`！
   - 嚴禁重新引入 `/p/` 微信短網址！

---

## 4. 驗收啟動指令 (Verification Step)

請直接複製以下指令啟動下一棒 AI 代理人：

```markdown
請詳細閱讀專案根目錄下的 HANDOFF.md。請優先解決第 2 節所描述的兩個痛點：1. WhatsApp 分發訊息中稱謂重複出現兩次（如 My Love, Happy Birthday My Love...）的字串去重問題；2. 徹底確保卡片自定義寄語能正確寫入 GAS description 並由 Cloudflare Worker 正確吐給 WhatsApp 預覽方塊。
```
