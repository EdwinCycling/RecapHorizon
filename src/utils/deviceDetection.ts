/**
 * Utility functions for detecting device types
 */

/**
 * Detects if the current device is a mobile device
 * @returns {boolean} True if the device is mobile, false otherwise
 */
export const isMobileDevice = (): boolean => {
  // Check user agent for mobile indicators
  const userAgent = navigator.userAgent.toLowerCase();
  const mobileKeywords = [
    'android',
    'webos',
    'iphone',
    'ipad',
    'ipod',
    'blackberry',
    'windows phone',
    'mobile',
    'opera mini'
  ];
  
  const isMobileUserAgent = mobileKeywords.some(keyword => 
    userAgent.includes(keyword)
  );
  
  // Check screen size (mobile-like dimensions)
  const isMobileScreen = window.innerWidth <= 768;
  
  // Check for touch capability
  const isTouchDevice = 'ontouchstart' in window || 
    navigator.maxTouchPoints > 0 || 
    (navigator as any).msMaxTouchPoints > 0;
  
  // Combine checks - device is mobile if it has mobile user agent OR (small screen AND touch)
  return isMobileUserAgent || (isMobileScreen && isTouchDevice);
};

/**
 * Detects if the current device is a tablet
 * @returns {boolean} True if the device is a tablet, false otherwise
 */
export const isTabletDevice = (): boolean => {
  const userAgent = navigator.userAgent.toLowerCase();
  const isIpad = userAgent.includes('ipad');
  const isAndroidTablet = userAgent.includes('android') && !userAgent.includes('mobile');
  const isLargeTouch = 'ontouchstart' in window && window.innerWidth >= 768 && window.innerWidth <= 1024;
  
  return isIpad || isAndroidTablet || isLargeTouch;
};

/**
 * Detects if the current device is a desktop
 * @returns {boolean} True if the device is desktop, false otherwise
 */
export const isDesktopDevice = (): boolean => {
  return !isMobileDevice() && !isTabletDevice();
};

/**
 * Gets the device type as a string
 * @returns {'mobile' | 'tablet' | 'desktop'} The device type
 */
export const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
  if (isMobileDevice()) return 'mobile';
  if (isTabletDevice()) return 'tablet';
  return 'desktop';
};

/**
 * Detects if the device supports system audio capture (getDisplayMedia)
 * Mobile devices typically don't support this
 * @returns {boolean} True if system audio capture is likely supported
 */
export const supportsSystemAudioCapture = (): boolean => {
  // Check if getDisplayMedia is available
  const hasGetDisplayMedia = navigator.mediaDevices && 
    typeof navigator.mediaDevices.getDisplayMedia === 'function';
  
  // Mobile devices typically don't support system audio capture
  const isNotMobile = !isMobileDevice();
  
  return hasGetDisplayMedia && isNotMobile;
};

/**
 * Detects the operating system
 * @returns {'ios' | 'android' | 'windows' | 'macos' | 'linux' | 'unknown'} The operating system
 */
export const getOperatingSystem = (): 'ios' | 'android' | 'windows' | 'macos' | 'linux' | 'unknown' => {
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (userAgent.includes('iphone') || userAgent.includes('ipad') || userAgent.includes('ipod')) {
    return 'ios';
  }
  
  if (userAgent.includes('android')) {
    return 'android';
  }
  
  if (userAgent.includes('windows')) {
    return 'windows';
  }
  
  if (userAgent.includes('mac')) {
    return 'macos';
  }
  
  if (userAgent.includes('linux')) {
    return 'linux';
  }
  
  return 'unknown';
};