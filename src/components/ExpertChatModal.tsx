import React, { useState, useRef, useEffect } from 'react';
import { ExpertConfiguration, ExpertChatMessage } from '../../types';
import { GoogleGenAI, Chat } from '@google/genai';
import { tokenCounter } from '../tokenCounter';
import { SafeHtml } from '../utils/SafeHtml';
import modelManager from '../utils/modelManager';

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
  userId: string; // User ID for token validation
  userTier: string; // User tier for token validation
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
  updateTokensAndRefresh,
  userId,
  userTier
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
        content: t('expertInitialMessage', 'Hello! I am your {role} specialized in {branche}. I\'m ready to help you with questions about "{topic}". What would you like to discuss?')
          .replace('{role}', configuration.role.name)
          .replace('{branche}', configuration.branche.name)
          .replace('{topic}', configuration.topic.name),
        timestamp: new Date()
      };
      setMessages([initialMessage]);
      setSuggestedQuestion(t('expertInitialSuggestion', 'Can you tell me more about the key aspects of this topic?'));
    }
  }, [isOpen, configuration]);

  const generateSystemPrompt = () => {
    return t('expertSystemPromptTemplate', {
      role: configuration.role.name,
      branche: configuration.branche.name,
      topic: configuration.topic.name,
      verificationGuideline: t('expertVerificationGuideline')
    });
  };

  const sendMessage = async (messageContent: string) => {
    if (!messageContent.trim() || isLoading || !apiKey) return;

    // Import security utilities and token manager
    const { validateAndSanitizeForAI, rateLimiter } = await import('../utils/security');
    const { tokenManager } = await import('../utils/tokenManager');
    
    // Rate limiting check (max 20 expert chat messages per minute)
    const sessionId = 'expert_chat_' + Date.now().toString().slice(-6);
    if (!rateLimiter.isAllowed(sessionId, 20, 60000)) {
      console.error(t('expertChatRateLimitExceeded'));
      return;
    }
    
    // Validate and sanitize the message content
    const validation = validateAndSanitizeForAI(messageContent, 10000); // 10KB limit for chat messages
    if (!validation.isValid) {
      console.error(t('expertChatInvalidMessage'), validation.error);
      return;
    }
    
    const sanitizedContent = validation.sanitized;
    
    // Validate token usage for chat message
    const tokenEstimate = tokenManager.estimateTokens(sanitizedContent, 2);
    const tokenValidation = await tokenManager.validateTokenUsage(userId, userTier, tokenEstimate.totalTokens);
    
    if (!tokenValidation.allowed) {
      console.error(t('expertChatTokenValidationFailed'), tokenValidation.reason);
      return;
    }

    const userMessage: ExpertChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: sanitizedContent,
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
        const transcriptContext = transcript ? 
          t('expertTranscriptContext', 'Here is the transcript the user has questions about:\n\n---\n{transcript}\n---\n\nUse this transcript as context for your answers.')
            .replace('{transcript}', transcript) : '';
        
        const systemInstruction = t('expertSystemInstruction', 'You are an expert {role} specialized in {topic} within the {branche} sector.\n\nYour task is to:\n1. Provide professional and detailed answers in English\n2. Offer specific insights from your expertise in {topic}\n3. Give practical advice relevant to the {branche} sector\n4. Use the transcript context to make targeted analyses\n5. Make concrete recommendations based on best practices in your field\n\n{transcriptContext}\n\nAlways respond in English and from your role as a {role} expert.')
          .replace('{role}', configuration.role.name)
          .replace('{topic}', configuration.topic.name)
          .replace('{branche}', configuration.branche.name)
          .replace('{transcriptContext}', transcriptContext);

        const modelName = await modelManager.getModelForUser(userId, userTier, 'expertChat');
        chatInstanceRef.current = ai.chats.create({
          model: modelName,
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
        const modelName = await modelManager.getModelForUser(userId, userTier, 'expertChat');
        const followUpChat = ai.chats.create({
          model: modelName,
        });
        
        // Get the last few messages for context (up to 3)
        const recentMessages = messages.slice(-3).map(msg => {
          const roleLabel = msg.role === 'user' ? 'Gebruiker' : 'Expert';
          return `${roleLabel}: ${msg.content}`;
        }).join('\n\n');
        const lastResponse = fullResponse;
        
        const followUpPrompt = t('expertFollowUpPrompt', 'You are a helpful assistant that generates relevant follow-up questions based on a chat conversation.\n\nHere is a recent chat conversation between a user and an expert:\n\n{recentMessages}\n\nLatest response from the expert:\n{lastResponse}\n\nGenerate one specific follow-up question that the user could ask to delve deeper into the content of this conversation. The question should be directly related to the discussed topics and help the user gain more insight.\n\nReturn only the question, without introduction or explanation.')
          .replace('{recentMessages}', recentMessages)
          .replace('{lastResponse}', lastResponse);
        
        const followUpResponse = await followUpChat.sendMessage({
          message: followUpPrompt
        });
        
        // Haal de tekst uit de response (text is een eigenschap, geen functie)
        const generatedQuestion = followUpResponse.text.trim();
        setSuggestedQuestion(generatedQuestion);
      } catch (error) {
        console.error(t('expertChatFollowUpError'), error);
        setSuggestedQuestion(t('deeperAspectQuestion'));
      }

      // Track token usage
      const promptTokens = tokenCounter.countPromptTokens(messageContent.trim());
      const responseTokens = tokenCounter.countResponseTokens(fullResponse);
      
      // Record token usage with user context
      try {
        await tokenManager.recordTokenUsage(userId, promptTokens, responseTokens);
      } catch (error) {
        console.error(t('expertChatTokenRecordingError'), error);
      }
      
      // Also call the callback if provided for backward compatibility
      if (updateTokensAndRefresh) {
        await updateTokensAndRefresh(promptTokens, responseTokens);
      }

    } catch (error: any) {
      console.error(t('expertChatError'), error);
      const errorMessage = `${t('errorGeneratingAnswer')}: ${error.message || t('unknownError')}`;
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
        const roleLabel = msg.role === 'user' ? t('expertChatUser', 'User') : t('expertChatExpert', 'Expert');
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
            <h3 className="text-xl font-medium text-slate-800 dark:text-slate-100 mb-2 tracking-tight">
              {t('expertChatTitle', 'Ask the Expert Chat')}
            </h3>
            <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400">
              <span><strong>{t('role')}:</strong> {configuration.role.name}</span>
              <span><strong>{t('industry')}:</strong> {configuration.branche.name}</span>
              <span><strong>{t('topic')}:</strong> {configuration.topic.name}</span>
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
                    <SafeHtml 
                      content={message.content} 
                      className="whitespace-pre-wrap" 
                      allowBasicFormatting={true}
                      maxLength={10000}
                    />
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
                  placeholder={t('expertChatPlaceholder', 'Typ je vraag hier...')}
                  className="flex-1 p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={2}
                  disabled={isLoading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  {t('send')}
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar with Suggested Questions */}
          <div className="w-80 border-l border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-4">
            <h4 className="font-medium text-slate-800 dark:text-slate-100 mb-3">
              {t('suggestedQuestions', 'Vervolgvraag Suggestie')}
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
                    {t('executeSuggestion', 'Voer vervolgvraag uit')}
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
              {t('chatCancel', 'Chat Annuleren')}
            </button>
            <button
              onClick={handleAnalyze}
              disabled={messages.length <= 2 || messages.filter(m => m.role === 'user').length === 0 || messages.filter(m => m.role === 'expert').length <= 1}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              {t('toAnalysis', 'Naar Analyse')}
            </button>
          </div>
        </div>

        {/* Analyze Confirmation Modal */}
        {showAnalyzeConfirm && (
          <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md mx-4">
              <h4 className="text-lg font-medium text-slate-800 dark:text-slate-100 mb-3">
                {t('confirmAnalysis', 'Chat klaar, overgaan naar analyse?')}
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                {t('confirmAnalysisDesc', 'De volledige chat wordt geanalyseerd en toegevoegd aan je RecapHorizon analyse.')}
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowAnalyzeConfirm(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                >
                  {t('no', 'Nee')}
                </button>
                <button
                  onClick={confirmAnalyze}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
                >
                  {t('yes', 'Ja')}
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