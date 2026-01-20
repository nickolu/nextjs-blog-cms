# AI Autocomplete Feature

## Overview

The blog CMS now includes AI-powered autocomplete that helps you write blog posts faster by suggesting text continuations as you type.

## Setup

### 1. Get an OpenAI API Key

1. Visit https://platform.openai.com/api-keys
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key (starts with `sk-`)

### 2. Configure the CMS

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your API key:
   ```bash
   VITE_OPENAI_API_KEY=sk-your-actual-key-here
   ```

3. (Optional) Choose a different model:
   ```bash
   VITE_OPENAI_MODEL=gpt-4o  # or gpt-3.5-turbo
   ```

### 3. Start the CMS

```bash
pnpm dev
```

The AI autocomplete will be automatically enabled if an API key is detected.

## Usage

### Enabling/Disabling

- Click the **sparkles icon** (✨) in the editor toolbar to toggle AI autocomplete on/off
- When enabled, the icon will be highlighted in blue
- The feature can be toggled at any time without restarting

### Getting Suggestions

1. Start typing your blog post normally
2. After you pause typing for ~500ms, the AI will generate a suggestion
3. Suggestions appear in **gray italic text** after your cursor

### Accepting Suggestions

- **Tab key**: Accept the full suggestion
- **Click suggestion**: (if you prefer mouse interaction)

### Dismissing Suggestions

- **Escape key**: Clear the current suggestion
- **Keep typing**: Suggestions auto-clear when you continue typing

## How It Works

The AI autocomplete:

1. **Analyzes context**: Uses your post title, description, and last 1000 characters
2. **Generates suggestions**: Creates 1-2 sentence continuations matching your style
3. **Caches results**: Reduces API calls and costs by caching recent suggestions
4. **Adapts to your writing**: The more context you provide, the better the suggestions

## Features

- ✅ **Context-aware**: Considers your post title and description for better relevance
- ✅ **Smart caching**: Avoids duplicate API calls for similar contexts
- ✅ **Debounced**: Only triggers after you pause typing to avoid interruptions
- ✅ **Non-intrusive**: Easy to ignore if you don't want suggestions
- ✅ **Configurable**: Choose your preferred OpenAI model
- ✅ **Privacy-conscious**: Only sends text when you pause typing, can be disabled anytime

## Cost Considerations

- Uses **gpt-4o-mini** by default (very cost-effective)
- Suggestions are cached to minimize API calls
- Debouncing prevents excessive requests while typing
- Typical usage: ~$0.01-0.05 per blog post
- You can disable the feature anytime to avoid costs

## Troubleshooting

### Sparkles icon doesn't appear

- Ensure `VITE_OPENAI_API_KEY` is set in `.env.local`
- Restart the dev server (`pnpm dev`)

### Suggestions not appearing

- Check that the sparkles icon is highlighted (enabled)
- Try typing more text (needs at least 10 characters)
- Wait ~500ms after typing for suggestions to appear
- Check browser console for API errors

### API errors

- Verify your API key is correct and active
- Check your OpenAI account has credits
- Ensure you're not hitting rate limits

### Suggestions are poor quality

- Provide more context in your post title and description
- Write more before expecting suggestions (more context = better results)
- Consider upgrading to `gpt-4o` for higher quality (but higher cost)

## Privacy & Security

- Your text is sent to OpenAI's API only when autocomplete is enabled and you pause typing
- No data is stored on external servers beyond OpenAI's standard processing
- API keys are stored locally in `.env.local` (never committed to git)
- You can disable the feature at any time
- Consider using `.gitignore` to ensure `.env.local` is never committed

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Tab` | Accept AI suggestion |
| `Escape` | Dismiss AI suggestion |
| Click ✨ | Toggle autocomplete on/off |

## Tips for Best Results

1. **Write a clear title and description** before starting - this gives the AI better context
2. **Write naturally** - the AI adapts to your writing style
3. **Pause briefly** after sentences to get suggestions
4. **Use suggestions as inspiration** - you don't have to accept everything
5. **Combine with manual editing** - AI is a writing aid, not a replacement

## What's Next?

Future improvements could include:

- Support for other AI providers (Anthropic Claude, local models)
- Adjustable suggestion delay
- Multiple suggestion options to choose from
- Inline editing of suggestions before accepting
- Writing style preferences

Enjoy faster blog writing! ✨
