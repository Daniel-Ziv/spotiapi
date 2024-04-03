require('dotenv').config();
const express = require('express');
const SpotifyWebApi = require('spotify-web-api-node');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json()); 

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: 'http://localhost:3000/callback/',
});


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

  
    // Redirect after successful authorization
    res.redirect('/front/index.html');  
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
        const tracksResponse = await spotifyApi.getPlaylistTracks(playlistId, { offset: offset, limit: 100 });
        const trackUris = tracksResponse.body.items.map(item => item.track.uri);

        // if no tracks left to process
        if (trackUris.length === 0) {
          break;
        }

        // Add tracks
        for (let i = 0; i < trackUris.length; i += 100) {
          const batch = trackUris.slice(i, i + 100);
          await spotifyApi.addTracksToPlaylist(newPlaylistId, batch);
          totalTracksAdded += batch.length;
        }

        offset += trackUris.length;

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
  const { name } = req.body;
  try {
      const data = await spotifyApi.createPlaylist(name, { 'public': false }); 
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
  const { playlistId, trackUris } = req.body; 
  try {
    const data = await spotifyApi.addTracksToPlaylist(playlistId, trackUris);
    res.json(data.body);
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
        spotifyApi.setRefreshToken(data.body['refresh_token']);
    }

    console.log('Access token has been successfully refreshed.');
  } catch (error) {
    console.error('Could not refresh access token:', error);
  }
}


app.listen(3000, () => console.log('Server is running on port 3000'));
