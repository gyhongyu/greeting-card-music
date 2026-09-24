---
name: cardforge_template_manager
description: CardForge 模板全生命週期治理、三維真值同步 (constants.js ✕ templates.json ✕ GAS 雲端 SSOT) 與安全發布技能。專門用於在專案中「新增模板」、「修改模板參數」、「模板不同步排查」、「同步模板至雲端GAS」、「推送模板變更」或「核驗模板三方一致性」時自動強制觸發。
---

# 🎨 CardForge 模板全生命週期治理與雲端同步技能 (cardforge_template_manager)

> [!IMPORTANT]
> **本專案核心架構痛點與不可違背鐵律**：
> 1. 本專案採 **雙軌無伺服器 (Serverless & Zero-Build)** 架構，同時支援 `file:///` 本地雙擊開啟與線上 `https://card.teaforia.in` 託管。
> 2. **三維同步鐵律 (The Trinity Sync Law)**：任何新模板或模板參數改動，**必須且只能** 同時在以下三處保持 100% 絕對一致，缺一不可：
>    - 🌐 **雲端 SSOT**：Google Sheet `Templates_Store`（透過 GAS API 儲存）
>    - 📁 **本地 HTTP 降級**：`data/templates.json`
>    - ⚡ **本地 `file:///` 降級**：`js/constants.js` 的 `window.DEFAULT_TEMPLATES`（Chrome 安全沙盒封鎖本地 fetch，必須由常數檔注入）
> 3. **防覆蓋鐵律 (Anti-SWR Overwrite Law)**：如果只在本地修改代碼而沒同步 GAS，線上公網加載時會觸發 SWR 快取更新，**自動從雲端舊資料覆蓋本地新參數**，造成「參數全消失」的災難！

---

## 🛠️ 標配 CLI 工具 (Fixed Command Signature)

專案已內建全自動同步與一致性檢查工具 [`scripts/sync_templates.py`](file:///e:/Projects/greeting-card-music/scripts/sync_templates.py)，命令簽名嚴格固定，防 IDE 彈窗：

| 操作意圖 | 固定命令列 | 說明 |
| :--- | :--- | :--- |
| **三維核驗** | `py scripts/sync_templates.py verify` | 檢查本地 JSON、`constants.js` 與雲端 GAS 三方是否 100% 一致 |
| **推送到雲端** | `py scripts/sync_templates.py push` | 將本地 `data/templates.json` 全量/增量推送到 Google Sheet 雲端 |
| **拉取自雲端** | `py scripts/sync_templates.py pull` | 從 Google Sheet 雲端拉取最新模板並覆寫 `data/templates.json` |

---

## 📋 新增/修改模板完整 SOP (Step-by-Step Runbook)

當使用者指示「新增模板」或「修改現有模板參數」時，後續 AI 代理人必須嚴格依循以下五部曲：

### 第一步：設計與落盤 (Design & Dual Local Persistence)
1. **定義新模板結構**（必須包含 `id`, `name`, `category`, `description`, `layout`, `bgShader`, `crawlSpeed`, `theme`, `effects` 等必要欄位；若為視訊/字幕模板，需帶 `bgVideo`, `subtitleUrl`, `videoFit: 'square-feather'`）。
2. **寫入 `data/templates.json`**：新增或替換該模板物件。
3. **同步登記到 `js/constants.js`**：在 `window.DEFAULT_TEMPLATES` 陣列中同步寫入完全一致的物件。

### 第二步：三維一致性核驗 (Pre-Sync Verification)
在終端執行驗證命令：
```bash
py scripts/sync_templates.py verify
```
- 若提示 `constants.js 缺少模板 ID`，立即補齊，禁止跳過！

### 第三步：推送更新至 Google Sheet 雲端 SSOT (Cloud Sync)
執行推送命令將最新參數覆寫至雲端資料庫：
```bash
py scripts/sync_templates.py push
```
- 終端輸出 `✅ 雲端同步成功！已成功同步 X 個模板` 方可繼續。

### 第四步：介面元件聯調審核 (UI & Controls Check)
- 檢查 [`js/editor_views.js`](file:///e:/Projects/greeting-card-music/js/editor_views.js) 中的 `TemplateEditorView` 與 `CardEditorView`：
  - 是否有渲染該模板專屬的參數控制器（例如視訊、字幕、仰角、字級等）？
  - 避免發生「代碼有參數，但編輯器沒有提供輸入框」之缺陷。

### 第五步：倉庫提交與發布 (Git Workflow)
1. 執行 `git status` 確認受影響檔案（`data/templates.json`, `js/constants.js`, `js/editor_views.js` 等）。
2. ⚠️ **嚴格遵循未授權禁止 Push 鐵律**：先向使用者匯報同步已就緒，**獲得使用者明確指令（如「推送倉庫」、「push」）後**，才執行：
   ```bash
   git add data/templates.json js/constants.js js/editor_views.js
   git commit -m "feat(templates): add [template-id] and sync to cloud SSOT"
   git push origin main
   ```

---

## 💀 屍前驗屍與 5 大翻車防線 (Pre-Mortem & Guardrails)

1. **死因一：只改了 `templates.json`，沒同步 `constants.js`**
   - 💥 後果：使用者在本地雙擊 `workspace.html`（`file:///`），Chrome 沙盒攔截 fetch，導致新模板完全看不見。
   - 🛡️ 防線：`py scripts/sync_templates.py verify` 會直接報警告並阻斷。

2. **死因二：只改了本地檔案，沒推送到 GAS**
   - 💥 後果：線上公網 `card.teaforia.in` 載入時觸發 `listTemplates` SWR 快取更新，直接把舊版雲端資料覆寫掉本地設定，新參數全部蒸發。
   - 🛡️ 防線：落盤後強制執行 `py scripts/sync_templates.py push`。

3. **死因三：模板設計器缺少對應欄位**
   - 💥 後果：模板有 `bgVideo` 或 `subtitleUrl`，但在「模板設計工坊」右側面板找不到輸入框，無法調校。
   - 🛡️ 防線：每次新增特殊屬性時，同步檢核 `js/editor_views.js` 的 `TemplateEditorView`。

4. **死因四：未經授權私自 `git push`**
   - 💥 後果：違背使用者憲法最高鐵律。
   - 🛡️ 防線：即使雲端 GAS 同步成功，Git 推送前必須停步等待使用者明確下達「推送」指令。

5. **死因五：隨機動態參數污染終端**
   - 💥 後果：觸發 IDE 安全確認彈窗中斷流程。
   - 🛡️ 防線：一律使用 `py scripts/sync_templates.py <push|pull|verify>` 固定簽名。
