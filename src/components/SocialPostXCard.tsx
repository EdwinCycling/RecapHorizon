import React, { useState } from 'react';
import { ChevronDown, Copy, MoreVertical } from 'lucide-react';
import { SocialPostData } from '../../types';

interface SocialPostXCardProps {
  socialPostXData: SocialPostData;
  onCopy: (content: string) => void;
  t: (key: string) => string;
  onGenerate: (count: number) => void;
  isGenerating?: boolean;
}

const SocialPostXCard: React.FC<SocialPostXCardProps> = ({ socialPostXData, onCopy, t, onGenerate, isGenerating = false }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(true);
  const [selectedPostCount, setSelectedPostCount] = useState(1);

  const handleCopy = (content?: string) => {
    onCopy(content || socialPostXData.post);
    setMenuOpen(false);
  };

  const handleGenerate = () => {
    if (onGenerate) {
      onGenerate(selectedPostCount);
    }
    setDropdownOpen(false);
  };

  // Handle both array and string formats for backward compatibility
  const parsePosts = (content: string | string[]): string[] => {
    if (!content) return [];
    
    // If already an array, return it
    if (Array.isArray(content)) {
      return content.filter(post => post && post.trim());
    }
    
    // If string, split by numbered format (1/X, 2/X, etc.)
    const posts = content.split(/\n?\d+\/\d+[\s\n]+/).filter(post => post.trim());
    
    // If no numbered format found, treat as single post
    if (posts.length <= 1) {
      return [content.trim()];
    }
    
    return posts.map(post => post.trim());
  };

  const posts = parsePosts(socialPostXData.post);
  const isMultiplePosts = posts.length > 1;

  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-slate-700">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-bold text-cyan-500 dark:text-cyan-400 mb-2">X / BlueSky Post</h3>
        <div className="flex items-center gap-2">
          {/* Dropdown for post count selection */}
          {onGenerate && (
            <div className="relative">
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)} 
                className="flex items-center gap-1 px-3 py-1 text-sm bg-cyan-600 hover:bg-cyan-700 text-white rounded"
                disabled={isGenerating}
              >
                {isGenerating ? t('socialPostGenerating') || 'Generating...' : `${selectedPostCount} ${selectedPostCount === 1 ? t('socialPost') || 'post' : t('socialPost') || 'posts'}`}
                <ChevronDown className="w-4 h-4" />
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-slate-800 rounded-md shadow-lg z-20 border border-gray-200 dark:border-slate-700">
                  {[1, 2, 3, 4, 5].map(count => (
                    <button
                      key={count}
                      onClick={() => {
                        setSelectedPostCount(count);
                        handleGenerate();
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700"
                    >
                      {count} {count === 1 ? t('socialPost') || 'post' : t('socialPost') || 'posts'}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Menu button */}
          <div className="relative">
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700">
              <MoreVertical className="w-5 h-5 text-slate-500 dark:text-slate-400" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg z-10 border border-gray-200 dark:border-slate-700">
                <button onClick={() => handleCopy()} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700">
                  {t('socialPostCopyAll') || 'Copy All Posts'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Posts content */}
      <div className="mt-3 space-y-3">
        {posts.map((post, index) => (
          <div key={index} className="p-3 bg-gray-50 dark:bg-slate-700 rounded border">
            {isMultiplePosts && (
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium text-cyan-600 dark:text-cyan-400">
                  {index + 1}/{posts.length}
                </span>
                <button
                  onClick={() => handleCopy(post)}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-200 dark:bg-slate-600 hover:bg-gray-300 dark:hover:bg-slate-500 rounded"
                >
                  <Copy className="w-3 h-3" />
                  {t('socialPostCopyIndividual') || 'Copy'}
                </button>
              </div>
            )}
            <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-200 font-sans">{post}</pre>
            {!isMultiplePosts && (
              <div className="flex justify-end mt-2">
                <button
                  onClick={() => handleCopy(post)}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-200 dark:bg-slate-600 hover:bg-gray-300 dark:hover:bg-slate-500 rounded"
                >
                  <Copy className="w-3 h-3" />
                  {t('copySocialPost') || 'Copy'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SocialPostXCard;