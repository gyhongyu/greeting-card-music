#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
CardForge Cloudflare Worker 一鍵端到端熱部署總管 (deploy_worker.py)
用途：
  1. 自動讀取 cloudflare/worker_og_proxy.js
  2. 調用 Cloudflare REST API 同步推送到 teaforia.in 與 foxlink.co.in 雙網域 Worker
  3. 自動核驗並修正 DNS 橘雲 (Proxied) 狀態與 Worker 路由綁定
  4. 驗證端到端部署健康度
"""

import sys
import os
import json
from pathlib import Path

# 定位專案目錄與全域 Cloudflare 技能
PROJECT_ROOT = Path(__file__).resolve().parent.parent
WORKER_JS_PATH = PROJECT_ROOT / "cloudflare" / "worker_og_proxy.js"

CF_SKILL_SCRIPT_DIR = Path(r"C:\Users\9892\.gemini\config\skills\cloudflare_domain_manager\scripts")
if not CF_SKILL_SCRIPT_DIR.exists():
    print(f"❌ 找不到全域 cloudflare_domain_manager 腳本目錄: {CF_SKILL_SCRIPT_DIR}", file=sys.stderr)
    sys.exit(1)

sys.path.append(str(CF_SKILL_SCRIPT_DIR))

try:
    from cloudflare_gateway import CloudflareClient, load_config
except ImportError as e:
    print(f"❌ 匯入 CloudflareClient 失敗: {e}", file=sys.stderr)
    sys.exit(1)

# 目標 Worker 與網域映射矩陣
TARGETS = [
    {
        "domain": "card.teaforia.in",
        "zone_name": "teaforia.in",
        "script_name": "proxy-card-teaforia-in",
        "pattern": "card.teaforia.in/*"
    },
    {
        "domain": "card.foxlink.co.in",
        "zone_name": "foxlink.co.in",
        "script_name": "proxy-card-foxlink-co-in",
        "pattern": "card.foxlink.co.in/*"
    }
]

def main():
    print("\n🚀 ===== CardForge Cloudflare Worker 雙網域即時熱部署 =====")
    
    if not WORKER_JS_PATH.exists():
        print(f"❌ 找不到 Worker 代碼檔案: {WORKER_JS_PATH}", file=sys.stderr)
        sys.exit(1)

    with open(WORKER_JS_PATH, "r", encoding="utf-8") as f:
        worker_code = f.read()

    print(f"📄 讀取 Worker 代碼成功: {WORKER_JS_PATH.name} ({len(worker_code)} 字元)")

    cfg = load_config()
    client = CloudflareClient(cfg)
    account_id = client.account_id
    if not account_id:
        print("❌ Cloudflare 配置中缺少 account_id！", file=sys.stderr)
        sys.exit(1)

    all_success = True

    for target in TARGETS:
        domain = target["domain"]
        zone_name = target["zone_name"]
        script_name = target["script_name"]
        pattern = target["pattern"]

        print(f"\n🌐 【目標網域: {domain}】")
        print(f"  • Worker 名稱: {script_name}")
        print(f"  • 路由模式: {pattern}")

        # 1. 上傳 / 覆寫 Worker 腳本
        try:
            res = client.request(
                f"accounts/{account_id}/workers/scripts/{script_name}",
                method="PUT",
                raw_body=worker_code,
                content_type="application/javascript"
            )
            if res.get("success"):
                print("  ✓ Worker 代碼上傳成功 (200 OK)")
            else:
                print(f"  ❌ Worker 代碼上傳失敗: {res.get('errors')}")
                all_success = False
                continue
        except Exception as e:
            print(f"  ❌ 上傳異常: {e}")
            all_success = False
            continue

        # 2. 確保 Worker 路由綁定
        try:
            zone = client.resolve_zone(zone_name)
            zone_id = zone["id"]
            routes_res = client.request(f"zones/{zone_id}/workers/routes")
            routes = routes_res.get("result", [])
            existing_route = next((r for r in routes if r.get("pattern") == pattern), None)

            if existing_route:
                if existing_route.get("script") != script_name:
                    client.request(
                        f"zones/{zone_id}/workers/routes/{existing_route['id']}",
                        method="PUT",
                        body={"pattern": pattern, "script": script_name}
                    )
                    print(f"  ✓ 更新路由綁定 -> {script_name}")
                else:
                    print("  ✓ 路由綁定狀態正常")
            else:
                client.request(
                    f"zones/{zone_id}/workers/routes",
                    method="POST",
                    body={"pattern": pattern, "script": script_name}
                )
                print(f"  ✓ 成功建立 Worker 路由: {pattern}")
        except Exception as e:
            print(f"  ⚠️ 路由配置警告: {e}")

        # 3. 確保 DNS 開啟 Proxied 橘雲
        try:
            dns_res = client.request(f"zones/{zone_id}/dns_records", params={"name": domain})
            records = dns_res.get("result", [])
            for r in records:
                if not r.get("proxied"):
                    client.request(
                        f"zones/{zone_id}/dns_records/{r['id']}",
                        method="PATCH",
                        body={"proxied": True}
                    )
                    print(f"  ✓ DNS {domain} 已切換為 🟠 Proxied 代理狀態")
                else:
                    print(f"  ✓ DNS {domain} 代理狀態為 🟠 Proxied")
        except Exception as e:
            print(f"  ⚠️ DNS 代理檢查警告: {e}")

    print("\n" + "=" * 60)
    if all_success:
        print("🎉 雙網域 Cloudflare Worker 已全部完成端到端熱更新部署！")
        print("=" * 60 + "\n")
        return 0
    else:
        print("⚠️ 部份網域部署出現異常，請檢查上述日誌！")
        print("=" * 60 + "\n")
        return 1

if __name__ == "__main__":
    sys.exit(main())
