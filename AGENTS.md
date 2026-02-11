# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a browser-based CMS for managing MDX blog posts, designed to work with Next.js blogs (or any static site generator). It runs entirely client-side using the File System Access API - no backend required. Users open their Next.js blog's `content/blog` directory in the browser, and the CMS reads/writes MDX files directly to their local filesystem.

**Key Concept**: This is NOT a Next.js application itself. It's a standalone Vite + React app that EDITS blog posts FOR a Next.js app. The target Next.js blog must have MDX support configured (e.g., using `@next/mdx` or similar) to consume the `.mdx` files this CMS creates/edits.

## Common Commands

### Development
```bash
# Install dependencies (uses pnpm)
pnpm install

# Start dev server (runs on http://localhost:5173)
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

### Type Checking
```bash
# Run TypeScript compiler in check mode
tsc --noEmit
```

### Important Notes
- **No test suite exists** - this project relies on manual testing in Chrome/Edge/Opera
- **No linting scripts** - code style is enforced manually via TypeScript strict mode
- The build command (`pnpm build`) runs `tsc && vite build`, so type errors will fail the build

## Architecture

### Core Technology Stack
- **Vite**: Build tool and dev server
- **React 19 + TypeScript**: UI framework with strict type checking
- **TipTap**: WYSIWYG rich text editor (ProseMirror-based)
- **Tailwind CSS**: Utility-first styling
- **File System Access API**: Browser API for reading/writing local files (Chrome 86+, Edge 86+, Opera 72+ only)
- **IndexedDB**: Persists directory handle between sessions
- **OpenAI API**: Optional AI autocomplete and writing review features

### Key Architectural Patterns

#### State Management
All state is managed via React `useState` in `App.tsx`. No external state management library. The main app state includes:
- `directoryHandle`: FileSystemDirectoryHandle for the selected blog directory
- `posts`: Array of BlogPost objects loaded from directory
- `selectedPost`: Currently open post
- `frontmatter` + `body`: Separated content for editing
- `isNewPost`: Flag to distinguish save vs. create operations

#### File System Integration
The File System Access API workflow:
1. User clicks "Open Directory" → `window.showDirectoryPicker()` prompts for directory
2. Directory handle is stored in IndexedDB via `lib/file-system.ts`
3. On subsequent visits, app checks for saved handle and requests permission if needed
4. All file operations go through `lib/file-system.ts` wrapper functions

**Critical**: Permission state can be lost (browser restart, etc.). The app handles this by detecting saved handles without permission and prompting user to restore access.

#### Content Processing Pipeline
1. **Reading**: `.mdx` file → `gray-matter` parses frontmatter/body → `marked` converts markdown to HTML → TipTap displays HTML
2. **Writing**: TipTap HTML → `turndown` converts to markdown → `gray-matter` serializes with frontmatter → write to `.mdx` file

The conversion happens in `Editor.tsx` (HTML ↔ markdown) and `lib/mdx-parser.ts` (MDX ↔ frontmatter/body).

#### AI Features
AI autocomplete is implemented as a TipTap extension (`extensions/AutocompleteExtension.ts`):
- Watches cursor position and text changes
- Debounces requests (500ms default)
- Shows suggestions as gray italic decorations
- Tab to accept, Escape to dismiss
- Caching prevents duplicate API calls

Settings stored in localStorage via `lib/settings.ts` control:
- AI enabled/disabled state
- Model selection (gpt-4o-mini, gpt-5-nano, etc.)
- Custom system prompt

### File Structure Context

**Core Application**:
- `App.tsx`: Main component, orchestrates all state and file operations
- `main.tsx`: Entry point, renders App

**Components** (`src/components/`):
- `Editor.tsx`: TipTap editor with toolbar, markdown ↔ HTML conversion
- `FileManager.tsx`: Sidebar showing post list, search, draft filtering
- `FrontmatterForm.tsx`: Form for editing post metadata (title, date, description, author, tags, draft)
- `SettingsDialog.tsx`: Modal for AI settings (model, system prompt)
- `ReviewDialog.tsx`: Modal for AI writing review and rewrite features

**Libraries** (`src/lib/`):
- `file-system.ts`: File System Access API wrapper (open, read, write, list, IndexedDB persistence)
- `mdx-parser.ts`: MDX parsing/serialization, frontmatter validation, slug generation
- `ai-completion.ts`: OpenAI integration for autocomplete, review, and rewrite
- `settings.ts`: localStorage-based settings management

**Extensions** (`src/extensions/`):
- `AutocompleteExtension.ts`: TipTap plugin for AI autocomplete with decorations

### MDX Frontmatter Schema
```yaml
title: string (required)
date: YYYY-MM-DD (required)
description: string (required)
author: string (required, default: "Nickolus Cunningham")
tags: string[] (optional)
draft: boolean (optional, removed from frontmatter if false)
```

Validation is in `lib/mdx-parser.ts:validateFrontmatter()`.

## Environment Variables

Optional AI features require OpenAI API key:

```bash
# Copy example file
cp .env.example .env.local

# Add your key
VITE_OPENAI_API_KEY=sk-your-key-here
VITE_OPENAI_MODEL=gpt-4o-mini  # Optional
```

**Important**: Must restart dev server after changing `.env.local` (Vite only loads env vars on startup).

## Browser Compatibility

**File System Access API is REQUIRED** - only works in:
- ✅ Chrome 86+
- ✅ Edge 86+
- ✅ Opera 72+
- ❌ Safari (not supported)
- ❌ Firefox (behind flag)

All development and testing must be done in a supported browser. There is no fallback mechanism.

## Common Development Patterns

### Adding a New Frontmatter Field
1. Update `Frontmatter` interface in `lib/mdx-parser.ts`
2. Add field to `parseMDX()` and `serializeMDX()` functions
3. Update validation in `validateFrontmatter()` if required
4. Add form input to `FrontmatterForm.tsx`
5. Update `createBlankPost()` if field should have a default value

### Modifying Editor Features
TipTap extensions are configured in `Editor.tsx:useEditor()`. To add new formatting:
1. Install TipTap extension: `pnpm add @tiptap/extension-[name]`
2. Import and add to `extensions` array
3. Add toolbar button with icon from `lucide-react`
4. Wire button to editor command (e.g., `editor.chain().focus().toggleBold().run()`)

### AI Feature Changes
- Model configuration: `lib/ai-completion.ts` handles model-specific parameters (e.g., `max_completion_tokens` vs `max_tokens`)
- Prompt engineering: System prompts are in `getAICompletion()`, `getWritingReview()`, and `rewriteWithFeedback()`
- User settings: Stored via `lib/settings.ts`, modified via `SettingsDialog.tsx`

## Deployment Notes

This app can be deployed to any static hosting (Vercel, Netlify, GitHub Pages, etc.). See README.md for specific platform instructions.

**Security**: Environment variables like `VITE_OPENAI_API_KEY` are embedded in the client bundle during build. This is intentional for a personal/local-first tool, but means anyone with the deployed URL can use your API key. Consider:
- Deploying to private/authenticated hosting
- Using OpenAI API key with usage limits
- Not committing `.env.local` to version control

## TypeScript Configuration

`tsconfig.json` uses strict mode with all linting flags enabled:
- `strict: true`
- `noUnusedLocals: true`
- `noUnusedParameters: true`
- `noFallthroughCasesInSwitch: true`

Path alias `@/*` maps to `./src/*`.

## Git Workflow

When committing changes or creating PRs, include co-author attribution:
```
Co-Authored-By: Warp <agent@warp.dev>
```

Follow existing patterns:
- 2 spaces for indentation
- Single quotes for strings (except JSX attributes)
- Functional components with hooks
- Explicit TypeScript types for props and state
