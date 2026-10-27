# V17 — Impact, handling and surface detail

Play: https://wadeot.github.io/Coastal-explorer/index.html?v=17

- Ground cars now have an angular crash state with gravity, sliding friction,
  swept scenery collision and orientation-dependent ground support. An offset
  high-energy crash can roll onto a side or roof and stay there. The former
  fixed 2.5-second reset and hard car-wall pinning no longer override this.
  Frontal walls crush bodywork and dissipate speed rather than launching every
  impact. R recovers a surviving overturned car; damage stays. Existing terminal
  wreck/garage flow remains. This is a bounded arcade approximation, not a full
  automotive rigid-body/soft-body solver.
- Selected paint/metal panels receive bounded extra vertices once so impacts
  can deform the skin. Scratches/bullet scars are textured decals clipped to
  an actual struck mesh and parented to it; the floating disc/crack markers
  are removed. Hits through model gaps do not manufacture a floating scar.
  Repair restores vertex positions and clears marks without repeated subdivision.
- Cars retain fluid/component simulation and warnings, but lose the extra
  oil/coolant pod, numeric fluid overlay and LandCruiser fluid text in its main
  cluster. Critical warnings work in either view. Aircraft retain physical
  instruments and detailed cockpit readings.
- Cars, bikes and karts apply accelerator force while held, with additional
  off-pedal engine braking/coasting. Boats also use hold-to-accelerate controls
  and increased water drag on release. Aircraft throttle/collective controls
  remain unchanged. Coasting retains momentum; releasing W is not an instant
  stop. Updated controls/tutorial explain this.
- Original embedded procedural textures add irregular grass/earth grain,
  pebbles, mortar/brick relief shading, corrugated roof strips/fasteners,
  metallic paint grain, brushed metal and rubber detail. World facade UVs are
  ready on the first geometry build. Traffic, showroom and remote vehicles
  also receive appropriate materials. No external texture downloads are needed.
- Crashes/explosions use bounded pools of 36 flame/smoke planes, 16 debris
  pieces and 20 sparks, plus a textured expanding fireball, dust ring and brief
  warm flash light. Existing fire/component outcomes remain cinematic gameplay.
- Remote exterior positions now rotate chassis clearance with the vehicle,
  keeping a replicated sideways/rolled model aligned with its chassis pose.
  Component damage/deformation remains local, as in earlier multiplayer versions.

## Verification

`node tests/v17.cjs` runs the actual game in Chromium, covering pedal release,
car-only warning display, retained aircraft instruments/throttle, boat coasting,
textures/UVs, actual deformed vertices and clipped scars, repair lifecycle,
rollover ground clearance, recovery without healing, a real mapped 120 km/h
wall contact, remote rolled-pose alignment and bounded explosion effects.

Separate component/temperature checks and the existing damage-browser and
fighter/ejection regressions check failures, repair, bullets, aircraft controls
and remote pilots. Public broker availability is unchanged from V16.
