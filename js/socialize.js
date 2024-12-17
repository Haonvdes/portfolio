async function getPlaybackState() {
  try {
    const response = await fetch('http://localhost:3000/api/spotify/playback'); // Ensure this endpoint works
    if (!response.ok) throw new Error('Failed to fetch playback state');
    const data = await response.json();

    const playbackInfo = document.getElementById('playback-info');
    playbackInfo.innerHTML = ''; // Clear previous content

    // Spotify Header Image
    const imageElement = document.createElement('img');
    imageElement.src = 'public/spotify-logo.png'
    imageElement.alt = 'Spotify Header Image';
    imageElement.style.width = '40px';
    imageElement.style.marginBottom = '32px';
    playbackInfo.appendChild(imageElement);

    // Get current time and gym schedule
    const currentTime = new Date();
    const gymStartTime = new Date();
    gymStartTime.setHours(17, 0, 0); // 5:00 PM
    const gymEndTime = new Date();
    gymEndTime.setHours(19, 0, 0); // 7:00 PM

    // Status Message
    const statusMessageElement = document.createElement('p');
    statusMessageElement.classList.add('sub-heading-bold');

    if (currentTime >= gymStartTime && currentTime <= gymEndTime) {
      statusMessageElement.innerText = 'Stephano is lifting weights at the gym';
    } else if (data.playing) {
      statusMessageElement.innerText = 'Stephano is playing';
    } else {
      statusMessageElement.innerText = 'Stephano is away';
    }
    playbackInfo.appendChild(statusMessageElement);

    // Track Information
    const trackInfoElement = document.createElement('div');
    trackInfoElement.classList.add('track-info');

    const albumCoverElement = document.createElement('img');
    albumCoverElement.src = data.albumCover || '';
    albumCoverElement.alt = 'Album Cover';
    albumCoverElement.width = 50;
    albumCoverElement.height = 50;

    if (data.playing) {
      // Add rotate class if playing
      albumCoverElement.classList.add('rotate');
    }

    if (data.playing && data.track && data.artist) {
      trackInfoElement.appendChild(albumCoverElement);
      trackInfoElement.innerHTML += `
        <div class="song">
          <p class="md-regular">${data.artist}</p>
          <p class="md-bold">
            <a href="${data.trackUrl}" target="_blank" style="text-decoration: none; color: #374151; line-height:16px;">
              ${data.track}</a></p>
        </div>
      `;
    } else if (data.track && data.artist) {
      trackInfoElement.appendChild(albumCoverElement);
      trackInfoElement.innerHTML += `
        <div class="song">
          <p class="md-regular">Last song played:</p>
          <p class="md-bold">
            <a href="${data.trackUrl}" target="_blank" style="text-decoration: none; color: #374151;">
              ${data.track} by ${data.artist}
            </a>
          </p>
        </div>
      `;
    } else {
      trackInfoElement.innerHTML = '<p class="md-regular">He seems to focus on his stuff.</p>';
    }

    playbackInfo.appendChild(trackInfoElement);
  } catch (error) {
    console.error('Error fetching playback state:', error);
    document.getElementById('playback-info').innerHTML =
      '<p class="md-regular">Oops! Something went wrong, trying to load again shortly.</p>';
  }
}
async function getStravaActivityTotals() {
  try {
    const response = await fetch('http://localhost:3000/api/strava/weekly-activity');
    if (!response.ok) throw new Error('Failed to fetch Strava activity totals');
    const data = await response.json();

    const activityInfo = document.getElementById('activity-info');
    activityInfo.innerHTML = ''; // Clear previous content

    // Create and display the Strava image
    const stravaImageElement = document.createElement('img');
    stravaImageElement.src = './source/strava-logo.png';
    stravaImageElement.alt = 'Strava Header Image';
    stravaImageElement.style.width = '120px';
    stravaImageElement.style.marginBottom = '16px';
    activityInfo.appendChild(stravaImageElement);

    // Add clickable status message
    const statusMessageElement = document.createElement('a');
    statusMessageElement.classList.add('sub-heading-bold');
    statusMessageElement.href = 'https://www.strava.com/athletes/your-profile-id'; // Replace with your Strava profile URL
    statusMessageElement.target = '_blank';
    statusMessageElement.rel = 'noopener noreferrer';
    statusMessageElement.innerText = "Stephano's Activity";
    statusMessageElement.style.textDecoration = 'none';
    statusMessageElement.style.marginBottom = '16px';
    activityInfo.appendChild(statusMessageElement);

    if (data.activities.length === 0) {
      const noActivitiesMessage = document.createElement('p');
      noActivitiesMessage.classList.add('md-regular');
      noActivitiesMessage.innerText = 'No activities recorded this week.';
      activityInfo.appendChild(noActivitiesMessage);
      return;
    }

    // Get the current week's date range
    const now = new Date();
    const firstDayOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 1)); // Start of the week (Monday)
    const lastDayOfWeek = new Date(firstDayOfWeek);
    lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6); // End of the week (Sunday)
    const weekRange = `${firstDayOfWeek.toLocaleDateString('en-GB')} - ${lastDayOfWeek.toLocaleDateString('en-GB')}`;

    // Aggregate weekly stats
    const totalActivities = data.activities.length;
    const totalDistance = data.activities.reduce((sum, activity) => sum + activity.distance, 0) / 1000; // Convert meters to km
    const totalTime = data.activities.reduce((sum, activity) => sum + activity.movingTime, 0) / 3600; // Convert seconds to hours
    const recentActivity = data.activities[0]; // Get the most recent activity

    // Display weekly snapshot with date range
    const snapshotElement = document.createElement('div');
    snapshotElement.classList.add('weekly-snapshot');
    snapshotElement.innerHTML = `
      <p class="md-regular">Week: ${weekRange}</p> 
      <div class="activity">
        <p>
          <span class="md-bold">Most Recent Activity:</span> 
          <span class="md-regular">${recentActivity ? `${recentActivity.name} (${recentActivity.type})` : 'None'}</span>
        </p>
        <p>
          <span class="md-bold">Activities:</span> 
          <span class="md-regular">${totalActivities}</span>
        </p>
        <p>
          <span class="md-bold">Distance:</span> 
          <span class="md-regular">${totalDistance.toFixed(2)} km</span>
        </p>
        <p>
          <span class="md-bold">Time:</span> 
          <span class="md-regular">${totalTime.toFixed(1)} hours</span>
        </p>
      </div>
    `;
    activityInfo.appendChild(snapshotElement);
  } catch (error) {
    console.error('Error fetching Strava activity totals:', error);
    document.getElementById('activity-info').innerHTML =
      '<p class="md-regular">Oops! Something went wrong, trying to load again shortly.</p>';
  }
}





// Fetch Spotify playback state every 3 minutes
setInterval(() => {
  getPlaybackState();
}, 3000); // 3 minutes in milliseconds

// Fetch Strava activity totals every 240 minutes
setInterval(() => {
  getStravaActivityTotals();
}, 14400000); // 240 minutes in milliseconds
