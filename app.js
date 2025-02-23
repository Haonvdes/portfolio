const express = require('express');
const axios = require('axios');
const cors = require('cors');
const dotenv = require('dotenv');
const moment = require('moment');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const bodyParser = require("body-parser");
const { Configuration, OpenAIApi } = require("openai");
const nodemailer = require("nodemailer");

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

// Environment variables
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID;
const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;
const STRAVA_REFRESH_TOKEN = process.env.STRAVA_REFRESH_TOKEN;
const JWT_SECRET = process.env.JWT_SECRET;


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



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});






app.use(cors());
app.use(bodyParser.json());

// Load API keys from Render.io environment variables
const openai = new OpenAIApi(new Configuration({ apiKey: process.env.OPENAI_API_KEY }));

// Email credentials from Render.io environment
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,  // Your email address
        pass: process.env.EMAIL_PASS   // App password or SMTP credentials
    }
});

// Your profile for AI comparison
const myProfile = `
- Experience: 5 years as a Product Designer, transitioning to Project Manager
- Certifications: PMP, PMI-ACP, PSM
- Skills: Project Management, UI/UX, Business Administration, Agile, Waterfall
- Education: Business Administration (in progress), Graphic Design
`;

app.post("/analyze-jd", async (req, res) => {
  const { jobTitle, jobDescription, companyName } = req.body;

  if (!jobTitle || !jobDescription) {
      return res.status(400).json({ error: "Job Title and Description are required." });
  }

  const prompt = `
  You are an AI assistant helping HR compare job descriptions with a candidate's profile. 

  **Candidate Profile:**
  ${myProfile}

  **Job Title:** ${jobTitle}
  **Company Name:** ${companyName || "Not Provided"}
  **Job Description:** ${jobDescription}

  Please analyze and return:
  1. Match Score (%)
  2. Key strengths that align with the JD
  3. Skill gaps (if any)
  4. Suggested improvements for the candidate's profile.

  Format response as JSON: 
  { "matchScore": "...", "strengths": "...", "gaps": "...", "suggestions": "..." }
  `;

  try {
      const response = await openai.createChatCompletion({
          model: "gpt-4",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
      });

      if (!response.data.choices || response.data.choices.length === 0) {
          throw new Error("Empty response from OpenAI API.");
      }

      const jsonResponse = JSON.parse(response.data.choices[0].message.content);
      
      // Send response to frontend immediately
      res.json(jsonResponse);

      // Background Email Notification
      const mailOptions = {
          from: process.env.EMAIL_USER,
          to: "haonv307@gmail.com",  // Replace with your actual email
          subject: `New Job Analysis - ${jobTitle}`,
          text: `
          📢 New Job Analysis Request 📢
          
          🔹 **Company:** ${companyName || "Not Provided"}
          🔹 **Job Title:** ${jobTitle}
          🔹 **Job Description:** 
          ${jobDescription}
          
          🔍 **AI Analysis Result**
          ✅ **Match Score:** ${jsonResponse.matchScore}%
          🏆 **Key Strengths:** ${jsonResponse.strengths}
          ❌ **Skill Gaps:** ${jsonResponse.gaps}
          📌 **Suggestions:** ${jsonResponse.suggestions}
          `
      };

      transporter.sendMail(mailOptions).catch(emailError => {
          console.error("Failed to send email:", emailError);
      });

  } catch (error) {
      console.error("Error processing request:", error);
      res.status(500).json({ error: "Error processing job analysis. Please try again later." });
  }
});
