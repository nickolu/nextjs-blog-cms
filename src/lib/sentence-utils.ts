import { Node as ProseMirrorNode } from '@tiptap/pm/model';
import { EditorState } from '@tiptap/pm/state';

// Common abbreviations that shouldn't trigger sentence end
const ABBREVIATIONS = new Set([
  'Dr', 'Mr', 'Mrs', 'Ms', 'Prof', 'Sr', 'Jr',
  'etc', 'vs', 'e.g', 'i.e', 'Ph.D', 'M.D',
  'Inc', 'Ltd', 'Corp', 'Co',
]);

// Sentence-ending punctuation
const SENTENCE_END_REGEX = /[.!?]+$/;

/**
 * Check if a position in the document is at a sentence end
 */
export function detectSentenceEnd(state: EditorState, pos: number): boolean {
  const { doc } = state;
  const $pos = doc.resolve(pos);

  // Get text around the position
  const textBefore = getTextBefore($pos, 50);

  // Check if we have sentence-ending punctuation followed by space or newline
  if (!SENTENCE_END_REGEX.test(textBefore.trim())) {
    return false;
  }

  // Check for abbreviations
  const words = textBefore.trim().split(/\s+/);
  const lastWord = words[words.length - 1];

  // Remove punctuation to check the word
  const wordWithoutPunct = lastWord.replace(/[.!?]+$/, '');

  // If it's an abbreviation, not a sentence end
  if (ABBREVIATIONS.has(wordWithoutPunct)) {
    return false;
  }

  // Check if it's a decimal number (e.g., 3.14)
  if (/\d+\.\d*$/.test(textBefore.trim())) {
    return false;
  }

  return true;
}

/**
 * Extract the sentence at the given position
 * Returns the sentence text, start position, and end position
 */
export function extractSentence(
  state: EditorState,
  pos: number
): { text: string; from: number; to: number } | null {
  const { doc } = state;
  const $pos = doc.resolve(pos);

  // Find sentence start (scan backward)
  let startPos = pos;
  let foundStart = false;

  // Scan backward to find sentence start
  while (startPos > 0 && !foundStart) {
    const $start = doc.resolve(startPos);
    const textBefore = getTextBefore($start, 10);

    // Check for sentence-ending punctuation
    if (SENTENCE_END_REGEX.test(textBefore) && startPos !== pos) {
      // Found previous sentence end
      foundStart = true;
      break;
    }

    // Check if we've reached the beginning of a paragraph
    if ($start.parentOffset === 0) {
      foundStart = true;
      break;
    }

    startPos--;
  }

  // Trim leading whitespace from start
  while (startPos < pos) {
    const $start = doc.resolve(startPos);
    const char = getCharAt($start);
    if (char && /\S/.test(char)) {
      break;
    }
    startPos++;
  }

  // Extract text from startPos to pos
  let text = '';
  try {
    text = doc.textBetween(startPos, pos, ' ', ' ');
  } catch (error) {
    console.error('Error extracting sentence text:', error);
    return null;
  }

  // Skip empty or whitespace-only sentences
  if (!text.trim()) {
    return null;
  }

  return {
    text: text.trim(),
    from: startPos,
    to: pos,
  };
}

/**
 * Generate a hash for a sentence to track it across sessions
 */
export async function hashSentence(text: string): Promise<string> {
  // Normalize the text (remove extra whitespace, lowercase)
  const normalized = text.trim().toLowerCase().replace(/\s+/g, ' ');

  // Use Web Crypto API to generate SHA-256 hash
  const encoder = new TextEncoder();
  const data = encoder.encode(normalized);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return hashHex;
}

/**
 * Check if a node should be checked for writing suggestions
 * Returns false for code blocks, links, etc.
 */
export function shouldCheckNode(node: ProseMirrorNode): boolean {
  // Don't check code blocks
  if (node.type.name === 'codeBlock') {
    return false;
  }

  // Don't check inline code
  if (node.marks.some(mark => mark.type.name === 'code')) {
    return false;
  }

  // Don't check links (but we can check the link text)
  // Skip if the entire node is a link
  if (node.type.name === 'link') {
    return false;
  }

  return true;
}

/**
 * Get text before a position (helper function)
 */
function getTextBefore($pos: any, maxChars: number): string {
  const { parent, parentOffset } = $pos;
  const start = Math.max(0, parentOffset - maxChars);
  const text = parent.textBetween(start, parentOffset, '', '');
  return text;
}

/**
 * Get character at a position (helper function)
 */
function getCharAt($pos: any): string | null {
  const { parent, parentOffset } = $pos;
  if (parentOffset >= parent.content.size) {
    return null;
  }
  return parent.textBetween(parentOffset, parentOffset + 1, '', '');
}

/**
 * Get preceding text for context (last N characters before the sentence)
 */
export function getPrecedingContext(
  state: EditorState,
  sentenceStart: number,
  maxChars: number = 500
): string {
  const { doc } = state;
  const start = Math.max(0, sentenceStart - maxChars);

  try {
    const text = doc.textBetween(start, sentenceStart, ' ', ' ');
    return text.trim();
  } catch (error) {
    console.error('Error getting preceding context:', error);
    return '';
  }
}
