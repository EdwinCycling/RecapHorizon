import React, { useEffect, useRef, useState } from 'react';
import { AIDiscussionSession, AIDiscussionMessage, AIDiscussionRole, TranslationFunction } from '../../types';
import { FiUser, FiClock, FiMessageCircle, FiSend, FiUsers } from 'react-icons/fi';

// Helper function to get emoji based on enthusiasm level
const getEnthusiasmEmoji = (level: number): string => {
  switch (level) {
    case 1: return '😔'; // Pessimistic
    case 2: return '😐'; // Neutral/Cautious
    case 3: return '🙂'; // Moderate/Constructive
    case 4: return '😊'; // Positive/Enthusiastic
    case 5: return '🤩'; // Super Enthusiastic
    default: return '🙂'; // Default
  }
};

interface MultiAgentDiscussionInterfaceProps {
  t: TranslationFunction;
  session: AIDiscussionSession;
  isActive: boolean;
  newTurnIds?: string[]; // IDs of turns that are new in the current round
  onUserIntervention?: (content: string, targetRoles: string[]) => void; // callback for user intervention
}

const MultiAgentDiscussionInterface: React.FC<MultiAgentDiscussionInterfaceProps> = ({
  t,
  session,
  isActive,
  newTurnIds = [],
  onUserIntervention
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [highlightedTurnIds, setHighlightedTurnIds] = useState<string[]>([]);
  
  // User intervention state
  const [userInput, setUserInput] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [showInterventionForm, setShowInterventionForm] = useState(false);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session.turns]);

  // Always show intervention form for user input
  useEffect(() => {
    setShowInterventionForm(true);
  }, []);

  // Handle user intervention submission
  const handleUserIntervention = () => {
    const trimmedInput = userInput.trim();
    
    // Validation checks
    if (!trimmedInput) {
      alert(t('aiDiscussion.emptyInput', 'Voer een vraag of opmerking in'));
      return;
    }
    
    if (trimmedInput.length < 25) {
      alert(t('aiDiscussion.minCharacters', 'Je vraag moet minimaal 25 karakters bevatten'));
      return;
    }
    
    if (trimmedInput.length > 250) {
      alert(t('aiDiscussion.maxCharacters', 'Je vraag mag maximaal 250 karakters bevatten'));
      return;
    }
    
    if (selectedRoles.length === 0) {
      alert(t('aiDiscussion.selectTargetRoles', 'Selecteer minimaal één rol om te antwoorden'));
      return;
    }
    
    // Basic security check - prevent potential injection attempts
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /eval\s*\(/i,
      /document\./i,
      /window\./i
    ];
    
    if (suspiciousPatterns.some(pattern => pattern.test(trimmedInput))) {
      alert(t('aiDiscussion.invalidInput', 'Je invoer bevat niet-toegestane tekens'));
      return;
    }

    // Only allow sending when the session is awaiting user input
    if (session.status !== 'awaiting_user_input') {
      alert(t('aiDiscussion.notAwaitingUserInput', 'Op dit moment kan je geen vraag stellen. Klik eerst op "Discussie voortzetten".'));
      return;
    }
    
    if (onUserIntervention) {
      onUserIntervention(trimmedInput, selectedRoles);
      setUserInput('');
      setSelectedRoles([]);
      // Keep the intervention form visible for more questions
    }
  };

  // Handle role selection for intervention
  const handleRoleToggle = (roleId: string) => {
    setSelectedRoles(prev => 
      prev.includes(roleId) 
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    );
  };

  // Handle select all roles
  const handleSelectAllRoles = () => {
    if (selectedRoles.length === session.roles.length) {
      setSelectedRoles([]);
    } else {
      setSelectedRoles(session.roles.map(role => role.id));
    }
  };

  // Update highlighted turns when new turns are added
  useEffect(() => {
    if (newTurnIds.length > 0) {
      // When a new question round starts, highlight the new questions
      setHighlightedTurnIds(newTurnIds);
    } else {
      // When starting a new question round, reset all highlighting
      setHighlightedTurnIds([]);
    }
  }, [newTurnIds]);

  const getRoleIcon = (roleId: string) => {
    switch (roleId) {
      // Leiderschap & Strategie
      case 'ceo': return '👑';
      case 'cfo': return '💰';
      case 'hr_hoofd': return '👥';
      case 'juridisch_directeur': return '⚖️';
      
      // Product & Markt
      case 'cpo': return '🚀';
      case 'marketing_specialist': return '📈';
      case 'verkoopdirecteur': return '💼';
      case 'customer_success': return '🤝';
      case 'product_owner': return '📋';
      
      // Techniek & Data
      case 'lead_architect': return '🏗️';
      case 'data_analist': return '📊';
      case 'security_expert': return '🔒';
      case 'devops_engineer': return '⚙️';
      
      // Operationeel
      case 'operationeel_manager': return '📈';
      case 'project_manager': return '📅';
      case 'kwaliteitsmanager': return '✅';
      
      // Innovatie & Toekomst
      case 'innovatie_manager': return '💡';
      case 'duurzaamheidsadviseur': return '🌱';
      case 'externe_consultant': return '🎯';
      
      // Gebruiker & Controle
      case 'eindgebruiker': return '👤';
      case 'interne_auditor': return '🔍';
      
      // Markt
      case 'invester': return '💎';
      case 'generaal': return '⭐';
      
      default: return '👤';
    }
  };

  const getRoleColor = (roleId: string) => {
    switch (roleId) {
      // Leiderschap & Strategie
      case 'ceo': return 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-200';
      case 'cfo': return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200';
      case 'hr_hoofd': return 'bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800 text-pink-800 dark:text-pink-200';
      case 'juridisch_directeur': return 'bg-slate-50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200';
      
      // Product & Markt
      case 'cpo': return 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200';
      case 'marketing_specialist': return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-800 dark:text-orange-200';
      case 'verkoopdirecteur': return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200';
      case 'customer_success': return 'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-200';
      case 'product_owner': return 'bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800 text-violet-800 dark:text-violet-200';
      
      // Techniek & Data
      case 'lead_architect': return 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-200';
      case 'data_analist': return 'bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-800 text-cyan-800 dark:text-cyan-200';
      case 'security_expert': return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200';
      case 'devops_engineer': return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200';
      
      // Operationeel
      case 'operationeel_manager': return 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200';
      case 'project_manager': return 'bg-lime-50 dark:bg-lime-900/20 border-lime-200 dark:border-lime-800 text-lime-800 dark:text-lime-200';
      case 'kwaliteitsmanager': return 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200';
      
      // Innovatie & Toekomst
      case 'innovatie_manager': return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200';
      case 'duurzaamheidsadviseur': return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200';
      case 'externe_consultant': return 'bg-neutral-50 dark:bg-neutral-900/20 border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200';
      
      // Gebruiker & Controle
      case 'eindgebruiker': return 'bg-sky-50 dark:bg-sky-900/20 border-sky-200 dark:border-sky-800 text-sky-800 dark:text-sky-200';
      case 'interne_auditor': return 'bg-stone-50 dark:bg-stone-900/20 border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-200';
      
      // Markt
      case 'invester': return 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200';
      case 'generaal': return 'bg-zinc-50 dark:bg-zinc-900/20 border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200';
      
      default: return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200';
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('nl-NL', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getRoleByIdFromSession = (roleId: string): AIDiscussionRole | undefined => {
    return session.roles.find(role => role.id === roleId);
  };

  const getAllMessages = (): AIDiscussionMessage[] => {
    return session.turns.flatMap(turn => turn.messages);
  };

  const allMessages = getAllMessages();

  // Helper function to check if a message is new (from the latest turn)
  const isNewMessage = (message: AIDiscussionMessage): boolean => {
    const messageTurn = session.turns.find(turn => turn.messages.some(msg => msg.id === message.id));
    return messageTurn ? highlightedTurnIds.includes(messageTurn.id) : false;
  };

  return (
    <div className="space-y-6">
      {/* Discussion Header */}
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
              {session.topic.title}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
              {session.topic.description}
            </p>
            <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1">
                <FiMessageCircle size={14} />
                <span>{t('aiDiscussion.turnCount', 'Beurt {{count}}', { count: session.actualTurnNumber || 0 })}</span>
              </div>
              <div className="flex items-center gap-1">
                <FiClock size={14} />
                <span>{formatTime(session.createdAt)}</span>
              </div>
              <div className="flex items-center gap-1">
                <FiUser size={14} />
                <span>{session.roles.length} {t('aiDiscussion.participants', 'deelnemers')}</span>
              </div>
            </div>
          </div>
          
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            session.status === 'active' 
              ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
              : 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-200'
          }`}>
            {session.status === 'active' 
              ? t('aiDiscussion.statusActive', 'Actief')
              : t('aiDiscussion.statusCompleted', 'Voltooid')
            }
          </div>
        </div>

        {/* Participants */}
        <div className="border-t border-gray-200 dark:border-slate-700 pt-4">
          <h4 className="text-base font-medium text-slate-700 dark:text-slate-300 mb-3">
            {t('aiDiscussion.participants', 'Deelnemers')}
          </h4>
          <div className="flex flex-wrap gap-2">
            {session.roles.map((role) => (
              <div
                key={role.id}
                className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm border ${getRoleColor(role.id)}`}
              >
                <span>{getRoleIcon(role.id)}</span>
                <span className="font-medium">
                  {t(`aiDiscussion.role.${role.id}`, role.name)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Discussion Messages */}
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg">
        <div className="p-4 border-b border-gray-200 dark:border-slate-700">
          <h4 className="font-medium text-slate-800 dark:text-slate-200">
            {t('aiDiscussion.discussionFlow', 'Discussie verloop')}
          </h4>
        </div>
        
        <div className="max-h-[600px] overflow-y-auto p-4 space-y-4">
          {allMessages.length === 0 ? (
            <div className="space-y-4">
              {/* Welcome Message */}
              <div className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 border border-cyan-200 dark:border-cyan-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-100 dark:bg-cyan-800 flex items-center justify-center">
                    <FiMessageCircle color="currentColor" size={16} />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-medium text-cyan-900 dark:text-cyan-100 mb-2">
                      {t('aiDiscussion.welcomeTitle', 'Discussie is gestart!')}
                    </h5>
                    <p className="text-sm text-cyan-800 dark:text-cyan-200 mb-3">
                      {t('aiDiscussion.welcomeMessage', 'De AI-experts gaan nu het onderwerp bespreken vanuit hun unieke perspectieven. Elke deelnemer zal hun expertise inbrengen om tot waardevolle inzichten te komen.')}
                    </p>
                    <div className="text-xs text-cyan-700 dark:text-cyan-300">
                      {t('aiDiscussion.welcomeAction', 'Klik op "Discussie voortzetten" om de eerste reacties te genereren.')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview of participants */}
              <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-4">
                <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  {t('aiDiscussion.participantsPreview', 'Deze experts gaan deelnemen aan de discussie:')}
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {session.roles.slice(0, 6).map((role) => (
                    <div key={role.id} className="flex items-center gap-2 text-xs">
                      <span className="text-base">{getRoleIcon(role.id)}</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {t(`aiDiscussion.role.${role.id}`, role.name)}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 text-xs">
                        - {role.focusArea}
                      </span>
                    </div>
                  ))}
                  {session.roles.length > 6 && (
                    <div className="text-xs text-slate-500 dark:text-slate-400 italic">
                      {t('aiDiscussion.moreParticipants', 'En {{count}} andere experts...', { count: session.roles.length - 6 })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            allMessages.map((message) => {
              const role = getRoleByIdFromSession(message.role);
              const isUserMessage = message.isUserIntervention;
              
              return (
                <div key={message.id} className={`flex gap-3 ${isUserMessage ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm border ${
                    isUserMessage 
                      ? 'bg-cyan-100 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-800 text-cyan-600 dark:text-cyan-400 order-2'
                      : role ? getRoleColor(role.id) : 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200'
                  }`}>
                    {isUserMessage ? <FiUser /> : (role ? getRoleIcon(role.id) : '👤')}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className={`flex items-center gap-2 mb-1 ${isUserMessage ? 'flex-row-reverse' : ''}`}>
                      {isUserMessage && message.targetRoles && message.targetRoles.length > 0 && (
                        <span className="text-xs text-cyan-600 dark:text-cyan-400">
                          → {message.targetRoles.length === session.roles.length 
                            ? t('aiDiscussion.allRoles', 'Alle rollen')
                            : message.targetRoles.map(roleId => 
                                session.roles.find(r => r.id === roleId)?.name || roleId
                              ).join(', ')
                          }
                        </span>
                      )}
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        {formatTime(message.timestamp)}
                      </span>
                      {!isUserMessage && (
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200">
                          {getEnthusiasmEmoji(session.roles.find(r => r.id === message.role)?.enthusiasmLevel || 3)} {t('aiDiscussion.enthusiasmLevel', 'Enthousiasme')}: {session.roles.find(r => r.id === message.role)?.enthusiasmLevel || 3}/5
                        </span>
                      )}
                      <span className={`font-medium text-base ${
                        isUserMessage 
                          ? 'text-cyan-800 dark:text-cyan-200'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}>
                        {isUserMessage 
                          ? (message.userName || t('aiDiscussion.user', 'Gebruiker'))
                          : (role ? t(`aiDiscussion.role.${role.id}`, role.name) : 'Unknown')
                        }
                        {isUserMessage && (
                          <span className="text-xs text-cyan-600 dark:text-cyan-400 ml-1">
                            ({t('aiDiscussion.userIntervention', 'Gebruiker')})
                          </span>
                        )}
                      </span>
                    </div>
                    
                    <div className={`rounded-lg p-3 transition-all duration-1000 ${
                      isUserMessage
                        ? 'bg-cyan-50 dark:bg-cyan-900/30 border border-cyan-200 dark:border-cyan-700 border-l-4 border-l-cyan-500'
                        : isNewMessage(message) 
                          ? 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700' 
                          : 'bg-gray-50 dark:bg-slate-700'
                    }`}>
                      <p className={`text-base leading-relaxed ${
                        isUserMessage
                          ? 'text-cyan-800 dark:text-cyan-200'
                          : isNewMessage(message) 
                            ? 'text-green-800 dark:text-green-200' 
                            : 'text-slate-700 dark:text-slate-300'
                      }`}>
                        {message.content.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1')}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          
          {/* Loading indicator when discussion is active */}
          {isActive && (
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-600 flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-gray-400 dark:border-slate-400 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <div className="flex-1">
                <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-3">
                  <p className="text-base text-slate-500 dark:text-slate-400 italic">
                    {t('aiDiscussion.generating', 'Nieuwe reacties worden gegenereerd...')}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Discussion Progress */}
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-lg text-slate-800 dark:text-slate-200">
            {t('aiDiscussion.progress', 'Voortgang')}
          </h4>
          <span className="text-base text-slate-500 dark:text-slate-400">
            {session.actualTurnNumber || 0}/10 {t('aiDiscussion.turns', 'beurten')}
          </span>
        </div>
        
        <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
          <div 
            className="bg-cyan-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((session.actualTurnNumber || 0) / 10) * 100}%` }}
          />
        </div>
        
        <div className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          {(session.actualTurnNumber || 0) < 10 
            ? t('aiDiscussion.canContinue', 'Je kunt de discussie voortzetten of een rapport genereren')
            : t('aiDiscussion.maxReached', 'Maximum aantal beurten bereikt - genereer een rapport')
          }
        </div>
      </div>

      {/* User Intervention Form */}
      {showInterventionForm && (
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FiMessageCircle size={20} color="#0891b2" />
              <h4 className="font-medium text-lg text-slate-800 dark:text-slate-200">
                {t('aiDiscussion.userIntervention', 'Stel een vraag of geef een opmerking')}
              </h4>
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              {t('aiDiscussion.interventionCount', 'Vragen: {{count}}/5', { count: session.userInterventionCount || 0 })}
            </div>
          </div>

          {/* Status hint */}
          {session.status === 'awaiting_user_input' ? (
            <div className="mb-4 flex items-start gap-2 rounded-md border border-green-200 bg-green-50 dark:border-emerald-900/40 dark:bg-emerald-900/20 p-3 text-sm text-emerald-800 dark:text-emerald-200">
              <span className="mt-0.5 inline-block h-2 w-2 rounded-full bg-emerald-500" />
              <p>
                {t('aiDiscussion.readyForIntervention', 'Je kunt nu je vraag stellen. Druk op Ctrl+Enter of klik op Verstuur.')}
              </p>
            </div>
          ) : (
            <div className="mb-4 flex items-start gap-2 rounded-md border border-yellow-200 bg-yellow-50 dark:border-amber-900/40 dark:bg-amber-900/20 p-3 text-sm text-amber-800 dark:text-amber-200">
              <span className="mt-0.5 inline-block h-2 w-2 rounded-full bg-amber-500" />
              <p>
                {t('aiDiscussion.notAwaitingIntervention', "Je kunt nog niet versturen. Klik eerst op 'Discussie voortzetten' om een vraag te kunnen stellen.")}
              </p>
            </div>
          )}
          
          {/* Role Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {t('aiDiscussion.selectTargetRoles', 'Selecteer rollen om te antwoorden:')}
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              <button
                onClick={handleSelectAllRoles}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedRoles.length === session.roles.length
                    ? 'bg-cyan-600 text-white'
                    : 'bg-gray-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                }`}
              >
                <span className="inline mr-1"><FiUsers size={16} /></span>
                {t('aiDiscussion.allRoles', 'Alle rollen')}
              </button>
              {session.roles.map(role => (
                <button
                  key={role.id}
                  onClick={() => handleRoleToggle(role.id)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedRoles.includes(role.id)
                      ? 'bg-cyan-600 text-white'
                      : 'bg-gray-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {role.name}
                </button>
              ))}
            </div>
          </div>

          {/* Input Field */}
          <div className="mb-4">
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder={t('aiDiscussion.interventionPlaceholder', 'Typ hier je vraag of opmerking...')}
              className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
              rows={3}
              maxLength={250}
              onKeyDown={(e) => {
                if (
                  e.key === 'Enter' &&
                  (e.ctrlKey || e.metaKey) &&
                  session.status === 'awaiting_user_input'
                ) {
                  handleUserIntervention();
                }
              }}
            />
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
              <span>{t('aiDiscussion.submitHint', 'Druk op Ctrl+Enter om te verzenden')}</span>
              <span className={userInput.length < 20 ? 'text-red-500' : userInput.length > 200 ? 'text-orange-500' : 'text-green-500'}>
                {userInput.length}/250 karakters
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              onClick={handleUserIntervention}
              disabled={!userInput.trim() || userInput.trim().length < 20 || userInput.trim().length > 250 || selectedRoles.length === 0 || session.status !== 'awaiting_user_input'}
              className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <FiSend />
              {t('aiDiscussion.submitIntervention', 'Verstuur')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiAgentDiscussionInterface;