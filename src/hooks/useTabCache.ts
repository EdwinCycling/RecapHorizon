// Tab Caching Implementation voor App.tsx
// Kopieer deze code naar je App.tsx component

import React, { useState, useCallback } from 'react';
import { useTranslation } from './useTranslation';

export const useTabCache = () => {
  const { t } = useTranslation();
  
  // Cache state voor alle tab content
  const [tabCache, setTabCache] = useState({
    summary: null,
    keywords: null,
    sentiment: null,
    faq: null,
    learnings: null,
    followup: null,
    executiveSummary: null,
    quiz: null,
    mindmap: null,
    storytelling: null,
    blog: null,
    businessCase: null
  });

  // Helper voor async content met caching - GEFIXT voor infinite loop
  const getCachedTabContent = useCallback(async (tabType, generatorFunction) => {
    console.log(t('tabCacheCheckingCache', `[TabCache] 🔍 Checking cache for ${tabType}`));

    // Gebruik functionele state update om infinite loop te voorkomen
    return new Promise((resolve) => {
      setTabCache(currentCache => {
        console.log(t('tabCacheCurrentState', `[TabCache] 📊 Current cache state:`), {
          hasContent: currentCache[tabType] !== null,
          contentLength: currentCache[tabType]?.length || 0,
          allCachedTabs: Object.keys(currentCache).filter(key => currentCache[key] !== null)
        });

        // Check of content al gecached is
        if (currentCache[tabType]) {
          console.log(t('tabCacheUsingCached', `[TabCache] ✅ Using cached content for ${tabType} (${currentCache[tabType].length} characters)`));
          resolve(currentCache[tabType]);
          return currentCache; // Return unchanged cache
        }

        // Genereer nieuwe content
        console.log(t('tabCacheGeneratingNew', `[TabCache] 🆕 Generating new content for ${tabType}`));
        generatorFunction().then(newContent => {
          console.log(t('tabCacheGenerated', `[TabCache] 📝 Generated content for ${tabType} (${newContent?.length || 0} characters)`));

          // Cache de nieuwe content
          const updated = {
            ...currentCache,
            [tabType]: newContent
          };
          console.log(t('tabCacheCaching', `[TabCache] 💾 Caching content for ${tabType}`));
          console.log(t('tabCacheUpdated', `[TabCache] 📈 Updated cache:`), Object.keys(updated).filter(key => updated[key] !== null));

          setTabCache(updated); // Update cache state
          resolve(newContent);
        }).catch(error => {
          console.error(t('tabCacheError', `[TabCache] ❌ Error generating content for ${tabType}:`), error);
          resolve(null);
        });

        return currentCache; // Return unchanged cache while async operation runs
      });
    });
  }, []); // ❌ Lege dependency array om infinite loop TE VOORKOMEN

  // Helper voor sync content met caching
  const getCachedSyncContent = useCallback((tabType, content) => {
    console.log(t('tabCacheCheckingSyncCache', `[TabCache] 🔍 Checking sync cache for ${tabType}`));

    if (tabCache[tabType]) {
      console.log(t('tabCacheUsingSyncCached', `[TabCache] ✅ Using cached sync content for ${tabType}`));
      return tabCache[tabType];
    }

    console.log(t('tabCacheCachingNewSync', `[TabCache] 🆕 Caching new sync content for ${tabType} (${content?.length || 0} characters)`));
    setTabCache(prev => {
      const updated = {
        ...prev,
        [tabType]: content
      };
      console.log(t('tabCacheCachedSync', `[TabCache] 💾 Cached sync content for ${tabType}`));
      return updated;
    });

    return content;
  }, [tabCache]);

  // Cache reset functie voor nieuwe sessie
  const resetTabCache = useCallback(() => {
    console.log(t('tabCacheResettingAll', '[TabCache] 🔄 Resetting all cached content'));
    setTabCache({
      summary: null,
      keywords: null,
      sentiment: null,
      faq: null,
      learnings: null,
      followup: null,
      executiveSummary: null,
      quiz: null,
      mindmap: null,
      storytelling: null,
      blog: null,
      businessCase: null
    });
    console.log(t('tabCacheCompletelyReset', '[TabCache] ✅ Cache completely reset'));
  }, []);

  // Check of specifieke tab gecached is
  const isTabCached = useCallback((tabType) => {
    const cached = tabCache[tabType] !== null;
    console.log(t('tabCacheIsTypeCached', { tabType, cached }));
    return cached;
  }, [tabCache]);

  // Debug functie om cache status te bekijken
  const logCacheStatus = useCallback(() => {
    console.log(t('tabCacheStatusOverview', '[TabCache] 📋 Cache Status Overview:'));
    Object.entries(tabCache).forEach(([key, value]) => {
      console.log(t('tabCacheStatusItem', `  ${key}: ${value !== null ? `✅ (${(value as string)?.length || 0} chars)` : '❌ empty'}`));
    });
  }, [tabCache]);

  return {
    tabCache,
    getCachedTabContent,
    getCachedSyncContent,
    resetTabCache,
    isTabCached,
    logCacheStatus
  };
};
