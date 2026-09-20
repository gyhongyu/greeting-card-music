# 💌 CardForge (Greeting Card Music)
> **人類 × AI 雙引擎可視化 3D 動態音樂賀卡與旗艦模板工坊**  
> 零編譯 · 免伺服器 · 雙擊即用 · 雲端持久化 · 社交動態預覽

---

## 🌟 專案簡介 (Overview)

**CardForge** 是一套專為個人與企業打造的頂級 3D 動態音樂賀卡工坊。具備強大的 WebGL 視覺特效、Three.js 空間粒子系統與動態排版能力，讓每一份祝福都如同一場微型視聽盛宴。

本專案採用 **「三角雙軌架構」**，兼顧極致的在地化體驗與便捷的雲端分享：
- **創作者工坊 (`workspace.html`)**：專為 PC 大螢幕打造的看板大畫廊與 WYSIWYG 三欄實時編輯器。
- **受眾端播放器 (`index.html`)**：受眾開啟專屬連結（`?id=xxx`）時的純淨全螢幕 3D 音樂賀卡播放器。
- **Google Sheet 雲端持久化**：改動卡片直接透過輕量 GAS 網關存入試算表，徹底告別「每改動一個字就要做一次 Git Commit」的繁瑣流程。
- **Cloudflare 邊緣社交預覽**：自動攔截 LINE、Facebook、WhatsApp 爬蟲並動態注入 Open Graph 標籤，分享卡片連結時即刻呈現專屬封面與祝福文案。

---

## 🚀 極速上手 (Quick Start)

### 1. 本地直接執行 (零編譯雙擊即開)
本專案堅持 **Zero-Build & Zero-CORS** 哲學，無須安裝 Node.js、Webpack 或啟動任何本地伺服器：
- **進入創作者工坊**：在檔案總管雙擊開啟 [`workspace.html`](file:///e:/Projects/greeting-card-music/workspace.html)。
- **體驗受眾端播放器**：雙擊開啟 [`index.html`](file:///e:/Projects/greeting-card-music/index.html)，或在網址帶入參數 `index.html?id=mothers-day`。

### 2. 雲端部署 (GitHub Pages)
直接將靜態檔案託管於 GitHub Pages 即可上線：
```bash
https://<你的帳號>.github.io/<倉庫名>/workspace.html   # 工坊總台
https://<你的帳號>.github.io/<倉庫名>/index.html?id=xxx # 受眾專屬賀卡
```

---

## 🏛️ 模組與檔案結構 (Project Structure)

```
greeting-card-music/
├── workspace.html             # 🎨 創作者 PC 大螢幕工坊（大畫廊看板、卡片/模板實時編輯器）
├── index.html                 # 🎬 受眾端終端播放器（開門遮罩、Web Audio 解鎖、SWR 秒開）
│
├── js/
│   ├── workspace_store.js     # 💾 【全域單一資料源】純 JS 狀態儲存、LocalStorage、JSON 降級保底
│   ├── gas_client.js          # ☁️ Google Sheet 雲端持久化 API 客戶端（SWR 雙層快取）
│   └── config.js              # ⚙️ 全域前端設定檔（GAS 網關端點、短分享網域配置）
│
├── core/
│   ├── ParticleEngine.js      # ✨ 前景 3D/2D 粒子引擎（落櫻、星塵、流星、黑洞渦流）
│   ├── BackdropShader.js      # 🌌 背景 WebGL Shader 渲染器（絲綢金煙、軌道行星）
│   └── CardEngine.js          # 📜 卡片動態文字排版渲染器（星戰漫遊升空、精裝方盒卡片）
│
├── data/
│   ├── cards.json             # 📇 預設卡片離線保底台帳
│   └── templates.json         # 🎭 旗艦風格模板規格庫保底台帳
│
├── styles/
│   ├── animations.css         # 🎞️ 賀卡核心動態動畫特效庫
│   └── templates.css          # 🎨 模板色彩變數與主題樣式類別
│
├── assets/
│   └── audio/                 # 🎵 高音質背景音樂庫（如 In Love With You.mp3）
│
├── gas/
│   └── Card_Gateway.gs        # 🚀 Google Apps Script 萬能網關（零門檻試算表資料庫）
│
├── cloudflare/
│   └── worker_og_proxy.js     # 🌐 Cloudflare Worker 邊緣社交預覽代理（動態 OG 注入）
│
├── docs/                      # 📚 專案研發知識庫 (DMC Protocol)
│   ├── STATE.md               # 📌 架構不變量與目錄地圖（≤200行，AI 單一真理源）
│   └── ACTIVE_LOG.md          # 📝 原子開發日誌與避坑復盤指南
│
└── AGENTS.md                  # 🛡️ AI 代理人開發憲法與工程規範
```

---

## 💡 核心功能亮點 (Key Highlights)

1. **大畫廊優先 (Gallery-First Dashboard)**：
   進入 `workspace.html` 即刻呈現所有精選卡片與風格模板的大看板，直覺提供「一鍵預覽」、「複製雲端分享短鏈」、「複製卡片」與「進入編輯」。
2. **PC 大螢幕三欄工坊**：
   專為電腦寬螢幕打造，左欄參數表單、中央 3D 視角畫布、右欄 Shader 與粒子特效微調，具備手機畫框與寬螢幕一鍵切換。
3. **極致視聽沉浸**：
   - **開門手勢解鎖**：完美相容 iOS Safari 與 Android Chrome 安全策略，受眾點擊開門同時解鎖背景音樂與全螢幕。
   - **多維視效組合**：支援落櫻紛飛、黃金星塵、流星劃過等粒子，結合 WebGL 絲綢金煙背景。
4. **離線容災防護**：
   即刻斷網亦能透過本地 `localStorage` 與 `data/*.json` 完整渲染，達成「0 崩潰、0 白屏」。

---

## 🛠️ 開發規範與治理 (Engineering Invariants)

- **純 JS 協議**：外部 `.js` 模組一律保持純 JavaScript（嚴禁 JSX 語法），確保本地 `file:///` 協議下秒開無跨域報錯。
- **單一真源 (SSOT)**：所有資料讀寫一律收斂至 `js/workspace_store.js`，受眾端與工坊端共享同一套規格。
- **測試邊界**：所有視覺與音訊體驗由人類開發者手動點擊驗收，保證最真實的感官回饋。

---

© 2026 CardForge. Crafted with ❤️ and modern web standards.