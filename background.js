// Create context menu when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'save-link',
    title: 'Save to Link Saver',
    contexts: ['link']
  });
  
  chrome.contextMenus.create({
    id: 'save-page',
    title: 'Save current page to Link Saver',
    contexts: ['page']
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  try {
    let link = {
      url: info.linkUrl || info.pageUrl,
      title: '',
      favicon: tab.favIconUrl || 'icons/icon16.png',
      timestamp: new Date().toISOString(),
      collection: 'recent',
      favorite: false,
      tags: []
    };
    
    // If saving a link (not the current page), fetch its title
    if (info.linkUrl) {
      try {
        const response = await fetch(info.linkUrl);
        const text = await response.text();
        const doc = new DOMParser().parseFromString(text, 'text/html');
        link.title = doc.title;
      } catch {
        // If we can't fetch the title, use the URL as title
        link.title = info.linkUrl;
      }
    } else {
      // For current page, use tab title
      link.title = tab.title;
    }
    
    // Get current links
    const data = await chrome.storage.local.get('saved_links');
    const links = data.saved_links || [];
    
    // Add new link at the beginning
    links.unshift(link);
    
    // Save updated links
    await chrome.storage.local.set({ 'saved_links': links });
    
    // Show notification
    chrome.action.setBadgeText({ text: '✓' });
    setTimeout(() => {
      chrome.action.setBadgeText({ text: '' });
    }, 2000);
    
  } catch (error) {
    console.error('Error saving link:', error);
    chrome.action.setBadgeText({ text: '✕' });
    setTimeout(() => {
      chrome.action.setBadgeText({ text: '' });
    }, 2000);
  }
}); 