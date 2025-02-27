const express = require('express');
const axios = require('axios');
const cors = require('cors');
const dotenv = require('dotenv');
const moment = require('moment');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const bodyParser = require("body-parser");
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const sanitizeHtml = require('sanitize-html');

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
  'http://www.stpnguyen.com' 
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
  credentials: true
};


// 👉 Sử dụng `cors` sau khi khai báo `app`
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static('public'));
app.use(express.json());

// Environment variables
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID;
const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;
const STRAVA_REFRESH_TOKEN = process.env.STRAVA_REFRESH_TOKEN;
const JWT_SECRET = process.env.JWT_SECRET;
const MAKE_WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL;



// Spotify token refresh function
async function getSpotifyAccessToken() {
  try {
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: REFRESH_TOKEN,
      }).toString(),
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    return response.data.access_token;
  } catch (error) {
    console.error('Error refreshing token:', error.response ? error.response.data : error.message);
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
      axios.get('https://api.spotify.com/v1/me/player/recently-played?limit=1', {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
    ]);

    const playbackResponse = responses[0].status === 'fulfilled' ? responses[0].value.data : null;
    const recentTracksResponse = responses[1].status === 'fulfilled' ? responses[1].value.data : null;

    console.log("Playback Response:", JSON.stringify(playbackResponse, null, 2));
    console.log("Recent Tracks API Response:", JSON.stringify(recentTracksResponse, null, 2));

    let isPlaying = playbackResponse?.is_playing;
    let currentTrack = playbackResponse?.item;

    const hasRecentTracks = recentTracksResponse?.items && recentTracksResponse.items.length > 0;

    // Only update lastPlayedSong if we get valid data
    if (isPlaying && currentTrack) {
      lastPlayedSong = currentTrack;
    } else if (hasRecentTracks) {
      lastPlayedSong = recentTracksResponse.items[0].track;
    }

    // Save last played song to file
    if (lastPlayedSong && lastPlayedSong.name) {
      fs.writeFileSync(lastPlayedFile, JSON.stringify(lastPlayedSong, null, 2), 'utf8');
    }

    // Choose the correct track to return
    const songToUse = isPlaying && currentTrack
    ? currentTrack
    : hasRecentTracks
    ? recentTracksResponse.items[0].track
    : lastPlayedSong; // Use saved last played song
  
    res.json({
      status: isPlaying ? "Stephano is playing" : "Stephano is away",
      playing: !!isPlaying,
      track: songToUse?.name || "No recent track available",
      artist: songToUse?.artists?.map(a => a.name).join(', ') || "Unknown artist",
      albumCover: songToUse?.album?.images[0]?.url || null,
      trackUrl: songToUse?.external_urls?.spotify || null
    });
  } catch (error) {
    console.error('Playback endpoint error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch playback data' });
  }
});

// Strava club activity endpoint
app.get('/api/strava/club/:clubId/latest', async (req, res) => {
  const { clubId } = req.params;

  try {
    const accessToken = await getStravaAccessToken();
    const response = await axios.get(`https://www.strava.com/api/v3/clubs/${clubId}/activities`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const activities = response.data;
    const totalDistance = activities.reduce((sum, act) => sum + act.distance, 0) / 1000;
    const totalTime = activities.reduce((sum, act) => sum + act.moving_time, 0) / 3600;
    const totalActivities = activities.length;

    const currentWeekStart = moment().startOf('week');
    const currentWeekEnd = moment().endOf('week');
    const formattedWeek = `${currentWeekStart.format('DD')}-${currentWeekEnd.format('DD')}/${currentWeekEnd.format('MM')}/${currentWeekEnd.format('YYYY')}`;

    const latestActivities = activities
      .sort((a, b) => new Date(b.start_date) - new Date(a.start_date))
      .slice(0, 15)
      .map(activity => ({
        athleteName: `${activity.athlete.firstname} ${activity.athlete.lastname}`,
        distance: `${(activity.distance / 1000).toFixed(2)}km`,
        movingTime: `${(activity.moving_time / 3600).toFixed(2)}h`,
        activityType: activity.type,
        startDate: activity.start_date,
        averageSpeed: `${((activity.average_speed * 3.6).toFixed(2))} km/h`,
        elevationGain: `${activity.total_elevation_gain}m`
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
    const response = await axios.get('https://www.strava.com/api/v3/athlete/activities', {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: {
        after: currentWeekStart.unix(),
        before: currentWeekEnd.unix(),
        per_page: 100
      }
    });

    const activities = response.data;
    
    // Calculate totals
    const totalDistance = activities.reduce((sum, act) => sum + act.distance, 0) / 1000;
    const totalTime = activities.reduce((sum, act) => sum + act.moving_time, 0) / 3600;
    const totalActivities = activities.length;
    const averageSpeed = activities.length > 0 
      ? activities.reduce((sum, act) => sum + act.average_speed, 0) / activities.length * 3.6
      : 0;

    res.json({
      currentWeek: formattedWeek,
      totalDistance: `${totalDistance.toFixed(2)} km`,
      totalTime: `${totalTime.toFixed(2)}h`,
      totalActivities: totalActivities,
      averageSpeed: `${averageSpeed.toFixed(2)} km/h`
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
  const token = req.headers.authorization?.split(' ')[1] || req.query.token || req.cookies?.token;

  if (!token) {
      return res.redirect('/?error=unauthorized');
  }

  try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
  } catch (error) {
      console.error("Token verification failed:", error);
      return res.redirect('/?error=invalid_token');
  }
};

// Password verification endpoint
app.post('/api/verify', async (req, res) => {
  try {
      const { password } = req.body;

      if (!password) {
          return res.status(400).json({ success: false, message: 'Invalid request parameters' });
      }

      const users = [
          { id: 1, password: process.env.USER_1_PASSWORD, expiry: process.env.USER_1_EXPIRY },
          { id: 2, password: process.env.USER_2_PASSWORD, expiry: process.env.USER_2_EXPIRY }
      ];

      const user = users.find(u => u.password === password);
      if (!user) {
          return res.status(401).json({ success: false, message: 'Incorrect password. Please try again.' });
      }

      if (new Date() > new Date(user.expiry)) {
          return res.status(403).json({ success: false, message: 'This password has expired.' });
      }

      // Generate a session token valid for 24 hours
      const token = jwt.sign({ userId: user.id, exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) }, process.env.JWT_SECRET);

      res.json({ success: true, token });
  } catch (error) {
      console.error('Verification error:', error);
      res.status(500).json({ success: false, message: 'Authentication failed. Please try again later.' });
  }
});

// Protected case study route
app.get('/case-study/:id', authenticateToken, (req, res) => {
  try {
      res.sendFile(path.join(__dirname, 'public', 'case-study.html'));
  } catch (error) {
      console.error('Error serving case study:', error);
      res.redirect('/?error=server_error');
  }
});

// Ensure all required environment variables are set
const requiredEnvVars = ['USER_1_PASSWORD', 'USER_1_EXPIRY', 'USER_2_PASSWORD', 'USER_2_EXPIRY', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName] || process.env[varName].trim() === '');

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars);
  process.exit(1);
}



const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const jobResults = {};  // Store job analysis results temporarily

app.post("/api/analyze", upload.single("jobFile"), async (req, res) => {
  try {
    const { jobDescription, userEmail } = req.body;
    const fileInput = req.file ? req.file.buffer.toString("base64") : null;

    const makeResponse = await axios.post(MAKE_WEBHOOK_URL, {
      jobDescription, userEmail, fileInput
    });

    // Store the result under user's email
    jobResults[userEmail] = makeResponse.data;  

    res.json({ message: "Processing started. Check back soon." });
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


app.get("/api/job-analysis-result", async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: "Email parameter is required" });
    }

    const result = jobResults[email];

    if (!result) {
      return res.status(404).json({ error: "Result not found. Please wait for processing." });
    }

    res.json(result);
  } catch (error) {
    console.error("Error fetching job analysis result:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


app.post("/api/job-analysis-result", async (req, res) => {
  try {
    const { email, analysisResult } = req.body;

    if (!email || !analysisResult) {
      return res.status(400).json({ error: "Email and analysisResult are required" });
    }

    // Store the result in memory (or a database)
    jobResults[email] = analysisResult;

    res.json({ message: "Result stored successfully" });
  } catch (error) {
    console.error("Error storing job analysis result:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});





const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});



