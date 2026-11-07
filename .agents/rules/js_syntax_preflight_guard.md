---
globs: "**/*.js"
trigger: model_decision
description: "當編寫、修改或準備提交 JavaScript 前端代碼時"
---

# 🛡️ Js Syntax Preflight Guard 規範

<RULE[js_syntax_preflight_guard_invariant]>
1. ⛔【嚴禁行為 (Anti-Pattern)】：
   - 未經語法檢查即執行 git commit/push，或憑肉眼自信交付帶有括號逗號缺失等 SyntaxError 腳本
2. ✅【標準做法 (Standard Practice)】：
   - 提交或部署前必須強制在終端執行 node -c 針對異動之 JS 檔案進行航前語法檢查，通過後方可交付
</RULE[js_syntax_preflight_guard_invariant]>
