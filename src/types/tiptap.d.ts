import '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    writingAssistant: {
      /**
       * Set the writing assistant enabled state
       */
      setWritingAssistantEnabled: (enabled: boolean) => ReturnType;
      /**
       * Accept a suggestion
       */
      acceptSuggestion: (suggestionId: string) => ReturnType;
      /**
       * Ignore a suggestion
       */
      ignoreSuggestion: (suggestionId: string) => ReturnType;
      /**
       * Show suggestion tooltip
       */
      showSuggestionTooltip: (data: {
        suggestionId: string;
        position: { top: number; left: number };
      }) => ReturnType;
      /**
       * Hide suggestion tooltip
       */
      hideSuggestionTooltip: () => ReturnType;
      /**
       * Check writing now (manually trigger check)
       */
      checkWritingNow: () => ReturnType;
      /**
       * Show next suggestion
       */
      showNextSuggestion: () => ReturnType;
    };
  }
}
