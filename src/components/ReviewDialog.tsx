import React from 'react';
import { X, RefreshCw, Wand2, Loader2 } from 'lucide-react';
import { getWritingReview, rewriteWithFeedback, ReviewContext, RewriteContext } from '../lib/ai-completion';

interface ReviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedText: string;
  postTitle?: string;
  postDescription?: string;
  onRewrite: (newText: string) => void;
}

export function ReviewDialog({
  isOpen,
  onClose,
  selectedText,
  postTitle,
  postDescription,
  onRewrite,
}: ReviewDialogProps) {
  const [review, setReview] = React.useState<string>('');
  const [additionalFeedback, setAdditionalFeedback] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isRewriting, setIsRewriting] = React.useState(false);

  // Get initial review when dialog opens
  React.useEffect(() => {
    if (isOpen && selectedText && !review) {
      getInitialReview();
    }
  }, [isOpen, selectedText]);

  const getInitialReview = async () => {
    setIsLoading(true);
    try {
      const context: ReviewContext = {
        text: selectedText,
        postTitle,
        postDescription,
      };
      const result = await getWritingReview(context);
      if (result) {
        setReview(result);
      } else {
        setReview('Failed to get review. Please try again.');
      }
    } catch (error) {
      console.error('Review error:', error);
      setReview('An error occurred while getting the review.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetAnotherReview = async () => {
    if (!additionalFeedback.trim()) return;

    setIsLoading(true);
    try {
      // Get a new review with the additional feedback incorporated
      const context: ReviewContext = {
        text: selectedText,
        postTitle,
        postDescription,
      };
      
      // Add the additional feedback to the context as a follow-up request
      const followUpText = `${selectedText}\n\nPrevious feedback: ${review}\n\nAdditional focus requested: ${additionalFeedback}`;
      const result = await getWritingReview({ ...context, text: followUpText });
      
      if (result) {
        setReview(result);
        setAdditionalFeedback(''); // Clear input after successful review
      }
    } catch (error) {
      console.error('Review error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRewriteWithAI = async () => {
    setIsRewriting(true);
    try {
      const context: RewriteContext = {
        originalText: selectedText,
        feedback: review,
        additionalInput: additionalFeedback.trim() || undefined,
        postTitle,
        postDescription,
      };
      
      const result = await rewriteWithFeedback(context);
      if (result) {
        onRewrite(result);
        handleClose();
      }
    } catch (error) {
      console.error('Rewrite error:', error);
    } finally {
      setIsRewriting(false);
    }
  };

  const handleClose = () => {
    setReview('');
    setAdditionalFeedback('');
    setIsLoading(false);
    setIsRewriting(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-gray-100">AI Writing Review</h2>
          <button
            onClick={handleClose}
            className="p-1 text-gray-400 hover:text-gray-200 hover:bg-gray-700 rounded"
            disabled={isRewriting}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Review Display */}
          <div className="bg-gray-900 border border-gray-700 rounded p-4">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Feedback</h3>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin text-blue-400" size={24} />
                <span className="ml-2 text-gray-400">Getting review...</span>
              </div>
            ) : (
              <div className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
                {review || 'No review available'}
              </div>
            )}
          </div>

          {/* Additional Feedback Input */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Additional Instructions (optional)
            </label>
            <textarea
              value={additionalFeedback}
              onChange={(e) => setAdditionalFeedback(e.target.value)}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Add specific feedback or areas to focus on..."
              disabled={isLoading || isRewriting}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-700 bg-gray-850">
          <button
            onClick={handleGetAnotherReview}
            disabled={!additionalFeedback.trim() || isLoading || isRewriting}
            className="px-4 py-2 bg-gray-700 text-gray-200 text-sm rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Get Another Review
          </button>
          <button
            onClick={handleRewriteWithAI}
            disabled={isLoading || isRewriting}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {isRewriting ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                Rewriting...
              </>
            ) : (
              <>
                <Wand2 size={16} />
                Rewrite with AI
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
