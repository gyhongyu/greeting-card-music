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

## 2. 🚨 歷史翻車覆盤與技術閉環 (Technical Root-Cause & Fix)

### 💥 翻車事故根因（深刻反省）
代理人在本地修改了 `Card_Gateway.gs` 與 `worker_og_proxy.js`，**卻完全沒有部署到雲端線上！**
線上跑的依舊是老舊的 GAS 與未代理的 DNS，導致 WhatsApp 爬蟲只能抓到舊數據，代理人竟然誤判為「功能無法實現、只能靠硬編碼保底」，實屬一級低級翻車事故！

### 🛠️ 最終解決閉環
1. **GAS 網關部署 (@5)**：Google Sheet 資料庫已原生支持 `shareCaption` 存入 Description 欄位。
2. **Cloudflare Worker 雙網域即時熱更新**：
   - 使用 `cloudflare_gateway.py` API 將最新 `worker_og_proxy.js` 直接上傳至 Cloudflare 邊緣節點。
   - `card.foxlink.co.in` 開啟橘雲 (Proxied) 並掛載 Worker 路由。
3. **實機 curl 爬蟲驗證成功**：
   ```html
   <meta property="og:title" content="Happy Birthday">
   <meta property="og:description" content="Happy Birthday, This is My Creations, hope you will like it!">
   <meta property="og:image" content="https://images.unsplash.com/photo-1518895949257-7621c3c786d7...">
   ```
   **雙網域均已完美實現真正的動態自訂卡片寄語代入！**

---

## 3. 下一棒代理人驗收與日常維護清單 (Next Agent Checklist)

1. **零硬編碼維護**：
   - 系統已具備完美的動態寄語與動態封面注入能力，嚴禁再以「功能做不到」為由往代碼裡塞靜態死文字！
2. **遵守第 9 條鐵律 (即時部署律)**：
   - 未來凡修改 `gas/`，必須立即跑：
     `py C:\Users\9892\.gemini\config\skills\gas_clasp_manager\scripts\clasp_manager.py push --name greeting_card_gateway`
     `py C:\Users\9892\.gemini\config\skills\gas_clasp_manager\scripts\clasp_manager.py deploy --name greeting_card_gateway --desc "部署說明"`
   - 未來凡修改 `worker_og_proxy.js`，必須立即跑專案一鍵熱推指令：
     👉 `py scripts\deploy_worker.py`（自動同步部署至 `card.teaforia.in` 與 `card.foxlink.co.in` 並校驗橘雲）！

---

## 4. 驗收啟動指令 (Verification Step)

請直接複製以下指令啟動下一棒 AI 代理人：

```markdown
請詳細閱讀專案根目錄下的 HANDOFF.md。GAS @5 與 Cloudflare 雙域名 Worker 均已全面部署上線並通過實測驗證，動態 OG 預覽已 100% 成功運作。請在此基礎上進行後續新功能迭代，並嚴格恪守 AGENTS.md 第 9 條即時部署鐵律！
```
