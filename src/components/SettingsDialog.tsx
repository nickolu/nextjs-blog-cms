import React from 'react';
import { X, Settings as SettingsIcon } from 'lucide-react';
import { Settings, loadSettings, saveSettings } from '../lib/settings';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsChange?: (settings: Settings) => void;
}

const AVAILABLE_MODELS = [
  { value: 'gpt-5-mini', label: 'GPT-5 Mini - Fast & cost-efficient (Recommended)' },
  { value: 'gpt-4.1', label: 'GPT-4.1 - Smartest non-reasoning model' },
  { value: 'gpt-4o', label: 'GPT-4o - Balanced (Legacy)' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini - Fast & Cheap (Legacy)' },
  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo (Legacy)' },
  { value: 'gpt-4', label: 'GPT-4 (Legacy)' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo (Legacy)' },
];

export function SettingsDialog({ isOpen, onClose, onSettingsChange }: SettingsDialogProps) {
  const [settings, setSettings] = React.useState<Settings>(loadSettings());

  // Reload settings when dialog opens
  React.useEffect(() => {
    if (isOpen) {
      setSettings(loadSettings());
    }
  }, [isOpen]);

  const handleSave = () => {
    saveSettings(settings);
    onSettingsChange?.(settings);
    // Trigger storage event for same-tab updates
    window.dispatchEvent(new Event('storage'));
    onClose();
  };

  const handleCancel = () => {
    setSettings(loadSettings()); // Reset to saved settings
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <SettingsIcon className="text-gray-400" size={20} />
            <h2 className="text-lg font-semibold text-gray-100">Settings</h2>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-200 p-1 rounded hover:bg-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* AI Autocomplete Section */}
            <div>
              <h3 className="text-md font-semibold text-gray-200 mb-4">AI Autocomplete</h3>

              {/* Enable/Disable Toggle */}
              <div className="mb-4">
                <label className="flex items-center justify-between p-3 bg-gray-900 rounded border border-gray-700 hover:border-gray-600 cursor-pointer">
                  <span className="text-sm text-gray-300">Enable AI Autocomplete</span>
                  <input
                    type="checkbox"
                    checked={settings.aiAutocomplete.enabled}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        aiAutocomplete: {
                          ...settings.aiAutocomplete,
                          enabled: e.target.checked,
                        },
                      })
                    }
                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                  />
                </label>
              </div>

              {/* Model Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  AI Model
                </label>
                <select
                  value={settings.aiAutocomplete.model}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      aiAutocomplete: {
                        ...settings.aiAutocomplete,
                        model: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-gray-300 focus:outline-none focus:border-blue-500"
                >
                  {AVAILABLE_MODELS.map((model) => (
                    <option key={model.value} value={model.value}>
                      {model.label}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Select the OpenAI model to use for autocomplete suggestions
                </p>
              </div>

              {/* System Prompt */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Custom System Prompt (Optional)
                </label>
                <textarea
                  value={settings.aiAutocomplete.systemPrompt || ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      aiAutocomplete: {
                        ...settings.aiAutocomplete,
                        systemPrompt: e.target.value || undefined,
                      },
                    })
                  }
                  placeholder="Add custom instructions to guide the AI's writing style..."
                  rows={4}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-gray-300 placeholder-gray-600 focus:outline-none focus:border-blue-500 resize-none"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Add custom instructions to inject into the AI system prompt. Leave empty to use the default prompt.
                </p>
              </div>
            </div>

            {/* Writing Assistant Section */}
            <div>
              <h3 className="text-md font-semibold text-gray-200 mb-4">Writing Assistant</h3>

              {/* Enable/Disable Toggle */}
              <div className="mb-4">
                <label className="flex items-center justify-between p-3 bg-gray-900 rounded border border-gray-700 hover:border-gray-600 cursor-pointer">
                  <span className="text-sm text-gray-300">Enable Writing Assistant</span>
                  <input
                    type="checkbox"
                    checked={settings.writingAssistant.enabled}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        writingAssistant: {
                          ...settings.writingAssistant,
                          enabled: e.target.checked,
                        },
                      })
                    }
                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                  />
                </label>
              </div>

              {/* Check Types */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Check For
                </label>
                <div className="space-y-2">
                  <label className="flex items-center p-2 bg-gray-900 rounded border border-gray-700 hover:border-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.writingAssistant.checkGrammar}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          writingAssistant: {
                            ...settings.writingAssistant,
                            checkGrammar: e.target.checked,
                          },
                        })
                      }
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <span className="ml-2 text-sm text-gray-300">Grammar errors</span>
                  </label>

                  <label className="flex items-center p-2 bg-gray-900 rounded border border-gray-700 hover:border-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.writingAssistant.checkSyntax}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          writingAssistant: {
                            ...settings.writingAssistant,
                            checkSyntax: e.target.checked,
                          },
                        })
                      }
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <span className="ml-2 text-sm text-gray-300">Syntax issues</span>
                  </label>

                  <label className="flex items-center p-2 bg-gray-900 rounded border border-gray-700 hover:border-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.writingAssistant.checkClarity}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          writingAssistant: {
                            ...settings.writingAssistant,
                            checkClarity: e.target.checked,
                          },
                        })
                      }
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <span className="ml-2 text-sm text-gray-300">Clarity improvements</span>
                  </label>

                  <label className="flex items-center p-2 bg-gray-900 rounded border border-gray-700 hover:border-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.writingAssistant.checkStyle}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          writingAssistant: {
                            ...settings.writingAssistant,
                            checkStyle: e.target.checked,
                          },
                        })
                      }
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <span className="ml-2 text-sm text-gray-300">Style suggestions</span>
                  </label>
                </div>
              </div>

              {/* Writing Style */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Writing Style (Optional)
                </label>
                <textarea
                  value={settings.writingAssistant.writingStyle}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      writingAssistant: {
                        ...settings.writingAssistant,
                        writingStyle: e.target.value,
                      },
                    })
                  }
                  placeholder="e.g., Hemingwayesque writing style but entirely in 3rd person"
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-gray-300 placeholder-gray-600 focus:outline-none focus:border-blue-500 resize-none"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Describe your preferred writing style. Leave empty for general style suggestions.
                </p>
              </div>

              {/* Trigger Mode */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Check Trigger
                </label>
                <select
                  value={settings.writingAssistant.triggerMode}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      writingAssistant: {
                        ...settings.writingAssistant,
                        triggerMode: e.target.value as 'on-sentence-end' | 'on-pause',
                      },
                    })
                  }
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-gray-300 focus:outline-none focus:border-blue-500"
                >
                  <option value="on-sentence-end">After completing a sentence</option>
                  <option value="on-pause">After pausing (2 seconds)</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  When to check your writing for suggestions
                </p>
              </div>

              {/* Auto-advance Setting */}
              <div className="mb-4">
                <label className="flex items-center p-2 bg-gray-900 rounded border border-gray-700 hover:border-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.writingAssistant.autoAdvanceToNextSuggestion}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        writingAssistant: {
                          ...settings.writingAssistant,
                          autoAdvanceToNextSuggestion: e.target.checked,
                        },
                      })
                    }
                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="ml-2 text-sm text-gray-300">Auto-advance to next suggestion</span>
                </label>
                <p className="mt-1 text-xs text-gray-500">
                  Automatically show the next suggestion after accepting or ignoring one
                </p>
              </div>
            </div>

            {/* Editor Section */}
            <div>
              <h3 className="text-md font-semibold text-gray-200 mb-4">Editor</h3>

              {/* Theme Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Color Theme
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { value: 'dark', label: 'Dark', color: '#111827' },
                    { value: 'deep-blue', label: 'Deep Blue', color: '#0f172a' },
                    { value: 'midnight', label: 'Midnight', color: '#000000' },
                    { value: 'forest', label: 'Forest', color: '#0c1713' },
                    { value: 'monokai', label: 'Monokai', color: '#272822' },
                  ].map((theme) => (
                    <button
                      key={theme.value}
                      type="button"
                      onClick={() =>
                        setSettings({
                          ...settings,
                          editor: {
                            ...settings.editor,
                            theme: theme.value as Settings['editor']['theme'],
                          },
                        })
                      }
                      className={`flex flex-col items-center gap-2 p-3 rounded border-2 transition-colors ${
                        settings.editor.theme === theme.value
                          ? 'border-blue-500 bg-gray-800'
                          : 'border-gray-700 bg-gray-900 hover:border-gray-600'
                      }`}
                    >
                      <div
                        className="w-full h-8 rounded"
                        style={{ backgroundColor: theme.color }}
                      />
                      <span className="text-xs text-gray-300">{theme.label}</span>
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Choose a color theme for the editor and interface
                </p>
              </div>

              {/* Font Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Editor Font
                </label>
                <select
                  value={settings.editor.font}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      editor: {
                        ...settings.editor,
                        font: e.target.value as Settings['editor']['font'],
                      },
                    })
                  }
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-gray-300 focus:outline-none focus:border-blue-500"
                  style={{
                    fontFamily: (() => {
                      const fontMap: Record<Settings['editor']['font'], string> = {
                        system: 'system-ui',
                        serif: 'Georgia',
                        mono: 'monospace',
                        inter: 'Inter, sans-serif',
                        merriweather: 'Merriweather, serif',
                        'ibm-plex-mono': 'IBM Plex Mono, monospace',
                        'noto-sans-mono': 'Noto Sans Mono, monospace',
                        'suse-mono': 'SUSE Mono, monospace',
                        'xanh-mono': 'Xanh Mono, monospace',
                        'noto-serif': 'Noto Serif, serif',
                        'pt-serif': 'PT Serif, serif',
                      };
                      return fontMap[settings.editor.font];
                    })()
                  }}
                >
                  <optgroup label="System">
                    <option value="system" style={{ fontFamily: 'system-ui' }}>System Default</option>
                  </optgroup>
                  <optgroup label="Sans Serif">
                    <option value="inter" style={{ fontFamily: 'Inter, sans-serif' }}>Inter</option>
                  </optgroup>
                  <optgroup label="Serif">
                    <option value="serif" style={{ fontFamily: 'Georgia' }}>Serif (Georgia)</option>
                    <option value="merriweather" style={{ fontFamily: 'Merriweather, serif' }}>Merriweather</option>
                    <option value="noto-serif" style={{ fontFamily: 'Noto Serif, serif' }}>Noto Serif</option>
                    <option value="pt-serif" style={{ fontFamily: 'PT Serif, serif' }}>PT Serif</option>
                  </optgroup>
                  <optgroup label="Monospace">
                    <option value="mono" style={{ fontFamily: 'monospace' }}>Monospace</option>
                    <option value="ibm-plex-mono" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>IBM Plex Mono</option>
                    <option value="noto-sans-mono" style={{ fontFamily: 'Noto Sans Mono, monospace' }}>Noto Sans Mono</option>
                    <option value="suse-mono" style={{ fontFamily: 'SUSE Mono, monospace' }}>SUSE Mono</option>
                    <option value="xanh-mono" style={{ fontFamily: 'Xanh Mono, monospace' }}>Xanh Mono</option>
                  </optgroup>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Choose the font family for editor content
                </p>
              </div>
            </div>

            {/* Cloudinary Section */}
            <div>
              <h3 className="text-md font-semibold text-gray-200 mb-4">Cloudinary Image Upload</h3>

              {/* Enable toggle */}
              <div className="mb-4">
                <label className="flex items-center justify-between p-3 bg-gray-900 rounded border border-gray-700 hover:border-gray-600 cursor-pointer">
                  <span className="text-sm text-gray-300">Enable Cloudinary Upload</span>
                  <input
                    type="checkbox"
                    checked={settings.cloudinary.enabled}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        cloudinary: { ...settings.cloudinary, enabled: e.target.checked },
                      })
                    }
                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                  />
                </label>
              </div>

              {/* Cloud Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Cloud Name
                </label>
                <input
                  type="text"
                  value={settings.cloudinary.cloudName}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      cloudinary: { ...settings.cloudinary, cloudName: e.target.value },
                    })
                  }
                  placeholder="your-cloud-name"
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-gray-300 placeholder-gray-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Upload Preset */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Upload Preset
                </label>
                <input
                  type="text"
                  value={settings.cloudinary.uploadPreset}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      cloudinary: { ...settings.cloudinary, uploadPreset: e.target.value },
                    })
                  }
                  placeholder="unsigned-preset"
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-gray-300 placeholder-gray-600 focus:outline-none focus:border-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Create an unsigned upload preset in your Cloudinary dashboard
                </p>
              </div>

              {/* Folder */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Upload Folder
                </label>
                <input
                  type="text"
                  value={settings.cloudinary.folder}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      cloudinary: { ...settings.cloudinary, folder: e.target.value },
                    })
                  }
                  placeholder="blog-images"
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-gray-300 placeholder-gray-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Use Post Folders */}
              <div className="mb-4">
                <label className="flex items-center p-2 bg-gray-900 rounded border border-gray-700 hover:border-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.cloudinary.usePostFolders}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        cloudinary: { ...settings.cloudinary, usePostFolders: e.target.checked },
                      })
                    }
                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="ml-2 text-sm text-gray-300">Organize by post (creates subfolders)</span>
                </label>
              </div>

              {/* Transformations Section */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Image Transformations
                </label>

                {/* Auto Format */}
                <label className="flex items-center p-2 bg-gray-900 rounded border border-gray-700 hover:border-gray-600 cursor-pointer mb-2">
                  <input
                    type="checkbox"
                    checked={settings.cloudinary.transformations.autoFormat}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        cloudinary: {
                          ...settings.cloudinary,
                          transformations: {
                            ...settings.cloudinary.transformations,
                            autoFormat: e.target.checked,
                          },
                        },
                      })
                    }
                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="ml-2 text-sm text-gray-300">Auto format (WebP)</span>
                </label>

                {/* Quality */}
                <div className="mb-2">
                  <label className="block text-xs text-gray-400 mb-1">
                    Quality: {settings.cloudinary.transformations.quality}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={settings.cloudinary.transformations.quality}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        cloudinary: {
                          ...settings.cloudinary,
                          transformations: {
                            ...settings.cloudinary.transformations,
                            quality: parseInt(e.target.value),
                          },
                        },
                      })
                    }
                    className="w-full"
                  />
                </div>

                {/* Max Width */}
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    Max Width (px)
                  </label>
                  <input
                    type="number"
                    value={settings.cloudinary.transformations.maxWidth}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        cloudinary: {
                          ...settings.cloudinary,
                          transformations: {
                            ...settings.cloudinary.transformations,
                            maxWidth: parseInt(e.target.value) || 1200,
                          },
                        },
                      })
                    }
                    placeholder="1200"
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-gray-300 placeholder-gray-600 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Max File Size */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Max File Size (MB)
                </label>
                <input
                  type="number"
                  value={settings.cloudinary.validation.maxFileSizeMB}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      cloudinary: {
                        ...settings.cloudinary,
                        validation: {
                          ...settings.cloudinary.validation,
                          maxFileSizeMB: parseInt(e.target.value) || 10,
                        },
                      },
                    })
                  }
                  placeholder="10"
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-gray-300 placeholder-gray-600 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-700">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm text-gray-300 hover:text-gray-100 hover:bg-gray-700 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
