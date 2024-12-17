const express = require('express');
const axios = require('axios');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const app = express();

// CORS configuration - allow requests from specific frontend URLs
const allowedOrigins = ['https://haonvdes.github.io', 'http://localhost:3000']; // Add your frontend URLs here
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

// Read credentials from environment variables
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

// Track the last song played
let lastPlayedSong = null;

// Fetch access token using refresh token
async function getAccessToken() {
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

// Fetch playback information
app.get('/api/spotify/playback', async (req, res) => {
  try {
    const accessToken = await getAccessToken();
    const response = await axios.get('https://api.spotify.com/v1/me/player', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const currentTime = new Date();
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();

    // Define the time ranges for work and gym hours
    const isWorkTime = (
      (currentHour >= 8 && currentHour < 11) || 
      (currentHour === 11 && currentMinute <= 30) || 
      (currentHour >= 13 && currentHour < 17)
    );
    
    const isGymTime = (currentHour >= 17 && currentHour < 19);

    // Default status message
    let statusMessage = "Stephano is away";

    if (response.data && response.data.is_playing) {
      lastPlayedSong = response.data.item;  // Track the last song played
      statusMessage = "Stephano is listening";
    } else if (!response.data.is_playing && lastPlayedSong) {
      statusMessage = `Last song played: ${lastPlayedSong.name} by ${lastPlayedSong.artists.map(artist => artist.name).join(', ')}`;
    }

    if (isGymTime) {
      statusMessage = "Stephano is lifting weights at the gym";
    }

    // Return status, last played song, and album cover
    res.json({
      status: statusMessage,
      playing: response.data.is_playing,
      track: response.data.item ? response.data.item.name : lastPlayedSong ? lastPlayedSong.name : null,
      artist: response.data.item ? response.data.item.artists.map(artist => artist.name).join(', ') : lastPlayedSong ? lastPlayedSong.artists.map(artist => artist.name).join(', ') : null,
      albumCover: response.data.item ? response.data.item.album.images[0].url : lastPlayedSong ? lastPlayedSong.album.images[0].url : null,
    });
  } catch (error) {
    console.error('Error fetching playback data:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to fetch playback data' });
  }
});

const PORT = process.env.PORT || 3000; // Use dynamic port or fallback to 3000
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
