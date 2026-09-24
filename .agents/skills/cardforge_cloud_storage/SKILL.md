---
name: cardforge_cloud_storage
description: CardForge Google Drive 雲端儲存台帳、資料夾映射與資產生命週期治理技能。專門用於治理本專案所有上傳到 Google Drive 的雲端檔案（SRT 字幕、自訂音訊、視訊、圖片）、查詢檔案保存在哪、權限校驗（公開編輯/公開唯讀）、直連讀取與線上編輯網址生成、以及向 GAS 雲端儲存庫排查問題時自動強制觸發。
---

# ☁️ CardForge 雲端儲存與 Google Drive 台帳總管 (cardforge_cloud_storage)

> [!IMPORTANT]
> **本專案所有代理人必讀：雲端資產儲存真理圖 (SSOT Cloud Storage Map)**
> 本專案為 Serverless 純靜態雙軌架構。使用者在上傳大檔案（如 SRT 電影字幕、自訂配樂、照片等）時，一律由中央 Google Apps Script 網關 (`Card_Gateway.gs`) 上傳至 Google Drive 專屬資料夾，卡片僅保存短網址，徹底根除 LocalStorage 5MB 配額與 Google Sheet 50,000 字元儲存格上限。

---

## 🗂️ Google Drive 資料夾架構真理總表 (Cloud Directory Blueprint)

本專案在 Google Drive 上統籌規劃之根目錄及子專用資料夾結構如下：

| 資產類型 | Google Drive 專用資料夾名稱 | 檔案命名規範 | 預設權限 | 受眾端直連讀取 (Raw URL) | 線上編輯/預覽 (Edit URL) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **電影字幕 (SRT)** | `CardForge_Subtitles` | `subtitle_{timestamp}.srt` | **公開可編輯** (`ANYONE_WITH_LINK, EDIT`) | `https://drive.google.com/uc?export=download&id={fileId}` | `https://drive.google.com/file/d/{fileId}/edit` |
| **自訂卡片配樂** | `CardForge_Audio` | `audio_{timestamp}.mp3` | **公開唯讀** (`ANYONE_WITH_LINK, VIEW`) | `https://drive.google.com/uc?export=download&id={fileId}` | `https://drive.google.com/file/d/{fileId}/view` |
| **自訂影片背景** | `CardForge_Videos` | `video_{timestamp}.mp4` | **公開唯讀** (`ANYONE_WITH_LINK, VIEW`) | `https://drive.google.com/uc?export=download&id={fileId}` | `https://drive.google.com/file/d/{fileId}/view` |
| **卡片相片圖庫** | `CardForge_Photos` | `photo_{timestamp}.jpg` | **公開唯讀** (`ANYONE_WITH_LINK, VIEW`) | `https://drive.google.com/uc?export=download&id={fileId}` | `https://drive.google.com/file/d/{fileId}/view` |

---

## ⛔ 雲端儲存五大不可突破鐵律 (Invariants & Guardrails)

1. **嚴禁將全文內容塞入卡片欄位 (Zero-Inline-Payload Invariant)**：
   - 卡片物件之 `media.subtitleUrl`、`media.customMusic` 等欄位，**必須且只能**存放直連 URL（或本地相對路徑 `assets/...`）。
   - 若上傳失敗，必須在前端跳出 Alert 提示使用者，**絕對禁止** Fallback 將整篇幾萬字文字內容塞進 URL 欄位！
2. **字幕公開可編輯原則 (Public-Editable Subtitle Invariant)**：
   - 為了讓使用者隨時調整字幕，`CardForge_Subtitles` 資料夾與檔案必須設定為 `DriveApp.Permission.EDIT`。
   - 前端必須同時保存 `subtitleUrl`（直連）與 `subtitleEditUrl`（Drive 介面），並提供「在 Drive 開啟編輯」按鈕。
3. **影音大檔防串流阻斷 (Direct Download URL Standard)**：
   - 播放器 `fetch` 或 `<audio>` / `<video>` 讀取之網址必須採用 `https://drive.google.com/uc?export=download&id={fileId}`，嚴禁使用帶有 Google UI 遮罩的 `/view` 網址。
4. **GAS 網關唯一性 (Gateway Centralization)**：
   - 所有雲端檔案的增刪改查，統一由 `gas/Card_Gateway.gs` 接管，前端統一呼叫 `window.GasClient.uploadSubtitle()` 等介面。

---

## 🛠️ CLI 輔助工具 (Fixed Command Signature)

本技能提供固定簽名腳本 [`scripts/cloud_storage.py`](file:///e:/Projects/greeting-card-music/.agents/skills/cardforge_cloud_storage/scripts/cloud_storage.py) 供代理人與使用者快速查詢：

| 操作意圖 | 固定命令列 | 說明 |
| :--- | :--- | :--- |
| **盤點雲端目錄台帳** | `py .agents\skills\cardforge_cloud_storage\scripts\cloud_storage.py map` | 印出所有 Google Drive 資料夾真值與權限定義 |
| **解析 Drive 連結** | `py .agents\skills\cardforge_cloud_storage\scripts\cloud_storage.py parse --url <URL>` | 自動從任何 Google Drive 連結提取 File ID 並生成對應的 Raw 直連與 Edit 網址 |
| **連線網關狀態** | `py .agents\skills\cardforge_cloud_storage\scripts\cloud_storage.py status` | 檢測當前專案與 GAS API 的連通性與最新部署版本 |
