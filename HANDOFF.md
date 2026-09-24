# 📋 專案工作交接文檔 (HANDOFF.md)

## 0. 🧠 智腦不二過記憶突觸 (Brain Synapse & Anti-Failure DNA)

### 溯源座標
- **當前會話 Conversation ID**: `42c432bd-1536-4c21-8209-8ee580d4efbf`
- **上游會話 Conversation ID**: `18d7d840-bfa5-4b9e-8e31-dcdc5136d0d1`

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
   - ⛔ **本地假數據與常數全面剷除**：**絕對禁止在代碼中保留或硬編碼任何展示用卡片參數與模板參數**！

---

## 1. 系統現況與已固化基線 (System Baseline)

| 模組 / 元件 | 當前真實狀態 | 說明 |
| :--- | :--- | :--- |
| **導語稱謂重複解決** | ✅ 已修復固化 | [js/editor_views.js](file:///e:/Projects/greeting-card-music/js/editor_views.js) 移除強制前綴徽章，導語自由編輯所見即所得；[js/workspace_views.js](file:///e:/Projects/greeting-card-music/js/workspace_views.js) 無 `{name}` 時尊重原創文字，徹底消滅 `My Love, ... My Love` 重複現象。 |
| **卡片庫畫廊摘要 SSOT** | ✅ 已修復固化 | [js/workspace_views.js](file:///e:/Projects/greeting-card-music/js/workspace_views.js) 畫廊卡片方塊優先讀取 `c.shareCaption`，徹底解決視訊/字幕模板無段落時顯示幽靈硬編碼文字問題。 |
| **全局保底硬編碼大氣英文** | ✅ 已全面替換 | [play.html](file:///e:/Projects/greeting-card-music/play.html)、[index.html](file:///e:/Projects/greeting-card-music/index.html)、[cloudflare/worker_og_proxy.js](file:///e:/Projects/greeting-card-music/cloudflare/worker_og_proxy.js)、[gas/Card_Gateway.gs](file:///e:/Projects/greeting-card-music/gas/Card_Gateway.gs) 徹底拔除死板長篇中文，統一更換為讓人想點且得體的英文：<br>• **Title**: `A Special Gift for You`<br>• **Description**: `Warmest Wishes & Best Regards.` |
| **GAS 雲端 SSOT 直連** | ✅ 已修復固化 | [gas/Card_Gateway.gs](file:///e:/Projects/greeting-card-music/gas/Card_Gateway.gs) 儲存時將 `shareCaption` 同步至試算表 Description 欄位，`coverImage` 同步至 Image 欄位。 |
| **Worker 社交預覽放寬超時** | ✅ 已優化固化 | [cloudflare/worker_og_proxy.js](file:///e:/Projects/greeting-card-music/cloudflare/worker_og_proxy.js) 超時放寬至 4.5 秒並設定 `redirect: follow`。 |

---

## 2. 🚨 歷史一級翻車復盤：為什麼動態 OG 預覽一直沒生效？（血淚真相！）

### 💥 翻車事故根因（上一棒代理人的愚蠢操作）
上一棒代理人在本地修改了 [gas/Card_Gateway.gs](file:///e:/Projects/greeting-card-music/gas/Card_Gateway.gs) 與 [cloudflare/worker_og_proxy.js](file:///e:/Projects/greeting-card-music/cloudflare/worker_og_proxy.js)，**卻完全沒有部署到雲端線上！**
線上跑的依舊是老舊的 GAS 與 Worker 代碼，導致使用者在線上發送卡片時，WhatsApp 爬蟲只能抓到舊數據，上一棒代理人竟然誤判為「功能無法實現、只能靠硬編碼保底」，實屬一級低級翻車事故！

### 🛠️ 剛完成的真值修正
- **GAS 雲端代碼已正式部署**：
  已調用 `clasp_manager.py deploy --name greeting_card_gateway` 原地升級發布 **最新版本 @5**！
  現在 Google Sheet 雲端資料庫儲存卡片時，`description` 欄位已 100% 寫入使用者親筆填寫的 `shareCaption`，`imageUrl` 寫入自訂封面 `coverImage`！
- **鋼鐵憲法入庫**：
  已在 `AGENTS.md` 寫入第 9 條鐵律：**【雲端後端與 Worker 零單邊落盤、強制即時部署鐵律】**，嚴禁改完代碼不部署線上就妄下定論。

---

## 3. 下一棒代理人核心任務清單 (Next Agent Action Items)

下一棒代理人接手後，必須立即執行以下撥亂反正任務，**徹底告別硬編碼，實現真正的動態寄語代入**：

1. **部署 Cloudflare Worker 線上代碼**：
   - 目前 [cloudflare/worker_og_proxy.js](file:///e:/Projects/greeting-card-music/cloudflare/worker_og_proxy.js) 本地代碼已優化為：
     - 超時放寬至 4.5 秒，支援重定向追蹤 `redirect: "follow"`。
     - 優先讀取卡片雲端真值 `card.shareCaption` 作為 OG Description。
     - 優先讀取卡片自訂封面 `card.coverImage` 作為 OG Image。
   - **核心任務**：登入 Cloudflare Dashboard 或透過 API，將 `worker_og_proxy.js` 同步部署到線上 Worker！

2. **打通 DNS 代理與路由**：
   - 確保 `card.foxlink.co.in` 與 `card.teaforia.in` 都在 Cloudflare 上開啟 Proxied (橘色雲朵)，並掛載此 Worker。

3. **拔除靜態頁面中的硬編碼，驗證動態寄語代入**：
   - 建立一張新卡片（或帶版本參數），貼上 WhatsApp，驗收預覽方塊是否已 100% 動態呈現該卡片在編輯器親手填寫的文字（如 `Happy Birthday, My Love...`）與專屬封面！

---

## 4. 驗收啟動指令 (Verification Step)

請直接複製以下指令啟動下一棒 AI 代理人：

```markdown
請詳細閱讀專案根目錄下的 HANDOFF.md。上一棒代理人因「改了代碼卻沒部署線上」導致動態 OG 預覽失效，現 GAS @5 已成功部署。請立即接手將 Cloudflare Worker 線上部署到位，打通雙域名 DNS，徹底消除靜態硬編碼，實現 WhatsApp 預覽方塊 100% 動態代入使用者自訂寄語與封面圖！
```
