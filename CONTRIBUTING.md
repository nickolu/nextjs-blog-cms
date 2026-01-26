# Contributing to Blog CMS

Thank you for your interest in contributing to Blog CMS! This document provides guidelines and information for contributors.

## Code of Conduct

This project adheres to a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## How to Contribute

### Reporting Bugs

If you find a bug, please open an issue with:

- A clear, descriptive title
- Steps to reproduce the issue
- Expected vs actual behavior
- Browser version and OS
- Screenshots if applicable
- Console errors if any

### Suggesting Features

Feature requests are welcome! Please open an issue with:

- A clear description of the feature
- Why it would be useful
- Potential implementation approach (optional)
- Examples or mockups (optional)

### Submitting Pull Requests

1. **Fork the repository** and create a new branch from `main`
2. **Make your changes** following the code style guidelines below
3. **Test your changes** thoroughly in supported browsers (Chrome, Edge, Opera)
4. **Update documentation** if you've changed functionality
5. **Commit your changes** with clear, descriptive commit messages
6. **Push to your fork** and submit a pull request

#### Pull Request Guidelines

- Keep PRs focused on a single feature or fix
- Reference any related issues
- Include a clear description of the changes
- Ensure the code builds without errors
- Test in at least one supported browser

## Development Setup

```bash
# Clone your fork
git clone https://github.com/yourusername/blog-cms.git
cd blog-cms

# Install dependencies
pnpm install

# Copy environment file (optional, for AI features)
cp .env.example .env.local

# Start development server
pnpm dev
```

Visit `http://localhost:5173` in a supported browser.

## Code Style Guidelines

### General

- Use TypeScript for all new code
- Follow existing code patterns and conventions
- Use meaningful variable and function names
- Add comments for complex logic

### React Components

- Use functional components with hooks
- Keep components focused and single-purpose
- Extract reusable logic into custom hooks
- Use proper TypeScript types/interfaces

### Formatting

- 2 spaces for indentation
- Single quotes for strings (except JSX)
- Semicolons required
- Trailing commas in multi-line objects/arrays

### Git Commits

- Use clear, descriptive commit messages
- Start with a verb in present tense (e.g., "Add feature" not "Added feature")
- Keep the first line under 72 characters
- Add details in the body if needed

Example:
```
Add keyboard shortcut for creating new posts

Implements Ctrl+N / Cmd+N to create a new post.
Updates documentation to reflect the new shortcut.
```

## Testing

### Manual Testing Checklist

When making changes, please test:

- [ ] Opening and selecting a directory
- [ ] Creating a new post
- [ ] Editing an existing post
- [ ] Saving changes (Ctrl+S / Cmd+S)
- [ ] Search and filtering
- [ ] Draft mode functionality
- [ ] AI autocomplete (if applicable)
- [ ] All editor toolbar features
- [ ] Browser refresh (persistence)

### Browser Testing

Test in at least one of:
- Chrome 86+
- Edge 86+
- Opera 72+

## Project Structure

```
src/
├── components/          # React components
│   ├── Editor.tsx      # TipTap WYSIWYG editor
│   ├── FileManager.tsx # Sidebar with post list
│   └── ...
├── lib/                # Core utilities
│   ├── file-system.ts  # File System Access API
│   ├── mdx-parser.ts   # MDX parsing
│   └── ...
├── extensions/         # TipTap extensions
└── App.tsx            # Main app component
```

## Key Technologies

- **Vite** - Build tool
- **React** - UI framework
- **TypeScript** - Type safety
- **TipTap** - Rich text editor
- **Tailwind CSS** - Styling
- **File System Access API** - Browser file access

## Areas for Contribution

Looking for ideas? Consider:

- Improving browser compatibility
- Adding new editor features
- Enhancing the UI/UX
- Improving documentation
- Adding tests
- Performance optimizations
- Accessibility improvements
- Internationalization (i18n)

## Questions?

Feel free to open an issue for questions or join discussions in existing issues.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
