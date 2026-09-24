# 📋 專案工作交接文檔 (HANDOFF.md)

## 0. 🧠 智腦不二過記憶突觸 (Brain Synapse & Anti-Failure DNA)
- **當前交接會話 ID**: `562ca413-1c23-47c7-ba6e-1d47418117cf`
- **關鍵上游會話 ID**: `a2dec505-68de-45cb-9fab-0f67e4097f67`
- **不可違背之工程紅線 (Hard Invariants)**:
  1. ⛔ **接手後強制默認進入【討論模式】**：使用者在對話中輸入「結束討論」前，絕對禁止修改代碼或落盤實體檔案！
  2. ⛔ **嚴禁主動發起 `git push`**（除非使用者在對話明確下達「推送倉庫」）。
  3. ⛔ **嚴禁在終端機內嵌代碼落盤**（禁止 `py -c`、`node -e` 或 `echo` 寫入程式檔案，必須使用專屬工具）。
  4. ⛔ **嚴禁使用 `browser_subagent` 開啟瀏覽器測試**，驗收全權交由使用者手動執行。
  5. ⛔ **`workspace.html` 總行數嚴格 ≤ 450 行**，超長模組必須抽離外部純 JS（無 JSX）。
  6. ⛔ **外部純 JS 零 JSX 鐵律**：外部 `.js` 一律使用原生 `React.createElement` (`h`)，絕對嚴禁出現 `<Tag>` JSX 標籤，保證 `file:///` 本地雙擊秒開。
  7. ⛔ **嚴禁為了避坑而閹割核心價值**：絕對保證「同一張卡片、傳不同人不同參數（`?id=...&to=...`）」之客製化核心靈魂，嚴禁私自移除收件人客製功能。

---

## 1. 系統現況與已固化基線 (System Baseline)

在當前會話中，以下重大功能已 100% 修復並已推送到遠端倉庫（`origin/main`）：
1. **星戰文字回放停頓解除 & 字級縮放解鎖**：
   - 移除了 `styles/templates.css` 與 `core/CardEngine.js` 上的懸停/點擊停頓邏輯（移除 `is-paused` 與 `:hover` 規則）。
   - 拔除全局 CSS 對字級大小的 `!important` 覆蓋，解鎖字級縮放 (`fontSizeScale`) 與寬度縮放 (`widthScale`) 滑桿即時調校。
2. **社群 Open Graph 預覽圖支援**：
   - 在 `index.html` 補齊 `og:image`、`og:title`、`og:description` 與 Twitter Card 標籤，綁定 ImgBB 高畫質封面 (`https://i.ibb.co/YFsSdsjg/share-cover-webp.webp`)。
   - `cloudflare/worker_og_proxy.js` 同步更新支援優先採用自訂封面。
3. **受眾端播放鍵旋轉加載閘門 (WelcomeGate Loading Spinner)**：
   - 徹底移除前端所有「超時自動降等回退為硬編碼預設海報」的脆弱計時器邏輯。
   - 受眾首次打開連結時，開場播放鍵呈現純旋轉圈圈（Loading Spinner），精準並行抓取該卡片（1 卡）與其對應模板（1 模）的最新雲端 SSOT 資料並立即落盤至 `localStorage`，就緒後解鎖播放鍵，徹底杜絕冷啟動 iPhone 看到硬編碼海報後突然跳轉星戰的視覺撕裂。
4. **全域快取破除 (`?v=2` / `?v=3`) 與紅包圖標**:
   - 為 `workspace.html` 與 `index.html` 內的所有圖標與外部腳本注入版本後綴，徹底擊穿瀏覽器對 SQLite Favicon 與 Disk JS 的頑固快取，紅包圖標順利上線。
5. **純淨收件人姓名傳遞與微信斷行防呆清洗**:
   - 網址 `to=` 僅傳遞收件人純名字（`to=Danny`），自動剔除逗號、冒號與空格防呆；受眾端播放器自適應智慧還原英文 `Dear Danny,` 或中文 `親愛的 Danny：`。
   - 分享訊息導語與網址之間雙換行隔離（`\n\n`），徹底消除標點符號與 URL 黏連。

---

## 2. 🚨 最新致命現象與死因復盤 (The WeChat Android Bug)

### 現象說明（參見使用者最新截圖）
- **電腦版微信（PC）正常，但發到手機版微信（Android）再次翻車**：
  在手機微信聊天室發送：
  `https://card.foxlink.co.in?id=c_mue9uxxt&to=Danny`
  手機微信的文字氣泡中：
  - 前半部 `https://card.foxlink.co.in` 高亮為深藍色超連結；
  - 後半部 `?id=c_mue9uxxt&to=Danny` **完全變成黑色普通文字（根本沒被當成網址）**！
  - 當收件人點擊時，瀏覽器開啟了沒有任何參數的 `https://card.foxlink.co.in`。
  - 受眾端 `index.html` 頂部代碼：
    ```javascript
    if (!isRecipientView) { window.location.replace('workspace.html'); }
    ```
    因為偵測不到卡片參數，**暴力將受眾轉址進了創作者工坊（`workspace.html`）**，受眾端赫然看見「君子密碼鎖」！

---

## 3. 下一棒核心待辦任務 (Immediate Action Items)

> ⚠️ **接手首要動作**：
> 嚴格保持在【討論模式】！先與使用者進行方案架構探討，切勿擅自改動代碼。

### 核心攻堅：研究能不能壓縮成短網址 / 偽靜態路徑，不會被手機微信截斷
1. **方向 A：偽靜態路徑路由 (Path-based Clean URL，推薦)**：
   - 微信手機端之所以截斷，是因其正則引擎極度排斥 `?`、`&`、`=` 等 QueryString 符號。
   - 如果網址形式為無問號的乾淨路徑：
     👉 `https://card.foxlink.co.in/c/mue9uxxt/Danny` 或 `https://card.teaforia.in/c/mue9uxxt/Danny`
     手機微信會 100% 將其當作連續的完整 URL 高亮，絕無截斷可能。
   - 實現方式：可由已存在的 Cloudflare Worker（`proxy-card-teaforia-in` 或 `worker_og_proxy.js`）在邊緣層進行 URL Rewrite，無損轉譯為前端所需參數。
2. **方向 B：極簡短網址壓縮服務 (Short URL Hash)**：
   - 評估利用 Cloudflare Worker + KV 或短代碼重定向，生成如 `https://card.teaforia.in/s/m9uxxt` 等超短網址。
3. **方向 C：受眾端首頁無參防禦升級（消滅外跳密碼鎖的次生災難）**：
   - 審視 `index.html`：若使用者不幸訪問無參網址，**絕對嚴禁跳轉到創作者工坊（`workspace.html`）**！
   - 應直接原地展示當季示範賀卡（如中秋明月卡），或顯示溫馨提示，確保受眾體驗永遠不崩潰。

---

## 4. 驗收啟動指令 (Verification Step)

請下一棒代理人仔細閱讀本文件，並嚴格遵循不變量進入討論。
