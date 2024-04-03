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
playlistList.innerHTML = '';

if (!data.items || data.items.length === 0) {
playlistList.textContent = 'No playlists found.';
return;
}

data.items.forEach((playlist, index) => {
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `playlist-${index}`;
    checkbox.value = playlist.id;
    checkbox.classList.add("playlist-checkbox"); 
  
    const label = document.createElement('label');
    label.htmlFor = `playlist-${index}`;
    label.textContent = playlist.name;
    label.classList.add("playlist-label"); 
  
    const breakElement = document.createElement('br');
    breakElement.classList.add("playlist-break"); 
  
    playlistList.appendChild(checkbox);
    playlistList.appendChild(label);
    playlistList.appendChild(breakElement);
  });
  
})
.catch(error => {
console.error('Error:', error);
playlistList.innerHTML = '';
const errorMessage = document.createElement('div');
errorMessage.textContent = 'Error loading playlists.';
playlistList.appendChild(errorMessage);
});
