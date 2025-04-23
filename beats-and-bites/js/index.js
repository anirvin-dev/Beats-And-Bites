document.addEventListener('DOMContentLoaded', () => {
  const recommendButton = document.getElementById('recommend');
  const moodSelect = document.getElementById('mood');
  const foodInput = document.getElementById('food');
  const recommendationDiv = document.getElementById('recommendation');
  const vinylRecord = document.querySelector('.vinyl-record');
  const musicalNotesContainer = document.querySelector('.musical-notes');
  let currentAudio = null;

  // Musical notes for background
  const notes = ['♩', '♪', '♫', '♬', '𝄞', '𝄢'];
  
  // Create floating musical notes
  function createNote() {
    const note = document.createElement('div');
    note.className = 'note';
    note.textContent = notes[Math.floor(Math.random() * notes.length)];
    
    const startX = Math.random() * window.innerWidth;
    const endX = startX + (Math.random() - 0.5) * 200;
    const duration = Math.random() * 5 + 8;
    
    note.style.setProperty('--start-x', `${startX}px`);
    note.style.setProperty('--end-x', `${endX}px`);
    note.style.setProperty('--duration', `${duration}s`);
    note.style.left = `${startX}px`;
    
    musicalNotesContainer.appendChild(note);
    
    note.addEventListener('animationend', () => {
      note.remove();
    });
  }

  // Create initial set of notes
  for (let i = 0; i < 20; i++) {
    setTimeout(() => createNote(), i * 300);
  }

  // Continuously create new notes
  setInterval(createNote, 2000);

  // Remove vinyl hover animations, keep only basic spin
  vinylRecord.style.animation = 'float 6s ease-in-out infinite, spin 20s linear infinite';

  // Form interactions
  moodSelect.addEventListener('change', () => {
    createNoteBurst(moodSelect);
  });

  foodInput.addEventListener('input', (e) => {
    if (e.target.value.length > 0 && e.target.value.length % 3 === 0) {
      createNoteBurst(foodInput);
    }
  });

  recommendButton.addEventListener('click', async () => {
    const mood = moodSelect.value;
    const food = foodInput.value.toLowerCase();
    
    if (!food) {
      alert('Please enter what you\'re eating!');
      return;
    }

    // Show loading state with animation
    recommendationDiv.innerHTML = `
      <div class="loading">
        Finding the perfect beat for your next bite...
        <div class="loading-animation">
          ${notes.slice(0, 5).map(note => `<span>${note}</span>`).join('')}
        </div>
      </div>
    `;
    recommendationDiv.classList.add('show');
    
    // Create note burst effect
    createNoteBurst(recommendButton);
    
    // Animate vinyl record
    vinylRecord.style.animation = 'float 6s ease-in-out infinite, spin 5s linear infinite';
    
    // For now, just show a placeholder message since we don't have Spotify API yet
    setTimeout(() => {
      displayPlaceholder(mood, food);
      // Reset vinyl animation
      vinylRecord.style.animation = 'float 6s ease-in-out infinite, spin 20s linear infinite';
    }, 2000);
  });

  function displayPlaceholder(mood, food) {
    recommendationDiv.innerHTML = `
      <div class="placeholder-recommendation">
        <h3>Coming Soon!</h3>
        <p>We're cooking up the perfect ${mood} tunes to go with your ${food}.</p>
        <div class="placeholder-vinyl">
          <div class="vinyl-animation"></div>
        </div>
      </div>
    `;
  }

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

  // Create and manage background particles
  const particlesContainer = document.createElement('div');
  particlesContainer.className = 'particles';
  document.body.appendChild(particlesContainer);

  function createParticle() {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    // Random size between 3 and 8 pixels
    const size = Math.random() * 5 + 3;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    
    // Random starting position
    const startX = Math.random() * window.innerWidth;
    const endX = startX + (Math.random() - 0.5) * 300;
    
    // Random duration between 10 and 20 seconds
    const duration = Math.random() * 10 + 10;
    
    particle.style.setProperty('--start-x', `${startX}px`);
    particle.style.setProperty('--end-x', `${endX}px`);
    particle.style.setProperty('--duration', `${duration}s`);
    particle.style.left = `${startX}px`;
    
    particlesContainer.appendChild(particle);
    
    // Remove particle after animation completes
    setTimeout(() => {
      particle.remove();
    }, duration * 1000);
  }

  // Create initial set of particles
  for (let i = 0; i < 30; i++) {
    setTimeout(() => createParticle(), i * 200);
  }

  // Continuously create new particles
  setInterval(createParticle, 1000);
}); 