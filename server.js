require('dotenv').config();
const express = require('express');
const SpotifyWebApi = require('spotify-web-api-node');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json()); // Ensure you can parse JSON request bodies

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: 'http://localhost:3000/callback/',
});

// Removed hardcoded setAccessToken and setRefreshToken calls

// Serve the static files from the React app
app.use(express.static('public'));

app.get('/login', (req, res) => {
  const scopes = ['playlist-read-private', 'playlist-read-collaborative', 'playlist-modify-public', 'playlist-modify-private'];
  res.redirect(spotifyApi.createAuthorizeURL(scopes));
  });
  
app.get('/callback', async (req, res) => {
  const { error, code } = req.query;

  if (error) {
    console.error('Callback Error:', error);
    res.send(`Callback Error: ${error}`);
    return;
  }

  if (!code) {
    res.send('Error: Code must be supplied');
    return;
  }

  try {
    const data = await spotifyApi.authorizationCodeGrant(code);
    spotifyApi.setAccessToken(data.body['access_token']);
    spotifyApi.setRefreshToken(data.body['refresh_token']);

    // At this point, the refresh token should be stored securely associated with the user's session or profile
    // Example (pseudo-code): storeRefreshTokenForUser(sessionUserId, data.body['refresh_token']);
    // The specific implementation depends on your application's architecture and security requirements

    // Redirect to a front-end page or dashboard after successful authorization
    res.redirect('/front/index.html');  // Adjust as necessary
  } catch (error) {
    console.error('Error during authorization:', error);
    res.send(`Error during authorization: ${error}`);
  }
});

app.post('/add-tracks-from-selected-playlists', async (req, res) => {
  const { newPlaylistId, selectedPlaylistIds } = req.body;
  
  try {
    for (const playlistId of selectedPlaylistIds) {
      let offset = 0;
      let totalTracksAdded = 0;
      
      while (true) {
        // Fetch a batch of tracks from the current playlist
        const tracksResponse = await spotifyApi.getPlaylistTracks(playlistId, { offset: offset, limit: 100 });
        const trackUris = tracksResponse.body.items.map(item => item.track.uri);

        // Break if there are no tracks left to process
        if (trackUris.length === 0) {
          break;
        }

        // Add tracks in batches of 100
        for (let i = 0; i < trackUris.length; i += 100) {
          const batch = trackUris.slice(i, i + 100);
          await spotifyApi.addTracksToPlaylist(newPlaylistId, batch);
          totalTracksAdded += batch.length;
        }

        // Update the offset for the next batch of tracks
        offset += trackUris.length;

        // Check if all tracks have been processed
        if (trackUris.length < 100) {
          break;
        }
      }
      
      console.log(`Total tracks added from playlist ${playlistId}: ${totalTracksAdded}`);
    }

    res.json({ success: true, message: "All tracks successfully added to the new playlist." });
  } catch (error) {
    console.error('Failed to add tracks from selected playlists:', error);
    res.status(500).json({ error: 'Failed to add tracks', details: error.message });
  }
});



app.post('/create-playlist', async (req, res) => {
  const { name } = req.body; // Ensure this is correctly extracted
  try {
      const data = await spotifyApi.createPlaylist(name, { 'public': false }); // Use `name` here
      res.json(data.body);

  } catch (error) {
      console.error('Error creating playlist:', error);
      res.status(500).json({ error: 'Error creating playlist' });
  }
});


app.get('/playlists', async (req, res) => {
  try {
    await refreshSpotifyToken();
    const data = await spotifyApi.getUserPlaylists();
    res.json(data.body);
  } catch (error) {
    console.error('Error fetching playlists:', error);
    res.status(500).json({ error: 'Error fetching playlists' });
  }
});

app.post('/add-tracks', async (req, res) => {
  const { playlistId, trackUris } = req.body; // Ensure these are correctly received
  try {
    const data = await spotifyApi.addTracksToPlaylist(playlistId, trackUris);
    res.json(data.body); // You might want to send back a success response
  } catch (error) {
    console.error('Error adding tracks:', error);
    res.status(500).json({ error: 'Error adding tracks' });
  }
});


async function refreshSpotifyToken() {
  try {
    const data = await spotifyApi.refreshAccessToken();
    spotifyApi.setAccessToken(data.body['access_token']);

    if (data.body['refresh_token']) {
        // Update the stored refresh token if Spotify returns a new one
        spotifyApi.setRefreshToken(data.body['refresh_token']);
        // Securely store the new refresh token
    }

    console.log('Access token has been successfully refreshed.');
  } catch (error) {
    console.error('Could not refresh access token:', error);
  }
}


// Start the server
app.listen(3000, () => console.log('Server is running on port 3000'));
