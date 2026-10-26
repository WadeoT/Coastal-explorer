# Host the game on Netlify with public multiplayer

The repository includes Netlify configuration. You do not need to upload the 31 MB HTML manually. Netlify serves the browser game; a separate Node service maintains persistent WebSocket rooms. No site or relay has been deployed to your accounts from this workspace.

## 1. Create the Netlify site

1. In Netlify, choose **Add new project → Import an existing project → GitHub**.
2. Select **WadeoT/Coastal-explorer**, branch **codex/sunshine-coast-game**.
3. Keep the repository settings: build command `python3 scripts/build.py && python3 scripts/site.py`, publish directory `site`.
4. Deploy. The site opens at the actual `https://your-assigned-name.netlify.app` URL Netlify gives you. You can rename it in Netlify.

[Open Netlify import](https://app.netlify.com/start/deploy?repository=https://github.com/WadeoT/Coastal-explorer). Check the branch if the import screen asks. V9 waits in the setup lobby until its relay is configured.

## 2. Deploy the multiplayer relay

[Deploy the included Render blueprint](https://render.com/deploy?repo=https%3A%2F%2Fgithub.com%2FWadeoT%2FCoastal-explorer). Select branch `codex/sunshine-coast-game` if asked. A Render account is separate from Netlify. Another Node host supporting long-lived WebSockets can run the same service.

The blueprint runs `node server/relay.cjs` with Node 22. Its `/health` response should show protocol 2 and `ownerConfigured: true` after the next step. The service also serves the game at its own HTTPS root, automatically using itself as relay.

Generate a private owner key on **your own computer**, inside the checkout:

```sh
node scripts/create-owner-key.cjs
```

Copy the generated value into the relay host's **private environment variable** `OWNER_ADMIN_TOKEN`. Store it privately; enter it in ADMIN → owner login when you play. Do not paste it into chat, a shared URL, GitHub, or the public Netlify build variables. Keys need at least 24 characters. Changing the key and restarting revokes old owner login access.

Optional relay variables:

| Variable | Purpose |
| --- | --- |
| `PORT` | Supplied by most Node hosts; defaults to 8080 locally. |
| `ALLOWED_ORIGINS` | Comma-separated exact frontend origins, e.g. your Netlify origin and `https://wadeot.github.io`; include the relay's own origin if playing there. |
| `COASTAL_DATA_FILE` | Full path to a JSON state file on durable storage. Defaults to `server/.coastal-data/state.json`. |

The free Render blueprint has no persistent disk. A process restart can preserve files, but redeploying/recreating the service can lose identities, bans, queued gifts and settings. Use a host with durable storage or an explicitly configured persistent volume if those must survive redeploys. The blueprint does not silently select a paid plan. Keep the state file private and backed up. A sleeping free service can take time to wake before joining.

## 3. Connect Netlify to the relay

1. Copy the relay's actual HTTPS root URL from its hosting dashboard.
2. In the Netlify site's environment variables, add **`COASTAL_RELAY_URL`** with that URL. This URL is public; it is not the owner key.
3. Trigger a new production deploy. This embeds the public URL into the standalone HTML.
4. Open the Netlify site, choose a vehicle and **DRIVE / LAUNCH**. Multiplayer should report a public room. A second browser on the same site joins an available room automatically. Disconnects pause driving while the client reconnects.

Share your actual Netlify site URL with friends. If you are using GitHub Pages instead, enter the HTTPS relay URL in Multiplayer and share the generated relay-configured invite. Sending the GitHub link alone, without any configured relay, does not create a server; V9 stays at the connection gate.

## Owner testing

Use ADMIN, enter the private key, and select **My player**, **All connected players** or a player in the target dropdown. The panel has wanted stars, set money, component damage, fire, explosion, repair and freeze controls. Examples in the typed console:

```text
cash 5000000
gift me 100000
wanted me 5
action all wanted 0
action me vehicle lifeflight
action me interceptors
action me damage radiator 80
action me repair
settings rewardMultiplier 2
settings policeEnabled off
settings autoWeather off
weather clear
time 14
players
ban PLAYER_ID reason
unban PLAYER_ID
```

`players` lists IDs across connected rooms. Keys are verified on the server, not embedded in JavaScript. Owner login requires HTTPS/WSS except localhost. Anonymous identities are not account authentication; a new browser identity can bypass a ban. Normal career money and physics remain client-side, so do not treat the relay as competitive anticheat.
