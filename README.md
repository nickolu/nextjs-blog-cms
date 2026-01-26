# Blog CMS

A lightweight, browser-based CMS for managing MDX blog posts. Runs entirely client-side using the File System Access API - no server required!

## Features

- ✅ **Browser-Based** - No backend needed, runs entirely in your browser
- ✅ **File System Access** - Direct read/write to your local blog directory
- ✅ **WYSIWYG Editor** - Rich text editing with TipTap
- ✅ **AI Autocomplete** - Smart text suggestions powered by OpenAI
- ✅ **MDX Support** - Full frontmatter and markdown support
- ✅ **Real-time Validation** - Instant feedback on required fields
- ✅ **Draft Mode** - Mark posts as drafts to exclude from publishing
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

# Set up environment (optional - for AI autocomplete)
cp .env.example .env.local
# Edit .env.local and add your OpenAI API key

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
- **draft** (optional) - Boolean flag to mark post as draft

## File Structure

```
your-project/
├── blog-cms/                    # CMS application
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
└── my-nextjs-blog/              # Your Next.js blog (or any static site)
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

## Draft Mode

The CMS includes a draft mode feature that allows you to work on posts without publishing them:

### Usage

1. **Mark as Draft**: Check the "Draft" checkbox at the top of the Post Metadata section
2. **Draft Indicator**: Draft posts show a yellow "DRAFT" badge in the sidebar
3. **Filter Drafts**: Click the eye icon in the sidebar header to show/hide draft posts
4. **Publishing**: Uncheck the "Draft" checkbox when ready to publish

### How It Works

- When a post is marked as draft, `draft: true` is added to the frontmatter
- Draft posts can be hidden from the post list by clicking the eye icon
- The draft flag is automatically removed from the frontmatter when unchecked
- Your static site generator can filter out draft posts during build

## AI Autocomplete

The CMS includes AI-powered autocomplete to help you write faster:

### Setup

1. Get an OpenAI API key from https://platform.openai.com/api-keys
2. Copy `.env.example` to `.env.local`
3. Add your API key to `.env.local`:
   ```
   VITE_OPENAI_API_KEY=sk-your-key-here
   ```
4. Restart the dev server

### Usage

- **Enable/Disable**: Click the sparkles (✨) icon in the toolbar
- **Get Suggestions**: Type naturally, pause for ~500ms to see AI suggestions in gray italic text
- **Accept**: Press `Tab` to accept the suggestion
- **Dismiss**: Press `Escape` or keep typing to dismiss

### Features

- Context-aware suggestions based on your post title, description, and previous text
- Smart caching to reduce API costs
- Non-intrusive - only shows after you pause typing
- Works completely offline when disabled

### Privacy

When AI autocomplete is enabled, your text context (last 1000 characters) is sent to OpenAI's API. The feature can be disabled at any time by clicking the sparkles icon.

## Keyboard Shortcuts

- `Ctrl+S` / `Cmd+S` - Save current post
- `Tab` - Accept AI suggestion (when visible)
- `Escape` - Dismiss AI suggestion (when visible)
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

### AI autocomplete not working

- Make sure you've set `VITE_OPENAI_API_KEY` in `.env.local`
- Restart the dev server after adding environment variables
- Check browser console for any API errors
- Ensure the sparkles (✨) icon in the toolbar is highlighted (enabled)

## Development

```bash
# Start dev server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Deployment

The CMS can be deployed to any static hosting service. Since it runs entirely in the browser and requires the File System Access API, users will need to grant permission to their local blog directory.

### Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Or connect your GitHub repository in the Vercel dashboard for automatic deployments.

### Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build and deploy
pnpm build
netlify deploy --prod --dir=dist
```

Or connect your GitHub repository in the Netlify dashboard.

### GitHub Pages

1. Build the project:
   ```bash
   pnpm build
   ```

2. Deploy the `dist` folder to GitHub Pages using GitHub Actions or manually.

3. Example GitHub Actions workflow (`.github/workflows/deploy.yml`):
   ```yaml
   name: Deploy to GitHub Pages
   
   on:
     push:
       branches: [ main ]
   
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: pnpm/action-setup@v2
           with:
             version: 10.10.0
         - uses: actions/setup-node@v4
           with:
             node-version: '20'
             cache: 'pnpm'
         - run: pnpm install
         - run: pnpm build
         - uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./dist
   ```

### Other Static Hosts

The CMS works with any static hosting provider. Just build and deploy the `dist` folder:
- Cloudflare Pages
- Firebase Hosting
- AWS S3 + CloudFront
- Render
- Railway

### Environment Variables

If you're using AI autocomplete features, make sure to set your environment variables in your hosting provider's dashboard:
- `VITE_OPENAI_API_KEY` - Your OpenAI API key
- `VITE_OPENAI_MODEL` - (Optional) Model selection

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## License

MIT - see [LICENSE](LICENSE) for details.
