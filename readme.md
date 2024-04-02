Spotify Playlist Manager

This project is a web-based application that allows users to manage their Spotify playlists. Users can view their existing playlists, create new playlists, and add tracks from multiple playlists into a single new playlist. The application interacts with the Spotify Web API to fetch playlist data and perform playlist operations.

Features

Login with Spotify: Users can authenticate using their Spotify account to access their playlist information.
View Playlists: Displays a list of the user's current Spotify playlists.
Create Playlists: Users can create new playlists with custom names.
Merge Playlists: Allows the selection of multiple playlists and merges their tracks into a new playlist.
Technology Stack

Frontend: HTML, CSS, JavaScript
Backend (optional for this project setup): Node.js, Express.js (if interacting with Spotify API directly from a backend service)
APIs: Spotify Web API
Project Structure

bash
Copy code
/spotify-playlist-manager
|-- /front                  # Frontend files
|   |-- index.html          # Main HTML file
|   |-- styles.css          # CSS styles
|   |-- scripts             # JavaScript scripts
|       |-- playlists_fetch.js    # Script for fetching and displaying playlists
|       |-- playlists_action.js   # Script for playlist actions (create, merge)
|-- /back (optional)        # Backend files (if needed)
|   |-- server.js           # Node.js/Express server (optional)
|-- README.md               # Project documentation
Setup and Installation

Prerequisites
A Spotify Developer account and a registered application within the Spotify Developer Dashboard.
Client ID and Client Secret for the registered application.
Frontend Setup
Configure Spotify Login:
The login process requires a redirect URI. Ensure this is configured in the Spotify Developer Dashboard for your application.
HTML and JavaScript Setup:
Ensure the index.html includes links to the CSS styles and JavaScript files.
Modify scripts/playlists_fetch.js to include your Spotify Client ID and the redirect URI.
Running the Application:
The frontend can be opened directly in a browser or served using a simple HTTP server (e.g., using the http-server npm package).
Backend Setup (Optional)
If you choose to implement a backend:

Node.js and Express.js Setup:
Ensure Node.js is installed.
Create a server.js file with Express.js setup to handle authentication and API requests to Spotify.
Use environment variables to store sensitive information like Client ID and Client Secret.
Running the Server:
Run npm install to install dependencies.
Start the server using node server.js.
Usage

Open the application in a web browser.
Click on the login link to authenticate with Spotify.
Once authenticated, your playlists will be displayed.
To create a new playlist, enter a name and select the playlists you want to merge, then submit.
The application will create a new playlist in your Spotify account with the selected tracks.
Contributing

Contributions to the Spotify Playlist Manager are welcome. Please ensure to follow the established coding conventions and add unit tests for new features. Open a pull request with a clear list of what you've done.

License

This project is licensed under the MIT License - see the LICENSE.md file for details.

