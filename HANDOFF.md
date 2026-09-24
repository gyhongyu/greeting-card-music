# 📋 專案工作交接文檔 (HANDOFF.md)

## 0. 🧠 智腦不二過記憶突觸 (Brain Synapse & Anti-Failure DNA)
- **上游會話 ID**: `f7d6cdbc-8b99-4c95-93d1-2bb69560fe89`
- **當前交接會話 ID**: `a2dec505-68de-45cb-9fab-0f67e4097f67`
- **不可違背之工程紅線 (Hard Invariants)**:
  1. ⛔ **嚴禁主動發起 `git push`**（除非使用者在對話明確下達「推送倉庫」）。
  2. ⛔ **嚴禁在終端機內嵌代碼落盤**（禁止 `py -c`、`node -e` 或 `echo` 寫入程式檔案，必須使用專屬工具）。
  3. ⛔ **嚴禁使用 `browser_subagent` 開啟瀏覽器測試**，驗收全權交由使用者手動執行。
  4. ⛔ **`workspace.html` 總行數嚴格 ≤ 450 行**，超長模組必須抽離外部純 JS（無 JSX）。
  5. ⛔ **外部純 JS 零 JSX 鐵律**：外部 `.js` 一律使用原生 `React.createElement` (`h`)，絕對嚴禁出現 `<Tag>` JSX 標籤，保證 `file:///` 本地雙擊秒開。

---

## 1. 系統現況與最新死因復盤 (Root Cause & Bug Findings)

### 🚨 致命缺陷：受眾端在未點擊按鈕時，賀詞文字就已經提前在背後滾動播放
- **現象**：
  使用者打開受眾端（如 `https://card.teaforia.in/?id=c_mue9uxxt`），螢幕中間雖然蓋著「方案 A 呼吸聲波按鈕」，但後方的賀卡正文（星戰字幕 / 海報文字動畫）**在還沒按播放鈕的情況下就已經開始在背後往上飄、甚至滾動完了**！
- **死因分析**：
  在 `index.html` 中為了解決「開門畫面月餅被壓成扁條」的問題，將 `CardEngine` 移到了頂層常駐渲染。
  但是 `CardEngine` 內部同時包含了：
  1. **背景 3D 全景層**（Shader 月亮、掉落月餅粒子）；
  2. **前景文字排版與動畫層**（`anim-star-wars-crawl` 星戰爬升動畫、海報文字入場動畫）。
  因為 `CardEngine` 從一載入就掛載，導致 CSS 動畫 `@keyframes starWarsCrawl` 從第 0 秒就開始倒數計時播放，等使用者點擊按鈕時，文字早就滾到天上去或播完了！

---

## 2. 下一棒核心待辦任務 (Immediate Action Items)

請接手的工程師/代理人執行以下精確修復：

### 🎯 任務：解耦背景畫布與文字動畫生命週期（受眾端）
1. **傳入播放狀態控制 `isStarted` 給 `CardEngine`**：
   - 在 `index.html` 中傳入 `isStarted={isStarted}` 給 `<CardEngine ... />`。
   - 在 `core/CardEngine.js` 接收 `isStarted` 屬性。
2. **文字排版與動畫層受 `isStarted` 嚴格約束**：
   - **背景層**（WebGL 月亮、天上掉月餅粒子）：`isStarted` 為 false 時正常全景流暢運轉（保證月餅正圓不變形、大氣沉浸）。
   - **前景賀卡文字層**（星戰字幕、海報文字、標題）：
     - 當 `isStarted === false` 時：**完全隱藏（或不渲染文字層 DOM），嚴禁觸發文字滾動與入場動畫**！
     - 當 `isStarted === true`（使用者點擊呼吸播放按鈕）時：才正式掛載字幕並啟動動畫與音樂同步播放！
3. **工坊端相容性**：
   - 確保 `workspace.html` 編輯器中的 `CardEngine` 呼叫時，預設 `isStarted={true}`（或在工坊中保持常態可見可編輯）。

---

## 3. 驗收啟動指令 (Verification Step)

請下一位代理人依據上述架構方案執行修復。
