const express = require('express');
const axios = require('axios');
const cors = require('cors');
const dotenv = require('dotenv');
const moment = require('moment');
const jwt = require('jsonwebtoken');
const path = require('path');

// Load environment variables from .env file
dotenv.config();

// 👉 Khởi tạo `app` trước khi sử dụng nó
const app = express();

// CORS configuration
const allowedOrigins = ['https://haonvdes.github.io', 'http://localhost:3000'];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
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

// Environment variables
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID;
const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;
const STRAVA_REFRESH_TOKEN = process.env.STRAVA_REFRESH_TOKEN;
const JWT_SECRET = process.env.JWT_SECRET;


// Track the last song played
let lastPlayedSong = null;

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


// Spotify playback endpoint
app.get('/api/spotify/playback', async (req, res) => {
  try {
    const accessToken = await getSpotifyAccessToken();
    const response = await axios.get('https://api.spotify.com/v1/me/player', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // Handle no active player (204 response)
    if (response.status === 204) {
      // If we have a last played song, return it with playing: false
      if (lastPlayedSong) {
        return res.json({
          status: "Stephano is away",
          playing: false,
          track: lastPlayedSong.name,
          artist: lastPlayedSong.artists.map(artist => artist.name).join(', '),
          albumCover: lastPlayedSong.album.images[0].url,
          trackUrl: lastPlayedSong.external_urls.spotify
        });
      }
      // If no last played song, try to fetch recently played tracks
      const recentlyPlayed = await axios.get('https://api.spotify.com/v1/me/player/recently-played?limit=1', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      
      if (recentlyPlayed.data?.items?.length > 0) {
        const lastTrack = recentlyPlayed.data.items[0].track;
        lastPlayedSong = lastTrack; // Store for future use
        return res.json({
          status: "Stephano is away",
          playing: false,
          track: lastTrack.name,
          artist: lastTrack.artists.map(artist => artist.name).join(', '),
          albumCover: lastTrack.album.images[0].url,
          trackUrl: lastTrack.external_urls.spotify
        });
      }
    }

    const currentTrack = response.data?.item;
    const isPlaying = response.data?.is_playing;

    if (currentTrack) {
      lastPlayedSong = currentTrack; // Update last played song when we have current track
    }

    res.json({
      status: isPlaying ? "Stephano is playing" : "Stephano is away",
      playing: isPlaying,
      track: currentTrack?.name || lastPlayedSong?.name,
      artist: currentTrack ? 
        currentTrack.artists.map(artist => artist.name).join(', ') :
        lastPlayedSong?.artists.map(artist => artist.name).join(', '),
      albumCover: currentTrack?.album.images[0].url || lastPlayedSong?.album.images[0].url,
      trackUrl: currentTrack?.external_urls.spotify || lastPlayedSong?.external_urls.spotify
    });

  } catch (error) {
    console.error('Error fetching playback data:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to fetch playback data',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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


// Welcome route
app.get('/', (req, res) => {
  res.send('Welcome to the server!');
});
// Middleware to validate JWT token
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || 
               req.query.token || 
               req.cookies?.token;
  
  if (!token) {
      return res.redirect('/?error=unauthorized');
  }

  try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
  } catch (error) {
      return res.redirect('/?error=invalid_token');
  }
};

// Password verification endpoint with improved validation
app.post('/api/verify', async (req, res) => {
  try {
      const { caseStudyId, password } = req.body;

      // Input validation
      if (!caseStudyId || !password || caseStudyId !== '1') {
          return res.status(400).json({ 
              success: false, 
              message: 'Invalid request parameters' 
          });
      }

      const correctPassword = process.env[`CASE_STUDY_${caseStudyId}_PASSWORD`];
      const expirationDate = process.env[`CASE_STUDY_${caseStudyId}_EXPIRY`];

      // Validate environment variables exist
      if (!correctPassword || !expirationDate) {
          console.error(`Missing environment variables for case study ${caseStudyId}`);
          return res.status(500).json({ 
              success: false, 
              message: 'Configuration error. Please contact administrator.' 
          });
      }

      // Check expiration
      if (new Date() > new Date(expirationDate)) {
          return res.status(403).json({ 
              success: false, 
              message: 'This password has expired. Please contact the administrator for a new password.' 
          });
      }

      // Verify password
      if (password !== correctPassword) {
          return res.status(401).json({ 
              success: false, 
              message: 'Incorrect password. Please try again.' 
          });
      }

      // Generate token
      const token = jwt.sign(
          { 
              caseStudyId,
              exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
          }, 
          JWT_SECRET
      );

      res.json({ success: true, token });

  } catch (error) {
      console.error('Verification error:', error);
      res.status(500).json({ 
          success: false, 
          message: 'An error occurred during verification.' 
      });
  }
});

// Protected case study route
app.get('/case-study/:id', authenticateToken, (req, res) => {
  try {
      // Validate case study ID
      if (req.params.id !== '1' || req.params.id !== req.user.caseStudyId) {
          return res.redirect('/?error=invalid_case_study');
      }

      res.sendFile(path.join(__dirname, 'public', 'case-study.html'));
  } catch (error) {
      console.error('Error serving case study:', error);
      res.redirect('/?error=server_error');
  }
});

// Startup validation for required environment variables
const requiredEnvVars = [
  'CASE_STUDY_1_PASSWORD',
  'CASE_STUDY_1_EXPIRY',
  'JWT_SECRET'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars);
  process.exit(1);
}




const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
