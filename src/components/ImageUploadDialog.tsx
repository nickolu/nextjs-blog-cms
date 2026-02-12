import React, { useState, useRef } from 'react';
import { X, Upload, Link, Loader2 } from 'lucide-react';
import { uploadToCloudinary, isCloudinaryConfigured } from '../lib/cloudinary';

interface ImageUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImageInsert: (url: string) => void;
  postTitle?: string;
}

type TabType = 'upload' | 'url';

export function ImageUploadDialog({ isOpen, onClose, onImageInsert, postTitle }: ImageUploadDialogProps) {
  const [activeTab, setActiveTab] = useState<TabType>('upload');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cloudinaryConfigured = isCloudinaryConfigured();

  // Reset state when dialog opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setImageUrl('');
      setSelectedFile(null);
      setPreview(null);
      setError(null);
      setUploading(false);
      // Default to upload tab if Cloudinary is configured, otherwise URL tab
      setActiveTab(cloudinaryConfigured ? 'upload' : 'url');
    }
  }, [isOpen, cloudinaryConfigured]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError(null);

    try {
      // Determine folder
      let folder = undefined;
      if (postTitle) {
        const slug = postTitle
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
        folder = `blog-images/${slug}`;
      }

      const response = await uploadToCloudinary(selectedFile, { folder });
      onImageInsert(response.secure_url);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (imageUrl.trim()) {
      onImageInsert(imageUrl.trim());
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg w-full max-w-lg border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-gray-200">Add Image</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          {cloudinaryConfigured && (
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'upload'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Upload size={16} className="inline mr-2" />
              Upload File
            </button>
          )}
          <button
            onClick={() => setActiveTab('url')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'url'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Link size={16} className="inline mr-2" />
            Enter URL
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {activeTab === 'upload' && cloudinaryConfigured && (
            <div className="space-y-4">
              {/* File picker */}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-4 py-8 border-2 border-dashed border-gray-600 rounded-lg hover:border-gray-500 transition-colors text-gray-400 hover:text-gray-200"
                  disabled={uploading}
                >
                  <Upload size={32} className="mx-auto mb-2" />
                  <p className="text-sm">Click to select an image</p>
                  <p className="text-xs text-gray-500 mt-1">
                    JPEG, PNG, WebP, GIF (max 10MB)
                  </p>
                </button>
              </div>

              {/* Preview */}
              {preview && (
                <div className="relative">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-48 object-contain bg-gray-900 rounded-lg"
                  />
                  <p className="text-xs text-gray-400 mt-2 truncate">
                    {selectedFile?.name}
                  </p>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="p-3 bg-red-900/20 border border-red-800 rounded text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* Upload button */}
              <button
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded font-medium transition-colors flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Uploading...
                  </>
                ) : (
                  'Upload Image'
                )}
              </button>
            </div>
          )}

          {activeTab === 'upload' && !cloudinaryConfigured && (
            <div className="p-4 bg-yellow-900/20 border border-yellow-800 rounded text-yellow-400 text-sm">
              <p className="font-medium mb-2">Cloudinary Not Configured</p>
              <p>Please configure Cloudinary in Settings to enable image uploads.</p>
            </div>
          )}

          {activeTab === 'url' && (
            <form onSubmit={handleUrlSubmit} className="space-y-4">
              <div>
                <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-300 mb-2">
                  Image URL
                </label>
                <input
                  id="imageUrl"
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={!imageUrl.trim()}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded font-medium transition-colors"
              >
                Insert Image
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
