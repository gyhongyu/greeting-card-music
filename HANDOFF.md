# 📋 專案工作交接文檔 (HANDOFF.md)

## 0. 🧠 智腦不二過記憶突觸 (Brain Synapse & Anti-Failure DNA)

### 溯源座標
- **當前會話 Conversation ID**: `08a7c559-81bd-410d-b9b5-8c0983d5c2eb`
- **上游會話 Conversation ID**: `562ca413-1c23-47c7-ba6e-1d47418117cf`

### 專案鐵律與血淚禁令 (Invariants & Red Lines)
1. **⛔ 絕對禁止未授權 Git 推送 (Absolute NO Unsolicited Git Push Law)**：
   - 除非使用者明確下達「推送倉庫」、「git push」、「推到 github」，否則任何代理人嚴禁主動發起 git push！
2. **⛔ 嚴禁在播放器中使用相對路徑做無參跳轉 (Zero-Relative-Redirect Invariant)**：
   - `play.html` 內部 100% 絕對禁止出現 `window.location.replace('workspace.html')`！否則在二級路徑或 Cloudflare Worker 代理下必引發每秒數十次連按 F5 級死循環。
3. **⛔ 嚴禁未做單點視覺驗收 (Spike) 前盲寫批量前端視頻導出**：
   - 純前端利用 Canvas 2D 覆蓋即時錄製 Three.js 3D WebGL 易產生掉幀、文字兩側裁切與黑屏。複合圖層 (CSS 3D + WebGL) 轉影片屬於深水區，非必要勿硬上。
4. **⛔ 嚴禁終端命令內嵌代碼落盤 (Zero-Inline-Code-Spawning Law)**：
   - 檔案操作必須且只能調用專屬工具（如 `replace_file_content`），杜絕終端轉譯引發的編碼截斷災難。
5. **⛔ 畫廊優先與 workspace.html 行數門禁**：
   - 首頁必須是大畫廊；`workspace.html` 保持純粹組裝，總行數嚴格 ≤ 450 行！

---

## 1. 系統現況與已固化基線 (System Baseline)

| 模組 / 元件 | 當前真實狀態 | 說明 |
| :--- | :--- | :--- |
| **三軌架構** | ✅ 已固化 | 1. `workspace.html`：創作者工坊；2. `index.html`：首頁智慧路由分流器；3. `play.html`：純粹受眾端 3D 播放器（零跳轉，永不死循環）。 |
| **無狀態純路徑分發** | ✅ 已上線 | 支援 `/p/:cardId/:recipientName`，Worker 邊緣端 302 重定向至 `/play.html?id=...&to=...`，徹底消滅微信氣泡內的 `?` 與 `&` 斷字截斷。 |
| **社群預覽 (OG Preview)** | ✅ 正常生效 | WhatsApp / LINE / Facebook / Twitter 爬蟲造訪時，維持極速 OG 瓶中信大圖預覽。 |
| **短影音導出** | 🛑 已乾淨回滾 | 已執行 Git Revert 徹底清除粗糙的 `video_exporter.js` 與按鈕，代碼庫恢復純淨。 |
| **文檔真理庫** | ✅ 已同步 | `docs/STATE.md` (≤200行) 與 `docs/ACTIVE_LOG.md` 已完成架構憲法與踩坑記錄追加。 |

---

## 2. 下一棒核心待辦任務 (Immediate Action Items)

使用者指示：**「做一個能拿視頻當背景的模板」**。

### 核心任務目標
以專案根目錄現有之視頻素材 `E:\Projects\greeting-card-music\Miracle_Under_the_Sky.mp4` 為基礎，與使用者共同研究並打造全新的**「視訊背景動態賀卡模板 (Video Background Card Template)」**！

### 具體行動項 (Action Plan)
1. **素材與格式盤點**：
   - 檢驗 `Miracle_Under_the_Sky.mp4` 的編碼（H.264 / AAC）、長度、長寬比（16:9 橫版或 9:16 直版）與檔案大小。
   - 思考視訊如何在純靜態 / 本地 `file:///` 環境下無 CORS 限制地被 HTML5 `<video>` 標籤平滑循環播放（`autoplay loop muted playsinline`）。
2. **模板架構設計 (Video Background Shader/Engine)**：
   - 在 `data/templates.json` 規劃全新模板定義（例如 `video-celestial-sky`）。
   - 在 [CardEngine.js](file:///e:/Projects/greeting-card-music/core/CardEngine.js) 中新增或擴充視訊背景圖層：
     - 底層：HTML5 Video 背景層（`object-fit: cover`，自動循環，支援亮度調光遮罩 `dimmer`）。
     - 中層：3D 粒子流光（星塵 Stardust、流星雨或光暈，透過 Three.js 透明 Canvas 覆蓋在視訊上方）。
     - 頂層：優雅的文字排版（如星戰爬升或書法詩意排版），文字投影保證在動態視頻背景下依舊清晰銳利。
3. **性能與行動端邊界防禦 (Pre-Mortem Invariants)**：
   - **行動端省電與靜音自動播放**：行動端瀏覽器（iOS Safari / 微信）要求背景視訊必須標註 `muted playsinline` 才能自動播放；音訊部分依然由使用者的點擊解鎖鍵（`WelcomeGate`）獨立播放背景音樂。
   - **檔案大小與加載優化**：評估若日後部署到線上，是否需要將大檔案 mp4 託管至 CDN 或提供壓縮版。

---

## 3. 驗收啟動指令 (Verification Step)

下一位接棒的 AI 代理人，請以繁體中文向使用者問候，並以極簡大白話表明已掌握 `Miracle_Under_the_Sky.mp4` 視訊背景模板的研發任務，直接調用以下啟動指令展開探討：

```markdown
請詳細閱讀專案根目錄下的 HANDOFF.md，並依序執行裡面的任務。
```
