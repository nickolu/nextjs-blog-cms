import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Suggestion } from '../types/writing-assistant';
import { X } from 'lucide-react';

interface WritingSuggestionTooltipProps {
  suggestion: Suggestion;
  position: { top: number; left: number };
  onAccept: (suggestionId: string) => void;
  onIgnore: (suggestionId: string) => void;
  onDismiss: () => void;
}

const CategoryBadge: React.FC<{
  category: Suggestion['category'];
  severity: Suggestion['severity'];
}> = ({ category, severity }) => {
  const severityClass = {
    error: 'category-badge error',
    warning: 'category-badge warning',
    suggestion: 'category-badge suggestion',
  }[severity];

  return (
    <span className={severityClass}>
      {category.charAt(0).toUpperCase() + category.slice(1)}
    </span>
  );
};

const DiffView: React.FC<{
  original: string;
  suggested: string;
}> = ({ original, suggested }) => {
  // Simple character-level diff
  // For simplicity, just show original in red and suggested in green
  return (
    <div className="diff-view">
      <span className="text-red-400 line-through">{original}</span>
      {' → '}
      <span className="text-green-400">{suggested}</span>
    </div>
  );
};

export const WritingSuggestionTooltip: React.FC<WritingSuggestionTooltipProps> = ({
  suggestion,
  position,
  onAccept,
  onIgnore,
  onDismiss,
}) => {
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Calculate tooltip position
  const [tooltipPosition, setTooltipPosition] = React.useState({
    top: position.top - 10,
    left: position.left,
  });

  useEffect(() => {
    if (!tooltipRef.current) return;

    const tooltip = tooltipRef.current;
    const rect = tooltip.getBoundingClientRect();

    // Adjust position to keep tooltip in viewport
    let top = position.top - rect.height - 10; // Position above highlight
    let left = position.left - rect.width / 2; // Center horizontally

    // If not enough space above, position below
    if (top < 10) {
      top = position.top + 30; // Position below highlight
    }

    // Keep within horizontal bounds
    if (left < 10) {
      left = 10;
    } else if (left + rect.width > window.innerWidth - 10) {
      left = window.innerWidth - rect.width - 10;
    }

    setTooltipPosition({ top, left });
  }, [position]);

  // Close on escape key or click outside
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onDismiss();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node)) {
        // Check if clicking on a highlight (which would show a different tooltip)
        const target = e.target as HTMLElement;
        if (!target.closest('.suggestion-highlight')) {
          onDismiss();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onDismiss]);

  return createPortal(
    <div
      ref={tooltipRef}
      className="writing-suggestion-tooltip"
      style={{
        position: 'fixed',
        top: `${tooltipPosition.top}px`,
        left: `${tooltipPosition.left}px`,
      }}
    >
      {/* Header */}
      <div className="tooltip-header">
        <CategoryBadge category={suggestion.category} severity={suggestion.severity} />
        <button
          onClick={onDismiss}
          className="text-gray-400 hover:text-gray-200 transition-colors"
          aria-label="Close"
        >
          <X size={16} />
        </button>
      </div>

      {/* Body */}
      <div className="tooltip-body">
        <div className="mb-3">
          <DiffView
            original={suggestion.originalText}
            suggested={suggestion.suggestedText}
          />
        </div>

        <div className="reasoning">
          <p className="text-sm text-gray-300">{suggestion.reasoning}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="tooltip-actions">
        <button
          onClick={() => onIgnore(suggestion.id)}
          className="px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
        >
          Ignore
        </button>
        <button
          onClick={() => onAccept(suggestion.id)}
          className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors font-medium"
        >
          Accept
        </button>
      </div>
    </div>,
    document.body
  );
};
