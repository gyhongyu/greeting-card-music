#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
scripts/cloud_storage.py - CardForge Google Drive 雲端儲存台帳與工具箱
支援資料夾藍圖查詢 (map)、Drive 網址轉換 (parse) 與網關狀態檢測 (status)
"""

import sys
import os
import re
import json
import urllib.request
import argparse

BLUEPRINT = {
    "project": "CardForge (3D Greeting Card Music)",
    "gas_api_url": "https://script.google.com/macros/s/AKfycbygCbbP4RjhzgtHrkfM6LN59JC8G3Plc58P8xgj15t5dctZn-s9TRaZUDxlye2S-o92/exec",
    "folders": [
        {
            "category": "subtitles",
            "name": "電影字幕 (SRT)",
            "drive_folder": "CardForge_Subtitles",
            "permission": "ANYONE_WITH_LINK, EDIT (所有人可線上編輯)",
            "naming": "subtitle_{timestamp}.srt",
            "raw_template": "https://drive.google.com/uc?export=download&id={fileId}",
            "edit_template": "https://drive.google.com/file/d/{fileId}/edit"
        },
        {
            "category": "audio",
            "name": "自訂音樂/音訊 (MP3)",
            "drive_folder": "CardForge_Audio",
            "permission": "ANYONE_WITH_LINK, VIEW (公開唯讀)",
            "naming": "audio_{timestamp}.mp3",
            "raw_template": "https://drive.google.com/uc?export=download&id={fileId}",
            "edit_template": "https://drive.google.com/file/d/{fileId}/view"
        },
        {
            "category": "videos",
            "name": "自訂背景視訊 (MP4)",
            "drive_folder": "CardForge_Videos",
            "permission": "ANYONE_WITH_LINK, VIEW (公開唯讀)",
            "naming": "video_{timestamp}.mp4",
            "raw_template": "https://drive.google.com/uc?export=download&id={fileId}",
            "edit_template": "https://drive.google.com/file/d/{fileId}/view"
        },
        {
            "category": "photos",
            "name": "卡片相片圖庫 (JPG/PNG)",
            "drive_folder": "CardForge_Photos",
            "permission": "ANYONE_WITH_LINK, VIEW (公開唯讀)",
            "naming": "photo_{timestamp}.jpg",
            "raw_template": "https://drive.google.com/uc?export=download&id={fileId}",
            "edit_template": "https://drive.google.com/file/d/{fileId}/view"
        }
    ]
}

def extract_file_id(url: str) -> str:
    """從各種類型的 Google Drive 連結提取 File ID"""
    if not url:
        return ""
    # 模式 1: id=XXXX
    m1 = re.search(r'id=([a-zA-Z0-9_-]+)', url)
    if m1:
        return m1.group(1)
    # 模式 2: /d/XXXX/
    m2 = re.search(r'/d/([a-zA-Z0-9_-]+)', url)
    if m2:
        return m2.group(1)
    return ""

def cmd_map(args):
    print("=" * 70)
    print("☁️ CardForge Google Drive 雲端儲存真理台帳 (Cloud Directory Blueprint)")
    print("=" * 70)
    for f in BLUEPRINT["folders"]:
        print(f"\n📂 [{f['name']}]")
        print(f"   - Drive 資料夾: {f['drive_folder']}")
        print(f"   - 分享權限:     {f['permission']}")
        print(f"   - 命名規則:     {f['naming']}")
        print(f"   - 直連下載:     {f['raw_template']}")
        print(f"   - 線上編輯:     {f['edit_template']}")
    print("\n" + "=" * 70)

def cmd_parse(args):
    file_id = extract_file_id(args.url)
    if not file_id:
        print(f"❌ 無法從 URL 解析出 Google Drive File ID: {args.url}")
        sys.exit(1)
    
    raw_url = f"https://drive.google.com/uc?export=download&id={file_id}"
    edit_url = f"https://drive.google.com/file/d/{file_id}/edit"
    view_url = f"https://drive.google.com/file/d/{file_id}/view"

    print("=" * 60)
    print(f"🔍 Google Drive 檔案解析結果")
    print("=" * 60)
    print(f"File ID:       {file_id}")
    print(f"直連讀取 (Raw): {raw_url}")
    print(f"線上編輯 (Edit): {edit_url}")
    print(f"線上預覽 (View): {view_url}")
    print("=" * 60)

def cmd_status(args):
    print(f"📡 正在檢測 CardForge GAS 網關狀態...")
    url = BLUEPRINT["gas_api_url"] + "?action=get_templates"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "CardForgeCLI/1.0"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            if data.get("success") or "templates" in data:
                print("✅ 網關狀態: 連線正常 (Online)")
                print(f"   - GAS API: {BLUEPRINT['gas_api_url']}")
                print(f"   - 雲端模板總數: {len(data.get('templates', []))} 個")
            else:
                print("⚠️ 網關回傳異常:", data)
    except Exception as e:
        print(f"❌ 連線失敗: {e}")

def main():
    parser = argparse.ArgumentParser(description="CardForge Google Drive 雲端儲存台帳工具")
    subparsers = parser.add_subparsers(dest="command", help="子命令")

    p_map = subparsers.add_parser("map", help="查看雲端資料夾真理台帳")
    p_parse = subparsers.add_parser("parse", help="解析 Google Drive 連結")
    p_parse.add_argument("--url", required=True, help="Google Drive 檔案連結")
    p_status = subparsers.add_parser("status", help="檢測 GAS 網關連線狀態")

    args = parser.parse_args()
    if args.command == "map":
        cmd_map(args)
    elif args.command == "parse":
        cmd_parse(args)
    elif args.command == "status":
        cmd_status(args)
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
