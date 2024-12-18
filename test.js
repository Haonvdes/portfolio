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
const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID;
const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;
const STRAVA_REFRESH_TOKEN = process.env.STRAVA_REFRESH_TOKEN;

// Track the last song played
let lastPlayedSong = null;

// Fetch access token using refresh token
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


// Fetch playback information
app.get('/api/spotify/playback', async (req, res) => {
  try {
    const accessToken = await getSpotifyAccessToken();
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


// Strava Personal Activity Endpoint
app.get('/api/strava/activities', async (req, res) => {
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
// Strava Club Activity Endpoint
app.get('/api/strava/club/:clubId', async (req, res) => {
    const { clubId } = req.params;
  
    try {
      const accessToken = await getStravaAccessToken();
      
      // Fetch club activities
      const response = await axios.get(`https://www.strava.com/api/v3/clubs/${clubId}/activities`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
  
      const activities = response.data;
  
      // Calculate total distance, total time, and total activities
      const totalDistance = activities.reduce((sum, act) => sum + act.distance, 0) / 1000; // in km
      const totalTime = activities.reduce((sum, act) => sum + act.moving_time, 0) / 3600; // in hours
      const totalActivities = activities.length;
  
      // Filter activities for the current week
      const currentWeekStart = moment().startOf('week').format('DD-MM/YYYY');
      const currentWeekEnd = moment().endOf('week').format('DD-MM/YYYY');
  
      const activitiesThisWeek = activities.filter((activity) => {
        const activityDate = moment(activity.start_date);
        return activityDate.isBetween(moment().startOf('week'), moment().endOf('week'), null, '[]');
      });
  
      // Create leaderboard (top 5 athletes based on distance)
      const leaderboard = activitiesThisWeek
        .sort((a, b) => b.distance - a.distance)
        .slice(0, 5)
        .map((activity) => ({
          profileImage: activity.athlete.profile,
          athleteName: `${activity.athlete.firstname} ${activity.athlete.lastname}`,
          totalTime: (activity.moving_time / 3600).toFixed(2) + ' hours', // Total time in hours
          totalDistance: (activity.distance / 1000).toFixed(2) + ' km', // Total distance in km
        }));
  
      // Return the data in the desired format
      res.json({
        clubName: activities[0]?.club_name || 'Unknown Club', // Assumes all activities belong to the same club
        currentWeek: `${currentWeekStart} - ${currentWeekEnd}`,
        totalDistance: `${totalDistance.toFixed(2)} km`,
        totalTime: `${totalTime.toFixed(2)} hours`,
        totalActivities: totalActivities,
        leaderboard: leaderboard,
      });
    } catch (error) {
      console.error('Error fetching Strava club activities:', error.message);
      res.status(500).json({ error: 'Failed to fetch club activity data' });
    }
  });
  



const PORT = process.env.PORT || 3000; // Use dynamic port or fallback to 3000
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});