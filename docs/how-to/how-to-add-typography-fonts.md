# 🔤 如何新增與擴充跨平台字型 (Typography Extension Guide)
> 📌 本文檔為專案 DMC 研發知識庫之低頻開發活頁手冊。需要新增/修改賀卡字型時按此標準擴充，杜絕單平台字型失效與醜陋回退。

---

## 🎯 核心原則：單一真理源與跨平台降級鏈

1. **唯一登記處 (SSOT)**：所有賀卡工坊與播放器支援的字型，**必須且只能**登記於 `js/constants.js` 的 `FONT_FAMILY_OPTIONS` 陣列中。
2. **跨平台降級鐵律 (Fallback Chain)**：嚴禁在字型設定中僅寫單一字型名稱（如 `'Kaiti SC'`）。必須依序涵蓋：
   `'Windows 專名字型', 'Mac/iOS 專名字型', 'WebFont (Google Fonts)', '通用族系 (serif / sans-serif)'`

---

## 🛠️ 新增字型標準 3 步驟

### 步驟 1：在 HTML 標頭引入 WebFont (若為網路字型)
若欲新增的字型非系統原生內建字型（例如 Google Fonts 的 Noto Serif TC、ZCOOL XiaoWei、Ma Shan Zheng 等），需在 `workspace.html` 與 `index.html` 的 `<head>` 區域以 `<link>` 載入：
```html
<link href="https://fonts.googleapis.com/css2?family=Ma+Shan+Zheng&display=swap" rel="stylesheet">
```

### 步驟 2：在 `js/constants.js` 登記字型物件
開啟 `js/constants.js`，於 `window.FONT_FAMILY_OPTIONS` 追加新字型定義：
```javascript
{
    id: 'mashan-cursive',
    name: '馬山正草書 (Ma Shan Zheng)',
    label: '🖋️ 馬山正草書 · 奔放手寫',
    value: "'Ma Shan Zheng', 'DFKai-SB', 'BiauKai', 'Kaiti SC', cursive, serif"
}
```

### 步驟 3：在各平台驗證降級效果
- **Windows**：檢視是否能正確渲染標楷體或 WebFont，確認無亂碼。
- **macOS / iOS**：確認楷體 (`Kaiti SC`) 與宋體之平滑邊緣。
- **Android / 舊設備**：確認能自動降級至末端的通用族系 (`serif` / `sans-serif`)，保證永不破字。

---

## 📋 常用中文字型跨平台最佳降級堆疊參考

| 風格分類 | 推薦 CSS Font-Family 堆疊字串 |
| :--- | :--- |
| **經典楷體 (典雅傳統)** | `'DFKai-SB', 'BiauKai', 'Kaiti SC', 'STKaiti', 'Noto Serif TC', serif` |
| **思源宋體 (文青名品)** | `'Noto Serif TC', 'Source Han Serif TC', 'Songti SC', 'SimSun', serif` |
| **現代黑體 (都會簡約)** | `'PingFang TC', 'Microsoft JhengHei', 'Noto Sans TC', sans-serif` |
| **科技等寬 (星際賽博)** | `'JetBrains Mono', 'Courier New', 'Noto Sans TC', monospace` |
| **草書手寫 (奔放深情)** | `'Ma Shan Zheng', 'DFKai-SB', 'BiauKai', 'Kaiti SC', cursive, serif` |
