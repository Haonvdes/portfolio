// Run: CLIENT_ID=xxx CLIENT_SECRET=yyy node spotify-reauth.js
const http = require('http');
const { exec } = require('child_process');

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = 'http://127.0.0.1:3000/spotify-callback';
const SCOPE = 'user-read-playback-state user-read-recently-played';

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error(
    'Usage: CLIENT_ID=xxx CLIENT_SECRET=yyy node spotify-reauth.js'
  );
  process.exit(1);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:3000`);

  if (url.pathname === '/spotify-callback') {
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');

    if (error || !code) {
      res.writeHead(400);
      res.end(`Authorization failed: ${error || 'no code'}`);
      server.close();
      return;
    }

    try {
      const body = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
      }).toString();

      const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body,
      });

      const data = await tokenRes.json();

      if (data.error) {
        res.writeHead(400);
        res.end(
          `Token exchange failed: ${data.error_description || data.error}`
        );
        server.close();
        return;
      }

      console.log('\n✅ New refresh token:');
      console.log(data.refresh_token);
      console.log(
        '\nUpdate REFRESH_TOKEN on Render with the value above, then redeploy.\n'
      );

      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <h2>New Spotify Refresh Token</h2>
        <p>Also printed in your terminal. Copy this and update <strong>REFRESH_TOKEN</strong> on Render:</p>
        <textarea rows="4" cols="80" onclick="this.select()">${data.refresh_token}</textarea>
        <p>You can close this window and stop the script (Ctrl+C).</p>
      `);
      server.close();
    } catch (err) {
      res.writeHead(500);
      res.end(`Error: ${err.message}`);
      server.close();
    }
    return;
  }

  res.writeHead(302, {
    Location: `https://accounts.spotify.com/authorize?${new URLSearchParams({ client_id: CLIENT_ID, response_type: 'code', redirect_uri: REDIRECT_URI, scope: SCOPE })}`,
  });
  res.end();
});

server.listen(3000, '127.0.0.1', () => {
  const authUrl = `http://127.0.0.1:3000`;
  console.log(
    `\nOpening Spotify authorization...\nIf the browser doesn't open, visit: ${authUrl}\n`
  );
  exec(`open "${authUrl}"`);
});
