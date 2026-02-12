import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import CodeBlock from '@tiptap/extension-code-block';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import HardBreak from '@tiptap/extension-hard-break';
import TurndownService from 'turndown';
import { marked } from 'marked';
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  Undo,
  Redo,
  Sparkles,
  MessageSquare,
  CheckCircle,
  Loader2,
  ScanText
} from 'lucide-react';
import { AutocompleteExtension } from '../extensions/AutocompleteExtension';
import { WritingAssistantExtension, writingAssistantPluginKey } from '../extensions/WritingAssistantExtension';
import { ImageUploadExtension } from '../extensions/ImageUploadExtension';
import { isAICompletionAvailable } from '../lib/ai-completion';
import { ReviewDialog } from './ReviewDialog';
import { WritingSuggestionTooltip } from './WritingSuggestionTooltip';
import { ImageUploadDialog } from './ImageUploadDialog';
import { Toast } from './Toast';
import { getSettings, updateSettings } from '../lib/settings';
import { Suggestion } from '../types/writing-assistant';

interface EditorProps {
  content: string;
  onChange: (markdown: string) => void;
  postTitle?: string;
  postDescription?: string;
}

// Initialize Turndown for HTML to Markdown conversion
const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  br: '  ', // Two spaces for hard breaks in Markdown
});

export function Editor({ content, onChange, postTitle, postDescription }: EditorProps) {
  const [isInitialLoad, setIsInitialLoad] = React.useState(true);
  const isUpdatingRef = React.useRef(false);
  const [autocompleteEnabled, setAutocompleteEnabled] = React.useState(() => getSettings().aiAutocomplete.enabled);
  const [writingAssistantEnabled, setWritingAssistantEnabled] = React.useState(() => getSettings().writingAssistant.enabled);
  const [editorFont, setEditorFont] = React.useState(() => getSettings().editor.font);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = React.useState(false);
  const [selectedTextForReview, setSelectedTextForReview] = React.useState('');
  const [activeTooltip, setActiveTooltip] = React.useState<{
    suggestion: Suggestion;
    position: { top: number; left: number };
  } | null>(null);
  const [isWritingAssistantChecking, setIsWritingAssistantChecking] = React.useState(false);
  const [suggestionCount, setSuggestionCount] = React.useState(0);
  const [isImageDialogOpen, setIsImageDialogOpen] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState<{
    message: string;
    type: 'success' | 'error' | 'loading';
  } | null>(null);
  const aiAvailable = isAICompletionAvailable();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        hardBreak: false, // We'll use custom HardBreak extension
      }),
      HardBreak.extend({
        addKeyboardShortcuts() {
          return {
            'Shift-Enter': () => this.editor.commands.setHardBreak(),
          };
        },
      }),
      CodeBlock,
      Image,
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder: 'Start writing your blog post...',
      }),
      AutocompleteExtension.configure({
        enabled: true, // Will be controlled via extension options
        delay: 500,
        postTitle,
        postDescription,
      }),
      WritingAssistantExtension.configure({
        enabled: writingAssistantEnabled,
        debounceDelay: getSettings().writingAssistant.debounceDelay,
        settings: getSettings().writingAssistant,
      }),
      ImageUploadExtension.configure({
        enabled: true,
        postTitle,
        onUploadStart: () => {
          setToastMessage({ message: 'Uploading image...', type: 'loading' });
        },
        onUploadSuccess: (url) => {
          setToastMessage({ message: 'Image uploaded successfully!', type: 'success' });
        },
        onUploadError: (error) => {
          setToastMessage({ message: error, type: 'error' });
        },
      }),
    ],
    content: '',
    onUpdate: ({ editor }) => {
      isUpdatingRef.current = true;
      const html = editor.getHTML();
      const markdown = turndownService.turndown(html);
      onChange(markdown);
      // Reset flag after React has processed the state update
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 0);
    },
  });

  // Update autocomplete extension options when settings change
  React.useEffect(() => {
    if (!editor) return;

    // Update options using updateAttributes to trigger reactivity
    const autocompleteExt = editor.extensionManager.extensions.find(
      (ext) => ext.name === 'autocomplete'
    );

    if (autocompleteExt) {
      const newEnabled = autocompleteEnabled && aiAvailable;
      console.log('[Editor useEffect] Setting enabled to:', newEnabled);

      // Update options for context (title/description)
      (autocompleteExt.options as any).postTitle = postTitle;
      (autocompleteExt.options as any).postDescription = postDescription;

      // Dispatch transaction to update plugin state
      const tr = editor.state.tr.setMeta('setAutocompleteEnabled', newEnabled);
      editor.view.dispatch(tr);
    }
  }, [editor, autocompleteEnabled, aiAvailable, postTitle, postDescription]);

  // Update writing assistant extension when settings change
  React.useEffect(() => {
    if (!editor) return;

    const writingAssistantExt = editor.extensionManager.extensions.find(
      (ext) => ext.name === 'writingAssistant'
    );

    if (writingAssistantExt) {
      const newEnabled = writingAssistantEnabled && aiAvailable;

      // Update options
      (writingAssistantExt.options as any).enabled = newEnabled;
      (writingAssistantExt.options as any).settings = getSettings().writingAssistant;

      // Dispatch transaction to update plugin state
      const tr = editor.state.tr.setMeta('setWritingAssistantEnabled', newEnabled);
      editor.view.dispatch(tr);
    }
  }, [editor, writingAssistantEnabled, aiAvailable]);

  // Update editor font when settings change
  React.useEffect(() => {
    const settings = getSettings();
    setEditorFont(settings.editor.font);
  }, []);

  // Listen for settings changes
  React.useEffect(() => {
    const handleSettingsChange = () => {
      const settings = getSettings();
      setEditorFont(settings.editor.font);
    };

    // Listen for storage events (settings changed in another tab or same tab)
    window.addEventListener('storage', handleSettingsChange);
    return () => window.removeEventListener('storage', handleSettingsChange);
  }, []);

  // Listen for tooltip events from the plugin
  React.useEffect(() => {
    if (!editor) return;

    const handleTransaction = () => {
      const pluginState = writingAssistantPluginKey.getState(editor.state);
      if (!pluginState) return;

      // Update tooltip state
      if (pluginState.activeTooltip) {
        const suggestion = pluginState.suggestions.find(
          s => s.id === pluginState.activeTooltip!.suggestionId
        );
        if (suggestion) {
          setActiveTooltip({
            suggestion,
            position: pluginState.activeTooltip.position,
          });
        }
      } else {
        setActiveTooltip(null);
      }

      // Update checking state
      setIsWritingAssistantChecking(pluginState.isChecking);

      // Update suggestion count
      setSuggestionCount(pluginState.suggestions.length);
    };

    editor.on('transaction', handleTransaction);
    return () => {
      editor.off('transaction', handleTransaction);
    };
  }, [editor]);

  // Convert markdown to HTML and set it in the editor only on initial load or external content changes
  React.useEffect(() => {
    if (!editor) return;

    // Don't update if the change came from the editor itself
    if (isUpdatingRef.current) return;

    // Don't update if it's not the initial load (external change detection)
    if (!isInitialLoad) return;

    const convertAndSetContent = async () => {
      try {
        const html = await marked(content);
        editor.commands.setContent(html);
        setIsInitialLoad(false);
      } catch (err) {
        console.error('Error converting markdown:', err);
        editor.commands.setContent(content);
        setIsInitialLoad(false);
      }
    };

    convertAndSetContent();
  }, [editor, content, isInitialLoad]);

  // Reset initial load flag when content prop changes (but not from editor updates)
  React.useEffect(() => {
    if (!isUpdatingRef.current) {
      setIsInitialLoad(true);
    }
  }, [content]);

  if (!editor) {
    return null;
  }

  const addLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const addImage = () => {
    setIsImageDialogOpen(true);
  };

  const handleAutocompleteToggle = () => {
    const newEnabled = !autocompleteEnabled;
    setAutocompleteEnabled(newEnabled);
    updateSettings({
      aiAutocomplete: {
        ...getSettings().aiAutocomplete,
        enabled: newEnabled,
      },
    });
  };

  const handleWritingAssistantToggle = () => {
    const newEnabled = !writingAssistantEnabled;
    setWritingAssistantEnabled(newEnabled);
    updateSettings({
      writingAssistant: {
        ...getSettings().writingAssistant,
        enabled: newEnabled,
      },
    });
  };

  const handleAcceptSuggestion = (suggestionId: string) => {
    if (!editor) return;
    editor.chain().acceptSuggestion(suggestionId).run();
    setActiveTooltip(null);

    // Auto-advance if enabled
    const settings = getSettings();
    if (settings.writingAssistant.autoAdvanceToNextSuggestion && suggestionCount > 1) {
      setTimeout(() => {
        handleShowNextSuggestion();
      }, 100);
    }
  };

  const handleIgnoreSuggestion = (suggestionId: string) => {
    if (!editor) return;
    editor.chain().ignoreSuggestion(suggestionId).run();
    setActiveTooltip(null);

    // Auto-advance if enabled
    const settings = getSettings();
    if (settings.writingAssistant.autoAdvanceToNextSuggestion && suggestionCount > 1) {
      setTimeout(() => {
        handleShowNextSuggestion();
      }, 100);
    }
  };

  const handleDismissTooltip = () => {
    if (!editor) return;
    editor.chain().hideSuggestionTooltip().run();
    setActiveTooltip(null);
  };

  const handleCheckWritingNow = () => {
    if (!editor) return;
    editor.chain().focus().checkWritingNow().run();
  };

  const handleShowNextSuggestion = () => {
    if (!editor) return;
    editor.chain().focus().showNextSuggestion().run();
  };

  const handleAIReview = () => {
    if (!editor) return;

    const { from, to } = editor.state.selection;
    let textToReview = '';

    if (from === to) {
      // No selection - use entire document
      textToReview = editor.state.doc.textBetween(0, editor.state.doc.content.size, '\n\n');
    } else {
      // Use selected text
      textToReview = editor.state.doc.textBetween(from, to, '\n\n');
    }

    if (!textToReview.trim()) {
      return;
    }

    setSelectedTextForReview(textToReview);
    setIsReviewDialogOpen(true);
  };

  const handleRewrite = (newText: string) => {
    if (!editor) return;

    const { from, to } = editor.state.selection;

    if (from === to) {
      // Replace entire document
      editor.commands.setContent(newText);
    } else {
      // Replace selected text
      editor.chain().focus().deleteRange({ from, to }).insertContent(newText).run();
    }
  };

  return (
    <div className="flex flex-col h-full theme-bg-primary">
      {/* Toolbar */}
      <div className="border-b theme-border p-2 flex flex-wrap gap-1 theme-bg-secondary">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded theme-text-muted hover:bg-gray-700 hover:theme-text-primary ${editor.isActive('bold') ? 'bg-gray-700 text-blue-400' : ''}`}
          title="Bold"
        >
          <Bold size={16} />
        </button>
        
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded theme-text-muted hover:bg-gray-700 hover:theme-text-primary ${editor.isActive('italic') ? 'bg-gray-700 text-blue-400' : ''}`}
          title="Italic"
        >
          <Italic size={16} />
        </button>

        <div className="w-px bg-gray-600 mx-1" />

        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-1.5 rounded theme-text-muted hover:bg-gray-700 hover:theme-text-primary ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-700 text-blue-400' : ''}`}
          title="Heading 1"
        >
          <Heading1 size={16} />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-1.5 rounded theme-text-muted hover:bg-gray-700 hover:theme-text-primary ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-700 text-blue-400' : ''}`}
          title="Heading 2"
        >
          <Heading2 size={16} />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-1.5 rounded theme-text-muted hover:bg-gray-700 hover:theme-text-primary ${editor.isActive('heading', { level: 3 }) ? 'bg-gray-700 text-blue-400' : ''}`}
          title="Heading 3"
        >
          <Heading3 size={16} />
        </button>

        <div className="w-px bg-gray-600 mx-1" />

        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded theme-text-muted hover:bg-gray-700 hover:theme-text-primary ${editor.isActive('bulletList') ? 'bg-gray-700 text-blue-400' : ''}`}
          title="Bullet List"
        >
          <List size={16} />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded theme-text-muted hover:bg-gray-700 hover:theme-text-primary ${editor.isActive('orderedList') ? 'bg-gray-700 text-blue-400' : ''}`}
          title="Ordered List"
        >
          <ListOrdered size={16} />
        </button>

        <div className="w-px bg-gray-600 mx-1" />

        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`p-1.5 rounded theme-text-muted hover:bg-gray-700 hover:theme-text-primary ${editor.isActive('codeBlock') ? 'bg-gray-700 text-blue-400' : ''}`}
          title="Code Block"
        >
          <Code size={16} />
        </button>

        <button
          onClick={addLink}
          className={`p-1.5 rounded theme-text-muted hover:bg-gray-700 hover:theme-text-primary ${editor.isActive('link') ? 'bg-gray-700 text-blue-400' : ''}`}
          title="Add Link"
        >
          <LinkIcon size={16} />
        </button>

        <button
          onClick={addImage}
          className="p-1.5 rounded theme-text-muted hover:bg-gray-700 hover:theme-text-primary"
          title="Add Image"
        >
          <ImageIcon size={16} />
        </button>

        <div className="w-px bg-gray-600 mx-1" />

        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-1.5 rounded theme-text-muted hover:bg-gray-700 hover:theme-text-primary disabled:opacity-30"
          title="Undo"
        >
          <Undo size={16} />
        </button>

        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-1.5 rounded theme-text-muted hover:bg-gray-700 hover:theme-text-primary disabled:opacity-30"
          title="Redo"
        >
          <Redo size={16} />
        </button>

        {aiAvailable && (
          <>
            <div className="w-px bg-gray-600 mx-1" />

            <button
              onClick={handleAutocompleteToggle}
              className={`p-1.5 rounded ${
                autocompleteEnabled ? 'bg-gray-700 text-yellow-400' : 'theme-text-muted hover:bg-gray-700'
              }`}
              title={`AI Autocomplete - ${autocompleteEnabled ? 'Enabled' : 'Disabled'}\nAutomatically suggests text completions as you write`}
            >
              <Sparkles size={16} />
            </button>

            <button
              onClick={handleAIReview}
              className="p-1.5 rounded theme-text-muted hover:bg-gray-700 hover:theme-text-primary"
              title="AI Review - Get feedback on your writing\nSelect text or review entire document"
            >
              <MessageSquare size={16} />
            </button>

            <button
              onClick={handleWritingAssistantToggle}
              className={`p-1.5 rounded ${
                writingAssistantEnabled
                  ? 'bg-gray-700 text-green-400'
                  : 'theme-text-muted hover:bg-gray-700'
              }`}
              title={`Writing Assistant - ${writingAssistantEnabled ? 'Enabled' : 'Disabled'}\nReal-time grammar, style, and clarity suggestions`}
            >
              <CheckCircle size={16} />
            </button>

            {writingAssistantEnabled && (
              <button
                onClick={handleCheckWritingNow}
                className="p-1.5 rounded theme-text-muted hover:bg-gray-700 hover:theme-text-primary"
                title="Check Now - Manually check writing\nClick to analyze current sentence or all sentences in selection"
                disabled={isWritingAssistantChecking}
              >
                {isWritingAssistantChecking ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <ScanText size={16} />
                )}
              </button>
            )}
          </>
        )}

        {/* Spacer to push counter/loader to the right */}
        <div className="flex-1" />

        {/* Writing Assistant Status - right aligned */}
        {aiAvailable && writingAssistantEnabled && (
          <>
            {/* Show spinner when checking */}
            {isWritingAssistantChecking && (
              <div
                className="flex items-center text-blue-400 px-2"
                title="Writing Assistant is analyzing your text..."
              >
                <Loader2 size={16} className="animate-spin" />
              </div>
            )}

            {/* Show counter when not checking and suggestions exist */}
            {!isWritingAssistantChecking && suggestionCount > 0 && (
              <button
                onClick={handleShowNextSuggestion}
                className="flex items-center gap-2 px-3 py-1 text-sm bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded border border-red-600/40 transition-colors"
                title={`${suggestionCount} suggestion${suggestionCount > 1 ? 's' : ''} - Click to view next`}
              >
                <span className="font-medium">{suggestionCount}</span>
                <span className="text-xs">issue{suggestionCount > 1 ? 's' : ''}</span>
              </button>
            )}
          </>
        )}
      </div>

      {/* Editor Content */}
      <div
        className="flex-1 overflow-y-auto theme-bg-primary"
        style={{
          '--editor-font-family': `var(--editor-font-${editorFont})`
        } as React.CSSProperties}
      >
        <EditorContent editor={editor} />
      </div>

      {/* Review Dialog */}
      <ReviewDialog
        isOpen={isReviewDialogOpen}
        onClose={() => setIsReviewDialogOpen(false)}
        selectedText={selectedTextForReview}
        postTitle={postTitle}
        postDescription={postDescription}
        onRewrite={handleRewrite}
      />

      {/* Writing Suggestion Tooltip */}
      {activeTooltip && (
        <WritingSuggestionTooltip
          suggestion={activeTooltip.suggestion}
          position={activeTooltip.position}
          onAccept={handleAcceptSuggestion}
          onIgnore={handleIgnoreSuggestion}
          onDismiss={handleDismissTooltip}
        />
      )}

      {/* Image Upload Dialog */}
      <ImageUploadDialog
        isOpen={isImageDialogOpen}
        onClose={() => setIsImageDialogOpen(false)}
        onImageInsert={(url) => {
          editor?.chain().focus().setImage({ src: url }).run();
          setIsImageDialogOpen(false);
        }}
        postTitle={postTitle}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <Toast
          message={toastMessage.message}
          type={toastMessage.type}
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
}
