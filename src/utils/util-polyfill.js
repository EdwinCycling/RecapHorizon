// Custom util polyfill for browser compatibility

// Simple debuglog implementation
function debuglog(section) {
  return function debug(...args) {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[${section}]`, ...args);
    }
  };
}

// Simple inspect implementation
function inspect(obj, options = {}) {
  if (obj === null) return 'null';
  if (obj === undefined) return 'undefined';
  if (typeof obj === 'string') return `'${obj}'`;
  if (typeof obj === 'number' || typeof obj === 'boolean') return String(obj);
  if (typeof obj === 'function') return `[Function: ${obj.name || 'anonymous'}]`;
  
  try {
    return JSON.stringify(obj, null, options.depth || 2);
  } catch (e) {
    return '[Object]';
  }
}

// Export util functions
export default {
  debuglog,
  inspect
};

export { debuglog, inspect };