import { CloudinarySettings } from '../types/cloudinary';

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
    autoAdvanceToNextSuggestion: boolean;
  };
  editor: {
    font: 'system' | 'serif' | 'mono' | 'inter' | 'merriweather' | 'ibm-plex-mono' | 'noto-sans-mono' | 'suse-mono' | 'xanh-mono' | 'noto-serif' | 'pt-serif';
    theme: 'dark' | 'deep-blue' | 'midnight' | 'forest' | 'monokai';
  };
  cloudinary: CloudinarySettings;
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
    autoAdvanceToNextSuggestion: true,
  },
  editor: {
    font: 'system',
    theme: 'dark',
  },
  cloudinary: {
    enabled: false,
    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '',
    uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '',
    folder: 'blog-images',
    usePostFolders: false,
    transformations: {
      autoFormat: true,
      quality: 80,
      maxWidth: 1200,
    },
    validation: {
      maxFileSizeMB: 10,
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    },
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
        editor: {
          ...DEFAULT_SETTINGS.editor,
          ...parsed.editor,
        },
        cloudinary: {
          ...DEFAULT_SETTINGS.cloudinary,
          ...parsed.cloudinary,
          transformations: {
            ...DEFAULT_SETTINGS.cloudinary.transformations,
            ...parsed.cloudinary?.transformations,
          },
          validation: {
            ...DEFAULT_SETTINGS.cloudinary.validation,
            ...parsed.cloudinary?.validation,
          },
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
    editor: {
      ...current.editor,
      ...(updates.editor || {}),
    },
    cloudinary: {
      ...current.cloudinary,
      ...(updates.cloudinary || {}),
      transformations: {
        ...current.cloudinary.transformations,
        ...(updates.cloudinary?.transformations || {}),
      },
      validation: {
        ...current.cloudinary.validation,
        ...(updates.cloudinary?.validation || {}),
      },
    },
  };
  saveSettings(updated);
  return updated;
}

// Get default settings
export function getDefaultSettings(): Settings {
  return { ...DEFAULT_SETTINGS };
}
