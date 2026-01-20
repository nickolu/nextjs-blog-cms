import React from 'react';
import { X } from 'lucide-react';
import { Frontmatter } from '../lib/mdx-parser';

interface FrontmatterFormProps {
  frontmatter: Frontmatter;
  onChange: (frontmatter: Frontmatter) => void;
  errors?: string[];
}

export function FrontmatterForm({ frontmatter, onChange, errors = [] }: FrontmatterFormProps) {
  const [newTag, setNewTag] = React.useState('');

  const handleChange = (field: keyof Frontmatter, value: string) => {
    onChange({
      ...frontmatter,
      [field]: value,
    });
  };

  const handleAddTag = () => {
    if (newTag.trim() && !frontmatter.tags?.includes(newTag.trim())) {
      onChange({
        ...frontmatter,
        tags: [...(frontmatter.tags || []), newTag.trim()],
      });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    onChange({
      ...frontmatter,
      tags: frontmatter.tags?.filter(t => t !== tag),
    });
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className="bg-white border-b p-4">
      <h2 className="text-lg font-semibold mb-4">Post Metadata</h2>
      
      {errors.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
          <ul className="text-sm text-red-700 list-disc list-inside">
            {errors.map((error, i) => (
              <li key={i}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="title">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={frontmatter.title}
            onChange={(e) => handleChange('title', e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Post title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="date">
            Date <span className="text-red-500">*</span>
          </label>
          <input
            id="date"
            type="date"
            value={frontmatter.date}
            onChange={(e) => handleChange('date', e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="description">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            value={frontmatter.description}
            onChange={(e) => handleChange('description', e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Brief description for SEO and post listings"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="author">
            Author <span className="text-red-500">*</span>
          </label>
          <input
            id="author"
            type="text"
            value={frontmatter.author}
            onChange={(e) => handleChange('author', e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Author name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="tags">
            Tags
          </label>
          <div className="flex gap-2 mb-2">
            <input
              id="tags"
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={handleTagKeyDown}
              className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add a tag"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add
            </button>
          </div>
          
          {frontmatter.tags && frontmatter.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {frontmatter.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-blue-900"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
