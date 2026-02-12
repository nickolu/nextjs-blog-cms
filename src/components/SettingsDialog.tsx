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
