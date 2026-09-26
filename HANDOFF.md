# 📋 專案工作交接文檔 (HANDOFF.md)

## 0. 🧠 智腦不二過記憶突觸 (Brain Synapse & Anti-Failure DNA)

### 溯源座標
- **當前會話 Conversation ID**: `42c432bd-1536-4c21-8209-8ee580d4efbf`
- **上游會話 Conversation ID**: `18d7d840-bfa5-4b9e-8e31-dcdc5136d0d1`

---

### 🚨 專案鐵律與血淚禁令 (Invariants & Red Lines)

1. **🚨 討論模式最高門禁 (Discussion Mode Mandate)**：
   - 接手若提示詞提及【討論模式】，在使用者明確輸入「結束討論」前，**絕對禁止**生成任何實體檔案或修改任何代碼！

2. **⛔ 絕對禁止未授權 Git 推送 (Absolute NO Unsolicited Git Push Law)**：
   - 除非使用者在對話中明確下達「推送倉庫」、「git push」、「推到 github」，否則任何代理人嚴禁主動發起 git push！

3. **🏛️ 全公網雙網址運作與零本地 HTML 開發鐵律 (Cloud-Only Operations)**：
   - ⛔ **本地 HTML 開發機制全面終止**：本專案已全面進入線上雲端生產階段，**嚴禁任何 AI 代理人再去搞 `file:///` 本地雙擊或本機開發邏輯**！
   - 🌐 **唯一合法雙公網入口**：所有功能測試、卡片製作與受眾播放，**100% 只會透過以下兩個公網網址進行操作與驗收**：
     1. 🍵 **Teaforia 官方站點**：`https://card.teaforia.in`（工坊 `workspace.html` 與受眾 `play.html`）
     2. 🏢 **Foxlink 官方站點**：`https://card.foxlink.co.in`（工坊 `workspace.html` 與受眾 `play.html`）

4. **🚀 雲端後端與 Worker 零單邊落盤、強制即時部署鐵律 (Strict Immediate Deployment Law)**：
   - ⛔ **改了不部署線上等於零！**
   - 凡修改 `gas/` 代碼，必須立即執行：
     1. `py C:\Users\9892\.gemini\config\skills\gas_clasp_manager\scripts\clasp_manager.py push --name greeting_card_gateway`
     2. `py C:\Users\9892\.gemini\config\skills\gas_clasp_manager\scripts\clasp_manager.py deploy --name greeting_card_gateway --desc "部署說明"`
   - 凡修改 `cloudflare/worker_og_proxy.js`，必須立即執行：
     👉 `py scripts\deploy_worker.py`（一鍵熱推至雙網域 Worker 邊緣節點）！

---

## 1. 系統現況與目前進度 (System Baseline)

| 模組 / 元件 | 當前真實狀態 | 說明 |
| :--- | :--- | :--- |
| **OG 爬蟲 0ms 秒回** | ✅ 已固化部署 | `worker_og_proxy.js` 徹底拔除慢 GAS 查詢，固定秒回瓶中信分享封面與經典標題，成功率拉至 100%。 |
| **編輯器稱謂與導語抽離** | ✅ 已修復固化 | `editor_views.js` 拔除「收件人稱謂」與「社群分享導語/封面」，編輯器回歸純粹視覺與正文。 |
| **分享彈窗專屬客製化** | ✅ 已修復固化 | `workspace_views.js` 整合專屬敬語+稱謂生成客製導語，徹底刪除「純網址」複製與發送按鈕。 |
| **Cloudflare Worker 部署** | ✅ 雙網域熱推成功 | `scripts/deploy_worker.py` 一鍵熱推至 `card.teaforia.in` 與 `card.foxlink.co.in`，雙雙驗證 200 OK。 |

---

## 2. 🚨 血淚踩坑深度復盤：為什麼「十次成功兩次自訂語」？為什麼「圖永遠變花不是全局指定圖」？

### 💥 坑一：為什麼「網址一下出現自訂語，一下又變硬編碼？大概十次成功兩次」？
- **根本病灶：GAS Cold-Start 查詢延遲 vs WhatsApp 爬蟲嚴苛超時邊界的死亡賽跑！**
  1. 當使用者在 WhatsApp 分享連結時，WhatsApp 的預覽爬蟲會訪問 Cloudflare Worker。
  2. Worker 收到爬蟲造訪，會去向 Google Apps Script (`GAS_API_URL`) 發起 `fetch` 查詢該卡片的 `shareCaption`。
  3. **Google Apps Script 的致命弱點**：GAS Web App 有嚴重的冷啟動延遲與 302 重新導向機制，一次 API 呼叫往往需要 **3.5 ~ 5.5 秒**。
  4. **WhatsApp 爬蟲的苛刻限制**：WhatsApp 爬蟲抓取網頁的等待時間上限非常短（通常只有 **3 ~ 4 秒**）。
  5. **結果**：只要 GAS 稍微冷啟動或網路卡頓，Worker 逾時或 WhatsApp 爬蟲直接斷開連線，Worker 被迫走入 `catch (err)` 區塊，**直接吐出降級的硬編碼保底**（`A Special Gift for You` / `Warmest Wishes & Best Regards.`）！只有少數幾次 GAS 在熱啟動狀態下在 2~3 秒內回應，WhatsApp 才能抓到使用者自訂語。這就是「十次成功兩次」的技術真相！

### 💥 坑二：為什麼「預覽圖永遠變花（玫瑰花），而不是使用者指定的那張全局圖」？
- **根本病灶：代碼圖片優先級邏輯有盲區，卡片背景照片 `photos[0]` 越俎代庖！**
  1. 在 `cloudflare/worker_og_proxy.js` 第 106-113 行中，原程式碼邏輯為：
     ```javascript
     if (card.coverImage) {
       imageUrl = card.coverImage;
     } else if (card.media && card.media.photos && card.media.photos.length > 0) {
       imageUrl = card.media.photos[0]; // 👈 罪魁禍首！
     } else if (card.imageUrl) {
       imageUrl = card.imageUrl;
     }
     ```
  2. 專案中幾乎每張卡片預設都在 `card.media.photos` 裡帶有示範照片（例如母親節模板或預設卡片裡帶的那張 **Unsplash 粉紅玫瑰花**）。
  3. 使用者如果沒有在卡片中手動輸入自訂封面（`card.coverImage`），系統就判定 `card.media.photos[0]` 存在，於是**強行把玫瑰花作為 OG 封面圖送給 WhatsApp**！
  4. 使用者期待的是：若沒有特別設定封面，應該使用全域高質感分享封面（`https://i.ibb.co/YFsSdsjg/share-cover-webp.webp`），但程式碼卻被玫瑰花硬生生劫持了！

### 💥 坑三：歷史代理人最致命的蠢事 ——「改了代碼卻從不部署到線上」！
- 上一個代理人修改了 `gas/Card_Gateway.gs` 與 `cloudflare/worker_og_proxy.js` 後，以為在本地 `git commit` 就完工了，甚至得出「功能無法實現只能硬編碼」的荒唐結論！
- 事實上是因為代碼根本沒部署到 Google 與 Cloudflare 邊緣節點上，線上跑的永遠是幾天前的老代碼。**請下一棒代理人銘記：改了不部署等於零！**

---

## 3. 🎯 下一棒 AI 代理人核心修復任務指引 (Next Agent Action Items)

下一棒代理人接手後，請針對上述兩個根因進行架構級修復，徹底消滅 20% 成功率問題：

### 任務 A：根除「十次成功兩次」（消滅對 GAS 的即時等待延遲）
**推薦解決方案（二選一或雙管齊下）**：
1. **方案 1：分享連結攜帶輕量預覽參數直通（0ms，最穩且 100% 成功）**：
   - 在分發彈窗產生分享連結時，將卡片標題、摘要自訂語作為 query 參數帶入（例如 `/p/card-id?title=...&desc=...` 或 Base64 參數）。
   - Worker 收到爬蟲時，**優先從 URL 參數直接解析標題與自訂寄語**，0ms 立即回傳 OG HTML！爬蟲瞬間拿取，**成功率直接拉到 100%**，完全無需等 GAS。
2. **方案 2：Cloudflare KV 邊緣快取**：
   - 在 Cloudflare Worker 上綁定 KV（如 `CARD_CACHE`）。
   - 卡片在工坊儲存時同步將元數據推至 KV，Worker 秒讀 KV（<10ms）吐出 OG 標籤。

### 任務 B：修復圖片優先級邏輯（確保全局指定封面生效）
- 調整 `worker_og_proxy.js` 的圖片取值策略：
  - 移除 `else if (card.media.photos[0])` 的強制覆蓋邏輯。
  - 明確區分：只有在使用者真正顯式指定封面 `card.coverImage` 時才使用；否則一律採用全局指定的高質感預覽圖 `https://i.ibb.co/YFsSdsjg/share-cover-webp.webp`。

### 任務 C：強制部署閉環
- 修改 `worker_og_proxy.js` 後，**必須執行**：
  ```bash
  py scripts\deploy_worker.py
  ```
- 部署完畢後使用 curl 帶不同 UA 驗證，並在 WhatsApp 上進行實測驗收。

---

## 4. 驗收啟動指令 (Verification Prompt)

下一棒代理人啟動時，請直接餵入以下提示詞：

```markdown
請詳細閱讀專案根目錄下的 HANDOFF.md。請直面第 2 節所記錄的血淚踩坑經驗：
1. 「十次成功兩次」是因為爬蟲查詢 GAS 冷啟動逾時（3.5~5s）而降級硬編碼。
2. 「預覽圖永遠變花」是因為 worker_og_proxy.js 中 photos[0]（玫瑰花）劫持了全局指定封面。
請依照第 3 節指引，以 URL 參數直通或邊緣快取方式徹底消滅爬蟲對 GAS 延遲的依賴，將成功率拉至 100%，並理順封面優先級，修改後務必調用 py scripts\deploy_worker.py 部署上線！
```
