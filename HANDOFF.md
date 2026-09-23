# 📋 專案工作交接文檔 (HANDOFF.md)
> 上游會話 ID: `6b09d7ed-3838-4c71-9f85-7b57517cd856`  
> 建立時間：2026-09-24  
> 任務類型：`DEBUG` | `HOTFIX` | `CLOUD_SYNC`

---

## 0. 🧠 智腦不二過記憶突觸 (Brain Synapse & Anti-Failure DNA)

### ⛔ 鋼鐵血淚紅線 (Hard Invariants)
- ⛔ **嚴禁未授權 `git push`**：除非使用者在對話中明確下達「推送倉庫」、「git push」等指示，否則任何代理人嚴禁發起 push！
- ⛔ **🚨 測試邊界鐵律**：**嚴禁 AI 代理人自行開啟瀏覽器（`browser_subagent`）測試**，全權由使用者手動執行。
- ⛔ **外部純 JS 零 JSX 鐵律**：外部 `.js` 一律使用原生 `React.createElement` (`h`)，絕對嚴禁出現 `<Tag>` JSX 標籤，保證 `file:///` 本地雙擊秒開。
- ⛔ **行數硬門禁**：`workspace.html` 保持純粹路由調度，**總行數嚴格 ≤ 450 行**！
- ⛔ **嚴禁終端命令內嵌代碼落盤**：嚴禁在終端機使用 `echo "..." > file` 或拼接代碼生成實體檔案，檔案操作必須調用專屬工具。
- ⛔ **接手討論模式門禁**：提示詞若提及【討論模式】，在使用者輸入「結束討論」前，絕對禁止修改代碼或落盤實體檔案！

---

## 1. 系統現況與已固化基線 (System Baseline)

| 檔案 | 職責 | 語法規範 |
|---|---|---|
| `workspace.html` | 創作者大畫廊工坊（當前 437 行，≤ 450 行） | React 18, Babel (內聯 JSX) |
| `index.html` | 受眾端 3D 播放器（全域短網址入口） | React 18, Three.js (內聯 JSX) |
| `js/workspace_views.js` | 畫廊、導覽列、CloudShareModal 分發彈窗 | 純 JS (`React.createElement`，零 JSX) |
| `js/editor_views.js` | 卡片編輯器 (`CardEditorView`) + 模板工坊 | 純 JS (`React.createElement`，零 JSX) |
| `js/workspace_store.js` | 本地與雲端資料持久化單一真理源 | 純 JS |
| `js/config.js` | 全域前端設定檔 (GAS 端點、雙域名清單) | 純 JS |
| `js/gas_client.js` | Google Sheet SSOT 儲存客戶端 | 純 JS (Fetch API) |
| `gas/Card_Gateway.gs` | Google Apps Script 雲端持久化網關代碼 | Google Apps Script |

---

## 2. 🚨 翻車故障深度剖析 (Death Certificate / Bug Breakdown)

使用者在本地卡片編輯器點擊頂部 **「☁️ 發布至雲端 (免 Commit)」** 按鈕時，畫面瞬間變成全黑屏！
DevTools Console 揭露了兩大致死性致命錯誤（已截圖鎖定）：

### 致命錯誤 1：變數作用域漏定義引發 React 崩潰白屏
- **報錯訊息**：`ReferenceError: card is not defined at CloudShareModal (workspace_views.js:83:13)`
- **根本原因 (Root Cause)**：
  - 在上一輪為 `CloudShareModal` 增加「雙域名切換（`selectedDomain`）」功能時，在 `js/workspace_views.js` 的 `CloudShareModal` 開頭重構了狀態，但在第 77 行 `defaultDetectedPrefix` 使用了 `card.recipient`，然而 `const card = shareModal.card || {};` 這行變數宣告在重構時被意外遺漏在下方！
  - 導致組件渲染瞬間拋出未捕獲的 `ReferenceError: card is not defined`，引發 React 頂層 ErrorBoundary 崩潰，整頁 DOM 被卸載，直接變成黑屏！
- **修復方案**：
  - 在 `js/workspace_views.js` 的 `CloudShareModal` 開頭，第一行立即宣告：
    ```javascript
    const card = shareModal.card || {};
    const baseShareUrl = shareModal.shareUrl || '';
    ```

### 致命錯誤 2：GAS 雲端網關報 Unknown action: save_card
- **報錯訊息**：`[GasClient.saveCard] Error: Error: Unknown action: save_card at gas_client.js:70`
- **根本原因 (Root Cause)**：
  - `gas_client.js` 送往 Google Apps Script 網關的 POST Payload 為：
    ```json
    { "action": "save_card", "card": { ... } }
    ```
  - 但 Google Apps Script 線上已發布部署的 Web App 版本可能尚未更新至最新版 `Card_Gateway.gs`（包含 `action === "save_card"` 分支），或是線上部署版本仍停留在舊版，導致線上後端回傳 `{ success: false, error: "Unknown action" }`。
  - 當 GAS 回傳失敗時，前端原先預設進入 fallback，但因為前面錯誤 1 導致彈窗無法正常渲染 fallback 提示。

---

## 3. 下一棒核心待辦任務 (Immediate Action Items)

1. **修復 `js/workspace_views.js` 的 `card is not defined` 變數作用域缺陷**：
   - 確保 `CloudShareModal` 組件第一行解構取得 `card` 與 `baseShareUrl`。
   - 執行語法檢查 `node -c js/workspace_views.js` 確保 0 語法錯誤。
2. **防禦性增強 `CloudShareModal` 容錯邊界**：
   - 即使 `shareModal.card` 不存在，也要安全保底為空物件 `{}`，避免任何屬性讀取炸掉。
3. **檢查並自癒 GAS 網關與 `gas_client.js` 通訊**：
   - 檢查 `gas_client.js` 的請求格式是否符合線上 GAS 的期待；若線上 GAS 是舊版，檢查是否有相容參數或需要重新提示使用者更新 GAS 部署。
4. **驗收全流程**：
   - 在卡片編輯器點擊「☁️ 發布至雲端 (免 Commit)」，確認不再黑屏，彈窗順暢展開，支援切換雙網域與中英尊稱！
   - 語音播報任務修復完成。

---

## 4. 驗收啟動指令 (Verification Step)

請新代理人直接按以下單行指令展開修復作業：
