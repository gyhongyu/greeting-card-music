"""
scaffold_project.py - 向後相容轉發器 (Backward-Compatible Forwarder)
為相容歷史調用習慣，自動轉發至標準播種器 scaffold.py。
"""

import sys
import os

# 引用同一目錄下的 scaffold 模組
try:
    from scaffold import main
except ImportError:
    from .scaffold import main

if __name__ == "__main__":
    main()
