import SocialPostXCard from './SocialPostXCard';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import jsPDF from 'jspdf';
import { StorytellingData, ExecutiveSummaryData, QuizQuestion, KeywordTopic, SentimentAnalysisResult, ChatMessage, BusinessCaseData, ExplainData, SocialPostData } from '../../types';
import { getBcp47Code } from '../languages';
import EmailCompositionTab, { EmailData } from './EmailCompositionTab';













type RecapItemType = 'summary' | 'keywords' | 'sentiment' | 'faq' | 'learnings' | 'followup' | 'chat' | 'mindmap' | 'exec' | 'quiz' | 'storytelling' | 'businessCase' | 'blog' | 'explain' | 'email' | 'socialPost' | 'socialPostX';

interface RecapItem {
	id: string;
	type: RecapItemType;
	title: string;
	enabled: boolean;
}

interface RecapHorizonPanelProps {
	// Localized label provider
	t: (key: string, params?: Record<string, unknown>) => string;

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

const ArrowButton: React.FC<{ disabled?: boolean; onClick: () => void; direction: 'up' | 'down'; t: (key: string) => string }>
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
	quizQuestions,
	quizIncludeAnswers,
	outputLanguage,
	emailAddresses,
	emailEnabled,
	onPreviewEmail,
	onOpenMailto,
	onGenerateSocialPost,
	isGeneratingSocialPost,
	onNotify,
	startStamp,
}) => {
	const [isOpen, setIsOpen] = useState<boolean>(true);
const [quizMenuOpen, setQuizMenuOpen] = useState<boolean>(false);
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
		console.log('[RecapHorizonPanel] Significant session change detected - resetting');
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
		if (!!businessCaseData) availableContent.add('businessCase');
		if (!!blogData && blogData.trim().length > 0) availableContent.add('blog');
		if (!!explainData && explainData.explanation && explainData.explanation.trim().length > 0) availableContent.add('explain');
		if (emailEnabled && !!emailAddresses && emailAddresses.length > 0) availableContent.add('email');
		if (!!socialPostData && socialPostData.post && socialPostData.post.trim().length > 0) {
      availableContent.add('socialPost');
    }
    if (!!socialPostXData && socialPostXData.post && socialPostXData.post.trim().length > 0) {
      availableContent.add('socialPostX');
    }

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
					case 'email': title = t('emailFormTitle', 'E-mail Samenstelling'); break;
					case 'socialPost': title = t('socialPost', 'Social Post'); break;
          case 'socialPostX': title = t('socialPostX', 'X / BlueSky post'); break;
				}
				itemsToAdd.push({ id: type, type: type as RecapItemType, title, enabled: false });
			});

			setPersistentItems(prev => [...prev, ...itemsToAdd]);

			// Update welke content we hebben verwerkt
			newContent.forEach(type => processedContentRef.current.add(type));
		}
	}, [summary, keywordAnalysis, sentiment, faq, learnings, followup, chatHistory, mindmapText, executiveSummaryData, quizQuestions, storytellingData, businessCaseData, blogData, explainData, socialPostData]);

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
	console.log('[RecapHorizonPanel] toggleItem:', id, item.type, 'enabled:', !item.enabled);
	if (resultsCache[item.type]) {
		console.log('[RecapHorizonPanel] toggleItem: uit cache', item.type);
		setPersistentItems(prev => prev.map(i => i.id === id ? { ...i, enabled: !i.enabled } : i));
		return;
	}
	// Alleen genereren als nog niet in cache
	const section = composeSectionText(item.type);
	console.log('[RecapHorizonPanel] toggleItem: genereren en cachen', item.type);
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
				lines.push(`  Correct antwoord: ${q.correct_answer_label} - ${q.correct_answer_text}`);
			}
			lines.push('');
		});
		return lines.join('\n');
	};

	const composeSectionText = useCallback((type: RecapItemType): { title: string; text: string } => {
		switch (type) {
			case 'summary':
				return { title: `## ${t('summary')}`, text: summary || '' };
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
				return { title: `## ${t('keywordAnalysis')}`, text: content };
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
				return { title: `## ${t('sentiment')}`, text: parts.join('\n') };
			}
			case 'faq':
				return { title: `## ${t('faq')}`, text: faq || '' };
			case 'learnings':
				return { title: `## ${t('keyLearnings')}`, text: learnings || '' };
			case 'followup':
				return { title: `## ${t('followUp')}`, text: followup || '' };
			case 'chat': {
				const lines: string[] = [];
				for (const msg of chatHistory) {
					const speaker = msg.role === 'user' ? 'User' : 'AI';
					lines.push(`${speaker}: ${msg.text}`);
				}
				return { title: `## ${t('chat')}`, text: lines.join('\n') };
			}
			case 'mindmap':
				return { title: `## ${t('mindmap')}`, text: mindmapText || '' };
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
				return { title: `## ${t('executiveSummary', 'Executive summary')}`, text: sections.join('\n') };
			}
			case 'quiz': {
				return { title: `## ${t('quizQuestions', 'Quizvragen')}`, text: buildQuizText(quizIncludeAnswers) };
			}
			case 'storytelling': {
				return { title: `## ${t('storytelling')}`, text: storytellingData?.story || '' };
			}
			case 'businessCase': {
				return { title: `## ${t('businessCase', 'Zakelijke case')}`, text: businessCaseData?.businessCase || '' };
			}
			case 'blog': {
				return { title: `## ${t('blog')}`, text: blogData || '' };
			}
			case 'explain': {
				if (!explainData) return { title: `## ${t('explain')}`, text: '' };
				const parts: string[] = [];
				parts.push(`**Complexity Level:** ${explainData.complexityLevel}`);
				parts.push(`**Focus Area:** ${explainData.focusArea}`);
				parts.push(`**Format:** ${explainData.format}`);
				parts.push('');
				parts.push(explainData.explanation);
				return { title: `## ${t('explain')}`, text: parts.join('\n') };
			}
			case 'socialPost': {
				if (!socialPostData) return { title: `## ${t('socialPost')}`, text: '' };
				const parts: string[] = [];
				parts.push(socialPostData.post);
				if (socialPostData.imageInstruction) {
					parts.push('');
					parts.push(`**AI Image Instructions:**`);
					parts.push(socialPostData.imageInstruction);
				}
				return { title: `## ${t('socialPost')}`, text: parts.join('\n') };
			}
      case 'socialPostX': {
				if (!socialPostXData) return { title: `## ${t('socialPostX')}`, text: '' };
				const parts: string[] = [];
				parts.push(socialPostXData.post);
				if (socialPostXData.imageInstruction) {
					parts.push('');
					parts.push(`**AI Image Instructions:**`);
					parts.push(socialPostXData.imageInstruction);
				}
				return { title: `## ${t('socialPostX')}`, text: parts.join('\n') };
			}
		}
	}, [t, summary, keywordAnalysis, sentiment, faq, learnings, followup, chatHistory, mindmapText, executiveSummaryData, storytellingData, businessCaseData, blogData, explainData, socialPostData, quizQuestions, quizIncludeAnswers]);

	const enabledItems = persistentItems.filter(i => i.enabled);

	const getCachedOrGenerate = useCallback(async <T,>(type: RecapItemType, generator: () => Promise<T>): Promise<T> => {
		if (resultsCache[type]) {
			console.log(`[RecapHorizonPanel] Using cached result for ${type}`);
			return resultsCache[type];
		}

		console.log(`[RecapHorizonPanel] Generating new result for ${type}`);
		const result = await generator();
		setResultsCache(prev => ({ ...prev, [type]: result }));
		return result;
	}, [resultsCache]);

	const getOrCacheResult = (type: RecapItemType) => {
		if (resultsCache[type]) return resultsCache[type]!;
		const section = composeSectionText(type);
		setResultsCache(prev => ({ ...prev, [type]: section.text }));
		return section.text;
	};

	const composedText = useMemo(() => {
		if (enabledItems.length === 0) return '';
		const sections = enabledItems.map(i => {
			const section = composeSectionText(i.type);
			return `${section.title}\n\n${getOrCacheResult(i.type)}`;
		});
		return sections.join('\n\n\n');
	}, [enabledItems, composeSectionText, resultsCache]);

	const handleExportText = useCallback(() => {
		if (!composedText) return;
		const blob = new Blob([composedText], { type: 'text/plain;charset=utf-8' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'recap.txt';
		document.body.appendChild(a);
		a.click();
		a.remove();
		URL.revokeObjectURL(url);
		if (onNotify) onNotify('Tekstbestand gedownload', 'success');
	}, [composedText]);

	const handleExportPdf = useCallback(() => {
		if (!enabledItems.length) return;
		const doc = new jsPDF({ unit: 'pt', format: 'a4' });
		const pageWidth = doc.internal.pageSize.getWidth();
		const pageHeight = doc.internal.pageSize.getHeight();
		const margin = 40;
		const contentWidth = pageWidth - margin * 2;
		let y = margin;

		enabledItems.forEach((it, idx) => {
			if (idx > 0) { doc.addPage(); y = margin; }
			const section = composeSectionText(it.type);
			// Title
			doc.setFont('Helvetica', 'bold');
			doc.setFontSize(14);
			const titleLines = doc.splitTextToSize(section.title, contentWidth);
			for (const line of titleLines) {
				if (y + 18 > pageHeight - margin) { doc.addPage(); y = margin; }
				doc.text(line as unknown as string, margin, y);
				y += 18;
			}
			// Body
			doc.setFont('Helvetica', 'normal');
			doc.setFontSize(11);
			const bodyLines = doc.splitTextToSize(section.text || '', contentWidth) as unknown as string[];
			for (const line of bodyLines) {
				if (y + 14 > pageHeight - margin) { doc.addPage(); y = margin; }
				doc.text(line, margin, y);
				y += 14;
			}
		});

		doc.save('recap.pdf');
		if (onNotify) onNotify('PDF gedownload', 'success');
	}, [enabledItems, composeSectionText]);

	const handleMailComposed = useCallback(() => {
		if (!composedText) return;
		const locale = outputLanguage ? getBcp47Code(outputLanguage) : 'en-US';
		const subject = `RecapHorizon ${startStamp || new Date().toLocaleString(locale)} - RecapHorizon`;
		const body = composedText;
		

		
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
	}, [composedText, startStamp, onNotify]);

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
					<span className="text-xs text-slate-500 dark:text-slate-400">{!hasAnyItem ? '(geen items)' : numEnabled === 0 ? '(selecteer items)' : `(${numEnabled} geselecteerd)`}</span>
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
                                        {item.type === 'socialPostX' ? (
                                            <SocialPostXCard 
                                                socialPostXData={socialPostXData || { post: '', imageInstruction: '', platform: 'X / BlueSky' }} 
                                                onCopy={(content) => {
                                                    navigator.clipboard.writeText(content);
                                                    if (onNotify) onNotify(t('copiedToClipboard'), 'success');
                                                }}
                                                onGenerate={onGenerateSocialPost ? (count) => onGenerateSocialPost('socialPostX', count) : undefined}
                                                isGenerating={isGeneratingSocialPost || false}
                                                t={t} 
                                            />
                                        ) : (
													<span className="text-sm font-medium text-slate-800 dark:text-slate-200">{item.title}</span>
                                        )}
										</div>
										{item.type === 'quiz' ? (
											<div className="relative flex items-center gap-1">
												<button onClick={() => setQuizMenuOpen(prev => !prev)} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300">
													<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
												</button>
												{quizMenuOpen && (
													<div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-md shadow-lg z-10">
														<button onClick={() => { handleExportText(); setQuizMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700">{t('exportToText')}</button>
														<button onClick={() => { handleExportPdf(); setQuizMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700">{t('exportToPdf')}</button>
														<button onClick={() => { handleMailComposed(); setQuizMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700">{t('copyForEmail')}</button>
													</div>
												)}
											</div>
										) : (
											<div className="flex items-center gap-1">
												<ArrowButton direction="up" onClick={() => moveItem(index, 'up')} disabled={index === 0} t={t} />
												<ArrowButton direction="down" onClick={() => moveItem(index, 'down')} disabled={index === persistentItems.length - 1} t={t} />
											</div>
										)}
									</li>
								))}
							</ul>

							{numEnabled > 0 && (
								<div className="flex flex-wrap items-center gap-2 mt-3">
									<button onClick={handleExportPdf} className="px-3 py-2 rounded bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-medium">{t('exportToPdf')}</button>
									<button onClick={handleExportText} className="px-3 py-2 rounded bg-slate-700 hover:bg-slate-800 text-white text-sm font-medium">{t('exportToText')}</button>
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


