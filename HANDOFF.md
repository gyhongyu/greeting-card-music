# 📋 專案工作交接文檔 (HANDOFF.md)
> ⚠️ **【鐵律：專案唯一單一真理源 (SSOT)】**  
> 本檔案由 `handover_generator` 自動維護並原子覆寫，禁止產生影子交接文檔。  
> 交接時間：2026-09-20 23:15 | 交接狀態：方盒渲染對齊、前後景 3D 雙軌多維調參完工、等待驗收

---

## 0. 🧠 智腦不二過記憶突觸 (Brain Synapse & Anti-Failure DNA)

- **會話突觸 ID**：`56d99818-aaa8-44a9-af2d-be30f3ea80e5`
- **上游核心突破**：
  1. **方盒卡片無法渲染根因修復**：`constants.js` 的 `fixed-card` 與 `CardEngine.js` 的 `boxed-card` 鍵值未對齊導致渲染 Fall-through。升級為雙向相容相認，精緻磨砂玻璃方盒立刻正常呈現。
  2. **背景 3D WebGL Shader 雙軌控制**：支援輝光濃淡 (Opacity: 20%~100%) 與動態流速 (Speed: 0.2x~2.0x)，自適應控制 GLSL 金煙、Three.js 星球與全息點雲。
  3. **前景 3D 粒子物理引擎三軌控制**：升級為發射密度 (10~80)、粒子透明度 (20%~100%) 與飄落/升騰速度 (0.4x~2.0x)，徹底杜絕粒子擋字搶戲。
  4. **智慧條件收合**：在 `workspace.html` 中，當選中 `none` 時無關拉桿自動隱藏，保持編輯介面清爽。
- **不可違背之血淚紅線**：
  - 🚨 **絕對禁止私自開啟瀏覽器（`browser_subagent`）測試**，測試是使用者的工作，驗收全權交由使用者手動執行。
  - 🚨 **絕對禁止主動發起 `git push`**。
  - 🚨 **接手後若提示詞提及【討論模式】，嚴禁直接修改代碼或生成實體文件**，直到使用者明確輸入「結束討論」。
  - 🚨 **外部 `.js` 檔絕對禁止包含 JSX 語法**，一律使用 `React.createElement`。

---

## 1. 系統現況與已固化基線 (System Baseline)

| 模組 / 檔案 | 當前狀態 | 關鍵特性與職責 |
| :--- | :--- | :--- |
| `workspace.html` | 穩態 (904 行) | 創作者 PC 大螢幕畫廊工坊，預設首頁為大看板畫廊，無內聯巨石，裝配純 JS 視圖庫與條件渲染 |
| `index.html` | 奇怪/穩態 (369 行) | 受眾端終端播放器，具備 `WelcomeGate` 開門手勢解鎖 Web Audio、SWR 秒開、離線降級 |
| `core/CardEngine.js` | 穩態 (純 JS) | 跨雙端渲染舞台，零編譯 Zero-CORS 純 JS，動態 Canvas Key 隔離 WebGL Context，支援星戰與方盒雙版型 |
| `core/BackdropShader.js` | 穩態 (純 JS) | 3D WebGL 著色器總管，支援容器尺寸自適應、WebGL 顯式 Context 釋放與高對比金煙 |
| `styles/templates.css` | 穩態 | 模板樣式庫，包含 0%~28% 平滑淡出的 `.crawl-mask-container` 遮罩 |
| `js/workspace_views.js` | 穩態 (純 JS) | 工坊核心視圖組件庫：`PreviewModal`, `CloudShareModal`, `WorkspaceNavbar`, `CardsGallery`, `TemplatesGallery` |
| `js/workspace_store.js` | 穩態 (SSOT) | 純 JS 資料儲存，管理 `cardforge_cards`、`cardforge_templates`、LocalStorage 與 JSON 降級 |
| `js/image_uploader.js` | 穩態 (純 JS) | 圖片 WebP 極致壓縮與 ImgBB 免費 CDN 直傳 |

---

## 2. 下一步工作與驗收說明 (Next Steps)

1. 請使用者在本地瀏覽器重新整理（F5）`workspace.html`，進入模板設計工坊驗證：
   - [ ] **星戰文字淡出**：向上漫遊時是否在頂部大標題下方平滑淡出，不再發生字疊字。
   - [ ] **3D Shader 切換**：切換 `silk-smoke`、`particle-orbit`、`hologram` 與 `none`，確認特效正常顯現且絕不再出現白屏崩潰。
   - [ ] **方盒卡片與拉桿聯動**：切換至「精裝方盒卡片」，確認磨砂玻璃方盒正常居中顯現，且左側漫遊速度拉桿自動隱藏。
