import React, { useState, useRef, useEffect } from 'react';

interface EnableButtonSliderProps {
  onSliderComplete: (isEnabled: boolean) => void;
  isLoading?: boolean;
  enabledText: string;
  sliderText: string;
  theme?: 'light' | 'dark';
  disabled?: boolean;
}

const EnableButtonSlider: React.FC<EnableButtonSliderProps> = ({
  onSliderComplete,
  isLoading = false,
  enabledText,
  sliderText,
  theme = 'light',
  disabled = false
}) => {
  const [sliderPosition, setSliderPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);

  const ENABLE_THRESHOLD = 85; // Percentage to enable button

  useEffect(() => {
    if (isEnabled) {
      onSliderComplete(true);
    } else {
      onSliderComplete(false);
    }
  }, [isEnabled, onSliderComplete]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled || isLoading) return;
    setIsDragging(true);
    e.preventDefault();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled || isLoading) return;
    setIsDragging(true);
    e.preventDefault();
  };

  const handleMove = (clientX: number) => {
    if (!isDragging || !sliderRef.current || disabled || isLoading) return;

    const sliderRect = sliderRef.current.getBoundingClientRect();
    // Responsive thumb width: 32px on mobile, 40px on larger screens
    const thumbWidth = window.innerWidth < 640 ? 32 : 40;
    const maxPosition = sliderRect.width - thumbWidth;
    const newPosition = Math.max(0, Math.min(maxPosition, clientX - sliderRect.left - thumbWidth / 2));
    const percentage = maxPosition > 0 ? (newPosition / maxPosition) * 100 : 0;

    setSliderPosition(newPosition);

    if (newPosition >= (maxPosition * ENABLE_THRESHOLD / 100) && !isEnabled) {
      setIsEnabled(true);
    } else if (newPosition < (maxPosition * ENABLE_THRESHOLD / 100) && isEnabled) {
      setIsEnabled(false);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    handleMove(e.clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length > 0) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleEnd = () => {
    setIsDragging(false);
    if (!sliderRef.current) return;
    
    const sliderRect = sliderRef.current.getBoundingClientRect();
    const thumbWidth = window.innerWidth < 640 ? 32 : 40;
    const maxPosition = sliderRect.width - thumbWidth;
    const threshold = maxPosition * ENABLE_THRESHOLD / 100;
    
    if (sliderPosition < threshold) {
      setSliderPosition(0);
      setIsEnabled(false);
    }
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleEnd);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleEnd);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleEnd);
      };
    }
  }, [isDragging, sliderPosition]);

  const getSliderColor = () => {
    if (isEnabled) return 'bg-green-500';
    const threshold = sliderRef.current ? (sliderRef.current.getBoundingClientRect().width - (window.innerWidth < 640 ? 32 : 40)) * ENABLE_THRESHOLD / 100 : 0;
    if (sliderPosition >= threshold) return 'bg-green-400';
    return 'bg-slate-300 dark:bg-slate-600';
  };

  const getThumbColor = () => {
    if (isLoading) return 'bg-slate-400';
    if (isEnabled) return 'bg-green-600';
    const threshold = sliderRef.current ? (sliderRef.current.getBoundingClientRect().width - (window.innerWidth < 640 ? 32 : 40)) * ENABLE_THRESHOLD / 100 : 0;
    if (sliderPosition >= threshold) return 'bg-green-500';
    return 'bg-white dark:bg-slate-200';
  };

  const getTextColor = () => {
    if (isEnabled) return 'text-green-700 dark:text-green-300';
    const threshold = sliderRef.current ? (sliderRef.current.getBoundingClientRect().width - (window.innerWidth < 640 ? 32 : 40)) * ENABLE_THRESHOLD / 100 : 0;
    if (sliderPosition >= threshold) return 'text-green-700 dark:text-green-300';
    return 'text-slate-600 dark:text-slate-400';
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="mb-2">
        <p className={`text-xs sm:text-sm font-medium ${getTextColor()} transition-colors duration-200`}>
          {isEnabled ? enabledText : sliderText}
        </p>
      </div>
      
      <div 
        ref={sliderRef}
        className={`relative w-full h-8 sm:h-10 ${getSliderColor()} rounded-full transition-colors duration-200 ${
          disabled || isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        }`}
      >
        {/* Progress fill */}
        <div 
          className="absolute left-0 top-0 h-full bg-green-200 dark:bg-green-900/30 rounded-full transition-all duration-200"
          style={{ width: `${sliderPosition + (window.innerWidth < 640 ? 16 : 20)}px` }}
        />
        
        {/* Slider thumb */}
        <div
          ref={thumbRef}
          className={`absolute top-0 w-8 h-8 sm:w-10 sm:h-10 ${getThumbColor()} rounded-full shadow-lg border-2 border-slate-200 dark:border-slate-700 transition-all duration-200 flex items-center justify-center ${
            isDragging ? 'scale-110' : 'scale-100'
          } ${disabled || isLoading ? 'cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'}`}
          style={{ left: `${sliderPosition}px` }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          {isLoading ? (
            <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-slate-600 border-t-transparent rounded-full animate-spin" />
          ) : isEnabled ? (
            <svg className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-3 h-3 sm:w-4 sm:h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
        </div>
        
        {/* Background text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 select-none">
            {sliderPosition < 15 ? '→' : ''}
          </span>
        </div>
      </div>
      
      {/* Instructions */}
      <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 text-center">
        Sleep naar rechts →
      </div>
    </div>
  );
};

export default EnableButtonSlider;