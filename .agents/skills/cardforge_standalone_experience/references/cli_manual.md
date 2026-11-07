# 📖 cardforge_standalone_experience CLI 參數與子命令詳細字典 (CLI Manual)

> **導航指引**：日常執行請優先使用 `py skills/cardforge_standalone_experience/scripts/cardforge_standalone_experience.py <子命令> --help` 獲取物理真值。
> 本手冊為惰性載入參照檔，僅在需要查閱全量參數邊界或深度排障時載入。

---

## 一、 子命令總覽

### 1. `run` (核心執行)
- **指令格式**：
  ```bash
  py skills/cardforge_standalone_experience/scripts/cardforge_standalone_experience.py run [選項]
  ```
- **參數說明**：
  - `--target <path>`：目標路徑 (選填，預設當前目錄)
  - `--dry-run`：預演模式，不產生副作用

### 2. `status` (狀態健康自檢)
- **指令格式**：
  ```bash
  py skills/cardforge_standalone_experience/scripts/cardforge_standalone_experience.py status
  ```
- **參數說明**：
  - `--json`：回傳 JSON 格式結構化診斷

---

## 二、 常見錯誤碼與排障指引 (Exit Codes)
| 狀態碼 | 原因 | 處置方式 |
| :---: | :--- | :--- |
| **0** | 執行成功 | 正常結束 |
| **1** | 參數錯誤或環境缺失 | 檢查終端 Stderr 報錯並補齊參數 |
