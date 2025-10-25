import React, { useState } from 'react';
import { AIDiscussionReport, AIDiscussionSession } from '../../types';
import { FiDownload, FiFileText, FiClock, FiUsers, FiTarget, FiCheck, FiCopy } from 'react-icons/fi';
import { displayToast } from '../utils/clipboard';

interface DiscussionReportPageProps {
  t: (key: string, params?: Record<string, unknown>) => string;
  report: AIDiscussionReport;
  session: AIDiscussionSession;
}

const DiscussionReportPage: React.FC<DiscussionReportPageProps> = ({
  t,
  report,
  session
}) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('nl-NL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
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

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      displayToast(t('aiDiscussion.reportCopied', 'Rapport gekopieerd naar klembord'), 'success');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      displayToast(t('aiDiscussion.copyError', 'Fout bij kopiëren naar klembord'), 'error');
    }
  };

  const generatePDF = async () => {
    setIsGeneratingPDF(true);
    
    try {
      // Create PDF content
      const pdfContent = generatePDFContent();
      
      // Use browser's print functionality to generate PDF
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(pdfContent);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
      }
      
      displayToast(t('aiDiscussion.pdfGenerated', 'PDF rapport gegenereerd'), 'success');
    } catch (error) {
      console.error('Error generating PDF:', error);
      displayToast(t('aiDiscussion.pdfError', 'Fout bij genereren van PDF'), 'error');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const generatePDFContent = () => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>AI Discussie Rapport - ${session.topic.title}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #1f2937;
            margin-bottom: 10px;
          }
          .meta-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
          }
          .meta-card {
            background: #f9fafb;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
          }
          .meta-card h3 {
            margin: 0 0 10px 0;
            color: #374151;
            font-size: 14px;
            font-weight: 600;
          }
          .section {
            margin-bottom: 30px;
          }
          .section h2 {
            color: #1f2937;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 10px;
            margin-bottom: 15px;
          }
          .participants {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
          }
          .participant {
            background: #dbeafe;
            color: #1e40af;
            padding: 5px 10px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
          }
          .key-points, .recommendations {
            list-style: none;
            padding: 0;
          }
          .key-points li, .recommendations li {
            background: #f0f9ff;
            margin-bottom: 10px;
            padding: 10px;
            border-radius: 6px;
            border-left: 4px solid #0ea5e9;
          }
          .transcript {
            background: #f9fafb;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
            white-space: pre-wrap;
            font-size: 14px;
            line-height: 1.5;
          }
          @media print {
            body { margin: 0; padding: 15px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>AI Discussie Rapport</h1>
          <p>${session.topic.title}</p>
          <p style="color: #6b7280; font-size: 14px;">Gegenereerd op ${formatDate(report.generatedAt)}</p>
        </div>

        <div class="meta-info">
          <div class="meta-card">
            <h3>Discussie Details</h3>
            <p><strong>Onderwerp:</strong> ${session.topic.title}</p>
            <p><strong>Doel:</strong> ${t(`aiDiscussion.goal.${session.goal.id}`, session.goal.name)}</p>
            <p><strong>Aantal beurten:</strong> ${session.turns.length}</p>
          </div>
          <div class="meta-card">
            <h3>Deelnemers</h3>
            <div class="participants">
              ${session.roles.map(role => 
                `<span class="participant">${getRoleIcon(role.id)} ${t(`aiDiscussion.role.${role.id}`, role.name)}</span>`
              ).join('')}
            </div>
          </div>
        </div>

        <div class="section">
          <h2>Samenvatting</h2>
          <p>${report.summary}</p>
        </div>

        <div class="section">
          <h2>Belangrijkste Punten</h2>
          <ul class="key-points">
            ${report.keyPoints.map(point => `<li>${point}</li>`).join('')}
          </ul>
        </div>

        <div class="section">
          <h2>Aanbevelingen</h2>
          <ul class="recommendations">
            ${report.recommendations.map(rec => `<li>${rec}</li>`).join('')}
          </ul>
        </div>

        <div class="section">
          <h2>Volledige Discussie</h2>
          <div class="transcript">${report.fullTranscript}</div>
        </div>
      </body>
      </html>
    `;
  };

  const copyFullReport = () => {
    const reportText = `
AI DISCUSSIE RAPPORT
${session.topic.title}

Gegenereerd op: ${formatDate(report.generatedAt)}

DISCUSSIE DETAILS:
- Onderwerp: ${session.topic.title}
- Beschrijving: ${session.topic.description}
- Doel: ${t(`aiDiscussion.goal.${session.goal.id}`, session.goal.name)}
- Deelnemers: ${session.roles.map(role => t(`aiDiscussion.role.${role.id}`, role.name)).join(', ')}
- Aantal beurten: ${session.turns.length}

SAMENVATTING:
${report.summary}

BELANGRIJKSTE PUNTEN:
${report.keyPoints.map((point, index) => `${index + 1}. ${point}`).join('\n')}

AANBEVELINGEN:
${report.recommendations.map((rec, index) => `${index + 1}. ${rec}`).join('\n')}

VOLLEDIGE DISCUSSIE:
${report.fullTranscript}
    `.trim();

    copyToClipboard(reportText);
  };

  return (
    <div className="space-y-6">
      {/* Report Header */}
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">
              {t('aiDiscussion.discussionReport', 'Discussie Rapport')}
            </h2>
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-3">
              {session.topic.title}
            </h3>
            <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1">
                <FiClock size={14} />
                <span>{formatDate(report.generatedAt)}</span>
              </div>
              <div className="flex items-center gap-1">
                <FiUsers size={14} />
                <span>{session.roles.length} {t('aiDiscussion.participants', 'deelnemers')}</span>
              </div>
              <div className="flex items-center gap-1">
                <FiTarget size={14} />
                <span>{session.turns.length} {t('aiDiscussion.turns', 'beurten')}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={copyFullReport}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
            >
              <FiCopy size={16} />
              {t('aiDiscussion.copyReport', 'Rapport kopiëren')}
            </button>
            
            <button
              onClick={generatePDF}
              disabled={isGeneratingPDF}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              <FiDownload size={16} />
              {isGeneratingPDF 
                ? t('aiDiscussion.generatingPDF', 'PDF genereren...')
                : t('aiDiscussion.downloadPDF', 'Download PDF')
              }
            </button>
          </div>
        </div>

        {/* Discussion Meta Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-slate-700">
          <div>
            <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">
              {t('aiDiscussion.discussionGoal', 'Discussiedoel')}
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {t(`aiDiscussion.goal.${session.goal.id}`, session.goal.name)}
            </p>
          </div>
          
          <div>
            <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">
              {t('aiDiscussion.participants', 'Deelnemers')}
            </h4>
            <div className="flex flex-wrap gap-1">
              {session.roles.map((role) => (
                <span
                  key={role.id}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-cyan-100 dark:bg-cyan-900/20 text-cyan-800 dark:text-cyan-200 text-xs rounded-full"
                >
                  {getRoleIcon(role.id)}
                  {t(`aiDiscussion.role.${role.id}`, role.name)}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
          {t('aiDiscussion.summary', 'Samenvatting')}
        </h3>
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
          {report.summary}
        </p>
      </div>

      {/* Key Points */}
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
          {t('aiDiscussion.keyPoints', 'Belangrijkste punten')}
        </h3>
        <ul className="space-y-3">
          {report.keyPoints.map((point, index) => (
            <li key={index} className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-medium">
                {index + 1}
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {point}
              </p>
            </li>
          ))}
        </ul>
      </div>

      {/* Recommendations */}
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
          {t('aiDiscussion.recommendations', 'Aanbevelingen')}
        </h3>
        <ul className="space-y-3">
          {report.recommendations.map((recommendation, index) => (
            <li key={index} className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center">
                <FiCheck size={14} />
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {recommendation}
              </p>
            </li>
          ))}
        </ul>
      </div>

      {/* Full Transcript */}
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
            {t('aiDiscussion.fullTranscript', 'Volledige discussie')}
          </h3>
          <button
            onClick={() => copyToClipboard(report.fullTranscript)}
            className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
          >
            <FiCopy size={14} />
            {t('aiDiscussion.copyTranscript', 'Transcript kopiëren')}
          </button>
        </div>
        
        <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 max-h-96 overflow-y-auto">
          <pre className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">
            {report.fullTranscript}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default DiscussionReportPage;