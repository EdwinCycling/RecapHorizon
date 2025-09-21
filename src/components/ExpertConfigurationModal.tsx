import React, { useState } from 'react';
import { ExpertTopic, ExpertRole, ExpertBranche, ExpertConfiguration } from '../../types';
import ExpertDropdown from './ExpertDropdown';

interface ExpertConfigurationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartChat: (config: ExpertConfiguration) => void;
  t: any;
}

// Helper functions to get options from locale data
const getTopicOptions = (t: (key: string, params?: Record<string, string | number | boolean>) => any): ExpertTopic[] => {
  try {
    const topics = t('expertTopics', { returnObjects: true });
    if (Array.isArray(topics)) {
      return [...topics].sort((a, b) => a.name.localeCompare(b.name));
    }
    if (typeof topics === 'object' && topics !== null) {
      return Object.entries(topics)
        .map(([id, value]) => {
          if (typeof value === 'string') {
            return { id, name: value, description: '' };
          } else if (typeof value === 'object' && value !== null) {
            return {
              id,
              name: (value as any).name || id,
              description: (value as any).description || ''
            };
          }
          return { id, name: id, description: '' };
        })
        .sort((a, b) => a.name.localeCompare(b.name));
    }
    return [];
  } catch (error) {
    console.error('Error getting topic options:', error);
    return [];
  }
};

const getRoleOptions = (t: (key: string, params?: Record<string, string | number | boolean>) => any): ExpertRole[] => {
  try {
    const roles = t('expertRoles', { returnObjects: true });
    if (Array.isArray(roles)) {
      return [...roles].sort((a, b) => a.name.localeCompare(b.name));
    }
    if (typeof roles === 'object' && roles !== null) {
      return Object.entries(roles)
        .map(([id, value]) => {
          if (typeof value === 'string') {
            return { id, name: value, description: '' };
          } else if (typeof value === 'object' && value !== null) {
            return {
              id,
              name: (value as any).name || id,
              description: (value as any).description || ''
            };
          }
          return { id, name: id, description: '' };
        })
        .sort((a, b) => a.name.localeCompare(b.name));
    }
    return [];
  } catch (error) {
    console.error('Error getting role options:', error);
    return [];
  }
};

const getBrancheOptions = (t: (key: string, params?: Record<string, string | number | boolean>) => any): ExpertBranche[] => {
  try {
    const branches = t('expertBranches', { returnObjects: true });
    if (Array.isArray(branches)) {
      return [...branches].sort((a, b) => a.name.localeCompare(b.name));
    }
    if (typeof branches === 'object' && branches !== null) {
      return Object.entries(branches)
        .map(([id, value]) => {
          if (typeof value === 'string') {
            return { id, name: value, description: '' };
          } else if (typeof value === 'object' && value !== null) {
            return {
              id,
              name: (value as any).name || id,
              description: (value as any).description || ''
            };
          }
          return { id, name: id, description: '' };
        })
        .sort((a, b) => a.name.localeCompare(b.name));
    }
    return [];
  } catch (error) {
    console.error('Error getting branche options:', error);
    return [];
  }
};

const ExpertConfigurationModal: React.FC<ExpertConfigurationModalProps> = ({
  isOpen,
  onClose,
  onStartChat,
  t
}) => {
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedBranche, setSelectedBranche] = useState<string>('');

  const topicOptions = getTopicOptions(t);
  const roleOptions = getRoleOptions(t);
  const brancheOptions = getBrancheOptions(t);

  const handleStartChat = () => {
    if (selectedTopic && selectedRole && selectedBranche) {
      const topic = topicOptions.find(t => t.id === selectedTopic)!;
      const role = roleOptions.find(r => r.id === selectedRole)!;
      const branche = brancheOptions.find(b => b.id === selectedBranche)!;
      
      const config: ExpertConfiguration = {
        topic,
        role,
        branche
      };
      
      onStartChat(config);
      onClose();
    }
  };

  const isFormValid = selectedTopic && selectedRole && selectedBranche;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[102]">
      <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-700 w-full m-4 p-0 max-w-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-xl font-medium text-slate-800 dark:text-slate-100 tracking-tight">
            {t('expertConfigTitle', 'Ask the Expert: Configureer je expert')}
          </h3>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"
          >
            <span aria-hidden>✖️</span>
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Topic Selection */}
          <ExpertDropdown
            value={selectedTopic}
            onChange={setSelectedTopic}
            placeholder={t('expertTopicPlaceholder', 'Selecteer een topic...')}
            options={topicOptions}
            label={t('expertTopicLabel', 'Wat wil je bediscussiëren? (Selecteer een Topic)')}
            colorScheme="blue"
            t={t}
          />

          {/* Role Selection */}
          <ExpertDropdown
            value={selectedRole}
            onChange={setSelectedRole}
            placeholder={t('expertRolePlaceholder', 'Selecteer een rol...')}
            options={roleOptions}
            label={t('expertRoleLabel', 'Selecteer de rol van de AI Expert:')}
            colorScheme="green"
            t={t}
          />

          {/* Branche Selection */}
          <ExpertDropdown
            value={selectedBranche}
            onChange={setSelectedBranche}
            placeholder={t('expertBranchePlaceholder', 'Selecteer een branche/sfeer...')}
            options={brancheOptions}
            label={t('expertBrancheLabel', 'Selecteer de Branche/Sfeer van het idee:')}
            colorScheme="purple"
            t={t}
          />

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              {t('cancel', 'Annuleren')}
            </button>
            <button
              onClick={handleStartChat}
              disabled={!isFormValid}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                isFormValid
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400 cursor-not-allowed'
              }`}
            >
              {t('expertConfigStart', 'Start Chat')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpertConfigurationModal;