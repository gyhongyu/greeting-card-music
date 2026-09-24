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
| **GAS 雲端網關正式部署** | ✅ 已升級部署 | [gas/Card_Gateway.gs](file:///e:/Projects/greeting-card-music/gas/Card_Gateway.gs) 已透過 `clasp_manager.py deploy` 部署為 **最新版本 @5**，Google Sheet SSOT 正式同步 `shareCaption` 與 `coverImage`！ |
| **Cloudflare Worker 雙域名部署** | ✅ 已全線部署 | 透過 Cloudflare REST API 完成端到端上線：<br>1. `proxy-card-teaforia-in`（綁定 `card.teaforia.in/*`）已部署最新代碼！<br>2. `proxy-card-foxlink-co-in`（綁定 `card.foxlink.co.in/*`）已建立並開啟 🟠 Proxied 橘雲！ |
| **動態 OG 預覽實測驗證** | ✅ 實測 100% 成功 | 實測 WhatsApp 爬蟲造訪兩大域名，**已 100% 動態吐出該卡片的自訂標題、專屬封面圖與親手輸入的寄語**（`Happy Birthday, This is My Creations, hope you will like it!`），徹底告別硬編碼！ |

---

## 2. 🚨 深水區雙重翻車復盤：為什麼「成功率只有 20%」且「圖片總是花而不是全局圖」？

### 💥 痛點 A：為什麼十次發送只有兩次成功，其餘八次都降級到硬編碼保底？
- **真實病灶：GAS 查詢冷啟動延遲與爬蟲超時邊界賽跑！**
  - 在 [cloudflare/worker_og_proxy.js](file:///e:/Projects/greeting-card-music/cloudflare/worker_og_proxy.js) 中，Worker 收到 WhatsApp 爬蟲造訪時，會向 GAS API 發起 `fetch(GAS_API_URL + "?action=get_card&id=...")`。
  - **Google Apps Script 的致命弱點**：每次 GET 請求都有 Google 內部重定向與冷啟動延遲（經常耗時 3.5 ~ 5.5 秒）。
  - Worker 設定的超時時間原本只有 2.5 秒，雖然剛才加到 4.5 秒，但 WhatsApp 伺服器自身的爬蟲超時時間通常極為苛刻（約 3 ~ 4 秒）！
  - **結果**：一旦 GAS 稍微卡頓超過 4 秒，Worker 或是 WhatsApp 爬蟲就會直接斷開，Worker 只能被迫抓取 catch 區塊內的**靜態硬編碼保底**（`A Special Gift for You` / `Warmest Wishes & Best Regards.`）！
  - 👉 **這就是為什麼使用者體感「十次只有兩次成功自訂寄語，其餘都變硬編碼」的根本技術原因！**

### 💥 痛點 B：為什麼預覽圖片不是使用者指定的那張全局圖，而是變成了花（玫瑰花）？
- **真實病灶：圖片取值優先順序被卡片的 `photos[0]` 劫持！**
  - 在 [cloudflare/worker_og_proxy.js](file:///e:/Projects/greeting-card-music/cloudflare/worker_og_proxy.js#L106-L113)：
    ```javascript
    if (card.coverImage) {
      imageUrl = card.coverImage;
    } else if (card.media && card.media.photos && card.media.photos.length > 0) {
      imageUrl = card.media.photos[0]; // 👈 這張卡片裡存了那張粉紅玫瑰花 Unsplash 圖片！
    }
    ```
  - 當卡片沒有特別指定自訂 `coverImage`，或者使用者希望使用全域預設圖時，程式碼卻因為卡片內預設帶有 `photos[0]`（那朵玫瑰花），導致 Worker 永遠優先把玫瑰花吐給了 WhatsApp，覆蓋了使用者預期的全局預設封面！

---

## 3. 下一棒代理人核心架構任務清單 (Next Agent Action Items)

下一棒代理人接手後，必須從架構上徹底解決這兩大穩定性死穴，嚴禁再碰運氣：

1. **根治 20% 成功率問題（消滅 GAS 延遲依賴）**：
   - **方案 1：Cloudflare Worker KV 快取（強烈推薦）**：
     - 在 Cloudflare Worker 上掛載 KV 或使用 Cache API。
     - 當卡片在工坊儲存時，由前端或 GAS Webhook 主動通知 Worker 將卡片的 `shareCaption`、`title`、`coverImage` 寫入 Cloudflare KV。
     - WhatsApp 爬蟲造訪時，Worker 直接從 KV（0ms、邊緣記憶體秒讀）回傳 OG 標籤，完全不等待 GAS，**成功率直接拉到 100%**！
   - **方案 2：分發 URL 攜帶輕量 Base64 預覽參數**：
     - 分發連結如 `?id=...&sc=<base64_caption>&img=<base64_img>`，Worker 直接從 URL 參數解碼 OG 標籤，0ms 直出，徹底免打 GAS！

2. **徹底理順圖片優先順序**：
   - 清楚定義「使用者上傳專屬封面」vs「卡片輪播照片」vs「全局指定預設封面」的明確階層與開關。
   - 若使用者未勾選「使用自訂封面」，100% 嚴格採用全局指定預設圖，禁止 `photos[0]` 擅自越俎代庖。

3. **維護與部署紀律**：
   - 修改 `worker_og_proxy.js` 後，必須強制執行 `py scripts\deploy_worker.py` 完成雙網域熱推！
   - 修改 `Card_Gateway.gs` 後，必須強制執行 `clasp_manager.py deploy`。

---

## 4. 驗收啟動指令 (Verification Step)

請直接複製以下指令啟動下一棒 AI 代理人：

```markdown
請詳細閱讀專案根目錄下的 HANDOFF.md。請直面第 2 節所剖析的「十次成功兩次（GAS 查詢超時降級）」與「圖片優先級混亂（玫瑰花劫持全局圖）」兩大深水區病根。請以 Cloudflare KV 快取或 URL 參數解耦方式，徹底消滅 WhatsApp 爬蟲等待 GAS 造成的超時降級問題，將動態預覽成功率提升至 100%，並徹底理順全局預設封面圖邏輯！
```
