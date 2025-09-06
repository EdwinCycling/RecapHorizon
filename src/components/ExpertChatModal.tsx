import React, { useState, useRef, useEffect } from 'react';
import { ExpertConfiguration, ExpertChatMessage } from '../../types';
import { GoogleGenAI, Chat } from '@google/genai';
import { tokenCounter } from '../tokenCounter';

interface ExpertChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  configuration: ExpertConfiguration;
  onAnalyze: (chatHistory: ExpertChatMessage[], chatTranscript?: string) => void;
  onCancel: () => void;
  t: (key: string) => string;
  apiKey: string;
  transcript?: string;
  updateTokensAndRefresh?: (promptTokens: number, responseTokens: number) => Promise<void>;
}

const ExpertChatModal: React.FC<ExpertChatModalProps> = ({
  isOpen,
  onClose,
  configuration,
  onAnalyze,
  onCancel,
  t,
  apiKey,
  transcript = '',
  updateTokensAndRefresh
}) => {
  const [messages, setMessages] = useState<ExpertChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedQuestion, setSuggestedQuestion] = useState('');
  const [showAnalyzeConfirm, setShowAnalyzeConfirm] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatInstanceRef = useRef<Chat | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Send initial AI greeting when chat opens
      const initialMessage: ExpertChatMessage = {
        id: Date.now().toString(),
        role: 'expert',
        content: `Hallo! Ik ben je ${configuration.role.name} gespecialiseerd in ${configuration.branche.name}. Ik sta klaar om je te helpen met vragen over "${configuration.topic.name}". Wat zou je graag willen bespreken?`,
        timestamp: new Date()
      };
      setMessages([initialMessage]);
      setSuggestedQuestion('Kun je me meer vertellen over de belangrijkste aspecten van dit onderwerp?');
    }
  }, [isOpen, configuration]);

  const generateSystemPrompt = () => {
    return `Je bent een ${configuration.role.name}. Je expertise ligt binnen ${configuration.branche.name}. De discussie zal gaan over "${configuration.topic.name}".

Jouw taak is om de gebruiker te begeleiden en te informeren binnen de grenzen van jouw rol, branche en het gekozen topic. Houd je strikt aan de afbakening van deze selecties. Geef GEEN antwoorden of informatie over onderwerpen die buiten deze specifieke context vallen. Als een vraag buiten je expertise valt, geef dan aan dat je daar geen antwoord op kunt geven binnen deze context.

De outputtaal dient ALTIJD Nederlands te zijn.
Je gedraagt je behulpzaam, professioneel en objectief. Houd de antwoorden relevant en to-the-point.

Aanvullende richtlijnen:
- Presenteer nooit gegenereerde, afgeleide, gespeculeerde of afgeleid content als feit.
- Als je iets niet kunt verifiëren, zeg dan: "Ik kan dit niet verifiëren." of "Ik heb geen toegang tot die informatie." of "Mijn kennisbank bevat dat niet."
- Label onverifieerde content aan het begin van een zin: [Inferentie] [Speculatie] [Onverifieerd]
- Vraag om verduidelijking als informatie ontbreekt. Gok niet en vul geen gaten op.
- Als een deel onverifieerd is, label dan de hele reactie.
- Parafraseer of interpreteer mijn input niet tenzij ik erom vraag.
- Voor beweringen over LLM-gedrag (inclusief jezelf), voeg toe: [Inferentie] of [Onverifieerd], met een notitie dat het gebaseerd is op waargenomen patronen.`;
  };

  const sendMessage = async (messageContent: string) => {
    if (!messageContent.trim() || isLoading || !apiKey) return;

    const userMessage: ExpertChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent.trim(),
      timestamp: new Date()
    };

    const newMessages = [...messages, userMessage, {
      id: (Date.now() + 1).toString(),
      role: 'expert',
      content: '',
      timestamp: new Date()
    }];

    setMessages(newMessages);
    setInputMessage('');
    setIsLoading(true);

    try {
      if (!chatInstanceRef.current) {
        // Gebruik de standaard API URL (apiEndpoint is geen geldige optie)
        const ai = new GoogleGenAI({ 
          apiKey
        });
        
        // Create expert system instruction based on configuration
        const systemInstruction = `Je bent een Nederlandse expert ${configuration.role.name} gespecialiseerd in ${configuration.topic.name} binnen de ${configuration.branche.name} sector. 

Je taak is om:
1. Professionele en gedetailleerde antwoorden te geven in het Nederlands
2. Specifieke inzichten te bieden vanuit je expertise in ${configuration.topic.name}
3. Praktische adviezen te geven die relevant zijn voor de ${configuration.branche.name} sector
4. De context van het transcript te gebruiken om gerichte analyses te maken
5. Concrete aanbevelingen te doen gebaseerd op best practices in je vakgebied

${transcript ? `Hier is het transcript waar de gebruiker vragen over heeft:\n\n---\n${transcript}\n---\n\nGebruik dit transcript als context voor je antwoorden.` : ''}


Antwoord altijd in het Nederlands en vanuit je rol als ${configuration.role.name} expert.`;

        chatInstanceRef.current = ai.chats.create({
          model: 'gemini-2.5-flash',
          history: messages.map(msg => ({ 
            role: msg.role === 'assistant' || msg.role === 'expert' ? 'model' : msg.role, 
            parts: [{ text: msg.content }] 
          })),
          config: { systemInstruction }
        });
      }

      const responseStream = await chatInstanceRef.current.sendMessageStream({ 
        message: messageContent.trim() 
      });

      let fullResponse = '';
      for await (const chunk of responseStream) {
        fullResponse += chunk.text;
        setMessages(prev => prev.map((msg, i) => 
          i === prev.length - 1 ? { ...msg, content: fullResponse } : msg
        ));
      }

      // Generate a follow-up question based on the chat content
      try {
        const ai = new GoogleGenAI({ 
          apiKey
        });
        const followUpChat = ai.chats.create({
          model: 'gemini-2.5-flash',
        });
        
        // Get the last few messages for context (up to 3)
        const recentMessages = messages.slice(-3).map(msg => {
          const roleLabel = msg.role === 'user' ? 'Gebruiker' : 'Expert';
          return `${roleLabel}: ${msg.content}`;
        }).join('\n\n');
        const lastResponse = fullResponse;
        
        const followUpResponse = await followUpChat.sendMessage({
          message: `Je bent een behulpzame assistent die een relevante vervolgvraag genereert op basis van een chatgesprek.

Hier is een recent chatgesprek tussen een gebruiker en een expert:

${recentMessages}

Laatste antwoord van de expert:
${lastResponse}

Genereer één specifieke vervolgvraag die de gebruiker zou kunnen stellen om dieper in te gaan op de inhoud van dit gesprek. De vraag moet direct gerelateerd zijn aan de besproken onderwerpen en de gebruiker helpen om meer inzicht te krijgen.

Geef alleen de vraag terug, zonder inleiding of uitleg.`
        });
        
        // Haal de tekst uit de response (text is een eigenschap, geen functie)
        const generatedQuestion = followUpResponse.text.trim();
        setSuggestedQuestion(generatedQuestion);
      } catch (error) {
        console.error('Error generating follow-up question:', error);
        setSuggestedQuestion('Wil je dieper ingaan op een specifiek aspect hiervan?');
      }

      // Track token usage
      if (updateTokensAndRefresh) {
        const promptTokens = tokenCounter.countPromptTokens(messageContent.trim());
        const responseTokens = tokenCounter.countResponseTokens(fullResponse);
        await updateTokensAndRefresh(promptTokens, responseTokens);
      }

    } catch (error: any) {
      console.error('Expert chat error:', error);
      const errorMessage = `Fout bij het genereren van antwoord: ${error.message || 'Onbekende fout'}`;
      setMessages(prev => prev.map((msg, i) => 
        i === prev.length - 1 ? { ...msg, content: errorMessage } : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = () => {
    sendMessage(inputMessage);
  };

  const handleSuggestedQuestion = () => {
    if (suggestedQuestion && !isLoading) {
      sendMessage(suggestedQuestion);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleAnalyze = () => {
    setShowAnalyzeConfirm(true);
  };

  const confirmAnalyze = () => {
    // Convert chat messages to transcript format for analysis
    const chatTranscript = messages
      .map(msg => {
        const roleLabel = msg.role === 'user' ? 'Gebruiker' : 'Expert';
        return `${roleLabel} (${msg.timestamp.toLocaleTimeString()}): ${msg.content}`;
      })
      .join('\n\n');
    
    // Pass the chat transcript to the analysis section
    onAnalyze(messages, chatTranscript);
    setShowAnalyzeConfirm(false);
    onClose();
  };

  const handleCancel = () => {
    // Reset chat instance when canceling
    chatInstanceRef.current = null;
    setMessages([]);
    setInputMessage('');
    setSuggestedQuestion('');
    onCancel();
    onClose();
  };

  // Reset chat instance when modal closes
  useEffect(() => {
    if (!isOpen) {
      chatInstanceRef.current = null;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[101]">
      <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-700 w-full h-full max-w-6xl max-h-[90vh] m-4 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
              {t('expertChatTitle') || 'Ask the Expert Chat'}
            </h3>
            <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400">
              <span><strong>Rol:</strong> {configuration.role.name}</span>
              <span><strong>Branche:</strong> {configuration.branche.name}</span>
              <span><strong>Topic:</strong> {configuration.topic.name}</span>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors"
          >
            <span aria-hidden>✖️</span>
          </button>
        </div>

        {/* Chat Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Messages Area */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <div className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-slate-200 dark:border-slate-700 p-4">
              <div className="flex space-x-2">
                <textarea
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={t('expertChatPlaceholder') || 'Typ je vraag hier...'}
                  className="flex-1 p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={2}
                  disabled={isLoading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  {t('send') || 'Verstuur'}
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar with Suggested Questions */}
          <div className="w-80 border-l border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-4">
            <h4 className="font-semibold text-slate-800 dark:text-slate-100 mb-3">
              {t('suggestedQuestions') || 'Vervolgvraag Suggestie'}
            </h4>
            {suggestedQuestion && (
              <div className="space-y-3">
                <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600">
                  <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                    {suggestedQuestion}
                  </p>
                  <button
                    onClick={handleSuggestedQuestion}
                    disabled={isLoading}
                    className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm rounded transition-colors"
                  >
                    {t('executeSuggestion') || 'Voer vervolgvraag uit'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="border-t border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-900">
          <div className="flex justify-between">
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              {t('chatCancel') || 'Chat Annuleren'}
            </button>
            <button
              onClick={handleAnalyze}
              disabled={messages.length <= 2 || messages.filter(m => m.role === 'user').length === 0 || messages.filter(m => m.role === 'expert').length <= 1}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              {t('toAnalysis') || 'Naar Analyse'}
            </button>
          </div>
        </div>

        {/* Analyze Confirmation Modal */}
        {showAnalyzeConfirm && (
          <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md mx-4">
              <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3">
                {t('confirmAnalysis') || 'Chat klaar, overgaan naar analyse?'}
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                {t('confirmAnalysisDesc') || 'De volledige chat wordt geanalyseerd en toegevoegd aan je RecapSmart analyse.'}
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowAnalyzeConfirm(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                >
                  {t('no') || 'Nee'}
                </button>
                <button
                  onClick={confirmAnalyze}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
                >
                  {t('yes') || 'Ja'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpertChatModal;