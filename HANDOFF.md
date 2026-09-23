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
  - **右上角「本地預覽」動態路由**：按鈕重構為「本地預覽」，點擊動態帶入卡片 ID（`index.html?id=${cardId}&preview=1`），新分頁秒開受眾端真實預覽，徹底解決無參數跳轉回工坊的閉環死鎖。
  - **未發布卡片 0ms 本地秒開**：`index.html` 優先讀取本地 `localStorage` 最新卡片與單卡快取，支援尚未分配雲端 ID 時斷網也能極速預覽。
  - **模板列表卷軸拉伸鋪滿**：修復左側「套用外觀模板」清單高度截斷問題，自適應 `flex-1` 鋪滿至視窗底端。
  - **星戰 PC 100% 縮放文字飛出消失根除**：星戰板面由失控的 `180%`（PC 寬達 3456px）重構為自適應約束 `width: min(${crawlWidthScale}%, 820px)`，PC 寬螢幕強制上限 820px，透視景深自動適配，徹底解決 100% 縮放下文字飛出視野只剩左緣殘留問題。
  - **海報模式 PC 影院級響應式字級**：透過 PC 桌面專屬字級倍率（標題 `clamp(48px, 4.2vw, 68px)`、內文 `clamp(18px, 1.5vw, 24px)`），在標準 100% 縮放下即時呈現大器、震撼的影院海報排版，無需手動縮放瀏覽器。
  - **受眾與預覽端色票干擾徹底清除**：移除 `index.html` 中的模板切換浮動色票按鈕，模板統一由創作者工坊收斂管理，受眾端與預覽端維持極簡純淨（僅保留右上角半透明音樂開關藥丸鈕）。
  - **編輯器中間畫框置頂吸附與滾動完全解耦**：中間預覽舞台改為置頂緊貼導覽列底部（`pt-4`），不論切換手機或桌面寬屏皆位置固定，左右兩側面板自帶獨立卷軸上下滾動時，中間畫框穩如泰山、絕不連動或位移。
  - **全頁外層白色大卷軸徹底消滅 (Figma-style 三欄物理鎖死)**：`body` 與根容器鎖定 `height: 100vh; overflow: hidden;`，徹底消除瀏覽器全頁卷軸。中間 3D 舞台絕對固定，滾動僅限左欄與右欄各自內部，大畫廊配備專屬 `.gallery-scroll-container` 獨立流暢滾動。

---

## 3. 驗收指引 (Verification Step)

### 建議驗收步驟：
1. **全頁卷軸消失與中間舞台絕對鎖死驗收**：在卡片編輯器中，確認瀏覽器最右邊的白色全頁滾動條已徹底消失；在中間滑動滾輪，中間畫框永遠固定不動；只有在右欄（表單）或左欄（模板）上方滾動時，各自的內部深色細卷軸才會順暢滑動。
2. **大畫廊流暢滾動驗收**：點擊左上角「返回卡片庫」，確認首頁大畫廊依然能順暢向下滾動瀏覽所有卡片。
3. **純淨無色票驗收**：開啟受眾端或本地預覽（`index.html`），確認右上角不再有彩色模板切換色票按鈕遮擋標題，僅保留極簡音樂開關按鈕。
4. **星戰 100% 縮放驗收**：在 PC 桌面端切換至星戰風格模板，瀏覽器維持 100% 標準縮放，確認所有文字正中呈現、清晰可讀、兩端對齊升空，不再偏左或飛出螢幕外。
5. **海報滿版大器排版驗收**：切換至中秋滿版海報模板，確認在 100% 縮放下標題大器居中、內文大字舒展，比例與剛才 200%/300% 縮放時一樣震撼。
6. **本地預覽按鈕驗收**：在卡片編輯器中，點擊右上角「本地預覽」，確認以新分頁開啟 `index.html?id=c_xxx&preview=1`，0ms 秒開呈現受眾端全螢幕賀卡。
7. **左側外觀模板卷軸驗收**：檢查卡片編輯器左側「套用外觀模板」清單，確認卷軸一路順暢延伸拉到最底部，無下方黑色截斷死區。
8. **架構門禁全綠遵守**：`workspace.html` 維持 437 行（嚴格 ≤ 450 行），外部純 JS 零 JSX 標籤，本地雙擊 `file:///` 秒開。
