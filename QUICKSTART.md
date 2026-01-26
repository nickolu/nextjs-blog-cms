# Quick Start Guide

## Running the CMS

### Development Mode

```bash
cd ~/git/personal/blog-cms
pnpm dev
```

Then open http://localhost:5173 in Chrome, Edge, or Opera.

### Production Build

```bash
pnpm build
pnpm preview
```

## First Time Setup

1. **Open the CMS** in your browser
2. **Click "Open Directory"**
3. **Navigate to and select** your blog's content directory (e.g., `~/my-blog/content/blog`)
4. **Grant permissions** when prompted (select "View files" and "Save changes")
5. You'll see all your existing blog posts in the sidebar!

## Using the CMS

### View Existing Posts

- All posts appear in the left sidebar
- Posts are sorted by date (newest first)
- Use the search box to filter by title, description, or tags
- Click any post to open it in the editor

### Edit a Post

1. Click a post in the sidebar
2. Edit the metadata (title, date, description, author, tags) in the top section
3. Edit the content using the WYSIWYG editor
4. Click "Save" or press `Ctrl+S` (Mac: `Cmd+S`)
5. Done! The file is updated immediately

### Create a New Post

1. Click the "+" button in the sidebar
2. Fill in the metadata fields
3. Write your content
4. Click "Save" 
5. A new `.mdx` file will be created automatically with a slug based on the title

### Editor Features

The toolbar provides:
- **Bold** and *Italic* formatting
- **Headings** (H1, H2, H3)
- **Lists** (bullet and numbered)
- **Code blocks** with syntax highlighting
- **Links** and **Images**
- **Undo/Redo**

### Tips

- The CMS remembers your selected directory (stored in IndexedDB)
- Changes are saved directly to your MDX files - no sync needed!
- Use `Ctrl+S` / `Cmd+S` to save quickly
- All standard Markdown is supported
- The editor converts your formatting to proper MDX automatically

## Testing Your Changes

After saving in the CMS:

1. Go back to your main blog directory
2. Run your blog's dev server (e.g., `npm run dev` or `pnpm dev`)
3. Visit your blog in the browser
4. Your changes will be live immediately!

## Browser Requirements

✅ **Chrome 86+**  
✅ **Edge 86+**  
✅ **Opera 72+**  

❌ Safari (File System Access API not yet supported)  
❌ Firefox (behind experimental flag)

## Troubleshooting

### Can't see any posts

- Make sure you selected the correct directory containing your MDX/MD files
- Check that you granted "readwrite" permissions

### Changes not saving

- Verify you have write permissions to the directory
- Check the browser console for errors

### Editor looks broken

- Clear your browser cache
- Make sure you're using a supported browser
- Try running `pnpm install` again in the blog-cms directory

## Next Steps

- Try creating a new blog post!
- Edit one of your existing posts
- Experiment with the WYSIWYG editor features
- Check your changes in your blog's dev server

Enjoy your new CMS! 🎉
