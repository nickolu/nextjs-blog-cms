import React from 'react';
import { FolderOpen, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { FileManager } from './components/FileManager';
import { FrontmatterForm } from './components/FrontmatterForm';
import { Editor } from './components/Editor';
import {
  openDirectory,
  listMDXFiles,
  writeFile,
  createFile,
  getSavedDirectoryHandle,
  isFileSystemAccessSupported,
  BlogPost,
} from './lib/file-system';
import {
  parseMDX,
  serializeMDX,
  validateFrontmatter,
  generateSlug,
  createBlankPost,
  Frontmatter,
} from './lib/mdx-parser';

function App() {
  const [directoryHandle, setDirectoryHandle] = React.useState<FileSystemDirectoryHandle | null>(null);
  const [posts, setPosts] = React.useState<BlogPost[]>([]);
  const [selectedPost, setSelectedPost] = React.useState<BlogPost | null>(null);
  const [frontmatter, setFrontmatter] = React.useState<Frontmatter>({
    title: '',
    date: '',
    description: '',
    author: 'Nickolus Cunningham',
    tags: [],
  });
  const [body, setBody] = React.useState('');
  const [errors, setErrors] = React.useState<string[]>([]);
  const [saveStatus, setSaveStatus] = React.useState<'idle' | 'saving' | 'saved' | 'error' | 'auto-saving' | 'auto-saved'>('idle');
  const [isNewPost, setIsNewPost] = React.useState(false);
  const [lastSaveTime, setLastSaveTime] = React.useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false);

  // Check for saved directory handle on mount
  React.useEffect(() => {
    const loadSavedDirectory = async () => {
      const handle = await getSavedDirectoryHandle();
      if (handle) {
        setDirectoryHandle(handle);
        await loadPosts(handle);
      }
    };
    loadSavedDirectory();
  }, []);

  // Load posts from directory
  const loadPosts = async (handle: FileSystemDirectoryHandle) => {
    try {
      const files = await listMDXFiles(handle);
      setPosts(files);
    } catch (err) {
      console.error('Failed to load posts:', err);
    }
  };

  // Handle opening directory
  const handleOpenDirectory = async () => {
    try {
      const handle = await openDirectory();
      setDirectoryHandle(handle);
      await loadPosts(handle);
    } catch (err) {
      console.error('Failed to open directory:', err);
    }
  };

  // Handle selecting a post
  const handleSelectPost = (post: BlogPost) => {
    try {
      const parsed = parseMDX(post.content);
      setFrontmatter(parsed.frontmatter);
      setBody(parsed.body);
      setSelectedPost(post);
      setIsNewPost(false);
      setErrors([]);
      setSaveStatus('idle');
    } catch (err) {
      console.error('Failed to parse post:', err);
      setErrors(['Failed to parse post content']);
    }
  };

  // Handle creating new post
  const handleNewPost = () => {
    const blankPost = createBlankPost();
    const parsed = parseMDX(blankPost);
    setFrontmatter(parsed.frontmatter);
    setBody(parsed.body);
    setSelectedPost(null);
    setIsNewPost(true);
    setErrors([]);
    setSaveStatus('idle');
  };

  // Handle saving
  const handleSave = async (isAutoSave = false) => {
    if (!directoryHandle) return;

    // Validate
    const validationErrors = validateFrontmatter(frontmatter);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      // Don't show error for auto-save, just skip it
      if (isAutoSave) {
        return;
      }
      return;
    }

    setErrors([]);
    setSaveStatus(isAutoSave ? 'auto-saving' : 'saving');

    try {
      const content = serializeMDX(frontmatter, body);

      if (isNewPost) {
        // Create new file
        const slug = generateSlug(frontmatter.title);
        const filename = `${slug}.mdx`;
        const fileHandle = await createFile(directoryHandle, filename, content);

        // Add to posts list
        const newPost: BlogPost = {
          handle: fileHandle,
          name: filename,
          content,
        };
        setPosts([...posts, newPost]);
        setSelectedPost(newPost);
        setIsNewPost(false);
      } else if (selectedPost) {
        // Update existing file
        await writeFile(selectedPost.handle, content);

        // Update posts list
        setPosts(posts.map(p =>
          p.name === selectedPost.name
            ? { ...p, content }
            : p
        ));

        // Update selected post
        setSelectedPost({ ...selectedPost, content });
      }

      setSaveStatus(isAutoSave ? 'auto-saved' : 'saved');
      setLastSaveTime(new Date());
      setHasUnsavedChanges(false);
      setTimeout(() => setSaveStatus('idle'), isAutoSave ? 3000 : 2000);
    } catch (err) {
      console.error('Failed to save:', err);
      setSaveStatus('error');
      setErrors(['Failed to save file']);
    }
  };

  // Track unsaved changes
  React.useEffect(() => {
    setHasUnsavedChanges(true);
  }, [frontmatter, body]);

  // Auto-save after 2 seconds of inactivity
  React.useEffect(() => {
    // Don't auto-save if no post is selected or no directory
    if (!directoryHandle || (!selectedPost && !isNewPost)) {
      return;
    }

    // Don't auto-save if there are no changes
    if (!hasUnsavedChanges) {
      return;
    }

    // Don't auto-save if currently saving
    if (saveStatus === 'saving' || saveStatus === 'auto-saving') {
      return;
    }

    // Set up debounced auto-save
    const timeoutId = setTimeout(() => {
      handleSave(true);
    }, 2000); // 2 seconds of inactivity

    return () => clearTimeout(timeoutId);
  }, [frontmatter, body, directoryHandle, selectedPost, isNewPost, hasUnsavedChanges, saveStatus]);

  // Keyboard shortcut for save (Ctrl+S / Cmd+S)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [frontmatter, body, directoryHandle, selectedPost, isNewPost]);

  // Check if File System Access API is supported
  if (!isFileSystemAccessSupported()) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="max-w-md p-6 bg-white rounded-lg shadow-lg">
          <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
          <h1 className="text-xl font-bold text-center mb-2">Browser Not Supported</h1>
          <p className="text-gray-600 text-center">
            This CMS requires the File System Access API, which is currently only supported in 
            Chrome, Edge, and Opera. Please use one of these browsers.
          </p>
        </div>
      </div>
    );
  }

  // Show directory picker if no directory selected
  if (!directoryHandle) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="max-w-md p-6 bg-white rounded-lg shadow-lg">
          <FolderOpen className="mx-auto mb-4 text-blue-600" size={48} />
          <h1 className="text-2xl font-bold text-center mb-2">Blog CMS</h1>
          <p className="text-gray-600 text-center mb-6">
            Select your blog content directory to get started
          </p>
          <button
            onClick={handleOpenDirectory}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Open Directory
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold">Blog CMS</h1>
          <button
            onClick={handleOpenDirectory}
            className="text-sm text-gray-600 hover:text-gray-900"
            title="Change directory"
          >
            <FolderOpen size={18} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {saveStatus === 'saved' && (
            <span className="text-sm text-green-600 flex items-center gap-1">
              <CheckCircle size={16} />
              Saved!
            </span>
          )}
          {saveStatus === 'auto-saved' && lastSaveTime && (
            <span className="text-sm text-gray-600 flex items-center gap-1">
              <CheckCircle size={16} />
              Auto-saved at {lastSaveTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          {saveStatus === 'auto-saving' && (
            <span className="text-sm text-gray-600 flex items-center gap-1">
              Auto-saving...
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle size={16} />
              Error
            </span>
          )}
          <button
            onClick={() => handleSave(false)}
            disabled={saveStatus === 'saving' || saveStatus === 'auto-saving'}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Save size={18} />
            {saveStatus === 'saving' ? 'Saving...' : 'Save'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* File Manager Sidebar */}
        <div className="w-80">
          <FileManager
            posts={posts}
            selectedPost={selectedPost}
            onSelectPost={handleSelectPost}
            onNewPost={handleNewPost}
          />
        </div>

        {/* Editor Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedPost || isNewPost ? (
            <>
              <FrontmatterForm
                frontmatter={frontmatter}
                onChange={setFrontmatter}
                errors={errors}
              />
              <div className="flex-1 overflow-hidden">
                <Editor
                  content={body}
                  onChange={setBody}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <p className="text-lg mb-2">No post selected</p>
                <p className="text-sm">Select a post from the sidebar or create a new one</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
