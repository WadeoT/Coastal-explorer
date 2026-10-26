#!/usr/bin/env python3
"""Prepare a small Netlify publish directory using the already vendored client."""
from pathlib import Path
import shutil

root = Path(__file__).resolve().parents[1]
site = root / "site"
site.mkdir(exist_ok=True)
shutil.copyfile(root / "index.html", site / "index.html")
(site / "downloads").mkdir(exist_ok=True)
for name in ["Coastal-Explorer-v13.zip", "Coastal-Explorer-Developer-Prompt.txt"]:
    source = root / "downloads" / name
    if source.exists():
        shutil.copyfile(source, site / "downloads" / name)
print("Netlify publish directory ready:", site)
