# V14 — Public multiplayer transport

Play: https://wadeot.github.io/Coastal-explorer/index.html?v=14

With the optional dedicated-server field blank, the browser automatically tries
EMQX (`wss://broker.emqx.io:8084/mqtt`) and Mosquitto
(`wss://test.mosquitto.org:8081/mqtt`) public test brokers over MQTT 3.1.1.
No hosting account, API key, WebRTC negotiation or manual server URL is needed.
The connected badge appears only after a successful MQTT subscription.

Both players open the game to try the common COAST-PUBLIC room. Alternatively,
choose MULTIPLAYER → CREATE FRIENDS ROOM → COPY INVITE LINK and send the link.
The other player opens it or pastes it into JOIN ROOM. USE PUBLIC RELAYS clears
an old custom-server setting. Public-room invites override remembered custom
server URLs. A dedicated configured relay continues to take priority otherwise.

Five snapshots/second go to each available broker. Both brokers carry the same
room, with independent reconnect/backoff, per-sender sequence deduplication,
size/backpressure limits, vehicle/position validation, a maximum 15 remote
players and eight-second stale presence expiry. Returning to the garage removes
the vehicle while retaining online presence. Packets are QoS zero and never
retained. Local Play starts immediately during connection attempts/failures.
`?network=off` selects local-only automatic startup.

These are anonymous public test services, not a managed game backend. Rooms
and aliases are public and availability is not guaranteed. Only player vehicle
poses/presence and local collision response are shared. Police, damage, jobs,
money and weather remain client-side. The public adapter cannot execute admin
messages, gift money or ban players. Local admin still works; shared moderation
continues to use the authenticated optional dedicated game relay.

## Verification

- `node tests/public-relay.cjs`: 10 checks with the actual built game in isolated
  Chromium contexts and locally simulated MQTT WebSocket brokers. Covers default
  join, remote models, anonymous IDs, secret omission, rejected gifts, redundant
  broker connectivity, garage presence, invite joining, stale-player expiry and
  explicit offline mode; zero page exceptions.
- `node tests/mqtt-codec.cjs`: 7 checks for MQTT negotiation, fragmented and
  combined packets, topic isolation, non-retained publishing, backpressure,
  bounded lengths and closing.
- `node tests/relay.cjs`: 10 dedicated relay/owner authorization checks.
- `node tests/thermal.cjs`: 6 engine temperature checks.
- `node tests/v12.cjs`: 20 fighter/ejection/dedicated-autojoin regression checks;
  zero page exceptions or external requests.
- `node tests/v13.cjs`: 18 road, police, garage and persistence regression checks;
  zero page exceptions or external requests.

Live public broker delivery is **not verified** in this workspace. HTTPS probes
to both public endpoints were blocked by the environment proxy with HTTP 403;
a direct connection could not resolve the broker domain. Protocol fixtures do
not establish that the public services are currently reachable from a player's
network. Their official reference pages are https://test.mosquitto.org/ and
https://www.emqx.com/en/mqtt/public-mqtt5-broker .

All V13 geography, road/terrain changes, repairs, vehicle features and saved
career data remain. The raw geographic archive is unchanged.
