import React from 'react';
import { FolderOpen, Save, AlertCircle, CheckCircle, PanelLeftClose, PanelLeft, ChevronDown, ChevronUp, Settings } from 'lucide-react';
import { FileManager } from './components/FileManager';
import { FrontmatterForm } from './components/FrontmatterForm';
import { Editor } from './components/Editor';
import { SettingsDialog } from './components/SettingsDialog';
import { DeleteConfirmDialog } from './components/DeleteConfirmDialog';
import {
  openDirectory,
  listMDXFiles,
  writeFile,
  createFile,
  deleteFile,
  getSavedDirectoryHandle,
  getSavedDirectoryHandleWithoutPermission,
  requestDirectoryPermission,
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
  const [savedHandleNeedsPermission, setSavedHandleNeedsPermission] = React.useState<FileSystemDirectoryHandle | null>(null);
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
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [metadataOpen, setMetadataOpen] = React.useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const [settingsVersion, setSettingsVersion] = React.useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [postToDelete, setPostToDelete] = React.useState<BlogPost | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Check for saved directory handle on mount
  React.useEffect(() => {
    const loadSavedDirectory = async () => {
      const handle = await getSavedDirectoryHandle();
      if (handle) {
        setDirectoryHandle(handle);
        await loadPosts(handle);
      } else {
        // Check if we have a saved handle that needs permission
        const savedHandle = await getSavedDirectoryHandleWithoutPermission();
        if (savedHandle) {
          setSavedHandleNeedsPermission(savedHandle);
        }
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
      setSavedHandleNeedsPermission(null);
      await loadPosts(handle);
    } catch (err) {
      console.error('Failed to open directory:', err);
    }
  };

  // Handle restoring access to saved directory
  const handleRestoreAccess = async () => {
    if (!savedHandleNeedsPermission) return;

    try {
      const granted = await requestDirectoryPermission(savedHandleNeedsPermission);
      if (granted) {
        setDirectoryHandle(savedHandleNeedsPermission);
        setSavedHandleNeedsPermission(null);
        await loadPosts(savedHandleNeedsPermission);
      }
    } catch (err) {
      console.error('Failed to restore access:', err);
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

  // Handle settings change
  const handleSettingsChange = () => {
    // Increment version to trigger re-render in child components
    setSettingsVersion((v) => v + 1);
  };

  // Handle delete post
  const handleDeletePost = (post: BlogPost) => {
    setPostToDelete(post);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!postToDelete || !directoryHandle) return;

    setIsDeleting(true);
    try {
      // Delete the file
      await deleteFile(directoryHandle, postToDelete.name);

      // Update posts list
      const updatedPosts = posts.filter(p => p.name !== postToDelete.name);
      setPosts(updatedPosts);

      // Handle edge case: deleting currently selected post
      if (selectedPost?.name === postToDelete.name) {
        // Clear editor if deleting currently selected post
        setSelectedPost(null);
        setFrontmatter({
          title: '',
          date: '',
          description: '',
          author: 'Nickolus Cunningham',
          tags: [],
        });
        setBody('');
        setIsNewPost(false);
        setErrors([]);
        setSaveStatus('idle');
      }

      // Close dialog
      setDeleteDialogOpen(false);
      setPostToDelete(null);
    } catch (err) {
      console.error('Failed to delete post:', err);
      setErrors(['Failed to delete post. Please try again.']);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setPostToDelete(null);
  };

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

          {savedHandleNeedsPermission ? (
            <>
              <p className="text-gray-600 text-center mb-4">
                Restore access to your blog directory:
              </p>
              <p className="text-sm text-gray-500 text-center mb-6 font-mono bg-gray-50 px-3 py-2 rounded">
                {savedHandleNeedsPermission.name}
              </p>
              <button
                onClick={handleRestoreAccess}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium mb-3"
              >
                Restore Access
              </button>
              <button
                onClick={handleOpenDirectory}
                className="w-full px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
              >
                Choose Different Directory
              </button>
            </>
          ) : (
            <>
              <p className="text-gray-600 text-center mb-6">
                Select your blog content directory to get started
              </p>
              <button
                onClick={handleOpenDirectory}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Open Directory
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded"
            title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
          >
            {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeft size={18} />}
          </button>
          <h1 className="text-lg font-semibold text-gray-100">Blog CMS</h1>
          <button
            onClick={handleOpenDirectory}
            className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded"
            title="Change directory"
          >
            <FolderOpen size={16} />
          </button>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded"
            title="Settings"
          >
            <Settings size={16} />
          </button>
        </div>

        <div className="flex items-center gap-3">
          {saveStatus === 'saved' && (
            <span className="text-sm text-green-400 flex items-center gap-1">
              <CheckCircle size={14} />
              Saved
            </span>
          )}
          {saveStatus === 'auto-saved' && lastSaveTime && (
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <CheckCircle size={14} />
              {lastSaveTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          {saveStatus === 'auto-saving' && (
            <span className="text-xs text-gray-500 flex items-center gap-1">
              Saving...
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="text-sm text-red-400 flex items-center gap-1">
              <AlertCircle size={14} />
              Error
            </span>
          )}
          <button
            onClick={() => handleSave(false)}
            disabled={saveStatus === 'saving' || saveStatus === 'auto-saving'}
            className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Save size={14} />
            {saveStatus === 'saving' ? 'Saving...' : 'Save'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* File Manager Sidebar */}
        {sidebarOpen && (
          <div className="w-72 flex-shrink-0">
            <FileManager
              posts={posts}
              selectedPost={selectedPost}
              onSelectPost={handleSelectPost}
              onNewPost={handleNewPost}
              onDeletePost={handleDeletePost}
            />
          </div>
        )}

        {/* Editor Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedPost || isNewPost ? (
            <>
              {/* Collapsible Metadata */}
              <div className="border-b border-gray-700">
                <button
                  onClick={() => setMetadataOpen(!metadataOpen)}
                  className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-750 flex items-center justify-between text-gray-300 text-sm"
                >
                  <span className="font-medium">Post Metadata</span>
                  {metadataOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {metadataOpen && (
                  <FrontmatterForm
                    frontmatter={frontmatter}
                    onChange={setFrontmatter}
                    errors={errors}
                  />
                )}
              </div>
              <div className="flex-1 overflow-hidden">
                <Editor
                  key={settingsVersion}
                  content={body}
                  onChange={setBody}
                  postTitle={frontmatter.title}
                  postDescription={frontmatter.description}
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

      {/* Settings Dialog */}
      <SettingsDialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSettingsChange={handleSettingsChange}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        postTitle={postToDelete ? parseMDX(postToDelete.content).frontmatter.title || postToDelete.name : ''}
        isDeleting={isDeleting}
      />
    </div>
  );
}

export default App;
