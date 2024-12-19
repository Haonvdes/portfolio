async function getStravaClubData(clubId) {
    try {
      const response = await fetch(`https://portfolio-7hpb.onrender.com/api/strava/club/${clubId}`);
      if (!response.ok) throw new Error('Failed to fetch club data');
      const data = await response.json();

      console.log('Leaderboard data:', data.leaderboard);

      const clubSection = document.getElementById('club-section');
      clubSection.innerHTML = ''; // Clear previous content

      // Club Summary
      const summaryElement = document.createElement('div');
      summaryElement.classList.add('club-summary');

      // Format week range
      const [startDate, endDate] = data.currentWeek.split(' - ');
      const formattedWeek = `${startDate.split('-')[2]}-${endDate.split('-')[2]}/${startDate.split('-')[1]}/${startDate.split('-')[0]}`;

      // Add summary content
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

      clubSection.appendChild(summaryElement);

      // Leaderboard
      const leaderboardSection = document.createElement('div');
      leaderboardSection.classList.add('leaderboard');

      const leaderboardLink = document.createElement('a');
      leaderboardLink.href = data.leaderboardLink;
      leaderboardLink.target = '_blank';
      leaderboardLink.innerHTML = '<p class="md-bold">Top Runners</p>';
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

  getStravaClubData(1153970); // Example clubId