import React, { useState } from 'react';
import { AIDiscussionTopic, AIDiscussionGoal, AIDiscussionRole } from '../../types';
import { FiTarget, FiUsers, FiCheck, FiInfo, FiTool, FiCheckCircle, FiZap, FiShield } from 'react-icons/fi';

interface DiscussionCategory {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  goals: AIDiscussionGoal[];
}

interface AIDiscussionConfigurationProps {
  t: (key: string, params?: Record<string, unknown>) => string;
  selectedTopic: AIDiscussionTopic;
  goals: AIDiscussionGoal[];
  roles: AIDiscussionRole[];
  onConfigurationComplete: (goal: AIDiscussionGoal, selectedRoles: AIDiscussionRole[]) => void;
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
  const [step, setStep] = useState<'goal' | 'roles'>('goal');

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
  };

  const handleRoleToggle = (role: AIDiscussionRole) => {
    setSelectedRoles(prev => {
      const isSelected = prev.some(r => r.id === role.id);
      if (isSelected) {
        return prev.filter(r => r.id !== role.id);
      } else if (prev.length < 4) {
        return [...prev, role];
      }
      return prev;
    });
  };

  const handleStartDiscussion = () => {
    if (selectedGoal && selectedRoles.length === 4) {
      onConfigurationComplete(selectedGoal, selectedRoles);
    }
  };

  const handleBackToGoals = () => {
    setStep('goal');
    setSelectedRoles([]);
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
                {t('aiDiscussion.selectedTopic', 'Geselecteerd onderwerp')}
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
            {t('aiDiscussion.selectGoal', 'Selecteer discussiedoel')}
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            {t('aiDiscussion.selectGoalDesc', 'Kies het hoofddoel voor deze discussie uit 5 categorieën')}
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
                          {t(`aiDiscussion.goal.${goal.id}`, goal.name)}
                        </h5>
                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                          {t(`aiDiscussion.goal.${goal.id}Desc`, goal.description)}
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
                {t('aiDiscussion.selectedGoal', 'Geselecteerd doel')}
              </h4>
              <h5 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                {selectedGoal && t(`aiDiscussion.goal.${selectedGoal.id}`, selectedGoal.name)}
              </h5>
              <p className="text-sm text-green-700 dark:text-green-300">
                {selectedGoal && t(`aiDiscussion.goal.${selectedGoal.id}Desc`, selectedGoal.description)}
              </p>
            </div>
          </div>
        </div>

        {/* Role Selection */}
        <div className="text-center">
          <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">
            {t('aiDiscussion.selectRoles', 'Selecteer 4 organisatierollen')}
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            {t('aiDiscussion.selectRolesDesc', 'Kies welke rollen deelnemen aan de discussie')}
          </p>
          
          {/* Role Counter */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-sm">
            <FiUsers size={16} />
            <span className="font-medium">
              {selectedRoles.length}/4 {t('aiDiscussion.rolesSelected', 'rollen geselecteerd')}
            </span>
          </div>

          {/* Moderator Info */}
          <div className="mt-3 p-3 bg-yellow-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded">
            <p className="text-sm text-slate-700 dark:text-slate-300">
              {t('aiDiscussion.moderatorInfo', 'De 1e geselecteerde rol is de gespreksleider (moderator). Deze rol faciliteert het gesprek, stelt verhelderende vragen en vat samen.')}
            </p>
            {selectedRoles.length > 0 && (
              <p className="text-sm mt-2 text-slate-800 dark:text-slate-200">
                <span className="font-semibold">{t('aiDiscussion.currentModerator', 'Huidige gespreksleider')}:</span> {t(`aiDiscussion.role.${selectedRoles[0].id}`, selectedRoles[0].name)}
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
                        {t(`aiDiscussion.role.${role.id}`, role.name)}
                      </h4>
                      {isSelected && (
                        <span className="text-cyan-600 dark:text-cyan-400"><FiCheck size={16} /></span>
                      )}
                    </div>
                    <p className="text-sm opacity-90">
                      {t(`aiDiscussion.role.${role.id}Desc`, role.description)}
                    </p>
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
            {t('aiDiscussion.backToGoals', 'Terug naar doelen')}
          </button>

          <button
            onClick={handleStartDiscussion}
            disabled={selectedRoles.length !== 4}
            className="flex items-center gap-2 px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <FiUsers size={16} />
            {t('aiDiscussion.startDiscussion', 'Start discussie')}
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default AIDiscussionConfiguration;