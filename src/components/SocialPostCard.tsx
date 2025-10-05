import React, { useState } from 'react';
import { Copy, MoreVertical, Image, ChevronDown } from 'lucide-react';
import { SocialPostData } from '../../types';

interface SocialPostCardProps {
  socialPostData: SocialPostData;
  onCopy: (content: string) => void;
  t: (key: string) => string;
  onGenerateImage?: (style: string, color: string) => void;
  imageGenerationStyle?: string;
  imageGenerationColor?: string;
  isGeneratingImage?: boolean;
}

const SocialPostCard: React.FC<SocialPostCardProps> = ({ 
  socialPostData, 
  onCopy, 
  t, 
  onGenerateImage,
  imageGenerationStyle = 'infographic',
  imageGenerationColor = 'color',
  isGeneratingImage = false
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [styleDropdownOpen, setStyleDropdownOpen] = useState(false);
  const [colorDropdownOpen, setColorDropdownOpen] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState(imageGenerationStyle);
  const [selectedColor, setSelectedColor] = useState(imageGenerationColor);

  const handleCopy = (content?: string) => {
    onCopy(content || socialPostData.post);
    setMenuOpen(false);
  };

  const handleGenerateImage = () => {
    if (onGenerateImage) {
      onGenerateImage(selectedStyle, selectedColor);
    }
  };

  const getStyleOptions = () => [
    { value: 'infographic', label: t('imageStyleInfographic') || 'Infographic' },
    { value: 'drawing', label: t('imageStyleDrawing') || 'Drawing' },
    { value: 'photorealistic', label: t('imageStylePhotorealistic') || 'Photo Realistic' }
  ];

  const getColorOptions = () => [
    { value: 'blackwhite', label: t('imageColorBlackWhite') || 'Black & White' },
    { value: 'color', label: t('imageColorColor') || 'Color' },
    { value: 'vibrant', label: t('imageColorVibrant') || 'Very Colorful/Bright Colors' }
  ];

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

  // Early return if no data available
  if (!socialPostData) {
    return null;
  }

  const posts = parsePosts(socialPostData.post);
  const isMultiplePosts = posts.length > 1;

  // Get platform display name
  const getPlatformDisplayName = () => {
    switch (socialPostData.platform) {
      case 'LinkedIn':
        return 'LinkedIn';
      case 'Facebook':
        return 'Facebook';
      case 'Instagram':
        return 'Instagram';
      default:
        return t('socialPost') || 'Social Post';
    }
  };

  // Get platform color
  const getPlatformColor = () => {
    switch (socialPostData.platform) {
      case 'LinkedIn':
        return 'text-blue-600 dark:text-blue-400';
      case 'Facebook':
        return 'text-blue-700 dark:text-blue-500';
      case 'Instagram':
        return 'text-pink-600 dark:text-pink-400';
      default:
        return 'text-cyan-500 dark:text-cyan-400';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-slate-700">
      <div className="flex justify-between items-start">
        <h3 className={`text-lg font-bold mb-2 ${getPlatformColor()}`}>
          {getPlatformDisplayName()}
        </h3>
        <div className="flex items-center gap-2">
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
        {posts.map((post, index) => {
          // Clean the post content by removing any existing numbering at the start
          const cleanPost = post.replace(/^\d+\/\d+\s*/, '').trim();
          // Add proper numbering for display
          const numberedPost = posts.length > 1 ? `${index + 1}/${posts.length} ${cleanPost}` : cleanPost;
          
          return (
            <div key={index} className="p-3 bg-gray-50 dark:bg-slate-700 rounded border">
              <div className="flex justify-between items-center mb-2">
                {posts.length > 1 && (
                  <span className={`text-xs font-medium ${getPlatformColor()}`}>
                    {index + 1}/{posts.length}
                  </span>
                )}
                <button
                  onClick={() => handleCopy(numberedPost)}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-200 dark:bg-slate-600 hover:bg-gray-300 dark:hover:bg-slate-500 rounded ml-auto"
                >
                  <Copy className="w-3 h-3" />
                  {t('socialPostCopyIndividual') || 'Copy'}
                </button>
              </div>
              <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-200 font-sans">{numberedPost}</pre>
            </div>
          );
        })}
      </div>

      {/* Image Generation Section */}
      {onGenerateImage && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-600">
          <div className="flex items-center gap-2 mb-3">
            <Image className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200">
              {t('aiImageGeneration') || 'AI Image Generation'}
            </h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            {/* Style Dropdown */}
            <div className="relative">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                {t('imageStyle') || 'Style'}
              </label>
              <button
                onClick={() => setStyleDropdownOpen(!styleDropdownOpen)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-md hover:bg-gray-100 dark:hover:bg-slate-600"
              >
                <span className="text-gray-700 dark:text-gray-200">
                  {getStyleOptions().find(opt => opt.value === selectedStyle)?.label}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>
              {styleDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-md shadow-lg">
                  {getStyleOptions().map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSelectedStyle(option.value);
                        setStyleDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 first:rounded-t-md last:rounded-b-md"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Color Dropdown */}
            <div className="relative">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                {t('imageColor') || 'Color'}
              </label>
              <button
                onClick={() => setColorDropdownOpen(!colorDropdownOpen)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-md hover:bg-gray-100 dark:hover:bg-slate-600"
              >
                <span className="text-gray-700 dark:text-gray-200">
                  {getColorOptions().find(opt => opt.value === selectedColor)?.label}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>
              {colorDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-md shadow-lg">
                  {getColorOptions().map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSelectedColor(option.value);
                        setColorDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 first:rounded-t-md last:rounded-b-md"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerateImage}
            disabled={isGeneratingImage}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-md text-sm font-medium transition-colors"
          >
            <Image className="w-4 h-4" />
            {isGeneratingImage ? (t('imageGenerating') || 'Generating...') : (t('generateImage') || 'Generate Image')}
          </button>

          {/* Image Instructions Display */}
          {socialPostData.imageInstructions && (
            <div className="mt-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-md border border-purple-200 dark:border-purple-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-purple-700 dark:text-purple-300">
                  {t('aiImageInstruction') || 'AI Image Instruction'}
                </span>
                <button
                  onClick={() => onCopy(socialPostData.imageInstructions || '')}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-purple-100 dark:bg-purple-800 hover:bg-purple-200 dark:hover:bg-purple-700 text-purple-700 dark:text-purple-300 rounded"
                >
                  <Copy className="w-3 h-3" />
                  {t('copyImageInstruction') || 'Copy'}
                </button>
              </div>
              <pre className="whitespace-pre-wrap text-xs text-purple-600 dark:text-purple-200 font-mono">
                {socialPostData.imageInstructions}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SocialPostCard;