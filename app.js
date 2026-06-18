const express = require('express');
const axios = require('axios');
const cors = require('cors');
const dotenv = require('dotenv');
const moment = require('moment');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const sanitizeHtml = require('sanitize-html');
const FormData = require('form-data');

// Load environment variables from .env file
dotenv.config();

// 👉 Khởi tạo `app` trước khi sử dụng nó
const app = express();

// CORS configuration

const allowedOrigins = [
  'https://haonvdes.github.io',
  'http://localhost:3000',
  'https://stpnguyen.com',
  'http://stpnguyen.com',
  'https://www.stpnguyen.com',
  'https://hook.eu1.make.com',
  'http://www.stpnguyen.com',
];

const corsOptions = {
  origin: (origin, callback) => {
    console.log(`Origin: ${origin}`); // ✅ Debugging line

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`Not allowed by CORS: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true,
};

// 👉 Sử dụng `cors` sau khi khai báo `app`
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static('public'));
app.use(express.json());

// Environment variables
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID;
const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;
const STRAVA_REFRESH_TOKEN = process.env.STRAVA_REFRESH_TOKEN;
const JWT_SECRET = process.env.JWT_SECRET;
const MAKE_WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL;

// Mutable — updated in-memory when Spotify rotates the token
let currentSpotifyRefreshToken = process.env.REFRESH_TOKEN;

// Persists the new refresh token to Render env vars so it survives restarts
async function updateRenderRefreshToken(newToken) {
  const RENDER_API_KEY = process.env.RENDER_API_KEY;
  const RENDER_SERVICE_ID = process.env.RENDER_SERVICE_ID;

  if (!RENDER_API_KEY || !RENDER_SERVICE_ID) {
    console.warn(
      'RENDER_API_KEY or RENDER_SERVICE_ID not set — skipping Render env var update'
    );
    return;
  }

  try {
    const { data: envVarList } = await axios.get(
      `https://api.render.com/v1/services/${RENDER_SERVICE_ID}/env-vars`,
      {
        headers: {
          Authorization: `Bearer ${RENDER_API_KEY}`,
          Accept: 'application/json',
        },
      }
    );

    const updated = envVarList.map(({ envVar }) => ({
      key: envVar.key,
      value: envVar.key === 'REFRESH_TOKEN' ? newToken : envVar.value,
    }));

    await axios.put(
      `https://api.render.com/v1/services/${RENDER_SERVICE_ID}/env-vars`,
      updated,
      {
        headers: {
          Authorization: `Bearer ${RENDER_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Spotify refresh token persisted to Render successfully');
  } catch (error) {
    console.error(
      'Failed to update refresh token on Render:',
      error.response?.data || error.message
    );
  }
}

// Spotify token refresh function
async function getSpotifyAccessToken() {
  try {
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: currentSpotifyRefreshToken,
      }).toString(),
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    // Spotify may return a new refresh token when rotating — capture and persist it
    const newRefreshToken = response.data.refresh_token;
    if (newRefreshToken && newRefreshToken !== currentSpotifyRefreshToken) {
      currentSpotifyRefreshToken = newRefreshToken;
      updateRenderRefreshToken(newRefreshToken).catch((err) =>
        console.error('Background Render token update failed:', err.message)
      );
    }

    return response.data.access_token;
  } catch (error) {
    const errorData = error.response?.data;
    if (errorData?.error === 'invalid_grant') {
      console.error(
        'Spotify refresh token has expired. Re-authorize at https://accounts.spotify.com and update REFRESH_TOKEN on Render.'
      );
      throw new Error(
        'Spotify refresh token expired — manual reauthorization required'
      );
    }
    console.error('Error refreshing token:', errorData || error.message);
    throw new Error('Failed to refresh token');
  }
}

// Strava token refresh function
async function getStravaAccessToken() {
  try {
    const response = await axios.post('https://www.strava.com/oauth/token', {
      client_id: STRAVA_CLIENT_ID,
      client_secret: STRAVA_CLIENT_SECRET,
      refresh_token: STRAVA_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    });
    return response.data.access_token;
  } catch (error) {
    console.error('Error refreshing Strava token:', error.message);
    throw new Error('Failed to refresh Strava token');
  }
}

let lastPlayedSong = null;
const lastPlayedFile = 'lastPlayed.json';

// Load last played song at startup
try {
  if (fs.existsSync(lastPlayedFile)) {
    const fileContent = fs.readFileSync(lastPlayedFile, 'utf8');
    lastPlayedSong = fileContent ? JSON.parse(fileContent) : null;
  }
} catch (error) {
  console.error('Error loading last played song:', error);
  lastPlayedSong = null; // Reset if there's an error
}

app.get('/api/spotify/playback', async (req, res) => {
  try {
    const accessToken = await getSpotifyAccessToken();

    // Fetch playback state and recent tracks in parallel
    const responses = await Promise.allSettled([
      axios.get('https://api.spotify.com/v1/me/player', {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
      axios.get(
        'https://api.spotify.com/v1/me/player/recently-played?limit=1',
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      ),
    ]);

    const playbackResponse =
      responses[0].status === 'fulfilled' ? responses[0].value.data : null;
    const recentTracksResponse =
      responses[1].status === 'fulfilled' ? responses[1].value.data : null;

    if (responses[0].status === 'rejected')
      console.error(
        'Playback API error:',
        responses[0].reason?.response?.data || responses[0].reason?.message
      );
    if (responses[1].status === 'rejected')
      console.error(
        'Recent Tracks API error:',
        responses[1].reason?.response?.data || responses[1].reason?.message
      );

    console.log(
      'Playback Response:',
      JSON.stringify(playbackResponse, null, 2)
    );
    console.log(
      'Recent Tracks API Response:',
      JSON.stringify(recentTracksResponse, null, 2)
    );

    let isPlaying = playbackResponse?.is_playing;
    let currentTrack = playbackResponse?.item;

    const hasRecentTracks =
      recentTracksResponse?.items && recentTracksResponse.items.length > 0;

    // Only update lastPlayedSong if we get valid data
    if (isPlaying && currentTrack) {
      lastPlayedSong = currentTrack;
    } else if (hasRecentTracks) {
      lastPlayedSong = recentTracksResponse.items[0].track;
    }

    // Save last played song to file
    if (lastPlayedSong && lastPlayedSong.name) {
      fs.writeFileSync(
        lastPlayedFile,
        JSON.stringify(lastPlayedSong, null, 2),
        'utf8'
      );
    }

    // Choose the correct track to return
    const songToUse =
      isPlaying && currentTrack
        ? currentTrack
        : hasRecentTracks
          ? recentTracksResponse.items[0].track
          : lastPlayedSong; // Use saved last played song

    res.json({
      status: isPlaying ? 'Stephano is playing' : 'Stephano is away',
      playing: !!isPlaying,
      track: songToUse?.name || 'No recent track available',
      artist:
        songToUse?.artists?.map((a) => a.name).join(', ') || 'Unknown artist',
      albumCover: songToUse?.album?.images[0]?.url || null,
      trackUrl: songToUse?.external_urls?.spotify || null,
    });
  } catch (error) {
    console.error(
      'Playback endpoint error:',
      error.response?.data || error.message
    );
    res.status(500).json({ error: 'Failed to fetch playback data' });
  }
});

// One-time Spotify reauth flow — run locally to get a new refresh token
app.get('/spotify-reauth', (req, res) => {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: 'http://127.0.0.1:3000/spotify-callback',
    scope: 'user-read-playback-state user-read-recently-played',
  });
  res.redirect(`https://accounts.spotify.com/authorize?${params}`);
});

app.get('/spotify-callback', async (req, res) => {
  const { code, error } = req.query;

  if (error || !code) {
    return res
      .status(400)
      .send(`Spotify authorization failed: ${error || 'no code returned'}`);
  }

  try {
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: 'http://127.0.0.1:3000/spotify-callback',
      }).toString(),
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const { refresh_token, access_token } = response.data;
    res.send(`
      <h2>New Spotify Refresh Token</h2>
      <p>Copy this and update <strong>REFRESH_TOKEN</strong> on Render:</p>
      <textarea rows="4" cols="80" onclick="this.select()">${refresh_token}</textarea>
      <p><small>Access token (expires in 1h): ${access_token}</small></p>
    `);
  } catch (err) {
    res
      .status(500)
      .send(
        `Token exchange failed: ${err.response?.data?.error_description || err.message}`
      );
  }
});

// Strava club activity endpoint
app.get('/api/strava/club/:clubId/latest', async (req, res) => {
  const { clubId } = req.params;

  try {
    const accessToken = await getStravaAccessToken();
    const response = await axios.get(
      `https://www.strava.com/api/v3/clubs/${clubId}/activities`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    const activities = response.data;
    const totalDistance =
      activities.reduce((sum, act) => sum + act.distance, 0) / 1000;
    const totalTime =
      activities.reduce((sum, act) => sum + act.moving_time, 0) / 3600;
    const totalActivities = activities.length;

    const currentWeekStart = moment().startOf('week');
    const currentWeekEnd = moment().endOf('week');
    const formattedWeek = `${currentWeekStart.format('DD')}-${currentWeekEnd.format('DD')}/${currentWeekEnd.format('MM')}/${currentWeekEnd.format('YYYY')}`;

    const latestActivities = activities
      .sort((a, b) => new Date(b.start_date) - new Date(a.start_date))
      .slice(0, 15)
      .map((activity) => ({
        athleteName: `${activity.athlete.firstname} ${activity.athlete.lastname}`,
        distance: `${(activity.distance / 1000).toFixed(2)}km`,
        movingTime: `${(activity.moving_time / 3600).toFixed(2)}h`,
        activityType: activity.type,
        startDate: activity.start_date,
        averageSpeed: `${(activity.average_speed * 3.6).toFixed(2)} km/h`,
        elevationGain: `${activity.total_elevation_gain}m`,
      }));

    res.json({
      clubName: activities[0]?.club_name || 'Unknown Club',
      currentWeek: formattedWeek,
      totalDistance: `${totalDistance.toFixed(2)} km`,
      totalTime: `${totalTime.toFixed(2)} hours`,
      totalActivities: totalActivities,
      latestActivities,
      clubFeedUrlMobile: `https://www.strava.com/clubs/${clubId}/feed`,
      clubFeedUrlDesktop: `https://www.strava.com/clubs/${clubId}/recent_activity`,
    });
  } catch (error) {
    console.error('Error fetching Strava club activities:', error.message);
    res.status(500).json({ error: 'Failed to fetch club activity data' });
  }
});

// Personal activity endpoint
app.get('/api/strava/personal/weekly', async (req, res) => {
  try {
    const accessToken = await getStravaAccessToken();

    // Calculate week range
    const currentWeekStart = moment().startOf('week');
    const currentWeekEnd = moment().endOf('week');
    const formattedWeek = `${currentWeekStart.format('DD')}-${currentWeekEnd.format('DD')}/${currentWeekEnd.format('MM')}/${currentWeekEnd.format('YYYY')}`;

    // Fetch athlete's activities for current week
    const response = await axios.get(
      'https://www.strava.com/api/v3/athlete/activities',
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: {
          after: currentWeekStart.unix(),
          before: currentWeekEnd.unix(),
          per_page: 100,
        },
      }
    );

    const activities = response.data;

    // Calculate totals
    const totalDistance =
      activities.reduce((sum, act) => sum + act.distance, 0) / 1000;
    const totalTime =
      activities.reduce((sum, act) => sum + act.moving_time, 0) / 3600;
    const totalActivities = activities.length;
    const averageSpeed =
      activities.length > 0
        ? (activities.reduce((sum, act) => sum + act.average_speed, 0) /
            activities.length) *
          3.6
        : 0;

    res.json({
      currentWeek: formattedWeek,
      totalDistance: `${totalDistance.toFixed(2)} km`,
      totalTime: `${totalTime.toFixed(2)}h`,
      totalActivities: totalActivities,
      averageSpeed: `${averageSpeed.toFixed(2)} km/h`,
    });
  } catch (error) {
    console.error('Error fetching personal Strava data:', error.message);
    res.status(500).json({ error: 'Failed to fetch personal activity data' });
  }
});

// Ensure JWT_SECRET is set before running the server
if (!process.env.JWT_SECRET) {
  console.error('Error: Missing JWT_SECRET');
  process.exit(1);
}

// Welcome route
app.get('/', (req, res) => {
  res.send('Welcome to the server!');
});

// Middleware to validate JWT token
const authenticateToken = (req, res, next) => {
  const token =
    req.headers.authorization?.split(' ')[1] ||
    req.query.token ||
    req.cookies?.token;

  if (!token) {
    return res.redirect('/?error=unauthorized');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    return res.redirect('/?error=invalid_token');
  }
};

// Password verification endpoint
app.post('/api/verify', async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid request parameters' });
    }

    const users = [
      {
        id: 1,
        password: process.env.USER_1_PASSWORD,
        expiry: process.env.USER_1_EXPIRY,
      },
      {
        id: 2,
        password: process.env.USER_2_PASSWORD,
        expiry: process.env.USER_2_EXPIRY,
      },
    ];

    const user = users.find((u) => u.password === password);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password. Please try again.',
      });
    }

    if (new Date() > new Date(user.expiry)) {
      return res
        .status(403)
        .json({ success: false, message: 'This password has expired.' });
    }

    // Generate a session token valid for 24 hours
    const token = jwt.sign(
      { userId: user.id, exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60 },
      process.env.JWT_SECRET
    );

    res.json({ success: true, token });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed. Please try again later.',
    });
  }
});

// Protected case study route
app.get('/case-study/:case', authenticateToken, (req, res) => {
  try {
    res.sendFile(path.join(__dirname, 'public', 'case-study.html'));
  } catch (error) {
    console.error('Error serving case study:', error);
    res.redirect('/?error=server_error');
  }
});

// Ensure all required environment variables are set
const requiredEnvVars = [
  'USER_1_PASSWORD',
  'USER_1_EXPIRY',
  'USER_2_PASSWORD',
  'USER_2_EXPIRY',
  'JWT_SECRET',
];
const missingEnvVars = requiredEnvVars.filter(
  (varName) => !process.env[varName] || process.env[varName].trim() === ''
);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars);
  process.exit(1);
}

const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const jobResults = {}; // Store job analysis results temporarily

app.post('/api/analyze', upload.single('jobFile'), async (req, res) => {
  try {
    const { jobDescription = '', userEmail } = req.body;
    const fileInput = req.file;

    if (!userEmail) {
      return res.status(400).json({ error: 'User email is required' });
    }

    if (!jobDescription && !fileInput) {
      return res
        .status(400)
        .json({ error: 'Either job description or job file must be provided' });
    }

    const formData = new FormData();
    formData.append('userEmail', userEmail);
    formData.append('jobDescription', jobDescription);

    if (fileInput) {
      formData.append('jobFile', fileInput.buffer, {
        filename: fileInput.originalname,
        contentType: fileInput.mimetype,
      });
    }

    const makeResponse = await axios.post(MAKE_WEBHOOK_URL, formData, {
      headers: formData.getHeaders(),
      maxBodyLength: Infinity,
    });

    jobResults[userEmail] = makeResponse.data;

    res.json({ message: 'Processing started. Check back soon.' });
  } catch (error) {
    console.error(
      'Error processing request:',
      error.response?.data || error.message
    );
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/job-analysis-result', async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: 'Email parameter is required' });
    }

    const result = jobResults[email];

    if (!result) {
      return res
        .status(404)
        .json({ error: 'Result not found. Please wait for processing.' });
    }

    res.json(result);
  } catch (error) {
    console.error('Error fetching job analysis result:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/job-analysis-result', async (req, res) => {
  try {
    const { email, analysisResult } = req.body;

    if (!email || !analysisResult) {
      return res
        .status(400)
        .json({ error: 'Email and analysisResult are required' });
    }

    // Store the result in memory (or a database)
    jobResults[email] = analysisResult;

    res.json({ message: 'Result stored successfully' });
  } catch (error) {
    console.error('Error storing job analysis result:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
