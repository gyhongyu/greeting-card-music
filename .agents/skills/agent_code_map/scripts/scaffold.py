"""
scaffold.py - agent_code_map 專案原生自包含技能腳手架播種器 (Project Native Skill Scaffolder)
負責一鍵在目標專案目錄播種出標準的 .agents/skills/agent_code_map/ 結構與專案級 SKILL.md，
自動消除散落於 scripts/code_map/ 的裸腳本，並在專案 AGENTS.md 中冪等注入代碼導航門禁規範。
讓專案在新機器、無全域技能環境或 CI 中依然具備完全自治的 50ms AST 代碼地圖與呼叫鏈反查能力！
"""

import os
import sys
import shutil
import argparse

ANCHOR_START = "<!-- [START: CODE_MAP_INVARIANT] -->"
ANCHOR_END = "<!-- [END: CODE_MAP_INVARIANT] -->"

INVARIANT_TEMPLATE = f"""{ANCHOR_START}
## 🗺️ 專案代碼導航與呼叫鏈門禁 (Code Map Navigation Invariant)
1. **嚴禁盲目摸象**：排查 Bug、尋找函式位置或跨檔案追蹤時，**絕對嚴禁**一上來直接使用全局 `grep` 大海撈針！
2. **第一步宏觀導航**：凡面對未知代碼或排查架構，優先在終端執行極速地圖命令（0 成本在記憶體建立心智模型）：
   ```powershell
   py .agents\\skills\\agent_code_map\\scripts\\map.py
   ```
3. **第二步微觀定位**：若要追蹤某個函式/方法被專案中「哪些檔案、哪些類別呼叫」，強制調用呼叫者穿透指令：
   ```powershell
   py .agents\\skills\\agent_code_map\\scripts\\callers.py <symbol_name>
   ```
4. **定義尋址**：若要定位類別或函式的原始定義位置：
   ```powershell
   py .agents\\skills\\agent_code_map\\scripts\\callers.py --def <symbol_name>
   ```
{ANCHOR_END}
"""

PROJECT_SKILL_MD = """---
name: agent_code_map
description: 專案專屬代碼地圖、AST 語法拓撲與調用鏈穿透大師 (Code Map & AST Caller Hierarchy)。專門徹底終結「跨會話冷啟動盲目 grep、翻遍全庫摸象、800 行大檔切片截斷」等通病。當需要排查 Bug、尋找函式位置、追蹤呼叫者、接手新模組時強制優先調用，50ms 建立全域心智模型與精準跳轉。
---

# 🗺️ 專案專屬代碼地圖與調用鏈穿透 (agent_code_map)

本專案已播種原生自包含的代碼地圖微型引擎，100% 依賴 Python 標準庫 (`ast`, `re`, `os`, `sys`)，零外部 pip 套件依賴、零 LLM API 消耗、100% 純本機運算。

---

## ⛔ 專案不可違背之工程紅線 (Hard Invariants)

1. **嚴禁盲目摸象鐵律 (Anti-Blind-Grep Law)**：
   * 當接手未知模組或面對大型專案時，**嚴禁**第一步直接使用全局 `grep` 大海撈針常見詞彙！
   * 第一步強制調用 `map.py` 建立全域拓撲心智模型。
2. **呼叫者追蹤必走語法樹鐵律 (Callers Precision Law)**：
   * 當需要釐清「某個方法或函式被誰呼叫、在哪裡被修改」時，**嚴禁**使用 grep 去肉眼比對搜尋結果！
   * 強制執行 `callers.py <symbol>`，獲取攜帶父層 Class/Def Scope 與呼叫語句片段的精確線索。

---

## 🚀 專案常用指令 (Project CLI)

### 1. 宏觀代碼拓撲導航 (Macro Code Map)
50 毫秒內輸出按引用中心度排序的模組清單、主要 Class、Def 結構（預設限制 ≤100 行防截斷）：
```powershell
# 輸出專案全域宏觀拓撲
py .agents\\skills\\agent_code_map\\scripts\\map.py

# 深入展開特定子目錄
py .agents\\skills\\agent_code_map\\scripts\\map.py src\\core
```

### 2. 微觀呼叫者穿透 (Callers Tracing)
查詢某個函式/方法被專案中「哪些檔案、哪些類別、哪一行」呼叫（攜帶 Scope 與調用 Snippet）：
```powershell
py .agents\\skills\\agent_code_map\\scripts\\callers.py <symbol_name>
# 或顯式指定 action
py .agents\\skills\\agent_code_map\\scripts\\callers.py callers <symbol_name>
```

### 3. 原始定義尋址 (Go to Definition)
定位類別或函式的原始定義宣告位置：
```powershell
py .agents\\skills\\agent_code_map\\scripts\\callers.py --def <symbol_name>
# 或顯式指定 action
py .agents\\skills\\agent_code_map\\scripts\\callers.py def <symbol_name>
```
"""

def update_agents_file(file_path: str):
    """在指定的規則檔案中冪等無損注入或替換代碼地圖門禁錨點"""
    if not os.path.isfile(file_path):
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        with open(file_path, "w", encoding="utf-8") as f:
            f.write("# 專案開發與 AI 代理人憲法規範\n\n" + INVARIANT_TEMPLATE)
        print(f"  ✅ [規則注入] 建立規則檔案並注入門禁: {file_path}")
        return

    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    if ANCHOR_START in content and ANCHOR_END in content:
        prefix = content.split(ANCHOR_START)[0]
        suffix = content.split(ANCHOR_END)[1]
        new_content = prefix + INVARIANT_TEMPLATE.strip() + suffix
        print(f"  🔄 [規則更新] 發現既有錨點，已原地無損更新規則: {file_path}")
    else:
        new_content = content.rstrip() + "\n\n" + INVARIANT_TEMPLATE
        print(f"  ➕ [規則追加] 安全追加代碼地圖門禁至檔案末尾: {file_path}")

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(new_content)

def inject_rules(target_dir: str):
    """注入專案根目錄的 AGENTS.md 以及多模式設定檔"""
    # 1. 專案根目錄 AGENTS.md
    main_agents = os.path.join(target_dir, "AGENTS.md")
    update_agents_file(main_agents)

    # 2. 檢測多模式設定 (.agent_profiles/development/AGENTS.md 等)
    profiles_dir = os.path.join(target_dir, ".agent_profiles")
    if os.path.isdir(profiles_dir):
        for profile in os.listdir(profiles_dir):
            profile_agents = os.path.join(profiles_dir, profile, "AGENTS.md")
            if os.path.isfile(profile_agents):
                update_agents_file(profile_agents)

def cleanup_orphaned_scripts(target_dir: str):
    """清理專案中舊版散落的 scripts/code_map/ 裸腳本，徹底終結孤兒目錄"""
    legacy_dir = os.path.join(target_dir, "scripts", "code_map")
    if os.path.isdir(legacy_dir):
        try:
            shutil.rmtree(legacy_dir)
            print(f"  🧹 [清理孤兒] 已自動清除舊版散落腳本目錄: scripts/code_map/")
            # 若 scripts 目錄已變為空，則一併移除，保持專案整潔
            parent_scripts = os.path.join(target_dir, "scripts")
            if os.path.isdir(parent_scripts) and not os.listdir(parent_scripts):
                os.rmdir(parent_scripts)
                print(f"  🧹 [清理空目錄] 已移除空目錄: scripts/")
        except Exception as e:
            print(f"  ⚠️ [清理提醒] 清理 scripts/code_map/ 時發生例外: {e}")

def scaffold(target_dir: str):
    target_dir = os.path.abspath(target_dir)
    print("=" * 80)
    print(f"🚀 [Scaffolder] 正在為目標專案播種標準原生技能: .agents/skills/agent_code_map/")
    print(f"📁 目標專案路徑: {target_dir}")
    print("=" * 80)

    # 1. 建立目標專案的 .agents/skills/agent_code_map/scripts/
    skill_root = os.path.join(target_dir, ".agents", "skills", "agent_code_map")
    dest_scripts_dir = os.path.join(skill_root, "scripts")
    os.makedirs(dest_scripts_dir, exist_ok=True)

    # 2. 寫入專案級 SKILL.md
    skill_md_path = os.path.join(skill_root, "SKILL.md")
    with open(skill_md_path, "w", encoding="utf-8") as f:
        f.write(PROJECT_SKILL_MD.strip() + "\n")
    print(f"  📄 [SKILL.md] 已生成專案級標準技能手冊: .agents/skills/agent_code_map/SKILL.md")

    # 3. 部署核心微型引擎
    current_script_dir = os.path.dirname(os.path.abspath(__file__))
    files_to_copy = [
        ("ignore_filter.py", "ignore_filter.py"),
        ("generate_map.py", "map.py"),
        ("query_symbol.py", "callers.py")
    ]

    for src_name, dest_name in files_to_copy:
        src_path = os.path.join(current_script_dir, src_name)
        dest_path = os.path.join(dest_scripts_dir, dest_name)
        if os.path.isfile(src_path):
            shutil.copy2(src_path, dest_path)
            print(f"  📦 [腳本就緒] 已部署引擎: .agents/skills/agent_code_map/scripts/{dest_name}")
        else:
            print(f"  ❌ 來源引擎缺失: {src_path}")

    # 4. 清理歷史孤兒裸腳本 scripts/code_map/
    cleanup_orphaned_scripts(target_dir)

    # 5. 冪等無損注入/更新 AGENTS.md 規則錨點
    inject_rules(target_dir)

    print("=" * 80)
    print("🎉 [播種完成] 專案原生技能 agent_code_map 部署完畢！")
    print("👉 專案內 AI 代理人可直接調用：")
    print(f"   py .agents\\skills\\agent_code_map\\scripts\\map.py")
    print(f"   py .agents\\skills\\agent_code_map\\scripts\\callers.py <symbol_name>")
    print(f"   py .agents\\skills\\agent_code_map\\scripts\\callers.py --def <symbol_name>")
    print("=" * 80)

def main():
    parser = argparse.ArgumentParser(description="agent_code_map 專案原生自包含技能腳手架播種工具")
    parser.add_argument("target_dir", nargs="?", default=".", help="目標專案路徑 (預設為當前目錄)")
    args = parser.parse_args()

    scaffold(args.target_dir)

if __name__ == "__main__":
    main()
