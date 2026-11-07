#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
cardforge_standalone_experience.py
CardForge 獨立節慶賀卡專屬發布、GAS 雲端 SSOT 登記與台帳同步總管 CLI
"""

import sys
import json
import urllib.request
import urllib.parse
from pathlib import Path

# 強制 UTF-8 輸出防禦
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

GAS_API_URL = "https://script.google.com/macros/s/AKfycbygCbbP4RjhzgtHrkfM6LN59JC8G3Plc58P8xgj15t5dctZn-s9TRaZUDxlye2S-o92/exec"
ROOT_DIR = Path(__file__).resolve().parent.parent.parent.parent.parent
DATA_CARDS_PATH = ROOT_DIR / "data" / "cards.json"
CONSTANTS_JS_PATH = ROOT_DIR / "js" / "constants.js"

def request_gas(payload, method="POST"):
    if method == "GET":
        qs = urllib.parse.urlencode(payload)
        url = f"{GAS_API_URL}?{qs}"
        req = urllib.request.Request(url, headers={"User-Agent": "CardForge-Standalone-CLI"})
    else:
        req = urllib.request.Request(
            GAS_API_URL,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "text/plain;charset=utf-8", "User-Agent": "CardForge-Standalone-CLI"}
        )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8"))

def sync_card_to_gas(card_id):
    """
    從本地 data/cards.json 讀取指定 card_id 並同步至雲端 Google Sheet (GAS SSOT)
    """
    if not DATA_CARDS_PATH.exists():
        print(f"❌ 找不到本地卡片台帳: {DATA_CARDS_PATH}")
        sys.exit(1)

    with open(DATA_CARDS_PATH, "r", encoding="utf-8") as f:
        cards = json.load(f)

    target_card = next((c for c in cards if c.get("id") == card_id), None)
    if not target_card:
        print(f"❌ 在 {DATA_CARDS_PATH} 中找不到卡片 ID: {card_id}")
        sys.exit(1)

    print(f"📡 正在將獨立卡片 [{target_card.get('name')}] (ID: {card_id}) 推送至雲端 Google Sheet SSOT...")
    payload = {
        "action": "save_card",
        "card": target_card
    }

    res = request_gas(payload, method="POST")
    if res.get("success"):
        print(f"🎉 成功登記至 Google Sheet！雲端儲存 ID: {res.get('card', {}).get('id', card_id)}")
        print(f"🌐 獨立微站網址: {target_card.get('standaloneUrl')}")
        return True
    else:
        print(f"❌ 雲端登記失敗: {res.get('error', '未知錯誤')}")
        sys.exit(1)

def list_cloud_cards():
    """
    查詢目前 Google Sheet 上的所有卡片清單
    """
    print("🔍 正在查詢 Google Sheet 雲端卡片台帳...")
    res = request_gas({"action": "list_cards"}, method="GET")
    if res.get("success"):
        cards = res.get("cards", [])
        print(f"📊 雲端共有 {len(cards)} 張卡片：")
        for c in cards:
            tag = "✨ [獨立微站]" if c.get("isStandalone") or c.get("category") == "standalone" else "📄 [常規卡片]"
            print(f"  • {tag} {c.get('name')} (ID: {c.get('id')})")
        return cards
    else:
        print(f"❌ 查詢失敗: {res.get('error')}")
        sys.exit(1)

def main():
    if len(sys.argv) < 2:
        print("Usage:")
        print("  py cardforge_standalone_experience.py push <card_id>   (將指定卡片登記覆寫至雲端 GAS)")
        print("  py cardforge_standalone_experience.py list             (查詢雲端現有卡片台帳)")
        sys.exit(1)

    cmd = sys.argv[1].lower()
    if cmd == "push":
        if len(sys.argv) < 3:
            print("❌ 請指定要推送的卡片 ID，例如: py cardforge_standalone_experience.py push card-diwali-2026")
            sys.exit(1)
        card_id = sys.argv[2]
        sync_card_to_gas(card_id)
    elif cmd == "list":
        list_cloud_cards()
    else:
        print(f"❌ 未知命令: {cmd}")
        sys.exit(1)

if __name__ == "__main__":
    main()
