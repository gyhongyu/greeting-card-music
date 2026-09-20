# 🏛️ 專案當前狀態與架構憲法 (STATE.md)
> ⚠️ **【治理紀律：本檔案嚴格保持 ≤ 200 行，為專案唯一單一真理庫 (SSOT)】**  
> 最後校準日期：2026-09-20 | 狀態：穩態研發中

---

## 🎯 1. 專案定位 (Mission & Scope)
- **專案名稱**：Greeting Card Music & Studio (CardForge)
- **核心價值**：人類 × AI 雙引擎可視化 3D 動態音樂賀卡與旗艦模板工坊。為家人、親友、高管與戰略夥伴提供極致尊榮的 WebGL / Three.js 沉浸式賀卡體驗。
- **運行架構**：100% 純前端靜態託管（GitHub Pages 相容），無伺服器後端依賴。

---

## ⛔ 2. 不可違背之架構不變量 (Hard Invariants)

1. **畫廊優先鐵律 (Gallery-First Invariant)**：
   - `workspace.html` 預設進入視圖**必須且只能是「首頁大畫廊看板 (Gallery Dashboard)」**。
   - **絕對嚴禁默認強行進入三欄編輯模式**。卡片清單與模板庫必須是寬大、平鋪的卡片展示架（Cards Grid），具備即時預覽、一鍵分享、複製與編輯按鈕。
   - 只有使用者明確點擊「編輯內容」或「＋新增卡片」時，才切換進入編輯器視圖；且編輯器頂部必須具備顯眼的 `[← 返回卡片庫]` 按鈕。

2. **卡片與模板物理徹底解耦 (Decoupled Card vs Template)**：
   - **模板 (Templates)**：純視覺規範（3D WebGL Shader、Three.js 粒子特效、字體排版、配色方案）。僅具備目測排版專用的佔位示範文案（`TEMPLATE_DUMMY_CARD`），**嚴禁直接發布給受眾**。
   - **卡片 (Cards)**：具體卡片實例（受眾稱謂、專屬祝詞正文、專屬照片、署名、套用 templateId）。卡片套用模板，但絕不污染模板定義。

3. **靜態純前端與本地快取同步 (Zero-Backend & Local-First)**：
   - 資料底座為 `data/cards.json` 與 `data/templates.json`。
   - 編輯過程即時同步至瀏覽器 `localStorage`（`cardforge_cards` / `cardforge_templates`）。
   - 具備一鍵完整 JSON 台帳匯出/備份機制。

4. **受眾端純淨極致沉浸 (Audience Player Isolation)**：
   - `index.html` 專門用於受眾點擊分享連結（`?card=xxx`）時全螢幕播放。
   - 嚴禁在受眾播放器中混入任何後台管理或編輯控制元件。

---

## 🗺️ 3. 模組職責地圖 (Architecture Map)

| 路徑 / 檔案 | 核心職責 | 關鍵依賴 |
|-------------|----------|----------|
| `workspace.html` | 工坊總台：首頁卡片畫廊、模板畫廊、單卡所見即所得編輯器、微調彈窗 | React 18, Babel, Tailwind, Three.js |
| `index.html` | 受眾端公開沉浸式播放器：星戰漫遊、方盒卡片、音訊播放、全螢幕 | React 18, Three.js, BackdropShader |
| `core/CardEngine.js` | 卡片排版渲染引擎（星戰漫遊升空、精裝方盒卡片、照片輪播） | React, ParticleEngine |
| `core/ParticleEngine.js` | 3D 前景粒子引擎（落櫻 petals、星塵 gold-dust、流星 gold-leaf、黑洞、衛星） | Three.js / Canvas 2D |
| `core/BackdropShader.js` | 3D 背景 Shader 渲染器（WebGL 絲綢金煙、軌道行星、賽博全息） | Three.js / WebGL |
| `data/cards.json` | 卡片實例資料庫台帳（SSOT） | JSON |
| `data/templates.json` | 旗艦風格模板規格庫台帳（SSOT） | JSON |
| `styles/templates.css` | 模板主題樣式、字體、背景漸變與光影 CSS 變數 | CSS |

---

## 📌 4. 已知待修項目清單 (Known Issues Tracking)
> 此處僅記錄待後續迭代的 Bug，遵循「不准動代碼」指令，暫不實施修改：
- [ ] 模板管理中部分舊標籤與粒子名稱對齊（如 petals vs sakura-canvas）。
- [ ] 某些 Shader 在部分手機瀏覽器上的 WebGL 內容尺寸自適應。
- [ ] 編輯卡片時若無相片，方盒版型的上下間距微調。
