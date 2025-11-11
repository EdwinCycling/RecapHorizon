import React, { useState, useEffect } from 'react';
import { AIDiscussionSession, AIDiscussionAnalytics as AnalyticsType, RoleActivityMetrics, ControversialTopic, VotingResults, TranslationFunction } from '../../types';
import { 
  FiBarChart2, 
  FiUsers, 
  FiTrendingUp, 
  FiMessageSquare, 
  FiTarget,
  FiActivity,
  FiPieChart,
  FiThumbsUp,
  FiThumbsDown,
  FiAlertTriangle,
  FiClock,
  FiZap
} from 'react-icons/fi';
import { generateDiscussionAnalytics } from '../services/aiDiscussionService';

interface AIDiscussionAnalyticsProps {
  session: AIDiscussionSession;
  t: TranslationFunction;
}

const AIDiscussionAnalytics: React.FC<AIDiscussionAnalyticsProps> = ({ session, t }) => {
  const [analytics, setAnalytics] = useState<AnalyticsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'roles' | 'topics' | 'voting'>('overview');

  useEffect(() => {
    const generateAnalytics = async () => {
      try {
        setLoading(true);
        const analyticsData = generateDiscussionAnalytics(session);
        setAnalytics(analyticsData);
      } catch (error) {
        console.error('Error generating analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    generateAnalytics();
  }, [session]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
        <span className="ml-3 text-slate-600 dark:text-slate-400">
          {t('aiDiscussion.analytics.loading')}
        </span>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-12 w-12 text-slate-400 mb-4 flex items-center justify-center">
          <FiBarChart2 size={48} />
        </div>
        <p className="text-slate-600 dark:text-slate-400">
          {t('aiDiscussion.analytics.noData')}
        </p>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: t('aiDiscussion.analytics.overview'), icon: FiBarChart2 },
    { id: 'roles', label: t('aiDiscussion.analytics.roles'), icon: FiUsers },
    { id: 'topics', label: t('aiDiscussion.analytics.topics'), icon: FiAlertTriangle },
    { id: 'voting', label: t('aiDiscussion.analytics.voting'), icon: FiThumbsUp }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 border border-cyan-200 dark:border-cyan-800 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="text-cyan-600 dark:text-cyan-400">
            <FiBarChart2 size={24} />
          </div>
          <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
            {t('aiDiscussion.analytics.title')}
          </h3>
        </div>
        <p className="text-slate-600 dark:text-slate-400">
          {t('aiDiscussion.analytics.description')}
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-slate-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 hover:border-gray-300'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <OverviewTab analytics={analytics} session={session} t={t} />
      )}
      
      {activeTab === 'roles' && (
        <RoleActivityTab analytics={analytics} session={session} t={t} />
      )}
      
      {activeTab === 'topics' && (
        <ControversialTopicsTab analytics={analytics} t={t} />
      )}
      
      {activeTab === 'voting' && (
        <VotingResultsTab analytics={analytics} t={t} />
      )}
    </div>
  );
};

// Overview Tab Component
const OverviewTab: React.FC<{
  analytics: AnalyticsType;
  session: AIDiscussionSession;
  t: TranslationFunction;
}> = ({ analytics, session, t }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Total Turns */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="text-blue-600 dark:text-blue-400">
            <FiActivity size={20} />
          </div>
          <h4 className="font-medium text-slate-800 dark:text-slate-200">
            {t('aiDiscussion.analytics.totalTurns')}
          </h4>
        </div>
        <p className="text-2xl font-bold text-slate-900 dark:text-white">
          {analytics.totalTurns}
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          {t('aiDiscussion.analytics.turnsDescription')}
        </p>
      </div>

      {/* Total Messages */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="text-green-600 dark:text-green-400">
            <FiMessageSquare size={20} />
          </div>
          <h4 className="font-medium text-slate-800 dark:text-slate-200">
            {t('aiDiscussion.analytics.totalMessages', 'Totaal Berichten')}
          </h4>
        </div>
        <p className="text-2xl font-bold text-slate-900 dark:text-white">
          {analytics.totalMessages}
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          {t('aiDiscussion.analytics.messagesDescription')}
        </p>
      </div>

      {/* Average Response Length */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="text-purple-600 dark:text-purple-400">
            <FiTrendingUp size={20} />
          </div>
          <h4 className="font-medium text-slate-800 dark:text-slate-200">
            {t('aiDiscussion.analytics.avgResponseLength')}
          </h4>
        </div>
        <p className="text-2xl font-bold text-slate-900 dark:text-white">
          {Math.round(analytics.averageResponseLength)}
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          {t('aiDiscussion.analytics.charactersAvg')}
        </p>
      </div>

      {/* User Interventions */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="text-orange-600 dark:text-orange-400">
            <FiTarget size={20} />
          </div>
          <h4 className="font-medium text-slate-800 dark:text-slate-200">
            {t('aiDiscussion.analytics.userInterventions')}
          </h4>
        </div>
        <p className="text-2xl font-bold text-slate-900 dark:text-slate-200">
          {analytics.userInterventions}
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          {t('aiDiscussion.analytics.interventionsDescription')}
        </p>
      </div>

      {/* Most Active Role */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="text-cyan-600 dark:text-cyan-400">
            <FiZap size={20} />
          </div>
          <h4 className="font-medium text-slate-800 dark:text-slate-200">
            {t('aiDiscussion.analytics.mostActiveRole')}
          </h4>
        </div>
        <p className="text-lg font-semibold text-slate-900 dark:text-white">
          {analytics.mostActiveRole?.name || t('aiDiscussion.analytics.noActiveRole')}
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          {analytics.mostActiveRole?.messageCount || 0} {t('aiDiscussion.analytics.messages')}
        </p>
      </div>

      {/* Discussion Duration */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="text-indigo-600 dark:text-indigo-400">
            <FiClock size={20} />
          </div>
          <h4 className="font-medium text-slate-800 dark:text-slate-200">
            {t('aiDiscussion.analytics.duration')}
          </h4>
        </div>
        <p className="text-2xl font-bold text-slate-900 dark:text-white">
          {Math.round(analytics.discussionDuration / 60000)} {t('aiDiscussion.analytics.minutes')}
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          {t('aiDiscussion.analytics.durationDescription')}
        </p>
      </div>
    </div>
  );
};

// Role Activity Tab Component
const RoleActivityTab: React.FC<{
  analytics: AnalyticsType;
  session: AIDiscussionSession;
  t: TranslationFunction;
}> = ({ analytics, session, t }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
          {t('aiDiscussion.analytics.roleActivity')}
        </h4>
        <div className="space-y-4">
          {analytics.roleActivity.map((role: RoleActivityMetrics) => (
            <div key={role.roleId} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
              <div className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: session.roles.find(r => r.id === role.roleId)?.color || '#6b7280' }}
                />
                <div>
                  <p className="font-medium text-slate-800 dark:text-slate-200">
                    {session.roles.find(r => r.id === role.roleId)?.name || t('aiDiscussion.analytics.unknownRole')}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {t('aiDiscussion.analytics.enthusiasm')}: {session.roles.find(r => r.id === role.roleId)?.enthusiasmLevel || 3}/5
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                  {role.messageCount} {t('aiDiscussion.analytics.messages')}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {Math.round(role.averageMessageLength)} {t('aiDiscussion.analytics.avgChars')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Participation Chart */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
          {t('aiDiscussion.analytics.participationDistribution')}
        </h4>
        <div className="space-y-3">
          {analytics.roleActivity.map((role: RoleActivityMetrics) => {
            const percentage = (role.messageCount / analytics.totalMessages) * 100;
            return (
              <div key={role.roleId} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-700 dark:text-slate-300">
                    {session.roles.find(r => r.id === role.roleId)?.name || t('aiDiscussion.analytics.unknownRole')}
                  </span>
                  <span className="text-slate-600 dark:text-slate-400">
                    {percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${percentage}%`,
                      backgroundColor: session.roles.find(r => r.id === role.roleId)?.color || '#6b7280'
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Controversial Topics Tab Component
const ControversialTopicsTab: React.FC<{
  analytics: AnalyticsType;
  t: TranslationFunction;
}> = ({ analytics, t }) => {
  if (!analytics.controversialTopics || analytics.controversialTopics.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-12 w-12 text-slate-400 mb-4 flex items-center justify-center">
          <FiAlertTriangle size={48} />
        </div>
        <p className="text-slate-600 dark:text-slate-400">
          {t('aiDiscussion.analytics.noControversialTopics')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
          {t('aiDiscussion.analytics.controversialTopics')}
        </h4>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
          {t('aiDiscussion.analytics.controversialDescription')}
        </p>
        <div className="space-y-4">
          {analytics.controversialTopics.map((topic: ControversialTopic, index: number) => (
            <div key={index} className="border border-slate-200 dark:border-slate-600 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <h5 className="font-medium text-slate-800 dark:text-slate-200">
                  {topic.topic}
                </h5>
                <div className="flex items-center gap-2">
                  <div className="text-orange-500">
                    <FiAlertTriangle size={16} />
                  </div>
                  <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                    {t('aiDiscussion.analytics.controversyLevel')}: {topic.controversyLevel}/5
                  </span>
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                {topic.description}
              </p>
              <div className="space-y-2">
                <h6 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t('aiDiscussion.analytics.differentPerspectives')}:
                </h6>
                <div className="space-y-1">
                  {topic.differentPerspectives.map((perspective, pIndex) => (
                    <div key={pIndex} className="text-sm text-slate-600 dark:text-slate-400 pl-4 border-l-2 border-slate-300 dark:border-slate-600">
                      <strong>{perspective.roleName}:</strong> {perspective.viewpoint}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Voting Results Tab Component
const VotingResultsTab: React.FC<{
  analytics: AnalyticsType;
  t: TranslationFunction;
}> = ({ analytics, t }) => {
  if (!analytics.votingResults || analytics.votingResults.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-12 w-12 text-slate-400 mb-4 flex items-center justify-center">
          <FiThumbsUp size={48} />
        </div>
        <p className="text-slate-600 dark:text-slate-400">
          {t('aiDiscussion.analytics.noVotingData')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
          {t('aiDiscussion.analytics.votingResults')}
        </h4>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
          {t('aiDiscussion.analytics.votingDescription')}
        </p>
        <div className="space-y-4">
          {analytics.votingResults.map((result: VotingResults, index: number) => (
            <div key={index} className="border border-slate-200 dark:border-slate-600 rounded-lg p-4">
              <h5 className="font-medium text-slate-800 dark:text-slate-200 mb-3">
                {result.question}
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FiThumbsUp className="text-green-500" size={16} />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {t('aiDiscussion.analytics.votesFor')}: {result.votesFor}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiThumbsDown className="text-red-500" size={16} />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {t('aiDiscussion.analytics.votesAgainst')}: {result.votesAgainst}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {t('aiDiscussion.analytics.totalVotes')}: {result.totalVotes}
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                    <div
                      className="h-2 bg-green-500 rounded-full transition-all duration-300"
                      style={{ width: `${(result.votesFor / result.totalVotes) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIDiscussionAnalytics;