import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { SubscriptionTier } from '../../types';
import { AIProvider } from '../utils/aiProviderManager';
import { getUserPreferences, saveUserPreferences } from '../firebase';
import { displayToast } from '../utils/clipboard';

interface AIProviderSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  userTier?: SubscriptionTier;
  userSubscription?: SubscriptionTier;
  inline?: boolean;
}

const AIProviderSettingsModal: React.FC<AIProviderSettingsModalProps> = ({
  isOpen,
  onClose,
  userId,
  userTier,
  userSubscription,
  inline = false
}) => {
  const { t } = useTranslation();
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>(AIProvider.GOOGLE_GEMINI);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen && userId) {
      loadUserPreferences();
    }
  }, [isOpen, userId]);

  // Only Diamond users can access this modal
  const effectiveUserTier = userTier || userSubscription;
  if (effectiveUserTier !== SubscriptionTier.DIAMOND) {
    return null;
  }

  const loadUserPreferences = async () => {
    setIsLoading(true);
    try {
      const preferences = await getUserPreferences(userId);
      if (preferences?.aiProvider) {
        setSelectedProvider(preferences.aiProvider as AIProvider);
      }
    } catch (error) {
      console.error('Error loading user preferences:', error);
      displayToast(t('toastErrorLoadingPreferences'), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    // Validate that a provider is selected
    if (!selectedProvider) {
      displayToast(t('toastSelectAIProvider'), 'error');
      return;
    }
    
    setIsSaving(true);
    try {
      await saveUserPreferences(userId, {
        aiProvider: selectedProvider
      });
      displayToast(t('toastAIPreferencesSaved'), 'success');
      onClose();
    } catch (error) {
      console.error('Error saving preferences:', error);
      displayToast(t('toastErrorSavingPreferences'), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen && !inline) return null;

  const content = (
    <>
      {!inline && (
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {t('aiProviderSettingsTitle')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {t('aiProviderSettingsDescription')}
                </p>
                
                <div className="space-y-3">
                  <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                    <input
                      type="radio"
                      name="aiProvider"
                      value={AIProvider.GOOGLE_GEMINI}
                      checked={selectedProvider === AIProvider.GOOGLE_GEMINI}
                      onChange={(e) => setSelectedProvider(e.target.value as AIProvider)}
                      className="mr-3"
                    />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {t('googleGemini')}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {t('googleGeminiDescription')}
                      </div>
                    </div>
                  </label>

                  
                </div>
              </div>

              {!inline && (
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isSaving && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    )}
                    {t('savePreferences')}
                  </button>
                </div>
              )}
              {inline && (
                <div className="flex justify-end mt-4">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isSaving && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    )}
                    {t('saveAIProvider')}
                  </button>
                </div>
              )}
            </>
          )}
    </>
  );

  if (inline) {
    return content;
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          {content}
        </div>
      </div>
    </div>
  );
};

export default AIProviderSettingsModal;