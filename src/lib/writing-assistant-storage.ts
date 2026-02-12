import { ReviewStatus } from '../types/writing-assistant';

const STORAGE_KEY = 'writing-assistant-state';
const TTL_DAYS = 7;
const MAX_ENTRIES = 5000;

interface StoredReviewStatus {
  hash: string;
  status: 'pending' | 'checking' | 'reviewed' | 'accepted' | 'ignored';
  timestamp: number;
  suggestions: any[];
}

interface PersistedState {
  reviewedSentences: Record<string, StoredReviewStatus>;
  version: number;
}

/**
 * Load persisted state from localStorage with TTL cleanup
 */
export function loadPersistedState(): Map<string, ReviewStatus> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return new Map();
    }

    const parsed: PersistedState = JSON.parse(stored);
    const now = Date.now();
    const ttlMs = TTL_DAYS * 24 * 60 * 60 * 1000;

    const reviewedSentences = new Map<string, ReviewStatus>();

    // Load and filter by TTL
    for (const [hash, status] of Object.entries(parsed.reviewedSentences || {})) {
      // Skip if older than TTL
      if (now - status.timestamp > ttlMs) {
        continue;
      }

      reviewedSentences.set(hash, status as ReviewStatus);
    }

    return reviewedSentences;
  } catch (error) {
    console.error('Failed to load persisted writing assistant state:', error);
    return new Map();
  }
}

/**
 * Save persisted state to localStorage
 */
export function savePersistedState(reviewedSentences: Map<string, ReviewStatus>): void {
  try {
    // Convert Map to object for storage
    const entries = Array.from(reviewedSentences.entries());

    // Sort by timestamp (most recent first) and limit entries
    const sortedEntries = entries
      .sort((a, b) => b[1].timestamp - a[1].timestamp)
      .slice(0, MAX_ENTRIES);

    const reviewedSentencesObj: Record<string, StoredReviewStatus> = {};
    for (const [hash, status] of sortedEntries) {
      reviewedSentencesObj[hash] = {
        hash: status.hash,
        status: status.status,
        timestamp: status.timestamp,
        suggestions: status.suggestions,
      };
    }

    const state: PersistedState = {
      reviewedSentences: reviewedSentencesObj,
      version: 1,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save persisted writing assistant state:', error);
  }
}

/**
 * Get persisted review status for a specific sentence hash
 */
export function getPersistedReviewStatus(hash: string): ReviewStatus | null {
  const state = loadPersistedState();
  return state.get(hash) || null;
}

/**
 * Persist review status for a specific sentence
 */
export function persistReviewStatus(hash: string, status: ReviewStatus): void {
  const state = loadPersistedState();
  state.set(hash, status);
  savePersistedState(state);
}

/**
 * Clear all persisted state (for debugging/testing)
 */
export function clearPersistedState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear persisted writing assistant state:', error);
  }
}
