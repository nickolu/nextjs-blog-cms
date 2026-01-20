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
    <div className="bg-gray-800 p-4">
      {errors.length > 0 && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded">
          <ul className="text-sm text-red-400 list-disc list-inside">
            {errors.map((error, i) => (
              <li key={i}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-400" htmlFor="title">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={frontmatter.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full px-3 py-1.5 bg-gray-900 border border-gray-700 rounded text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Post title"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1 text-gray-400" htmlFor="date">
              Date <span className="text-red-400">*</span>
            </label>
            <input
              id="date"
              type="date"
              value={frontmatter.date}
              onChange={(e) => handleChange('date', e.target.value)}
              className="w-full px-3 py-1.5 bg-gray-900 border border-gray-700 rounded text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium mb-1 text-gray-400" htmlFor="description">
            Description <span className="text-red-400">*</span>
          </label>
          <textarea
            id="description"
            value={frontmatter.description}
            onChange={(e) => handleChange('description', e.target.value)}
            className="w-full px-3 py-1.5 bg-gray-900 border border-gray-700 rounded text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            rows={2}
            placeholder="Brief description"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-400" htmlFor="author">
              Author <span className="text-red-400">*</span>
            </label>
            <input
              id="author"
              type="text"
              value={frontmatter.author}
              onChange={(e) => handleChange('author', e.target.value)}
              className="w-full px-3 py-1.5 bg-gray-900 border border-gray-700 rounded text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Author name"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1 text-gray-400" htmlFor="tags">
              Tags
            </label>
            <div className="flex gap-2">
              <input
                id="tags"
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={handleTagKeyDown}
                className="flex-1 px-3 py-1.5 bg-gray-900 border border-gray-700 rounded text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add tag"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                Add
              </button>
            </div>
          </div>
        </div>
        
        {frontmatter.tags && frontmatter.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {frontmatter.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-900/40 text-blue-300 rounded text-xs"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-blue-200"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
