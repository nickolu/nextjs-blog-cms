import React from 'react';
import { Loader2, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'loading';
  onClose: () => void;
}

export function Toast({ message, type, onClose }: ToastProps) {
  React.useEffect(() => {
    if (type !== 'loading') {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [type, onClose]);

  const bgColor = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    loading: 'bg-blue-600',
  }[type];

  return (
    <div className={`fixed top-4 right-4 ${bgColor} text-white px-4 py-3 rounded shadow-lg z-50 flex items-center gap-2 max-w-md`}>
      {type === 'loading' && <Loader2 className="animate-spin flex-shrink-0" size={16} />}
      <span className="flex-1">{message}</span>
      {type !== 'loading' && (
        <button
          onClick={onClose}
          className="ml-2 flex-shrink-0 hover:opacity-80"
          aria-label="Close"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
