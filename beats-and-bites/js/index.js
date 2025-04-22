document.addEventListener('DOMContentLoaded', () => {
  const recommendButton = document.getElementById('recommend');
  const moodSelect = document.getElementById('mood');
  const foodInput = document.getElementById('food');
  const recommendationDiv = document.getElementById('recommendation');
  const vinylRecord = document.querySelector('.vinyl-record');
  let currentAudio = null;

  recommendButton.addEventListener('click', async () => {
    const mood = moodSelect.value;
    const food = foodInput.value.toLowerCase();
    
    if (!food) {
      alert('Please enter what you\'re eating!');
      return;
    }

    // Show loading state
    recommendationDiv.innerHTML = '<div class="loading">Finding the perfect beat for your next bite...</div>';
    recommendationDiv.classList.add('show');
    
    // Animate vinyl record
    vinylRecord.style.animation = 'none';
    vinylRecord.offsetHeight; // Trigger reflow
    vinylRecord.style.animation = 'spin 20s linear infinite';
    
    try {
      const response = await fetch(
        `http://localhost:3000/api/recommendations?mood=${encodeURIComponent(mood)}&food=${encodeURIComponent(food)}`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to get recommendations. Please try again.`);
      }
      
      const tracks = await response.json();
      
      if (tracks.length === 0) {
        displayNoResults();
        return;
      }
      
      displayRecommendations(tracks);
    } catch (error) {
      console.error('Error:', error);
      displayError('Oops!', error.message);
    }
  });

  function displayRecommendations(tracks) {
    recommendationDiv.innerHTML = `
      <div class="recommendations-grid">
        ${tracks.map(track => `
          <div class="track-card" data-id="${track.id}">
            <div class="track-cover">
              <img src="${track.cover}" alt="${track.album}">
              <button class="play-button" data-preview="${track.preview_url || ''}">
                <i class="fas fa-play"></i>
              </button>
            </div>
            <div class="track-info">
              <h3>${track.title}</h3>
              <p class="artist">${track.artist}</p>
              <p class="album">${track.album}</p>
              <div class="track-meta">
                <span class="duration">${formatDuration(track.duration)}</span>
                <span class="popularity">${track.popularity}% match</span>
              </div>
              <a href="${track.spotify_url}" target="_blank" class="spotify-link">
                <i class="fab fa-spotify"></i> Open in Spotify
              </a>
            </div>
          </div>
        `).join('')}
      </div>
    `;
    
    recommendationDiv.classList.add('show');
    
    // Add event listeners for play buttons
    document.querySelectorAll('.play-button').forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        const previewUrl = button.dataset.preview;
        if (previewUrl) {
          playPreview(previewUrl, button);
        } else {
          alert('No preview available for this track');
        }
      });
    });
  }

  function playPreview(url, button) {
    // Stop current audio if playing
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
      document.querySelectorAll('.play-button i').forEach(icon => {
        icon.className = 'fas fa-play';
      });
    }

    // Play new audio
    currentAudio = new Audio(url);
    currentAudio.play().catch(error => {
      console.error('Error playing audio:', error);
      alert('Error playing preview. Please try again.');
    });
    button.querySelector('i').className = 'fas fa-pause';

    currentAudio.addEventListener('ended', () => {
      button.querySelector('i').className = 'fas fa-play';
      currentAudio = null;
    });
  }

  function formatDuration(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds.padStart(2, '0')}`;
  }

  function displayNoResults() {
    recommendationDiv.innerHTML = `
      <div class="no-results">
        <p>No perfect matches found for your current mood and food combination.</p>
        <p>Try a different combination or be more specific!</p>
      </div>
    `;
  }

  function displayError(title, message) {
    recommendationDiv.innerHTML = `
      <div class="error">
        <h3>${title}</h3>
        <p>${message}</p>
      </div>
    `;
  }
}); 