# 📋 專案工作交接文檔 (HANDOFF.md)

## 0. 🧠 智腦不二過記憶突觸 (Brain Synapse & Anti-Failure DNA)

### 溯源座標
- **當前會話 Conversation ID**: `3756897c-1ce7-4b21-8aba-0b42c06d710c`
- **上游會話 Conversation ID**: `08a7c559-81bd-410d-b9b5-8c0983d5c2eb`

### 專案鐵律與血淚禁令 (Invariants & Red Lines)
1. **⛔ 絕對禁止未授權 Git 推送 (Absolute NO Unsolicited Git Push Law)**：
   - 除非使用者明確下達「推送倉庫」、「git push」、「推到 github」，否則任何代理人嚴禁主動發起 git push！
2. **⛔ 嚴禁在播放器中使用相對路徑做無參跳轉 (Zero-Relative-Redirect Invariant)**：
   - `play.html` 內部 100% 絕對禁止出現 `window.location.replace('workspace.html')`！
3. **⛔ file:/// 本地雙擊零編譯與 constants.js 同步鐵律**：
   - 使用者常以 `file:///` 本地雙擊開啟 `workspace.html`。Chrome 安全沙盒會封鎖本地 `fetch('data/templates.json')`。新增模板時，**必須同時在 `js/constants.js` 的 `window.DEFAULT_TEMPLATES` 與 `data/templates.json` 雙向同步登記**，否則本地永遠無法讀取！
4. **⛔ 終端命令防彈窗與內嵌代碼落盤禁令**：
   - 檔案操作必須且只能調用專屬工具（如 `replace_file_content`）。
5. **⛔ 畫廊優先與 workspace.html 行數門禁**：
   - 首頁必須是大畫廊；`workspace.html` 保持純粹組裝，總行數嚴格 ≤ 450 行！

---

## 1. 系統現況與已固化基線 (System Baseline)

| 模組 / 元件 | 當前真實狀態 | 說明 |
| :--- | :--- | :--- |
| **1:1 視訊播放模板** | ✅ 已固化上線 | `video-square-sky`（天穹奇蹟），正方形視訊 `Miracle_Under_the_Sky.mp4` 帶有外圍平滑羽化遮罩（Feathered Radial Mask），完美融化到底層相片與背景中。 |
| **電影字幕機 (SRT)** | ✅ 已固化上線 | 新增 `cinematic-subtitles`（🎤 電影字幕 · 原聲同步）版型，純 JS 解析 SRT 時間戳，隨影片/音樂時間軸優雅浮現與淡出。 |
| **字幕與字級即時連動** | ✅ 已連動 | 電影字幕字級直接綁定右側「內文字體大小 (Body Scale)」拉桿（80%~140%），所見即所得。 |
| **字幕雲端儲存 (方案1)** | ✅ 架構就緒 | `Card_Gateway.gs` 支援 `upload_subtitle` 存入 Google Drive 專屬資料夾 `CardForge_Subtitles`，卡片僅存短 URL，徹底根除 50,000 字元儲存格上限。 |
| **音樂音量微調與快速靜音** | ✅ 已上線 | 支援 0%~100% 音量滑桿與一鍵快速靜音，解決背景影片自帶歌曲/語音時與配樂衝突之痛點。 |
| **遠端倉庫狀態** | ✅ 已同步 | 本次重大更新已遵照指示推送到 GitHub `main` 分支。 |

---

## 2. 下一棒核心待辦任務 (Immediate Action Items)

使用者指示：**「1:1 做完沒問題後，再來做 9:16 和 16:9 的模板」**。

### 核心任務目標
基於已穩固的視訊圖層與字幕同步技術，規劃並實作：
1. **9:16 直屏滿版視訊模板**（適合抖音 / TikTok / IG Reels 垂直短影音風格）
2. **16:9 橫版寬螢幕視訊模板**（適合 YouTube 空拍風景 / 電影寬銀幕風格）

### 具體行動項 (Action Plan)
1. **素材與自適應驗證**：
   - 探討 9:16 / 16:9 視訊在手機端與 PC 端預覽框架內的自適應行為（滿版裁切或雙層模糊光暈填補）。
2. **模板庫擴充**：
   - 登記至 `data/templates.json` 與 `js/constants.js`。
3. **字幕適配微調**：
   - 確保在 9:16 直屏與 16:9 橫屏下，電影字幕依然位於視覺舒適區。

---

## 3. 驗收啟動指令 (Verification Step)

下一位接棒的 AI 代理人，請以繁體中文向使用者問候，直接調用以下啟動指令展開探討：

```markdown
請詳細閱讀專案根目錄下的 HANDOFF.md，並依序執行裡面的任務。
```
