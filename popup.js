document.addEventListener('DOMContentLoaded', function() {
  // Initialize the extension
  init();

  // Add event listeners
  document.getElementById('addCurrentPage').addEventListener('click', saveCurrentPage);
  document.getElementById('searchInput').addEventListener('input', handleSearch);
  document.getElementById('settings').addEventListener('click', toggleSettingsMenu);
  document.getElementById('exportLinks').addEventListener('click', exportLinks);
  document.getElementById('importLinks').addEventListener('click', importLinks);
  
  // Add tab switching functionality
  const tabButtons = document.querySelectorAll('.tab-button');
  tabButtons.forEach(button => {
    button.addEventListener('click', () => switchTab(button));
  });

  // Close settings menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.settings-container')) {
      document.querySelector('.settings-menu').classList.remove('show');
    }
  });
});

async function init() {
  // Load saved links
  await loadLinks();
}

async function saveCurrentPage() {
  try {
    // Get the active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    const link = {
      url: tab.url,
      title: tab.title,
      favicon: tab.favIconUrl || 'icons/icon16.png',
      timestamp: new Date().toISOString(),
      collection: 'recent',
      favorite: false,
      tags: []
    };

    // Save to storage
    const links = await getStoredLinks();
    links.unshift(link);
    
    await chrome.storage.local.set({ 'saved_links': links });
    
    // Refresh the display
    await loadLinks();
  } catch (error) {
    console.error('Error saving link:', error);
  }
}

async function getStoredLinks() {
  const data = await chrome.storage.local.get('saved_links');
  return data.saved_links || [];
}

async function loadLinks() {
  const links = await getStoredLinks();
  displayLinks(links);
}

function displayLinks(links) {
  const linksList = document.getElementById('linksList');
  linksList.innerHTML = '';

  links.forEach(link => {
    const linkElement = createLinkElement(link);
    linksList.appendChild(linkElement);
  });
}

function createLinkElement(link) {
  const div = document.createElement('div');
  div.className = 'link-item';
  
  // Create favicon image with error handling
  const img = document.createElement('img');
  img.className = 'favicon';
  img.src = link.favicon || 'icons/icon16.png';
  img.onerror = () => img.src = 'icons/icon16.png';
  
  // Create link details container
  const details = document.createElement('div');
  details.className = 'link-details';
  
  // Create link
  const a = document.createElement('a');
  a.href = link.url;
  a.target = '_blank';
  a.textContent = link.title;
  
  // Create timestamp
  const time = document.createElement('span');
  time.className = 'timestamp';
  time.textContent = formatTimestamp(link.timestamp);
  
  // Create tags container
  const tagsContainer = document.createElement('div');
  tagsContainer.className = 'tags-container';
  
  if (link.tags && link.tags.length > 0) {
    link.tags.forEach(tag => {
      const tagElement = document.createElement('span');
      tagElement.className = 'tag';
      tagElement.textContent = tag;
      tagElement.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        // Set search input to #tag and trigger search
        const searchInput = document.getElementById('searchInput');
        searchInput.value = `#${tag}`;
        searchInput.dispatchEvent(new Event('input'));
      });
      tagsContainer.appendChild(tagElement);
    });
  }
  
  // Create tag button
  const tagButton = document.createElement('button');
  tagButton.className = 'tag-button';
  tagButton.innerHTML = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z" fill="currentColor"/>
    </svg>
  `;
  tagButton.title = 'Add/Edit Tags';
  tagButton.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    showTagEditor(link);
  });
  
  // Create favorite button
  const favoriteButton = document.createElement('button');
  favoriteButton.className = `favorite-button ${link.favorite ? 'active' : ''}`;
  favoriteButton.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill="currentColor"/>
    </svg>
  `;
  favoriteButton.title = link.favorite ? 'Remove from favorites' : 'Add to favorites';
  favoriteButton.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleFavorite(link);
  });
  
  // Create delete button
  const deleteButton = document.createElement('button');
  deleteButton.className = 'delete-button';
  deleteButton.innerHTML = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/>
    </svg>
  `;
  deleteButton.title = 'Delete link';
  deleteButton.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await deleteLink(link);
  });
  
  // Assemble the elements
  details.appendChild(a);
  details.appendChild(time);
  details.appendChild(tagsContainer);
  div.appendChild(img);
  div.appendChild(details);
  div.appendChild(tagButton);
  div.appendChild(favoriteButton);
  div.appendChild(deleteButton);
  return div;
}

function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleString();
}

function handleSearch(event) {
  const searchTerm = event.target.value.toLowerCase().trim();
  
  // Get the current active tab
  const activeTab = document.querySelector('.tab-button.active');
  const currentCollection = activeTab.dataset.tab;
  
  // Filter and display links with search
  filterAndDisplayLinks(currentCollection, searchTerm);
}

function switchTab(selectedTab) {
  // Remove active class from all tabs
  document.querySelectorAll('.tab-button').forEach(tab => {
    tab.classList.remove('active');
  });
  
  // Add active class to selected tab
  selectedTab.classList.add('active');
  
  // Get the selected tab's collection
  const collection = selectedTab.dataset.tab;
  
  // Filter and display links
  filterAndDisplayLinks(collection);
}

async function filterAndDisplayLinks(collection, searchTerm = '') {
  const links = await getStoredLinks();
  let filteredLinks = links;
  
  // First filter by collection
  if (collection === 'favorites') {
    filteredLinks = links.filter(link => link.favorite);
  } else if (collection === 'recent') {
    filteredLinks = links.slice(0, 10);
  } else if (collection === 'all') {
    filteredLinks = links;
  }
  
  // Then filter by search term if it exists
  if (searchTerm) {
    // Check if searching for a tag with #hashtag syntax
    if (searchTerm.startsWith('#')) {
      const tagSearch = searchTerm.slice(1).toLowerCase();
      filteredLinks = filteredLinks.filter(link => 
        link.tags && link.tags.some(tag => 
          tag.toLowerCase().includes(tagSearch)
        )
      );
    } else {
      filteredLinks = filteredLinks.filter(link => 
        link.title.toLowerCase().includes(searchTerm) || 
        link.url.toLowerCase().includes(searchTerm) ||
        (link.tags && link.tags.some(tag => 
          tag.toLowerCase().includes(searchTerm)
        ))
      );
    }
  }
  
  displayLinks(filteredLinks);
}

async function deleteLink(linkToDelete) {
  try {
    // Ask for confirmation
    const confirmDelete = confirm(`Are you sure you want to delete this link?`);
    
    if (!confirmDelete) {
      return; // User cancelled the deletion
    }
    
    // Get current links
    const links = await getStoredLinks();
    
    // Filter out the link to delete
    const updatedLinks = links.filter(link => 
      link.url !== linkToDelete.url || 
      link.timestamp !== linkToDelete.timestamp
    );
    
    // Save updated links
    await chrome.storage.local.set({ 'saved_links': updatedLinks });
    
    // Refresh the display
    await loadLinks();
  } catch (error) {
    console.error('Error deleting link:', error);
  }
}

async function toggleFavorite(link) {
  try {
    // Get current links
    const links = await getStoredLinks();
    
    // Find and update the link
    const updatedLinks = links.map(l => {
      if (l.url === link.url && l.timestamp === link.timestamp) {
        return { ...l, favorite: !l.favorite };
      }
      return l;
    });
    
    // Save updated links
    await chrome.storage.local.set({ 'saved_links': updatedLinks });
    
    // Refresh the display
    await loadLinks();
  } catch (error) {
    console.error('Error toggling favorite:', error);
  }
}

function toggleSettingsMenu() {
  document.querySelector('.settings-menu').classList.toggle('show');
}

async function exportLinks() {
  try {
    const links = await getStoredLinks();
    const blob = new Blob([JSON.stringify(links, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `link-saver-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting links:', error);
  }
}

function importLinks() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  
  input.onchange = async (e) => {
    try {
      const file = e.target.files[0];
      const text = await file.text();
      const links = JSON.parse(text);
      
      if (!Array.isArray(links)) {
        throw new Error('Invalid file format');
      }
      
      await chrome.storage.local.set({ 'saved_links': links });
      await loadLinks();
    } catch (error) {
      console.error('Error importing links:', error);
      alert('Error importing links. Please make sure the file is valid.');
    }
  };
  
  input.click();
}

function showTagEditor(link) {
  const tags = link.tags || [];
  const tagInput = prompt('Enter tags (comma separated):', tags.join(', '));
  
  if (tagInput === null) return; // User cancelled
  
  const newTags = tagInput.split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0);
  
  updateLinkTags(link, newTags);
}

async function updateLinkTags(link, newTags) {
  try {
    const links = await getStoredLinks();
    
    const updatedLinks = links.map(l => {
      if (l.url === link.url && l.timestamp === link.timestamp) {
        return { ...l, tags: newTags };
      }
      return l;
    });
    
    await chrome.storage.local.set({ 'saved_links': updatedLinks });
    await loadLinks();
  } catch (error) {
    console.error('Error updating tags:', error);
  }
} 