# Blog CMS

A lightweight, browser-based CMS for managing MDX blog posts. Runs entirely client-side using the File System Access API - no server required!

## Features

- ✅ **Browser-Based** - No backend needed, runs entirely in your browser
- ✅ **File System Access** - Direct read/write to your local blog directory
- ✅ **WYSIWYG Editor** - Rich text editing with TipTap
- ✅ **MDX Support** - Full frontmatter and markdown support
- ✅ **Real-time Validation** - Instant feedback on required fields
- ✅ **Search & Filter** - Quickly find posts
- ✅ **Keyboard Shortcuts** - Save with Ctrl+S / Cmd+S
- ✅ **Persistent Sessions** - Remembers your directory selection

## Browser Support

This CMS requires the File System Access API, currently supported in:

- ✅ Chrome 86+
- ✅ Edge 86+
- ✅ Opera 72+
- ❌ Safari (not yet)
- ❌ Firefox (behind flag)

## Getting Started

### Installation

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build
```

### Usage

1. **Open the CMS** - Navigate to `http://localhost:5173` (or your build URL)
2. **Select Directory** - Click "Open Directory" and choose your `content/blog` folder
3. **Browse Posts** - See all your existing MDX posts in the sidebar
4. **Edit or Create** - Click a post to edit, or click "+" to create a new one
5. **Make Changes** - Edit the metadata and content using the WYSIWYG editor
6. **Save** - Click "Save" or press Ctrl+S / Cmd+S
7. **Done!** - Changes are written directly to your MDX files

## Frontmatter Fields

The CMS supports the following frontmatter fields:

- **title** (required) - Post title
- **date** (required) - Publication date (YYYY-MM-DD)
- **description** (required) - Brief description for SEO
- **author** (required) - Author name
- **tags** (optional) - Array of tags

## File Structure

```
~/git/personal/
├── blog-cms/                    # CMS application (sibling to main site)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Editor.tsx          # TipTap WYSIWYG editor
│   │   │   ├── FileManager.tsx     # Sidebar with post list
│   │   │   └── FrontmatterForm.tsx # Metadata form
│   │   ├── lib/
│   │   │   ├── file-system.ts      # File System Access API wrapper
│   │   │   └── mdx-parser.ts       # MDX parsing utilities
│   │   ├── App.tsx                 # Main application
│   │   └── main.tsx                # Entry point
│   ├── index.html
│   ├── package.json
│   └── README.md
└── cunningjams.com/             # Main website
    └── content/
        └── blog/                # Blog posts directory
```

## Technology Stack

- **Framework**: Vite + React + TypeScript
- **Editor**: TipTap (WYSIWYG)
- **Styling**: Tailwind CSS
- **Parsing**: gray-matter (MDX frontmatter)
- **Icons**: Lucide React
- **Storage**: IndexedDB (for directory handle persistence)

## Keyboard Shortcuts

- `Ctrl+S` / `Cmd+S` - Save current post
- `Ctrl+B` / `Cmd+B` - Bold (in editor)
- `Ctrl+I` / `Cmd+I` - Italic (in editor)

## Security

The File System Access API is secure:

- ✅ Requires explicit user permission
- ✅ Only accesses directories you explicitly grant
- ✅ No network requests needed
- ✅ Works completely offline
- ✅ Can't accidentally access system files

## Troubleshooting

### "Browser Not Supported" message

Use Chrome, Edge, or Opera. Safari and Firefox don't yet support the File System Access API.

### Changes not saving

Make sure you granted "readwrite" permission when selecting the directory.

### Post not appearing in list

Ensure the file ends with `.mdx` or `.md` and has valid frontmatter.

## Development

```bash
# Start dev server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## License

MIT

## Author

Built for cunningjams.com
