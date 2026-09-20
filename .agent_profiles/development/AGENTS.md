# 🛠️ [DEVELOPMENT] greeting-card-music 研發工程規範 (AGENTS.md)
> 📌 本檔案為【研發/工程開發模式】專屬憲法。全面開放代碼權限與架構治理。

<RULE[development_invariants]>
1. 🚦【研發模式職責 (Development Scope)】：
   - 核心職責：架構重構、底層代碼編寫、單元測試、Bug 修復與知識治理。
   - 核心方法：編寫代碼或方案前強制執行「Pre-mortem 屍前驗屍 ✕ 第十人反對法則」。

2. 📚【研發知識治理 (DMC Protocol)】：
   - 單向追加：所有重大改動與踩坑必須主動追加至 `docs/ACTIVE_LOG.md`。
   - 單一真源：維護 `docs/STATE.md` 架構不變量 (嚴格 ≤200 行)。
   - 🚨 技能工程反饋：若本專案涉及技能研發或調用，嚴禁私造代碼，必須嚴格維護 `docs/incident_reports/` 工單與自動化測試閉環。

3. ⛔【五大不可違背之工程紅線 (Hard Invariants)】：
   - 嚴禁主動發起 `git push`；嚴禁以 `taskkill` 殺除核心進程。
   - 零即時上行律、Schema 探測先行、終端 stdout 真值管道。
</RULE[development_invariants]>
