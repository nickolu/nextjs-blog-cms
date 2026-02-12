import { DecorationSet } from '@tiptap/pm/view';

export interface Suggestion {
  id: string;
  sentenceHash: string;
  startPos: number;
  endPos: number;
  originalText: string;
  suggestedText: string;
  category: 'grammar' | 'syntax' | 'style' | 'clarity';
  severity: 'error' | 'warning' | 'suggestion';
  reasoning: string;
}

export interface ReviewStatus {
  hash: string;
  status: 'pending' | 'checking' | 'reviewed' | 'accepted' | 'ignored';
  timestamp: number;
  suggestions: Suggestion[];
}

export interface WritingAssistantState {
  enabled: boolean;
  reviewedSentences: Map<string, ReviewStatus>;
  suggestions: Suggestion[];
  decorations: DecorationSet;
  checkingPositions: Set<number>;
  isChecking: boolean;
  activeTooltip: {
    suggestionId: string;
    position: { top: number; left: number };
  } | null;
}

export interface LLMSuggestion {
  originalText: string;
  suggestedText: string;
  category: 'grammar' | 'syntax' | 'style' | 'clarity';
  severity: 'error' | 'warning' | 'suggestion';
  reasoning: string;
}
