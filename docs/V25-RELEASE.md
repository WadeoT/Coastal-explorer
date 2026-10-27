# V25 — Living Coast

Play: https://wadeot.github.io/Coastal-explorer/index.html?v=25

## Streets and streaming

Pedestrians stay on their assigned pavement, including when turning around. Bench footprints, furniture and vegetation are checked against nearby road corridors, including intersecting roads. More vegetation, mapped speed-limit/one-way/street-name signs, moving clouds, weather-sensitive waves and antialiasing improve the scene. Signs are breakable.

Road/building geometry publishes before slower decoration. Scenery requests are serialised, keep the previous visible world until replacement, predict the direction of travel and refresh sooner at high speed. A missing-world watchdog retries during play. Buildings remain a mixture of mapped footprints and estimated infill; these are not satellite-derived replicas of individual homes.

Traffic brakes for parked/stopped vehicles. NPCs, parked cars and retained wrecks have collision bodies. Nearby cars separate and exchange collision impulses. AI remains an approximation and can still become obstructed in complex intersections.

## Impact damage and survival

Impact energy and object mass/material affect signs, fences, furniture, trees and buildings. Impacts deform actual scene vertices, with fragments and severe structural collapse removing the collider. This is an approximate game model, not engineering-grade structural or BeamNG soft-body simulation. Vehicle damage still uses speed/direction, components, temperature and fuel conditions.

Helicopter tumbles include pitch/roll ground response and driver injury. Severe impacts can detach the rotor, which disables lift; repairs restore it. Wrecked vehicles do not automatically send a living driver to the garage: press X to get out. A dead driver uses the explicit respawn button. A safely landed ejected pilot switches to normal walking/swimming/hijacking.

## Hourly world restoration

At each real clock hour, clients clear world damage/debris, abandoned vehicles and retained NPC/aircraft wrecks, and refresh scenery/traffic. Active players stay connected and retain position, driver/vehicle health, money, XP and jobs. Local wreck pools are bounded for performance even before the hour.

Static-object damage is exchanged between connected clients and remembered locally for the current hour. Public transport is community peer synchronisation, not an authoritative persistent physics server. NPC simulation and abandoned vehicle state remain local; this update does not claim a single server-controlled physical world. Missed historical damage is not guaranteed to replay fully for late joiners.

## Vehicles and controls

Four petrol motorcycles join the brand shop: Yamaha MT-07, Kawasaki Ninja 400, Honda CRF450L and KTM 690 Enduro R. They have fuel/oil/coolant systems, rider models, tuning and manual six-speed drivetrains. The catalogue has 28 vehicles.

Selected manual variants are the LandCruiser, Jimny, i20 N, WRX, Falcon XR6 Turbo, Commodore SS and Mustang GT. Other variants retain automatic/DCT behaviour. Manuals start in neutral: hold Shift (clutch), use Q/E to shift, release the clutch to drive. Inappropriate high gears/low speed or stopping in gear can stall; I restarts with the clutch down or in neutral. Fifth gear has much less launch torque than first. Motorcycle stunts retain V/B/Space/Z, with T for petrol-bike airborne spins (Q for electric bikes).

## Driver and suggestions

YOUR DRIVER in the garage customises jacket, trousers, skin and helmet colours. The saved appearance is used by the seated/on-foot driver and exchanged with other players.

SUGGESTIONS saves ideas locally and can share them with people currently in the lobby. Owner tools provide inbox copy/export. For durable delivery while the owner is offline, use OPEN GITHUB SUGGESTION and submit the prefilled issue with your GitHub account. Local/lobby suggestions do not silently reach an offline owner.

The tutorial covers these controls, survival, hourly restoration, avatar and suggestions.

## Verification

Automated Chromium coverage checks early building publication, queued streaming, road-safe placements, NPC braking/solid wrecks, building/sign deformation, manual stalling, four petrol models, survival/ejection, rotor failure/repair, avatar/suggestion exchange, clouds and hourly reset preserving active players. Dedicated repair-pad, shop/bike/leaderboard and two-client relay regressions also run. Public relay availability still depends on third-party services; unavailable connections do not block local driving.
