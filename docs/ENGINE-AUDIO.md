# LandCruiser audio

The target is the 79 Series' **4.5-litre 1VD-FTV turbo-diesel V8**. A naturally aspirated petrol V8, an inline-six LandCruiser, or a generic engine recording would not establish that match.

**No genuine engine recording is bundled.** The default is original procedural synthesis: eight combustion pulses per four-stroke cycle, a filtered exhaust tone, and load-dependent turbo whistle/air noise with gradual spool-up and decay. RPM follows the manual gearbox; clutch or neutral reduces simulated turbo load. This is an approximation, not a recording or a calibrated acoustic model of a particular Toyota. It uses native Web Audio nodes without downloading audio or running per-sample JavaScript.

Settings accepts an audio file the player owns or can reuse. That file loops with RPM-linked pitch for the vehicle selected when it is imported, and stays local to the current tab. Importing a LandCruiser sample suppresses both its synthetic exhaust and turbo. Sound off, pause, showroom and changing to another vehicle silence it. Import cannot establish the vehicle, engine or permission from the sound alone.

## Source check, 23 October 2026

No usable, attributable turbo V8 recording was verified. Freesound, Wikimedia Commons, OpenGameArt and Pixabay requests were blocked by the cloud network. GitHub repository searches for LandCruiser/Toyota engine audio did not yield a matching recording.

The public [RC Engine Sound ESP32 project](https://github.com/TheDIYGuy999/Rc_Engine_Sound_ESP32) includes files labelled Ford Powerstroke 7.3 L V8 diesel and Toyota 12H-T inline-six. The inspected repository did not establish reuse permission or recording provenance for those samples; neither was copied into this game. The inline-six also does not match the requested V8.

Bundling an authentic recording remains unfinished. A future asset needs verifiable turbo V8 provenance and reuse terms, with its source and attribution included here.

## Verification

`npm run test:audio` renders the actual synthesis graph in an offline Chromium audio context. It checks the 750 RPM/50 Hz firing relationship, finite unclipped output, gradual turbo spool and decay, zero output while muted or inactive, stop fading and RPM limits. The game feature test additionally checks LandCruiser-only activation, vehicle switching, mute, and an imported test file replacing both synthetic layers. The test file is a generated fixture, not a shipped engine recording.
