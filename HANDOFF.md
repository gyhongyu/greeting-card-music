# 📋 專案工作交接文檔 (HANDOFF.md)
> ⚠️ **【鐵律：專案唯一單一真理源 (SSOT)】**  
> 本檔案由 `handover_generator` 自動維護並原子覆寫，禁止產生影子交接文檔。  
> 交接時間：2026-09-20 21:30 | 交接狀態：代碼已模組化瘦身、雙軌穩態、等待媒體上傳架構討論

---

## 0. 🧠 智腦不二過記憶突觸 (Brain Synapse & Anti-Failure DNA)

- **會話突觸 ID**：`69349538-ea66-43fa-a3bc-aec4814aaf2e`
- **上游核心突破**：
  1. `workspace.html` 與 `index.html` 雙軌架構徹底理清，完成模組化瘦身。
  2. 抽離全域唯一資料源 `js/workspace_store.js`，雙端共享 LocalStorage 快取與降級保底。
  3. 確立 `file:///` 本地雙擊零編譯、Zero-CORS 鐵律，外部 `.js` 嚴禁包含 JSX 語法。
  4. 人類視角 `README.md`、架構地圖 `docs/STATE.md`、AI 專案憲法 `AGENTS.md` 完成三道鎖固化。
  5. 本地 Git 提交至 `2e615ca`。
- **不可違背之血淚紅線**：
  - 🚨 **絕對禁止私自開啟瀏覽器（`browser_subagent`）測試**，測試是使用者的工作，驗收全權交由使用者手動執行。
  - 🚨 **絕對禁止主動發起 `git push`**。
  - 🚨 **接手後強制默認進入【討論模式】，嚴禁直接修改代碼或生成實體文件**，直到使用者明確輸入「結束討論」。

---

## 1. 系統現況與已固化基線 (System Baseline)

| 模組 / 檔案 | 當前狀態 | 關鍵特性與職責 |
| :--- | :--- | :--- |
| `workspace.html` | 穩態 (模組化) | 創作者 PC 大螢幕畫廊工坊，預設首頁必須是大看板大畫廊，頂部提供預覽模式切換 |
| `index.html` | 穩態 (瘦身完成) | 受眾端終端播放器，具備 `WelcomeGate` 開門手勢解鎖 Web Audio、SWR 秒開 |
| `js/workspace_store.js` | 穩態 (SSOT) | 純 JS 資料儲存，管理 `cardforge_cards`、`cardforge_templates`、LocalStorage 與 JSON 降級 |
| `core/` | 穩態 | `BackdropShader.js` (WebGL 背景)、`ParticleEngine.js` (3D/2D 粒子)、`CardEngine.js` (文字排版) |
| `gas/Card_Gateway.gs` | 穩態 | Google Apps Script 雲端網關，免 Git Commit 存取 Google Sheet |
| `cloudflare/worker_og_proxy.js` | 穩態 | 社交爬蟲動態 OG 預覽代理 |

---

## 2. 下一棒核心任務：媒體上傳與雲端免費空間架構討論 (Immediate Action Items)

### 📌 模式約束：**接手後立即進入【討論模式】，禁止改動代碼！**

### 🎯 討論核心命題與架構要點：
1. **相片展示邏輯討論**：
   - **單張相片**：靜態沉浸大圖、微視差或 Ken Burns 慢鏡，不進行無意義輪播切換。
   - **多張相片**：定時輪播、漸變淡入淡出、微調輪播間隔（如 5 秒循環）。
2. **免塞 Git 倉庫之雲端免費儲存方案討論**：
   - **痛點**：將照片、音樂、影片直接提交至 GitHub 倉庫會導致倉庫體積快速膨脹，且每次換圖都要發起 Git Commit。
   - **可用全域技能庫對接評估**：
     - **圖片/照片**：評估全域技能 `imgbb_embedder`（TeaPIC 免費圖床，直出 CDN 直連外鏈，支援 Google Sheet 雲端相簿台帳）。
     - **二進位檔案 / 大檔案 (音訊、短影片、圖片)**：評估全域技能 `gas_drive_bridge`（利用使用者的 Google Drive 作為雲端二進位檔案儲存庫，Base64 直傳，產出直連 URL）。
   - **前端上傳流程設計**：
     - 在 `workspace.html` 編輯器內提供「檔案拖曳 / 點擊選取」上傳按鈕。
     - 前端讀取檔案轉 Base64 後直接非同步呼叫上傳網關（ImgBB API 或 Google Drive GAS 網關）。
     - 取得直連 CDN/雲端 URL 後，自動回填至當前卡片的 `card.media.photos` 或 `card.media.customMusic`，並觸發 `WorkspaceStore.saveCards()` 或 Google Sheet 雲端保存。
3. **音訊與影片架構討論**：
   - 背景音樂（MP3）上傳與外部外鏈（如 Google Drive 音訊直連、SoundCloud、自建 CDN）相容性。
   - 影片背景（MP4/WebM）或動態封面在受眾端的靜音自動播放與效能評估。

---

## 3. 驗收與交接啟動說明 (Verification Step)

下一位 AI 代理人接手後，必須先以極簡大白話向使用者打招呼，聲明**已進入討論模式**，並針對上述 3 個核心主題提出架構分析與具體建議，傾聽使用者的想法，在使用者輸入「結束討論」前切勿動手修改任何檔案。
