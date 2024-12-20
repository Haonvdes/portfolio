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
    statusMessageElement.classList.add('sub-heading');

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


async function getLatestStravaActivities(clubId) {
  try {
    const response = await fetch(`https://portfolio-7hpb.onrender.com/api/strava/club/${clubId}/latest`);
    if (!response.ok) throw new Error('Failed to fetch club data');
    const data = await response.json();

    const clubSection = document.getElementById('club-section');
    clubSection.innerHTML = ''; // Clear previous content

    // Club Summary Section
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

    // Latest Activities Section
    const activitiesSection = document.createElement('div');
    activitiesSection.classList.add('latest-activities');

// Header for Latest Activities with clickable icon
const headerContainer = document.createElement('div');
headerContainer.style.display = 'flex';
headerContainer.style.alignItems = 'start';
headerContainer.style.paddingBottom = 'var(--p-8)';
headerContainer.innerHTML = `
          <a href="${data.clubFeedUrl}" target="_blank" style="display: flex;align-items: center;width: 100%;color: var(--text-neutral-body);gap: var(--m-8);text-decoration: none;justify-content: space-between;" class="md-bold"> 
    Lastest Activities
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
            <p class="md-regular">${activity.distance} / ${activity.movingTime}</p>
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
    document.getElementById('club-section').innerHTML = '<p>Failed to load club activities.</p>';
  }
}


getLatestStravaActivities('1153970');




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





 