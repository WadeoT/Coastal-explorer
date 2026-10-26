#!/usr/bin/env python3
"""Assemble the distributable HTML from vendored runtime, source and map snapshot."""
from pathlib import Path
import base64

root = Path(__file__).resolve().parents[1]
html = (root / "src/shell.html").read_text()
fonts = []
for family, name in [("DM Sans", "dm-sans"), ("Space Grotesk", "space-grotesk")]:
    encoded = base64.b64encode((root / f"vendor/fonts/{name}.woff2").read_bytes()).decode()
    fonts.append(f"@font-face{{font-family:'{family}';font-style:normal;font-weight:100 900;font-display:swap;src:url(data:font/woff2;base64,{encoded}) format('woff2')}}")
html = html.replace("@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap');", "\n".join(fonts))
game = (root / "src/game.js").read_text().replace("/*__GEOGRAPHY__*/", (root / "src/geography.js").read_text()).replace("/*__VEHICLE_MODELS__*/", (root / "src/vehicle-models.js").read_text()).replace("/*__FLEET__*/", (root / "src/fleet.js").read_text())
for marker, filename in [("DAMAGE_MODEL", "damage-model.js"), ("VEHICLE_DAMAGE", "vehicle-damage.js"), ("ENGINE_AUDIO", "engine-audio.js"), ("WORLD_UPGRADE", "world-upgrade.js"), ("VEHICLE_UPGRADE", "vehicle-upgrade.js"), ("POLICE", "police.js"), ("ACTIVITIES", "activities.js"), ("MULTIPLAYER", "multiplayer.js")]:
    game = game.replace("/*__" + marker + "__*/", (root / "src" / filename).read_text())
html = html.replace("/*__DAMAGE_UI__*/", (root / "src/damage-ui.css").read_text())
html = html.replace("/*__GAME__*/", game.replace("</script", "<\\/script"))
html = html.replace("/*__PEERJS__*/", (root / "vendor/peerjs.min.js").read_text().replace("</script", "<\\/script"))
html = html.replace("/*__ENGINE__*/", (root / "vendor/coastal-engine.min.js").read_text().replace("</script", "<\\/script"))
html = html.replace("/*__COAST_DATA__*/", base64.b64encode((root / "data/sunshine-coast.json.gz").read_bytes()).decode())
html = html.replace("/*__CRUISER_PREVIEW__*/", "data:image/png;base64," + base64.b64encode((root / "assets/landcruiser-preview.png").read_bytes()).decode())
licences = ((root / "vendor/LICENSES.txt").read_text() + "\n\nPeerJS 1.5.5 (MIT):\n" + (root / "vendor/PEERJS-LICENSE.txt").read_text()).replace("--", "—")
html = html.replace("</body>", "<!-- Bundled dependency licences\n" + licences + "\n-->\n</body>")
assert "/*__" not in html, "Unresolved build placeholder"
out = root / "index.html"
out.write_text(html)
print(f"Built {out.name}: {out.stat().st_size:,} bytes; runtime and real map included")
