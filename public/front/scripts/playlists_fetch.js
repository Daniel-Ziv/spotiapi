// Optionally, show a loading indicator
const playlistList = document.getElementById('playlist-list');
const loadingIndicator = document.createElement('div');
loadingIndicator.textContent = 'Loading playlists...';
playlistList.appendChild(loadingIndicator);

fetch('http://localhost:3000/playlists')
.then(response => {
if (!response.ok) {
throw new Error(`HTTP error! status: ${response.status}`);
}
return response.json();
})
.then(data => {
// Clear loading indicator or previous content
playlistList.innerHTML = '';

// Check if items exist and are not empty
if (!data.items || data.items.length === 0) {
playlistList.textContent = 'No playlists found.';
return;
}

data.items.forEach((playlist, index) => {
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `playlist-${index}`; // Unique ID
    checkbox.value = playlist.id;
    checkbox.classList.add("playlist-checkbox"); // Add class for styling
  
    const label = document.createElement('label');
    label.htmlFor = `playlist-${index}`;
    label.textContent = playlist.name;
    label.classList.add("playlist-label"); // Add class for styling
  
    const breakElement = document.createElement('br');
    breakElement.classList.add("playlist-break"); // Add class for styling
  
    playlistList.appendChild(checkbox);
    playlistList.appendChild(label);
    playlistList.appendChild(breakElement);
  });
  
})
.catch(error => {
console.error('Error:', error);
// Clear loading indicator or previous content
playlistList.innerHTML = '';
// Show error message to the user
const errorMessage = document.createElement('div');
errorMessage.textContent = 'Error loading playlists.';
playlistList.appendChild(errorMessage);
});