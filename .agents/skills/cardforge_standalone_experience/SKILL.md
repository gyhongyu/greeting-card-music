---
name: cardforge_standalone_experience
description: CardForge 獨立節慶賀卡與高階多媒體微站發布技能。接管獨立目錄發布、預載守衛、專屬OG分享卡、時序電影編排與卡片台帳登記。當提到「獨立賀卡」、「獨立微站」、「專屬目錄發布」、「diwali」、「節慶獨立卡」、「片頭影片轉場」時強制觸發。
---

# CardForge Standalone Experience (獨立節慶賀卡與微站發布技能)

> [!IMPORTANT]
> **【核心使命與架構隔離鐵律】**
> - **物理隔離零污染**：凡涉及客製化視訊片頭、專屬音樂漸入、多張照片輪播、特殊進出場動態金句等「非通用模板特性」之大型節慶卡片（如 Diwali、聖誕、跨年），**強制採用獨立目錄發布架構 (Self-Contained Micro-Site)**！
> - **嚴禁改 A 爛 B**：獨立微站必須將專屬 HTML、視訊、音樂與照片完全收斂在同一子目錄（如 `diwali/`），嚴禁硬塞進主幹 `CardEngine.js` 破壞舊模板。
> - **卡片清單登記鐵律**：**所有獨立微站賀卡，必須同步登記至 `data/cards.json` 與 `constants.js`（`isStandalone: true`，指定 `customUrl`）**，確保工坊卡片台帳（Gallery）與分享對話框 100% 存在且可直接跳轉體驗！

---

## 🏗️ 獨立微站標準 5 大架構規範

### 1. 專屬目錄與同源資源收斂
* 建立根目錄下的獨立資料夾（如 `diwali/`、`christmas/`）。
* 內部收斂：
  * `index.html`（專屬獨立播放器微站）
  * 專屬片頭視訊（如 `*.mp4`）
  * 專屬背景音樂（如 `*.mp3`）
  * 專屬照片集錦（如 `*.webp`）
* **優點**：所有資源全部採用相對路徑，零 CORS、零跨域風險，且享有極佳的 GitHub Pages / Cloudflare 邊緣透傳網址（如 `https://card.foxlink.co.in/diwali/`）。

### 2. 智慧資源預載守衛 (Asset Preload Guard)
* **痛點**：高階多媒體賀卡素材龐大，若未預載直接開門，行動端易出現白屏或影片掉幀。
* **規範**：
  * 開門按鈕（WelcomeGate）預設為 `disabled` 旋轉等待狀態。
  * 透過 `new Image()` 與 `video.preload` 監聽關鍵媒體載入完成度，動態顯示 `Loading Assets (0% ~ 100%)`。
  * 設置 **3.5 秒超時降級熔斷機制**，確保即使弱網環境也絕不卡死受眾。
  * 關鍵資產就緒後，按鈕點亮為金色脈衝 `TAP TO CELEBRATE`。

### 3. 電影級時序控制 (Cinematic Timeline)
* **0.0s**：開門瞬間以 User-Gesture 同時解鎖視訊與音訊（音訊先靜音播放，繞過現代瀏覽器 Autoplay 阻擋）。
* **6.0s (視訊結束前 2s)**：音訊平滑漸入（Fade-In）響起，音畫交織先聲奪人。
* **8.0s (視訊結束)**：視訊優雅淡出，無縫銜接相簿輪播（Ken Burns 慢鏡）＋ 粒子特效 ＋ 純淨懸浮動態金句。

### 4. 專屬社群分享 HERO 預覽圖卡 (Open Graph Invariant)
* 在獨立微站的 `<head>` 中配置專屬 Open Graph 標籤：
  * `og:title`、`og:description`
  * `og:image` 指向該獨立微站的最佳橫版視覺大圖（如 `https://card.foxlink.co.in/diwali/diwali_grand_night.webp`）
* **鐵律**：因 Cloudflare Worker 採用透傳機制，獨立目錄之社群預覽卡**絕不會覆蓋或污染主平台的預設分享封面**！

### 5. 工坊台帳與卡片清單登記 (Card Registry Invariant)
* 在 `data/cards.json` 與 `constants.js` 的 `DEFAULT_CARDS` 中新增登記實體：
  ```json
  {
    "id": "card-diwali-2026",
    "name": "排燈盛典 · 光明驅散黑暗 (獨立旗艦賀卡)",
    "category": "festive",
    "isStandalone": true,
    "standaloneUrl": "/diwali/",
    "title": "Happy Diwali 2026 · Light Conquers Darkness",
    "coverImage": "diwali/diwali_grand_night.webp"
  }
  ```
* 在工坊畫廊中，獨立賀卡點擊「親自體驗」或分享時，優先導向其 `standaloneUrl`，維持卡片庫的完整性與統一治理。

---

## 🛠️ 發布與版本管理聯動
* 凡發布獨立微站或修改其代碼，必須同步遵循 [cardforge_pwa_release](file:///e:/Projects/greeting-card-music/.agents/skills/cardforge_pwa_release/SKILL.md) 規範，完成 Git 提交與遠端推送閉環。
* **強制 CLI 推送登記**：嚴禁只改本地！新獨立卡片必須調用專屬腳本推送到 Google Sheet：
  ```powershell
  py .agents\skills\cardforge_standalone_experience\scripts\cardforge_standalone_experience.py push <card_id>
  ```

