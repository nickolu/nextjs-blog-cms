import OpenAI from 'openai';

// Initialize OpenAI client
let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI | null {
  if (!openai) {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
      console.warn('VITE_OPENAI_API_KEY not set. AI autocomplete will be disabled.');
      return null;
    }
    openai = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true, // Required for client-side usage
    });
  }
  return openai;
}

export interface CompletionContext {
  textBeforeCursor: string;
  currentParagraph: string;
  postTitle?: string;
  postDescription?: string;
}

// Cache to avoid duplicate requests
const completionCache = new Map<string, { completion: string; timestamp: number }>();
const CACHE_TTL = 60000; // 1 minute

function getCacheKey(context: CompletionContext): string {
  return `${context.textBeforeCursor.slice(-200)}|${context.currentParagraph}`;
}

function getCachedCompletion(context: CompletionContext): string | null {
  const key = getCacheKey(context);
  const cached = completionCache.get(key);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.completion;
  }
  
  if (cached) {
    completionCache.delete(key);
  }
  
  return null;
}

function setCachedCompletion(context: CompletionContext, completion: string): void {
  const key = getCacheKey(context);
  completionCache.set(key, { completion, timestamp: Date.now() });
  
  // Limit cache size
  if (completionCache.size > 50) {
    const firstKey = completionCache.keys().next().value;
    if (firstKey) {
      completionCache.delete(firstKey);
    }
  }
}

export async function getAICompletion(context: CompletionContext): Promise<string | null> {
  const client = getOpenAIClient();
  if (!client) {
    return null;
  }

  // Check cache first
  const cached = getCachedCompletion(context);
  if (cached) {
    return cached;
  }

  // Don't complete if there's not enough context
  if (context.textBeforeCursor.trim().length < 10) {
    return null;
  }

  try {
    // Build prompt with context
    const systemPrompt = `You are a helpful writing assistant. Continue the text naturally based on the context. 
Keep completions concise (1-2 sentences max). Match the writing style and tone.
Only provide the continuation text, without repeating what was already written.`;

    let userPrompt = '';
    if (context.postTitle || context.postDescription) {
      userPrompt += 'Blog post context:\n';
      if (context.postTitle) userPrompt += `Title: ${context.postTitle}\n`;
      if (context.postDescription) userPrompt += `Description: ${context.postDescription}\n`;
      userPrompt += '\n';
    }
    
    userPrompt += 'Text to continue:\n';
    userPrompt += context.textBeforeCursor.slice(-1000); // Last 1000 chars

    const response = await client.chat.completions.create({
      model: import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 100,
      temperature: 0.7,
      stream: false,
    });

    const completion = response.choices[0]?.message?.content?.trim() || null;
    
    if (completion) {
      setCachedCompletion(context, completion);
    }
    
    return completion;
  } catch (error) {
    console.error('AI completion error:', error);
    return null;
  }
}

// Debounced version for editor use
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

export function getAICompletionDebounced(
  context: CompletionContext,
  delay: number = 500
): Promise<string | null> {
  return new Promise((resolve) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    debounceTimer = setTimeout(async () => {
      const completion = await getAICompletion(context);
      resolve(completion);
    }, delay);
  });
}

export function isAICompletionAvailable(): boolean {
  return !!import.meta.env.VITE_OPENAI_API_KEY;
}

export interface ReviewContext {
  text: string;
  postTitle?: string;
  postDescription?: string;
}

export async function getWritingReview(context: ReviewContext): Promise<string | null> {
  const client = getOpenAIClient();
  if (!client) {
    return null;
  }

  try {
    const systemPrompt = `You are an expert writing coach. Provide constructive feedback on writing quality, focusing on:
- Tone and voice
- Grammar and punctuation
- Sentence structure and syntax
- Clarity and readability
- Overall writing quality

Provide specific, actionable feedback. Do NOT rewrite the text - only give feedback.`;

    let userPrompt = '';
    if (context.postTitle || context.postDescription) {
      userPrompt += 'Context:\n';
      if (context.postTitle) userPrompt += `Post Title: ${context.postTitle}\n`;
      if (context.postDescription) userPrompt += `Post Description: ${context.postDescription}\n`;
      userPrompt += '\n';
    }
    
    userPrompt += 'Please review this writing:\n\n';
    userPrompt += context.text;

    const response = await client.chat.completions.create({
      model: import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content?.trim() || null;
  } catch (error) {
    console.error('AI review error:', error);
    return null;
  }
}

export interface RewriteContext {
  originalText: string;
  feedback: string;
  additionalInput?: string;
  postTitle?: string;
  postDescription?: string;
}

export async function rewriteWithFeedback(context: RewriteContext): Promise<string | null> {
  const client = getOpenAIClient();
  if (!client) {
    return null;
  }

  try {
    const systemPrompt = `You are an expert writing assistant. Rewrite the provided text based on the feedback given. Maintain the original meaning and key points while improving the writing quality.`;

    let userPrompt = '';
    if (context.postTitle || context.postDescription) {
      userPrompt += 'Context:\n';
      if (context.postTitle) userPrompt += `Post Title: ${context.postTitle}\n`;
      if (context.postDescription) userPrompt += `Post Description: ${context.postDescription}\n`;
      userPrompt += '\n';
    }
    
    userPrompt += 'Original text:\n';
    userPrompt += context.originalText;
    userPrompt += '\n\nFeedback to address:\n';
    userPrompt += context.feedback;
    
    if (context.additionalInput) {
      userPrompt += '\n\nAdditional instructions:\n';
      userPrompt += context.additionalInput;
    }
    
    userPrompt += '\n\nPlease rewrite the text addressing the feedback. Return only the rewritten text, no explanations.';

    const response = await client.chat.completions.create({
      model: import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content?.trim() || null;
  } catch (error) {
    console.error('AI rewrite error:', error);
    return null;
  }
}
