async function getPlaybackState() {
  try {
    const response = await fetch('https://portfolio-7hpb.onrender.com/api/spotify/playback');
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
async function getStravaClubData(clubId) {
  try {
    const response = await fetch(`https://portfolio-7hpb.onrender.com/api/strava/club/${clubId}`);
    if (!response.ok) throw new Error('Failed to fetch club data');
    const data = await response.json();

    const clubSection = document.getElementById('club-section');
    clubSection.innerHTML = ''; // Clear previous content

    // Club summary details
    const summaryElement = document.createElement('div');
    summaryElement.classList.add('club-summary');

    summaryElement.innerHTML = `
      <p class="sub-heading">Strong Man</p>
      <p class="md-regular">Week: ${data.currentWeek}</p>
      <div class="strava-club">
        ${['Total Distance', 'Total Time', 'Total Activities']
          .map(
            (label, index) => `
            <div class="club-data">
              <p class="md-regular">${label}</p>
              <p class="md-medium">${[data.totalDistance, data.totalTime, data.totalActivities][index]}</p>
            </div>`
          )
          .join('')}
      </div>
    `;
    clubSection.appendChild(summaryElement);

    // Leaderboard rendering
    const leaderboardSection = document.createElement('div');
    leaderboardSection.classList.add('leaderboard');
    leaderboardSection.innerHTML = '<p class="md-bold">Top Runner</p>';

    // Static images for top leaders
    const staticImages = [
      '/assets/top1.png',
      '/assets/top2.png',
      '/assets/top3.png',
      '/assets/top4.png',
      '/assets/top5.png',
    ];

    data.leaderboard.forEach((leader, index) => {
      const leaderElement = document.createElement('div');
      leaderElement.classList.add('leader');

      leaderElement.innerHTML = `
        <img src="${staticImages[index] || '/assets/default.png'}" alt="Top ${index + 1}" width="32" height="32">
        <div class="leader-info">
          <p class="md-bold">${leader.athleteName}</p>
          <p class="md-regular">${leader.totalDistance} / ${leader.totalTime}</p>
        </div>
      `;
      leaderboardSection.appendChild(leaderElement);
    });

    clubSection.appendChild(leaderboardSection);
  } catch (error) {
    console.error('Error fetching club data:', error.message);
    document.getElementById('club-section').innerHTML = '<p>Failed to load club activities.</p>';
  }
}


async function getStravaPersonalActivity() {
  try {
    const response = await fetch('https://portfolio-7hpb.onrender.com/api/strava/activities');
    if (!response.ok) throw new Error('Failed to fetch personal activity data');
    const data = await response.json();

    const personalActivity = document.getElementById('personal-activity');
    personalActivity.innerHTML = `
      <h2>${data.title}</h2>
      <p><strong>Number of Activities:</strong> ${data.numberOfActivities}</p>
      <p><strong>Total Distance of Week:</strong> ${data.totalDistance}</p>
      <p><strong>Total Time:</strong> ${data.totalTime}</p>
    `;
  } catch (error) {
    console.error('Error fetching personal activity:', error);
  }
}





  // Fetch all data every 3 minutes (for Spotify and personal activity)
  setInterval(() => {
    getPlaybackState(); // Spotify playback
    getStravaPersonalActivity(); // Strava personal activity
  }, 180000); // 3 minutes in milliseconds
  
  // Fetch Strava club data every 6 hours (21600000 ms)
  setInterval(() => {
    getStravaClubData('1153970'); // Strava club data
  }, 21600000); // 6 hours in milliseconds
  
  // Initial fetch when the page loads
  getPlaybackState();
  getStravaPersonalActivity();
  getStravaClubData('1153970');