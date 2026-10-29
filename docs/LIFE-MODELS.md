# Life Model sources and licences

Nine user-supplied models are adapted separately from the game code. Changes: metre-scale alignment, simplified geometry, runtime material conversion, wheel/rotor/gear groups, lower-detail meshes and preview renders.

Per-model terms apply to the adapted `assets/life-models/<key>.json.gz` data, its embedded copy in index.html and corresponding preview. The Jeep adaptation and preview remain CC-BY-NC-SA-4.0; no commercial-use permission or blanket game-code licence is claimed for that asset.

## Toyota Land Cruiser J50 (1975)

Nieve5677 — https://sketchfab.com/iori308408

Original model: https://sketchfab.com/3d-models/toyota-land-cruiser-j501975-5dfa809650cf4491922a44118ec50dc8

Licence: https://creativecommons.org/licenses/by/4.0/


## Hyundai i20 (2010)

Nieve5677 — https://sketchfab.com/iori308408

Original model: https://sketchfab.com/3d-models/hyundai-i20-2010-e71dd7d6b29245ca9d17ea1fd44edea7

Licence: https://creativecommons.org/licenses/by/4.0/


## BMW M3 Competition Touring G81

Black Snow — https://sketchfab.com/BlackSnow02

Original model: https://sketchfab.com/3d-models/bmw-m3-competition-tourning-g81-e2a4d608b2034e639c7eb6a2ef8dbfa1

Licence: https://creativecommons.org/licenses/by/4.0/


## Jeep Gladiator (2020)

Ddiaz Design — https://sketchfab.com/ddiaz-design

Original model: https://sketchfab.com/3d-models/2020-jeep-gladiator-98bc399af1e948eda5db6d75c5bb649d

Licence: https://creativecommons.org/licenses/by-nc-sa/4.0/


## Toyota Hilux (replacement file labelled 2022)

Original model: https://sketchfab.com/3d-models/toyota-hilux-revo-prerunner-2021-04ae6d8e07e84f55a9e1d7e3261be171

Source link supplied with the original 2021 ZIP; replacement USDZ labelled 2022. Creator/licence not embedded in supplied replacement.


## Boeing F/A-18E/F Super Hornet

Original model: https://sketchfab.com/3d-models/boeing-fa-18ef-super-hornet-f71e9fea01e24fea9b1b380161d21d38

Creator/licence not included in supplied archive; source link supplied by user.


## Nissan Patrol Y60

Mihai Candrea (credited by source filename)

Original page/licence not included in supplied archive.


## Porsche 911 GT3 RS · Carrera Tribute (2023)

Original page/creator/licence not included in supplied archive.


## ADAC Rescue Helicopter

Supplied GLB has geometry and a plain material, with no image textures or source licence/creator metadata.


## Import pipeline

Run Blender with `--disable-autoexec --python scripts/import-life-model.py -- <key> <source-file> <output-folder>`. FBX, GLB/glTF and OBJ are supported. The Hilux USDZ is first read with `scripts/import-hilux-usdz.py <source.usdz> <output-folder>` (requires the `usd-core` Python package); that asset uses Z-up mesh coordinates despite its stage metadata. Pack converted folders with `python3 scripts/pack-life-models.py <converted-folder>`, then `node scripts/build-life-lods.cjs`, then build the game. `meshoptimizer` is build-time only. Raw uploaded archives and Blender embedded scripts are not executed or bundled.

Missing original licence/creator details are explicitly marked; they are not invented. The provided Sketchfab hosts could not be fetched from this environment, so the manifest uses embedded GLB metadata, the BMW licence file, the Patrol filename credit and links supplied by the user.


v1.4.1 keeps high-detail geometry and the source interior for the driven/hijacked player model, including Low settings; traffic and remote instances remain lower detail. Cockpit positions and avatar scale follow each imported cabin. Window opacity and material alpha handling are corrected, and a shared small sky-reflection map improves paint/glass on Balanced and higher settings. Generic external lamp boxes are suppressed; available source lamp materials illuminate instead. Supplied source geometry still determines interior detail; missing source gauges are not reconstructed as manufacturer-calibrated instruments.
