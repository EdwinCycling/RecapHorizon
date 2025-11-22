import SocialPostXCard from './SocialPostXCard';
import SocialPostCard from './SocialPostCard';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { buildRecapHorizonFilename } from '../utils/downloadUtils';
import { buildEpub } from '../utils/epub';
import { markdownToSanitizedHtml } from '../utils/textUtils';
import jsPDF from 'jspdf';
import { StorytellingData, ExecutiveSummaryData, QuizQuestion, KeywordTopic, SentimentAnalysisResult, ChatMessage, BusinessCaseData, ExplainData, SocialPostData, TeachMeData, TranslationFunction } from '../../types';
import { OpportunityAnalysisData } from './OpportunitiesTab';
import { getBcp47Code } from '../languages';
import EmailCompositionTab, { EmailData } from './EmailCompositionTab';













type RecapItemType = 'summary' | 'keywords' | 'sentiment' | 'faq' | 'learnings' | 'followup' | 'chat' | 'mindmap' | 'exec' | 'quiz' | 'storytelling' | 'businessCase' | 'blog' | 'explain' | 'email' | 'socialPost' | 'socialPostX' | 'teachMe' | 'thinkingPartner' | 'opportunities' | 'mckinsey';

interface RecapItem {
	id: string;
	type: RecapItemType;
	title: string;
	enabled: boolean;
}

interface RecapHorizonPanelProps {
	// Localized label provider
	t: TranslationFunction;

	// Content inputs (already computed by the main app)
	transcript: string;
	summary: string;
	keywordAnalysis: KeywordTopic[] | null;
	sentiment: SentimentAnalysisResult | null;
	faq: string;
	learnings: string; // key learnings
	followup: string; // follow-up questions/actions
	chatHistory: ChatMessage[];
	mindmapText: string; // Mermaid text version
	executiveSummaryData?: ExecutiveSummaryData | null;
	storytellingData?: StorytellingData | null;
	businessCaseData?: BusinessCaseData | null;
	blogData?: string;
	explainData?: ExplainData | null;
	socialPostData?: SocialPostData | null;
socialPostXData?: SocialPostData | null;
	teachMeData?: TeachMeData | null;
	thinkingPartnerAnalysis?: string;
	selectedThinkingPartnerTopic?: string;
	selectedThinkingPartner?: { name: string };
	opportunitiesData?: OpportunityAnalysisData | null;
	mckinseyAnalysis?: string;
	selectedMckinseyTopic?: string;
	selectedMckinseyRole?: string;
	selectedMckinseyFramework?: string;
	quizQuestions?: QuizQuestion[] | null;
	quizIncludeAnswers?: boolean;
	outputLanguage?: string; // Output language for BCP47 display

	// Email functionality
	emailAddresses?: string[];
	emailEnabled?: boolean;
	onPreviewEmail?: (emailData: EmailData) => void;
	onOpenMailto?: (emailData: EmailData) => void;

	// Social Post functionality
	onGenerateSocialPost?: (analysisType: 'socialPost' | 'socialPostX', postCount: number) => Promise<void>;
	isGeneratingSocialPost?: boolean;

	// Image Generation functionality
	onGenerateImage?: (analysisType: 'socialPost' | 'socialPostX', style: string, color: string) => Promise<void>;
	imageGenerationStyle?: string;
	imageGenerationColor?: string;
	isGeneratingImage?: boolean;

	// Quiz functionality
	onGenerateQuiz?: ({ numQuestions, numOptions }: { numQuestions: number; numOptions: number }) => Promise<void>;

	// Notifications
	onNotify?: (message: string, type?: 'success' | 'error' | 'info') => void;

	// Recording start timestamp for email subjects
	startStamp?: string;
}

const ChevronIcon: React.FC<{ className?: string; direction: 'up' | 'down' }>
	= ({ className, direction }) => (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
			{direction === 'down' ? (
				<polyline points="6 9 12 15 18 9" />
			) : (
				<polyline points="18 15 12 9 6 15" />
			)}
		</svg>
	);

const ArrowButton: React.FC<{ disabled?: boolean; onClick: () => void; direction: 'up' | 'down'; t: TranslationFunction }>
	= ({ disabled, onClick, direction, t }) => (
		<button
			onClick={onClick}
			disabled={disabled}
			className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed`}
			aria-label={direction === 'up' ? t('moveUp') : t('moveDown')}
		>
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
				{direction === 'up' ? <polyline points="18 15 12 9 6 15"/> : <polyline points="6 9 12 15 18 9"/>}
			</svg>
		</button>
	);

export const RecapHorizonPanel: React.FC<RecapHorizonPanelProps> = ({
	t,
	transcript,
	summary,
	keywordAnalysis,
	sentiment,
	faq,
	learnings,
	followup,
	chatHistory,
	mindmapText,
	executiveSummaryData,
	storytellingData,
	businessCaseData,
	blogData,
	explainData,
	socialPostData,
  socialPostXData,
	teachMeData,
	thinkingPartnerAnalysis,
	selectedThinkingPartnerTopic,
	selectedThinkingPartner,
	opportunitiesData,
	mckinseyAnalysis,
	selectedMckinseyTopic,
	selectedMckinseyRole,
	selectedMckinseyFramework,
	quizQuestions,
	quizIncludeAnswers,
	outputLanguage,
	emailAddresses,
	emailEnabled,
	onPreviewEmail,
	onOpenMailto,
	onGenerateSocialPost,
	isGeneratingSocialPost,
	onGenerateImage,
	imageGenerationStyle,
	imageGenerationColor,
	isGeneratingImage,
	onGenerateQuiz,
	onNotify,
	startStamp,
}) => {
	const [isOpen, setIsOpen] = useState<boolean>(true);
  // Removed per-item ellipsis menus for consistency; using up/down arrows across all items
	const [persistentItems, setPersistentItems] = useState<RecapItem[]>([]);
	const [resultsCache, setResultsCache] = useState<{ [key in RecapItemType]?: string }>({});

// Reset panel alleen bij een nieuwe sessie (startStamp)
const previousStartStampRef = useRef<string | undefined>(startStamp);

useEffect(() => {
	// Alleen resetten bij significante startStamp verandering (niet elke seconde)
	const shouldReset = (() => {
		if (!previousStartStampRef.current) return true; // Eerste keer altijd resetten

		// Parse timestamps en vergelijk alleen datum/tijd zonder seconden
		const parseTime = (stamp: string) => {
			const match = stamp.match(/(\d+)-(\d+)-(\d+),\s*(\d+):(\d+):(\d+)/);
			if (!match) return null;

			const [, day, month, year, hour, minute] = match;
			return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute));
		};

		const prevTime = parseTime(previousStartStampRef.current);
		const currentTime = parseTime(startStamp);

		if (!prevTime || !currentTime) return true; // Fallback naar oude gedrag

		// Reset alleen als verschil groter is dan 1 minuut
		const diffMinutes = Math.abs(currentTime.getTime() - prevTime.getTime()) / (1000 * 60);
		return diffMinutes > 1;
	})();

	if (shouldReset) {
		setPersistentItems([]);
		processedContentRef.current.clear();
		previousStartStampRef.current = startStamp;
	}
}, [startStamp]);

	// Watch content readiness - voeg items toe wanneer nieuwe inhoud beschikbaar komt
	const processedContentRef = useRef<Set<string>>(new Set());

	useEffect(() => {
		const availableContent = new Set<string>();

		// Check welke content beschikbaar is
		if (!!summary && summary.trim().length > 0) availableContent.add('summary');
		if (!!keywordAnalysis && keywordAnalysis.length > 0) availableContent.add('keywords');
		if (!!sentiment && !!sentiment.summary && !!sentiment.conclusion) availableContent.add('sentiment');
		if (!!faq && faq.trim().length > 0) availableContent.add('faq');
		if (!!learnings && learnings.trim().length > 0) availableContent.add('learnings');
		if (!!followup && followup.trim().length > 0) availableContent.add('followup');
		if (Array.isArray(chatHistory) && chatHistory.length > 0) availableContent.add('chat');
		if (!!mindmapText && mindmapText.trim().length > 0) availableContent.add('mindmap');
		if (!!executiveSummaryData) availableContent.add('exec');
    if (!!quizQuestions && quizQuestions.length > 0) availableContent.add('quiz');
		if (!!storytellingData) availableContent.add('storytelling');
    if (!!businessCaseData && typeof businessCaseData.businessCase === 'string' && businessCaseData.businessCase.trim().length > 0) {
      availableContent.add('businessCase');
    }
		if (!!blogData && blogData.trim().length > 0) availableContent.add('blog');
		if (!!explainData && explainData.explanation && explainData.explanation.trim().length > 0) availableContent.add('explain');
		if (!!teachMeData && teachMeData.content && teachMeData.content.trim().length > 0) availableContent.add('teachMe');
		if (!!thinkingPartnerAnalysis && thinkingPartnerAnalysis.trim().length > 0) availableContent.add('thinkingPartner');
		if (!!opportunitiesData && opportunitiesData.results && opportunitiesData.results.length > 0) availableContent.add('opportunities');
		if (emailEnabled && !!emailAddresses && emailAddresses.length > 0) availableContent.add('email');
		// Social post (LinkedIn) - handle both string and array for backward compatibility
		if (
		  !!socialPostData &&
		  !!socialPostData.post &&
		  (
		    Array.isArray(socialPostData.post)
		      ? socialPostData.post.some(p => !!p && p.trim().length > 0)
		      : socialPostData.post.trim().length > 0
		  )
		) {
		  availableContent.add('socialPost');
		}
		// Social post (X / BlueSky) - handle both string and array
		if (
		  !!socialPostXData &&
		  !!socialPostXData.post &&
		  (
		    Array.isArray(socialPostXData.post)
		      ? socialPostXData.post.some(p => !!p && p.trim().length > 0)
		      : socialPostXData.post.trim().length > 0
		  )
		) {
		  availableContent.add('socialPostX');
		}
		if (!!mckinseyAnalysis && typeof mckinseyAnalysis === 'string' && mckinseyAnalysis.trim().length > 0) availableContent.add('mckinsey');

		// Vind nieuwe content die nog niet is verwerkt
		const newContent = Array.from(availableContent).filter(type => !processedContentRef.current.has(type));

		if (newContent.length > 0) {
			const itemsToAdd: RecapItem[] = [];

			newContent.forEach(type => {
				let title = '';
				switch (type) {
					case 'summary': title = t('summary'); break;
					case 'keywords': title = t('keywordAnalysis'); break;
					case 'sentiment': title = t('sentiment'); break;
					case 'faq': title = t('faq'); break;
					case 'learnings': title = t('keyLearnings'); break;
					case 'followup': title = t('followUp'); break;
					case 'chat': title = t('chat'); break;
					case 'mindmap': title = t('mindmap'); break;
					case 'exec': title = t('executiveSummary', 'Executive summary'); break;
					case 'quiz': title = t('quizQuestions', 'Quizvragen'); break;
					case 'storytelling': title = t('storytelling'); break;
					case 'businessCase': title = t('businessCase', 'Zakelijke case'); break;
					case 'blog': title = t('blog'); break;
					case 'explain': title = t('explain'); break;
					case 'teachMe': title = t('teachMe'); break;
					case 'thinkingPartner': title = t('thinkingPartner'); break;
					case 'opportunities': title = t('opportunities'); break;
					case 'email': title = t('emailFormTitle', 'E-mail Samenstelling'); break;
					case 'socialPost': title = t('socialPost', 'Social Post'); break;
          case 'socialPostX': title = t('socialPostX', 'X / BlueSky post'); break;
					case 'mckinsey': title = t('mckinseyAnalysisComplete'); break;
				}
				itemsToAdd.push({ id: type, type: type as RecapItemType, title, enabled: false });
			});

			setPersistentItems(prev => [...prev, ...itemsToAdd]);

			// Update welke content we hebben verwerkt
			newContent.forEach(type => processedContentRef.current.add(type));
		}
	}, [summary, keywordAnalysis, sentiment, faq, learnings, followup, chatHistory, mindmapText, executiveSummaryData, quizQuestions, storytellingData, businessCaseData, blogData, explainData, teachMeData, thinkingPartnerAnalysis, opportunitiesData, mckinseyAnalysis, socialPostData]);

	const hasAnyItem = persistentItems.length > 0;
	const numEnabled = persistentItems.filter(i => i.enabled).length;

	const borderColorClass = useMemo(() => {
		if (!hasAnyItem) return 'border-gray-300';
		if (numEnabled === 0) return 'border-orange-400';
		return 'border-green-500';
	}, [hasAnyItem, numEnabled]);

	// Toggle item, maar als al in cache, voer niet opnieuw uit
const toggleItem = (id: string) => {
	const item = persistentItems.find(i => i.id === id);
	if (!item) return;
	if (resultsCache[item.type]) {
		setPersistentItems(prev => prev.map(i => i.id === id ? { ...i, enabled: !i.enabled } : i));
		return;
	}
	// Alleen genereren als nog niet in cache
	const section = composeSectionText(item.type);
	setResultsCache(prev => ({ ...prev, [item.type]: section.text }));
	setPersistentItems(prev => prev.map(i => i.id === id ? { ...i, enabled: !i.enabled } : i));
};
const moveItem = (index: number, direction: 'up' | 'down') => setPersistentItems(prev => {
	const newArr = [...prev];
	const target = direction === 'up' ? index - 1 : index + 1;
	if (target < 0 || target >= newArr.length) return prev;
	const tmp = newArr[target];
	newArr[target] = newArr[index];
	newArr[index] = tmp;
	return newArr;
});

	const buildQuizText = (includeAnswers: boolean | undefined): string => {
		if (!quizQuestions || quizQuestions.length === 0) return '';
		const lines: string[] = [];
		quizQuestions.forEach((q, idx) => {
			lines.push(`${idx + 1}. ${q.question}`);
			q.options.forEach(opt => {
				lines.push(`  ${opt.label}) ${opt.text}`);
			});
            if (includeAnswers) {
                lines.push(`  ${t('correctAnswer')}: ${q.correct_answer_label} - ${q.correct_answer_text}`);
            }
			lines.push('');
		});
		return lines.join('\n');
	};

	const composeSectionText = useCallback((type: RecapItemType): { title: string; text: string } => {
		switch (type) {
			case 'summary':
				return { title: `${t('summary')}`, text: summary || '' };
			case 'keywords': {
				let content = '';
				if (keywordAnalysis && keywordAnalysis.length > 0) {
					const lines: string[] = [];
					for (const topic of keywordAnalysis) {
						if (topic.topic) lines.push(`- ${topic.topic}: ${topic.keywords.join(', ')}`);
						else lines.push(`- ${topic.keywords.join(', ')}`);
					}
					content = lines.join('\n');
				}
				return { title: `${t('keywordAnalysis')}`, text: content };
			}
			case 'sentiment': {
				const parts: string[] = [];
				if (sentiment) {
					parts.push(`${t('sentimentSummary')}`);
					parts.push(sentiment.summary || '');
					parts.push('');
					parts.push(`${t('sentimentConclusion')}`);
					parts.push(sentiment.conclusion || '');
				}
				return { title: `${t('sentiment')}`, text: parts.join('\n') };
			}
			case 'faq':
				return { title: `${t('faq')}`, text: faq || '' };
			case 'learnings':
				return { title: `${t('keyLearnings')}`, text: learnings || '' };
			case 'followup':
				return { title: `${t('followUp')}`, text: followup || '' };
			case 'chat': {
				const lines: string[] = [];
				for (const msg of chatHistory) {
					const speaker = msg.role === 'user' ? 'User' : 'AI';
					lines.push(`${speaker}: ${msg.text}`);
				}
				return { title: `${t('chat')}`, text: lines.join('\n') };
			}
			case 'mindmap':
				return { title: `${t('mindmap')}`, text: mindmapText || '' };
			case 'exec': {
				const sections: string[] = [];
				const block = (label: string, value?: string) => `${label}\n${value || ''}`;
				sections.push(block(t('objective'), executiveSummaryData?.objective));
				sections.push('');
				sections.push(block(t('situation'), executiveSummaryData?.situation));
				sections.push('');
				sections.push(block(t('complication'), executiveSummaryData?.complication));
				sections.push('');
				sections.push(block(t('resolution'), executiveSummaryData?.resolution));
				sections.push('');
				sections.push(block(t('benefits'), executiveSummaryData?.benefits));
				sections.push('');
				sections.push(block(t('callToAction'), executiveSummaryData?.call_to_action));
				return { title: `${t('executiveSummary', 'Executive summary')}`, text: sections.join('\n') };
			}
			case 'quiz': {
				return { title: `${t('quizQuestions', 'Quizvragen')}`, text: buildQuizText(quizIncludeAnswers) };
			}
			case 'storytelling': {
				return { title: `${t('storytelling')}`, text: storytellingData?.story || '' };
			}
			case 'businessCase': {
				return { title: `${t('businessCase', 'Zakelijke case')}`, text: businessCaseData?.businessCase || '' };
			}
			case 'blog': {
				return { title: `${t('blog')}`, text: blogData || '' };
			}
			case 'explain': {
				if (!explainData) return { title: `## ${t('explain')}`, text: '' };
				const parts: string[] = [];
				parts.push(`Complexity Level: ${explainData.complexityLevel}`);
				parts.push(`Focus Area: ${explainData.focusArea}`);
				parts.push(`Format: ${explainData.format}`);
				parts.push('');
				parts.push(explainData.explanation);
				return { title: `${t('explain')}`, text: parts.join('\n') };
			}
			case 'teachMe': {
				if (!teachMeData) return { title: `${t('teachMe')}`, text: '' };
				const parts: string[] = [];
				parts.push(`${t('teachMeSelectedTopic')}: ${teachMeData.topic.title}`);
				parts.push(`${t('teachMeMethod')}: ${teachMeData.method.name}`);
				parts.push('');
				parts.push(teachMeData.content);
				return { title: `${t('teachMe')}`, text: parts.join('\n') };
			}
			case 'thinkingPartner': {
				if (!thinkingPartnerAnalysis) return { title: `${t('thinkingPartner')}`, text: '' };
				const parts: string[] = [];
				if (selectedThinkingPartnerTopic) {
					parts.push(`${t('thinkingPartnerSelectedTopic')}: ${selectedThinkingPartnerTopic}`);
				}
				if (selectedThinkingPartner) {
					parts.push(`${t('thinkingPartnerMethod')}: ${selectedThinkingPartner.name}`);
				}
				parts.push('');
				parts.push(thinkingPartnerAnalysis);
				return { title: `${t('thinkingPartner')}`, text: parts.join('\n') };
			}
			case 'opportunities': {
				if (!opportunitiesData || !opportunitiesData.results || opportunitiesData.results.length === 0) {
					return { title: `${t('opportunities')}`, text: '' };
				}
				const parts: string[] = [];
				
				// Add metadata
				parts.push(`${t('opportunitiesSelectedTopics')}: ${opportunitiesData.selectedTopics.map(t => t.title).join(', ')}`);
				parts.push(`${t('opportunitiesSelectedRoles')}: ${opportunitiesData.selectedRoles.map(r => r.name).join(', ')}`);
				parts.push(`${t('opportunitiesSelectedTypes')}: ${opportunitiesData.selectedOpportunityTypes.map(t => t.name).join(', ')}`);
				parts.push(`${t('opportunitiesGeneratedAt')}: ${opportunitiesData.timestamp.toLocaleString()}`);
				parts.push('');
				
				// Add each opportunity result
				opportunitiesData.results.forEach((result, index) => {
					parts.push(`--- ${t('opportunity')} ${index + 1} ---`);
					parts.push(`${t('opportunityTopic')}: ${result.topic}`);
					parts.push(`${t('opportunityRole')}: ${result.role}`);
					parts.push(`${t('opportunityType')}: ${result.type}`);
					parts.push('');
					parts.push(result.content);
					parts.push('');
				});
				
				return { title: `${t('opportunities')}`, text: parts.join('\n') };
			}
			case 'socialPost': {
				// Show full social post content in exports
				const postContent = socialPostData?.post;
				let content = '';
				if (postContent) {
					if (Array.isArray(postContent)) {
						content = postContent.filter(p => p && p.trim().length > 0).join('\n\n');
					} else {
						content = postContent;
					}
				}
				return { title: `${t('socialPost')}`, text: content };
			}
			case 'socialPostX': {
				// Show full social post content in exports
				const postContent = socialPostXData?.post;
				let content = '';
				if (postContent) {
					if (Array.isArray(postContent)) {
						content = postContent.filter(p => p && p.trim().length > 0).join('\n\n');
					} else {
						content = postContent;
					}
				}
				return { title: `${t('socialPostX')}`, text: content };
			}
			case 'mckinsey': {
				if (!mckinseyAnalysis || typeof mckinseyAnalysis !== 'string') return { title: `${t('mckinseyAnalysisComplete')}`, text: '' };
				const parts: string[] = [];
				if (selectedMckinseyTopic) {
					parts.push(`${t('mckinseySelectTopic')}: ${selectedMckinseyTopic}`);
				}
				if (selectedMckinseyRole) {
					parts.push(`${t('mckinseySelectRole')}: ${selectedMckinseyRole}`);
				}
				if (selectedMckinseyFramework) {
					parts.push(`${t('mckinseySelectFramework')}: ${selectedMckinseyFramework}`);
				}
				parts.push('');
				parts.push(mckinseyAnalysis);
				return { title: `${t('mckinseyAnalysisComplete')}`, text: parts.join('\n') };
			}
		}
	}, [t, summary, keywordAnalysis, sentiment, faq, learnings, followup, chatHistory, mindmapText, executiveSummaryData, storytellingData, businessCaseData, blogData, explainData, teachMeData, thinkingPartnerAnalysis, selectedThinkingPartnerTopic, selectedThinkingPartner, opportunitiesData, socialPostData, socialPostXData, quizQuestions, quizIncludeAnswers, mckinseyAnalysis, selectedMckinseyTopic, selectedMckinseyRole, selectedMckinseyFramework]);

const enabledItems = persistentItems.filter(i => i.enabled);

const getOrCacheResult = (type: RecapItemType) => {
		if (resultsCache[type]) return resultsCache[type]!;
		const section = composeSectionText(type);
		setResultsCache(prev => ({ ...prev, [type]: section.text }));
		return section.text;
	};

    // Helper: strip Markdown and control characters for clean plain text export/copy
    const stripMarkdown = useCallback((text: string): string => {
        if (!text) return '';
        let out = text;
        
        // First, preserve star ratings by converting them to a safe placeholder
        out = out.replace(/★+/g, (match) => `STAR_RATING_${match.length}_STARS`);
        out = out.replace(/⭐+/g, (match) => `STAR_RATING_${match.length}_STARS`);
        
        // Normalize newlines and tabs
        out = out.replace(/\r\n/g, '\n');
        out = out.replace(/\t/g, '  ');
        // Remove ATX headings markers (#) and Setext underlines
        out = out.replace(/^[ \t]*#{1,6}[ \t]*/gm, '');
        out = out.replace(/^\s*(=|-){3,}\s*$/gm, '');
        // Bold/italic markers
        out = out.replace(/(\*\*|__)(.*?)\1/g, '$2');
        out = out.replace(/(\*|_)(.*?)\1/g, '$2');
        // Code blocks and inline code
        out = out.replace(/```[\s\S]*?```/g, '');
        out = out.replace(/`([^`]+)`/g, '$1');
        // Links and images
        out = out.replace(/!\[(.*?)\]\((.*?)\)/g, '$1');
        out = out.replace(/\[(.*?)\]\((.*?)\)/g, '$1 ($2)');
        // Blockquotes
        out = out.replace(/^[ \t]*>+[ \t]?/gm, '');
        // Normalize list bullets at line-start (convert *, +, - to a single dash)
        out = out.replace(/^[ \t]*([*+\-])\s+/gm, '- ');
        // Normalize nested bullet symbols that may slip through (• · ▪ ◦)
        out = out.replace(/[•·▪◦]/g, '-');
        // Normalize ordered list markers like "1)" or "1."
        out = out.replace(/^[ \t]*(\d{1,3})[\.)]\s+/gm, '$1. ');
        // Remove control/non-printable characters
        out = out.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
        // Remove lines that are only formatting garbage but preserve star ratings
        out = out.replace(/^\s*[&*_~`\-]+\s*$/gm, '');
        out = out.replace(/^\s*&+\s*$/gm, '');
        
        // Convert star rating placeholders back to stars
        out = out.replace(/STAR_RATING_(\d+)_STARS/g, (match, count) => '★'.repeat(parseInt(count)));
        
        // Collapse excessive blank lines
        out = out.replace(/\n{3,}/g, '\n\n');
        // Trim extra spaces on each line
        out = out.split('\n').map(l => l.replace(/\s+$/,'')).join('\n');
        return out.trim();
    }, []);

    // Convert markdown to well-formatted plain text preserving structure
    const markdownToPlainText = useCallback((text: string): string => {
        if (!text) return '';
        let formatted = text.replace(/\r\n|\r/g, '\n');
        
        // First, preserve star ratings by converting them to a safe placeholder
        formatted = formatted.replace(/★+/g, (match) => `STAR_RATING_${match.length}_STARS`);
        formatted = formatted.replace(/⭐+/g, (match) => `STAR_RATING_${match.length}_STARS`);
        
        // Preserve common emoticons by converting to text descriptions
        const emojiMap: { [key: string]: string } = {
            '😀': ':grinning:',
            '😃': ':smiley:',
            '😄': ':smile:',
            '😁': ':grin:',
            '😊': ':blush:',
            '😍': ':heart_eyes:',
            '🤔': ':thinking:',
            '👍': ':thumbs_up:',
            '👎': ':thumbs_down:',
            '❤️': ':heart:',
            '💡': ':bulb:',
            '🎯': ':target:',
            '🚀': ':rocket:',
            '💪': ':muscle:',
            '🔥': ':fire:',
            '✨': ':sparkles:',
            '🎉': ':party:',
            '📈': ':chart_up:',
            '📊': ':chart:',
            '💰': ':money:',
            '🏆': ':trophy:',
            '⚡': ':lightning:',
            '🌟': ':star2:',
            '💎': ':diamond:',
            '🎪': ':circus:',
            '🎭': ':theater:',
            '🎨': ':art:',
            '📝': ':memo:',
            '📚': ':books:',
            '🔍': ':search:',
            '🎓': ':graduation_cap:',
            '💼': ':briefcase:',
            '🌍': ':earth:',
            '🌎': ':earth_americas:',
            '🌏': ':earth_asia:'
        };
        
        // Replace emojis with text descriptions
        Object.entries(emojiMap).forEach(([emoji, description]) => {
            formatted = formatted.replace(new RegExp(emoji, 'g'), description);
        });
        
        // Convert headers to uppercase with underlines
        formatted = formatted.replace(/^[ \t]*#{1,6}[ \t]*(.+)$/gm, (match, title) => {
            const cleanTitle = title.trim().toUpperCase();
            return `\n${cleanTitle}\n${'='.repeat(cleanTitle.length)}\n`;
        });
        
        // Convert bold to uppercase, keep content
        formatted = formatted.replace(/(\*\*|__)(.*?)\1/g, (match, marker, content) => content.toUpperCase());
        
        // Keep italic content but remove markers
        formatted = formatted.replace(/(\*|_)(.*?)\1/g, '$2');
        
        // Remove code blocks but keep content
        formatted = formatted.replace(/```[\s\S]*?```/g, '');
        formatted = formatted.replace(/`([^`]+)`/g, '$1');
        
        // Convert links to "text (url)" format
        formatted = formatted.replace(/!\[(.*?)\]\((.*?)\)/g, '$1');
        formatted = formatted.replace(/\[(.*?)\]\((.*?)\)/g, '$1 ($2)');
        
        // Convert blockquotes to indented text
        formatted = formatted.replace(/^[ \t]*>+[ \t]?(.*)$/gm, '    $1');
        
        // Convert unordered lists to bullets with proper spacing
        formatted = formatted.replace(/^[ \t]*([*+\-])[ \t]+(.*)$/gm, '• $2');
        
        // Convert ordered lists with proper numbering
        formatted = formatted.replace(/^[ \t]*(\d{1,3})[\.)]\s+(.*)$/gm, '$1. $2');
        
        // Clean up control characters but preserve structure
        formatted = formatted.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '');
        
        // Remove lines of only formatting garbage but preserve star ratings
        formatted = formatted.replace(/^\s*[&*_~`\-]+\s*$/gm, '');
        
        // Convert star rating placeholders back to stars
        formatted = formatted.replace(/STAR_RATING_(\d+)_STARS/g, (match, count) => '★'.repeat(parseInt(count)));
        
        // Preserve paragraph breaks but limit excessive spacing
        formatted = formatted.replace(/\n{4,}/g, '\n\n\n');
        
        // Trim trailing spaces per line but preserve structure
        formatted = formatted.split('\n').map(l => l.replace(/\s+$/, '')).join('\n');
        
        // Convert to CRLF for Windows compatibility
        formatted = formatted.replace(/\n/g, '\r\n');
        
        return formatted.trim();
    }, []);

    const composedText = useMemo(() => {
        if (enabledItems.length === 0) return '';
        const sections = enabledItems.map(i => {
            const section = composeSectionText(i.type);
            return `${section.title}\n\n${getOrCacheResult(i.type)}`;
        });
        return sections.join('\n\n\n');
    }, [enabledItems, composeSectionText, resultsCache]);

    // Plain-text version for export/copy: convert markdown to formatted plain text
  const composedPlainText = useMemo(() => {
        if (enabledItems.length === 0) return '';
        const sections = enabledItems.map(i => {
            const section = composeSectionText(i.type);
            const cleanBody = markdownToPlainText(getOrCacheResult(i.type));
            return `${section.title}\n\n${cleanBody}`;
        });
        return sections.join('\n\n\n');
  }, [enabledItems, composeSectionText, resultsCache, markdownToPlainText]);

    const handleExportEpub = useCallback(async () => {
        if (!enabledItems.length) return;
        const sections = enabledItems.map(i => {
            const section = composeSectionText(i.type);
            const htmlBody = markdownToSanitizedHtml(getOrCacheResult(i.type));
            return { id: i.id, title: section.title, html: htmlBody };
        });
        const lang = outputLanguage || 'nl';
        const blob = await buildEpub({ title: 'RecapHorizon Export', author: 'RecapHorizon', lang, sections });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = buildRecapHorizonFilename('epub');
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        if (onNotify) onNotify('EPUB gedownload', 'success');
    }, [enabledItems, composeSectionText, resultsCache, outputLanguage]);

    const handleExportText = useCallback(() => {
        if (!composedPlainText) return;
        // Normalize to CRLF for maximum compatibility on Windows editors
        const crlf = composedPlainText.replace(/\r?\n/g, '\r\n');
        const blob = new Blob([crlf], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = buildRecapHorizonFilename('txt');
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        if (onNotify) onNotify('Tekstbestand gedownload', 'success');
    }, [composedPlainText]);

    const handleExportPdf = useCallback(() => {
        if (!enabledItems.length) return;
        const doc = new jsPDF({ unit: 'pt', format: 'a4' });
        // Use standaard Helvetica in dev om fontload-problemen te voorkomen
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 40;
        const contentWidth = pageWidth - margin * 2;
        let y = margin;

        enabledItems.forEach((it, idx) => {
            if (idx > 0) { doc.addPage(); y = margin; }
            const section = composeSectionText(it.type);
            // Title
            doc.setFont(doc.getFont().fontName || 'helvetica', 'bold');
            doc.setFontSize(14);
            const titleLines = doc.splitTextToSize(section.title, contentWidth);
            for (const line of titleLines) {
                if (y + 18 > pageHeight - margin) { doc.addPage(); y = margin; }
                doc.text(line as unknown as string, margin, y);
                y += 18;
            }
            // Body
            doc.setFont(doc.getFont().fontName || 'helvetica', 'normal');
            doc.setFontSize(11);
            const cleanBody = markdownToPlainText(section.text || '');
            const rawLines = cleanBody.split('\n');
            const addPageIfNeeded = (h: number) => {
                if (y + h > pageHeight - margin) { doc.addPage(); y = margin; }
            };
            rawLines.forEach((raw) => {
                const ln = raw.trimEnd();
                if (ln.trim() === '') { y += 8; return; }
                const ul = ln.match(/^\s*-\s+(.*)$/);
                const ol = ln.match(/^\s*(\d{1,3})\.\s+(.*)$/);
                if (ul) {
                    const text = ul[1];
                    const indent = 20;
                    const wrapped = doc.splitTextToSize(text, contentWidth - indent) as string[];
                    addPageIfNeeded(16 * wrapped.length);
                    doc.text('•', margin + 6, y);
                    wrapped.forEach(w => { doc.text(w, margin + indent, y); y += 16; });
                    y += 2;
                    return;
                }
                if (ol) {
                    const num = ol[1];
                    const text = ol[2];
                    const indent = 26;
                    const wrapped = doc.splitTextToSize(text, contentWidth - indent) as string[];
                    addPageIfNeeded(16 * wrapped.length);
                    doc.text(num + '.', margin + 2, y);
                    wrapped.forEach(w => { doc.text(w, margin + indent, y); y += 16; });
                    y += 2;
                    return;
                }
                const wrapped = doc.splitTextToSize(ln, contentWidth) as string[];
                addPageIfNeeded(16 * wrapped.length);
                wrapped.forEach(w => { doc.text(w, margin, y); y += 16; });
                y += 4;
            });
        });

        doc.save(buildRecapHorizonFilename('pdf'));
        if (onNotify) onNotify('PDF gedownload', 'success');
    }, [enabledItems, composeSectionText, markdownToPlainText]);

    const handleMailComposed = useCallback(() => {
        if (!composedPlainText) return;
        const locale = outputLanguage ? getBcp47Code(outputLanguage) : 'en-US';
        const subject = `RecapHorizon ${startStamp || new Date().toLocaleString(locale)} - RecapHorizon`;
        const body = composedPlainText;
		

		
		try {
			// Copy the full content to clipboard
			navigator.clipboard.writeText(body);
			
			// Show helpful toast with instructions
			if (onNotify) {
				onNotify(
					`Content copied to clipboard! 
					
To send via email:
1. Open your email client
2. Paste the content (Ctrl+V)
3. Add subject: ${subject}
4. Add recipient and send`,
					'success'
				);
			}
		} catch (error) {
			console.error('Failed to copy to clipboard:', error);
			if (onNotify) onNotify('Failed to copy content to clipboard. Please try again.', 'error');
		}
    }, [composedPlainText, startStamp, onNotify]);

	return (
		<div className={`w-full mb-3 border ${borderColorClass} rounded-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm`}>
			<button
				onClick={() => setIsOpen(prev => !prev)}
				className="w-full flex items-center justify-between px-3 py-2 text-left"
			>
				<div className="flex items-center gap-2">
					<span className="text-base font-medium text-slate-800 dark:text-slate-100">
						RecapHorizon{outputLanguage ? ` (${getBcp47Code(outputLanguage)})` : ''}
					</span>
					<span className="text-xs text-slate-500 dark:text-slate-400">{!hasAnyItem ? t('noItems') : numEnabled === 0 ? t('selectItems') : t('itemsSelected', { count: numEnabled })}</span>
				</div>
				<ChevronIcon className="w-5 h-5 text-slate-600 dark:text-slate-300" direction={isOpen ? 'up' : 'down'} />
			</button>
			{isOpen && (
				<div className="px-3 pb-3">
					{!hasAnyItem ? (
						<div className="p-3 text-sm text-slate-500 dark:text-slate-400">{t('itemsAppearHere')}</div>
					) : (
						<>
							<ul className="divide-y divide-gray-200 dark:divide-slate-700 rounded-md border border-gray-200 dark:border-slate-700 overflow-hidden">
								{persistentItems.map((item, index) => (
									<li key={item.id} className="flex items-center justify-between bg-white/60 dark:bg-slate-800/60 px-3 py-2">
										<div className="flex items-center gap-3">
											<input
												type="checkbox"
												checked={item.enabled}
												onChange={() => toggleItem(item.id)}
												className="w-4 h-4 accent-cyan-600"
											/>
											<span className="text-sm font-medium text-slate-800 dark:text-slate-200">{item.title}</span>
										</div>
                    <div className="flex items-center gap-1">
                      <ArrowButton direction="up" onClick={() => moveItem(index, 'up')} disabled={index === 0} t={t} />
                      <ArrowButton direction="down" onClick={() => moveItem(index, 'down')} disabled={index === persistentItems.length - 1} t={t} />
                    </div>
									</li>
								))}
							</ul>

							{numEnabled > 0 && (
                                <div className="flex flex-wrap items-center gap-2 mt-3">
                                    <button onClick={handleExportPdf} className="px-3 py-2 rounded bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-medium">{t('exportToPdf')}</button>
                                    <button onClick={handleExportText} className="px-3 py-2 rounded bg-slate-700 hover:bg-slate-800 text-white text-sm font-medium">{t('exportToText')}</button>
                                    <button onClick={handleExportEpub} className="px-3 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium">{t('exportToEpub', 'Export to EPUB')}</button>
                                    <button onClick={handleMailComposed} className="px-3 py-2 rounded bg-slate-600 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-800 text-white text-sm font-medium">{t('copyForEmail')}</button>
                                </div>
							)}
						</>
					)}
				</div>
			)}
		</div>
	);
};

export default RecapHorizonPanel;

async function handleExportEpub(this: any) {}


