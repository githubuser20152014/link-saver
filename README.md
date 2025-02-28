# Link Saver Browser Extension

A clean, simple browser extension to save and organize links for later reading. Built for Chrome/Brave and other Chromium-based browsers.

## Features

Current Features:
- 🔗 Quick save current page with one click
- 📱 Clean, minimal interface
- 📂 Basic organization with tabs (Recent, Favorites, All)
- 🕒 Timestamp for each saved link
- 💾 Local storage for saved links
- 🖼️ Favicon support for visual recognition
- 📋 Recent tab shows latest 10 links
- 🔄 Favorites tab for starred links
- 📚 All tab to view complete history
- 🔍 Real-time search across titles and URLs
- 📤 Export saved links as JSON
- 📥 Import links from backup file

Coming Soon:

- 📋 Right-click context menu integration
- 🔄 Sync across devices
- 📱 Mobile-friendly interface
- 🎨 Customizable themes


## Installation

### Development Setup

1. Clone the repository:

```bash
git clone https://github.com/yourusername/link-saver.git
cd link-saver
```

2. Load in Chrome/Brave:
   - Open Chrome/Brave
   - Go to `chrome://extensions` or `brave://extensions`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked"
   - Select the `link-saver` directory

### User Installation
- Coming soon to the Chrome Web Store

## Usage

1. Click the Link Saver icon in your browser toolbar
2. Click the + button to save the current page
3. View your saved links:
   - Recent: Shows latest 10 saved links
   - Favorites: Shows links marked with star
   - All: Shows complete link history
4. Manage your links:
   - Click any link to open it in a new tab
   - Click the star icon to add/remove from favorites
   - Click the trash icon to delete a link
   - Use the search box to filter links by title or URL
   - Click settings (...) to access Export/Import options
   - Export your links as JSON for backup
   - Import previously exported links

## Project Structure

```link-saver/README.md
link-saver/
├── icons/              # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── manifest.json       # Extension configuration
├── popup.html         # Main extension interface
├── popup.js          # Extension functionality
├── styles.css        # Extension styling
└── README.md         # This file
```

## Development

### Prerequisites
- Chrome or Brave browser
- Basic knowledge of HTML, CSS, and JavaScript
- Git for version control

### Local Development
1. Make changes to the files
2. Reload the extension in your browser
3. Test the changes

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with vanilla JavaScript
- Uses Chrome Extension Manifest V3
- Icons generated using custom icon generator
```


