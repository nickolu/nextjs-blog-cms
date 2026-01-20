import matter from 'gray-matter';

export interface Frontmatter {
  title: string;
  date: string;
  description: string;
  author: string;
  tags?: string[];
}

export interface ParsedMDX {
  frontmatter: Frontmatter;
  body: string;
}

// Parse MDX content into frontmatter and body
export function parseMDX(content: string): ParsedMDX {
  try {
    const { data, content: body } = matter(content);
    
    // Ensure required fields exist
    const frontmatter: Frontmatter = {
      title: data.title || '',
      date: data.date || '',
      description: data.description || '',
      author: data.author || 'Nickolus Cunningham',
      tags: Array.isArray(data.tags) ? data.tags : [],
    };
    
    return {
      frontmatter,
      body: body.trim(),
    };
  } catch (err) {
    console.error('Error parsing MDX:', err);
    throw new Error('Failed to parse MDX content');
  }
}

// Serialize frontmatter and body back into MDX format
export function serializeMDX(frontmatter: Frontmatter, body: string): string {
  try {
    // Clean up frontmatter - remove empty tags array
    const cleanFrontmatter = { ...frontmatter };
    if (!cleanFrontmatter.tags || cleanFrontmatter.tags.length === 0) {
      delete cleanFrontmatter.tags;
    }
    
    return matter.stringify(body, cleanFrontmatter);
  } catch (err) {
    console.error('Error serializing MDX:', err);
    throw new Error('Failed to serialize MDX content');
  }
}

// Validate frontmatter
export function validateFrontmatter(frontmatter: Partial<Frontmatter>): string[] {
  const errors: string[] = [];
  
  if (!frontmatter.title || frontmatter.title.trim() === '') {
    errors.push('Title is required');
  }
  
  if (!frontmatter.date || frontmatter.date.trim() === '') {
    errors.push('Date is required');
  } else {
    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(frontmatter.date)) {
      errors.push('Date must be in YYYY-MM-DD format');
    }
  }
  
  if (!frontmatter.description || frontmatter.description.trim() === '') {
    errors.push('Description is required');
  }
  
  if (!frontmatter.author || frontmatter.author.trim() === '') {
    errors.push('Author is required');
  }
  
  return errors;
}

// Generate a slug from title
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Create a new blank post with default frontmatter
export function createBlankPost(): string {
  const today = new Date().toISOString().split('T')[0];
  
  const frontmatter: Frontmatter = {
    title: 'New Blog Post',
    date: today,
    description: 'A brief description of your post',
    author: 'Nickolus Cunningham',
    tags: [],
  };
  
  const body = '# New Blog Post\n\nStart writing your content here...';
  
  return serializeMDX(frontmatter, body);
}
