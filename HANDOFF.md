# 📋 專案工作交接文檔 (HANDOFF.md)

## 0. 🧠 智腦不二過記憶突觸 (Brain Synapse & Anti-Failure DNA)

### 溯源座標
- **當前會話 Conversation ID**: `aed6e7c1-3824-4f76-b063-9329f7ff20bb`
- **上游會話 Conversation ID**: `3756897c-1ce7-4b21-8aba-0b42c06d710c`

### 專案鐵律與血淚禁令 (Invariants & Red Lines)
1. **🚨 討論模式最高門禁 (Discussion Mode Mandate)**：
   - **接手後默認強制進入【討論模式】！**
   - 在使用者明確輸入「結束討論」之前，**絕對禁止**生成任何實體檔案或修改任何代碼！僅能進行架構探討、問題分析與方案審核。
2. **⛔ 絕對禁止未授權 Git 推送 (Absolute NO Unsolicited Git Push Law)**：
   - 除非使用者明確下達「推送倉庫」、「git push」、「推到 github」，否則任何代理人嚴禁主動發起 git push！
3. **⛔ 三維模板真值同步與防覆蓋鐵律 (Trinity Sync Invariant)**：
   - 本地新增或改完模板後，公網加載會自動從 Google Sheet 雲端 SWR 覆蓋。若未同步雲端，**新模板與新參數會全部被舊資料抹殺**！
   - 新增/修改模板後，必須強制依序執行：
     1. 雙向落盤：`data/templates.json` ＋ `js/constants.js`
     2. 三維核驗：`py scripts/sync_templates.py verify`
     3. 雲端推送：`py scripts/sync_templates.py push`（覆寫 Google Sheet SSOT）
     4. 技能指引：完整工作流請參閱 `.agents/skills/cardforge_template_manager/SKILL.md`。
4. **☁️ Google Drive 雲端儲存與零內聯字串鐵律 (Cloud Storage Invariant)**：
   - 嚴禁把 SRT 字幕全文、音訊 Base64、巨型文字塞進卡片欄位（會炸飛 LocalStorage 5MB 與 Google Sheet 50,000 字元上限）。
   - 一律由 `gas/Card_Gateway.gs` 上傳至 Google Drive 專用資料夾，卡片僅保存短網址。
   - 所有雲端資料夾映射與權限規範一律遵循 `.agents/skills/cardforge_cloud_storage/`。
     - 字幕 (`CardForge_Subtitles`)：**公開可編輯** (`ANYONE_WITH_LINK, EDIT`)，並同步保存 `subtitleEditUrl` 供線上跳轉編輯。
     - 音訊/視訊/相片 (`CardForge_Audio` / `Videos` / `Photos`)：公開唯讀 (`VIEW`)。
5. **⛔ 嚴禁在播放器中使用相對路徑做無參跳轉 (Zero-Relative-Redirect Invariant)**：
   - `play.html` 內部 100% 絕對禁止出現 `window.location.replace('workspace.html')`！
6. **⛔ file:/// 本地雙擊零編譯與 constants.js 同步鐵律**：
   - 外部純 JS 零 JSX，保證在 `file:///` 本地雙擊秒開。
7. **⛔ 畫廊優先與 workspace.html 行數門禁**：
   - 首頁必須是大畫廊；`workspace.html` 保持純粹組裝，總行數嚴格 ≤ 450 行！
8. **👑 絕對嚴禁以本地任何參數/常數取代或覆蓋 GAS 雲端真值 (Strict Zero-Local-Override Law)**：
   - **GAS 雲端資料庫（Google Sheet SSOT）為全系統唯一絕對單一真理源！**
   - 嚴禁任何代理人私自以本地寫死常數（`DEFAULT_TEMPLATES`、`DEFAULT_CARDS` 或靜態 JSON）取代/覆蓋受眾端或工坊端從 GAS 查詢到的即時卡片與模板參數！
   - 本地常數與降級數據**僅允許且只能在斷網（完全無網路）或 GAS 服務徹底崩潰拋錯時**作為緊急安全兜底；凡只要 GAS 成功返回數據，**100% 強制以 GAS 雲端即時參數為準**！絕不允許本地舊參數進行二次覆蓋！
   - 🚨 下一棒任務：全面審查專案所有檔案，只要有任何「拿本地參數優先覆蓋 GAS」的潛在代碼或邏輯，必須徹底全面改掉，防堵率必須達到 100%！

---

## 1. 系統現況與已固化基線 (System Baseline)

| 模組 / 元件 | 當前真實狀態 | 說明 |
| :--- | :--- | :--- |
| **視訊硬解壓縮規格** | ✅ 已固化上線 | 重製版影片經 FFmpeg 壓縮為 $1024 \times 1024$、YUV420p、H.264 High@4.0、`+faststart` 秒開，覆寫至 `assets/videos/Miracle_Under_the_Sky.mp4`（10.32 MB，壓縮 45%），完美相容手機與電視。 |
| **字幕 Google Drive 公開編輯** | ✅ 已固化上線 | `gas/Card_Gateway.gs` 已升級為 `ANYONE_WITH_LINK, EDIT`，並回傳 `editUrl`。部署至 GAS 第 4 版。 |
| **前端 UI 杜絕巨型字串** | ✅ 已固化上線 | [js/editor_views.js](file:///e:/Projects/greeting-card-music/js/editor_views.js) 移除錯誤的全文 fallback 邏輯，並新增「在 Drive 開啟編輯」按鈕。 |
| **雲端儲存專案技能** | ✅ 已固化 | 建立 [.agents/skills/cardforge_cloud_storage/](file:///e:/Projects/greeting-card-music/.agents/skills/cardforge_cloud_storage/) 專案技能，配備 CLI 工具 `cloud_storage.py`。 |
| **憲法規則強化** | ✅ 已固化 | 更新 [AGENTS.md](file:///e:/Projects/greeting-card-music/AGENTS.md) 注入第 6 條「Google Drive 雲端儲存與零內聯字串鐵律」。 |
| **遠端倉庫狀態** | 🟡 本地已更新 | 代碼與資產已全部就緒，嚴守禁令未主動推送 git。 |

---

## 2. 下一棒核心任務：深度探討兩大核心痛點 (Immediate Action Items)

> 🚨 **下一棒 AI 代理人接手行為準則**：
> 1. **默認直接進入【討論模式】**：未取得「結束討論」前，絕對禁止碰觸代碼或生成實體檔案。
> 2. **深入探討使用者提出的兩大具體問題**，運用「Pre-mortem 屍前驗屍 ✕ 第十人反對法則」進行根因診斷與方案評審：
> 
> ### 🚩 問題一：加載新卡片 / 新模板為什麼經常卡住？（在沒有打開過我們網址的新環境下）
> - **初步線索與診斷切入點**：
>   1. **`play.html` 的 Loading 條件**：
>      ```javascript
>      if (!currentCard || templates.length === 0) {
>          return <div className="..."><i className="fa-solid fa-circle-notch fa-spin"></i></div>;
>      }
>      ```
>   2. **冷啟動無快取懲罰**：首次打開網址時，瀏覽器 `localStorage` 完全沒有 `cardforge_cache_...`。
>   3. **GAS 雲端冷啟動 (Cold Start) 逾時與死鎖**：
>      - `play.html` 調用 `window.GasClient.getCard(cardIdParam)`（內置逾時 20 秒）與 `window.GasClient.getTemplate(tplId)`。
>      - Google Apps Script 免費版常駐睡眠，首次請求喚醒常需 8~15 秒；如果中間 fetch 失敗回傳 `null`，而 `play.html` 又**沒有保底載入本地降級模板（如 `constants.js` 的 `DEFAULT_TEMPLATES`）**，`targetTemplate` 就會一直是 `null`，導致畫面**永久卡死在旋轉菊花圖示**！
>   4. **外鏈 CDN 阻塞**：`resource.trickle.so`（React/Babel）、Google Fonts 在部分網路環境下是否延遲過高？
> 
> ### 🚩 問題二：分享地址為什麼改為 `card.foxlink.co.in` 就會 404？
> - **初步線索與診斷切入點**：
>   1. **DNS 與 CDN 解析**：`card.teaforia.in` 正常運作，但 `card.foxlink.co.in` 是否在 Cloudflare 設定了正確的 DNS CNAME 指向 GitHub Pages（或 Worker 代理）？
>   2. **GitHub Pages 自訂域名 (CNAME) 單域名限制**：
>      - GitHub 倉庫根目錄的 `CNAME` 檔案**只能綁定一個主網域**！
>      - 如果倉庫 CNAME 綁定的是 `card.teaforia.in`，直接訪問 `card.foxlink.co.in` 時，GitHub Pages 會拒絕識別並直接拋出 404！
>   3. **Cloudflare Worker 反代缺失**：專案下有 `cloudflare/worker_og_proxy.js`，`card.foxlink.co.in` 是否尚未在 Cloudflare Worker 的 Custom Domains 正確綁定與反向代理至 `card.teaforia.in`？

---

## 3. 驗收啟動指令 (Verification Step)

請直接複製以下指令啟動下一棒 AI 代理人：

```markdown
請詳細閱讀專案根目錄下的 HANDOFF.md。目前默認進入「討論模式」，請向我問候並依據文檔中的兩大問題（冷啟動加載卡死、card.foxlink.co.in 404）進行深度剖析與討論，在未輸入「結束討論」前嚴禁修改任何代碼或落盤實體檔案。
```
