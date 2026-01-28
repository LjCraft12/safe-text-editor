# Safe Text Editor

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue.svg" alt="Version">
  <img src="https://img.shields.io/badge/license-Proprietary-red.svg" alt="Proprietary">
  <img src="https://img.shields.io/badge/vanilla-JavaScript-yellow.svg" alt="Vanilla JS">
  <img src="https://img.shields.io/badge/frameworks-none-orange.svg" alt="No Frameworks">
</p>

<p align="center">
  A powerful, feature-rich text editor built with pure HTML, CSS, and JavaScript.<br>
  No frameworks required.
</p>

---

## 📋 Table of Contents

- [Features](#-features)
- [Getting Started](#-getting-started)
- [Usage Guide](#-usage-guide)
- [Keyboard Shortcuts](#-keyboard-shortcuts)
- [Customization](#-customization)
- [Themes](#-themes)
- [Auto-Save](#-auto-save)
- [Document Management](#-document-management)
- [Flags & Organization](#-flags--organization)
- [Settings](#-settings)
- [Browser Support](#-browser-support)
- [File Structure](#-file-structure)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### Core Editor Features
- **Rich Text Editing** - Full WYSIWYG editing with live preview
- **Text Formatting** - Bold, italic, underline, strikethrough, subscript, superscript
- **Paragraph Styles** - Headings (H1-H4), paragraphs, blockquotes, code blocks
- **Font Controls** - Multiple font families and sizes (8pt - 36pt)
- **Colors** - Text color and highlight/background color
- **Text Alignment** - Left, center, right, and justify
- **Lists** - Bullet lists and numbered lists with indentation controls
- **Insert Elements** - Links, images, tables, and horizontal rules
- **Clear Formatting** - Remove all formatting with one click

### Document Management
- **Auto-Save** - Configurable automatic saving (time, words, or characters)
- **Manual Save** - Save documents with Ctrl+S or the Save button
- **Document Sidebar** - View and manage all saved documents
- **Folders** - Organize documents into folders
- **Document Flags** - Color-coded flags for prioritization
- **Search & Filter** - Find documents quickly

### Themes & Appearance
- **15+ Built-in Themes** - From professional to creative
- **7 Animated Themes** - Dynamic backgrounds with customizable animations
- **Light/Dark Mode** - Three-way toggle (Light / Theme / Dark)
- **Customizable Animations** - Adjust speed, intensity, and effects
- **Theme Tooltips** - Preview theme colors and details on hover

### Customization
- **Customizable Toolbar** - Show/hide individual tools
- **Customizable Status Bar** - Toggle word count, character count, reading time, flags
- **Resizable Sidebar** - Drag to resize the document panel
- **Collapsible Sections** - Accordion-style document organization
- **Floating Document Bar** - Minimize to a draggable bubble

### Writing Tools
- **Spell Check** - Browser-native spell checking
- **Autocorrect** - Automatic typo correction with built-in rules
- **Custom Dictionary** - Add your own words and autocorrect rules
- **Word Count** - Real-time word and character counting
- **Reading Time** - Estimated reading time calculation

### Advanced Features
- **Undo/Redo** - Full edit history with keyboard shortcuts
- **Custom Flags** - Create your own flags with custom colors and descriptions
- **Flag Tooltips** - Hover to see flag descriptions
- **Toast Notifications** - Configurable popup notifications
- **Modal Behavior Settings** - Customize how modals open and close
- **Default Load Action** - Choose what happens when the app opens
- **Reset to Defaults** - Clear all data with a detailed confirmation

### Help & Documentation
- **Interactive Documentation** - Searchable help system with 12 sections
- **Step-by-Step Guides** - Learn every feature
- **Keyboard Shortcut Reference** - Quick access to all shortcuts
- **About Modal** - App information and version

---

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- No server required - runs entirely in the browser

### Installation

1. **Clone or Download**
   ```bash
   git clone https://github.com/yourusername/safe-text-editor.git
   ```
   Or download the ZIP file and extract it.

2. **Open the Editor**
   Simply open `index.html` in your web browser:
   ```bash
   open index.html
   ```
   Or double-click the file in your file explorer.

3. **Start Writing!**
   The editor is ready to use immediately. Your documents are saved locally in your browser's storage.

### No Build Process Required
This editor is built with vanilla HTML, CSS, and JavaScript. There's no npm, no webpack, no build step - just open and use!

---

## 📖 Usage Guide

### Creating a Document
1. Click in the editor area and start typing
2. Click "Untitled Document" at the top to rename your document
3. Press `Ctrl + S` or click **Save** to save your work

### Opening a Document
1. Look at the **Document Bar** on the left
2. Click on any document name to open it
3. The current document is highlighted

### Formatting Text
1. Select the text you want to format
2. Use the toolbar buttons or keyboard shortcuts
3. Multiple formats can be combined (e.g., bold + italic)

### Using the Toolbar
The toolbar contains all formatting options organized into groups:
- **History**: Undo, Redo
- **Text Formatting**: Bold, Italic, Underline, Strikethrough, Subscript*, Superscript*
- **Paragraph**: Format dropdown, Font family, Font size
- **Colors**: Text color, Highlight color
- **Alignment**: Left, Center, Right, Justify
- **Lists**: Bullet list, Numbered list, Indent, Outdent
- **Insert**: Link, Image, Table, Horizontal rule
- **Utilities**: Clear formatting, Spell check

*Subscript and Superscript are disabled by default. Enable them in View → Customize Toolbar.

---

## ⌨️ Keyboard Shortcuts

### Essential
| Shortcut | Action |
|----------|--------|
| `Ctrl + S` | Save document |
| `Ctrl + Z` | Undo |
| `Ctrl + Y` | Redo |
| `Ctrl + A` | Select all |

### Formatting
| Shortcut | Action |
|----------|--------|
| `Ctrl + B` | Bold |
| `Ctrl + I` | Italic |
| `Ctrl + U` | Underline |

### Clipboard
| Shortcut | Action |
|----------|--------|
| `Ctrl + C` | Copy |
| `Ctrl + X` | Cut |
| `Ctrl + V` | Paste |

---

## 🎨 Customization

### Customize Toolbar
Go to **View → Customize Toolbar** to:
- Enable/disable individual toolbar buttons
- Use "Toggle All" to show/hide everything
- Reset to default configuration

### Customize Editor (Status Bar)
Go to **View → Customize Editor** to toggle:
- Word Count
- Character Count
- Document Flag
- Estimated Reading Time

### Resizing the Document Bar
- Drag the thin pill-shaped handle on the edge of the sidebar
- Resize from minimum width to up to 50% of the viewport
- The document list switches between list and grid view automatically

### Floating Document Bar
- Click the hamburger menu (☰) to collapse the sidebar
- The button becomes a draggable floating bubble
- Drag it anywhere on screen
- Right-click for options
- Click to reopen the sidebar

---

## 🎭 Themes

### Basic Themes (10)
| Theme | Description |
|-------|-------------|
| Default Blue | Clean, professional blue theme |
| Forest Green | Nature-inspired green tones |
| Sunset Orange | Warm orange and coral colors |
| Royal Purple | Elegant purple accents |
| Ocean Teal | Cool, calming teal |
| Rose Pink | Soft, gentle pink tones |
| Slate Gray | Modern, neutral gray |
| Midnight | Deep, dark theme |
| Lavender Dream | Soft purple pastels |
| Coral Reef | Vibrant coral and teal |

### Animated Themes (7)
| Theme | Animation |
|-------|-----------|
| Aurora Borealis | Northern lights color shifts |
| Ocean Wave | Flowing water effects |
| Sunset Glow | Warm gradient transitions |
| Neon Pulse | Cyberpunk glowing borders |
| Galaxy Sparkle | Twinkling stars in space |
| Enchanted Forest | Sunbeams and mist |
| Candy Swirl | Playful pink gradients |

### Customizing Animated Themes
Right-click any animated theme to customize:
- Animation speed
- Effect intensity
- Star density (Galaxy)
- Wave height (Ocean)
- Glow intensity (Neon)
- And more...

### Switching Themes
1. Go to **View → Theme**
2. Browse **Basic** or **Animated** tabs
3. Click a theme to preview it live
4. Click **Save** to keep your selection
5. Click **Cancel** to revert

### Light / Theme / Dark Mode
Use the three-way toggle in the header:
- ☀️ **Light Mode** - Always light
- 🎨 **Theme Mode** - Use selected theme colors
- 🌙 **Dark Mode** - Always dark (overrides theme)

---

## 💾 Auto-Save

### Enabling Auto-Save
1. Go to **Settings** menu
2. Toggle **Auto Save** on/off

### Configuring Auto-Save
Go to **Settings → Advanced Settings** to configure:

| Setting | Description |
|---------|-------------|
| Interval | How often to auto-save |
| Unit | Minutes, seconds, words typed, characters typed, or changes made |
| Auto-Save Limit | Maximum number of auto-saves to keep (default: 3) |
| Auto-Delete | Automatically delete old auto-saves after X days |

### Auto-Save vs Manual Save
| Feature | Auto-Save | Manual Save |
|---------|-----------|-------------|
| Location | Auto-Saved section | Saved Documents section |
| Retention | Limited by count | Kept until deleted |
| Auto-Delete | Can be auto-deleted | Never auto-deleted |

When you manually save an auto-saved document, it's promoted to Saved Documents.

### Expiring Auto-Saves Warning
When auto-saves are about to be deleted (within 24 hours), a warning modal appears on app load with options to:
- **Keep** - Move to Saved Documents
- **Delete** - Remove permanently

---

## 📁 Document Management

### Document Bar Sections
The sidebar is organized into collapsible sections:
1. **Saved Documents** - Manually saved documents
2. **Folders** - Your custom folders
3. **Auto-Saved** - Automatic backups

### Creating Folders
1. Click the **+** button in the sidebar header
2. Select **New Folder**
3. Enter a folder name
4. Click **Create**

### Moving Documents to Folders
1. Right-click on a document
2. Select **Move To...**
3. Choose the destination folder

### Opening Folders
- Double-click a folder to view its contents
- Click **Back** to return to the main view

### Document Context Menu
Right-click any document for options:
- **Move To...** - Move to a folder
- **Copy** - Duplicate the document
- **Delete** - Remove the document

---

## 🚩 Flags & Organization

### Built-in Flags
| Flag | Color | Purpose |
|------|-------|---------|
| None | — | No flag |
| Urgent | 🔴 Red | Requires immediate attention |
| Important | 🟠 Orange | High priority |
| Review | 🟡 Yellow | Needs to be checked |
| Complete | 🟢 Green | Finished and ready |
| In Progress | 🔵 Blue | Currently being worked on |
| Ideas | 🟣 Purple | Brainstorming or concepts |

### Setting a Flag
1. Go to **View → Flags**
2. Hover to see the submenu
3. Click a flag to apply it

### Custom Flags
1. Go to **View → Flags → Add Custom Flag**
2. Enter a name (max 30 characters)
3. Choose a color (presets or custom)
4. Add a description (max 100 characters)
5. Click **Create Flag**

### Flag Border
When a flag is set, a colored border appears around the editor. Configure in **Advanced Settings → Document Flags**:
- Toggle border on/off
- Adjust border width (1-10px)

---

## ⚙️ Settings

### Settings Menu
Access via the **Settings** button in the header:
- **Auto Save** - Toggle auto-save on/off
- **Advanced Settings** - Open detailed configuration

### Advanced Settings

#### File Settings
- Auto-save interval and unit
- Auto-save document limit
- Auto-delete after X days

#### Notifications
- Toast notification master toggle
- Individual notification toggles

#### Document Flags
- Flag border toggle
- Border width slider

#### Modal Behavior
- Click outside action (Do Nothing / Close & Cancel / Close & Save)
- Save behavior (Save & Close / Save Only)

#### Default Load Action
Choose what happens when the app opens:
- Load New Document
- Load Last Saved Document
- Load Last Auto-Save
- Show Warnings
- Do Nothing (clean state)

### Toast Notifications
Control which notifications appear:
- Auto-save notifications
- Document saved
- Document deleted
- Theme changes
- Settings changes
- Spell check
- Document bar

### Reset to Defaults
Click the reset button (↺) in the header to:
- Clear all documents
- Reset all settings
- Remove custom flags
- Clear themes and preferences

A two-tier confirmation shows exactly what will be deleted.

---

## 🌐 Browser Support

| Browser | Support |
|---------|---------|
| Chrome | ✅ Full support |
| Firefox | ✅ Full support |
| Safari | ✅ Full support |
| Edge | ✅ Full support |
| Opera | ✅ Full support |
| IE 11 | ❌ Not supported |

### Storage
The editor uses `localStorage` for all data:
- Documents and auto-saves
- Settings and preferences
- Themes and customizations
- Custom flags and dictionaries

**Note**: Data is stored locally in your browser. Clearing browser data will delete all saved documents.

---

## 📂 File Structure

```
safe-text-editor/
├── index.html          # Main HTML file
├── styles.css          # All styles (4600+ lines)
├── script.js           # All JavaScript (7500+ lines)
├── README.md           # This file
├── FEATURE_IDEAS.md    # Feature documentation
└── EDITOR_TOOLS.md     # Toolbar tools reference
```

### No Dependencies
- No npm packages
- No build tools
- No external JavaScript libraries
- Only external resource: Font Awesome icons (CDN)

---

## 🤝 Contributing

We welcome feedback and feature requests! Here's how you can help improve Safe Text Editor:

### Feature Requests
Have an idea for a new feature? We'd love to hear it!
1. Check `FEATURE_IDEAS.md` to see if it's already planned
2. Open an issue describing your feature request
3. Include as much detail as possible about the use case

### Bug Reports
Found a bug? Please report it!
1. Describe the issue in detail
2. Include steps to reproduce
3. Mention your browser and operating system

### Important Notice
**This software is proprietary.** Cloning, forking, redistributing, or using this code without explicit permission is strictly prohibited. Please contact the author for licensing inquiries.

---

## 📄 License

**All Rights Reserved.**

This software is proprietary and confidential. Unauthorized copying, distribution, modification, public display, or public performance of this software is strictly prohibited.

You may NOT:
- Clone or fork this repository
- Copy, modify, or distribute the source code
- Use this software for commercial or personal projects
- Reverse engineer or decompile the software

For licensing inquiries, feature requests, or permission requests, please contact the author.

© 2026 Safe Text Editor. All rights reserved.

---

## 🙏 Acknowledgments

- [Font Awesome](https://fontawesome.com/) for icons
- All contributors and testers

---

<p align="center">
  Made with ❤️ using vanilla HTML, CSS, and JavaScript
</p>

<p align="center">
  <strong>Safe Text Editor</strong> - Your words, safely stored.
</p>
