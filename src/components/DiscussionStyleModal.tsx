import React, { useState } from 'react';
import { FiX, FiSettings, FiMessageSquare, FiCheck } from 'react-icons/fi';
import { 
  AIDiscussionRole, 
  DiscussionStyleConfiguration, 
  DiscussionStyleOption 
} from '../../types';
import { DISCUSSION_STYLE_OPTIONS } from '../services/aiDiscussionService';

interface DiscussionStyleModalProps {
  t: (key: string, fallbackOrParams?: string | Record<string, any>, maybeParams?: Record<string, any>) => any;
  isOpen: boolean;
  onClose: () => void;
  selectedRoles: AIDiscussionRole[];
  currentStyles: DiscussionStyleConfiguration;
  onStylesUpdate: (newStyles: DiscussionStyleConfiguration) => void;
  onRoleUpdate?: (roleId: string, updates: Partial<AIDiscussionRole>) => void;
}

const DiscussionStyleModal: React.FC<DiscussionStyleModalProps> = ({
  t,
  isOpen,
  onClose,
  selectedRoles,
  currentStyles,
  onStylesUpdate,
  onRoleUpdate
}) => {
  const [localStyles, setLocalStyles] = useState<DiscussionStyleConfiguration>(currentStyles);
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  if (!isOpen) return null;

  const handleStyleToggle = (roleId: string, styleId: string) => {
    setLocalStyles(prev => {
      const currentRoleStyles = prev.roleStyles[roleId] || { roleId, selectedStyles: [] };
      const selectedStyle = DISCUSSION_STYLE_OPTIONS.find(style => style.id === styleId);
      
      if (!selectedStyle) return prev;

      const isSelected = currentRoleStyles.selectedStyles.includes(styleId);
      let newSelectedStyles;

      if (isSelected) {
        // Deselect the style
        newSelectedStyles = currentRoleStyles.selectedStyles.filter(id => id !== styleId);
      } else {
        // Remove any other style from the same category and add the new one
        newSelectedStyles = currentRoleStyles.selectedStyles.filter(id => {
          const existingStyle = DISCUSSION_STYLE_OPTIONS.find(style => style.id === id);
          return existingStyle?.category !== selectedStyle.category;
        });
        newSelectedStyles.push(styleId);
      }
      
      return {
        ...prev,
        roleStyles: {
          ...prev.roleStyles,
          [roleId]: {
            ...currentRoleStyles,
            selectedStyles: newSelectedStyles
          }
        }
      };
    });
  };

  const handleSave = () => {
    onStylesUpdate(localStyles);
    onClose();
  };

  const handleCancel = () => {
    setLocalStyles(currentStyles);
    onClose();
  };

  const getStylesByCategory = () => {
    const categories = {
      communication_tone: DISCUSSION_STYLE_OPTIONS.filter(style => style.category === 'communication_tone'),
      interaction_pattern: DISCUSSION_STYLE_OPTIONS.filter(style => style.category === 'interaction_pattern'),
      depth_focus: DISCUSSION_STYLE_OPTIONS.filter(style => style.category === 'depth_focus')
    };
    return categories;
  };

  const styleCategories = getStylesByCategory();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="text-cyan-600 dark:text-cyan-400">
              <FiSettings size={24} />
            </div>
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
              {t('discussionStyles.adjustTitle', 'Discussiestijlen aanpassen')}
            </h2>
          </div>
          <button
            onClick={handleCancel}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 min-h-0">
          <div className="mb-6">
            <p className="text-slate-600 dark:text-slate-400">
              {t('discussionStyles.adjustDescription', 'Pas de discussiestijlen aan voor elke rol. Deze wijzigingen worden toegepast op toekomstige berichten in de discussie.')}
            </p>
          </div>

          {/* Roles and their styles - Tabbed interface */}
          <div className="border-b border-gray-200 dark:border-slate-700 mb-6">
            <nav className="flex space-x-2" aria-label="Tabs">
              {selectedRoles.map((role, index) => (
                <button
                  key={role.id}
                  onClick={() => setActiveTabIndex(index)}
                  className={`px-4 py-2 text-sm font-medium rounded-t-lg border border-b-0 transition-colors ${
                    index === activeTabIndex
                      ? 'bg-cyan-50 dark:bg-cyan-900/30 border-cyan-300 dark:border-cyan-600 text-cyan-700 dark:text-cyan-300'
                      : 'bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {role.name}
                </button>
              ))}
            </nav>
          </div>
          
          {/* Show only the active role */}
          {selectedRoles[activeTabIndex] && (
            <div className="space-y-6">
              {(() => {
                const role = selectedRoles[activeTabIndex];
                
                return (
                  <div key={role.id} className="border border-gray-200 dark:border-slate-700 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="text-cyan-600 dark:text-cyan-400">
                        <FiMessageSquare size={20} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                          {role.name}
                        </h3>
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          ({role.description})
                        </span>
                      </div>
                      <div className="ml-auto flex items-center gap-3 bg-yellow-100 dark:bg-yellow-900/30 px-3 py-2 rounded-full">
                        <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                          {t('aiDiscussion.enthusiasmLevel', 'Enthousiasme')}:
                        </span>
                        {onRoleUpdate ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="range"
                              min="1"
                              max="5"
                              value={role.enthusiasmLevel || 3}
                              onChange={(e) => {
                                const newLevel = parseInt(e.target.value);
                                onRoleUpdate(role.id, { enthusiasmLevel: newLevel });
                              }}
                              className="w-20 h-2 bg-yellow-200 dark:bg-yellow-600 rounded-lg appearance-none cursor-pointer"
                              style={{
                                background: `linear-gradient(to right, #f59e0b 0%, #f59e0b ${((role.enthusiasmLevel || 3) - 1) * 25}%, #fef3c7 ${((role.enthusiasmLevel || 3) - 1) * 25}%, #fef3c7 100%)`
                              }}
                            />
                            <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200 min-w-[2rem]">
                              {role.enthusiasmLevel || 3}/5
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                            {role.enthusiasmLevel || 3}/5
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Communication Tone Styles */}
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                        {t('discussionStyles.communicationTone', 'Communicatiestijl')}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {styleCategories.communication_tone.map((style) => {
                          const currentRoleStyles = localStyles.roleStyles[role.id] || { roleId: role.id, selectedStyles: [] };
                          const isSelected = currentRoleStyles.selectedStyles.includes(style.id);
                          
                          return (
                            <button
                              key={style.id}
                              onClick={() => handleStyleToggle(role.id, style.id)}
                              className={`p-3 rounded-lg border text-left transition-all ${
                                isSelected
                                  ? 'border-cyan-300 dark:border-cyan-600 bg-cyan-50 dark:bg-cyan-900/30'
                                  : 'border-gray-200 dark:border-slate-600 hover:border-cyan-200 dark:hover:border-cyan-700 hover:bg-cyan-25 dark:hover:bg-cyan-900/10'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-slate-800 dark:text-slate-200">
                                  {style.nameNL}
                                </span>
                                {isSelected && (
                                  <div className="text-cyan-600 dark:text-cyan-400">
                                    <FiCheck size={16} />
                                  </div>
                                )}
                              </div>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                {style.descriptionNL}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Interaction Pattern Styles */}
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                        {t('discussionStyles.interactionPattern', 'Interactiepatroon')}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {styleCategories.interaction_pattern.map((style) => {
                          const currentRoleStyles = localStyles.roleStyles[role.id] || { roleId: role.id, selectedStyles: [] };
                          const isSelected = currentRoleStyles.selectedStyles.includes(style.id);
                          
                          return (
                            <button
                              key={style.id}
                              onClick={() => handleStyleToggle(role.id, style.id)}
                              className={`p-3 rounded-lg border text-left transition-all ${
                                isSelected
                                  ? 'border-cyan-300 dark:border-cyan-600 bg-cyan-50 dark:bg-cyan-900/30'
                                  : 'border-gray-200 dark:border-slate-600 hover:border-cyan-200 dark:hover:border-cyan-700 hover:bg-cyan-25 dark:hover:bg-cyan-900/10'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-slate-800 dark:text-slate-200">
                                  {style.nameNL}
                                </span>
                                {isSelected && (
                                  <div className="text-cyan-600 dark:text-cyan-400">
                                    <FiCheck size={16} />
                                  </div>
                                )}
                              </div>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                {style.descriptionNL}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Depth Focus Styles */}
                    <div>
                      <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                        {t('discussionStyles.depthFocus', 'Diepgang & Focus')}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {styleCategories.depth_focus.map((style) => {
                          const currentRoleStyles = localStyles.roleStyles[role.id] || { roleId: role.id, selectedStyles: [] };
                          const isSelected = currentRoleStyles.selectedStyles.includes(style.id);
                          
                          return (
                            <button
                              key={style.id}
                              onClick={() => handleStyleToggle(role.id, style.id)}
                              className={`p-3 rounded-lg border text-left transition-all ${
                                isSelected
                                  ? 'border-cyan-300 dark:border-cyan-600 bg-cyan-50 dark:bg-cyan-900/30'
                                  : 'border-gray-200 dark:border-slate-600 hover:border-cyan-200 dark:hover:border-cyan-700 hover:bg-cyan-25 dark:hover:bg-cyan-900/10'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-slate-800 dark:text-slate-200">
                                  {style.nameNL}
                                </span>
                                {isSelected && (
                                  <div className="text-cyan-600 dark:text-cyan-400">
                                    <FiCheck size={16} />
                                  </div>
                                )}
                              </div>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                {style.descriptionNL}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-slate-700 flex-shrink-0 bg-white dark:bg-slate-800">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            {t('common.cancel', 'Annuleren')}
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors font-medium"
          >
            {t('common.save', 'Opslaan')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiscussionStyleModal;