#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
cardforge_template_sync.py
CardForge 模板與雲端 GAS / 本地雙軌同步標準工具
用法：
  py scripts/sync_templates.py push             # 將本機模板全量/增量推送到 Google Sheet 雲端 SSOT
  py scripts/sync_templates.py pull             # 從 Google Sheet 雲端拉取最新模板並覆寫本機 templates.json
  py scripts/sync_templates.py verify           # 驗證本機 constants.js, templates.json 與雲端 GAS 一致性
"""

import os
import sys
import json
import urllib.request
import urllib.error
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
TEMPLATES_JSON_PATH = ROOT_DIR / "data" / "templates.json"
CONSTANTS_JS_PATH = ROOT_DIR / "js" / "constants.js"
GAS_API_URL = "https://script.google.com/macros/s/AKfycbygCbbP4RjhzgtHrkfM6LN59JC8G3Plc58P8xgj15t5dctZn-s9TRaZUDxlye2S-o92/exec"

def request_gas(payload, method="POST"):
    if method == "GET":
        url = f"{GAS_API_URL}?action={payload.get('action', 'list_templates')}"
        req = urllib.request.Request(url, headers={"User-Agent": "CardForge-Sync-CLI"})
    else:
        req = urllib.request.Request(
            GAS_API_URL,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "text/plain;charset=utf-8", "User-Agent": "CardForge-Sync-CLI"}
        )
    with urllib.request.urlopen(req, timeout=25) as resp:
        return json.loads(resp.read().decode("utf-8"))

def load_local_templates():
    if not TEMPLATES_JSON_PATH.exists():
        print(f"❌ 找不到本地模板檔案: {TEMPLATES_JSON_PATH}")
        sys.exit(1)
    with open(TEMPLATES_JSON_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

def push_templates():
    templates = load_local_templates()
    print(f"📦 準備推送 {len(templates)} 個本地模板至 Google Sheet 雲端 SSOT...")
    
    payload = {
        "action": "batch_sync",
        "cards": [],
        "templates": templates
    }
    try:
        res = request_gas(payload, method="POST")
        if res.get("success"):
            print(f"✅ 雲端同步成功！已成功同步 {res.get('syncedTemplatesCount', 0)} 個模板。")
            for tpl in templates:
                print(f"   • [{tpl.get('id')}] {tpl.get('name')} (Layout: {tpl.get('layout')})")
        else:
            print(f"❌ 雲端同步失敗: {res.get('error', '未知錯誤')}")
            sys.exit(1)
    except Exception as e:
        print(f"❌ 網路或 GAS 執行異常: {e}")
        sys.exit(1)

def pull_templates():
    print(f"🌐 正在從 Google Sheet 雲端拉取所有模板...")
    try:
        res = request_gas({"action": "list_templates"}, method="GET")
        if res.get("success") and isinstance(res.get("templates"), list):
            cloud_tpls = res["templates"]
            print(f"✅ 成功獲取 {len(cloud_tpls)} 個雲端模板。")
            with open(TEMPLATES_JSON_PATH, "w", encoding="utf-8") as f:
                json.dump(cloud_tpls, f, ensure_ascii=False, indent=2)
            print(f"💾 已更新至 {TEMPLATES_JSON_PATH}")
        else:
            print(f"❌ 拉取失敗: {res.get('error', '返回資料結構不符')}")
            sys.exit(1)
    except Exception as e:
        print(f"❌ 拉取異常: {e}")
        sys.exit(1)

def verify_templates():
    print("🔍 開始三維一致性核驗 (Local JSON vs Constants.js vs Cloud GAS)...")
    local_tpls = load_local_templates()
    local_ids = {t["id"]: t for t in local_tpls}
    
    # 檢查 constants.js 是否包含所有 local_ids
    if CONSTANTS_JS_PATH.exists():
        constants_text = CONSTANTS_JS_PATH.read_text(encoding="utf-8")
        missing_in_constants = [tid for tid in local_ids if tid not in constants_text]
        if missing_in_constants:
            print(f"⚠️ [警告] constants.js 缺少以下模板 ID: {missing_in_constants}")
        else:
            print("✅ constants.js 已完整登記所有本地模板 ID。")
    
    # 檢查雲端
    try:
        res = request_gas({"action": "list_templates"}, method="GET")
        if res.get("success") and isinstance(res.get("templates"), list):
            cloud_ids = {t["id"]: t for t in res["templates"]}
            diff_ids = set(local_ids.keys()) - set(cloud_ids.keys())
            if diff_ids:
                print(f"❌ [雲端未同步] 雲端缺少以下模板: {list(diff_ids)}")
                print("   請執行: py scripts/sync_templates.py push")
            else:
                print("✅ 雲端 Google Sheet 包含所有本地模板 ID。")
                # 檢查各模板的重要欄位
                for tid, lt in local_ids.items():
                    ct = cloud_ids.get(tid, {})
                    if lt.get("layout") != ct.get("layout"):
                        print(f"⚠️ [版型差異] 模板 {tid}: 本地={lt.get('layout')}, 雲端={ct.get('layout')}")
                    if lt.get("subtitleUrl") != ct.get("subtitleUrl"):
                        print(f"⚠️ [字幕差異] 模板 {tid}: 本地={lt.get('subtitleUrl')}, 雲端={ct.get('subtitleUrl')}")
                print("🎉 核驗完成！")
        else:
            print("⚠️ 無法獲取雲端列表進行核驗。")
    except Exception as e:
        print(f"⚠️ 連線雲端檢查失敗: {e}")

def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(0)
    
    cmd = sys.argv[1].lower()
    if cmd == "push":
        push_templates()
    elif cmd == "pull":
        pull_templates()
    elif cmd == "verify":
        verify_templates()
    else:
        print(f"❌ 未知指令: {cmd}")
        print(__doc__)
        sys.exit(1)

if __name__ == "__main__":
    main()
