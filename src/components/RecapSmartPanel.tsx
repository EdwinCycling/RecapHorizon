import React, { useCallback, useEffect, useMemo, useState } from 'react';
import jsPDF from 'jspdf';
import { StorytellingData, ExecutiveSummaryData, QuizQuestion, KeywordTopic, SentimentAnalysisResult, ChatMessage, ChatRole, BusinessCaseData } from '../../types';













type RecapItemType = 'summary' | 'keywords' | 'sentiment' | 'faq' | 'learnings' | 'followup' | 'chat' | 'mindmap' | 'exec' | 'quiz' | 'storytelling' | 'businessCase';

interface RecapItem {
	id: string;
	type: RecapItemType;
	title: string;
	enabled: boolean;
}

interface RecapSmartPanelProps {
	// Localized label provider
	t: (key: any, params?: any) => string;

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
	quizQuestions?: QuizQuestion[] | null;
	quizIncludeAnswers?: boolean;

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

const ArrowButton: React.FC<{ disabled?: boolean; onClick: () => void; direction: 'up' | 'down' }>
	= ({ disabled, onClick, direction }) => (
		<button
			onClick={onClick}
			disabled={disabled}
			className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed`}
			aria-label={direction === 'up' ? 'Omhoog' : 'Omlaag'}
		>
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
				{direction === 'up' ? <polyline points="18 15 12 9 6 15"/> : <polyline points="6 9 12 15 18 9"/>}
			</svg>
		</button>
	);

export const RecapSmartPanel: React.FC<RecapSmartPanelProps> = ({
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
	quizQuestions,
	quizIncludeAnswers,
	onNotify,
	startStamp,
}) => {
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const [items, setItems] = useState<RecapItem[]>([]);

	// Reset panel whenever transcript changes (new session/transcript)
	useEffect(() => {
		setIsOpen(false);
		setItems([]);
	}, [transcript]);

	// Helper: add item if content becomes available and item not present
	const ensureItem = useCallback((type: RecapItemType, title: string, available: boolean) => {
		setItems(prev => {
			const exists = prev.some(i => i.type === type);
			if (available && !exists) {
				const newItem: RecapItem = {
					id: `${type}`,
					type,
					title,
					enabled: false,
				};
				return [...prev, newItem];
			}
			if (!available && exists) {
				return prev.filter(i => i.type !== type);
			}
			return prev;
		});
	}, []);

	// Watch content readiness
	useEffect(() => {
		ensureItem('summary', t('summary'), !!summary && summary.trim().length > 0);
	}, [summary, t, ensureItem]);
	useEffect(() => {
		const available = !!keywordAnalysis && keywordAnalysis.length > 0;
		ensureItem('keywords', t('keywordAnalysis'), available);
	}, [keywordAnalysis, t, ensureItem]);
	useEffect(() => {
		const available = !!sentiment && !!sentiment.summary && !!sentiment.conclusion;
		ensureItem('sentiment', t('sentimentAnalysis'), available);
	}, [sentiment, t, ensureItem]);
	useEffect(() => {
		ensureItem('faq', t('faq'), !!faq && faq.trim().length > 0);
	}, [faq, t, ensureItem]);
	useEffect(() => {
		ensureItem('learnings', t('keyLearnings'), !!learnings && learnings.trim().length > 0);
	}, [learnings, t, ensureItem]);
	useEffect(() => {
		ensureItem('followup', t('followUp'), !!followup && followup.trim().length > 0);
	}, [followup, t, ensureItem]);
	useEffect(() => {
		const available = Array.isArray(chatHistory) && chatHistory.length > 0;
		ensureItem('chat', t('chat'), available);
	}, [chatHistory, t, ensureItem]);
	useEffect(() => {
		ensureItem('mindmap', t('mindmap'), !!mindmapText && mindmapText.trim().length > 0);
	}, [mindmapText, t, ensureItem]);
	useEffect(() => {
		ensureItem('exec', t('executiveSummary') || 'Executive summary', !!executiveSummaryData);
	}, [executiveSummaryData, t, ensureItem]);
	useEffect(() => {
		ensureItem('quiz', t('quizQuestions') || 'Quizvragen', !!quizQuestions && quizQuestions.length > 0);
	}, [quizQuestions, t, ensureItem]);
	useEffect(() => {
		ensureItem('storytelling', t('storytelling'), !!storytellingData);
	}, [storytellingData, t, ensureItem]);
	useEffect(() => {
		ensureItem('businessCase', t('businessCase') || 'Zakelijke case', !!businessCaseData);
	}, [businessCaseData, t, ensureItem]);

	const hasAnyItem = items.length > 0;
	const numEnabled = items.filter(i => i.enabled).length;

	const borderColorClass = useMemo(() => {
		if (!hasAnyItem) return 'border-gray-300';
		if (numEnabled === 0) return 'border-orange-400';
		return 'border-green-500';
	}, [hasAnyItem, numEnabled]);

	const toggleItem = (id: string) => setItems(prev => prev.map(i => i.id === id ? { ...i, enabled: !i.enabled } : i));
	const moveItem = (index: number, direction: 'up' | 'down') => setItems(prev => {
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
				return { title: `## ${t('sentimentAnalysis')}`, text: parts.join('\n') };
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
				sections.push(block(t('objective') || 'Objective', executiveSummaryData?.objective));
				sections.push('');
				sections.push(block(t('situation') || 'Situation', executiveSummaryData?.situation));
				sections.push('');
				sections.push(block(t('complication') || 'Complication', executiveSummaryData?.complication));
				sections.push('');
				sections.push(block(t('resolution') || 'Resolution', executiveSummaryData?.resolution));
				sections.push('');
				sections.push(block(t('benefits') || 'Benefits', executiveSummaryData?.benefits));
				sections.push('');
				sections.push(block(t('callToAction') || 'Call to Action', executiveSummaryData?.call_to_action));
				return { title: `## ${t('executiveSummary') || 'Executive summary'}`, text: sections.join('\n') };
			}
			case 'quiz': {
				return { title: `## ${t('quizQuestions') || 'Quizvragen'}`, text: buildQuizText(quizIncludeAnswers) };
			}
			case 'storytelling': {
				return { title: `## ${t('storytelling')}`, text: storytellingData?.story || '' };
			}
			case 'businessCase': {
				return { title: `## ${t('businessCase') || 'Zakelijke case'}`, text: businessCaseData?.businessCase || '' };
			}
		}
	}, [t, summary, keywordAnalysis, sentiment, faq, learnings, followup, chatHistory, mindmapText, executiveSummaryData, storytellingData, businessCaseData, quizQuestions, quizIncludeAnswers]);

	const enabledItems = items.filter(i => i.enabled);

	const composedText = useMemo(() => {
		if (enabledItems.length === 0) return '';
		const sections = enabledItems.map(i => composeSectionText(i.type));
		return sections.map(s => `${s.title}\n\n${s.text}`).join('\n\n\n');
	}, [enabledItems, composeSectionText]);

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
		const subject = encodeURIComponent(`RecapSmart ${startStamp || new Date().toLocaleString('nl-NL')} - RecapSmart`);
		const body = encodeURIComponent(composedText);
		window.location.href = `mailto:?subject=${subject}&body=${body}`;
	}, [composedText, startStamp]);

	return (
		<div className={`w-full mb-3 border ${borderColorClass} rounded-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm`}>
			<button
				onClick={() => setIsOpen(prev => !prev)}
				className="w-full flex items-center justify-between px-3 py-2 text-left"
			>
				<div className="flex items-center gap-2">
					<span className="text-base font-bold text-slate-800 dark:text-slate-100">RecapSmart</span>
					<span className="text-xs text-slate-500 dark:text-slate-400">{!hasAnyItem ? '(geen items)' : numEnabled === 0 ? '(selecteer items)' : `(${numEnabled} geselecteerd)`}</span>
				</div>
				<ChevronIcon className="w-5 h-5 text-slate-600 dark:text-slate-300" direction={isOpen ? 'up' : 'down'} />
			</button>
			{isOpen && (
				<div className="px-3 pb-3">
					{!hasAnyItem ? (
						<div className="p-3 text-sm text-slate-500 dark:text-slate-400">Items verschijnen hier zodra inhoud is geladen uit de tabbladen.</div>
					) : (
						<>
							<ul className="divide-y divide-gray-200 dark:divide-slate-700 rounded-md border border-gray-200 dark:border-slate-700 overflow-hidden">
								{items.map((item, index) => (
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
											<ArrowButton direction="up" onClick={() => moveItem(index, 'up')} disabled={index === 0} />
											<ArrowButton direction="down" onClick={() => moveItem(index, 'down')} disabled={index === items.length - 1} />
										</div>
									</li>
								))}
							</ul>

							{numEnabled > 0 && (
								<div className="flex flex-wrap items-center gap-2 mt-3">
									<button onClick={handleExportPdf} className="px-3 py-2 rounded-md bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-semibold">Exporteren naar PDF</button>
									<button onClick={handleExportText} className="px-3 py-2 rounded-md bg-slate-700 hover:bg-slate-800 text-white text-sm font-semibold">Exporteren naar Tekst</button>
									<button onClick={handleMailComposed} className="px-3 py-2 rounded-md bg-slate-600 hover:bg-slate-700 text-white text-sm font-semibold">Mail</button>
								</div>
							)}
						</>
					)}
				</div>
			)}
		</div>
	);
};

export default RecapSmartPanel;


