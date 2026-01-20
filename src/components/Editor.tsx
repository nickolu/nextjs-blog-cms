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
  MessageSquare
} from 'lucide-react';
import { AutocompleteExtension } from '../extensions/AutocompleteExtension';
import { isAICompletionAvailable } from '../lib/ai-completion';
import { ReviewDialog } from './ReviewDialog';

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
  const [autocompleteEnabled, setAutocompleteEnabled] = React.useState(true);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = React.useState(false);
  const [selectedTextForReview, setSelectedTextForReview] = React.useState('');
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
    
    editor.extensionManager.extensions.forEach((extension) => {
      if (extension.name === 'autocomplete') {
        extension.options.enabled = autocompleteEnabled && aiAvailable;
        extension.options.postTitle = postTitle;
        extension.options.postDescription = postDescription;
      }
    });
  }, [editor, autocompleteEnabled, aiAvailable, postTitle, postDescription]);

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
    const url = prompt('Enter image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
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
    <div className="flex flex-col h-full bg-gray-900">
      {/* Toolbar */}
      <div className="border-b border-gray-700 p-2 flex flex-wrap gap-1 bg-gray-800">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded text-gray-400 hover:bg-gray-700 hover:text-gray-200 ${editor.isActive('bold') ? 'bg-gray-700 text-blue-400' : ''}`}
          title="Bold"
        >
          <Bold size={16} />
        </button>
        
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded text-gray-400 hover:bg-gray-700 hover:text-gray-200 ${editor.isActive('italic') ? 'bg-gray-700 text-blue-400' : ''}`}
          title="Italic"
        >
          <Italic size={16} />
        </button>

        <div className="w-px bg-gray-600 mx-1" />

        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-1.5 rounded text-gray-400 hover:bg-gray-700 hover:text-gray-200 ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-700 text-blue-400' : ''}`}
          title="Heading 1"
        >
          <Heading1 size={16} />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-1.5 rounded text-gray-400 hover:bg-gray-700 hover:text-gray-200 ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-700 text-blue-400' : ''}`}
          title="Heading 2"
        >
          <Heading2 size={16} />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-1.5 rounded text-gray-400 hover:bg-gray-700 hover:text-gray-200 ${editor.isActive('heading', { level: 3 }) ? 'bg-gray-700 text-blue-400' : ''}`}
          title="Heading 3"
        >
          <Heading3 size={16} />
        </button>

        <div className="w-px bg-gray-600 mx-1" />

        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded text-gray-400 hover:bg-gray-700 hover:text-gray-200 ${editor.isActive('bulletList') ? 'bg-gray-700 text-blue-400' : ''}`}
          title="Bullet List"
        >
          <List size={16} />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded text-gray-400 hover:bg-gray-700 hover:text-gray-200 ${editor.isActive('orderedList') ? 'bg-gray-700 text-blue-400' : ''}`}
          title="Ordered List"
        >
          <ListOrdered size={16} />
        </button>

        <div className="w-px bg-gray-600 mx-1" />

        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`p-1.5 rounded text-gray-400 hover:bg-gray-700 hover:text-gray-200 ${editor.isActive('codeBlock') ? 'bg-gray-700 text-blue-400' : ''}`}
          title="Code Block"
        >
          <Code size={16} />
        </button>

        <button
          onClick={addLink}
          className={`p-1.5 rounded text-gray-400 hover:bg-gray-700 hover:text-gray-200 ${editor.isActive('link') ? 'bg-gray-700 text-blue-400' : ''}`}
          title="Add Link"
        >
          <LinkIcon size={16} />
        </button>

        <button
          onClick={addImage}
          className="p-1.5 rounded text-gray-400 hover:bg-gray-700 hover:text-gray-200"
          title="Add Image"
        >
          <ImageIcon size={16} />
        </button>

        <div className="w-px bg-gray-600 mx-1" />

        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-1.5 rounded text-gray-400 hover:bg-gray-700 hover:text-gray-200 disabled:opacity-30"
          title="Undo"
        >
          <Undo size={16} />
        </button>

        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-1.5 rounded text-gray-400 hover:bg-gray-700 hover:text-gray-200 disabled:opacity-30"
          title="Redo"
        >
          <Redo size={16} />
        </button>

        {aiAvailable && (
          <>
            <div className="w-px bg-gray-600 mx-1" />
            
            <button
              onClick={() => setAutocompleteEnabled(!autocompleteEnabled)}
              className={`p-1.5 rounded text-gray-400 hover:bg-gray-700 hover:text-gray-200 ${
                autocompleteEnabled ? 'bg-gray-700 text-yellow-400' : ''
              }`}
              title={autocompleteEnabled ? 'AI Autocomplete: On' : 'AI Autocomplete: Off'}
            >
              <Sparkles size={16} />
            </button>
            
            <button
              onClick={handleAIReview}
              className="p-1.5 rounded text-gray-400 hover:bg-gray-700 hover:text-gray-200"
              title="AI Review"
            >
              <MessageSquare size={16} />
            </button>
          </>
        )}
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-y-auto bg-gray-900">
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
    </div>
  );
}
