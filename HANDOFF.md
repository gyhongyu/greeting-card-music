# 📋 專案工作交接文檔 (HANDOFF.md)
> 上游會話 ID: `45604393-78e1-4a35-a1fb-3acef189fcbb`

---

## 0. 🧠 智腦不二過記憶突觸 (Brain Synapse & Anti-Failure DNA)

### 血淚紅線
- ⛔ 嚴禁 `git push`（未獲明確指令）
- ⛔ 嚴禁 `browser_subagent` 開瀏覽器測試，由使用者手動驗收
- ⛔ 嚴禁在外部 `.js` 使用 JSX (`<Tag>`)，一律用 `React.createElement`
- ⛔ `workspace.html` 總行數硬門禁 ≤ 450 行
- ⛔ 嚴禁終端命令內嵌代碼落盤（`py -c "..."` 生成 HTML/JS 等）
- ⛔ 接手後若提示詞含【討論模式】，禁止落盤實體檔案直到使用者說「結束討論」

---

## 1. 系統現況與已固化基線 (System Baseline)

### 專案架構
| 檔案 | 職責 |
|------|------|
| `workspace.html` | 創作者大畫廊工坊（≤ 450 行路由調度） |
| `index.html` | 受眾端 3D 播放器（分享鏈結用，不是首頁） |
| `js/editor_views.js` | `CardEditorView` + `TemplateEditorView`（抽離自 workspace） |
| `js/workspace_views.js` | 畫廊/導覽列/彈窗/密碼鎖 |
| `js/workspace_store.js` | 全局唯一資料持久化層 |

### 部署狀態
| 項目 | 狀態 |
|------|------|
| GitHub Pages 主域名 | ✅ `card.foxlink.co.in` (CNAME → gyhongyu.github.io) |
| Enforce HTTPS | ✅ 已勾選 |
| `card.teaforia.in` | ✅ Cloudflare Worker 隱式反代鏡像 |
| 網站首頁入口 | ✅ `card.foxlink.co.in/` 自動導向 `workspace.html` 創作者工坊；帶參數直達 3D 播放器 |
| 君子密碼守衛 | ✅ `10101010`（密碼解鎖後本地記憶持久化至 `localStorage`，無需重複輸入） |

---

## 2. 成果驗收與模組守衛記錄 (Implementation Log)

- [x] **首頁切換**：在 `index.html` 前置無損智慧重定向，訪客進入根路徑時自動導航進入工坊，帶卡片參數（`?card=` / `?id=` / `?preview=`）維持受眾播放器。
- [x] **君子密碼守衛**：
  - 封裝於 `js/workspace_views.js` 之 `PasswordLockGate` 組件，100% 純 JS (`React.createElement`)，無 JSX 標籤，相容 `file:///` 本地秒開。
  - 密碼硬編碼為 `10101010`，解鎖成功後寫入 `localStorage.setItem('cardforge_auth_unlocked', 'true')`，永久保持解鎖狀態。
  - 支援 Enter 鍵快速送出、密碼錯誤震動警告與即時反饋。
  - `workspace.html` 行數維持 435 行（嚴格遵守 ≤ 450 行紅線）。
- [x] **中秋 3D 特效與雙旗艦模板**：
  - 超級明月 Shader (`lunar-clouds`)、金桂飛花 (`osmanthus-petals`)、祈願天燈海 (`sky-lanterns`)、天上掉月餅 (`falling-mooncakes`)、3D 金箔月餅 (`golden-mooncake`)。
  - 圖檔託管於 ImgBB 全域 CDN 直連 (`https://i.ibb.co/cqhRZ1v/mooncake-png.png`)，解決 `file:///` 跨域難題。
- [x] **工坊視圖體驗修復**：
  - 手機 ⇄ 寬屏外框切換防拉伸 (`preview-frame` key)。
  - 移除月餅外圈生硬圓環（魔戒邊框）。
  - 單例貼圖快取 `cachedMooncakeTex` 根除 Opacity 拉桿拖動導致月餅消失的 BUG。
  - 移除模板設計預覽視窗中的「示範按鈕 (CTA)」。

---

## 3. 下階段任務與驗收啟動指令 (Verification Step)

### 🚨 下個 AI 代理人核心任務：
1. **排查卡片鏈結展示問題 (BUG Investigation)**：
   - 檢查目前大畫廊、預覽彈窗或受眾端在點擊或展示「卡片鏈結 / 分享鏈結 / 雲端短網址」時的行為異常。
   - 深入檢查 `js/workspace_views.js` (如 `CloudShareModal`, `PreviewModal`)、`js/gas_client.js`、`index.html` 的參數解析（`?id=` / `?card=`）及展示路徑是否存在問題。
2. **討論模式門禁 (Discussion Mode Mandatory)**：
   - **查明原因後，必須立即進入【討論模式】主動向使用者匯報排查發現與修復思路，嚴禁在使用者輸入「結束討論」前修改代碼或落盤實體檔案！**

### 接手啟動指令：
```
請詳細閱讀專案根目錄下的 HANDOFF.md，依照裡面的指引檢查當前的卡片鏈結展示 BUG。請全面排查根本原因，並在查完原因後立即進入【討論模式】與使用者討論修復方案，嚴禁在使用者說「結束討論」前落盤任何代碼或修改檔案！
```
