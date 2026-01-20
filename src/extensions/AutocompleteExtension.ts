import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { getAICompletionDebounced, CompletionContext } from '../lib/ai-completion';

export interface AutocompleteOptions {
  enabled: boolean;
  delay: number;
  postTitle?: string;
  postDescription?: string;
}

interface AutocompleteState {
  suggestion: string | null;
  isLoading: boolean;
  decorations: DecorationSet;
  enabled: boolean;
}

const autocompletePluginKey = new PluginKey<AutocompleteState>('autocomplete');

export const AutocompleteExtension = Extension.create<AutocompleteOptions>({
  name: 'autocomplete',

  addOptions() {
    return {
      enabled: true,
      delay: 500,
      postTitle: undefined,
      postDescription: undefined,
    };
  },

  addProseMirrorPlugins() {
    const extension = this;

    return [
      new Plugin<AutocompleteState>({
        key: autocompletePluginKey,

        state: {
          init() {
            return {
              suggestion: null,
              isLoading: false,
              decorations: DecorationSet.empty,
              enabled: extension.options.enabled,
            };
          },

          apply(tr, value, _oldState, newState) {
            // Check for meta commands first
            const setEnabled = tr.getMeta('setAutocompleteEnabled');
            const clearSuggestion = tr.getMeta('clearSuggestion');
            const acceptSuggestion = tr.getMeta('acceptSuggestion');
            const newSuggestion = tr.getMeta('setSuggestion');
            const setLoading = tr.getMeta('setLoading');

            // Handle enabled state change
            if (setEnabled !== undefined) {
              const newEnabled = setEnabled as boolean;
              console.log('[Plugin apply] Setting enabled to:', newEnabled);
              return {
                suggestion: null,
                isLoading: false,
                decorations: DecorationSet.empty,
                enabled: newEnabled,
              };
            }

            // If autocomplete is disabled, return empty state
            if (!value.enabled) {
              return {
                suggestion: null,
                isLoading: false,
                decorations: DecorationSet.empty,
                enabled: value.enabled,
              };
            }

            if (clearSuggestion) {
              return {
                suggestion: null,
                isLoading: false,
                decorations: DecorationSet.empty,
                enabled: value.enabled,
              };
            }

            if (acceptSuggestion && value.suggestion) {
              // Suggestion will be inserted by command
              return {
                suggestion: null,
                isLoading: false,
                decorations: DecorationSet.empty,
                enabled: value.enabled,
              };
            }

            if (setLoading !== undefined) {
              return {
                ...value,
                enabled: value.enabled,
                isLoading: setLoading,
                // Add loading decoration if loading
                decorations: setLoading && !value.suggestion
                  ? DecorationSet.create(newState.doc, [
                      Decoration.widget(newState.selection.from, () => {
                        const span = document.createElement('span');
                        span.className = 'autocomplete-loading';
                        span.innerHTML = '<span class="dot"></span><span class="dot"></span><span class="dot"></span>';
                        return span;
                      })
                    ])
                  : value.decorations,
              };
            }

            if (newSuggestion !== undefined) {
              const { from, suggestion } = newSuggestion;
              
              if (!suggestion) {
                return {
                  suggestion: null,
                  isLoading: false,
                  decorations: DecorationSet.empty,
                  enabled: value.enabled,
                };
              }

              // Create decoration for the suggestion
              const decoration = Decoration.widget(from, () => {
                const span = document.createElement('span');
                span.className = 'suggestion-text';
                span.textContent = suggestion;
                span.setAttribute('data-suggestion', 'true');
                return span;
              });

              const decorationSet = DecorationSet.create(newState.doc, [decoration]);

              return {
                suggestion,
                isLoading: false,
                decorations: decorationSet,
                enabled: value.enabled,
              };
            }

            // If document changed (user typed), clear suggestion
            // But don't clear if we're explicitly setting or clearing suggestions
            if (tr.docChanged && !newSuggestion && !clearSuggestion && !acceptSuggestion) {
              return {
                suggestion: null,
                isLoading: false,
                decorations: DecorationSet.empty,
                enabled: value.enabled,
              };
            }

            // Map decorations through changes
            return {
              ...value,
              enabled: value.enabled,
              decorations: value.decorations.map(tr.mapping, tr.doc),
            };
          },
        },

        props: {
          decorations(state) {
            return this.getState(state)?.decorations;
          },

          handleKeyDown(view, event) {
            const state = autocompletePluginKey.getState(view.state);

            // Tab key - accept suggestion
            if (event.key === 'Tab' && state?.suggestion) {
              event.preventDefault();
              
              const { state: editorState, dispatch } = view;
              const { selection } = editorState;
              const { from } = selection;
              
              // Insert the suggestion
              const tr = editorState.tr.insertText(state.suggestion, from);
              tr.setMeta('clearSuggestion', true);
              dispatch(tr);
              
              return true;
            }

            // Escape key - clear suggestion
            if (event.key === 'Escape' && state?.suggestion) {
              event.preventDefault();
              
              const tr = view.state.tr.setMeta('clearSuggestion', true);
              view.dispatch(tr);
              
              return true;
            }

            return false;
          },

          // Handle text input to trigger completions
          handleTextInput(view) {
            const pluginState = autocompletePluginKey.getState(view.state);
            console.log('[handleTextInput] enabled:', pluginState?.enabled);
            if (!pluginState?.enabled) return false;

            // Wait for the next tick so the character is inserted into the document
            setTimeout(() => {
              // Check again after setTimeout in case it was disabled during the delay
              const currentPluginState = autocompletePluginKey.getState(view.state);
              console.log('[setTimeout] enabled:', currentPluginState?.enabled);
              if (!currentPluginState?.enabled) return;

              const state = view.state;
              const { selection } = state;
              const { from } = selection;

              // Set loading state
              view.dispatch(
                state.tr.setMeta('setLoading', true)
              );

              // Get context for completion (now includes the just-typed character)
              const textBeforeCursor = state.doc.textBetween(0, from, '\n', ' ');
              
              // Get current paragraph
              const $pos = state.doc.resolve(from);
              const currentParaStart = $pos.before($pos.depth);
              const currentParaEnd = $pos.after($pos.depth);
              const currentParagraph = state.doc.textBetween(
                currentParaStart,
                currentParaEnd,
                '\n',
                ' '
              );

              const context: CompletionContext = {
                textBeforeCursor,
                currentParagraph,
                postTitle: extension.options.postTitle,
                postDescription: extension.options.postDescription,
              };

              // Request completion (debounced)
              getAICompletionDebounced(context, extension.options.delay).then((suggestion) => {
                // Check if still enabled before setting suggestion
                const finalPluginState = autocompletePluginKey.getState(view.state);
                console.log('[then callback] enabled:', finalPluginState?.enabled, 'suggestion:', suggestion?.substring(0, 20));
                if (!finalPluginState?.enabled) {
                  console.log('[then callback] BLOCKED - autocomplete disabled');
                  return;
                }

                // Only set suggestion if cursor hasn't moved too far and we have a suggestion
                const currentState = view.state;
                const currentFrom = currentState.selection.from;
                
                // Allow small cursor movement (within 5 characters) to handle slight typing during debounce
                const cursorMoved = Math.abs(currentFrom - from);
                const allowSuggestion = cursorMoved <= 5 && suggestion;
                
                if (allowSuggestion) {
                  view.dispatch(
                    currentState.tr.setMeta('setSuggestion', {
                      from: currentFrom, // Use current cursor position, not the old one
                      suggestion,
                    })
                  );
                } else {
                  // Clear loading state
                  view.dispatch(
                    currentState.tr.setMeta('setLoading', false)
                  );
                }
              });
            }, 0); // End of setTimeout

            return false;
          },
        },
      }),
    ];
  },

  addCommands() {
    return {
      acceptAutocomplete:
        () =>
        ({ state, dispatch }: any) => {
          const pluginState = autocompletePluginKey.getState(state);
          
          if (!pluginState?.suggestion) {
            return false;
          }

          if (dispatch) {
            const { selection } = state;
            const tr = state.tr.insertText(pluginState.suggestion, selection.from);
            tr.setMeta('acceptSuggestion', true);
            dispatch(tr);
          }

          return true;
        },

      clearAutocomplete:
        () =>
        ({ state, dispatch }: any) => {
          if (dispatch) {
            dispatch(state.tr.setMeta('clearSuggestion', true));
          }
          return true;
        },
    } as any;
  },
});

// Helper to get current suggestion from editor
export function getCurrentSuggestion(editor: any): string | null {
  const state = autocompletePluginKey.getState(editor.state);
  return state?.suggestion || null;
}

// Helper to check if loading
export function isAutocompleteLoading(editor: any): boolean {
  const state = autocompletePluginKey.getState(editor.state);
  return state?.isLoading || false;
}
