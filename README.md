# MM ATLAS — Hypixel Murder Mystery Leaderboards

Dark analytics dashboard with a Node.js server-side integration for the official Hypixel `/v2/leaderboards` API.

## Before data can load

1. Register **your own application** at https://developer.hypixel.net/ and obtain its API key. Keep it private; do not send it in chat, commit it to GitHub, or put it in HTML/JS.
2. Install Node.js 18+.
3. In the project directory, set `HYPIXEL_API_KEY` as an environment variable and run `npm start`.
   - macOS/Linux: `HYPIXEL_API_KEY='your-secret' npm start`
   - PowerShell: `$env:HYPIXEL_API_KEY='your-secret'; npm start`
4. Open http://localhost:3000.

For public deployment, push this project to GitHub, then create a Node.js web service on a provider such as Render. Set build command to `npm install`, start command to `npm start`, and add `HYPIXEL_API_KEY` in the provider's private environment variable settings. Use that service's URL; this is **not** a static GitHub Pages project.

## Technical notes

- `/api/leaderboards` fetches, normalizes, and caches official leaderboard results for 5 minutes. The browser never receives the API key.
- `/api/status` reports if a key is configured without revealing it.
- Shows only actual Murder Mystery boards returned by Hypixel, not computed global rankings.
- The leaderboard API may return an ordered list of UUIDs without individual score values. Such values display as `—`, not fabricated statistics.
- Daily, Weekly, Monthly are only displayed if the official board titles/paths indicate them. Missing categories yield a visible empty state.
- Results may not list all players; they are limited to official returned entries.
- Hypixel is a trademark of its respective owner; this independent fan project is not affiliated with or endorsed by Hypixel.
- Policy reference: https://developer.hypixel.net/policies/
