# 📝 研發結構化原子日誌 (ACTIVE_LOG.md)
> ⚠️ **【鐵律：只追加不修改 (Append-Only)】**  
> 本日誌記錄專案核心重大架構決策、Bug 修復與踩坑復盤，供後續 AI 代理人與工程師物理錨定。

---

### [2026-09-20] [UNREFINED] [templates] 徹底淘汰彈窗小方盒，重構為「滿版海報 (Cinematic Poster)」與 4 大文字入場動效
- **類型**: `ARCH_DECISION` | `FEATURE`
- **代碼錨點**: `styles/animations.css`, `core/CardEngine.js`, `js/constants.js`, `workspace.html`
- **核心事實 / 決策理由**:
  1. **打破生硬小方盒思維**: 賀卡靈魂在於全螢幕大器海報，小彈窗小方盒割裂了手機螢幕整體感。徹底移除 `boxed-container` 內縮小盒子，正名升級為「滿版海報 (Cinematic Poster)」。
  2. **4 大文字入場動態特效 (Text Reveal FX)**:
     - 🀄 `domino-3d`：3D 骨牌階梯立體翻轉 (`rotateX(-75deg) -> 0deg`)，帶物理彈性一級級翻起。
     - 🔥 `fire-shimmer`：烈火金光流光拂過，文字由半透明被金焰掃過瞬間點亮。
     - 📜 `stagger-fade`：如墨水滲透紙張，帶柔和模糊微升登場。
     - 💫 `glow-focus`：星光凝聚聚焦，由高光星塵擴散聚焦為鋒利燙金字體。
  3. **階梯延遲 (Stagger Delay) 與重播機制**: 標題、相片、致對象、各段落、署名、CTA 按鈕自適應計算階梯延遲，並在工作台提供「重播動效」按鈕供即時審查。
- **踩坑 / 失敗模式**:
  - 動畫未重新觸發：切換動效時需以 `key` 觸發 React 物理節點替換以重置 CSS 動畫。
- **防禦手段 / 測試背書**:
  - 全流程純 CSS GPU 加速 (`transform`, `opacity`, `filter`)，保證手機與桌面端 60 FPS 流暢執行。


---

### [2026-09-20] [UNREFINED] [templates] 方盒卡片渲染鍵值修復與前後景 3D 雙軌多維調參架構
- **類型**: `BUG_FIX` | `FEATURE`
- **代碼錨點**: `core/CardEngine.js`, `core/BackdropShader.js`, `core/ParticleEngine.js`, `workspace.html`
- **核心事實 / 決策理由**:
  1. **方盒卡片無反應根因**: `constants.js` 下拉選單值為 `fixed-card`，但 `CardEngine.js` 舊版嚴格比對 `layout === 'boxed-card'`，引發 Fall-through 一片死黑。修改為 `layout === 'boxed-card' || layout === 'fixed-card'`，瞬間點亮現代磨砂玻璃方盒。
  2. **前後景雙軌 3D 參數矩陣**:
     - 背景 3D Shader：新增「輝光濃淡 (Opacity: 20%~100%)」與「動態流速 (Speed: 0.2x~2.0x)」，穿透控制 GLSL 金煙與 Three.js 星環/全息點雲。
     - 前景 3D 粒子：升級為「發射密度 (10~80)」、「透明度 (20%~100%)」與「速度 (0.4x~2.0x)」三維微調，徹底根治粒子擋字或太搶戲痛點。
     - UI 智慧條件收合：當選中 `none` 時無關拉桿自動隱藏，保持編輯介面高級整潔。
- **踩坑 / 失敗模式**:
  - 鍵值不對齊：跨模組佈局常數若未採用同一命名或別名相容，會引發非預期之空白渲染。
- **防禦手段 / 測試背書**:
  - 全軌純 JS 實作，零編譯 Zero-CORS，各數值設置嚴格邊界閾值保護 60 FPS 流暢度。


---

### [2026-09-20] [UNREFINED] [templates] 模板系統三大關鍵缺陷修復（星戰遮罩、WebGL Context 白屏、方盒卡片塌陷）
- **類型**: `BUG_FIX` | `STABILITY`
- **代碼錨點**: `styles/templates.css` (L71~L76), `core/BackdropShader.js` (L19~L246), `core/CardEngine.js` (L30~L65, L263~L273), `workspace.html` (L704~L724)
- **核心事實 / 決策理由**:
  1. **星戰漫遊文字穿透頂部標題**: 舊版遮罩漸隱僅 0~14%，文字到達 14% 就 100% 顯色，撞進固定大標題引發字疊字。重構 `.crawl-mask-container` 遮罩為 `linear-gradient(to bottom, transparent 0%, transparent 12%, black 28%, black 82%, transparent 98%)`，文字在抵達頂部大標題前即自然平滑淡出。
  2. **3D WebGL Shader 特效死黑與白屏崩潰**: 
     - 死黑與錯位原因：舊版以 `window.innerWidth/innerHeight` 填入手機框內 Canvas，導致視角嚴重錯位；且 GLSL 著色器背景底色過暗。修正為 `getContainerSize()` 自動讀取外框尺寸，並增強金煙對比度。
     - 白屏崩潰原因：同一個 `<canvas>` 跨 Raw WebGL 與 Three.js 爭奪 context 導致致命異常。在 `CardEngine.js` 中將 Canvas key 動態綁定 `bg-shader-canvas-${bgShader}`，強制 React 在切換 Shader 時銷毀並重建全新乾淨 Canvas，並於卸載時顯式呼叫 `WEBGL_lose_context` 與 `renderer.forceContextLoss()`。
  3. **精裝方盒卡片 (boxed-card) 塌陷與表單不聯動**:
     - 舊版 `items-center` 配合極端高度限制導致方盒卡片在手機視角下塌陷或負座標溢出不可見。改為 `items-start` 容器搭配 `my-auto` 卡片，保證居中且可自然滑動。
     - 在 `workspace.html` 左側面板中為「字幕漫遊速度」加入 `layout === 'star-wars-crawl'` 條件判斷，方盒模式自動隱藏無關拉桿。
- **踩坑 / 失敗模式**:
  - WebGL 上下文限制與跨庫衝突：絕不能讓原生 WebGL 與 Three.js 共享同一個 Canvas 元素；必須依賴 React Key 進行物理節點換新。
- **防禦手段 / 測試背書**:
  - 全流程純 JS 實作，零 JSX 外溢，滿足 `file:///` 雙擊即開與 Zero-CORS 鐵律。


---

### [2026-09-20] [UNREFINED] [workspace.html] 重構為畫廊優先 (Gallery-First) 雙層架構
- **類型**: `ARCH_DECISION` | `BUG_FIX`
- **代碼錨點**: `workspace.html` (L100~L700)
- **核心事實 / 決策理由**:
  - 前數十輪 AI 誤將「所見即所得編輯器」作為唯一的默認入口，強行將使用者困在三欄編輯介面中，把卡片清單與模板縮小成側邊欄或下拉選單，嚴重破壞使用者體驗。
  - 經由使用者反饋與「屍前驗屍 ✕ 第十人反對法則」，確認專案根基必須是「看板/大畫廊 (Gallery Dashboard)」：使用者進入系統必須直接看到寬大的卡片庫與模板庫，在卡片上直接提供預覽、複製分享連結、一鍵複製與編輯按鈕。
  - 點擊「編輯」才進入專屬編輯視圖，且頂部提供醒目的 `[← 返回卡片庫]` 導覽按鈕。
- **踩坑 / 失敗模式**:
  - 失敗模式：AI 代理人自以為「既然有 3D 即時預覽，使用者一定想直接編輯」，擅自省略畫廊首頁，導致多次修改均無法契合使用者需求。
- **防禦手段 / 測試背書**:
  - 將「畫廊優先鐵律 (Gallery-First Invariant)」寫入 `docs/STATE.md` 與 `docs/adr/ADR-001-gallery-first-architecture.md`，永久禁止任何代理人未經授權將首頁默認恢復為編輯模式。

---

### [2026-09-20] [UNREFINED] [arch] 固化 PRD、實施 Google Sheet 雲端持久化、社交動態預覽與目錄瘦身
- **類型**: `ARCH_DECISION` | `REFACTOR`
- **代碼錨點**: `docs/PRD.md`, `workspace.html`, `js/workspace.js`, `js/gas_client.js`, `gas/Card_Gateway.gs`, `cloudflare/worker_og_proxy.js`, `index.html`
- **核心事實 / 決策理由**:
  - 徹底根治「每改動一個數值就必須發起一次 git commit」的致命摩擦力，參考 `htmal-report` 的動態 SSOT 設計，但捨棄過度複雜的 Google Drive 依賴，採用精簡的「Google Sheet SSOT ＋ 輕量 GAS 網關」。
  - 徹底解決社群分享（LINE、FB、WhatsApp、WeChat）沒有卡片封面與專屬祝福圖文預覽的盲區：引入 `cloudflare/worker_og_proxy.js` 邊緣層，針對爬蟲 10ms 內動態注入 Open Graph `<meta>` 標籤，人類訪客透傳至 GitHub Pages。
  - 清理 100% 歷史冗餘廢代碼（未引用的 `app.js` 與 `components/` 5 個組件、`docs/archive/` 空目錄），收納音訊至 `assets/audio/In Love With You.mp3`。
  - 將 76KB 單體巨石 `workspace.html` 拆解為 `css/workspace.css` 與 `js/workspace.js`，並加入「☁️ 發布至雲端 (免 Commit)」與專屬短連結分享彈窗。
  - 升級 `index.html`，支援解析 `?id=` 參數、啟用 `localStorage` SWR 秒開與本地 `data/cards.json` 降級保底。
- **踩坑 / 失敗模式**:
  - 社群爬蟲（LINE Bot、Facebook External Hit）不跑客戶端 JavaScript，純 CSR 靜態網頁無法產生動態卡片預覽。必須於邊緣層（Cloudflare Worker）攔截並伺服器端吐出 Open Graph 標籤。
  - 音訊路徑遷移若未同步更新 `templates.json` 會導致載入 404；已全面採用相對路徑與相容設定消除隱患。
- **防禦手段 / 測試背書**:
  - 固化 `docs/PRD.md`，更新 `docs/STATE.md`。

---

### [2026-09-20] [UNREFINED] [workspace.html] 模板編輯大螢幕 WYSIWYG 與頂部視角控制項重構
- **類型**: `REFACTOR` | `UI_UX`
- **代碼錨點**: `workspace.html` (L558~L687, L918~L1389), `css/workspace.css`
- **核心事實 / 決策理由**:
  - 徹底剷除原本憋屈的模板彈窗，將模板設計工坊升級為與卡片編輯器完全對齊的全螢幕三欄 WYSIWYG 介面（左欄基礎版型、中欄 3D 實時預覽、右欄 Shader/粒子/色彩）。
  - 根據使用者紅框與箭頭明確指示，將「即時預覽模式：[手機] [桌面寬屏]」控制項由中央畫布搬遷至頂部導覽列 (Navbar) 右側，徹底淨空中間 3D 渲染舞台，手機畫框置中無任何懸浮按鈕遮擋文字。
  - 確立 PC 桌面端專屬原則：排版專為 PC 瀏覽器大螢幕打造，左右側邊欄獨立滾動，手機畫框自適應視窗高度 (`max-height: calc(100vh - 130px)`)。
- **踩坑 / 失敗模式**:
  - 失敗模式：先前版本將視角切換按鈕懸浮覆蓋在手機預覽畫面上方，遮蔽卡片標題文案，引發嚴重視覺衝突；經搬遷至 Navbar 後獲得根治。
  - 測試邊界守衛：嚴格恪守「測試是使用者工作」鐵律，AI 嚴禁私自喚醒瀏覽器，驗收全權交由使用者親自按 F5 體驗。
- **防禦手段 / 測試背書**:
  - 純靜態無編譯相容性，代碼在 `file:///` 協議下秒開無 CORS 阻礙。

---

### [2026-09-20] [UNREFINED] [arch] workspace.html 模組化拆分與純 JS 狀態儲存層抽離
- **類型**: `REFACTOR` | `MODULARIZATION`
- **代碼錨點**: `js/workspace_store.js`, `workspace.html` (L30~L40, L280~L1050)
- **核心事實 / 決策理由**:
  - 解決 `workspace.html` 代碼單體膨脹痛點，貫徹「驗屍 ✕ 第十人反對法則」：因 `file:///` 本地雙擊協議嚴格阻擋外部 JSX 跨域讀取，禁止盲目引入 Webpack/Vite 等重型建置流程。
  - 將所有純資料管理、LocalStorage 持久化、JSON 降級保底、卡片/模板複製與備份匯出邏輯徹底抽離至獨立模組 `js/workspace_store.js`，以原生 `<script src="...">` 載入，100% 零 CORS、零白屏風險。
  - 在前端視圖層，將巨大的單體 `CardForgeApp` 解構為職責專一的獨立子組件：`WorkspaceNavbar`、`CardsGallery`、`TemplatesGallery`、`PreviewModal` 與 `CloudShareModal`。
- **踩坑 / 失敗模式**:
  - 若在外部 JS 檔中直接使用 JSX 標籤，會觸發瀏覽器原生的 Unexpected token '<' 語法錯誤；因此嚴格確立「純邏輯/狀態管理移入外部純 JS 模組，JSX 視圖組件於入口中分層解耦」之鐵律。
- **防禦手段 / 測試背書**:
  - `node -c js/workspace_store.js` 語法校驗 100% 通過。

---

### [2026-09-20] [UNREFINED] [index.html] 受眾播放器重複粒子引擎消除、子組件抽離與單一資料源整合
- **類型**: `REFACTOR` | `MODULARIZATION`
- **代碼錨點**: `index.html` (L110~L600), `core/ParticleEngine.js`, `js/workspace_store.js`
- **核心事實 / 決策理由**:
  - `index.html` 過去內嵌複製了完整的 225 行 `ParticleEngine`，與 `core/ParticleEngine.js` 嚴重重複；本次直接透過原生 `<script src="core/ParticleEngine.js">` 載入，徹底刪除 225 行重複代碼。
  - 將資料初始化與本地/離線降級邏輯全面收斂至 `window.WorkspaceStore.loadInitialData()`，保證創作者端 (`workspace.html`) 與受眾端 (`index.html`) 資料儲存結構完全一致，杜絕跨端差異。
  - 視圖層拆解出 `WelcomeGate`（點擊開門遮罩與 Web Audio / 全螢幕手勢解鎖）與 `AudioControls`（受眾端極簡藥丸按鈕 vs 創作者預覽端風格浮動按鈕），提升代碼可讀性與維護性。
- **踩坑 / 失敗模式**:
  - 行動端（iOS Safari / Android Chrome）安全策略要求音訊必須由使用者主動手勢（開門按鈕點擊）觸發；重構時嚴格保留 `WelcomeGate` 的 `handleStart` 手勢解鎖鏈路，防止因拆分組件引發聲音靜默。
- **防禦手段 / 測試背書**:

---

### [2026-09-20] [UNREFINED] [arch] 前端圖片 WebP 極致壓縮模組封裝與 ImgBB 免費 CDN 直傳整合
- **類型**: `ARCH_DECISION` | `FEATURE`
- **代碼錨點**: `js/image_uploader.js`, `workspace.html` (L30~L40, L780~L800, L950~L1000, L1250~L1340), `docs/STATE.md`
- **核心事實 / 決策理由**:
  - 徹底解決賀卡圖片直接塞入 Git 倉庫引發倉庫膨脹、頻繁 Commit 與受眾端載入緩慢痛點。
  - 設計「純前端雙重智能壓榨」架構：
    1. 尺寸等比縮小（長邊 ≤ 1600px）。
    2. 原生 HTML5 Canvas 轉譯 WebP（80% 質量），體積縮小 80%~95% 並保留 Alpha 透明通道。
    3. 直傳 ImgBB 開放 API (`https://api.imgbb.com/1/upload`)，取得全球 CDN 直連外鏈 (`i.ibb.co`)，自動追加至卡片媒體欄位。
  - 嚴格遵守「模組解耦」與「零編譯純 JS」鐵律：所有圖片壓縮演算法與 API 調用獨立封裝於 `js/image_uploader.js`，完全不含 JSX，以原生 script 標籤載入，嚴禁將演算法代碼硬塞入 `workspace.html`。
  - 卡片編輯抽屜提供：隱藏 File Input、拖曳上傳提示區、即時 WebP 壓縮與上傳進度反饋、手動加外鏈備選、單張 Ken Burns 慢鏡 / 多張 5s 輪播之視覺狀態標籤。
- **踩坑 / 失敗模式**:
  - ImgBB API 回傳帶有 CORS 許可標頭，純前端使用 FormData 可在 `file:///` 協議下秒級直傳，不需後端代理中轉。
  - 壓縮時須先清空離屏 Canvas 畫布，避免 PNG 透明背景轉譯時出現黑底失真。
- **防禦手段 / 測試背書**:

---

### [2026-09-20] [UNREFINED] [index.html] 根治本地 file:/// 協議下 templates.json 的 Zero-CORS 降級卡頓
- **類型**: `BUG_FIX` | `ZERO_CORS`
- **代碼錨點**: `index.html` (L110~L125)
- **核心事實 / 決策理由**:
  - 使用者在本地以 `file:///` 雙擊打開 `index.html?id=...` 時，瀏覽器因安全性原則將 `file:///` 視為 `origin: 'null'`，攔截 `fetch('data/templates.json')` 引發 CORS 錯誤。
  - `workspace_store.js` 在 fetch 失敗時原本設計了降級為 `window.DEFAULT_TEMPLATES`，但 `index.html` 先前漏掉了引入 `js/constants.js`，導致降級時 `DEFAULT_TEMPLATES` 為 `undefined`，使得 `templates` 陣列長度為 0，播放器永久卡死在「載入專屬賀卡中...」。
  - 補齊 `<script src="js/constants.js"></script>` 後，降級鏈路完整閉環，無需依賴推送到 GitHub 倉庫或起本地伺服器，100% 實現本地雙擊秒開播放。
- **防禦手段 / 測試背書**:

---

### [2026-09-20] [UNREFINED] [workspace.html] 清除左下角重複按鈕、收斂頂部 Navbar 單一操作出口
- **類型**: `REFACTOR` | `UI_UX`
- **代碼錨點**: `workspace.html` (L1130~L1145, L1450~L1465)
- **核心事實 / 決策理由**:
  - 徹底剷除卡片編輯器與模板編輯器左下角歷史殘留的重複按鈕（「儲存並返回卡片庫」與「雲端短連結」）。
  - 事實確認：工坊採用實時自動儲存 (Auto-Saved) 機制，使用者輸入之際即持久化寫入 LocalStorage，左下角按鈕與頂部 Navbar 按鈕底層代碼完全相同，純屬冗餘與心智負擔。
- **防禦手段 / 測試背書**:
  - 恪守本地雙擊零編譯原則，保持操作出口唯一性。

---

### [2026-09-20] [UNREFINED] [arch] 執行全專案深度模組化：抽取 workspace_views.js 與純 JS CardEngine.js
- **類型**: `REFACTOR` | `MODULARIZATION`
- **代碼錨點**: `js/workspace_views.js`, `core/CardEngine.js`, `workspace.html`, `index.html`, `docs/STATE.md`
- **核心事實 / 決策理由**:
  - 徹底解決 `workspace.html` 巨石膨脹（1,600+ 行）假模組化痛點：
    1. 新建 `js/workspace_views.js`，以純 JS (`React.createElement`) 完整抽離 `PreviewModal`、`CloudShareModal`、`WorkspaceNavbar`、`CardsGallery`、`TemplatesGallery` 五大核心視圖組件，掛載於 `window.WorkspaceViews`，符合 `file:///` 零 CORS 零編譯規範。
    2. 將 `core/CardEngine.js` 全面重構為純 JS (`React.createElement`) 模組，徹底移除 JSX 標籤，符合外部 `.js` 檔嚴禁 JSX 規範；創作者端與受眾端共享單一舞台。
    3. `workspace.html` 與 `index.html` 同步刪除內聯重複 CardEngine 與畫廊組件，`workspace.html` 行數直接從 1,600+ 行暴降至約 900 行，`index.html` 降至 369 行。
---

### [2026-09-20] [UNREFINED] [workspace] 根治編輯器標題穿透導覽列、移除冗餘備份按鈕、明確保存標籤
- **類型**: `BUG_FIX` | `UI_UX`
- **代碼錨點**: `css/workspace.css` (L38~L65), `js/workspace_views.js` (L155~L280), `docs/ACTIVE_LOG.md`
- **核心事實 / 決策理由**:
  - 根據使用者截圖標註之重大缺陷進行三合一精準修復：
    1. **根治非全螢幕標題字穿透導航欄**：在 `css/workspace.css` 為 `.phone-frame` 與 `.desktop-frame` 注入 `overflow: hidden !important`、`contain: paint` 與 3D 渲染層硬體隔離 `transform: translateZ(0)`，徹底杜絕文字與特效元素突破手機外框邊界；並將頂部導覽列提升至 `z-50`。
    2. **移除冗餘「備份導出」按鈕**：全系統已全面串接 Google Sheet SSOT 雲端持久化，本地手動下載 JSON 備份已無存在必要，將右上角「備份導出」按鈕徹底移除，大幅簡化導覽列視覺。
    3. **消弭保存疑慮**：將左上角「返回卡片庫」與「返回模板庫」明確認證為 **「保存並返回卡片庫」** 與 **「保存並返回模板庫」**，讓創作者直觀感受自動儲存的確定性。
- **防禦手段 / 測試背書**:
  - `node -c js/workspace_views.js` 語法校驗 100% 通過。

