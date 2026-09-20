# 📋 專案工作交接文檔 (HANDOFF.md)
> ⚠️ **【單一真理源 (SSOT) 紀律】**：全專案唯一正式交接合約。禁止生成其他影子交接檔案。  
> 最後更新時間：2026-09-20 | 當前版本：v2.0 (Cloud & Edge Architecture) | 當前模式：🛠️ 【研發/工程開發模式 (Development)】

---

## 0. 🧠 智腦不二過記憶突觸 (Brain Synapse & Anti-Failure DNA)

- **交接突觸資訊**：
  - 當前會話 ID (Current Conversation ID): `69349538-ea66-43fa-a3bc-aec4814aaf2e`
  - 前序會話 ID (Preceding Conversation ID): `40bb5e15-6b98-4093-afc2-8b55b493da15`
- **不可違背之死因卷宗與血淚紅線 (Hard Anti-Failure DNA)**：
  1. 🚨 **畫廊優先鐵律 (Gallery-First Invariant)**：
     - 首頁 `workspace.html` 必須永久保持「大畫廊看板 (Cards Gallery / Templates Gallery)」，絕不可默認強行進入編輯模式！
     - 點擊「編輯卡片」進入編輯器後，頂部必須維持醒目的 `[← 返回卡片庫]` 導覽。
  2. 🚨 **免 Git Commit 雲端持久化 (Cloud SSOT Invariant)**：
     - 數值改動直接透過 `js/gas_client.js` 同步至 Google Sheet，不再為內容變更頻繁發起 Git Commit。
  3. 🚨 **絕對禁止未授權 Git 推送鐵律**：
     - 嚴禁主動發起 `git push`！除非使用者在對話中明確下達「推送倉庫」、「git push」。
  4. 🚨 **嚴禁終端命令內嵌代碼落盤鐵律**：
     - 禁止在終端機中用 `py -c`、`echo`、`node -e` 拼接代碼生成實體檔案，所有檔案操作必須調用專屬工具。
  5. 🚨 **思考方法論**：
     - 強制執行「Pre-mortem 屍前驗屍 ✕ 第十人反對法則」。

---

## 1. 系統現況與已固化基線 (System Baseline v2.0)

1. **產品需求規格已固化**：
   - `docs/PRD.md`：定義完整系統願景、Google Sheet 資料欄位、GAS API、Cloudflare Worker 邊緣預覽代理規格。
2. **目錄大掃除與資源規範化完成**：
   - 歷史廢代碼 100% 清除（已刪除 `app.js`、`components/` 與 `docs/archive/`）。
   - 音訊多媒體已規範收納於 `assets/audio/In Love With You.mp3`。
3. **工作台模組化分拆完成**：
   - `workspace.html` 瘦身至 38 行純淨骨架，樣式抽離至 `css/workspace.css`，業務邏輯抽離至 `js/workspace.js`。
   - 具備「☁️ 發布至雲端 (免 Commit)」按鈕與社交短網址複製彈窗。
4. **雲端持久化與邊緣預覽代碼已就緒**：
   - `gas/Card_Gateway.gs`：Google Apps Script 萬能網關。
   - `cloudflare/worker_og_proxy.js`：邊緣社交爬蟲 Open Graph 動態預覽注入代理。
   - `js/gas_client.js`：具備 SWR 本地快取秒開與超時容錯。
5. **受眾端播放器升級**：
   - `index.html`：支援 `?id=` 參數、SWR 本地秒開與 `data/cards.json` 降級防崩潰保底。
6. **研發知識庫治理**：
   - `docs/STATE.md`（88 行，嚴格 ≤200 行）。
   - `docs/ACTIVE_LOG.md`（原子日誌單向追加）。

---

## 2. 部署與運行指引 (Deployment & Operations)

### A. Google Apps Script 雲端資料庫設定
1. 在 Google Drive 新建 Google Sheet，命名為 `CardForge_DB`。
2. 進入「擴充功能」->「Apps Script」，將 [gas/Card_Gateway.gs](file:///e:/Projects/greeting-card-music/gas/Card_Gateway.gs) 內容貼上。
3. 發布為 Web App（誰可以存取：任何人），取得 URL。
4. 將 URL 填入 [js/config.js](file:///e:/Projects/greeting-card-music/js/config.js) 的 `GAS_API_URL`。

### B. Cloudflare Worker 社交預覽設定
1. 在 Cloudflare Dashboard 建立一個 Worker，貼入 [cloudflare/worker_og_proxy.js](file:///e:/Projects/greeting-card-music/cloudflare/worker_og_proxy.js)。
2. 在 Custom Domains 綁定 `card.foxlink.co.in`，即刻享有 LINE / FB / WhatsApp 動態卡片預覽。

---

## 3. 驗收啟動指令 (Verification Step)

新代理人接手後，可直接透過本機瀏覽器開啟 `workspace.html` 驗收大畫廊與編輯器，或開啟 `index.html` 驗收沉浸式音樂播放。
