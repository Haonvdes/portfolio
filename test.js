const express = require('express');
const axios = require('axios');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

const allowedOrigins = ['https://haonvdes.github.io', 'http://localhost:3000'];
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
};

app.use(cors(corsOptions));
app.use(express.json());

// Spotify and Strava Credentials
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID;
const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;
const STRAVA_REFRESH_TOKEN = process.env.STRAVA_REFRESH_TOKEN;

// Spotify Access Token
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
    console.error('Error refreshing Spotify token:', error.message);
    throw new Error('Failed to refresh Spotify token');
  }
}

// Strava Access Token
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

app.get('/', (req, res) => {
  res.send('Welcome to the server!');
});

// Spotify Playback Endpoint
app.get('/api/spotify/playback', async (req, res) => {
  try {
    const accessToken = await getSpotifyAccessToken();
    const response = await axios.get('https://api.spotify.com/v1/me/player', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const statusMessage = response.data.is_playing
      ? "Stephano is listening"
      : "Stephano is away";

    res.json({
      status: statusMessage,
      playing: response.data.is_playing,
      track: response.data.item?.name || null,
      artist: response.data.item?.artists.map(artist => artist.name).join(', ') || null,
      albumCover: response.data.item?.album.images[0].url || null,
    });
  } catch (error) {
    console.error('Error fetching Spotify playback:', error.message);
    res.status(500).json({ error: 'Failed to fetch Spotify playback data' });
  }
});

// Strava Personal Activity Endpoint
app.get('/api/strava/personal', async (req, res) => {
  try {
    const accessToken = await getStravaAccessToken();
    const response = await axios.get('https://www.strava.com/api/v3/athlete/activities', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const activities = response.data;
    const totalDistance = activities.reduce((sum, act) => sum + act.distance, 0) / 1000; // in km
    const totalTime = activities.reduce((sum, act) => sum + act.moving_time, 0) / 3600; // in hours

    res.json({
      title: "Stephano's Activity",
      numberOfActivities: activities.length,
      totalDistance: `${totalDistance.toFixed(2)} km`,
      totalTime: `${totalTime.toFixed(2)} hours`,
    });
  } catch (error) {
    console.error('Error fetching personal activity:', error.message);
    res.status(500).json({ error: 'Failed to fetch personal activity data' });
  }
});

// Strava Club Activity Endpoint
app.get('/api/strava/club/:clubId', async (req, res) => {
  const { clubId } = req.params;

  try {
    const accessToken = await getStravaAccessToken();
    const response = await axios.get(`https://www.strava.com/api/v3/clubs/${clubId}/activities`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const activities = response.data.map(activity => ({
      clubName: activity.club_name,
      distance: (activity.distance / 1000).toFixed(2) + ' km',
      time: (activity.moving_time / 60).toFixed(0) + ' mins',
      elevation: activity.total_elevation_gain + ' m',
      userProfile: activity.athlete.profile,
      userName: activity.athlete.firstname + ' ' + activity.athlete.lastname,
      rank: activity.rank || 'N/A', // Replace with actual rank if available
    }));

    res.json(activities);
  } catch (error) {
    console.error('Error fetching Strava club activities:', error.message);
    res.status(500).json({ error: 'Failed to fetch club activity data' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
