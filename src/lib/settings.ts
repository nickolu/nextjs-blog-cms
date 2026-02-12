export interface Settings {
  aiAutocomplete: {
    enabled: boolean;
    model: string;
    systemPrompt?: string;
  };
  writingAssistant: {
    enabled: boolean;
    checkGrammar: boolean;
    checkSyntax: boolean;
    checkStyle: boolean;
    checkClarity: boolean;
    writingStyle: string;
    triggerMode: 'on-sentence-end' | 'on-pause';
    debounceDelay: number;
    showSeverity: ('error' | 'warning' | 'suggestion')[];
  };
}

const SETTINGS_STORAGE_KEY = 'blog-cms-settings';

const DEFAULT_SETTINGS: Settings = {
  aiAutocomplete: {
    enabled: true,
    model: 'gpt-5-mini',
    systemPrompt: undefined,
  },
  writingAssistant: {
    enabled: false,
    checkGrammar: true,
    checkSyntax: true,
    checkStyle: false,
    checkClarity: true,
    writingStyle: '',
    triggerMode: 'on-sentence-end',
    debounceDelay: 2000,
    showSeverity: ['error', 'warning', 'suggestion'],
  },
};

// Load settings from localStorage
export function loadSettings(): Settings {
  try {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults to ensure all fields exist
      return {
        ...DEFAULT_SETTINGS,
        aiAutocomplete: {
          ...DEFAULT_SETTINGS.aiAutocomplete,
          ...parsed.aiAutocomplete,
        },
        writingAssistant: {
          ...DEFAULT_SETTINGS.writingAssistant,
          ...parsed.writingAssistant,
        },
      };
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
  return DEFAULT_SETTINGS;
}

// Save settings to localStorage
export function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
}

// Get current settings (convenience function)
export function getSettings(): Settings {
  return loadSettings();
}

// Update settings (partial update)
export function updateSettings(updates: Partial<Settings>): Settings {
  const current = loadSettings();
  const updated: Settings = {
    ...current,
    ...updates,
    aiAutocomplete: {
      ...current.aiAutocomplete,
      ...(updates.aiAutocomplete || {}),
    },
    writingAssistant: {
      ...current.writingAssistant,
      ...(updates.writingAssistant || {}),
    },
  };
  saveSettings(updated);
  return updated;
}

// Get default settings
export function getDefaultSettings(): Settings {
  return { ...DEFAULT_SETTINGS };
}
