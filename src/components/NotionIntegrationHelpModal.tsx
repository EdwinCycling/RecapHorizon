import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useTranslation } from '../hooks/useTranslation';

interface NotionIntegrationHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotionIntegrationHelpModal: React.FC<NotionIntegrationHelpModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {t('notionIntegrationHelpTitle')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <div className="space-y-4 text-gray-700">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">
              {t('notionIntegrationStepTitle')}
            </h3>
            <p className="mb-3">{t('notionIntegrationStepDesc')}</p>
            
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>{t('notionIntegrationStep1')}</li>
              <li>{t('notionIntegrationStep2')}</li>
              <li>{t('notionIntegrationStep3')}</li>
              <li>{t('notionIntegrationStep4')}</li>
              <li>{t('notionIntegrationStep5')}</li>
            </ol>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900 mb-2">
              {t('notionIntegrationDataTitle')}
            </h3>
            <p className="mb-2">{t('notionIntegrationDataDesc')}</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>{t('notionIntegrationDataItem1')}</li>
              <li>{t('notionIntegrationDataItem2')}</li>
              <li>{t('notionIntegrationDataItem3')}</li>
              <li>{t('notionIntegrationDataItem4')}</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900 mb-2">
              {t('notionIntegrationTechTitle')}
            </h3>
            <p className="mb-2">{t('notionIntegrationTechDesc')}</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>{t('notionIntegrationTechItem1')}</li>
              <li>{t('notionIntegrationTechItem2')}</li>
              <li>{t('notionIntegrationTechItem3')}</li>
              <li>{t('notionIntegrationTechItem4')}</li>
            </ul>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">
              {t('notionIntegrationSecurityTitle')}
            </h3>
            <p className="text-blue-800">{t('notionIntegrationSecurityDesc')}</p>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotionIntegrationHelpModal;