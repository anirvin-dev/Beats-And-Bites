require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Spotify API credentials
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
let accessToken = null;
let tokenExpirationTime = null;

// Get Spotify access token using Client Credentials
async function getAccessToken() {
  // Check if we have a valid token
  if (accessToken && tokenExpirationTime && Date.now() < tokenExpirationTime) {
    return accessToken;
  }

  try {
    const response = await axios.post('https://accounts.spotify.com/api/token', 
      'grant_type=client_credentials',
      {
        headers: {
          'Authorization': 'Basic ' + Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    accessToken = response.data.access_token;
    // Set token expiration time (subtract 1 minute for safety)
    tokenExpirationTime = Date.now() + (response.data.expires_in - 60) * 1000;
    
    return accessToken;
  } catch (error) {
    console.error('Error getting access token:', error.response?.data || error.message);
    throw error;
  }
}

// Search for tracks based on mood and food
app.get('/api/recommendations', async (req, res) => {
  try {
    const token = await getAccessToken();
    const { mood, food } = req.query;
    
    // Create search query based on mood and food
    const searchQuery = `${mood} ${food} music`;
    
    // First, search for a playlist that matches our mood and food
    const playlistResponse = await axios.get(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchQuery)}&type=playlist&limit=1`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    let tracks = [];
    
    if (playlistResponse.data.playlists.items.length > 0) {
      // Get tracks from the playlist
      const playlistId = playlistResponse.data.playlists.items[0].id;
      const tracksResponse = await axios.get(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=5`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      tracks = tracksResponse.data.items.map(item => ({
        id: item.track.id,
        title: item.track.name,
        artist: item.track.artists[0].name,
        album: item.track.album.name,
        cover: item.track.album.images[0].url,
        duration: item.track.duration_ms,
        preview_url: item.track.preview_url,
        spotify_url: item.track.external_urls.spotify,
        popularity: item.track.popularity
      }));
    }

    // If we didn't get enough tracks from the playlist, supplement with track search
    if (tracks.length < 5) {
      const trackResponse = await axios.get(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchQuery)}&type=track&limit=${5 - tracks.length}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const additionalTracks = trackResponse.data.tracks.items.map(track => ({
        id: track.id,
        title: track.name,
        artist: track.artists[0].name,
        album: track.album.name,
        cover: track.album.images[0].url,
        duration: track.duration_ms,
        preview_url: track.preview_url,
        spotify_url: track.external_urls.spotify,
        popularity: track.popularity
      }));

      tracks = [...tracks, ...additionalTracks];
    }

    res.json(tracks);
  } catch (error) {
    console.error('Error fetching recommendations:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      // Token expired, clear it
      accessToken = null;
      tokenExpirationTime = null;
      res.status(401).json({ error: 'Authentication expired. Please try again.' });
    } else {
      res.status(500).json({ error: 'Failed to fetch recommendations' });
    }
  }
});

// Get track details
app.get('/api/track/:id', async (req, res) => {
  try {
    if (!accessToken) {
      await getAccessToken();
    }

    const response = await axios.get(
      `https://api.spotify.com/v1/tracks/${req.params.id}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const track = response.data;
    res.json({
      id: track.id,
      title: track.name,
      artist: track.artists[0].name,
      album: track.album.name,
      cover: track.album.images[0].url,
      duration: track.duration_ms,
      preview_url: track.preview_url,
      spotify_url: track.external_urls.spotify,
      popularity: track.popularity
    });
  } catch (error) {
    console.error('Error fetching track details:', error);
    res.status(500).json({ error: 'Failed to fetch track details' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  // Test the Spotify connection on startup
  getAccessToken()
    .then(() => console.log('Successfully connected to Spotify API!'))
    .catch(error => console.error('Failed to connect to Spotify API:', error.message));
}); 