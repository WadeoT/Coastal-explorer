#!/usr/bin/env python3
"""Assemble the distributable HTML from vendored runtime, source and map snapshot."""
from pathlib import Path
import base64, json, os

root = Path(__file__).resolve().parents[1]
html = (root / "src/shell.html").read_text()
fonts = []
for family, name in [("DM Sans", "dm-sans"), ("Space Grotesk", "space-grotesk")]:
    encoded = base64.b64encode((root / f"vendor/fonts/{name}.woff2").read_bytes()).decode()
    fonts.append(f"@font-face{{font-family:'{family}';font-style:normal;font-weight:100 900;font-display:swap;src:url(data:font/woff2;base64,{encoded}) format('woff2')}}")
html = html.replace("@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap');", "\n".join(fonts))
game = (root / "src/game.js").read_text().replace("/*__GEOGRAPHY__*/", (root / "src/geography.js").read_text()).replace("/*__VEHICLE_MODELS__*/", (root / "src/vehicle-models.js").read_text()).replace("/*__FLEET__*/", (root / "src/fleet.js").read_text())
for marker, filename in [("COASTAL_WATER", "coastal-water.js"), ("GROUND_ESCAPE", "ground-escape.js"), ("LOCAL_DETAIL", "local-detail.js"), ("IMPACT_DYNAMICS", "impact-dynamics.js"), ("SURFACE_TEXTURES", "surface-textures.js"), ("SERVER_BROWSER", "server-browser.js"), ("TUTORIAL", "tutorial.js"), ("PUBLIC_RELAY", "public-relay.js"), ("STREET_SYSTEMS", "street-systems.js"), ("AIR_COMBAT", "air-combat.js"), ("DAMAGE_MODEL", "damage-model.js"), ("VEHICLE_DAMAGE", "vehicle-damage.js"), ("SOLID_CRASHES", "solid-crashes.js"), ("ENGINE_AUDIO", "engine-audio.js"), ("WORLD_UPGRADE", "world-upgrade.js"), ("STABLE_HOUSES", "stable-houses.js"), ("VEHICLE_UPGRADE", "vehicle-upgrade.js"), ("FLIGHT_SYSTEMS", "flight-systems.js"), ("POLICE", "police.js"), ("DRIVING_REWARDS", "driving-rewards.js"), ("ACTIVITIES", "activities.js"), ("PROFESSIONAL_JOBS", "professional-jobs.js"), ("OWNER_ADMIN", "owner-admin.js"), ("MULTIPLAYER", "multiplayer.js"), ("LOBBY_UI", "lobby-ui.js"), ("MAP_MARKERS", "map-markers.js"), ("RUNTIME_ERRORS", "runtime-errors.js"), ("WORLD_RULES", "world-rules.js"), ("DANGER_ALERTS", "danger-alerts.js"), ("FLIGHT_ENFORCEMENT", "flight-enforcement.js"), ("VEHICLE_GEOMETRY", "vehicle-geometry.js"), ("REPAIR_GARAGES", "repair-garages.js"), ("PLAYER_INTERFACE", "player-interface.js"), ("POLICE_DISPATCH", "police-dispatch.js")]:
    game = game.replace("/*__" + marker + "__*/", (root / "src" / filename).read_text())
html = html.replace("/*__DAMAGE_UI__*/", (root / "src/damage-ui.css").read_text())
previews={p.stem:'data:image/png;base64,'+base64.b64encode(p.read_bytes()).decode() for p in (root/'assets/vehicle-previews').glob('*.png')}
game=game.replace('/*__POLICE_STATIONS__*/{}',(root/'data/police-stations.json').read_text())
game=game.replace('/*__REPAIR_GARAGES__*/{}',(root/'data/repair-garages.json').read_text())
game=game.replace('/*__MODEL_PREVIEWS__*/{}',json.dumps(previews,separators=(',',':')))
game = game.replace('/*__PUBLIC_RELAY_URL__*/""', json.dumps(os.environ.get('COASTAL_RELAY_URL', '')))
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
