# Blog CMS

> A modern, browser-based content management system for MDX blog posts. No backend required.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Made with React](https://img.shields.io/badge/Made%20with-React-61dafb)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)

Blog CMS is a lightweight, powerful content management system that runs entirely in your browser. Using the File System Access API, it provides direct read/write access to your local blog directory without needing a server, database, or complex setup.

## ✨ What's New

**🎨 Color Themes** - Customize your editing experience with 5 beautiful themes! Switch between Dark, Deep Blue, Midnight, Forest, and Monokai color schemes. All themes are carefully crafted with proper contrast ratios and support for all UI elements.

**🔤 Expanded Font Library** - Choose from 11 Google Fonts including new additions:
- **Monospace**: Noto Sans Mono, SUSE Mono, Xanh Mono
- **Serif**: Noto Serif, PT Serif

All fonts are organized by category in the settings dialog for easy selection.

## Features

### Core Functionality
- **Browser-Based** - No backend needed, runs entirely in your browser
- **File System Access** - Direct read/write to your local blog directory
- **MDX Support** - Full frontmatter and markdown support
- **Real-time Validation** - Instant feedback on required fields
- **Persistent Sessions** - Remembers your directory selection
- **Auto-Save** - Automatic saving after 2 seconds of inactivity

### Rich Text Editing
- **WYSIWYG Editor** - Powerful rich text editing with TipTap
- **Markdown Toolbar** - Quick access to formatting options
- **Code Blocks** - Syntax-highlighted code blocks
- **Images & Links** - Easy insertion of media and links
- **Keyboard Shortcuts** - Full keyboard support for efficient editing

### Customization
- **Color Themes** - Choose from 5 carefully crafted themes (Dark, Deep Blue, Midnight, Forest, Monokai)
- **Font Selection** - 11 Google Fonts including serif, sans-serif, and monospace options
- **Real-time Preview** - Changes apply instantly across the entire interface
- **Persistent Settings** - Your preferences are saved locally

### AI-Powered Features
- **AI Autocomplete** - Smart text suggestions powered by OpenAI
- **Writing Assistant** - Grammar, style, and syntax checking
- **Context-Aware** - Suggestions based on your post content
- **Toggle On/Off** - Enable/disable AI features as needed

### Image Management
- **Cloudinary Integration** - Upload images directly to Cloudinary
- **Drag & Drop** - Drag images into the editor
- **URL Generation** - Automatic markdown image syntax generation
- **Optimized Hosting** - CDN-backed image delivery

### Organization
- **Search & Filter** - Quickly find posts
- **Draft Mode** - Mark posts as drafts to exclude from publishing
- **Delete Posts** - Remove posts with confirmation dialog
- **Post List** - Browse all posts in a clean sidebar

## Browser Support

This CMS requires the File System Access API, currently supported in:

| Browser | Support |
|---------|---------|
| Chrome 86+ | ✅ |
| Edge 86+ | ✅ |
| Opera 72+ | ✅ |
| Safari | ❌ Not yet |
| Firefox | ⚠️ Behind flag |

## Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/blog-cms.git
cd blog-cms

# Install dependencies
pnpm install

# Copy environment template (optional - for AI features)
cp .env.example .env.local

# Start development server
pnpm dev
```

Visit `http://localhost:5173` and select your blog content directory to get started.

## Configuration

### Environment Variables

Create a `.env.local` file with the following optional configurations:

```bash
# OpenAI API Configuration (for AI autocomplete & writing assistant)
VITE_OPENAI_API_KEY=sk-your-api-key-here
VITE_OPENAI_MODEL=gpt-4o-mini  # Options: gpt-4o-mini, gpt-4o, gpt-3.5-turbo

# Cloudinary Configuration (for image uploads)
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=your-upload-preset
```

### Getting API Keys

**OpenAI**
1. Sign up at [platform.openai.com](https://platform.openai.com)
2. Navigate to API Keys section
3. Create a new API key
4. Add to `.env.local` as `VITE_OPENAI_API_KEY`

**Cloudinary**
1. Sign up at [cloudinary.com](https://cloudinary.com) (free tier available)
2. Copy your Cloud Name from the dashboard
3. Go to Settings → Upload → Add Upload Preset
4. Set Mode: Unsigned, Folder: blog-images (optional)
5. Copy the Preset Name and add both values to `.env.local`

You can also configure these settings directly in the app by clicking the Settings icon.

## Usage

### Getting Started

1. **Launch the CMS** - Open the app in a supported browser
2. **Select Directory** - Click "Open Directory" and choose your `content/blog` folder
3. **Grant Permission** - Allow read/write access when prompted
4. **Browse Posts** - See all your existing MDX posts in the sidebar
5. **Start Editing** - Click a post to edit or click "+" to create a new one

### Creating a New Post

1. Click the "+" button in the sidebar
2. Fill in the required metadata fields:
   - Title (required)
   - Date (required)
   - Description (required)
   - Author (required)
   - Tags (optional)
3. Write your content in the editor
4. Save with Ctrl+S / Cmd+S or click the Save button

The file will be automatically named based on your title (e.g., "My Post Title" → `my-post-title.mdx`).

### Using the Writing Assistant

1. Click the **ScanText** icon in the editor toolbar
2. The assistant will analyze your content for:
   - Grammar errors
   - Style improvements
   - Syntax issues
3. Click on any suggestion to:
   - View detailed explanation
   - Apply the fix automatically
   - Dismiss if not relevant

### Using AI Autocomplete

1. Enable by clicking the **Sparkles** (✨) icon in the toolbar
2. Type naturally and pause for ~500ms
3. AI suggestions appear in gray italic text
4. Press `Tab` to accept or `Escape` to dismiss

### Uploading Images

**Method 1: Drag & Drop**
- Drag an image file directly into the editor

**Method 2: Toolbar Button**
1. Click the image icon in the toolbar
2. Select an image file
3. Image is uploaded to Cloudinary
4. Markdown syntax is inserted automatically

**Method 3: URL**
- Use the image icon to insert an image from a URL

### Managing Drafts

1. **Mark as Draft**: Check the "Draft" checkbox in Post Metadata
2. **Draft Indicator**: Draft posts show a yellow "DRAFT" badge in the sidebar
3. **Filter Drafts**: Click the eye icon to show/hide draft posts
4. **Publishing**: Uncheck the "Draft" checkbox when ready to publish

### Deleting Posts

1. Click the trash icon next to a post in the sidebar
2. Confirm deletion in the dialog
3. The post file is permanently removed from your directory

### Customizing Your Experience

**Changing Color Themes:**
1. Click the Settings (gear) icon in the top toolbar
2. Scroll to the "Color Theme" section
3. Choose from 5 themes:
   - **Dark** - Default dark gray theme with blue accents
   - **Deep Blue** - Navy blue theme with softer blue accents
   - **Midnight** - Pure black theme for OLED displays
   - **Forest** - Dark green theme with emerald accents
   - **Monokai** - Classic Monokai editor theme with cyan accents
4. Changes apply instantly across the entire interface

**Changing Fonts:**
1. Open Settings dialog
2. Go to "Editor Font" dropdown
3. Choose from 11 fonts organized by category:
   - **System**: System Default
   - **Sans Serif**: Inter
   - **Serif**: Georgia, Merriweather, Noto Serif, PT Serif
   - **Monospace**: Monospace, IBM Plex Mono, Noto Sans Mono, SUSE Mono, Xanh Mono
4. Font changes apply immediately to the editor content

## Frontmatter Schema

All posts use YAML frontmatter at the top of the MDX file:

```yaml
---
title: Your Post Title          # Required
date: 2024-01-15               # Required (YYYY-MM-DD)
description: Brief summary      # Required
author: Author Name            # Required
tags:                          # Optional
  - javascript
  - react
draft: false                   # Optional (true/false)
---
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+S` / `Cmd+S` | Save current post |
| `Tab` | Accept AI suggestion |
| `Escape` | Dismiss AI suggestion |
| `Ctrl+B` / `Cmd+B` | Bold text |
| `Ctrl+I` / `Cmd+I` | Italic text |
| `Ctrl+Z` / `Cmd+Z` | Undo |
| `Ctrl+Shift+Z` / `Cmd+Shift+Z` | Redo |

## Project Structure

```
blog-cms/
├── src/
│   ├── components/
│   │   ├── DeleteConfirmDialog.tsx    # Delete confirmation modal
│   │   ├── Editor.tsx                 # TipTap WYSIWYG editor
│   │   ├── FileManager.tsx            # Sidebar with post list
│   │   ├── FrontmatterForm.tsx        # Metadata form
│   │   ├── ImageUploadDialog.tsx      # Image upload modal
│   │   ├── ReviewDialog.tsx           # Writing review modal
│   │   ├── SettingsDialog.tsx         # Settings configuration
│   │   ├── Toast.tsx                  # Toast notifications
│   │   └── WritingSuggestionTooltip.tsx  # Suggestion tooltip
│   ├── extensions/
│   │   ├── AutocompleteExtension.ts   # AI autocomplete logic
│   │   ├── ImageUploadExtension.ts    # Image upload handling
│   │   └── WritingAssistantExtension.ts  # Writing assistant logic
│   ├── lib/
│   │   ├── ai-completion.ts           # OpenAI integration
│   │   ├── cloudinary.ts              # Cloudinary integration
│   │   ├── file-system.ts             # File System Access API wrapper
│   │   ├── mdx-parser.ts              # MDX parsing utilities
│   │   ├── sentence-utils.ts          # Text parsing utilities
│   │   ├── settings.ts                # Settings management
│   │   └── writing-assistant-storage.ts  # Suggestion caching
│   ├── types/
│   │   ├── cloudinary.ts              # Cloudinary types
│   │   ├── tiptap.d.ts                # TipTap types
│   │   └── writing-assistant.ts       # Writing assistant types
│   ├── App.tsx                        # Main application
│   ├── main.tsx                       # Entry point
│   └── index.css                      # Global styles
├── public/                            # Static assets
├── .env.example                       # Environment template
├── index.html                         # HTML entry
├── package.json                       # Dependencies
├── tailwind.config.js                 # Tailwind configuration
├── tsconfig.json                      # TypeScript configuration
└── vite.config.ts                     # Vite configuration
```

## Technology Stack

| Category | Technology |
|----------|-----------|
| Framework | Vite + React + TypeScript |
| Editor | TipTap (ProseMirror) |
| Styling | Tailwind CSS |
| Parsing | gray-matter (frontmatter), marked (markdown) |
| Icons | Lucide React |
| Fonts | Google Fonts |
| AI | OpenAI API |
| Images | Cloudinary |
| Storage | IndexedDB (directory handle persistence) |

## Security & Privacy

The File System Access API is secure by design:

- ✅ Requires explicit user permission for each directory
- ✅ Only accesses directories you explicitly grant
- ✅ No automatic access to system files
- ✅ Permissions can be revoked at any time
- ✅ Works completely offline (except AI features)

**AI Features Privacy:**
- When AI features are enabled, your text context is sent to OpenAI's API
- Only the last 1000 characters are sent for autocomplete
- All AI features can be disabled at any time
- No data is stored on external servers (except during API calls)

## Deployment

The CMS can be deployed to any static hosting service:

### Vercel

```bash
npm i -g vercel
vercel
```

Or connect your GitHub repository in the Vercel dashboard for automatic deployments.

### Netlify

```bash
npm i -g netlify-cli
pnpm build
netlify deploy --prod --dir=dist
```

### GitHub Pages

```bash
pnpm build
# Deploy the dist/ folder to GitHub Pages
```

### Other Platforms

Works with any static host: Cloudflare Pages, Firebase Hosting, AWS S3 + CloudFront, Render, Railway, etc.

**Note:** Remember to set environment variables in your hosting provider's dashboard if using AI or image upload features.

## Development

```bash
# Start dev server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Type check
pnpm tsc --noEmit

# Lint
pnpm eslint src/
```

## Troubleshooting

### "Browser Not Supported" message
Use Chrome, Edge, or Opera. Safari and Firefox don't fully support the File System Access API yet.

### Changes not saving
Ensure you granted "readwrite" permission when selecting the directory. You may need to re-select the directory.

### Post not appearing in list
- Ensure the file ends with `.mdx` or `.md`
- Verify the file has valid YAML frontmatter
- Check that all required fields are present

### AI autocomplete not working
- Verify `VITE_OPENAI_API_KEY` is set in `.env.local`
- Restart the dev server after adding environment variables
- Check browser console for API errors
- Ensure the sparkles icon is highlighted (enabled)
- Check your OpenAI API quota and billing

### Image upload not working
- Verify Cloudinary credentials are set (either in `.env.local` or Settings)
- Check that the upload preset is set to "Unsigned" mode
- Verify your Cloudinary account is active

### Permission errors on macOS/Windows
If you see "Permission Denied" errors, try:
- Re-selecting the directory
- Checking that the directory isn't in a protected system location
- Ensuring no other application has locked the files

## Roadmap

- [ ] Support for multiple content directories
- [ ] Bulk operations (batch edit, delete)
- [ ] Image optimization and resizing
- [ ] Spell check
- [ ] Word count and reading time
- [ ] Export to different formats
- [x] Themes and customization
- [ ] Plugin system

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [TipTap](https://tiptap.dev/) - The headless editor framework
- Powered by [OpenAI](https://openai.com/) - AI completions and writing assistance
- Images hosted on [Cloudinary](https://cloudinary.com/) - Media management platform
- Icons from [Lucide](https://lucide.dev/) - Beautiful icon library
- Fonts from [Google Fonts](https://fonts.google.com/) - Open source font library

## Support

- Report issues on [GitHub Issues](https://github.com/yourusername/blog-cms/issues)
- Read the [Quick Start Guide](QUICKSTART.md) for common questions
- Check [Contributing Guide](CONTRIBUTING.md) for development setup

---

Made with ❤️ by [Nickolus Cunningham](https://github.com/yourusername) and contributors.
