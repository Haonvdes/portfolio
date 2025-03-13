// Function to fetch and display playback state
async function getPlaybackState() {
  const playbackInfo = document.getElementById('playback-info');
  
  // Show skeleton loader
  playbackInfo.innerHTML = `
    <div class="skeleton skeleton-text"></div>
    <div class="skeleton skeleton-text" style="width: 80%;"></div>
    <div class="skeleton skeleton-avatar"></div>
  `;

  try {
    const playbackResponse = await fetch('https://api.stpnguyen.com/api/spotify/playback');
    if (!playbackResponse.ok) throw new Error('Failed to fetch playback state');

    const playbackData = await playbackResponse.json();
    playbackInfo.innerHTML = ''; // Clear skeleton loader

    // Create Spotify Header
    const imageElement = document.createElement('img');
    imageElement.src = '../public/spotify-logo.png';
    imageElement.alt = 'Spotify Header Image';
    imageElement.style.width = '40px';
    imageElement.style.marginBottom = '32px';
    playbackInfo.appendChild(imageElement);

    // Status Message
    const statusMessageElement = document.createElement('p');
    statusMessageElement.classList.add('sub-heading');
    statusMessageElement.style.paddingBottom = '16px';
    statusMessageElement.innerText = playbackData.playing ? 'Stephano is playing' : 'Stephano is away';
    playbackInfo.appendChild(statusMessageElement);

    // Track Information
    if (playbackData.track) {
      const trackInfoElement = document.createElement('div');
      trackInfoElement.classList.add('track-info');

      const albumCoverElement = document.createElement('img');
      albumCoverElement.src = playbackData.albumCover;
      albumCoverElement.alt = 'Album Cover';
      albumCoverElement.width = 50;
      albumCoverElement.height = 50;

      if (playbackData.playing) {
        albumCoverElement.classList.add('rotate');
      }

      trackInfoElement.appendChild(albumCoverElement);
      trackInfoElement.innerHTML += `
        <div class="song">
          <p class="md-regular">${playbackData.playing ? playbackData.artist : 'Last song played'}</p>
          <p class="md-bold">
            <a href="${playbackData.trackUrl}" target="_blank" style="text-decoration: none; color: #374151; line-height:16px;">
              ${playbackData.playing ? playbackData.track : `${playbackData.track} by ${playbackData.artist}`}
            </a>
          </p>
        </div>
      `;

      playbackInfo.appendChild(trackInfoElement);
    }
  } catch (error) {
    console.error('Error fetching playback state:', error);
    playbackInfo.innerHTML = '<p class="md-regular">Oops! Something went wrong, trying to load again shortly.</p>';
  }
}







async function getLatestStravaActivities(clubId) {
  const clubSection = document.getElementById('club-section');
  
  // Show skeleton loader
  clubSection.innerHTML = `
    <div class="skeleton skeleton-box"></div>
    <div class="skeleton skeleton-box"></div>
  `;

  try {
    const response = await fetch(`https://api.stpnguyen.com/api/strava/club/${clubId}/latest`);
    if (!response.ok) throw new Error('Failed to fetch club data');
    const data = await response.json();
    clubSection.innerHTML = ''; // Clear skeleton loader

    // Club Summary Section
    const summaryElement = document.createElement('div');
    summaryElement.classList.add('club-summary');

    const formattedWeek = data.currentWeek;

    const imageElement = document.createElement('img');
    imageElement.src = 'public/strava-logo.png';
    imageElement.alt = 'Strava Logo';
    imageElement.style.width = '100px';
    imageElement.style.marginBottom = '40px';

    summaryElement.innerHTML = `
      <p class="sub-heading">Incredible Team</p>
      <p class="md-regular">Week: ${formattedWeek}</p>
      <div class="strava-club">
        ${['Total Distance', 'Total Time', 'Total Activities']
          .map((label, index) => `
            <div class="club-data">
              <p class="md-regular">${label}</p>
              <p class="md-bold">${[data.totalDistance, `${parseFloat(data.totalTime).toFixed(2)}h`, data.totalActivities][index]}</p>
            </div>`
          ).join('')}
      </div>
    `;

    summaryElement.prepend(imageElement);
    clubSection.appendChild(summaryElement);
  } catch (error) {
    console.error('Error fetching club data:', error.message);
    clubSection.innerHTML = '<p class="md-medium">Oops! Something went wrong; trying to load again shortly.</p>';
  }
}


async function getPersonalStravaActivity() {
  const personalSection = document.getElementById('personal-section');
  
  // Show skeleton loader
  personalSection.innerHTML = `
    <div class="skeleton skeleton-box"></div>
    <div class="skeleton skeleton-box"></div>
  `;

  try {
    const response = await fetch('https://api.stpnguyen.com/api/strava/personal/weekly');
    if (!response.ok) throw new Error('Oops! Something went wrong; trying to load again shortly.');
    const data = await response.json();
    personalSection.innerHTML = ''; // Clear skeleton loader

    const summaryElement = document.createElement('div');
    summaryElement.classList.add('personal-summary');
    summaryElement.style.width = '100%';

    const imageElement = document.createElement('img');
    imageElement.src = '../public/strava-logo.png';
    imageElement.alt = 'Strava Logo';
    imageElement.style.width = '100px';
    imageElement.style.marginBottom = '40px';

    summaryElement.innerHTML = `
      <p class="sub-heading activity-heading">Stephano's Activities</p>
      <p class="md-regular">Week of ${data.currentWeek}</p>
      <div class="strava-club">
        <div class="club-data">
          <p class="md-regular">Total Distance</p>
          <p class="md-bold">${data.totalDistance}</p>
        </div>
        <div class="club-data">
          <p class="md-regular">Time Spent</p>
          <p class="md-bold">${data.totalTime}</p>
        </div>
        <div class="club-data">
          <p class="md-regular">Average Speed</p>
          <p class="md-bold">${data.averageSpeed}</p>
        </div>
      </div>
    `;

    summaryElement.prepend(imageElement);
    personalSection.appendChild(summaryElement);
  } catch (error) {
    console.error('Error fetching personal data:', error.message);
    personalSection.innerHTML = '<p class="md-regular">Oops! Something went wrong; trying to load again shortly.</p>';
  }
}



// Initialize based on current page
function initializePage() {
  // Get the current page name from the URL
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  // Initialize features based on the current page
  switch (currentPage) {
    case 'index.html':
      // Initialize Club Strava functionality
      getLatestStravaActivities('1153970');
      setInterval(() => getLatestStravaActivities('1153970'), 7200000); // Refresh every 2 hours
      break;
      
    case 'about.html':
      // Initialize Personal Strava functionality
      getPersonalStravaActivity();
      setInterval(getPersonalStravaActivity, 7200000); // Refresh every 2 hours

      // Initialize Spotify functionality
      getPlaybackState();
      setInterval(getPlaybackState, 90000); // Refresh every 1.5 minutes
      break;
  }
}

// Function to handle errors gracefully
function handleError(error, section) {
  console.error(`Error in ${section}:`, error.message);
  const element = document.getElementById(section);
  if (element) {
    element.innerHTML = `<p class="error-message">Failed to load ${section} data.</p>`;
  }
}

// Wrap Strava club activities with error handling
async function safeGetLatestStravaActivities(clubId) {
  try {
    await getLatestStravaActivities(clubId);
  } catch (error) {
    handleError(error, 'club-section');
  }
}

// Wrap personal Strava activities with error handling
async function safeGetPersonalStravaActivity() {
  try {
    await getPersonalStravaActivity();
  } catch (error) {
    handleError(error, 'personal-section');
  }
}

// Wrap Spotify playback with error handling
async function safeGetPlaybackState() {
  try {
    await getPlaybackState();
  } catch (error) {
    handleError(error, 'playback-info');
  }
}

// // Updated initialization with error handling
// function initializePageSafely() {
//   const currentPage = window.location.pathname.split('/').pop() || 'index.html';

//   switch (currentPage) {
//     case 'index.html':
//       // Initialize only club Strava functionality with error handling
//       safeGetLatestStravaActivities('1153970');
//       setInterval(() => safeGetLatestStravaActivities('1153970'), 7200000);
//       break;
      
//     case 'about.html':
//       // Initialize Personal Strava functionality with error handling
//       safeGetPersonalStravaActivity();
//       setInterval(() => safeGetPersonalStravaActivity(), 7200000);
      
//       // Initialize Spotify functionality with error handling
//       safeGetPlaybackState();
//       setInterval(safeGetPlaybackState, 30000);
//       break;
//   }
// }

// Add error event listener for unhandled promise rejections
window.addEventListener('unhandledrejection', event => {
  console.error('Unhandled promise rejection:', event.reason);
});

// Run initialization when the page loads
document.addEventListener('DOMContentLoaded', initializePageSafely);