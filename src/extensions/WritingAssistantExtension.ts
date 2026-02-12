import { Extension } from '@tiptap/core';
import { Plugin, PluginKey, Transaction } from '@tiptap/pm/state';
import { Decoration, DecorationSet, EditorView } from '@tiptap/pm/view';
import { Settings } from '../lib/settings';
import { Suggestion, WritingAssistantState } from '../types/writing-assistant';
import {
  detectSentenceEnd,
  extractSentence,
  hashSentence,
  getPrecedingContext,
  shouldCheckNode,
} from '../lib/sentence-utils';
import {
  getSentenceSuggestions,
  SentenceContext,
} from '../lib/ai-completion';
import {
  getPersistedReviewStatus,
  persistReviewStatus,
  loadPersistedState,
} from '../lib/writing-assistant-storage';

export interface WritingAssistantOptions {
  enabled: boolean;
  debounceDelay: number;
  settings: Settings['writingAssistant'] | null;
}

export const writingAssistantPluginKey = new PluginKey<WritingAssistantState>(
  'writingAssistant'
);

// Debounce timer for checking sentences
let checkTimer: ReturnType<typeof setTimeout> | null = null;

// Timer for hiding tooltip
let hideTooltipTimer: ReturnType<typeof setTimeout> | null = null;

// Active checking promises
const activeChecks = new Map<string, Promise<void>>();

export const WritingAssistantExtension = Extension.create<WritingAssistantOptions>({
  name: 'writingAssistant',

  addOptions() {
    return {
      enabled: false,
      debounceDelay: 2000,
      settings: null,
    };
  },

  addCommands() {
    const extension = this;

    return {
      setWritingAssistantEnabled:
        (enabled: boolean) =>
        ({ tr, dispatch }) => {
          if (dispatch) {
            tr.setMeta('setWritingAssistantEnabled', enabled);
          }
          return true;
        },
      acceptSuggestion:
        (suggestionId: string) =>
        ({ tr, state, dispatch, view }) => {
          const pluginState = writingAssistantPluginKey.getState(state);
          if (!pluginState) return false;

          const suggestion = pluginState.suggestions.find(s => s.id === suggestionId);
          if (!suggestion) return false;

          if (dispatch) {
            // Replace the original text with the suggested text
            // First delete the range, then insert new text
            tr.delete(suggestion.startPos, suggestion.endPos)
              .insertText(suggestion.suggestedText, suggestion.startPos);

            // Mark as accepted
            tr.setMeta('acceptSuggestion', suggestionId);
          }
          return true;
        },
      ignoreSuggestion:
        (suggestionId: string) =>
        ({ tr, dispatch }) => {
          if (dispatch) {
            tr.setMeta('ignoreSuggestion', suggestionId);
          }
          return true;
        },
      showSuggestionTooltip:
        (data: { suggestionId: string; position: { top: number; left: number } }) =>
        ({ tr, dispatch }) => {
          if (dispatch) {
            tr.setMeta('showTooltip', data);
          }
          return true;
        },
      hideSuggestionTooltip:
        () =>
        ({ tr, dispatch }) => {
          if (dispatch) {
            tr.setMeta('hideTooltip', true);
          }
          return true;
        },
      checkWritingNow:
        () =>
        ({ state, view }) => {
          const pluginState = writingAssistantPluginKey.getState(state);
          if (!pluginState?.enabled || !extension.options.settings) {
            return false;
          }

          // Get cursor position
          const { from } = state.selection;
          const { doc } = state;

          // Find the end of the current sentence by scanning forward
          let sentenceEnd = from;
          let foundEnd = false;

          // Scan forward to find sentence-ending punctuation
          while (sentenceEnd < doc.content.size && !foundEnd) {
            const char = doc.textBetween(sentenceEnd, sentenceEnd + 1, '', '');

            // Check if this is sentence-ending punctuation
            if (/[.!?]/.test(char)) {
              // Move past the punctuation and any whitespace
              sentenceEnd++;
              while (sentenceEnd < doc.content.size) {
                const nextChar = doc.textBetween(sentenceEnd, sentenceEnd + 1, '', '');
                if (!/\s/.test(nextChar)) {
                  break;
                }
                sentenceEnd++;
              }
              foundEnd = true;
              break;
            }
            sentenceEnd++;
          }

          if (!foundEnd) {
            // No sentence end found, can't check
            return false;
          }

          // Trigger check at sentence end
          setTimeout(() => {
            checkSentenceAtPosition(view, sentenceEnd, () => extension.options.settings);
          }, 100);

          return true;
        },
    };
  },

  addProseMirrorPlugins() {
    const extension = this;
    const getExtensionSettings = () => extension.options.settings;

    return [
      new Plugin<WritingAssistantState>({
        key: writingAssistantPluginKey,

        state: {
          init() {
            const reviewedSentences = loadPersistedState();
            return {
              enabled: extension.options.enabled,
              reviewedSentences,
              suggestions: [],
              decorations: DecorationSet.empty,
              checkingPositions: new Set<number>(),
              isChecking: false,
              activeTooltip: null,
            };
          },

          apply(tr: Transaction, value: WritingAssistantState, oldState, newState) {
            // Handle meta commands
            const setEnabled = tr.getMeta('setWritingAssistantEnabled');
            if (setEnabled !== undefined) {
              return {
                ...value,
                enabled: setEnabled as boolean,
                suggestions: [],
                decorations: DecorationSet.empty,
              };
            }

            // If disabled, return empty state
            if (!value.enabled) {
              return {
                ...value,
                suggestions: [],
                decorations: DecorationSet.empty,
                activeTooltip: null,
              };
            }

            let newValue = value;

            // Handle accept suggestion
            const acceptSuggestionId = tr.getMeta('acceptSuggestion');
            if (acceptSuggestionId) {
              newValue = handleAcceptSuggestion(
                newValue,
                acceptSuggestionId as string,
                newState
              );
            }

            // Handle ignore suggestion
            const ignoreSuggestionId = tr.getMeta('ignoreSuggestion');
            if (ignoreSuggestionId) {
              newValue = handleIgnoreSuggestion(newValue, ignoreSuggestionId as string);
            }

            // Handle set suggestions
            const setSuggestions = tr.getMeta('setSuggestions');
            if (setSuggestions) {
              newValue = handleSetSuggestions(
                newValue,
                setSuggestions as { sentenceHash: string; suggestions: Suggestion[]; sentenceStart: number; sentenceEnd: number },
                newState
              );
            }

            // Handle show/hide tooltip
            const showTooltip = tr.getMeta('showTooltip');
            if (showTooltip) {
              newValue = {
                ...newValue,
                activeTooltip: showTooltip as WritingAssistantState['activeTooltip'],
              };
            }

            const hideTooltip = tr.getMeta('hideTooltip');
            if (hideTooltip) {
              newValue = {
                ...newValue,
                activeTooltip: null,
              };
            }

            // Handle checking state
            const setChecking = tr.getMeta('setChecking');
            if (setChecking !== undefined) {
              newValue = {
                ...newValue,
                isChecking: setChecking as boolean,
              };
            }

            // Handle document changes (including from accept/ignore)
            if (tr.docChanged) {
              newValue = handleDocumentChange(newValue, tr, newState);
            }

            return newValue;
          },
        },

        props: {
          decorations(state) {
            const pluginState = writingAssistantPluginKey.getState(state);
            return pluginState?.decorations || DecorationSet.empty;
          },

          handleTextInput(view: EditorView, from: number, to: number, text: string) {
            const pluginState = writingAssistantPluginKey.getState(view.state);

            if (!pluginState?.enabled || !extension.options.settings) {
              return false;
            }

            // Check if this is sentence-ending punctuation
            const isSentenceEnd = /[.!?]/.test(text) && from === to;

            if (!isSentenceEnd) {
              return false;
            }

            // Schedule check after debounce delay
            if (checkTimer) {
              clearTimeout(checkTimer);
            }

            checkTimer = setTimeout(() => {
              checkSentenceAtPosition(view, to + 1, getExtensionSettings);
            }, extension.options.debounceDelay);

            return false;
          },

          handleDOMEvents: {
            mouseover(view: EditorView, event: MouseEvent) {
              const target = event.target as HTMLElement;
              const suggestionEl = target.closest('.suggestion-highlight');
              if (!suggestionEl) {
                return false;
              }

              // Cancel any pending hide
              if (hideTooltipTimer) {
                clearTimeout(hideTooltipTimer);
                hideTooltipTimer = null;
              }

              const suggestionId = suggestionEl.getAttribute('data-suggestion-id');
              if (!suggestionId) {
                return false;
              }

              // Get position for tooltip
              const rect = suggestionEl.getBoundingClientRect();
              const position = {
                top: rect.top,
                left: rect.left + rect.width / 2,
              };

              // Show tooltip via command
              view.dispatch(
                view.state.tr.setMeta('showTooltip', { suggestionId, position })
              );

              return false;
            },

            // Removed mouseout - tooltip only dismisses via buttons or Escape key
          },
        },

        view() {
          return {
            destroy() {
              if (checkTimer) {
                clearTimeout(checkTimer);
              }
            },
          };
        },
      }),
    ];
  },
});

// Helper functions

async function checkSentenceAtPosition(
  view: EditorView,
  pos: number,
  getSettings: () => any
) {
  const { state } = view;
  const pluginState = writingAssistantPluginKey.getState(state);

  if (!pluginState?.enabled) {
    return;
  }

  const settings = getSettings();

  if (!settings) {
    return;
  }

  // Check if position is at sentence end
  const isSentenceEnd = detectSentenceEnd(state, pos);

  if (!isSentenceEnd) {
    return;
  }

  // Extract sentence
  const sentenceData = extractSentence(state, pos);

  if (!sentenceData) {
    return;
  }

  const { text, from, to } = sentenceData;

  // Generate hash
  const sentenceHash = await hashSentence(text);

  // Check if already reviewed
  const reviewStatus = pluginState.reviewedSentences.get(sentenceHash);

  if (reviewStatus) {
    // If accepted or ignored, don't check again
    if (reviewStatus.status === 'accepted' || reviewStatus.status === 'ignored') {
      return;
    }
  }

  // Check if already checking this sentence
  if (activeChecks.has(sentenceHash)) {
    return;
  }

  // Get preceding context
  const precedingText = getPrecedingContext(state, from, 500);

  // Build context for LLM
  const context: SentenceContext = {
    sentence: text,
    precedingText,
    writingStyle: settings.writingStyle,
    checkGrammar: settings.checkGrammar,
    checkSyntax: settings.checkSyntax,
    checkStyle: settings.checkStyle,
    checkClarity: settings.checkClarity,
  };

  // Set checking state to true
  view.dispatch(view.state.tr.setMeta('setChecking', true));

  // Start checking
  const checkPromise = (async () => {
    try {
      const suggestions = await getSentenceSuggestions(context, sentenceHash);

      // Update plugin state with suggestions
      view.dispatch(
        view.state.tr.setMeta('setSuggestions', {
          sentenceHash,
          suggestions,
          sentenceStart: from,
          sentenceEnd: to,
        })
      );

      // Persist status
      persistReviewStatus(sentenceHash, {
        hash: sentenceHash,
        status: suggestions.length > 0 ? 'reviewed' : 'ignored',
        timestamp: Date.now(),
        suggestions,
      });
    } catch (error) {
      console.error('Error checking sentence:', error);
    } finally {
      activeChecks.delete(sentenceHash);

      // Set checking state to false if no more active checks
      if (activeChecks.size === 0) {
        view.dispatch(view.state.tr.setMeta('setChecking', false));
      }
    }
  })();

  activeChecks.set(sentenceHash, checkPromise);
}

function handleAcceptSuggestion(
  value: WritingAssistantState,
  suggestionId: string,
  newState: any
): WritingAssistantState {
  const suggestion = value.suggestions.find(s => s.id === suggestionId);
  if (!suggestion) {
    return value;
  }

  // Mark as accepted in persistent storage
  const reviewStatus = value.reviewedSentences.get(suggestion.sentenceHash);
  if (reviewStatus) {
    reviewStatus.status = 'accepted';
    persistReviewStatus(suggestion.sentenceHash, reviewStatus);
  }

  // Remove suggestion from state
  const newSuggestions = value.suggestions.filter(s => s.id !== suggestionId);
  const newDecorations = buildDecorations(newSuggestions, newState.doc);

  return {
    ...value,
    suggestions: newSuggestions,
    decorations: newDecorations,
    activeTooltip: null,
  };
}

function handleIgnoreSuggestion(
  value: WritingAssistantState,
  suggestionId: string
): WritingAssistantState {
  const suggestion = value.suggestions.find(s => s.id === suggestionId);
  if (!suggestion) {
    return value;
  }

  // Mark as ignored
  const reviewStatus = value.reviewedSentences.get(suggestion.sentenceHash);
  if (reviewStatus) {
    reviewStatus.status = 'ignored';
    persistReviewStatus(suggestion.sentenceHash, reviewStatus);
  }

  // Remove suggestion
  const newSuggestions = value.suggestions.filter(s => s.id !== suggestionId);

  return {
    ...value,
    suggestions: newSuggestions,
    decorations: buildDecorations(newSuggestions, null),
    activeTooltip: null,
  };
}

function handleSetSuggestions(
  value: WritingAssistantState,
  data: { sentenceHash: string; suggestions: Suggestion[]; sentenceStart: number; sentenceEnd: number },
  newState: any
): WritingAssistantState {
  const { sentenceHash, suggestions: newSuggestions, sentenceStart, sentenceEnd } = data;

  // Map suggestions to document positions
  const mappedSuggestions: Suggestion[] = [];

  for (const suggestion of newSuggestions) {
    // Find the original text within the sentence bounds only
    const sentenceText = newState.doc.textBetween(sentenceStart, sentenceEnd, ' ', ' ');
    const relativeIndex = sentenceText.indexOf(suggestion.originalText);

    if (relativeIndex !== -1) {
      const absoluteStart = sentenceStart + relativeIndex;
      const absoluteEnd = absoluteStart + suggestion.originalText.length;

      mappedSuggestions.push({
        ...suggestion,
        startPos: absoluteStart,
        endPos: absoluteEnd,
      });
    }
  }

  // Merge with existing suggestions (avoid duplicates)
  const allSuggestions = [
    ...value.suggestions.filter(s => s.sentenceHash !== sentenceHash),
    ...mappedSuggestions,
  ];

  // Build decorations
  const decorations = buildDecorations(allSuggestions, newState.doc);

  return {
    ...value,
    suggestions: allSuggestions,
    decorations,
  };
}

function handleDocumentChange(
  value: WritingAssistantState,
  tr: Transaction,
  newState: any
): WritingAssistantState {
  // Find affected suggestions
  const affectedSuggestionIds = new Set<string>();

  tr.mapping.maps.forEach(map => {
    map.forEach((oldStart, oldEnd, newStart, newEnd) => {
      // Find suggestions that overlap with edited range
      for (const suggestion of value.suggestions) {
        if (
          rangesOverlap(
            suggestion.startPos,
            suggestion.endPos,
            oldStart,
            oldEnd
          )
        ) {
          affectedSuggestionIds.add(suggestion.id);
        }
      }
    });
  });

  // Remove affected suggestions
  const newSuggestions = value.suggestions.filter(
    s => !affectedSuggestionIds.has(s.id)
  );

  // Map remaining suggestion positions through changes
  const mappedSuggestions = newSuggestions.map(s => ({
    ...s,
    startPos: tr.mapping.map(s.startPos),
    endPos: tr.mapping.map(s.endPos),
  }));

  // Rebuild decorations
  const decorations = buildDecorations(mappedSuggestions, newState.doc);

  return {
    ...value,
    suggestions: mappedSuggestions,
    decorations,
  };
}

function buildDecorations(
  suggestions: Suggestion[],
  doc: any
): DecorationSet {
  if (!doc) {
    return DecorationSet.empty;
  }

  const decorations: Decoration[] = [];

  for (const suggestion of suggestions) {
    const decoration = Decoration.inline(
      suggestion.startPos,
      suggestion.endPos,
      {
        class: `suggestion-highlight suggestion-${suggestion.category}`,
        'data-suggestion-id': suggestion.id,
      }
    );
    decorations.push(decoration);
  }

  return DecorationSet.create(doc, decorations);
}

function rangesOverlap(
  start1: number,
  end1: number,
  start2: number,
  end2: number
): boolean {
  return start1 < end2 && start2 < end1;
}
