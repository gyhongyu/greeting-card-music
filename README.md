# 💌 CardForge (Greeting Card Music)
> **人類 × AI 雙引擎可視化 3D 動態音樂賀卡與旗艦模板工坊**  
> 零編譯 · 免伺服器 · 雙擊即用 · 雲端持久化 · 雙網域秒開 · 社交動態預覽

---

## 🌟 專案簡介 (Overview)

**CardForge** 是一套專為個人與企業打造的頂級 3D 動態音樂賀卡工坊。具備強大的 WebGL 視覺特效、Three.js 空間粒子系統與動態文字排版能力，讓每一份祝福都如同一場震撼的微型視聽盛宴。

本專案採用 **「三角雙軌架構」**，兼顧極致的在地化體驗與便捷的雲端分享：
- **創作者工坊 (`workspace.html`)**：專為 PC 大螢幕打造的看板大畫廊與所見即所得實時編輯器（已模組化解耦至 `js/editor_views.js`，維護性極高）。
- **受眾端播放器 (`index.html`)**：受眾開啟專屬連結（`?id=xxx`）時的純淨全螢幕 3D 音樂賀卡播放器。
- **Google Sheet 雲端持久化**：改動卡片直接透過輕量 GAS 網關存入試算表，徹底告別「每改動一個字就要做一次 Git Commit」的繁瑣流程。
- **雙網域鏡像支援 (Dual-Domain Live)**：
  - 商務夥伴推薦：`https://card.foxlink.co.in` (GitHub Pages 主網域)
  - 個人親友推薦：`https://card.teaforia.in` (Cloudflare 邊緣隱式鏡像)
- **Cloudflare 邊緣社交預覽**：自動攔截 LINE、Facebook、WhatsApp 爬蟲並動態注入 Open Graph 標籤，分享卡片連結時即刻呈現專屬封面與祝福文案。

---

## 🚀 極速上手 (Quick Start)

### 1. 本地直接執行 (零編譯雙擊即開)
本專案堅持 **Zero-Build & Zero-CORS** 哲學，無須安裝 Node.js、Webpack 或啟動任何本地伺服器：
- **進入創作者工坊**：在檔案總管雙擊開啟 [`workspace.html`](workspace.html)。
- **體驗受眾端播放器**：雙擊開啟 [`index.html`](index.html)，或在網址帶入參數 `index.html?id=mothers-day`。

### 2. 線上雲端存取 (Live Demo)
可以直接連線至官方託管之線上服務：
```bash
# 創作者工坊
https://card.foxlink.co.in/workspace.html
https://card.teaforia.in/workspace.html

# 受眾端專屬賀卡
https://card.foxlink.co.in/?id=mothers-day
https://card.teaforia.in/?id=mothers-day
```

---

## 🏛️ 模組與檔案結構 (Project Structure)

```
greeting-card-music/
├── workspace.html             # 🎨 創作者 PC 大螢幕工坊（大畫廊看板、頂層路由調度器，嚴格 ≤450 行）
├── index.html                 # 🎬 受眾端終端播放器（開門遮罩、Web Audio 解鎖、SWR 秒開）
├── CNAME                      # 🌐 GitHub Pages 自定義主網域設定 (card.foxlink.co.in)
│
├── js/
│   ├── workspace_views.js     # 🖼️ 【純 JS】工坊核心視圖庫（大畫廊清單、導覽列、預覽與分享彈窗）
│   ├── editor_views.js        # 🛠️ 【純 JS】編輯器視圖庫（卡片編輯器 CardEditorView、模板設計工坊 TemplateEditorView）
│   ├── workspace_store.js     # 💾 【全域單一資料源】純 JS 狀態儲存、LocalStorage、JSON 降級保底
│   ├── gas_client.js          # ☁️ Google Sheet 雲端持久化 API 客戶端（SWR 雙層快取）
│   ├── image_uploader.js      # ⚡ 圖片 Canvas 等比縮放 + WebP 80% 極致壓縮 + 直傳 ImgBB CDN
│   └── config.js              # ⚙️ 全域前端設定檔（GAS 網關端點、短分享網域配置）
│
├── core/
│   ├── ParticleEngine.js      # ✨ 前景 3D/2D 粒子引擎（落櫻、星塵、流星、黑洞渦流）
│   ├── BackdropShader.js      # 🌌 背景 WebGL Shader 渲染器（絲綢金煙、軌道行星、賽博全息）
│   └── CardEngine.js          # 📜 卡片動態文字排版渲染器（星戰滅點升空、電影卷軸、滿版海報 4 大文字特效）
│
├── data/
│   ├── cards.json             # 📇 預設卡片離線保底台帳
│   └── templates.json         # 🎭 旗艦風格模板規格庫保底台帳
│
├── styles/
│   ├── animations.css         # 🎞️ 賀卡核心動態動畫特效庫（星戰滅點透視、海報入場特效）
│   └── templates.css          # 🎨 模板色彩變數與主題樣式類別
│
├── assets/
│   └── audio/                 # 🎵 高音質背景音樂庫（如 In Love With You.mp3）
│
├── docs/                      # 📚 專案研發知識庫 (DMC Protocol)
│   ├── STATE.md               # 📌 架構不變量與目錄地圖（≤200行，AI 單一真理源）
│   ├── ACTIVE_LOG.md          # 📝 原子開發日誌與避坑復盤指南
│   └── how-to/                # 💡 低頻按需查閱操作手冊（如字型擴充指南）
│
└── AGENTS.md                  # 🛡️ AI 代理人開發憲法與工程規範 (28行極致高內聚)
```

---

## 💡 核心功能亮點 (Key Highlights)

1. **大畫廊優先 (Gallery-First Dashboard)**：
   進入 `workspace.html` 即刻呈現所有精選卡片與風格模板的大看板，直覺提供「一鍵預覽」、「複製雲端分享短鏈」、「複製卡片」與「進入編輯」。
2. **三大旗艦版型佈局**：
   - 🌌 **星際大戰 · 滅點升空 (`star-wars-crawl`)**：真正的 3D 梯形透視滅點，底部大器突破邊緣，支援工坊實時滑桿微調 3D 仰角與左右寬度。
   - 🎬 **電影卷軸 · 典雅信箋 (`cinematic-credits`)**：平直等速漫遊，溫柔好讀，頂部柔和羽化消散。
   - 🖼️ **滿版海報 · 動態登場 (`cinematic-poster`)**：滿版視覺，具備 **4 大文字入場動態特效**（3D 骨牌階梯翻轉、烈火金光流光、柔和模糊微升、星光凝聚聚焦），支援 0.4x~2.0x 任意調速與定時循環重播。
3. **跨平台字型排版體系**：
   支援台灣傳統標楷體、文青思源宋體、都會現代黑體與星際科技等寬字型，具備全跨平台（Windows / iOS / Android）自適應平滑降級。
4. **極速 WebP 壓縮與圖床直傳**：
   內建 Canvas 自動等比縮放與 WebP 80% 極致壓縮引擎，一鍵直傳 ImgBB CDN，徹底杜絕將大體積照片塞入 Git 倉庫的災難。
5. **離線容災防護**：
   即刻斷網亦能透過本地 `localStorage` 與 `data/*.json` 完整渲染，達成「0 崩潰、0 白屏」。

---

## 🛠️ 開發規範與治理 (Engineering Invariants)

- **純 JS 協議**：外部 `.js` 模組一律保持純 JavaScript（嚴禁 JSX 語法），確保本地 `file:///` 協議下秒開無跨域報錯。
- **行數硬門禁**：`workspace.html` 保持純粹路由調度，嚴格遵守總行數 ≤ 450 行，大組件強制抽離。
- **單一真源 (SSOT)**：所有資料讀寫一律收斂至 `js/workspace_store.js`，受眾端與工坊端共享同一套規格。

---

© 2026 CardForge. Crafted with ❤️ and modern web standards.