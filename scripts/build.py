#!/usr/bin/env python3
"""Assemble the distributable HTML from vendored runtime, source and map snapshot."""
from pathlib import Path
import base64, json, os, io
try:
    from PIL import Image
except ImportError:
    Image = None

root = Path(__file__).resolve().parents[1]
html = (root / "src/shell.html").read_text()
html = html.replace("/*__STARTUP__*/", (root / "src/startup.js").read_text())
fonts = []
for family, name in [("DM Sans", "dm-sans"), ("Space Grotesk", "space-grotesk")]:
    encoded = base64.b64encode((root / f"vendor/fonts/{name}.woff2").read_bytes()).decode()
    fonts.append(f"@font-face{{font-family:'{family}';font-style:normal;font-weight:100 900;font-display:swap;src:url(data:font/woff2;base64,{encoded}) format('woff2')}}")
html = html.replace("@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap');", "\n".join(fonts))
game = (root / "src/game.js").read_text().replace("/*__GEOGRAPHY__*/", (root / "src/geography.js").read_text()).replace("/*__VEHICLE_MODELS__*/", (root / "src/vehicle-models.js").read_text()).replace("/*__FLEET__*/", (root / "src/fleet.js").read_text())
for marker, filename in [("LIFE_MODELS", "life-models.js"), ("CRASH_CINEMATIC", "crash-cinematic.js"), ("COASTAL_CLIMATE", "coastal-climate.js"), ("HIJACK_IDENTITY", "hijack-identity.js"), ("VISUAL_UPGRADE", "visual-upgrade.js"), ("ARCHITECTURE_UPGRADE", "architecture-upgrade.js"), ("PERFORMANCE_V130", "performance-v130.js"), ("ACTION_UPGRADE", "action-upgrade.js"), ("SOCIAL_DRIVING", "social-driving.js"), ("GRAPHICS_SETTINGS", "graphics-settings.js"), ("GARAGE_SPAWN", "garage-spawn.js"), ("FLIGHT_NAVIGATION", "flight-navigation.js"), ("TRAFFIC_UPGRADE", "traffic-upgrade.js"), ("RELIABILITY_UPGRADE", "reliability-upgrade.js"), ("COMMUNITY_OWNER", "community-owner.js"), ("SHARED_PURSUITS", "shared-pursuits.js"), ("FUEL_POOLS", "fuel-pools.js"), ("BIKE_UPGRADE", "bike-upgrade.js"), ("EXPANDED_FLEET", "expanded-fleet.js"), ("WORLD_LIFECYCLE", "world-lifecycle.js"), ("DRIVER_UPGRADE", "driver-upgrade.js"), ("COMMUNITY_UPGRADE", "community-upgrade.js"), ("PERFORMANCE_SHOP", "performance-shop.js"), ("ELECTRIC_BIKES", "electric-bikes.js"), ("COMPETITION", "competition.js"), ("JUNCTIONS", "junctions.js"), ("DISTRICT_EVENTS", "district-events.js"), ("NEIGHBOURHOOD_APPEARANCE", "neighbourhood-appearance.js"), ("MOBILITY_UPGRADE", "mobility-upgrade.js"), ("NEIGHBOURHOOD_UPGRADE", "neighbourhood-upgrade.js"), ("NOSTR_RELAY", "nostr-relay.js"), ("BEAM_CRASH", "beam-crash.js"), ("CRASH_STRUCTURES", "crash-structures.js"), ("STREET_LIFE", "street-life.js"), ("COASTAL_WATER", "coastal-water.js"), ("GROUND_ESCAPE", "ground-escape.js"), ("LOCAL_DETAIL", "local-detail.js"), ("IMPACT_DYNAMICS", "impact-dynamics.js"), ("SURFACE_TEXTURES", "surface-textures.js"), ("SERVER_BROWSER", "server-browser.js"), ("TUTORIAL", "tutorial.js"), ("PUBLIC_RELAY", "public-relay.js"), ("STREET_SYSTEMS", "street-systems.js"), ("AIR_COMBAT", "air-combat.js"), ("DAMAGE_MODEL", "damage-model.js"), ("VEHICLE_DAMAGE", "vehicle-damage.js"), ("SOLID_CRASHES", "solid-crashes.js"), ("ENGINE_AUDIO", "engine-audio.js"), ("WORLD_UPGRADE", "world-upgrade.js"), ("STABLE_HOUSES", "stable-houses.js"), ("VEHICLE_UPGRADE", "vehicle-upgrade.js"), ("FLIGHT_SYSTEMS", "flight-systems.js"), ("POLICE", "police.js"), ("DRIVING_REWARDS", "driving-rewards.js"), ("ACTIVITIES", "activities.js"), ("PROFESSIONAL_JOBS", "professional-jobs.js"), ("OWNER_ADMIN", "owner-admin.js"), ("MULTIPLAYER", "multiplayer.js"), ("LOBBY_UI", "lobby-ui.js"), ("MAP_MARKERS", "map-markers.js"), ("RUNTIME_ERRORS", "runtime-errors.js"), ("WORLD_RULES", "world-rules.js"), ("DANGER_ALERTS", "danger-alerts.js"), ("FLIGHT_ENFORCEMENT", "flight-enforcement.js"), ("VEHICLE_GEOMETRY", "vehicle-geometry.js"), ("REPAIR_GARAGES", "repair-garages.js"), ("PLAYER_INTERFACE", "player-interface.js"), ("POLICE_DISPATCH", "police-dispatch.js")]:
    game = game.replace("/*__" + marker + "__*/", (root / "src" / filename).read_text())
html = html.replace("/*__DAMAGE_UI__*/", (root / "src/damage-ui.css").read_text())
previews={}
for preview in (root/'assets/vehicle-previews').glob('*.png'):
    raw=preview.read_bytes();mime='image/png'
    if Image:
        with Image.open(io.BytesIO(raw)) as picture:
            picture.thumbnail((420,270))
            encoded=io.BytesIO();picture.save(encoded,format='WEBP',quality=86,method=5)
            raw=encoded.getvalue();mime='image/webp'
    previews[preview.stem]='data:'+mime+';base64,'+base64.b64encode(raw).decode()

version=json.loads((root/'data/version.json').read_text())
html=html.replace('__GAME_VERSION__',version['version']).replace('__RELEASE_TITLE__',version['title'].upper())
game=game.replace("/*__GAME_VERSION__*/'1.2.9'",json.dumps(version['version']))
game=game.replace('/*__ARCHITECTURE_PILOT__*/{records:[]}',(root/'data/architecture/runtime.json').read_text())
game=game.replace('/*__AIRPORT_RUNWAYS__*/{runways:[]}',(root/'data/sunshine-airport-runways.json').read_text())
game=game.replace('/*__COMMUNITY_OWNER_CONFIG__*/{}',(root/'data/community-owner.json').read_text())
game=game.replace('/*__EXPANDED_FLEET_DATA__*/{models:[]}',(root/'data/expanded-fleet.json').read_text())
game=game.replace('/*__TRAFFIC_CENSUS__*/{stations:[],year:null}',(root/'data/traffic-census.json').read_text())
game=game.replace('/*__POLICE_STATIONS__*/{}',(root/'data/police-stations.json').read_text())
game=game.replace('/*__REPAIR_GARAGES__*/{}',(root/'data/repair-garages.json').read_text())
game=game.replace('/*__MODEL_PREVIEWS__*/{}',json.dumps(previews,separators=(',',':')))
game = game.replace('/*__PUBLIC_RELAY_URL__*/""', json.dumps(os.environ.get('COASTAL_RELAY_URL', '')))
game=game.replace('/*__LIFE_MODEL_CREDITS__*/{models:[]}',(root/'assets/life-models/manifest.json').read_text())
game=game.replace('/*__LIFE_MODEL_ASSETS__*/{}',json.dumps({p.name.removesuffix('.json.gz'):base64.b64encode(p.read_bytes()).decode() for p in (root/'assets/life-models').glob('*.json.gz')},separators=(',',':')))
html = html.replace("/*__GAME__*/", game.replace("</script", "<\\/script"))
html = html.replace("/*__NOSTR_CRYPTO__*/", (root / "vendor/nostr-crypto.min.js").read_text().replace("</script", "<\\/script"))
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
