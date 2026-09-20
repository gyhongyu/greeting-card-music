# 📋 專案工作交接文檔 (HANDOFF.md)
> ⚠️ **【鐵律：專案唯一單一真理源 (SSOT)】**  
> 本檔案由 `handover_generator` 自動維護並原子覆寫，禁止產生影子交接文檔。  
> 交接時間：2026-09-20 22:45 | 交接狀態：代碼已模組化瘦身、雙軌穩態、等待模板系統 BUG 討論

---

## 0. 🧠 智腦不二過記憶突觸 (Brain Synapse & Anti-Failure DNA)

- **會話突觸 ID**：`33d69532-c449-42de-86fd-0205537d1831`
- **上游核心突破**：
  1. 完成純前端圖片 WebP 壓縮（80% 質量、等比縮放 ≤1600px）與 ImgBB CDN 直傳模組（`js/image_uploader.js`）。
  2. 修復 `file:///` 協議下缺少 `js/constants.js` 引發的 Zero-CORS 降級卡死 Bug。
  3. 徹底落實架構模組化：建立純 JS 視圖組件庫 `js/workspace_views.js`（`React.createElement`），重構 `core/CardEngine.js` 為純 JS 模組，`workspace.html` 降至 900 行、`index.html` 降至 369 行。
  4. 根治工坊編輯器標題字穿透導航欄缺陷（手機框硬隔離 `overflow: hidden !important; contain: paint; transform: translateZ(0)`）。
  5. 導覽列極致做減法：移除冗餘「備份導出」，將返回按鈕明確標記為「保存並返回卡片庫/模板庫」，消弭使用者焦慮。
  6. 本地 Git 提交至 `5010c82`。
- **不可違背之血淚紅線**：
  - 🚨 **絕對禁止私自開啟瀏覽器（`browser_subagent`）測試**，測試是使用者的工作，驗收全權交由使用者手動執行。
  - 🚨 **絕對禁止主動發起 `git push`**。
  - 🚨 **接手後強制默認進入【討論模式】，嚴禁直接修改代碼或生成實體文件**，直到使用者明確輸入「結束討論」。
  - 🚨 **外部 `.js` 檔絕對禁止包含 JSX 語法**，一律使用 `React.createElement`。

---

## 1. 系統現況與已固化基線 (System Baseline)

| 模組 / 檔案 | 當前狀態 | 關鍵特性與職責 |
| :--- | :--- | :--- |
| `workspace.html` | 穩態 (902 行) | 創作者 PC 大螢幕畫廊工坊，預設首頁為大看板畫廊，無內聯巨石，裝配純 JS 視圖庫 |
| `index.html` | 穩態 (369 行) | 受眾端終端播放器，具備 `WelcomeGate` 開門手勢解鎖 Web Audio、SWR 秒開、離線降級 |
| `js/workspace_views.js` | 穩態 (純 JS) | 工坊核心視圖組件庫：`PreviewModal`, `CloudShareModal`, `WorkspaceNavbar`, `CardsGallery`, `TemplatesGallery` |
| `core/CardEngine.js` | 穩態 (純 JS) | 跨雙端渲染舞台，零編譯 Zero-CORS 純 JS，星戰漫遊升空、精裝方盒卡片、照片輪播 |
| `js/workspace_store.js` | 穩態 (SSOT) | 純 JS 資料儲存，管理 `cardforge_cards`、`cardforge_templates`、LocalStorage 與 JSON 降級 |
| `js/image_uploader.js` | 穩態 (純 JS) | 圖片 WebP 極致壓縮與 ImgBB 免費 CDN 直傳 |
| `gas/Card_Gateway.gs` | 穩態 | Google Apps Script 雲端網關，免 Git Commit 存取 Google Sheet |
| `cloudflare/worker_og_proxy.js` | 穩態 | 社交爬蟲動態 OG 預覽代理 |

---

## 2. 下一棒核心任務：模板 (Templates) 系統 BUG 排查與深度討論 (Immediate Action Items)

### 📌 模式約束：**接手後立即進入【討論模式】，禁止改動代碼或生成任何檔案！**

### 🎯 討論核心命題與重點：
1. **模板系統 BUG 全盤盤點**：
   - 使用者明確反饋：「**模板還有很多的 BUG**」。
   - 下一個代理人進入後，必須以極簡親切的語氣向使用者問好，並主動詢問：
     > 「您好！我已進入**【討論模式】**，接下來專注梳理**模板 (Templates) 系統的 BUG 與體驗問題**。在您輸入『結束討論』前我不會更動任何代碼。請問目前在模板預覽、編輯、特效切換或色彩保存上，具體遇到了哪些 BUG 或不順手的狀況？」
2. **待審核的潛在模板問題方向**：
   - **Shader 與粒子切換**：在模板工坊切換 WebGL Shader 或粒子特效時，舊的 Canvas/動畫幀是否有完全銷毀（避免記憶體洩漏或畫面重疊）。
   - **模板與卡片的聯動關係**：修改模板規格後，已關聯該模板的卡片即時同步效果與數值覆蓋邏輯。
   - **預覽假數據**：`TEMPLATE_DUMMY_CARD` 在不同模板版型（`star-wars-crawl` vs `boxed-card`）下的視覺表現。
   - **模板編輯器欄位與 UI 體驗**：左右側欄位的輸入體驗、即時保存機制與回退邏輯。

---

## 3. 驗收與交接啟動說明 (Verification Step)

下一位 AI 代理人接手後，必須先聲明**已進入討論模式**，傾聽使用者的想法，在使用者輸入「結束討論」前切勿動手修改任何檔案。
