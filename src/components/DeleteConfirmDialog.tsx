import React from 'react';
import { X, AlertCircle } from 'lucide-react';

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  postTitle: string;
  isDeleting: boolean;
}

export function DeleteConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  postTitle,
  isDeleting,
}: DeleteConfirmDialogProps) {
  // Keyboard handler for Escape and Enter
  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Enter' && !isDeleting) {
        onConfirm();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isDeleting, onClose, onConfirm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="theme-bg-secondary rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b theme-border">
          <div className="flex items-center gap-2">
            <AlertCircle className="text-red-400" size={20} />
            <h2 className="text-lg font-semibold theme-text-primary">Delete Post</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="theme-text-muted hover:theme-text-primary p-1 rounded hover:bg-gray-700 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="theme-text-secondary mb-2">
            Are you sure you want to delete this post?
          </p>
          <p className="text-sm font-medium theme-text-primary theme-bg-primary px-3 py-2 rounded border theme-border">
            {postTitle}
          </p>
          <p className="text-sm text-red-400 mt-3">
            This action cannot be undone. The file will be permanently deleted from your file system.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t theme-border">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-sm theme-text-secondary hover:theme-text-primary hover:bg-gray-700 rounded disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
          >
            {isDeleting ? 'Deleting...' : 'Delete Post'}
          </button>
        </div>
      </div>
    </div>
  );
}
