#!/usr/bin/env python3
"""Package the standalone game and launch instructions for download."""
from pathlib import Path
import zipfile, json

root = Path(__file__).resolve().parents[1]
version=json.loads((root / "data/version.json").read_text())["version"]
output = root / f"downloads/Coastal-Explorer-v{version}.zip"
output.parent.mkdir(exist_ok=True)
files = ["data/version.json", "docs/v1.2.9-RELEASE.md", "docs/VERSION-HISTORY.md", "docs/BUILDING-DATA-PROMPT.txt", "docs/V28-RELEASE.md", "docs/V27-RELEASE.md", "TASKS.md", "data/sunshine-airport-runways.json", "docs/V26-RELEASE.md", "data/community-owner.json", "docs/V25-RELEASE.md", "data/expanded-fleet.json", "docs/V24-RELEASE.md", "docs/V23-RELEASE.md", "docs/V22-RELEASE.md", "docs/V21-RELEASE.md", "docs/V20-RELEASE.md", "docs/TRAFFIC-AND-CRASH-SOURCES.md", "data/traffic-census.json", "docs/V19-RELEASE.md", "docs/V18-RELEASE.md", "docs/V17-RELEASE.md", "docs/V16-RELEASE.md", "docs/V15-RELEASE.md", "docs/V14-RELEASE.md", "docs/V13-RELEASE.md", "docs/V13-VERIFICATION.md", "docs/V12-RELEASE.md", "docs/V12-VERIFICATION.md", "docs/V11-RELEASE.md", "docs/V11-VERIFICATION.md", "data/repair-garages.json", "data/police-stations.json", "docs/V10-RELEASE.md", "docs/V10-VERIFICATION.md", "docs/V9-RELEASE.md", "docs/V9-VERIFICATION.md", "docs/V8-RELEASE.md", "docs/V8-VERIFICATION.md", "docs/NETLIFY-MULTIPLAYER.md", "server/owner-store.cjs", "scripts/create-owner-key.cjs", "netlify.toml", "docs/V7-RELEASE.md", "docs/V7-VERIFICATION.md", "docs/ENGINE-AUDIO.md", "server/relay.cjs", "render.yaml", "docs/V6-RELEASE.md", "docs/V6-VERIFICATION.md", "vendor/PEERJS-LICENSE.txt", ".nojekyll", "index.html", "PLAY.txt", "README.md", "serve.py", "Start Windows.bat", "Start Mac.command", "data/README.md", "data/provenance.json", "data/whole-coast.overpass", "data/relations.overpass", "data/tracks.overpass", "data/LICENSE-ODbL-1.0.txt"]
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
        archive.write(root / name, "Coastal-Explorer/" + name)
    archive.writestr("Coastal-Explorer/data/extract-map.py", extractor)
with zipfile.ZipFile(output) as archive:
    assert archive.testzip() is None
    assert archive.read("Coastal-Explorer/index.html") == (root / "index.html").read_bytes()
print(f"Packaged {output.name}: {output.stat().st_size:,} bytes; ZIP integrity verified")
