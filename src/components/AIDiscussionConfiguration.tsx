import React, { useState } from 'react';
import { AIDiscussionTopic, AIDiscussionGoal, AIDiscussionRole, DiscussionStyleConfiguration, RoleDiscussionStyles, TranslationFunction } from '../../types';
import { FiTarget, FiUsers, FiCheck, FiInfo, FiTool, FiCheckCircle, FiZap, FiShield, FiMessageSquare, FiSettings } from 'react-icons/fi';
import { DISCUSSION_STYLE_OPTIONS, DEFAULT_ROLE_STYLES } from '../services/aiDiscussionService';
import '../styles/slider.css';

interface DiscussionCategory {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  goals: AIDiscussionGoal[];
}

interface AIDiscussionConfigurationProps {
  t: TranslationFunction;
  selectedTopic: AIDiscussionTopic;
  goals: AIDiscussionGoal[];
  roles: AIDiscussionRole[];
  onConfigurationComplete: (goal: AIDiscussionGoal, selectedRoles: AIDiscussionRole[], discussionStyles: DiscussionStyleConfiguration) => void;
}

const AIDiscussionConfiguration: React.FC<AIDiscussionConfigurationProps> = ({
  t,
  selectedTopic,
  goals,
  roles,
  onConfigurationComplete
}) => {
  const [selectedGoal, setSelectedGoal] = useState<AIDiscussionGoal | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<AIDiscussionRole[]>([]);
  const [discussionStyles, setDiscussionStyles] = useState<DiscussionStyleConfiguration>({ roleStyles: {} });
  const [step, setStep] = useState<'goal' | 'roles' | 'styles'>('goal');
  const [roleEnthusiasmLevels, setRoleEnthusiasmLevels] = useState<{ [roleId: string]: number }>({});

  // Group goals by category
  const categories: DiscussionCategory[] = [
    {
      id: 'vision',
      name: 'Visie en Conceptvalidatie',
      icon: FiTarget,
      goals: goals.filter(g => g.category === 'vision')
    },
    {
      id: 'lean',
      name: 'Lean Financiën en Middelen',
      icon: FiTool,
      goals: goals.filter(g => g.category === 'lean')
    },
    {
      id: 'execution',
      name: 'Snelheid en Flexibele Uitvoering',
      icon: FiZap,
      goals: goals.filter(g => g.category === 'execution')
    },
    {
      id: 'people',
      name: 'Mensen, Talent en Cultuur',
      icon: FiUsers,
      goals: goals.filter(g => g.category === 'people')
    },
    {
      id: 'market',
      name: 'Markt en Adoptie',
      icon: FiCheckCircle,
      goals: goals.filter(g => g.category === 'market')
    }
  ];

  const handleGoalSelect = (goal: AIDiscussionGoal) => {
    setSelectedGoal(goal);
    setStep('roles');
    // Scroll to top after step change
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const handleRoleToggle = (role: AIDiscussionRole) => {
    setSelectedRoles(prev => {
      const isSelected = prev.some(r => r.id === role.id);
      if (isSelected) {
        // Remove role and its enthusiasm level
        setRoleEnthusiasmLevels(prevLevels => {
          const newLevels = { ...prevLevels };
          delete newLevels[role.id];
          return newLevels;
        });
        return prev.filter(r => r.id !== role.id);
      } else if (prev.length < 4) {
        // Add role and initialize enthusiasm level
        setRoleEnthusiasmLevels(prevLevels => ({
          ...prevLevels,
          [role.id]: role.enthusiasmLevel || 3
        }));
        return [...prev, role];
      }
      return prev;
    });
  };

  const handleEnthusiasmChange = (roleId: string, level: number) => {
    setRoleEnthusiasmLevels(prev => {
      const newLevels = {
        ...prev,
        [roleId]: level
      };
      return newLevels;
    });
  };

  const handleRolesToStyles = () => {
    if (selectedRoles.length >= 2 && selectedRoles.length <= 4) {
      // Initialize default styles for selected roles
      const defaultStyles: { [roleId: string]: RoleDiscussionStyles } = {};
      selectedRoles.forEach(role => {
        const defaultStyleIds = DEFAULT_ROLE_STYLES[role.category] || ['collaborative', 'solution_oriented'];
        defaultStyles[role.id] = {
          roleId: role.id,
          selectedStyles: defaultStyleIds
        };
      });
      setDiscussionStyles({ roleStyles: defaultStyles });
      setStep('styles');
      // Scroll to top after step change
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    }
  };

  const handleStyleToggle = (roleId: string, styleId: string) => {
    setDiscussionStyles(prev => {
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

  const handleStartDiscussion = () => {
    if (selectedGoal && selectedRoles.length >= 2 && selectedRoles.length <= 4) {
      // Update roles with custom enthusiasm levels
      const rolesWithEnthusiasm = selectedRoles.map(role => ({
        ...role,
        enthusiasmLevel: roleEnthusiasmLevels[role.id] || role.enthusiasmLevel || 3
      }));
      onConfigurationComplete(selectedGoal, rolesWithEnthusiasm, discussionStyles);
    }
  };

  const handleBackToGoals = () => {
    setStep('goal');
    setSelectedRoles([]);
    setDiscussionStyles({ roleStyles: {} });
    // Scroll to top after step change
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const handleBackToRoles = () => {
    setStep('roles');
    // Scroll to top after step change
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const getGoalIcon = (goalId: string) => {
    switch (goalId) {
      case 'strategic-planning': return '🎯';
      case 'problem-solving': return '🔧';
      case 'decision-making': return '⚖️';
      case 'innovation-brainstorm': return '💡';
      case 'risk-assessment': return '🛡️';
      default: return '📋';
    }
  };

  const getRoleIcon = (roleId: string) => {
    switch (roleId) {
      case 'ceo': return '👑';
      case 'cto': return '💻';
      case 'cfo': return '💰';
      case 'cmo': return '📈';
      case 'coo': return '⚙️';
      case 'chro': return '👥';
      case 'ciso': return '🔒';
      case 'cdo': return '📊';
      case 'cpo': return '🚀';
      case 'cso': return '🎯';
      default: return '👤';
    }
  };

  if (step === 'goal') {
    return (
      <div className="space-y-6">
        {/* Selected Topic Display */}
        <div className="bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-cyan-600 dark:text-cyan-400 mt-1 flex-shrink-0"><FiInfo size={20} /></span>
            <div>
              <h4 className="font-medium text-cyan-800 dark:text-cyan-200 mb-1">
                {t('aiDiscussion.selectedTopic') || 'Geselecteerd onderwerp'}
              </h4>
              <h5 className="font-semibold text-cyan-900 dark:text-cyan-100 mb-2">
                {selectedTopic.title}
              </h5>
              <p className="text-sm text-cyan-700 dark:text-cyan-300">
                {selectedTopic.description}
              </p>
            </div>
          </div>
        </div>

        {/* Goal Selection */}
        <div className="text-center">
          <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">
            {t('aiDiscussion.selectGoal') || 'Selecteer discussiedoel'}
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            {t('aiDiscussion.selectGoalDesc') || 'Kies het hoofddoel voor deze discussie uit 5 categorieën'}
          </p>
        </div>

        <div className="space-y-6">
          {categories.map((category) => (
            <div key={category.id} className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 bg-white dark:bg-slate-800">
              <div className="flex items-center gap-3 mb-4">
                <category.icon className="text-2xl text-cyan-600 dark:text-cyan-400" />
                <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                  {category.name}
                </h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {category.goals.map((goal) => (
                  <button
                    key={goal.id}
                    onClick={() => handleGoalSelect(goal)}
                    className="text-left p-3 border rounded-lg transition-all duration-200 hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-gray-300 dark:hover:border-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600"
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-lg flex-shrink-0 mt-1">
                        {getGoalIcon(goal.id)}
                      </span>
                      <div>
                        <h5 className="font-medium text-slate-800 dark:text-slate-200 mb-1 text-sm">
                          {t(`aiDiscussion.goal.${goal.id}`) || goal.name}
                        </h5>
                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                          {t(`aiDiscussion.goal.${goal.id}Desc`) || goal.description}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (step === 'roles') {
    return (
      <div className="space-y-6">
        {/* Selected Goal Display */}
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-green-600 dark:text-green-400 mt-1 flex-shrink-0"><FiTarget size={20} /></span>
            <div>
              <h4 className="font-medium text-green-800 dark:text-green-200 mb-1">
                {t('aiDiscussion.selectedGoal') || 'Geselecteerd doel'}
              </h4>
              <h5 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                {selectedGoal && (t(`aiDiscussion.goal.${selectedGoal.id}`) || selectedGoal.name)}
              </h5>
              <p className="text-sm text-green-700 dark:text-green-300">
                {selectedGoal && (t(`aiDiscussion.goal.${selectedGoal.id}Desc`) || selectedGoal.description)}
              </p>
            </div>
          </div>
        </div>

        {/* Role Selection */}
        <div className="text-center">
          <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">
            {t('aiDiscussion.selectRoles') || 'Selecteer 2-4 organisatierollen'}
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            {t('aiDiscussion.selectRolesDesc') || 'Kies welke rollen deelnemen aan de discussie (minimaal 2, maximaal 4)'}
          </p>
          
          {/* Role Counter */}
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
            selectedRoles.length >= 2 && selectedRoles.length <= 4
              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' 
              : 'bg-slate-100 dark:bg-slate-700'
          }`}>
            <FiUsers size={16} />
            <span className="font-medium">
              {selectedRoles.length}/4 {t('aiDiscussion.rolesSelected') || 'rollen geselecteerd'}
            </span>
          </div>

          {/* Moderator Info */}
          <div className="mt-3 p-3 bg-yellow-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded">
            <p className="text-sm text-slate-700 dark:text-slate-300">
              {t('aiDiscussion.moderatorInfo') || 'De 1e geselecteerde rol is de gespreksleider (moderator). Deze rol faciliteert het gesprek, stelt verhelderende vragen en vat samen.'}
            </p>
            {selectedRoles.length > 0 && (
              <p className="text-sm mt-2 text-slate-800 dark:text-slate-200">
                <span className="font-semibold">{t('aiDiscussion.currentModerator') || 'Huidige gespreksleider'}:</span> {t(`aiDiscussion.role.${selectedRoles[0].id}`) || selectedRoles[0].name}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roles.map((role) => {
            const isSelected = selectedRoles.some(r => r.id === role.id);
            const canSelect = selectedRoles.length < 4 || isSelected;
            
            return (
              <button
                key={role.id}
                onClick={() => handleRoleToggle(role)}
                disabled={!canSelect}
                className={`text-left p-4 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                  isSelected
                    ? 'bg-cyan-50 dark:bg-cyan-900/20 border-cyan-300 dark:border-cyan-600 text-cyan-800 dark:text-cyan-200'
                    : canSelect
                    ? 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
                    : 'bg-gray-50 dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0 mt-1">
                    {getRoleIcon(role.id)}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">
                        {t(`aiDiscussion.role.${role.id}`) || role.name}
                      </h4>
                      {isSelected && (
                        <span className="text-cyan-600 dark:text-cyan-400"><FiCheck size={16} /></span>
                      )}
                    </div>
                    <p className="text-sm opacity-90">
                      {t(`aiDiscussion.role.${role.id}Desc`) || role.description}
                    </p>
                    {isSelected && (
                      <div className="mt-3 pt-3 border-t border-cyan-200 dark:border-cyan-700">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium text-cyan-800 dark:text-cyan-200">
                            {t('aiDiscussion.enthusiasmLevel') || 'Enthousiasme niveau'}:
                          </label>
                          <span className="text-sm font-semibold text-cyan-900 dark:text-cyan-100">
                            {roleEnthusiasmLevels[role.id] || role.enthusiasmLevel || 3}/5
                          </span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="5"
                          value={roleEnthusiasmLevels[role.id] || role.enthusiasmLevel || 3}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleEnthusiasmChange(role.id, parseInt(e.target.value));
                          }}
                          onInput={(e) => {
                            e.stopPropagation();
                            handleEnthusiasmChange(role.id, parseInt((e.target as HTMLInputElement).value));
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full h-2 bg-cyan-200 dark:bg-cyan-700 rounded-lg appearance-none cursor-pointer slider"
                          style={{
                            background: `linear-gradient(to right, #0891b2 0%, #0891b2 ${((roleEnthusiasmLevels[role.id] || role.enthusiasmLevel || 3) - 1) * 25}%, #e2e8f0 ${((roleEnthusiasmLevels[role.id] || role.enthusiasmLevel || 3) - 1) * 25}%, #e2e8f0 100%)`
                          }}
                        />
                        <div className="flex justify-between text-xs text-cyan-600 dark:text-cyan-400 mt-1">
                          <span>{t('aiDiscussion.enthusiasmLow') || 'Pessimistisch'}</span>
                          <span>{t('aiDiscussion.enthusiasmHigh') || 'Zeer enthousiast'}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-slate-700">
          <button
            onClick={handleBackToGoals}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
          >
            {t('aiDiscussion.backToGoals') || 'Terug naar doelen'}
          </button>

          <button
            onClick={handleRolesToStyles}
            disabled={selectedRoles.length < 2 || selectedRoles.length > 4}
            className="flex items-center gap-2 px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <FiMessageSquare size={16} />
            {t('aiDiscussion.configureStyles') || 'Configureer discussiestijlen'}
          </button>
        </div>
      </div>
    );
  }

  // Discussion Styles Configuration Step
  if (step === 'styles') {
    return (
      <div className="space-y-6">
        {/* Progress Indicator */}
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-green-600 dark:text-green-400 mt-1 flex-shrink-0"><FiSettings size={20} /></span>
            <div>
              <h4 className="font-medium text-green-800 dark:text-green-200 mb-1">
                {t('aiDiscussion.stylesConfiguration') || 'Discussiestijlen configuratie'}
              </h4>
              <p className="text-sm text-green-700 dark:text-green-300">
                {t('aiDiscussion.stylesConfigurationDesc') || 'Pas de discussiestijl aan per geselecteerde rol. Standaardwaarden zijn al ingesteld op basis van de rol.'}
              </p>
            </div>
          </div>
        </div>

        {/* Selected Goal and Roles Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-lg p-4">
            <h4 className="font-medium text-cyan-800 dark:text-cyan-200 mb-2 flex items-center gap-2">
              <FiTarget size={16} />
              {t('aiDiscussion.selectedGoal') || 'Geselecteerd doel'}
            </h4>
            <p className="text-sm text-cyan-700 dark:text-cyan-300">
              {selectedGoal && (t(`aiDiscussion.goal.${selectedGoal.id}`) || selectedGoal.name)}
            </p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-2">
              <FiUsers size={16} />
              {t('aiDiscussion.selectedRoles') || 'Geselecteerde rollen'} ({selectedRoles.length})
            </h4>
            <div className="flex flex-wrap gap-1">
              {selectedRoles.map((role, index) => (
                <span key={role.id} className="text-xs bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                  {index === 0 && '👑 '}{t(`aiDiscussion.role.${role.id}`) || role.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Style Configuration per Role */}
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">
              {t('aiDiscussion.configureRoleStyles') || 'Configureer discussiestijlen per rol'}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {t('aiDiscussion.configureRoleStylesDesc') || 'Selecteer discussiestijlen voor elke rol. Je kunt meerdere stijlen combineren voor een coherente benadering.'}
            </p>
          </div>

          {selectedRoles.map((role) => {
            const roleStyles = discussionStyles.roleStyles[role.id] || { roleId: role.id, selectedStyles: [] };
            
            return (
              <div key={role.id} className="border border-gray-200 dark:border-slate-700 rounded-lg p-6 bg-white dark:bg-slate-800">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{getRoleIcon(role.id)}</span>
                  <div>
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                      {t(`aiDiscussion.role.${role.id}`) || role.name}
                      {selectedRoles.indexOf(role) === 0 && (
                        <span className="ml-2 text-sm bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded">
                          {t('aiDiscussion.moderator') || 'Gespreksleider'}
                        </span>
                      )}
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {t(`aiDiscussion.role.${role.id}Desc`) || role.description}
                    </p>
                  </div>
                </div>

                {/* Style Categories */}
                <div className="space-y-4">
                  {/* Communication Tone & Conciseness */}
                  <div>
                    <h5 className="font-medium text-slate-700 dark:text-slate-300 mb-3">
                      {t('aiDiscussion.communicationTone') || 'Communicatietoon & Beknoptheid'}
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {DISCUSSION_STYLE_OPTIONS.filter(style => style.category === 'communication_tone').map((style) => {
                        const isSelected = roleStyles.selectedStyles.includes(style.id);
                        return (
                          <button
                            key={style.id}
                            onClick={() => handleStyleToggle(role.id, style.id)}
                            className={`text-left p-3 border rounded-lg transition-all duration-200 ${
                              isSelected
                                ? 'border-cyan-300 dark:border-cyan-600 bg-cyan-50 dark:bg-cyan-900/30'
                                : 'border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 hover:border-cyan-200 dark:hover:border-cyan-700'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h6 className="font-medium text-sm text-slate-800 dark:text-slate-200">
                                {style.nameNL}
                              </h6>
                              {isSelected && (
                                <span className="text-cyan-600 dark:text-cyan-400"><FiCheck size={16} /></span>
                              )}
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400">
                              {style.descriptionNL}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Interaction Pattern & Questioning */}
                  <div>
                    <h5 className="font-medium text-slate-700 dark:text-slate-300 mb-3">
                      {t('aiDiscussion.interactionPattern') || 'Interactiepatroon & Vragenstelling'}
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {DISCUSSION_STYLE_OPTIONS.filter(style => style.category === 'interaction_pattern').map((style) => {
                        const isSelected = roleStyles.selectedStyles.includes(style.id);
                        return (
                          <button
                            key={style.id}
                            onClick={() => handleStyleToggle(role.id, style.id)}
                            className={`text-left p-3 border rounded-lg transition-all duration-200 ${
                              isSelected
                                ? 'border-cyan-300 dark:border-cyan-600 bg-cyan-50 dark:bg-cyan-900/30'
                                : 'border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 hover:border-cyan-200 dark:hover:border-cyan-700'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h6 className="font-medium text-sm text-slate-800 dark:text-slate-200">
                                {style.nameNL}
                              </h6>
                              {isSelected && (
                                <span className="text-cyan-600 dark:text-cyan-400"><FiCheck size={16} /></span>
                              )}
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400">
                              {style.descriptionNL}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Depth Focus & Approach */}
                  <div>
                    <h5 className="font-medium text-slate-700 dark:text-slate-300 mb-3">
                      {t('aiDiscussion.depthFocus') || 'Diepgang & Focus'}
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {DISCUSSION_STYLE_OPTIONS.filter(style => style.category === 'depth_focus').map((style) => {
                        const isSelected = roleStyles.selectedStyles.includes(style.id);
                        return (
                          <button
                            key={style.id}
                            onClick={() => handleStyleToggle(role.id, style.id)}
                            className={`text-left p-3 border rounded-lg transition-all duration-200 ${
                              isSelected
                                ? 'border-cyan-300 dark:border-cyan-600 bg-cyan-50 dark:bg-cyan-900/30'
                                : 'border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 hover:border-cyan-200 dark:hover:border-cyan-700'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h6 className="font-medium text-sm text-slate-800 dark:text-slate-200">
                                {style.nameNL}
                              </h6>
                              {isSelected && (
                                <span className="text-cyan-600 dark:text-cyan-400"><FiCheck size={16} /></span>
                              )}
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400">
                              {style.descriptionNL}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-slate-700">
          <button
            onClick={handleBackToRoles}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
          >
            {t('aiDiscussion.backToRoles') || 'Terug naar rollen'}
          </button>

          <button
            onClick={handleStartDiscussion}
            className="flex items-center gap-2 px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
          >
            <FiUsers size={16} />
            {t('aiDiscussion.startDiscussion') || 'Start discussie'}
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default AIDiscussionConfiguration;