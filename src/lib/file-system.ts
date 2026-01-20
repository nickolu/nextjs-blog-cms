// File System Access API wrapper

export interface BlogPost {
  handle: FileSystemFileHandle;
  name: string;
  content: string;
}

// Open directory picker and get directory handle
export async function openDirectory(): Promise<FileSystemDirectoryHandle> {
  try {
    const handle = await window.showDirectoryPicker({
      mode: 'readwrite',
    });
    // Store the handle in IndexedDB for persistence
    await saveDirectoryHandle(handle);
    return handle;
  } catch (err) {
    console.error('Error opening directory:', err);
    throw err;
  }
}

// List all MDX files in directory
export async function listMDXFiles(
  dirHandle: FileSystemDirectoryHandle
): Promise<BlogPost[]> {
  const files: BlogPost[] = [];
  
  try {
    for await (const entry of dirHandle.values()) {
      if (entry.kind === 'file' && (entry.name.endsWith('.mdx') || entry.name.endsWith('.md'))) {
        const fileHandle = entry as FileSystemFileHandle;
        const file = await fileHandle.getFile();
        const content = await file.text();
        
        files.push({
          handle: fileHandle,
          name: entry.name,
          content,
        });
      }
    }
  } catch (err) {
    console.error('Error listing files:', err);
    throw err;
  }
  
  return files;
}

// Read a single file
export async function readFile(handle: FileSystemFileHandle): Promise<string> {
  try {
    const file = await handle.getFile();
    return await file.text();
  } catch (err) {
    console.error('Error reading file:', err);
    throw err;
  }
}

// Write content to a file
export async function writeFile(
  handle: FileSystemFileHandle,
  content: string
): Promise<void> {
  try {
    const writable = await handle.createWritable();
    await writable.write(content);
    await writable.close();
  } catch (err) {
    console.error('Error writing file:', err);
    throw err;
  }
}

// Create a new file
export async function createFile(
  dirHandle: FileSystemDirectoryHandle,
  filename: string,
  content: string
): Promise<FileSystemFileHandle> {
  try {
    const fileHandle = await dirHandle.getFileHandle(filename, { create: true });
    await writeFile(fileHandle, content);
    return fileHandle;
  } catch (err) {
    console.error('Error creating file:', err);
    throw err;
  }
}

// IndexedDB helper for storing directory handle
const DB_NAME = 'blog-cms-db';
const STORE_NAME = 'directory-handles';
const HANDLE_KEY = 'blog-directory';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

async function saveDirectoryHandle(handle: FileSystemDirectoryHandle): Promise<void> {
  const db = await openDB();
  const transaction = db.transaction(STORE_NAME, 'readwrite');
  const store = transaction.objectStore(STORE_NAME);
  
  return new Promise((resolve, reject) => {
    const request = store.put(handle, HANDLE_KEY);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function getSavedDirectoryHandle(): Promise<FileSystemDirectoryHandle | null> {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    
    return new Promise((resolve, reject) => {
      const request = store.get(HANDLE_KEY);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const handle = request.result as FileSystemDirectoryHandle | undefined;
        if (handle) {
          // Verify we still have permission
          handle.queryPermission({ mode: 'readwrite' }).then(permission => {
            if (permission === 'granted') {
              resolve(handle);
            } else {
              resolve(null);
            }
          });
        } else {
          resolve(null);
        }
      };
    });
  } catch {
    return null;
  }
}

// Check if File System Access API is supported
export function isFileSystemAccessSupported(): boolean {
  return 'showDirectoryPicker' in window;
}
