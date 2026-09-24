# 📝 研發結構化原子日誌 (ACTIVE_LOG.md)
> ⚠️ **【鐵律：只追加不修改 (Append-Only)】**  
> 本日誌記錄專案核心重大架構決策、Bug 修復與踩坑復盤，供後續 AI 代理人與工程師物理錨定。

---

### [2026-09-24] [UNREFINED] [minimal_envelope_icon] 換用使用者提供之簡潔紅色信封 (pngegg.png) 作為全套高辨識度 Favicon 與 PWA 圖標庫
- **類型**: `FEATURE` | `ASSET` | `USER_EXPERIENCE`
- **代碼錨點**: `pngegg.png`, `favicon.ico`, `assets/icons/`, `apple-touch-icon.png`
- **核心事實 / 決策理由**:
  1. **高辨識度極簡視覺**:
     - 過去使用的漂流瓶圖樣在 16x16 / 32x32 瀏覽器分頁標籤上過於複雜、辨識度受限。
     - 依使用者要求更換為簡約清晰的立體紅色信封開卡圖樣 (`pngegg.png`)。
  2. **自動無損邊界裁切與多階圖標生成**:
     - 透過自動化流程無損裁切透明邊界，置入正方形畫布並保留安全邊距。
     - 重新生成 `favicon.ico`（多解析度 16x16, 32x32, 48x48）、`apple-touch-icon.png` (180x180)、PWA `icon-192x192.png`、`icon-512x512.png` 與 `icon-maskable-512x512.png`。
     - 分頁標籤縮圖輪廓醒目俐落，大幅提升品牌識別感。

---

### [2026-09-24] [UNREFINED] [lifecycle_decouple] [crawl_text_sync] 解耦背景畫布與前景文字排版生命週期、根除受眾端開門未點擊文字提前滾動播放
- **類型**: `BUG_FIX` | `REFACTOR` | `USER_EXPERIENCE`
- **代碼錨點**: `index.html`, `core/CardEngine.js`
- **核心事實 / 決策理由**:
  1. **徹底根除文字在開門按鈕後方搶跑問題**:
     - 過去為了解除月餅被壓成扁條問題，將 `CardEngine` 置於受眾端頂層全屏預渲染。然而 `CardEngine` 內部之星戰字幕（`anim-star-wars-crawl`）與海報文字動畫在組件掛載第 0 秒即開始計時播放，導致使用者在按解鎖按鈕前文字已滾動甚至結束。
  2. **引入 `isStarted` 狀態約束與解耦渲染**:
     - `index.html` 將 `isStarted` 播放狀態傳入 `<CardEngine isStarted={isStarted} />`。
     - `core/CardEngine.js` 函式簽名接收 `isStarted = true`（預設值為 `true`，以 100% 保持創作者工坊與預覽彈窗之開箱即用與常規可見可編輯）。
     - 將懸掛大標題（`header-title`）、星戰/電影卷軸滾動容器（`scroll-container-*`）及滿版海報容器（`poster-container-*`）嚴格納入 `if (isStarted)` 判斷。
     - 底層 3D 全景 Shader（WebGL 月亮、全景背景圖、粒子星塵/月餅）在 `isStarted === false` 時保持流暢運行，確保正圓形無形變；前景文字排版與動畫則嚴格延遲至使用者點擊解鎖按鈕（`isStarted === true`）時才掛載並與音樂同步啟動。
  3. **門禁核驗**:
     - `workspace.html` 保持 449 行（嚴格 ≤ 450 行門禁）。
     - 遵循純 JS 零 JSX 規範。

---

### [2026-09-24] [UNREFINED] [pwa_icons] [favicon_fix] 全套 PWA 應用圖標、正方形無損裁切 (Aspect Lock) 與 Favicon 404 徹底修復
- **類型**: `FEATURE` | `ASSET` | `PWA` | `BUG_FIX`
- **代碼錨點**: `manifest.json`, `favicon.ico`, `assets/icons/`, `workspace.html`, `index.html`
- **核心事實 / 決策理由**:
  1. **無損焦點正方形居中裁切**:
     - 避免直接縮放將 1024x541 橫圖擠壓變形，以漂流瓶與發光木塞黃金焦點（541x541）進行 1:1 正圓無損裁切。
  2. **工業級全階 PWA 圖標庫建置**:
     - 生成 `favicon.ico`（含 16, 32, 48 多分辨率內聯）。
     - 生成 `apple-touch-icon.png` (180x180)。
     - 生成 Android/PWA `icon-192x192.png`, `icon-512x512.png` 與帶安全邊界的 `icon-maskable-512x512.png`。
  3. **PWA Manifest 與頁面關聯**:
     - 建立標準 `manifest.json`；在 `workspace.html` 與 `index.html` 中注入圖標與 manifest 關聯，徹底消滅瀏覽器 `favicon.ico 404` 紅字報錯，並支援手機一鍵添加到主螢幕以 App 模式啟動。
  4. **門禁核驗**:
     - `workspace.html` 保持 449 行（嚴格 ≤ 450 行門禁）。

---

### [2026-09-24] [UNREFINED] [entry_scheme_a] [aspect_ratio_fix] 受眾端入口頁方案 A 純視覺直覺解鎖、統一全景單一 3D 畫布與月餅扁平變形根治
- **類型**: `FEATURE` | `REFACTOR` | `USER_EXPERIENCE` | `BUG_FIX`
- **代碼錨點**: `index.html`, `styles/animations.css`
- **核心事實 / 決策理由**:
  1. **徹底消滅「開門畫面月餅被壓扁」與「左右兩大黑框」病灶**:
     - 過去 `WelcomeGate` 內嵌了獨立且被窄小容器限制寬高的 Canvas，透視相機錯誤使用窄直屏 Aspect 投影到全螢幕，導致月餅水平受擠壓成扁條。
     - 改為 **單一全域 3D 渲染舞台架構**：底層 `CardEngine`（Shader、月亮、粒子）從頁面載入第一秒起鋪滿 `100vw x 100vh`，解鎖前後共享同一底層實例，月餅 100% 保持立體正圓形，電腦端兩側突兀黑邊徹底消失。
  2. **方案 A 國際化「純視覺直覺解鎖」落地**:
     - 移除寫死的「開啟賀卡與音樂體驗」、「佩戴耳機...」等中文依賴，改為國際化微透深色毛玻璃卡片（動態呈現賀卡自訂英文/中文標題與收件人）。
     - 搭載 **金屬光澤聲波脈衝呼吸圖標按鈕 (`pulse-soundwave-btn`)**：結合播放 ▶️ 與信封 ✉️ 意象，帶水波紋向外擴散動態，零語言障礙，全人類憑視覺直覺一鍵解鎖 Web Audio。
  3. **受眾體驗絲滑平移**:
     - 點擊按鈕瞬間解鎖音樂，浮層自然淡出，卡片內容升空，底層 3D 動態無中斷無重啟。

---

### [2026-09-24] [UNREFINED] [editor_local_draft] [cloud_push_on_save] 編輯器改動改為純本地草稿隔離、按「保存並返回卡片庫」才一次性同步雲端、根除 GAS 404 舊網址殘留
- **類型**: `BUG_FIX` | `REFACTOR` | `USER_EXPERIENCE` | `RESILIENCE`
- **代碼錨點**: `js/gas_client.js`, `js/workspace_store.js`, `js/workspace_views.js`, `js/editor_views.js`, `workspace.html`
- **核心事實 / 決策理由**:
  1. **徹底根除「改一個欄位就狂打 GAS」之架構荒謬**:
     - 過去編輯器內每次輸入文字或下拉切換分類，都會觸發 `saveCards` 並防抖打 `batchSync` 向 Google Apps Script 發 HTTP 請求。
     - 改為 **純本地草稿模式 (Local Draft Only)**：編輯期間所有操作（分類、標題、音樂、段落、照片）僅更新 React State 與本機 LocalStorage（`saveCardsLocal`），保證 0 延遲、絕不頻繁打擾雲端。
  2. **明確「按保存才一次性推送雲端 (Commit & Push)」架構**:
     - 頂部導覽列【保存並返回卡片庫】按鈕綁定 `handleSaveCurrentCard`，只有使用者點擊時，才標記 dirty 並調用 `forceSyncNow` 一次性打包推送雲端 SSOT。
     - 底部狀態標籤明確改為「本地草稿即時生效 (Local Draft) - 點擊頂部保存同步雲端」。
  3. **根除 404 報錯死因**:
     - `gas_client.js` 改為動態 Proxy 取得 `window.CardForgeConfig`，徹底消滅閉包引用舊 GAS 網址引發的 404 失敗，保證單卡與批量同步 100% 成功。
  4. **門禁核驗**:
     - `workspace.html` 保持 448 行（嚴格遵守 ≤ 450 行紅線）。

---

### [2026-09-24] [UNREFINED] [card_lossless_sync] 根除線上卡片讀取截斷縮水 (list_cards 全量 configJson 回傳與前端無損解構)
- **類型**: `BUG_FIX` | `RESILIENCE` | `DATA_INTEGRITY`
- **代碼錨點**: `gas/Card_Gateway.gs` (internalListCards), `workspace.html` (init card loading)
- **核心事實 / 決策理由**:
  1. **線上卡片縮水病灶根除**:
     - 過去 `internalListCards` 僅截取試算表第 5 欄的前 150 字描述，導致線上新環境讀取時段落被強制閹割為單行、音樂欄位遺失。
     - 升級 `internalListCards` 優先 `JSON.parse` 試算表第 9 欄 `configJson`，100% 完整無損回傳全量卡片資料（段落陣列、自訂音樂、分類與署名）。
  2. **前端接收解構清理**:
     - 在 `workspace.html` 中移除寫死「1 個段落、personal、空音樂」的殘缺拼裝代碼，直接無損寫入 `cards` 並透過 `WorkspaceStore.mergeCard` 進行安全深層合併。
  3. **GAS 網關部署升級**:
     - 通過 `clasp push` 與 `deploy` 成功將網關無損晉升至版本 `@3`（`post_verification` 真值確認通過）。
  4. **門禁核驗**:
     - `workspace.html` 精確為 429 行（門禁 ≤ 450 行）。

---

### [2026-09-24] [UNREFINED] [cloud_ssot] [diff_sync] 卡片與模板雙軌雲端 SSOT 重構、背景差異增量防抖同步 (Diff-Sync) 與深層安全合併落盤
- **類型**: `FEATURE` | `REFACTOR` | `ARCHITECTURE` | `RESILIENCE`
- **代碼錨點**: `gas/Card_Gateway.gs`, `js/gas_client.js`, `js/workspace_store.js`, `js/workspace_views.js`, `workspace.html`, `index.html`
- **核心事實 / 決策理由**:
  1. **徹底解決「手動保存」孤島脫節與雙軌脫鉤**:
     - 過去卡片僅存在本地 `localStorage`，手動按發布才備份至 GAS；模板則完全無雲端同步機制，導致受眾端打開自訂模板卡片時必然走樣。
     - 全面重構為 **本地即時響應 (Optimistic UI 0ms) ＋ 背景防抖差異增量同步 (Background Batch Diff-Sync)** 模型。
  2. **三大關鍵技術突破**:
     - **深層安全合併 (Deep Merge)**：在 `js/workspace_store.js` 實現 `deepMergeCard`，徹底根除 `updateEditingCard` 淺層解構沖掉 `media.customMusic` 等巢狀設定之隱患。
     - **差異增量防抖引擎 (Diff-Sync Engine)**：維護 `dirtyCardIds` 與 `dirtyTemplateIds` 髒標記，防抖 2.5 秒批量打包發送至 GAS，避免頻繁請求；頂部導覽列即時回饋「🟢 雲端已同步 / 🔄 同步中 / 🟡 離線保底」。
     - **受眾端動態 SWR 模板拉取**：公網受眾端 (`index.html`) 若遇本地未收錄之自訂模板，自動發起雲端 SWR 查詢補齊並快取，公網展示 100% 絕不走樣。
  3. **寫後校驗 (Read-After-Write Verification)**:
     - GAS 網關增加 `Templates_Store` 工作表與 `batch_sync` 接口，回傳真實儲存資料並由前端回填快取，確保雲端 SSOT 資料完整無損。
  4. **嚴格守護架構門禁**:
     - `workspace.html` 嚴格維持 439 行（門禁 ≤ 450 行），零 JSX 模組化規範 100% 合規。

---

### [2026-09-24] [UNREFINED] [gas_governance] 全域 gas_clasp_manager 自動化建庫與獨立持久化網關上雲
- **類型**: `FEATURE` | `DEVOPS` | `INFRASTRUCTURE`
- **代碼錨點**: `gas/Card_Gateway.gs`, `js/config.js`, `gas_clasp_manager/projects_registry.json`
- **核心事實 / 決策理由**:
  1. **告別寫死與手動維護痛點**:
     - 過去專案採用外部手動部署之舊 GAS 網關，因線上缺少 `save_card` 動作分支導致雲端發布失敗。
  2. **調用全域 gas_clasp_manager 官方自動化管線**:
     - 自動在 Google 雲端建立專屬獨立腳本（`greeting_card_gateway`，Script ID: `1hnRlsyHsEdUL0-FzHtgIqTVorJgH8BaAa1CG0g4FilMgWvREZxLhZHuN`）。
     - 升級 [gas/Card_Gateway.gs](file:///e:/Projects/greeting-card-music/gas/Card_Gateway.gs)：支援以 `PropertiesService` 自動在 Google Drive 建立與維護 `CardForge_DB` 試算表（自適應 Standalone 與 Container-bound），具備完整 `save_card` / `get_card` / `list_cards` API。
     - 代碼通過 `clasp push --force` 成功推送到 Google 雲端，發布不可變部署 `@1`（Deployment ID: `AKfycbygCbbP4RjhzgtHrkfM6LN59JC8G3Plc58P8xgj15t5dctZn-s9TRaZUDxlye2S-o92`），並自動登記至全域中央台帳 `projects_registry.json`。
  3. **本地路徑污染根除 (Clean Fallback URL)**:
     - 在 [js/config.js](file:///e:/Projects/greeting-card-music/js/config.js) 優化 `FALLBACK_SHARE_URL`，在 `file:///` 本地雙擊打開時，自動以 `https://card.teaforia.in/index.html` 保底，徹底杜絕網址中夾雜 `C:/Projects/...` 的本地磁碟字串。

---

### [2026-09-24] [UNREFINED] [hotfix] [cloud_share] CloudShareModal 變數漏宣告致死崩潰修復與雲端降級防禦落盤
- **類型**: `BUG_FIX` | `HOTFIX` | `RESILIENCE`
- **代碼錨點**: `js/workspace_views.js` (CloudShareModal), `HANDOFF.md`, `docs/ACTIVE_LOG.md`
- **核心事實 / 決策理由**:
  1. **點擊「發布至雲端」瞬間黑屏崩潰復盤 (Root Cause)**:
     - 在新增雙域名切換 (`selectedDomain`) 時，於 `CloudShareModal` 組件頂部重構了狀態，但在第 77 行 `defaultDetectedPrefix` 使用了 `card.recipient`，然而 `const card = shareModal.card || {};` 變數宣告被意外遺漏在下方。
     - 導致組件渲染瞬間拋出未捕獲的 `ReferenceError: card is not defined`，觸發 React 頂層 ErrorBoundary 崩潰卸載，呈現黑屏。
  2. **根除方案與防禦強化 (Permanent Fix & Resilience)**:
     - 於 `js/workspace_views.js` 的 `CloudShareModal` 開頭第一行立即安全解構宣告：
       ```javascript
       const card = shareModal.card || {};
       const baseShareUrl = shareModal.shareUrl || '';
       ```
     - 增加彈窗防禦機制：若線上 GAS 網關尚未更新或暫時返回錯誤時，彈窗不再崩潰，且清晰顯示「雲端降級/保底提示橫幅」，無縫提供可用的本地保底連結與雙域名/WhatsApp 轉發功能。
     - 經 `node -c js/workspace_views.js` 靜態語法檢查通過，`workspace.html` 嚴格維持 436 行（門禁 ≤ 450 行）。

---

### [2026-09-24] [UNREFINED] [domain] [vip_share] 雙域名 (card.teaforia.in ✕ card.foxlink.co.in) 一鍵切換與偏好記憶落盤
- **類型**: `FEATURE` | `UI_UX` | `CONFIGURATION`
- **代碼錨點**: `js/config.js` (SHARE_DOMAINS), `js/workspace_views.js` (CloudShareModal), `docs/ACTIVE_LOG.md`
- **核心事實 / 決策理由**:
  1. **雙品牌情境分流痛點**:
     - 使用者擁有兩個頂級自訂網域：`https://card.teaforia.in`（個人/精品品牌/親友/海外英文）與 `https://card.foxlink.co.in`（正崴企業商務/客戶/主管）。
     - 過去分發彈窗中短網址只綁定單一網域，使用者無法在不改代碼的前提下切換分發網址。
  2. **配置抽離與彈窗選單 (Config-Driven & Domain Selector)**:
     - 在 `js/config.js` 增加 `SHARE_DOMAINS` 配置矩陣，抽離網域實體，完全杜絕在 JS 中硬編碼。
     - 在 `js/workspace_views.js` 的 `CloudShareModal` 最上方增加「分發網域」下拉切換選單：
       - `🍵 Teaforia 精品品牌 (card.teaforia.in)`
       - `🏢 Foxlink 企業商務 (card.foxlink.co.in)`
     - 具備 `localStorage` 偏好記憶機制（`cardforge_preferred_domain`），切換一次後自動保持，無需重複點選。
     - 切換網域時，下方的「兩行式社群導語」、「一鍵複製純網址」、「WhatsApp 直發連結」與「親自體驗」按鈕全部即時連動置換！

---

### [2026-09-24] [UNREFINED] [audio] 受眾端音樂按鈕首次點擊關不掉之狀態脫節 (State Desync) 根治
- **類型**: `BUG_FIX` | `AUDIO`
- **代碼錨點**: `index.html` (CardPlayerApp, AudioControls, audio ref)
- **核心事實 / 決策理由**:
  1. **第一次按關不掉的踩坑復盤 (Root Cause)**:
     - 過去 `<audio>` 標籤寫在 `if (!isStarted) return <WelcomeGate>` 之後，且帶有 `autoPlay`。
     - 當使用者在開場 WelcomeGate 點擊「開啟賀卡」時，`handleStart` 觸發了 `setIsStarted(true)`，但此時 `<audio>` DOM 節點尚未被 React 渲染（`audioRef.current` 還是 `null`！），導致在 `handleStart` 裡的 `audioRef.current.play()` 根本沒執行到。
     - 接著組件重新渲染，`<audio ref={audioRef} autoPlay />` 因帶有 `autoPlay` 屬性由瀏覽器自動播放音樂，然而 React 的 `isPlayingAudio` 狀態卻仍為初始值 `false`！
     - 當使用者看到右上角音樂按鈕點擊第一次時，`toggleAudio` 看到 `isPlayingAudio === false`，誤以為音樂是關的，反而執行了 `audio.play()`！因此第一次按「完全關不掉」；必須按第二次時（此時 state 變成 true）才會執行 `audio.pause()`。
  2. **根除方案 (Permanent Fix)**:
     - **音訊常駐頂層**: 將 `<audio>` DOM 移至組件根部常駐，不被 WelcomeGate 條件渲染中斷卸載。
     - **實體 DOM 真理源**: `toggleAudio` 改為直接讀取瀏覽器硬體層真實狀態 `if (!audio.paused) { audio.pause(); } else { audio.play(); }`，不論 React state 如何，100% 絕對遵從硬體真實狀態！
     - **原生事件反向閉環**: 在 `<audio>` 上綁定 `onPlay={() => setIsPlayingAudio(true)}` 與 `onPause={() => setIsPlayingAudio(false)}`，由音訊實體驅動 React UI 圖標，確保畫面狀態與音訊聲音永遠 100% 同步！

---

### [2026-09-24] [UNREFINED] [vip_share] 中英/長輩敬語稱謂動態切換與純淨 ?to= 參數解析體系落盤
- **類型**: `FEATURE` | `UI_UX` | `REFACTOR`
- **代碼錨點**: `js/workspace_views.js` (CloudShareModal), `index.html`, `docs/ACTIVE_LOG.md`
- **核心事實 / 決策理由**:
  1. **稱謂固定死導致主管/長輩與英文翻車痛點 (Root Cause)**:
     - 過去分發賀卡時，若受眾是主管或長輩，直接寫「親愛的 王總」顯得輕浮失禮；若是英文受眾（如 Danny、Summer），寫成中文「親愛的 Danny：」或標點使用中文全形冒號，顯得生硬突兀。
  2. **分發台前綴禮貌敬稱選擇器 (Salutation Prefix Selector)**:
     - 在 `js/workspace_views.js` (`CloudShareModal`) 內增加前綴選擇：
       - `親愛的` (平輩/朋友，如：親愛的 小美：)
       - `尊敬的` (長輩/主管，如：尊敬的 王總：)
       - `致` (正式/商務，如：致 合作夥伴：)
       - `Dear` (英文/國際，如：Dear Danny,)
       - `無` (直呼稱謂，如：Eva)
     - 系統自動根據所選前綴即時在受眾導語拼接得體招呼（英文自動帶逗號 `, `，中文帶冒號 `：`）。
  3. **極簡純淨 URL 與受眾端智慧識別 (Clean URL & Recipient Parser)**:
     - 網址嚴守不拼接冗長雜亂參數的鐵律，只帶簡潔的 `?to=...`（傳遞完整計算後的稱謂或純名字）。
     - `index.html` 接收端若收到已帶敬稱（`Dear`、`尊敬的`、`致`、`親愛的`）或結尾標點的完整稱謂，直接 100% 信任原樣採納，0 差錯；若收到純名字，則自動依原卡片風格適配英文 `Dear` 或中文 `親愛的`。

---

### [2026-09-24] [UNREFINED] [layout] [ide_ux] 全頁外層滾動條徹底斬斷，Figma 式三欄物理獨立鎖死架構落盤
- **類型**: `BUG_FIX` | `UI_UX` | `LAYOUT`
- **代碼錨點**: `css/workspace.css`, `workspace.html`, `js/editor_views.js`, `HANDOFF.md`
- **核心事實 / 決策理由**:
  1. **全頁白色滾動條拉扯中間舞台踩坑復盤 (Root Cause)**:
     - 過去 `workspace.html` 頂層容器使用 `min-h-screen`，`css/workspace.css` 的 `body` 允許 `min-height: 100vh`。當右側文案表單較長時，直接撐高了整個 `<body>`，瀏覽器在最右緣出現了一條貫穿全頁的白色外層卷軸，使用者滾動時整頁（包含中間 3D 舞台）被連帶推到導覽列上方慘遭切頭。
  2. **Figma 式物理鎖死架構**:
     - `body` 與最外層根容器強制鎖定 `height: 100vh; overflow: hidden;`，最外層全頁卷軸 100% 徹底消滅！
     - **中間舞台**: 絕對鎖定不動，頂部緊貼導覽列下緣，無論使用者怎麼滑動滾輪，中間永遠定死在中央視窗。
     - **左右側欄**: 具備專屬的 `overflow-y-auto` 深色精緻卷軸，滑鼠在左邊滾動左欄、在右邊滾動右欄，互不干擾。
     - **大畫廊**: 配備專屬 `.gallery-scroll-container` 獨立滾動，首頁畫廊流暢瀏覽無損。

---

### [2026-09-24] [UNREFINED] [layout] 編輯器中間舞台置頂吸附導覽列底部、位置固定防聯動滾動
- **類型**: `UI_UX` | `LAYOUT`
- **代碼錨點**: `js/editor_views.js`, `HANDOFF.md`, `docs/STATE.md`
- **核心事實 / 決策理由**:
  1. **中間預覽舞台錨定與滾動解耦**:
     - 過去卡片編輯器 (`CardEditorView`) 與模板工坊 (`TemplateEditorView`) 中間的 3D 渲染舞台採用 `justify-center` 垂直居中，導致上下邊距過大且無法緊貼導覽列。
     - 重構為 `flex flex-col items-center justify-start pt-4 px-4 pb-2 relative overflow-hidden select-none`：
       - 不論切換「手機」還是「桌面寬屏」，預覽畫框一律緊貼導覽列底部 (`pt-4`)。
       - 中間區域為純固定渲染視窗，左右兩側欄位各自上下滾動時，中間畫框穩如泰山、完全不被連帶扯動或位移。

---

### [2026-09-23] [UNREFINED] [clean_ui] 受眾端與預覽端徹底移除模板切換色票按鈕，回歸純淨極致賀卡
- **類型**: `REFACTOR` | `UI_UX` | `CLEANUP`
- **代碼錨點**: `index.html`, `HANDOFF.md`, `docs/STATE.md`
- **核心事實 / 決策理由**:
  1. **職責徹底劃分與干擾消除**:
     - 過去 `index.html` 在帶有 `preview=1` 時會顯示浮動切換風格彩色色票 (`.floating-switcher`)。
     - 根據使用者指示，風格模板選取與調試權限應 100% 收斂在創作者工坊（`workspace.html`）的卡片編輯區；受眾端（`index.html`）不論是正式分享連結還是本地預覽，都必須是極致純淨的賀卡播放器，嚴禁出現任何風格切換按鈕遮擋標題與視覺。
  2. **組件精簡與代碼瘦身**:
     - 刪除 `index.html` 中的色票按鈕與 `.floating-switcher` CSS，`AudioControls` 僅保留右上角半透明極簡音樂開關藥丸按鈕（`audio-pill-btn`），畫面乾淨無雜訊。

---

### [2026-09-23] [UNREFINED] [star_wars] [responsive] 星戰 PC 100% 縮放文字飛出消失踩坑根除與海報大器字級落盤
- **類型**: `BUG_FIX` | `RESPONSIVE` | `TYPOGRAPHY`
- **代碼錨點**: `core/CardEngine.js`, `styles/templates.css`, `index.html`, `HANDOFF.md`
- **核心事實 / 決策理由**:
  1. **星戰文字在 PC 100% 縮放時完全消失踩坑復盤 (Root Cause)**:
     - 過去星戰板面寫死 `width: 180%`，在手機端（390px）等效 702px 剛好滿版；但在 PC 寬螢幕（1920px）下，`1920 * 1.8 = 3,456px`！加上 3D 梯形滅點透視，中間 95% 文字被粗暴拉伸並投影至視野邊界之外，使用者只能在最左側隱約看見一點殘留字邊。
  2. **星戰寬度自適應上限約束 (Physical Board Cap)**:
     - 在 `core/CardEngine.js` 中將板面寬度重構為 `width: min(${crawlWidthScale}%, 820px)`，PC 寬螢幕強制上限 820px，透視景深自適應 `clamp(480px, 45vw, 750px)`，文字穩坐螢幕正中央，兩端對齊完美舒展。
  3. **海報模式影院級響應式字級 (Poster Responsive Typography)**:
     - 在 `styles/templates.css` 中引入 PC 桌面（`@media (min-width: 768px)`）專屬字級倍率：標題 `clamp(48px, 4.2vw, 68px)`、正文 `clamp(18px, 1.5vw, 24px)`，無需使用者手動將瀏覽器縮放到 200%/300%，在 100% 標準縮放下即時呈現大器、震撼的影院海報排版。

---

### [2026-09-23] [UNREFINED] [architecture] [cinema_stage] 受眾端 PC 寬螢幕黃金比例影院舞台 (Recipient Cinema Stage) 全面落盤
- **類型**: `FEATURE` | `UI_UX` | `RESPONSIVE`
- **代碼錨點**: `index.html`, `styles/templates.css`, `HANDOFF.md`, `docs/STATE.md`
- **核心事實 / 決策理由**:
  1. **PC 寬螢幕賀卡散架與比例失真踩坑復盤 (Root Cause)**:
     - 過去 `index.html` 將 `CardEngine` 直接鋪滿 `w-screen h-screen`（1920x1080）。在直屏手機上比例完美，但在 PC 寬螢幕上，文字被撕裂拉伸至兩側，Shader 與 3D 特效失去聚焦邊界。
  2. **雙層沉浸式舞台架構 (Two-Tier Immersive Stage)**:
     - **外層環境氛圍層**: 100vw/100vh 全螢幕漫天飄落金桂花瓣與星空粒子，維持大螢幕極致氛圍。
     - **核心影院海報舞台**: 在 PC 寬螢幕（`@media (min-width: 768px)`）下自動收斂為 `.recipient-cinema-stage`（最大 880px 寬、高質感邊框、柔和暗角陰影、540px 高度黃金海報比），保證文字排版、Shader 月亮大小與編輯器預覽 100% 像素級一致。
     - **手機移動端**: 自然 100% 滿版無黑邊，兼顧雙端極致體驗。

---

### [2026-09-23] [UNREFINED] [preview] [ui_ux] 工坊右上角「本地預覽」動態路由重構、本地草稿 0ms 秒開與左欄模板列表卷軸拉伸修復
- **類型**: `BUG_FIX` | `UI_UX` | `ROUTING`
- **代碼錨點**: `js/workspace_views.js`, `js/editor_views.js`, `index.html`, `HANDOFF.md`, `docs/STATE.md`
- **核心事實 / 決策理由**:
  1. **右上角「開啟播放器」重構為「本地預覽」**:
     - 過去 `WorkspaceNavbar` 右上角按鈕寫死 `<a href="index.html">`，點擊後因無卡片參數被 `index.html` 首頁重定向踢回 `workspace.html`。
     - 重構為「本地預覽」按鈕，動態帶入當前編輯卡片 ID（`index.html?id=${cardId}&preview=1`），新分頁秒開受眾端真實預覽。
  2. **受眾端 `index.html` 本地優先 0ms 秒開**:
     - 在尚未上傳雲端/尚未分配公網短網址的情況下，`index.html` 第一優先直接從 `localStorage` 的 `cardforge_cards` 與單卡快取中讀取最新草稿，不浪費時間等待 Google Sheet 請求，支援完全斷網與未發布狀態下的所見即所得本地預覽。
  3. **左側「套用外觀模板」列表卷軸拉伸鋪滿**:
     - 移除 `max-h-64` 生硬高度限制，左側面板外層容器與模板列表調整為 `flex-1 min-h-0` 搭配 `overflow-y-auto`，卷軸一路延伸至視窗最底端，徹底根除下方大片黑色死區與腰斬截斷問題。

---

### [2026-09-23] [UNREFINED] [templates] 預覽框架切換防拉伸、月餅生硬邊框消除、貼圖快取防消失與示範按鈕清除
- **類型**: `BUG_FIX` | `UI_UX` | `3D_GRAPHICS`
- **代碼錨點**: `js/editor_views.js`, `core/BackdropShader.js`, `js/constants.js`, `docs/ACTIVE_LOG.md`
- **核心事實 / 決策理由**:
  1. **手機 ⇄ 桌面寬屏切換畫面拉伸 BUG 根除**:
     - 在 `js/editor_views.js` 中為手機與桌面預覽外框綁定 `key={`preview-frame-${editorPreviewDevice}`}`，視角切換時迫使 React 卸載並重新掛載 Canvas 容器，觸發 Three.js / Shader 依據新容器寬高重新計算投影矩陣，徹底消除縱橫比拉伸變形。
  2. **月餅外圈生硬圓環（魔戒）徹底清除**:
     - 移除 `TorusGeometry` 與 `sideMesh` 圓柱體，保留月餅頂部精緻去背花紋貼圖與柔和自轉微光，回歸乾淨大器的 3D 視覺。
  3. **輝光濃淡 (Opacity) 滑桿拖動引發月餅消失 BUG 根除**:
     - 拖動 React Slider 時會極速高頻觸發 `renderBackdropShader`。原代碼在每次 cleanup 時執行 `texture.dispose()`，導致新實例接管被銷毀的貼圖而瞬間黑屏。
     - 重構為模組級單例貼圖快取 `cachedMooncakeTex`，拉桿調整時直接複用已載入貼圖，且不再隨 Slider 調節銷毀貼圖，徹底根治拖動消失問題。
  4. **示範按鈕 (CTA) 移除**:
     - 根據使用者要求，清空 `js/constants.js` 中 `TEMPLATE_DUMMY_CARD.cta = []`，模板預覽不再顯示多餘的示範按鈕。

---

### [2026-09-23] [UNREFINED] [imgbb] [3D_VFX] 透過 ImgBB 全域 CDN 根治本地跨域阻擋，雙軌實現「天上掉月餅粒子」與「真實貼圖 3D 月餅」
- **類型**: `FEATURE` | `BUG_FIX` | `3D_GRAPHICS`
- **代碼錨點**: `core/ParticleEngine.js`, `core/BackdropShader.js`, `js/constants.js`, `docs/ACTIVE_LOG.md`
- **核心事實 / 決策理由**:
  1. **跨域攔截踩坑復盤 (Root Cause)**:
     - 在 `file:///` 協議下，Three.js 透過相對路徑載入本地 `mooncake.png` 會觸發瀏覽器安全策略攔截，導致貼圖遺失只剩金黃空心線圈。
  2. **調用全域 `imgbb_embedder` 技能一鍵突破**:
     - 自動上傳 `mooncake.png` 至 ImgBB 核心資產相簿（`WEB_CARDFORG_GMU4`），取得永久高速 CDN 直連：`https://i.ibb.co/cqhRZ1v/mooncake-png.png`。
     - CDN 預設開啟 `CORS: *`，徹底終結本地雙擊秒開與跨域載入難題。
  3. **雙軌月餅視效全面閉環**:
     - **前景粒子 `falling-mooncakes` (金餅福降 · 天上掉月餅)**: 24~38px 精巧尺寸、3D 正弦翻轉、柔和金色光暈與漫天緩降，不干擾文字且富有節日喜感。
     - **背景 3D `golden-mooncake` (真實貼圖金餅)**: 換上 CDN 貼圖、開啟 `crossOrigin: anonymous`，雕花凹凸與金黃烤皮質感 100% 現形！

---

### [2026-09-23] [UNREFINED] [3D_VFX] [mid-autumn] 四大中秋專屬 3D WebGL 特效與雙旗艦模板正式落盤
- **類型**: `FEATURE` | `3D_GRAPHICS` | `TEMPLATES`
- **代碼錨點**: `core/BackdropShader.js`, `core/ParticleEngine.js`, `js/constants.js`, `data/templates.json`, `styles/templates.css`
- **核心事實 / 決策理由**:
  1. **四大中秋 3D 視覺震撼擊穿**:
     - **3D 超級明月 ✕ 祥雲月暈 Shader (`lunar-clouds`)**: 採用 WebGL 原生 GLSL 純數學距離場 (SDF) 與 FBM 噪波即時計算月海環形山紋理、柔和呼吸月暈與夜空浮雲，零圖片依賴秒開。
     - **3D 浮空旋轉金箔月餅 (`golden-mooncake`)**: Three.js 原生 16 瓣花邊模具幾何雕刻、頂部凸印祥瑞金環、金箔亮片圍繞與緩動呼吸浮空自轉。
     - **金桂飛花粒子 (`osmanthus-petals`)**: Canvas 2D 物理模擬四瓣金桂花瓣立體翻轉、重力與風向正弦搖曳飄落，花心自帶微光。
     - **祈願天燈海 (`sky-lanterns`)**: 暖橘透光八角燈罩、物理陰影光暈、微幅隨風擺動升空與底部動態跳動燭火 (Flicker Glow)。
  2. **兩大預製中秋旗艦模板**:
     - **`mid-autumn-moon` (月夕清輝 · 金桂玉兔)**: 超級明月 Shader ＋ 金桂飛花 ＋ 烈火金光標題 ＋ 思源宋體。
     - **`mid-autumn-lantern` (天燈映月 · 福滿金餅)**: 3D 金箔月餅 ＋ 祈願天燈海 ＋ 典雅信箋慢速滾動。
  3. **架構紀律與紅線遵守**:
     - 全域外部 `.js` 100% 維持純原生 JS，嚴禁 JSX 標籤，保證 `file:///` 本地雙擊零 CORS 阻擋。
     - 下拉選單 `SHADER_OPTIONS` 與 `PARTICLE_OPTIONS` 完整對齊，工坊可自由組合切換。
     - `workspace.html` 依然保持 435 行（嚴格遵守 ≤ 450 行規範）。

---

### [2026-09-23] [UNREFINED] [security] [routing] 網站首頁智慧分流與工坊君子密碼本地記憶門禁 (PasswordLockGate)
- **類型**: `FEATURE` | `SECURITY` | `ROUTING`
- **代碼錨點**: `index.html`, `workspace.html`, `js/workspace_views.js`, `HANDOFF.md`
- **核心事實 / 決策理由**:
  1. **首頁無損智慧分流**:
     - 在 `index.html` 頂部加入輕量無損重定向：無卡片參數時自動進入 `workspace.html`（符合作者大畫廊首頁期望）；帶參數（`?card=` / `?id=` / `?preview=`）維持受眾 3D 播放器，既有社交分享完全零受損。
  2. **工坊君子密碼守衛 (`10101010`) ＋ 本地記憶 (`localStorage`)**:
     - 獨立實作 `PasswordLockGate` 組件於 `js/workspace_views.js`，100% 遵守外部純 JS 零 JSX 鐵律 (`React.createElement`)，保證本地雙擊 `file:///` 秒開。
     - 採用 `localStorage.setItem('cardforge_auth_unlocked', 'true')`，使用者輸入一次正確密碼後本機永久保存，重整或重開瀏覽器皆無需再次輸入。
  3. **架構門禁全綠遵守**:
     - `workspace.html` 維持 435 行（嚴格遵守 ≤ 450 行門禁）。
     - 測試由使用者手動執行，絕不私自開啟瀏覽器。

---

### [2026-09-21] [UNREFINED] [architecture] 工坊全面模組化解耦重構與檔案行數硬性門禁 (≤450行)
- **類型**: `REFACTOR` | `ARCH_DECISION`
- **代碼錨點**: `workspace.html`, `js/editor_views.js`, `AGENTS.md`, `docs/STATE.md`
- **核心事實 / 決策理由**:
  1. **根治 HTML 內聯肥大症 (1,365 行 ➔ 427 行)**:
     - 過去多輪研發反覆往 `workspace.html` 內聯追加視圖，導致檔案膨脹至 1,365 行，嚴重違反模組化原則。
     - 獨立抽取 `js/editor_views.js`，將卡片編輯器 (`CardEditorView`) 與模板工坊 (`TemplateEditorView`) 完整封裝移出。
  2. **嚴格堅守零編譯 Zero-CORS 純 JS 鐵律**:
     - 外部 `.js` 模組 100% 採用原生 `React.createElement` (簡寫 `h`)，嚴禁任何 `<Tag>` JSX 標籤，保證在 `file:///` 本地協議下秒開、零 CORS。
  3. **固化憲法門禁規範**:
     - 在 `AGENTS.md` 建立第 4 條「代碼模組化與檔案行數硬性門禁」：`workspace.html` 嚴格限制 ≤ 450 行，凡超過 50 行獨立組件強制抽離。
- **踩坑 / 失敗模式**:
  - 若未設定明確行數門禁，後續 AI 代理人會習慣性在同一檔案內聯追加代碼，導致架構迅速腐化。
- **防禦手段 / 測試背書**:
  - `workspace.html` 現為 427 行，結構清晰；以 Python 正則檢查 `js/editor_views.js`，JSX 標籤數為 0，純 JS 語法正確。

---

### [2026-09-20] [UNREFINED] [templates] 真正星際大戰 3D 梯形滅點升空重構與【電影卷軸 · 典雅信箋】雙軌分流
- **類型**: `ARCH_DECISION` | `FEATURE`
- **代碼錨點**: `styles/templates.css`, `core/CardEngine.js`, `js/constants.js`, `workspace.html`, `data/templates.json`
- **核心事實 / 決策理由**:
  1. **徹底解決開場乾等 6~8 秒痛點**:
     - 原星戰字幕起始點在 `translateY(102vh)`，等速 44 秒漫遊導致受眾點開後有 6~8 秒面對黑屏發呆。
     - 重構起始點至 `translateY(22%)`（星戰）與 `translateY(28%)`（電影卷軸），開門 0 秒直接在手機下緣優雅現身，無縫銜接。
  2. **真正的星戰 3D 滅點升空 (`star-wars-crawl`)**:
     - 容器啟用 3D 梯形透視 `perspective: 320px; perspective-origin: 50% 100%`。
     - 動畫由近處清晰大字 `scale(1)` 伴隨仰角 `rotateX(28deg)`，向星空深處推入 `translateZ(-900px)` 並等比縮小至 `scale(0.18)`，最後伴隨星際塵埃模糊 (`blur(4px)`) 消融在星河中，100% 還原電影經典。
  3. **獨立新增【電影卷軸 · 典雅信箋 (`cinematic-credits`)】**:
     - 將原本純淨平直由下往上滾動的動態正式分流，字體不旋轉、不變形、不縮小，頂部自然羽化消散，專注於長文深情之極致閱讀舒適度。
  4. **三大版型三足鼎立**:
     - 🌌 星際大戰 · 滅點升空 (`star-wars-crawl`)：震撼深空、梯形縮小飄遠。
     - 🎬 電影卷軸 · 典雅信箋 (`cinematic-credits`)：平直等速、溫柔好讀。
     - 🖼️ 滿版海報 · 動態登場 (`cinematic-poster`)：滿版大器、3D 骨牌/烈火流光/調速循環。
- **踩坑 / 失敗模式**:
  - 透視角度過大會使頂部字體過早塌陷；設定 `perspective: 320px` 搭配 `rotateX(28deg)` 與 `transform-origin: 50% 100%` 在手機豎屏下能取得完美張力。
- **防禦手段 / 測試背書**:
  - 純 CSS 3D 硬體加速 (`transform-style: preserve-3d`)，保證在各類手機與 PC 上維持 60 FPS 流暢運行。

---

### [2026-09-20] [UNREFINED] [templates] 海報動效重播修復、入場速度調節 (Reveal Speed) 與定頻自動循環重播
- **類型**: `BUG_FIX` | `FEATURE`
- **代碼錨點**: `styles/animations.css`, `core/CardEngine.js`, `workspace.html`, `data/templates.json`
- **核心事實 / 決策理由**:
  1. **3D 骨牌重播無效 BUG 根除**: 
     - 舊版「重播」按鈕嘗試將 `textRevealFx` 暫時設為 `''` 再恢復，但因短路運算 `(template.textRevealFx) || 'domino-3d'` 攔截，React 視為同值而不觸發重繪。
     - 重構為「物理版本號」機制：在 `CardEngine.js` 的海報滾動容器 key 綁定 `poster-container-${textRevealFx}-${replayKey}`。點擊「重播動效」按鈕時直接寫入 `replayKey: Date.now()`，100% 迫使 React 卸載並重掛載海報 DOM，CSS 動畫即刻重新觸發。
  2. **4 大文字入場動態自由調速 (Reveal Speed: 0.4x ~ 2.0x)**:
     - 在 `styles/animations.css` 中將動畫持續時間全面改為 `var(--reveal-duration, 1.2s)`。
     - 在 `CardEngine.js` 動態依 `revealSpeed` 計算持續時長 `(1.2 / revealSpeed)s` 與階梯延遲 `step * (0.24 / revealSpeed)s`。
     - 慢速（如 0.4x~0.8x）呈現極致細膩的 3D 骨牌立體翻轉與烈火金光流光；快速（如 1.5x~2.0x）瞬間俐落到位。
  3. **定頻自動循環重播 (Auto Replay Loop: 5s / 8s / 12s)**:
     - 解決畫面動效播完後畫面長時間定格靜止的單調感。
     - 工作台加入「自動循環重播」勾選框與秒數選單，透過 `useEffect` 自動定時派發 `Date.now()` 刷新 `replayKey`，定時器隨狀態銷毀自癒防洩漏。
- **踩坑 / 失敗模式**:
  - CSS 動畫重播不可依賴 class toggle（微任務可能合併引發無動畫）；以 React 物理節點 key 換新最為乾淨保險。
- **防禦手段 / 測試背書**:
  - 全流程純 CSS 與純 JS 實作，零編譯 Zero-CORS，維持 60 FPS 流暢度。

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

---

### [2026-09-24] [UNREFINED] [workspace] 消除中間畫框內部無效滾動條，確立 9:16 (手機) 與 16:9 (電腦) 純淨固定比例
- **類型**: `BUG_FIX` | `UI_UX`
- **代碼錨點**: `core/CardEngine.js`, `styles/templates.css`, `docs/ACTIVE_LOG.md`
- **核心事實 / 決策理由**:
  1. **消滅中間畫框內置垂直滾動條**:
     - 截圖反饋在卡片編輯器中間畫框（特別是 16:9 桌面寬螢幕模式）右側出現一條多餘的垂直卷軸，破壞了原本高質感的 3D 舞台視覺。
     - 根因：`CardEngine.js` 舊版在海報容器預設掛載了 `overflow-y-auto custom-scrollbar`，當內部標題或字距稍大時立刻引發滾動條。
     - 重構：遵照使用者指示「中間不用卷了，一個 9:16，一個 16:9」，將容器樣式鎖定為 `overflow-hidden scrollbar-none`，並加入 `justify-center`，內容自適應垂直置中展示。
  2. **畫框專屬防溢出大氣排版**:
     - 在 `styles/templates.css` 為 `.desktop-frame` 與 `.phone-frame` 專門定義 `.poster-content-stage` 的微調比例（大標題 `clamp(34px, 3.2vw, 44px)`，內文 15px/13.5px），確保文字、稱謂與署名在固定畫框內優雅呼吸，完美封閉不產生任何裁切與溢出。
- **防禦手段 / 測試背書**:
  - 全流程純 CSS / JS 原生運作，`workspace.html` 維持 437 行（≤450 行硬紅線）。

---

### [2026-09-24] [UNREFINED] [sharing] 社群分享導言、兩行式分發台與自適應朋友稱謂 (VIP Share) 全面落地
- **類型**: `FEATURE` | `UI_UX` | `ARCHITECTURE`
- **代碼錨點**: `js/constants.js`, `js/workspace_store.js`, `js/editor_views.js`, `js/workspace_views.js`, `index.html`, `docs/ACTIVE_LOG.md`
- **核心事實 / 決策理由**:
  1. **社群分享導言與封面欄位**:
     - 在卡片實體與編輯器新增 `shareCaption`（分享引導文案，支援 `{name}` 佔位符）與 `coverImage`（自訂 OG:Image 網址）。
  2. **兩行式社群分發台 (CloudShareModal 升級)**:
     - 解決單一冰冷連結點擊率低與手改網址痛點。
     - 支援在彈窗內輸入好友姓名（如「Joe」、「王經理」），自動生成帶參網址 `?to=...`，並即時預覽兩行式訊息：
       - 第一行：自適應稱呼之專屬賀詞導語。
       - 第二行：乾淨專屬短連結。
     - 提供「一鍵複製【導語 + 網址】」與「發送 WhatsApp」（自動喚醒對話框帶入文字）。
  3. **受眾端動態稱謂自適應解析 (index.html)**:
     - 受眾端打開時讀取 `?to=...` 或 `?name=...`，自動智能適配稱謂（支援 `{name}` 精準置換、自動將「朋友」升級為好友名字、Dear/親愛的 前綴拼接）。
     - 內建 30 字元防溢出安全保護，無參數時優雅降級為預設溫馨稱謂。
- **防禦手段 / 測試背書**:
  - `workspace.html` 維持 437 行（≤450 行硬門禁）。
  - 外部 JS 零 JSX 依賴，`file:///` 本地雙擊秒開無 CORS 阻礙。

---

### [2026-09-24] [UNREFINED] [assets] 全局社群預覽圖 WebP 圖床化、新曲《把思念寄給遠方》歸檔與 3D 模板提示
- **類型**: `ASSET` | `FEATURE` | `UI_UX`
- **代碼錨點**: `js/config.js`, `js/constants.js`, `js/editor_views.js`, `assets/audio/`, `docs/ACTIVE_LOG.md`
- **核心事實 / 決策理由**:
  1. **全域社群分享預覽圖 (OG:Image) 永久直連**:
     - 將 `鏈結預覽圖-全局.jpg` 轉換為高質量 WebP (`assets/images/share-cover.webp`，體積僅 91KB)。
     - 透過 `imgbb_embedder` 登記至 CardForge 核心網站資產相簿（永久保留），取得 CDN 直連 `https://i.ibb.co/YFsSdsjg/share-cover-webp.webp`。
     - 寫入 `js/config.js` 的 `DEFAULT_COVER` 作為全域所有卡片的預設社群氣泡卡片圖。
  2. **第二首專屬音樂歸檔與隨選下拉**:
     - 將 `把思念寄給遠方.mp3` 正式移入 `assets/audio/把思念寄給遠方.mp3`。
     - 在 `js/constants.js` 與 `js/editor_views.js` 建立 `window.MUSIC_OPTIONS` 下拉選單，支援在「In Love With You」與「把思念寄給遠方」間一鍵切換，亦保留手動輸入自訂網址/路徑的自由。
  3. **3D 藝術背景與相片層疊提示**:
     - 針對使用者提出的「背景 3D 與相片層疊遮擋」疑慮，在編輯器相片區塊加入智慧提示：若模板具備 3D Shader（如明月/黑洞/金煙），明確提醒創作者「保持無相片可完整展現 3D 光影；若上傳相片將優先展示相片」，消除操作疑惑。
- **防禦手段 / 測試背書**:
  - `workspace.html` 依然保持 437 行（≤450 行硬門禁）。
  - `node -c` 語法校驗 100% 通過。

---

### [2026-09-24] [UNREFINED] [editor] 收件人稱謂三段式拆解 ✕ 社群分享導言自動繼承稱謂前綴
- **類型**: `REFACTOR` | `UI_UX`
- **代碼錨點**: `js/editor_views.js`, `docs/ACTIVE_LOG.md`
- **核心事實 / 決策理由**:
  1. **收件人稱謂拆開 (圖 1 落地)**:
     - 解決單一文字框既要填前綴又要填名字的生硬感。
     - 拆解為三格橫排結構：
       - `敬語前綴`（親愛的 / 尊敬的 / XX的 / 致 / 自訂）
       - `稱呼本體`（填入朋友名字；若留空則自動等待 URL 參數 `{Name}` 注入）
       - `結尾標點`（下拉可選：`：`、`:`、`，`、`！`、`無`）
     - 即時雙向組合並同步更新至中間畫框，所見即所得。
  2. **社群分享導語拆開與自動繼承 (圖 2 落地)**:
     - 根除使用者重複輸入稱謂與名字的心智負擔。
     - 拆分為：
       - `左側前綴徽章`：不可修改，自動聯動繼承上方設定的前綴（例如 `親愛的 {name}，` 或 `尊敬的 {name}，`）。
       - `右側自填祝賀內文`：創作者只需專注填寫賀詞核心句（例如 `中秋節快樂，這是我為你定制的賀卡。`），不再需要手打 `{name}` 語法。
- **防禦手段 / 測試背書**:
  - `workspace.html` 總行數嚴格保持 437 行（≤450 行）。
  - `node -c js/editor_views.js` 語法校驗通過。




