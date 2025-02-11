async function getPlaybackState() {
  try {
    const response = await fetch('https://portfolio-7hpb.onrender.com/api/spotify/playback');
    if (!response.ok) throw new Error('Failed to fetch playback state');
    const data = await response.json();

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

    if (data.playing) {
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
      albumCoverElement.classList.add('rotate'); // Add rotation animation if playing
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

async function getPersonalStravaActivity() {
  try {
    const response = await fetch('https://portfolio-7hpb.onrender.com/api/strava/personal/weekly');
    if (!response.ok) throw new Error('Failed to fetch personal data');
    const data = await response.json();

    const personalSection = document.getElementById('personal-section');
    personalSection.innerHTML = ''; // Clear previous content

    // Summary Section
    const summaryElement = document.createElement('div');
    summaryElement.classList.add('personal-summary');

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
              <p class="md-regular">Total Activities</p>
              <p class="md-bold">${data.totalTime}</p>
             </div>
           <div class="club-data">
              <p class="md-regular">Average Speed</p>
              <p class="md-bold">${data.averageSpeed}</p>
          </div>
        </div>
    `;
// // // Add the content for the summary-personal.
// summaryElement.innerHTML = 
//   `<p class="sub-heading activity-heading">Stephano's Activities</p>
//   <p class="md-regular">Week: ${formattedWeek}</p>
//   <div class="strava-club">
//     ${['Total Distance', 'Total Activities', 'Average Speed']
//       .map(
//         (label, index) => 
//         `<div class="club-data">
//           <p class="md-regular">${label}</p>
//           <p class="md-medium">${[data.totalDistance, `${parseFloat(data.totalTime).toFixed(2)}h`, data.averageSpeed][index]}</p>
//         </div>`
//       )
//       .join('')}
//   </div>`;

    // Prepend the image element to the summary
    summaryElement.prepend(imageElement);

    // Append the summary section
    personalSection.appendChild(summaryElement);
  } catch (error) {
    console.error('Error fetching personal data:', error.message);
    document.getElementById('personal-section').innerHTML = '<p>Failed to load personal activities.</p>';
  }
}



 

// // Initialize based on current page
// function initializePage() {
//   // Get the current page name from the URL
//   const currentPage = window.location.pathname.split('/').pop() || 'index.html';

//   // Initialize features based on the current page
//   switch (currentPage) {
//     case 'index.html':
//       // Initialize Strava functionality only for index.html
//       getLatestStravaActivities('1153970');
//       setInterval(() => getLatestStravaActivities('1153970'), 7200000);
//       break;
      
//     case 'about.html':
//       // Initialize Spotify functionality only for about.html
//       getPlaybackState();
//       setInterval(getPlaybackState, 90000);
//       break;
//   }
// }

// // Run initialization when the page loads
// initializePage();








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

// Updated initialization with error handling
function initializePageSafely() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  switch (currentPage) {
    case 'index.html':
      // Initialize only club Strava functionality with error handling
      safeGetLatestStravaActivities('1153970');
      setInterval(() => safeGetLatestStravaActivities('1153970'), 7200000);
      break;
      
    case 'about.html':
      // Initialize Personal Strava functionality with error handling
      safeGetPersonalStravaActivity();
      setInterval(() => safeGetPersonalStravaActivity(), 7200000);
      
      // Initialize Spotify functionality with error handling
      safeGetPlaybackState();
      setInterval(safeGetPlaybackState, 90000);
      break;
  }
}

// Add error event listener for unhandled promise rejections
window.addEventListener('unhandledrejection', event => {
  console.error('Unhandled promise rejection:', event.reason);
});

// Run initialization when the page loads
document.addEventListener('DOMContentLoaded', initializePageSafely);





















//password//


document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('passwordModal');
  const closeBtn = document.getElementsByClassName('modal-icon')[0];
  const submitBtn = document.getElementById('submitPassword');
  const passwordInput = document.getElementById('passwordInput');
  const modalError = document.getElementById('modalError');

  // Function to check if user has valid token
  const hasValidToken = () => {
      const token = localStorage.getItem('caseStudyToken');
      if (!token) return false;

      try {
          // Decode token to check expiration
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const payload = JSON.parse(window.atob(base64));
          
          return payload.exp * 1000 > Date.now();
      } catch (error) {
          return false;
      }
  };

  // Function to load case study content
  const loadCaseStudy = (caseStudyId) => {
      // Load the local HTML file
      window.location.href = `case-studies/case-study-${caseStudyId}.html`;
  };

  // Handle case study button clicks
  document.querySelectorAll('[data-case-study]').forEach(button => {
      button.addEventListener('click', (e) => {
          const caseStudyId = e.target.dataset.caseStudy;
          
          if (hasValidToken()) {
              // If user has valid token, load case study directly
              loadCaseStudy(caseStudyId);
          } else {
              // Show password modal
              modal.style.display = 'block';
              passwordInput.value = '';
              modalError.style.display = 'none';
              
              // Store case study ID for after password verification
              modal.dataset.pendingCaseStudy = caseStudyId;
          }
      });
  });

  // Close modal when X is clicked
  closeBtn.onclick = () => {
      modal.style.display = 'none';
  };

  // Close modal when clicking outside
  window.onclick = (event) => {
      if (event.target === modal) {
          modal.style.display = 'none';
      }
  };

  // Handle password submission
  submitBtn.onclick = async () => {
    const password = passwordInput.value;
    modalError.style.display = 'none';
    submitBtn.disabled = true;

      try {
          const response = await fetch('https://portfolio-7hpb.onrender.com/api/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ password })
          });

          const data = await response.json();

          if (data.success) {
              // Store token
              localStorage.setItem('caseStudyToken', data.token);
              modal.style.display = 'none';

                // Debugging: Check if caseStudyId is correctly set
                const caseStudyId = modal.dataset.pendingCaseStudy;
                console.log("Case Study ID:", caseStudyId);

            // Ensure caseStudyId is valid before calling loadCaseStudy
            if (caseStudyId) {
                loadCaseStudy(caseStudyId);
            } else {
                console.error("Error: caseStudyId is undefined");
            }
            } else {
            modalError.textContent = data.message;
            modalError.style.display = 'block';
            }
            } catch (error) {
            modalError.textContent = 'An error occurred. Please try again later.';
            modalError.style.display = 'block';
            } finally {
            submitBtn.disabled = false;
            }
};

document.querySelectorAll('[data-case-study]').forEach(button => {
    button.addEventListener('click', (e) => {
        const caseStudyId = e.target.dataset.caseStudy;
        console.log("Button Clicked: caseStudyId =", caseStudyId);

        if (caseStudyId) {
            if (hasValidToken()) {
                loadCaseStudy(caseStudyId);
            } else {
                modal.style.display = 'block';
                passwordInput.value = '';
                modalError.style.display = 'none';
                modal.dataset.pendingCaseStudy = caseStudyId;
            }
        } else {
            console.error("Error: Button missing data-case-study attribute");
        }
    });
});

  // Handle Enter key in password input
  passwordInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
          submitBtn.click();
      }
  });
});
