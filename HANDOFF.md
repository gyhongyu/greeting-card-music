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

## 2. 🚨 深水區核心課題：為什麼線上動態 OG 預覽「看似永遠無法實現、只能靠硬編碼保底」？

使用者在實機測試中發現：在 WhatsApp 分發卡片連結時，上方彈出的卡片預覽方塊（OG 預覽）**吃不到使用者在該張卡片親筆寫的自訂寄語**，退而求其次只能靠全局靜態硬編碼（`A Special Gift for You` / `Warmest Wishes & Best Regards.`）。

### 🔍 根本技術成因深度透視（下一棒代理人必讀！）

1. **雙公網域名分流架構不一致 (DNS 脫節)**：
   - 實測發現：`card.teaforia.in` 的 Server Header 是 `cloudflare`，但 **`card.foxlink.co.in` 的 Server Header 是 `GitHub.com`**！
   - 這意味著：當使用者分享 `https://card.foxlink.co.in/?id=...` 時，請求根本沒有經過 Cloudflare Worker！WhatsApp 爬蟲直接造訪 GitHub Pages 靜態伺服器，因此 100% 只能讀到 `index.html` 或 `play.html` 裡面寫死的硬編碼！
   
2. **WhatsApp 爬蟲頑固快取機制 (Crawler Aggressive Caching)**：
   - WhatsApp 伺服器對已抓取過的 URL（例如 `https://card.foxlink.co.in/?id=c_mufqw20j&to=MyLove`）具有極強烈的伺服器端快取（可能長達 7~14 天）。
   - 即使伺服器代碼更新了，只要 URL 完全相同，WhatsApp 根本不會重新發起 HTTP 請求抓取最新 HTML，而是直接回放它第一次快取的死文字。

3. **Cloudflare Worker 部署狀態與 GAS 查詢冷啟動延遲**：
   - 雖然本機有 [cloudflare/worker_og_proxy.js](file:///e:/Projects/greeting-card-music/cloudflare/worker_og_proxy.js)，但線上 Cloudflare Dashboard 上的 Worker 是否有及時同步更新？
   - Google Apps Script (GAS) 在收到 GET 請求時，往往有 2~3.5 秒的冷啟動與 302 重定向延遲。若 WhatsApp 爬蟲的等待超時時間過短（通常 2~3 秒），Worker 來不及拿到 GAS 返回的 JSON，就會在超時下自動觸發 fallback，退回保底的硬編碼！

---

## 3. 下一棒代理人核心任務清單 (Next Agent Action Items)

下一棒代理人接手後，必須專注攻堅以下三個物理環節，徹底排查並解決「動態卡片預覽」問題：

1. **核實並統一 Cloudflare DNS 路由**：
   - 檢查 `card.foxlink.co.in` 為什麼走 GitHub.com 而非 Cloudflare。
   - 確保兩個官方域名（`card.teaforia.in` 與 `card.foxlink.co.in`）的 DNS 代理狀態均為 Proxied (橘色雲朵)，並在 Cloudflare Dashboard 將 Worker 正確綁定為 Custom Domain 或 Worker Route。

2. **驗證 Cloudflare Worker 線上代碼是否與本地同步**：
   - 將最新版 [cloudflare/worker_og_proxy.js](file:///e:/Projects/greeting-card-music/cloudflare/worker_og_proxy.js) 的代碼部署至線上 Worker。
   - 使用 `curl -s -A "WhatsApp/2.23.20.0" "https://card.teaforia.in/?id=..."` 實時比對輸出的 HTML 中 `<meta property="og:description">` 是否正確動態吐出該卡片的 `shareCaption`。

3. **破除 WhatsApp 爬蟲快取驗收法**：
   - 建立一張全新卡片（產生全新的 `id`），或在分享 URL 後方加入時間戳或版本參數（例如 `&v=1` 或 `&t=...`），迫使 WhatsApp 伺服器發起全新爬取，以檢驗動態 OG 注入是否真正生效。

---

## 4. 驗收啟動指令 (Verification Step)

請直接複製以下指令啟動下一棒 AI 代理人：

```markdown
請詳細閱讀專案根目錄下的 HANDOFF.md。請深入第 2 節所描述的深水區成因，徹底排查為什麼動態 OG 預覽在線上會 fallback 回硬編碼。請核驗 Cloudflare Worker 線上部署狀態、DNS 代理、以及 GAS 查詢延遲，確保新卡片在 WhatsApp 貼上連結時，預覽方塊能真正動態顯示該卡片的自訂標題、自訂封面圖與自訂寄語。
```
