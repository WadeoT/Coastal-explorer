# V16 — One-click public server and visible players

Play: https://wadeot.github.io/Coastal-explorer/index.html?v=16

Both players choose MULTIPLAYER → JOIN PUBLIC SERVER under Sunshine Coast
Public. Normal startup automatically attempts this same room. There is no
host-ID, invite, code or server URL to enter. Optional friends rooms and custom
connections remain under a collapsed Advanced section.

The main screen now contains an actual online roster, including players who
have not spawned or have returned to the garage. Previously the visible list
only iterated rendered remote vehicles; the complete presence roster was in
an unused hidden panel. The badge, roster and count now update together when
presence arrives. Names default to distinct short driver aliases and edits
persist. Spawned players show their vehicle, distance and FIND ON MAP button;
that button centres the live map and places a personal marker at their last
marked position. Nearby rendered vehicles also get projected player name tags.

Old remembered custom URLs no longer silently divert normal startup from the
public room. Explicit dedicated-server configuration/invite links remain
supported. Clicking the public card always returns to the common room,
including from a friends room. Public wire protocol/topic stays compatible
with V14/V15. No fake players, fabricated occupancy or demo vehicles are added.
Counts come from recently received presence, including the local player, and
stale peers expire after eight seconds. Disconnected counts are shown as
unknown/unavailable rather than claiming an empty or connected server.

The underlying public MQTT services remain best effort. If players cannot
reach a common broker they cannot see each other; a screen redesign cannot
replace an unreachable internet service. This workspace still blocks the live
EMQX probe with proxy HTTP 403. Internet delivery remains unverified here.
The app clearly shows offline/retry state and never blocks Local Play.

## Validation

`npm run test:public-relay` covers the MQTT codec and actual game clients in
separate Chromium contexts using local MQTT/WebSocket protocol fixtures. New
checks exercise visible garage presence, collapsed advanced settings, public
button idempotence, player map lookup, actual remote meshes in the scene's
active render list, projected name tags, returning both clients from a friends
room to the shared public room, synchronized counts and explicit offline state.
The existing checks retain snapshot exchange, secret omission, rejected admin
messages, redundant-broker connectivity, invite support and stale-peer cleanup.
These fixtures do not demonstrate live public-server availability.

`node tests/relay.cjs` checks dedicated-server authorization. Existing dedicated
UI fixtures open Advanced before interacting with server fields. Tutorial
instructions now describe the one-click public server flow.

Results: 15 public-client browser checks, 7 MQTT codec checks, 10 dedicated
relay authorization checks, and 16 dedicated/UI regression checks passed.
Browser suites reported zero unexpected page errors; the dedicated suite also
reported zero external client requests. A rendered two-player screenshot was
saved as `/tmp/coastal-v16-visible-peer.png` during local verification.
