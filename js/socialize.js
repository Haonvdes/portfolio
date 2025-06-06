// Function to fetch and display playback state
async function getPlaybackState() {
  try {
    const playbackResponse = await fetch('https://api.stpnguyen.com/api/spotify/playback');

    if (!playbackResponse.ok) {
      throw new Error('Failed to fetch playback state');
    }

    const playbackData = await playbackResponse.json();
    const playbackInfo = document.getElementById('playback-info');
    playbackInfo.innerHTML = ''; // Clear previous content

    // Spotify Header Image
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
    document.getElementById('playback-info').innerHTML =
      '<p class="md-regular">Oops! Something went wrong, trying to load again shortly.</p>';
  }
}
async function getLatestStravaActivities(clubId) {
  try {
    const response = await fetch(`https://api.stpnguyen.com/api/strava/club/${clubId}/latest`);
    if (!response.ok) throw new Error('Failed to fetch club data');
    const data = await response.json();

    const clubSection = document.getElementById('club-section');
    clubSection.innerHTML = ''; // Clear previous content

    // Club Summary Section
    const summaryElement = document.createElement('div');
    summaryElement.classList.add('club-summary');

    // Format week range
    const formattedWeek = data.currentWeek;

    // Create the image element
    const imageElement = document.createElement('img');
    imageElement.src = 'public/strava-logo.png';
    imageElement.alt = 'Strava Logo';
    imageElement.style.width = '100px';
    imageElement.style.marginBottom = '40px';

    // Add the content for the summary
    summaryElement.innerHTML = `
      <p class="sub-heading">Incredible Team</p>
      <p class="md-regular">Week: ${formattedWeek}</p>
      <div class="strava-club">
        ${['Total Distance', 'Total Time', 'Total Activities']
          .map(
            (label, index) => `
            <div class="club-data">
              <p class="md-regular">${label}</p>
              <p class="md-bold">${[data.totalDistance, `${parseFloat(data.totalTime).toFixed(2)}h`, data.totalActivities][index]}</p>
            </div>`
          )
          .join('')}
      </div>
    `;

    // Prepend the image element to the summary
    summaryElement.prepend(imageElement);

    // Latest Activities Section
    const activitiesSection = document.createElement('div');
    activitiesSection.classList.add('latest-activities');

    // Determine whether the user is on a mobile device
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    // Choose the appropriate URL
    const clubFeedUrl = isMobile ? data.clubFeedUrlMobile : data.clubFeedUrlDesktop;

    // Header for Latest Activities with clickable icon
    const headerContainer = document.createElement('div');
    headerContainer.style.display = 'flex';
    headerContainer.style.alignItems = 'start';
    headerContainer.style.paddingBottom = 'var(--p-8)';
    headerContainer.innerHTML = `
      <a href="${clubFeedUrl}" target="_blank" style="display: flex;align-items: center;width: 100%;color: var(--text-neutral-body);gap: var(--m-8);text-decoration: none;justify-content: space-between;" class="md-bold"> 
        Latest Activities
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
          <polyline points="15 3 21 3 21 9"></polyline>
          <line x1="10" y1="14" x2="21" y2="3"></line>
        </svg>
      </a>
    `;
    activitiesSection.appendChild(headerContainer);

    // Filter unique athletes (keep only most recent activity per athlete)
    const uniqueAthletes = data.latestActivities.reduce((acc, current) => {
      if (!acc.some(item => item.athleteName === current.athleteName)) {
        acc.push(current);
      }
      return acc;
    }, []);

    // Activities List (unique athletes only)
    uniqueAthletes.forEach((activity, index) => {
      if (index < 5) { // Limit to 5 unique athletes
        const activityElement = document.createElement('div');
        activityElement.classList.add('activity-details');
        activityElement.innerHTML = `
          <img src="public/assets/top${index + 1}.svg" alt="Athlete ${index + 1}" width="40" height="40">
          <div class="athlete-sat">
            <p class="md-bold">${activity.athleteName}</p>
            <p class="md-regular">${activity.distance} / ${activity.movingTime} / ${activity.activityType}</p>
          </div>
        `;
        activitiesSection.appendChild(activityElement);
      }
    });

    // Append both sections
    clubSection.appendChild(summaryElement);
    clubSection.appendChild(activitiesSection);
  } catch (error) {
    console.error('Error fetching club data:', error.message);
    document.getElementById('club-section').innerHTML = '<p class="md-medium" style="padding:var(--p-16)">Oops! Something went wrong; trying to load again shortly.</p>';
  }
}

async function getPersonalStravaActivity() {
  try {
    const response = await fetch('https://api.stpnguyen.com/api/strava/personal/weekly');
    if (!response.ok) throw new Error('Oops! Something went wrong; trying to load again shortly.');
    const data = await response.json();

    const personalSection = document.getElementById('personal-section');
    personalSection.innerHTML = ''; // Clear previous content

    // Summary Section
    const summaryElement = document.createElement('div');
    summaryElement.classList.add('personal-summary');
    summaryElement.style.width = '100%';

    // Create the image element
    const imageElement = document.createElement('img');
    imageElement.src = '../public/strava-logo.png';
    imageElement.alt = 'Strava Logo';
    imageElement.style.width = '100px';
    imageElement.style.marginBottom = '40px';

    // Add the content for the summary
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


    // Prepend the image element to the summary
    summaryElement.prepend(imageElement);

    // Append the summary section
    personalSection.appendChild(summaryElement);
  } catch (error) {
    console.error('Error fetching personal data:', error.message);
    document.getElementById('personal-section').innerHTML = '<p class="md-regular">Oops! Something went wrong; trying to load again shortly.</p>';
  }
}


function initializePage() {
  // Initialize Strava Club section if present
  const clubSection = document.getElementById('club-section');
  if (clubSection) {
      safeGetLatestStravaActivities('1153970');
      setInterval(() => safeGetLatestStravaActivities('1153970'), 7200000); // Refresh every 2 hours
  }
  
  // Initialize Personal Strava section if present
  const personalSection = document.getElementById('personal-section');
  if (personalSection) {
      safeGetPersonalStravaActivity();
      setInterval(() => safeGetPersonalStravaActivity(), 7200000); // Refresh every 2 hours
  }
  
  // Initialize Spotify playback if present
  const playbackInfo = document.getElementById('playback-info');
  if (playbackInfo) {
      safeGetPlaybackState();
      setInterval(safeGetPlaybackState, 30000); // Refresh every 30 seconds
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

// Add error event listener for unhandled promise rejections
window.addEventListener('unhandledrejection', event => {
  console.error('Unhandled promise rejection:', event.reason);
});

// Run initialization when the page loads
document.addEventListener('DOMContentLoaded', initializePage);