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

async function getStravaClubData(clubId) {
  try {
    const response = await fetch(`https://portfolio-7hpb.onrender.com/api/strava/club/${clubId}`);
    if (!response.ok) throw new Error('Failed to fetch club data');
    const data = await response.json();

    console.log('Leaderboard data:', data.leaderboard); // Check if backend handles top 5 leaders

    const clubSection = document.getElementById('club-section');
    clubSection.innerHTML = ''; // Clear previous content

    // Club Summary
    const summaryElement = document.createElement('div');
    summaryElement.classList.add('club-summary');

    // Format week range
    const [startDate, endDate] = data.currentWeek.split(' - ');
    const formattedWeek = `${startDate.split('-')[2]}-${endDate.split('-')[2]}/${startDate.split('-')[1]}/${startDate.split('-')[0]}`;

    // Create the image element
    const imageElement = document.createElement('img');
    imageElement.src = 'public/strava-logo.png';
    imageElement.alt = 'Strava Logo';
    imageElement.style.width = '100px';
    imageElement.style.marginBottom = '40px';

    // Add the content for the summary
    summaryElement.innerHTML = `
      <p class="sub-heading">Incredible Team</p>
      <p class="md-regular">Week: (${formattedWeek})</p>
      <div class="strava-club">
        ${['Total Distance', 'Total Time', 'Total Activities']
          .map(
            (label, index) => `
            <div class="club-data">
              <p class="md-regular">${label}</p>
              <p class="md-medium">${[data.totalDistance, `${parseFloat(data.totalTime).toFixed(2)}h`, data.totalActivities][index]}</p>
            </div>`
          )
          .join('')}
      </div>
    `;

    // Prepend the image element to the summary
    summaryElement.prepend(imageElement);

    // Append the summary to the club section
    clubSection.appendChild(summaryElement);

    // Leaderboard
    const leaderboardSection = document.createElement('div');
    leaderboardSection.classList.add('leaderboard');

    // Create a link to the Strava leaderboard
    const leaderboardLink = document.createElement('a');
    leaderboardLink.href = data.leaderboardLink; // Use the URL provided by the backend
    leaderboardLink.target = '_blank'; // Open in a new tab
    leaderboardLink.innerHTML = '<p class="md-bold">Top Runners</p>';
    
    // Append the link to the leaderboard section
    leaderboardSection.appendChild(leaderboardLink);

    // Static images for the top 5
    const staticImages = [
      'public/assets/top1.svg',
      'public/assets/top2.svg',
      'public/assets/top3.svg',
      'public/assets/top4.svg',
      'public/assets/top5.svg',
    ];

    // Display all leaders from the backend response
    data.leaderboard.slice(0, 5).forEach((leader, index) => {
      const leaderElement = document.createElement('div');
      leaderElement.classList.add('leader');

      leaderElement.innerHTML = `
        <div class="leader-details">
          <img src="${staticImages[index] || '/assets/default.png'}" alt="Top ${index + 1}" width="40" height="40">
          <div class="leader-info">
            <p class="md-bold">${leader.athleteName}</p>
            <p class="md-regular">${leader.totalDistance} / ${leader.totalTime} / ${leader.totalActivities}</p>
          </div>
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














  // Fetch all data every 3 minutes (for Spotify and personal activity)
  setInterval(() => {
    getPlaybackState(); // Spotify playback
  }, 180000); // 3 minutes in milliseconds
  
  // Fetch Strava club data every 6 hours (21600000 ms)
  setInterval(() => {
    getStravaClubData('1153970');
    getStravaPersonalActivity(); // Strava personal activity
    // Strava club data
  }, 21600000); // 6 hours in milliseconds
  
  // Initial fetch when the page loads
  getPlaybackState();
  getStravaPersonalActivity();
  getStravaClubData('1153970');