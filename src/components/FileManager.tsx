import React from 'react';
import { FileText, Plus, Search } from 'lucide-react';
import { BlogPost } from '../lib/file-system';
import { parseMDX } from '../lib/mdx-parser';

interface FileManagerProps {
  posts: BlogPost[];
  selectedPost: BlogPost | null;
  onSelectPost: (post: BlogPost) => void;
  onNewPost: () => void;
}

export function FileManager({ posts, selectedPost, onSelectPost, onNewPost }: FileManagerProps) {
  const [searchQuery, setSearchQuery] = React.useState('');

  // Parse posts and sort by date
  const postsWithMeta = React.useMemo(() => {
    return posts.map(post => {
      try {
        const { frontmatter } = parseMDX(post.content);
        return {
          post,
          frontmatter,
        };
      } catch {
        return {
          post,
          frontmatter: {
            title: post.name,
            date: '',
            description: '',
            author: '',
          },
        };
      }
    }).sort((a, b) => {
      // Sort by date, newest first
      return b.frontmatter.date.localeCompare(a.frontmatter.date);
    });
  }, [posts]);

  // Filter posts based on search query
  const filteredPosts = React.useMemo(() => {
    if (!searchQuery.trim()) return postsWithMeta;
    
    const query = searchQuery.toLowerCase();
    return postsWithMeta.filter(({ frontmatter }) => {
      return (
        frontmatter.title.toLowerCase().includes(query) ||
        frontmatter.description.toLowerCase().includes(query) ||
        frontmatter.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    });
  }, [postsWithMeta, searchQuery]);

  return (
    <div className="flex flex-col h-full bg-gray-50 border-r">
      {/* Header */}
      <div className="p-4 border-b bg-white">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-lg">Blog Posts</h2>
          <button
            onClick={onNewPost}
            className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            title="New Post"
          >
            <Plus size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search posts..."
            className="w-full pl-10 pr-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Post List */}
      <div className="flex-1 overflow-y-auto">
        {filteredPosts.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {searchQuery ? 'No posts found' : 'No posts yet'}
          </div>
        ) : (
          <div className="divide-y">
            {filteredPosts.map(({ post, frontmatter }) => (
              <button
                key={post.name}
                onClick={() => onSelectPost(post)}
                className={`w-full text-left p-4 hover:bg-white transition-colors ${
                  selectedPost?.name === post.name ? 'bg-white border-l-4 border-blue-600' : ''
                }`}
              >
                <div className="flex items-start gap-2">
                  <FileText size={18} className="text-gray-400 mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">
                      {frontmatter.title || post.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {frontmatter.date}
                    </p>
                    {frontmatter.tags && frontmatter.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {frontmatter.tags.slice(0, 3).map(tag => (
                          <span
                            key={tag}
                            className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
