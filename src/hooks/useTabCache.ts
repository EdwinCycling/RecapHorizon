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


    // Gebruik functionele state update om infinite loop te voorkomen
    return new Promise((resolve) => {
      setTabCache(currentCache => {


        // Check of content al gecached is
        if (currentCache[tabType]) {

          resolve(currentCache[tabType]);
          return currentCache; // Return unchanged cache
        }

        // Genereer nieuwe content

        generatorFunction().then(newContent => {


          // Cache de nieuwe content
          const updated = {
            ...currentCache,
            [tabType]: newContent
          };


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


    if (tabCache[tabType]) {

      return tabCache[tabType];
    }


    setTabCache(prev => {
      const updated = {
        ...prev,
        [tabType]: content
      };

      return updated;
    });

    return content;
  }, [tabCache]);

  // Cache reset functie voor nieuwe sessie
  const resetTabCache = useCallback(() => {

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

  }, []);

  // Check of specifieke tab gecached is
  const isTabCached = useCallback((tabType) => {
    const cached = tabCache[tabType] !== null;

    return cached;
  }, [tabCache]);

  // Debug functie om cache status te bekijken
  const logCacheStatus = useCallback(() => {

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
