// This is a placeholder function. You'll need to replace this with your own function to get the access token.
async function accessToken() {
    // The client ID of your application
    const clientId = '2cf16bdb0d6e4f25ad387561e3085f1a';

    // The redirect URI of your application
    const redirectUri = 'http://localhost:3000/callback/';

    // The scopes that your application needs
    const scopes = ['playlist-modify-public', 'playlist-modify-private'];

    // Construct the authorization URL
    const url = `https://accounts.spotify.com/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes.join(' '))}&response_type=token`;

    // Open the authorization URL in a new window
    const popup = window.open(url, 'Login with Spotify', 'width=800,height=600');

    return new Promise((resolve, reject) => {
        // Check the popup's URL every second
        const intervalId = setInterval(() => {
            try {
                // If the popup was closed without logging in
                if (popup.closed) {
                    clearInterval(intervalId);
                    reject(new Error('Popup closed by user'));
                }

                // If the popup redirected to the redirect URI
                if (popup.location.href.startsWith(redirectUri)) {
                    clearInterval(intervalId);
                    const url = new URL(popup.location.href);
                    const hash = new URLSearchParams(url.hash.substr(1));
                    const accessToken = hash.get('access_token');
                    const expiresIn = Number(hash.get('expires_in'));
                    popup.close();

                    if (accessToken) {
                        // Resolve the promise with the access token
                        resolve(accessToken);

                        // You might also want to refresh the access token when it expires
                        setTimeout(() => {
                            // Refresh the access token
                        }, (expiresIn - 60) * 1000);
                    } else {
                        reject(new Error('Failed to get access token'));
                    }
                }
            } catch (error) {
                // Ignore DOMException: Blocked a frame with origin "http://localhost:3000" from accessing a cross-origin frame.
            }
        }, 1000);
    });
}

async function createPlaylist(accessToken, newPlaylistName) {
    const response = await fetch(`https://api.spotify.com/v1/me/playlists`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: newPlaylistName
        })
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
}

async function getPlaylistTracks(accessToken, playlistId) {
    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
}

async function addTracksToPlaylist(accessToken, playlistId, tracks) {
    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            uris: tracks.items.map(track => track.track.uri)
        })
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
}

document.getElementById('playlist-form').addEventListener('submit', async function(event) {
    event.preventDefault();
    const newPlaylistName = document.getElementById('new-playlist-name').value;
    const checkboxes = document.querySelectorAll('#playlist-list input[type=checkbox]:checked');
    const selectedPlaylistIds = Array.from(checkboxes).map(checkbox => checkbox.value);

    // Step 1: Create the new playlist
    try {
        const playlistResponse = await fetch('/create-playlist', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({name: newPlaylistName})
        });
        const newPlaylist = await playlistResponse.json();

        if (!newPlaylist || !newPlaylist.id) throw new Error('Failed to create playlist.');

        // Step 2: Add tracks from selected playlists to the new playlist
        await fetch('/add-tracks-from-selected-playlists', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                newPlaylistId: newPlaylist.id, // or newPlaylist.body.id based on your API response structure
                selectedPlaylistIds: selectedPlaylistIds
            })
        });
        const checkboxes = document.querySelectorAll('#playlist-list input[type=checkbox]:checked');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        alert('New playlist has been successfully created and tracks added!');

    } catch (error) {
        console.error('Error during the playlist creation or track addition process:', error);
    }
});
