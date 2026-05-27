# spotify-playback-debug.md

> Debug notes for `GET /api/spotify/playback` — prepared for IDE + Claude debugging session.

---

## Observed Symptoms

| Symptom | Detail |
|---|---|
| `304 Not Modified` | `GET https://api.stpnguyen.com/api/spotify/playback` returns 304 even when music is actively playing |
| `Recent Tracks API Response: null` | Logged server-side when the fallback to Spotify's recently-played endpoint is triggered |
| UI shows "Stephano is away" | Even when Spotify is actively playing |
| Response body stuck at | `{"playing":false,"track":"No recent track available","artist":"Unknown artist","albumCover":null,"trackUrl":null}` |

---

## Root Cause Analysis

### Bug 1 (Primary): Spotify `/me/player` returns `204 No Content` and the fallback breaks

Spotify's Currently Playing endpoint (`/me/player`) returns **`204 No Content`** (not `200`) when:
- Playback is active but in a **private session**
- A brief **gap between tracks**
- The token lacks the correct **scopes**

Calling `.json()` on a `204` response returns `null` or throws — which causes the fallback to recently-played to also fail.

Likely broken backend flow:

```js
// ❌ BROKEN
const playbackRes = await spotifyFetch('/me/player');
const playbackData = await playbackRes.json(); // null if 204 → crashes fallback

const recentRes = await spotifyFetch('/me/player/recently-played');
console.log('Recent Tracks API Response:', recentRes); // logs null
```

---

### Bug 2 (Secondary): Missing OAuth scope `user-read-recently-played`

The log `Recent Tracks API Response: null` also indicates the recently-played API call itself is failing.  
This happens when the Spotify app was authorized **without** the `user-read-recently-played` scope.

Current likely scopes (incomplete):
```
user-read-playback-state
user-read-currently-playing
```

Missing scope:
```
user-read-recently-played   ← needs to be added
```

---

### Bug 3 (Compounding): Browser caches the "away" response → `304` on next polls

Because the "away" JSON response is static and unchanged between polls, the browser caches it using `ETag` / `Last-Modified`. On subsequent 30-second polling intervals, the browser sends a conditional request and gets `304 Not Modified` — meaning even if the server now has fresh data, **the browser never receives it**.

---

## Files Involved

| File | Location | Role |
|---|---|---|
| `socialize.js` | `/js/socialize.js` (frontend) | Calls `/api/spotify/playback` every 30s via `setInterval` |
| Spotify route handler | Backend — `/api/spotify/playback` | Fetches from Spotify, returns JSON |
| Token/auth module | Backend | Handles OAuth token refresh |

---

## Fixes

### Fix 1 — Handle `204` correctly in the route handler

Never call `.json()` on a `204` response. Check the status first:

```js
// ✅ FIXED
const playbackRes = await spotifyFetch('/me/player');

if (playbackRes.status === 204 || playbackRes.status === 304) {
  // No active playback session — skip to recently-played fallback
  return await getRecentlyPlayed(accessToken);
}

if (!playbackRes.ok) {
  throw new Error(`Spotify /me/player error: ${playbackRes.status}`);
}

const playbackData = await playbackRes.json(); // safe — only called on 200
```

---

### Fix 2 — Add missing OAuth scope and re-authorize

Update the authorization URL scopes in the backend:

```js
// ✅ FIXED — add user-read-recently-played
const scopes = [
  'user-read-playback-state',
  'user-read-currently-playing',
  'user-read-recently-played'   // ← ADD THIS
].join(' ');
```

After adding the scope, you **must re-authorize** (generate a new refresh token) — existing tokens won't gain new scopes automatically.

---

### Fix 3 — Disable caching on the route response

Add `Cache-Control: no-store` so the browser always fetches fresh data:

```js
// ✅ FIXED — add to your Express route
app.get('/api/spotify/playback', async (req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.set('Pragma', 'no-cache');

  // ... rest of handler
});
```

---

### Fix 4 (Optional — frontend cache-bust)

As a belt-and-suspenders approach, append a timestamp to the fetch URL in `socialize.js`:

```js
// In socialize.js → getPlaybackState()
const playbackResponse = await fetch(
  `https://api.stpnguyen.com/api/spotify/playback?t=${Date.now()}`
);
```

---

## Bonus Bug: `require is not defined` in `script.js`

**File:** `/js/script.js` — around line 408  
**Error:** `ReferenceError: require is not defined`

Node.js / Express server code was accidentally left in the frontend script:

```js
// ❌ DELETE THESE LINES from script.js — they are server-side code
const path = require('path');         // ← crashes in browser
const app = express();
app.use(express.json());
app.use(express.static('public'));
app.get('/case-study/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'case-study.html'));
});
```

**Fix:** Delete those lines entirely from `script.js`. They belong on the backend server only.

---

## Priority Order

1. **Re-authorize Spotify with correct scopes** (Bug 2) — generates a valid refresh token
2. **Fix the `204` handler** (Bug 1) — prevents null crash and broken fallback
3. **Add `Cache-Control: no-store`** (Bug 3) — prevents 304 stale responses
4. **Remove `require` lines from `script.js`** (Bonus) — clears the JS exception on every page load
