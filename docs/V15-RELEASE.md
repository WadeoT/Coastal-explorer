# V15 — New player tutorial

Play: https://wadeot.github.io/Coastal-explorer/index.html?v=15

The optional coach opens for first-time players after the map finishes loading.
Choose START TUTORIAL; SKIP TOUR dismisses it. Twelve lessons introduce vehicle
selection, movement, braking, camera and mouse look, the live map and private
waypoints, jobs/rewards, buying/modifying vehicles, damage and workshop repairs,
airspace/ATC, public multiplayer and free roam.

Movement, stopping, camera changes, opening/closing the map and activities, and
entering the garage advance the relevant lesson automatically. Instructions
adapt for automatic cars, the manual LandCruiser, boats, helicopters and jets.
NEXT, BACK and SKIP STEP allow self-paced reading without mandatory tasks.
No career rewards, purchases, vehicle swaps or physics settings are forced by
the coach. Tutorial progress/completion/dismissal use a separate storage key.
Unfinished tours resume after reload. H → NEW PLAYER TUTORIAL / REPLAY restarts
from the beginning without resetting the career. The compact dark card fits
mobile screens, sits beneath menus, and does not pause or capture driving.

Verification: `npm run test:tutorial` uses the actual built game in Chromium.
Checks cover first-time welcome, showroom launch, real keyboard acceleration
and braking, camera/map hotkeys, activities/garage progression, vehicle-specific
instructions, back/skip/finish, replay, mobile bounds, dismissal after reload,
and unfinished progress restoration. Screenshots are generated under /tmp.
Public multiplayer remains the V14 transport; the tutorial does not change its
service availability or increase the scope of shared gameplay.
