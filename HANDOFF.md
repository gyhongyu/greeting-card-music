# 📋 專案工作交接文檔 (HANDOFF.md)

## 0. 🧠 智腦不二過記憶突觸 (Brain Synapse & Anti-Failure DNA)
- **上游會話 ID**: `f7d6cdbc-8b99-4c95-93d1-2bb69560fe89`
- **核心架構借鑒專案**: `E:\Projects\FollowLoop\FollowLoop-Web`
- **不可違背之工程紅線 (Hard Invariants)**:
  1. ⛔ **嚴禁主動發起 `git push`**。
  2. ⛔ **嚴禁在終端機內嵌代碼落盤**（禁止 `py -c`、`node -e` 或 `echo` 寫入程式檔案，必須使用專屬工具）。
  3. ⛔ **嚴禁使用 `browser_subagent` 開啟瀏覽器測試**，驗收全權交由使用者手動執行。
  4. ⛔ **`workspace.html` 總行數嚴格 ≤ 450 行**，超長模組必須抽離外部純 JS（無 JSX）。
  5. ⛔ **不可再有「手動點擊保存本地/雲端」這種孤島設計**！

---

## 1. 系統現況與死因卷宗 (Post-Mortem Findings)

### 🚨 致命死因 1：卡片與模板雙軌孤島脫節
- 目前卡片在 `workspace.html` 中僅存於本機 `localStorage`，點擊「發布到雲端」才單次備份到 GAS。
- 模板 (`templates`) 更加嚴重：**只有本地保存規則，根本沒有雲端同步機制！** 一旦使用者編輯了模板的視覺特效、Shader、字體或音樂，公網受眾端的播放器永遠讀取不到新模板資料，卡片效果必然徹底走樣。

### 🚨 致命死因 2：上傳管線資料殘缺與淺層覆蓋
- 前端 `updateEditingCard` 使用淺層合併 `{ ...c, ...fields }`，導致編輯部分欄位時直接洗掉了 `media.customMusic` 等巢狀設定。
- GAS 雲端儲存的卡片真實資料缺少了關鍵欄位，且後端讀取沒有回填保底。

---

## 2. 下一棒核心待辦任務：重構資料同步架構 (Cloud-SSOT)

請下一位 AI 代理人嚴格參考 `E:\Projects\FollowLoop\FollowLoop-Web` 的高可用同步模型，全面重構本專案的資料流：

### 🎯 核心原則：本地即時響應 ＋ 背景定時增量差異同步（Diff-Sync）
1. **不要再區分什麼「保存到本地」或「保存到雲端」**：
   - 使用者在工作台中的任何修改（卡片與模板），**本地立即生效（Optimistic UI 秒看）**。
   - 移除任何需要使用者手動點擊「發布到雲端」的脫節按鈕或操作。
2. **卡片 (Cards) ＋ 模板 (Templates) 全納入同步管線**：
   - 擴充 GAS 端點 (`gas/Card_Gateway.gs`) 與本地同步客戶端，支援**模板的同步與雲端版本管理**。
   - 公網受眾端 (`index.html`) 不僅要能動態拉取卡片，更要能動態拉取自訂模板。
3. **後台定時批量差異增量更新 (Background Batch Diff-Sync)**：
   - 建立資料變更髒標記（Dirty Flag）或版本雜湊（Version Hash / Timestamp）。
   - 後台防抖/定時（例如閒置 2~3 秒或定時輪詢）將發生變更的差異資料打包批量發送至 GAS。
   - 絕不進行無意義的全量大覆蓋，僅同步有差異的實體。
4. **讀寫閉環驗收 (Read-After-Write Verification)**：
   - 同步至 GAS 後，必須具備回讀校驗機制，確保雲端 SSOT 資料完整無損。

---

## 3. 驗收啟動指令 (Verification Step)

請下一位代理人依據上述架構方案執行重構。
