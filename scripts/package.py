#!/usr/bin/env python3
"""Package the standalone game and launch instructions for download."""
from pathlib import Path
import zipfile

root = Path(__file__).resolve().parents[1]
output = root / "downloads/Coastal-Explorer-Offline-v8.zip"
output.parent.mkdir(exist_ok=True)
files = ["docs/V8-RELEASE.md", "docs/V8-VERIFICATION.md", "docs/NETLIFY-MULTIPLAYER.md", "server/owner-store.cjs", "scripts/create-owner-key.cjs", "netlify.toml", "docs/V7-RELEASE.md", "docs/V7-VERIFICATION.md", "docs/ENGINE-AUDIO.md", "server/relay.cjs", "render.yaml", "docs/V6-RELEASE.md", "docs/V6-VERIFICATION.md", "vendor/PEERJS-LICENSE.txt", ".nojekyll", "index.html", "PLAY.txt", "README.md", "serve.py", "Start Windows.bat", "Start Mac.command", "data/README.md", "data/provenance.json", "data/whole-coast.overpass", "data/relations.overpass", "data/tracks.overpass", "data/LICENSE-ODbL-1.0.txt"]
extractor = '''from pathlib import Path
import base64, re
root = Path(__file__).resolve().parents[1]
html = (root / "index.html").read_text()
payload = re.search(r'<script id="coastData" type="application/octet-stream">([^<]+)</script>', html).group(1)
out = Path(__file__).parent / "sunshine-coast.json.gz"
out.write_bytes(base64.b64decode(payload))
print("Extracted the complete included database:", out)
'''
with zipfile.ZipFile(output, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
    for name in files:
        archive.write(root / name, "Coastal-Explorer-Offline/" + name)
    archive.writestr("Coastal-Explorer-Offline/data/extract-map.py", extractor)
with zipfile.ZipFile(output) as archive:
    assert archive.testzip() is None
    assert archive.read("Coastal-Explorer-Offline/index.html") == (root / "index.html").read_bytes()
print(f"Packaged {output.name}: {output.stat().st_size:,} bytes; ZIP integrity verified")
