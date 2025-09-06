import React, { useState } from 'react';
import { ExpertTopic, ExpertRole, ExpertBranche, ExpertConfiguration } from '../../types';

interface ExpertConfigurationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartChat: (config: ExpertConfiguration) => void;
  t: (key: string, params?: Record<string, string | number | boolean>) => any;
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
        .map(([id, name]) => ({
          id,
          name: name as string,
          description: ''
        }))
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
        .map(([id, name]) => ({
          id,
          name: name as string,
          description: ''
        }))
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
        .map(([id, name]) => ({
          id,
          name: name as string,
          description: ''
        }))
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

  const handleStartChat = () => {
    if (selectedTopic && selectedRole && selectedBranche) {
      const topics = getTopicOptions(t);
      const roles = getRoleOptions(t);
      const branches = getBrancheOptions(t);
      
      const topic = topics.find(t => t.id === selectedTopic)!;
      const role = roles.find(r => r.id === selectedRole)!;
      const branche = branches.find(b => b.id === selectedBranche)!;
      
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
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[101]">
      <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-700 w-full m-4 p-0 overflow-hidden max-w-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            {t('expertConfigTitle') || 'Ask the Expert: Configureer je expert'}
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
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {t('expertTopicLabel') || 'Wat wil je bediscussiëren? (Selecteer een Topic)'}
            </label>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="w-full p-3 border-2 border-blue-200 dark:border-blue-700 rounded-lg bg-gradient-to-b from-blue-50 to-white dark:from-blue-900/20 dark:to-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <option value="">{t('expertTopicPlaceholder') || 'Selecteer een topic...'}</option>
              {getTopicOptions(t).map((topic) => (
                <option key={topic.id} value={topic.id} className="text-slate-900 dark:text-slate-100">
                  {topic.name}
                </option>
              ))}
            </select>
            {selectedTopic && (
              <p className="mt-2 text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg border border-blue-200 dark:border-blue-700">
                {getTopicOptions(t).find(t => t.id === selectedTopic)?.description}
              </p>
            )}
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {t('expertRoleLabel') || 'Selecteer de rol van de AI Expert:'}
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full p-3 border-2 border-green-200 dark:border-green-700 rounded-lg bg-gradient-to-b from-green-50 to-white dark:from-green-900/20 dark:to-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <option value="">{t('expertRolePlaceholder') || 'Selecteer een rol...'}</option>
              {getRoleOptions(t).map((role) => (
                <option key={role.id} value={role.id} className="text-slate-900 dark:text-slate-100">
                  {role.name}
                </option>
              ))}
            </select>
            {selectedRole && (
              <p className="mt-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-2 rounded-lg border border-green-200 dark:border-green-700">
                {getRoleOptions(t).find(r => r.id === selectedRole)?.description}
              </p>
            )}
          </div>

          {/* Branche Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {t('expertBrancheLabel') || 'Selecteer de Branche/Sfeer van het idee:'}
            </label>
            <select
              value={selectedBranche}
              onChange={(e) => setSelectedBranche(e.target.value)}
              className="w-full p-3 border-2 border-purple-200 dark:border-purple-700 rounded-lg bg-gradient-to-b from-purple-50 to-white dark:from-purple-900/20 dark:to-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <option value="">{t('expertBranchePlaceholder') || 'Selecteer een branche/sfeer...'}</option>
              {getBrancheOptions(t).map((branche) => (
                <option key={branche.id} value={branche.id} className="text-slate-900 dark:text-slate-100">
                  {branche.name}
                </option>
              ))}
            </select>
            {selectedBranche && (
              <p className="mt-2 text-sm text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 p-2 rounded-lg border border-purple-200 dark:border-purple-700">
                {getBrancheOptions(t).find(b => b.id === selectedBranche)?.description}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              {t('cancel') || 'Annuleren'}
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
              {t('expertConfigStart') || 'Start Chat'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpertConfigurationModal;