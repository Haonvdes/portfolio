const express = require('express');
const axios = require('axios');
const cors = require('cors');
const dotenv = require('dotenv');
const moment = require('moment');
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


// Strava Club Activity Endpoint
app.get('/api/strava/club/:clubId', async (req, res) => {
  const { clubId } = req.params;

  try {
    const accessToken = await getStravaAccessToken();

    // Fetch club activities filtered for 'running' type
    const response = await axios.get(`https://www.strava.com/api/v3/clubs/${clubId}/activities?type=running`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const activities = response.data;

    // Calculate total stats for the club
    const totalDistance = activities.reduce((sum, act) => sum + act.distance, 0) / 1000; // in km
    const totalTime = activities.reduce((sum, act) => sum + act.moving_time, 0) / 3600; // in hours
    const totalActivities = activities.length;

    // Calculate stats for last week
    const currentWeekStart = moment().startOf('week');
    const currentWeekEnd = moment().endOf('week');
    const lastWeekStart = currentWeekStart.subtract(1, 'week');
    const lastWeekEnd = currentWeekEnd.subtract(1, 'week');

    const activitiesLastWeek = activities.filter((activity) => {
      const activityDate = moment(activity.start_date);
      return activityDate.isBetween(lastWeekStart, lastWeekEnd, null, '[]');
    });

    // Helper function to calculate stats by athlete
    const calculateStats = (activities) =>
      activities.reduce((stats, activity) => {
        const athleteId = activity.athlete.id;
        if (!stats[athleteId]) {
          stats[athleteId] = {
            athleteName: `${activity.athlete.firstname} ${activity.athlete.lastname}`,
            totalDistance: 0,
            totalTime: 0,
            totalActivities: 0,
          };
        }
        stats[athleteId].totalDistance += activity.distance;
        stats[athleteId].totalTime += activity.moving_time;
        stats[athleteId].totalActivities += 1;
        return stats;
      }, {});

    // Calculate athlete stats for last week
    const athleteStats = calculateStats(activitiesLastWeek);

    // Static images for top 5 leaders
    const staticImages = [
      'public/assets/top1.svg',
      'public/assets/top2.svg',
      'public/assets/top3.svg',
      'public/assets/top4.svg',
      'public/assets/top5.svg',
    ];

    // Sort athletes by total distance and get the top 5
    const leaderboard = Object.values(athleteStats)
      .sort((a, b) => b.totalDistance - a.totalDistance)
      .slice(0, 5)
      .map((athlete, index) => ({
        profileImage: staticImages[index] || '/assets/default.png',
        athleteName: athlete.athleteName,
        totalDistance: `${(athlete.totalDistance / 1000).toFixed(2)}km`,
        totalTime: `${(athlete.totalTime / 3600).toFixed(2)}h`,
        totalActivities: `${athlete.totalActivities}a`,
      }));

    res.json({
      clubName: activities[0]?.club_name || 'Unknown Club',
      currentWeek: `${lastWeekStart.format('DD-MM-YYYY')} - ${lastWeekEnd.format('DD-MM-YYYY')}`,
      totalDistance: `${totalDistance.toFixed(2)} km`,
      totalTime: `${totalTime.toFixed(2)} hours`,
      totalActivities: totalActivities,
      leaderboard: leaderboard,
      leaderboardLink: `https://www.strava.com/clubs/${clubId}/leaderboard`,
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