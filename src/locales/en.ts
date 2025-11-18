export const en = {
  yes: "Yes",
  no: "No",
  confirmAnalysis: "Chat ready, proceed to analysis?",
  confirmAnalysisDesc: "The complete chat will be analyzed and added to your RecapHorizon analysis.",
  pwaInstallIosTitle: "Install RecapHorizon on iOS",
  pwaInstallIosStep1: "1. Tap the share icon",
  pwaInstallIosStep2: "2. Scroll down and tap 'Add to Home Screen'",
  pwaInstallIosStep3: "3. Tap 'Add' to confirm",
  pwaInstallIosShareIcon: "📤",
  cookieTitle: "Cookies for Analytics",
  cookiePoint1: "Essential cookies only",
  cookiePoint2: "No tracking of personal data",
  cookiePoint3: "Helps us improve the app",
  accept: "Accept",
  decline: "Decline",
  sessionLang: "Select source language",
  outputLanguage: "Select output language",
  dutch: "Nederlands",
  english: "English",
  portuguese: "Português",
  german: "Deutsch",
  french: "Français",
  spanish: "Spanish",
  startRecording: "Start audio recording",
  uploadTranscript: "Upload Transcript/File/Text",
  pasteTranscript: "Copy Transcript/File/Text (Paste)",
  pasteHelp: "Paste Help",
  waitingPermission: "Waiting for screen recording permission...",
  pause: "Pause",
  stop: "Stop",
  resume: "Resume",
  recordingStopped: "Recording stopped. Ready to transcribe.",
  transcribeSession: "Transcribe Session",
  transcribing: "Transcribing...",
  uploadingToTranscriptionServer: "Uploading audio to transcription server...",
  transcriptionCancelled: "Transcription cancelled by user.",
  transcriptionStopped: "Transcription stopped after too many errors.",
  tooManyConsecutiveErrors: "Too many consecutive errors.",
  transcriptionCompletedWithWarnings: "Transcription completed with warnings.",
  transcriptionCompleted: "Transcription completed.",

  // PowerPoint analysis start card and modal
  sessionOptionAnalyzePowerPoint: "Analyze PowerPoint",
  sessionOptionAnalyzePowerPointDesc: "Upload or drag‑and‑drop your PowerPoint and convert to plain text",
  pptxUploadDragText: "Drag your PowerPoint here or click",
  pptxSelectFile: "Select PowerPoint",
  pptxHelpTitle: "PowerPoint Help",
  pptxHelpDescription: "Analyze PowerPoint (.pptx) files by extracting slide text and speaker notes. Optionally enable OCR for images.",
  pptxHelpStep1: "Click ‘Select PowerPoint’ or drag a .pptx file into the card",
  pptxHelpStep2: "Choose what to extract: slide text, speaker notes, and optionally OCR",
  pptxHelpStep3: "Click ‘Analyze PowerPoint’ to convert to plain text",
  pptxHelpStep4: "After extraction the text appears as a transcript for further AI analysis",
  pptxSupportedFormats: "Supported format: .pptx (Office Open XML)",
  pptxOptionSlidesTextLabel: "Slide text",
  pptxOptionNotesLabel: "Speaker notes",
  pptxOptionOCRLabel: "Image OCR",
  errorPptxReadFailed: "Failed to read PPTX.",
  errorPptxProcessingFailed: "PPTX processing failed: {message}",
  noTextFoundInPptx: "No text found in the PowerPoint.",
  pptxUnsupported: "This option is only available for Gold, Diamond and Enterprise.",
  pptxModalTitle: "Analyze PowerPoint",
  pptxModalDescription: "Upload or drag a .pptx; choose options; convert to plain text for analysis",
  // Excel analysis
  sessionOptionAnalyzeExcel: "Analyze Excel",
  sessionOptionAnalyzeExcelDesc: "Upload or drag‑and‑drop your Excel and convert to plain text",
  xlsxUploadDragText: "Drag your Excel here or click",
  xlsxSupportedFormats: ".xlsx (Excel)",
  xlsxOptionSheetsLabel: "Sheet text",
  xlsxUnsupported: "This option is only available for Gold, Diamond and Enterprise.",
  xlsxModalTitle: "Analyze Excel",
  xlsxModalDescription: "Upload or drag a .xlsx; convert to plain text for analysis",
  errorXlsxReadFailed: "Failed to read Excel.",
  errorXlsxProcessingFailed: "Excel processing failed: {message}",
  noTextFoundInXlsx: "No text found in the Excel file.",
  xlsxHelpTitle: "Excel Help",
  xlsxHelpDescription: "Analyze Excel (.xlsx) files by extracting sheet text and converting to plain text for further AI analysis.",
  xlsxHelpStep1: "Click ‘Select Excel’ or drag a .xlsx file into the card",
  xlsxHelpStep2: "Choose what to extract: sheet text",
  xlsxHelpStep3: "Click ‘Analyze Excel’ to convert to plain text",
  xlsxHelpStep4: "After extraction the text appears as a transcript for further AI analysis",
  
  // Audio Upload Modal
  audioUploadTitle: "Upload Audio File",
  audioUploadDescription: "Drag your audio file here or click to select an MP3/MP4/WebM/WAV file for transcription",
  audioUploadDragText: "Drag audio file here or click",
  audioUploadSelectFile: "Select Audio File",
  audioUploadHelpTitle: "Audio Upload Help",
  audioUploadHelpDescription: "Learn how to upload audio files:",
  audioUploadHelpStep1: "Select an MP3, MP4, WebM or WAV audio file from your computer",
  audioUploadHelpStep2: "Drag the file to the upload zone or click to select",
  audioUploadHelpStep3: "The file will be automatically validated and uploaded",
  audioUploadHelpStep4: "After upload, transcription starts automatically",
  
  // Progress and Status Messages
  audioUploadProcessing: "Audio file is being processed...",
  audioUploadConverting: "Audio file is being converted...",
  audioUploadReady: "Ready for transcription...",
  audioUploadTranscribing: "Audio is being transcribed...",
  transcriptionUploading: "Uploading audio to transcription server...",
  transcriptionQueued: "Audio queued for transcription...",
  transcriptionProcessing: "Audio is being transcribed... This may take several minutes.",
  transcriptionProgress: "Transcription progress: {percentage}%",
  transcriptionStatusChecking: "Checking status...",
  transcriptionAlmostDone: "Transcription almost complete...",
  
  // Error Messages
  audioUploadError: "Error uploading audio file",
  audioUploadInvalidFormat: "Only MP3, MP4, WebM and WAV files are allowed",
  audioUploadTooLarge: "Audio file is too large (maximum 100MB)",
  audioUploadFailed: "Upload failed. Please try again.",
  transcriptionTimeout: "Transcription is taking longer than expected. Please try again.",
  transcriptionServerError: "Server error during transcription. Please try again later.",
  
  // Success Messages
  audioUploadSuccess: "Audio file successfully uploaded",
  waitingForNextSegment: "Waiting {ms}ms for next segment...",
  startingTranscription: "Starting transcription of {count} segments...",
  segmentSkipped: "Segment {number} skipped due to server problems, continuing with next...",
  transcriptionFullyCompleted: "Transcription fully completed! All {count} segments successfully processed.",
  transcriptionSummary: "Transcription summary: {successful}/{total} segments successfully processed.",
  segmentsSkippedDueToServerProblems: "{count} segment(s) skipped due to server problems.",
  googleAiServiceOverloaded: "The Google AI service seems temporarily overloaded. Please try again in 10-15 minutes.",
  summarizing: "Summarizing...",
  processing: "Processing...",
  appTitle: "RecapHorizon",
  // Referral registration modal UI strings
  chooseLanguage: "Choose language",
  chooseLanguagePlaceholder: "Select UI language",
  enterEmail: "Enter your email address",
  enterPassword: "Enter your password",
  confirmPasswordPlaceholder: "Confirm your password",
  passwordStrength: "Password strength",
  referralWelcomeMessagePersonalized: "You were invited by {referrer} to try RecapHorizon. You're creating a free account and will get access to the Free tier. We're excited to have you!",
  referralWelcomeMessage: "We're excited you joined via a referral. You're creating a free account and will get access to the Free tier.",
  referralWelcomeGetStarted: "Create your free account to get started right away.",
  referralCodeUsed: "Referral code used",
  createAccount: "Create account",
  pwaInstallBannerText: "Install RecapHorizon as an app for quick access from your taskbar.",
  pwaIgnore: "Ignore",
  pwaInstall: "Install",
  pwaAlreadyInstalled: "RecapHorizon is already installed as an app on your device.",
  pwaInstalledStatus: "Installed",
  pwaNotAvailable: "Installation not available",

  reset: "Reset",
  startNewSession: "Start New Session",
  errorRecording: "Error starting recording",
  permissionDenied: "Permission for screen and/or microphone recording was denied. To record, you must reload the page and grant permission when prompted. If you don't see a prompt, check your browser's site settings to unblock permission.",
  noDevices: "No suitable recording devices (screen, microphone) found. Ensure they are connected and enabled.",
  unknownError: "An unknown error has occurred.",
  anonymizing: "Anonymizing transcript...",
  anonymizationComplete: "Anonymization complete.",
  termsReplaced: "{count} terms replaced.",
  nothingToReplace: "No terms found to replace.",
  anonymizeSuccess: "Anonymization complete. Replaced {report}.",
  anonymizeNothing: "Anonymization complete. No terms found to replace.",
  selectLangFirst: "Please select a language before starting to record.",
  noAudioToTranscribe: "No audio recorded to transcribe.",
  apiKeyMissing: "API_KEY is missing.",
  aiError: "AI processing failed",
  transcriptEmpty: "The transcript is empty, so no analysis can be generated.",

  // AI Provider error messages (centralized)
  "aiErrors.gemini.serverOverloaded": "Google Gemini servers are currently overloaded. The system will automatically try alternative models. Please try again in {minutes} if the issue persists.",
  "aiErrors.gemini.dailyQuotaLimit": "You've reached the daily quota of 50 requests for Google Gemini. Please try again in {minutes}, or upgrade to a paid plan for more requests.",
  "aiErrors.gemini.rateLimit": "Google Gemini rate limit reached. Please try again in {minutes}.",
  "aiErrors.gemini.contentFiltered": "Your content was blocked by Google Gemini's safety policies. Adjust your input and try again.",
  "aiErrors.generic.serverOverloaded": "{provider} servers are currently overloaded. Please try again in {minutes}.",
  "aiErrors.generic.rateLimit": "Rate limit reached for {provider}. Please try again in {minutes}.",
  "aiErrors.generic.apiKeyInvalid": "API key for {provider} is invalid or missing. Check your configuration and try again.",
  "aiErrors.generic.modelUnavailable": "The selected AI model is temporarily unavailable. Please try again later or choose a different model.",
  "aiErrors.generic.networkError": "Network error while communicating with {provider}. Check your internet connection and try again.",
  "aiErrors.generic.contentFiltered": "Your content was blocked by {provider}'s safety policies. Adjust your input and try again.",
  "aiErrors.generic.unknown": "An unexpected error occurred with {provider}. Please try again later.",
  
  // Firestore error messages
  firestoreConnectionError: "Cannot connect to Firestore",
  firestoreReadPermissionsError: "No read permissions for Firestore",
  firestoreWritePermissionsError: "No write permissions for Firestore",
  firestoreIndexError: "Firestore indexes not working correctly",
  firestorePermissionDenied: "No access to the database. Please log in again.",
  firestoreDatabaseUnavailable: "Database temporarily unavailable. Please try again in a few minutes.",
  firestoreConfigurationError: "Database configuration problem. Please contact support.",
  firestoreQuotaExceeded: "Database quota exceeded. Please try again later.",
  firestoreConnectionInterrupted: "Connection interrupted. Check your internet connection.",
  firestoreNetworkError: "Network problem. Check your internet connection.",
  firestoreGenericError: "There is a problem with the database connection",
  generating: "Generating {type}...",
  generationFailed: "AI {type} generation failed",
  transcript: "Transcript",
  sessionExpired: "Your session has expired. Please log in again.",
  sessionExtended: "Session extended successfully.",
  transcriptAnonymized: "Transcript (A)",
  summary: "Summary",
  faq: "FAQ",
  keyLearnings: "Key Learnings",
  followUp: "Follow-up",
  chat: "Chat",

  anonymize: "Anonymize",

  exportPPT: "Powerpoint",
  copyContent: "Copy content",
  noContent: "No content generated yet.",
  congratulations: "Congratulations!",
  paymentSuccessful: "Payment Successful!",
  unlimitedAiAnalyses: "Unlimited AI analyses",
  advancedSummaries: "Advanced summaries",
  thankYouTrust: "Thank you for your trust!",
  chatWithTranscript: "Chat with Transcript",
  specials: "RecapHorizon Special prompts",
  specialsSubtitle: "Prompts are in English; the result will be in your chosen output language.",
  ideaBuilderReportPreview: "Idee Bouwer plan",
  // Specials tab labels
  "specials.selectTopicFor": "Select your topic for: {title}",
  "specials.promptLabel": "Prompt",
  "specials.topicLabel": "Topic",
  // Specials: new keys
  "specials.searchPlaceholder": "Search prompts...",
  "specials.searchHint": "Type at least 2 characters to search",
  "specials.resultsCount": "Results",
  "specials.loadingError": "Error loading specials",
  "specials.noTopicsFound": "No topics found in the transcript",
  "specials.topicsGenerationError": "Error generating topics",
  "specials.resultGenerationError": "Error generating result",
  "specials.topicRequired": "{topic required}",
  "specials.resultHeading": "Result",
  "specials.autoGeneratingResult": "Result will be generated automatically...",
  "specials.generatingResult": "Generating result...",
  readAnswers: "Read answers aloud",
  mindmap: "Mindmap",
  askAQuestion: "Ask a question about the transcript...",
  generatingPresentation: "Generating presentation...",
  generatingImageForSlide: "Generating image for slide: \"{title}\"...",
  finalizingPresentation: "Finalizing presentation...",
  presentationFailed: "Failed to generate presentation",
  speechRecognitionUnsupported: "Speech recognition is not supported in this browser.",


  fileReadFailed: "Failed to read file",
  selectLangToUpload: "Please select a language before uploading a transcript.",
  keywordAnalysis: "Keyword Analysis",
  sentiment: "Sentiment",
  showSentiment: "Show Sentiment",
  hideSentiment: "Hide Sentiment",
  analyzingSentiment: "Analyzing sentiment...",
  blog: "Blog",
  startOrUpload: "Start Session",
  notionOption: "Notion Page",
  notionOptionDesc: "Analyse your Notion page(s).",
  notionSearchHelp: "Search your Notion workspace securely via our server-side integration. Your Notion secret is never exposed to the browser.",
  notionWorkspace: "Notion Workspace",
  notConnected: "Not connected",
  connectNotion: "Connect Notion",
  disconnect: "Disconnect",
  connectNotionHelp: "Connect your Notion account securely. We never expose your token to the browser; it is stored encrypted in an HttpOnly cookie.",
  notionIntegrationInstall: "Install Notion integration",
  notionIntegrationHelpTitle: "Install Notion Integration",
  notionIntegrationStepTitle: "Installation Steps",
  notionIntegrationStepDesc: "Follow these steps to set up Notion integration:",
  notionIntegrationStep1: "Go to your Notion workspace and navigate to Settings & Members",
  notionIntegrationStep2: "Click on 'Connections' then 'Develop or manage integrations'",
  notionIntegrationStep3: "Create a new integration and copy the Internal Integration Token",
  notionIntegrationStep4: "Share the desired pages with your integration using the Share button",
  notionIntegrationStep5: "Paste the token in RecapHorizon and start importing",
  notionIntegrationDataTitle: "What data is used?",
  notionIntegrationDataDesc: "RecapHorizon has access to:",
  notionIntegrationDataItem1: "Page titles and content from shared pages",
  notionIntegrationDataItem2: "Database properties and records (if shared)",
  notionIntegrationDataItem3: "Only pages explicitly shared with the integration",
  notionIntegrationDataItem4: "No access to private pages or other workspaces",
  notionIntegrationTechTitle: "Technical details",
  notionIntegrationTechDesc: "How the integration works:",
  notionIntegrationTechItem1: "Secure connection via Notion's official API",
  notionIntegrationTechItem2: "Token is encrypted and stored in HttpOnly cookies",
  notionIntegrationTechItem3: "Read-only access to shared content",
  notionIntegrationTechItem4: "No permanent storage of Notion data on our servers",
  notionIntegrationSecurityTitle: "Security & Privacy",
  notionIntegrationSecurityDesc: "Your Notion data stays secure because we only access explicitly shared pages and your token is stored encrypted.",
  connected: "Connected",
  noResults: "No results yet. Try a search.",
  pageLoaded: "Page Loaded Successfully!",
  selectedPage: "Selected Page:",
  // Generic navigation/pagination labels
  prev: "Prev",
  next: "Next",
  page: "Page",
  of: "of",
  back: "Back",
  generateTopics: "Generate topics",
  pageReadyNextPhase: "The page content is now ready for the next phase of processing.",
  analyse: "Analyse",
  step1: "Step 1",
  step2: "Step 2",
  step3: "Step 3",
  presentationSuccess: "Successfully created presentation '{fileName}' with {slideCount} slides. Saved to your Downloads folder.",

  // Tab navigation
  summaryTab: "Summary",
  executiveSummaryTab: "Executive Summary",
  keywordsTab: "Keywords",

  // RecapHorizonPanel
  itemsAppearHere: "Items appear here once content is loaded from the tabs.",
  exportToPdf: "Export to PDF",
  exportToText: "Export to Text",
  copyForEmail: "Copy for Email",
  
  // Admin: Prompts import temporary UI
  promptsButton: "Prompts",
  promptsImportTitle: "Prompts Import",
  promptsPasteJson: "Paste a JSON array of prompts below. On import, items will be stored in the 'prompts' collection.",
  promptsTextareaPlaceholder: "[ {\n  \"title\": \"...\",\n  \"prompt_text\": \"...\",\n  \"requires_topic\": true,\n  \"is_active\": true,\n  \"created_at\": \"2025-11-03T21:00:00Z\",\n  \"updated_at\": \"2025-11-03T21:00:00Z\"\n}, { ... } ]",
  promptsValidate: "Validate",
  promptsImport: "Import",
  promptsImporting: "Importing...",
  promptsEmptyInput: "Input is empty",
  promptsMustBeArray: "JSON must be an array of prompt objects",
  promptsInvalidJson: "Invalid JSON",
  promptsNothingToImport: "Nothing to import",
  promptsImportSuccess: "Imported prompts successfully",
  promptsImportFailed: "Import failed",
  promptsItemsReady: "Validated {count} item(s), ready to import",
  close: "Close",

  // Mobile Audio Help
  androidLabel: "🤖 Android:",
  extraTip: "Extra tip:",

  // Pricing Page
  choosePerfectPlan: "Choose the perfect plan for your AI transcription needs",

  // Disclaimer Modal
  aiIntelligence: "AI Intelligence",
  aiIntelligenceDesc: "The app integrates with AI services. The quality and availability of these services depend on the AI provider's terms and may vary. We have no control over the underlying AI models or their output.",
  important: "Important:",

  // Token Usage Meter
  loading: "Loading...",
  error: "Error",

  // Expert Chat Modal
  branche: "Industry:",
  topic: "Topic:",


  downloadScript: "Download script",
  play: "Play",

  inhoudsopgave: "Table of Contents",
  taak: "Task",
  eigenaar: "Owner",
  deadline: "Deadline",
  sentimentSummary: "Sentiment Summary",
  sentimentConclusion: "Overall Conclusion",
  sentimentOverall: "Overall Sentiment Analysis",
  keywordExplanation: "Explanation for '{keyword}'",
  
  // Login form errors
  
  // Email placeholders and labels

  passwordPlaceholder: "••••••••",
  
  // PowerPoint options
  internalTeamMembers: "Internal team members",
  informAndProvideUpdates: "Inform and provide updates",
  informativeAndNeutral: "Informative and neutral",
  
  // Email content messages
  contentTruncatedLength: "[Content was truncated due to length limitations. Please copy the full content from the application.]",
  emailContentTooLong: "Email content too long for mailto link. Content copied to clipboard instead.",
  emailContentTruncated: "Email content was truncated due to length. Full content copied to clipboard.",
  couldNotOpenEmail: "Could not open email client. Content copied to clipboard instead.",
  
  // Quiz and generation messages
  generatingQuiz: "Generating quiz...",

  notEnoughCredits: "Unfortunately, you don't have enough credits to perform this function. Click here to upgrade to a higher subscription.",

  
  // Business case categories
  costSavings: "Cost savings",
  revenueGrowth: "Revenue growth",
  innovation: "Innovation",
  riskReduction: "Risk reduction",
  customerSatisfaction: "Customer satisfaction",
  scalability: "Scalability",
  businessCaseGenerated: "Business case generated!",
  businessCaseTypeLabel: "Business Case Type",
  costSavingsDescription: "How the solution makes processes more efficient and reduces costs.",
  revenueGrowthDescription: "How the solution opens new markets or increases sales.",
  innovationDescription: "How the solution helps to stay ahead in the market.",
  riskReductionDescription: "How the solution increases compliance, security or reliability.",
  customerSatisfactionDescription: "How the solution improves the experience of customers or employees.",
  scalabilityDescription: "How the solution can grow with the organization.",
  
  // Business Case UI
  businessCaseTargetAudienceLabel: "Target Audience / Stakeholders",
  businessCaseTargetAudienceQuestion: "Which audience or stakeholders do you want to persuade? (Choose or enter)",
  businessCaseTargetAudiencePlaceholder: "Or enter your own (e.g., Project Sponsors, Advisory Board)",
  businessCaseTargetAudienceOptions: {
    boardOfDirectors: "Board of Directors",
    investors: "Investors",
    teamLeaders: "Team Leaders",
    colleagues: "Colleagues",
    none: "None"
  },
  businessCaseLength: "Business case length",
  businessCaseLengthOptions: {
    concise: "Concise",
    extensive: "Extensive",
    very_extensive: "Very extensive"
  },
  businessCaseLengthGuidance: {
    concise: "BE STRICT: Write a concise business case of 300-450 words. Do not exceed.",
    extensive: "BE STRICT: Write an extensive business case of 700-1000 words.",
    very_extensive: "BE STRICT: Write a very extensive business case of 1200-1600 words."
  },
  businessCaseStrictHint: "Be strict: AI must follow this length.",

  // Business Case Types
  businessCaseTypes: {
    employeeProductivityEngagement: {
      name: "Employee Productivity & Engagement",
      description: "Improve employee efficiency, satisfaction, and retention through tools, processes, or HR initiatives."
    },
    sustainabilityCsr: {
      name: "Sustainability & CSR",
      description: "Reduce environmental impact, improve corporate social responsibility, and meet sustainability goals."
    },
    marketExpansion: {
      name: "Market Expansion",
      description: "Enter new geographic markets, demographic segments, or distribution channels to increase reach."
    },
    brandReputation: {
      name: "Brand & Reputation",
      description: "Strengthen brand position, market perception, and corporate reputation among stakeholders."
    },
    dataAnalytics: {
      name: "Data Analytics",
      description: "Improve decision-making capabilities through better analytics tools, business intelligence, and data management."
    },
    mobileDigital: {
      name: "Mobile & Digital",
      description: "Develop mobile apps, digital experiences, or omnichannel capabilities to improve customer engagement."
    },
    cloudMigration: {
      name: "Cloud Migration",
      description: "Migrate infrastructure, applications, or services to cloud solutions for improved scalability and cost reduction."
    },
    cybersecurity: {
      name: "Cybersecurity",
      description: "Strengthen security defenses, protect against cyber threats, and improve overall security posture."
    },
    automation: {
      name: "Automation",
      description: "Automate manual processes, repetitive workflows, or administrative tasks to improve efficiency."
    },
    collaboration: {
      name: "Collaboration",
      description: "Improve team collaboration tools and processes for better communication and coordination."
    },
    knowledgeManagement: {
      name: "Knowledge Management",
      description: "Capture, organize, and share institutional knowledge to improve decision-making and productivity."
    },
    qualityAssurance: {
      name: "Quality Assurance",
      description: "Improve quality control processes, reduce defects, and enhance product/service consistency."
    },
    regulatoryCompliance: {
      name: "Regulatory Compliance",
      description: "Ensure compliance with regulatory requirements, industry standards, and legal obligations."
    },
    disasterRecovery: {
      name: "Disaster Recovery",
      description: "Improve disaster preparedness, recovery, and business continuity to minimize downtime."
    },
    performanceOptimization: {
      name: "Performance Optimization",
      description: "Optimize system performance, response times, and overall operational efficiency."
    },
    userExperience: {
      name: "User Experience",
      description: "Improve usability, interface design, and overall user satisfaction for products/services."
    },
    vendorManagement: {
      name: "Vendor Management",
      description: "Optimize supplier relationships, procurement processes, and supply chain management."
    },
    financialPlanning: {
      name: "Financial Planning",
      description: "Improve financial planning processes, budgeting, and analysis for better financial management."
    },
    inventoryManagement: {
      name: "Inventory Management",
      description: "Optimize inventory levels, reduce storage costs, and improve supply chain management."
    },
    supplyChain: {
      name: "Supply Chain",
      description: "Improve supply chain efficiency, reduce lead times, and optimize logistics."
    },
    predictiveMaintenance: {
      name: "Predictive Maintenance",
      description: "Implement predictive maintenance capabilities to reduce unplanned downtime."
    },
    energyEfficiency: {
      name: "Energy Efficiency",
      description: "Reduce energy consumption, utility costs, and carbon footprint through efficiency improvements."
    },
    wasteReduction: {
      name: "Waste Reduction",
      description: "Minimize material waste, improve recycling processes, and reduce disposal costs."
    },
    remoteWorkCapabilities: {
      name: "Remote Work Capabilities",
      description: "Improve remote work infrastructure and tools to support distributed team productivity."
    },
    trainingDevelopment: {
      name: "Training & Development",
      description: "Improve employee training programs, skill development, and professional development initiatives."
    },
    customerSupport: {
      name: "Customer Support",
      description: "Improve customer support capabilities, response times, and overall customer satisfaction."
    },
    salesEnablement: {
      name: "Sales Enablement",
      description: "Strengthen sales tools, processes, and resources to improve sales performance and productivity."
    },
    marketingEffectiveness: {
      name: "Marketing Effectiveness",
      description: "Improve marketing strategies, campaigns, and marketing ROI for better reach and engagement."
    },
    competitiveIntelligence: {
      name: "Competitive Intelligence",
      description: "Improve competitive intelligence capabilities, market analysis, and strategic positioning."
    },
    businessIntelligence: {
      name: "Business Intelligence",
      description: "Improve business intelligence capabilities, dashboards, and reporting features."
    },
    workflowOptimization: {
      name: "Workflow Optimization",
      description: "Optimize business workflows, operational processes, and procedures for better efficiency."
    },
    documentManagement: {
      name: "Document Management",
      description: "Improve document management systems, version control, and approval processes."
    },
    projectManagement: {
      name: "Project Management",
      description: "Improve project management tools and processes for better planning and execution."
    },
    businessProcessManagement: {
      name: "Business Process Management",
      description: "Optimize business processes, eliminate inefficiencies, and improve overall operational efficiency."
    },
    strategicPlanning: {
      name: "Strategic Planning",
      description: "Improve strategic planning processes, analysis, and executive-level decision-making."
    },
    innovationManagement: {
      name: "Innovation Management",
      description: "Improve innovation management capabilities, idea development processes, and innovation culture."
    },
    changeManagement: {
      name: "Change Management",
      description: "Improve change management capabilities, transition processes, and organizational support during changes."
    },
    stakeholderEngagement: {
      name: "Stakeholder Engagement",
      description: "Improve stakeholder engagement, communication, and management for stronger relationships."
    },
    governance: {
      name: "Governance",
      description: "Strengthen corporate governance processes, leadership structure, and decision-making."
    },
    riskManagement: {
      name: "Risk Management",
      description: "Improve risk management capabilities, risk assessment, and mitigation strategies."
    },
    auditCompliance: {
      name: "Audit & Compliance",
      description: "Improve audit processes, regulatory compliance, and audit readiness."
    },
    performanceManagement: {
      name: "Performance Management",
      description: "Improve performance management systems, metrics, and evaluation processes."
    },
    talentAcquisition: {
      name: "Talent Acquisition",
      description: "Improve recruitment processes, talent acquisition, and retention strategies."
    },
    successionPlanning: {
      name: "Succession Planning",
      description: "Improve succession planning processes, leadership development, and future leader preparation."
    },
    cultureDevelopment: {
      name: "Culture Development",
      description: "Improve organizational culture, corporate values, and employee engagement initiatives."
    },
    employeeWellbeing: {
      name: "Employee Wellbeing",
      description: "Improve employee wellbeing programs, health, and work-life balance."
    },
    internalCommunication: {
      name: "Internal Communication",
      description: "Improve internal communication strategies, communication channels, and organizational transparency."
    },
    externalCommunication: {
      name: "External Communication",
      description: "Improve external communication capabilities, public relations, and brand management."
    },
    publicRelations: {
      name: "Public Relations",
      description: "Improve public relations strategies, media management, and public perception."
    },
    crisisManagement: {
      name: "Crisis Management",
      description: "Improve crisis management capabilities, emergency preparedness, and communication during crises."
    },
    reputationManagement: {
      name: "Reputation Management",
      description: "Improve reputation management strategies, brand monitoring, and trust building."
    },
    thoughtLeadership: {
      name: "Thought Leadership",
      description: "Improve thought leadership capabilities, expert content, and industry positioning."
    },
    contentStrategy: {
      name: "Content Strategy",
      description: "Improve content strategies, content marketing, and valuable content creation."
    },
    socialMedia: {
      name: "Social Media",
      description: "Improve social media strategies, platform engagement, and digital presence."
    },
    digitalMarketing: {
      name: "Digital Marketing",
      description: "Improve digital marketing strategies, online campaigns, and omnichannel marketing efforts."
    },
    emailMarketing: {
      name: "Email Marketing",
      description: "Improve email marketing campaigns, automation, and email engagement strategies."
    },
    seoOptimization: {
      name: "SEO Optimization",
      description: "Improve search engine optimization capabilities, organic visibility, and website traffic."
    },
    customerRetention: {
      name: "Customer Retention",
      description: "Improve customer retention strategies, loyalty programs, and churn reduction."
    },
    customerExperience: {
      name: "Customer Experience",
      description: "Improve overall customer experience, satisfaction, and loyalty through improvements across all touchpoints."
    },
    voiceOfCustomer: {
      name: "Voice of Customer",
      description: "Improve voice of customer programs, feedback collection, and feedback-based improvement processes."
    },
    customerJourneyMapping: {
      name: "Customer Journey Mapping",
      description: "Improve customer journey mapping, touchpoint analysis, and experience optimization."
    },
    personalization: {
      name: "Personalization",
      description: "Improve personalization capabilities, targeted marketing, and personalized customer experiences."
    },
    subscriptionManagement: {
      name: "Subscription Management",
      description: "Improve subscription management processes, recurring billing, and subscription revenue models."
    },
    pricingOptimization: {
      name: "Pricing Optimization",
      description: "Improve pricing strategies, pricing models, and revenue optimization analysis."
    },
    contractManagement: {
      name: "Contract Management",
      description: "Improve contract management processes, contract tracking, and agreement compliance."
    },
    procurement: {
      name: "Procurement",
      description: "Improve procurement processes, supplier management, and purchasing strategies."
    },
    supplierDiversity: {
      name: "Supplier Diversity",
      description: "Improve supplier diversity programs, inclusive purchasing initiatives, and diverse supply chains."
    },
    logistics: {
      name: "Logistics",
      description: "Improve logistics operations, transportation optimization, and supply chain management."
    },
    warehouseManagement: {
      name: "Warehouse Management",
      description: "Improve warehouse management processes, inventory optimization, and warehouse operations."
    },
    transportation: {
      name: "Transportation",
      description: "Improve transportation strategies, route optimization, and fleet management."
    },
    fleetManagement: {
      name: "Fleet Management",
      description: "Improve fleet management capabilities, vehicle maintenance, and route optimization."
    },
    assetManagement: {
      name: "Asset Management",
      description: "Improve asset management processes, asset tracking, and asset utilization optimization."
    },
    resourcePlanning: {
      name: "Resource Planning",
      description: "Improve resource planning and allocation, capacity management, and utilization optimization."
    },
    capacityPlanning: {
      name: "Capacity Planning",
      description: "Improve capacity planning, demand analysis, and scaling strategies."
    },
    demandForecasting: {
      name: "Demand Forecasting",
      description: "Improve demand forecasting capabilities, trend analysis, and data-driven planning."
    },
    productionPlanning: {
      name: "Production Planning",
      description: "Improve production planning processes, scheduling, and manufacturing operations optimization."
    },
    qualityControl: {
      name: "Quality Control",
      description: "Improve quality control processes, quality testing, and quality assurance standards."
    },
    safetyManagement: {
      name: "Safety Management",
      description: "Improve safety management programs, safety protocols, and safety culture."
    },
    environmentalManagement: {
      name: "Environmental Management",
      description: "Improve environmental management programs, environmental compliance, and sustainability initiatives."
    },
    complianceManagement: {
      name: "Compliance Management",
      description: "Improve compliance management systems, regulatory tracking, and audit processes."
    },
    policyManagement: {
      name: "Policy Management",
      description: "Improve policy management processes, policy development, and policy compliance."
    },
    procedureOptimization: {
      name: "Procedure Optimization",
      description: "Improve business procedures, process documentation, and procedure standardization."
    },
    standardization: {
      name: "Standardization",
      description: "Improve standardization efforts, best practices, and process consistency."
    },
    continuousImprovement: {
      name: "Continuous Improvement",
      description: "Improve continuous improvement capabilities, process improvement methodologies, and optimization initiatives."
    },
    leanManagement: {
      name: "Lean Management",
      description: "Implement lean management principles, eliminate waste, and improve operational efficiency."
    },
    sixSigma: {
      name: "Six Sigma",
      description: "Implement Six Sigma methodologies, reduce variability, and improve process quality."
    },
    totalQualityManagement: {
      name: "Total Quality Management",
      description: "Improve total quality management systems, customer-focused approaches, and continuous improvement."
    },
    benchmarking: {
      name: "Benchmarking",
      description: "Improve benchmarking capabilities, comparative analysis, and best practice implementation."
    },
    bestPractices: {
      name: "Best Practices",
      description: "Improve best practice implementation, knowledge sharing, and cross-industry standardization."
    },
    knowledgeSharing: {
      name: "Knowledge Sharing",
      description: "Improve knowledge sharing initiatives, collaboration, and institutional knowledge transfer."
    },
    crossFunctionalCollaboration: {
      name: "Cross-functional Collaboration",
      description: "Improve cross-department collaboration, cross-functional teams, and teamwork processes."
    },
    communicationSkills: {
      name: "Communication Skills",
      description: "Improve communication capabilities, presentation skills, and interpersonal skills among employees."
    },
    leadershipDevelopment: {
      name: "Leadership Development",
      description: "Improve leadership development programs, leadership training, and future leader preparation."
    },
    teamBuilding: {
      name: "Team Building",
      description: "Improve team building activities, team dynamics, and team cohesion."
    },
    conflictResolution: {
      name: "Conflict Resolution",
      description: "Improve conflict resolution capabilities, mediation, and workplace dispute management."
    },
    negotiationSkills: {
      name: "Negotiation Skills",
      description: "Improve negotiation capabilities, negotiation techniques, and business negotiation outcomes."
    },
    decisionMaking: {
      name: "Decision Making",
      description: "Improve decision-making processes, analysis, and data-driven decision-making frameworks."
    },
    problemSolving: {
      name: "Problem Solving",
      description: "Improve problem-solving capabilities, critical thinking, and systematic approaches to resolving challenges."
    },
    creativityInnovation: {
      name: "Creativity & Innovation",
      description: "Improve creativity capabilities, innovative thinking, and idea generation within the organization."
    },
    adaptability: {
      name: "Adaptability",
      description: "Improve adaptability capabilities, flexibility, and responsiveness to change within the organization."
    },
    resilience: {
      name: "Resilience",
      description: "Improve organizational resilience, recovery capabilities, and ability to bounce back from setbacks."
    },
    agility: {
      name: "Agility",
      description: "Improve organizational agility, rapid response capabilities, and ability to adapt to changing conditions."
    },
    digitalLiteracy: {
      name: "Digital Literacy",
      description: "Improve digital literacy capabilities, technology skills, and digital competencies among employees."
    },
    technicalTraining: {
      name: "Technical Training",
      description: "Improve technical training programs, technical skill development, and specialized competencies."
    },
    professionalDevelopment: {
      name: "Professional Development",
      description: "Improve professional development opportunities, career planning, and professional advancement."
    },
    mentoring: {
      name: "Mentoring",
      description: "Improve mentoring programs, mentoring relationships, and knowledge transfer."
    },
    coaching: {
      name: "Coaching",
      description: "Improve coaching capabilities, coaching programs, and coaching skill development."
    },
    feedbackSystems: {
      name: "Feedback Systems",
      description: "Improve feedback systems, evaluation processes, and continuous feedback mechanisms."
    },
    recognitionPrograms: {
      name: "Recognition Programs",
      description: "Improve employee recognition programs, appreciation initiatives, and reward systems."
    },
    performanceReviews: {
      name: "Performance Reviews",
      description: "Improve performance review processes, performance evaluations, and assessment systems."
    },
    goalSetting: {
      name: "Goal Setting",
      description: "Improve goal setting processes, objective alignment, and progress tracking."
    },
    successionReadiness: {
      name: "Succession Readiness",
      description: "Improve succession readiness, leadership development, and future leader preparation."
    },
    talentManagement: {
      name: "Talent Management",
      description: "Improve talent management strategies, talent development processes, and key employee retention."
    },
    workforcePlanning: {
      name: "Workforce Planning",
      description: "Improve workforce planning, staffing needs analysis, and personnel allocation strategies."
    },
    organizationalDesign: {
      name: "Organizational Design",
      description: "Improve organizational design, organizational structure, and decision-making processes."
    },
    culturalTransformation: {
      name: "Cultural Transformation",
      description: "Improve cultural transformation initiatives, organizational culture changes, and values development."
    },
    employeeEngagement: {
      name: "Employee Engagement",
      description: "Improve employee engagement, job satisfaction, and motivation levels."
    },
    retentionStrategies: {
      name: "Retention Strategies",
      description: "Improve employee retention strategies, turnover reduction, and employee loyalty."
    },
    recruitmentOptimization: {
      name: "Recruitment Optimization",
      description: "Improve recruitment processes, talent acquisition, and hiring experience."
    },
    onboardingExcellence: {
      name: "Onboarding Excellence",
      description: "Improve onboarding processes, new employee experiences, and time-to-productivity."
    },
    offboarding: {
      name: "Offboarding",
      description: "Improve offboarding processes, exit transitions, and knowledge management during departures."
    },
    exitInterviews: {
      name: "Exit Interviews",
      description: "Improve exit interview processes, feedback collection, and departure reason analysis."
    },
    alumniRelations: {
      name: "Alumni Relations",
      description: "Improve alumni relations programs, former employee networks, and return opportunities."
    },
    qualityImprovement: {
      name: "Quality Improvement",
      description: "Improve quality improvement processes, quality control, and excellence standards."
    },
    dataInsights: {
      name: "Data Insights",
      description: "Improve data analysis capabilities, business insights, and data-driven decision making."
    },
    marketShareIncrease: {
      name: "Market Share Increase",
      description: "Improve strategies to increase market share, market expansion, and market penetration."
    },
    brandReputationImage: {
      name: "Brand Reputation & Image",
      description: "Improve brand reputation, corporate image, and market perception."
    },
    complianceRegulation: {
      name: "Compliance & Regulation",
      description: "Improve regulatory compliance, adherence to regulations, and compliance standards."
    },
    flexibilityAgility: {
      name: "Flexibility & Agility",
      description: "Improve organizational flexibility, adaptability, and business agility."
    },
    channelExpansion: {
      name: "Channel Expansion",
      description: "Improve distribution channel expansion, channel strategies, and partner development."
    },
    timeSavings: {
      name: "Time Savings",
      description: "Improve time savings processes, time efficiency, and cycle time reduction."
    },
    resourceOptimization: {
      name: "Resource Optimization",
      description: "Improve resource optimization, efficient resource allocation, and resource management."
    },
    productDifferentiation: {
      name: "Product Differentiation",
      description: "Improve product differentiation, competitive advantages, and unique market positioning."
    },
    operationalEfficiency: {
      name: "Operational Efficiency",
      description: "Improve operational efficiency, process optimization, and operational excellence."
    },
    securityDataProtection: {
      name: "Security & Data Protection",
      description: "Improve data security, information protection, and cybersecurity measures."
    },
    innovationCulture: {
      name: "Innovation Culture",
      description: "Improve innovation culture, innovative thinking, and creative idea development."
    },
    supplierRelationships: {
      name: "Supplier Relationships",
      description: "Improve supplier relationships, vendor management, and partner collaboration."
    },
    fasterTimeToMarket: {
      name: "Faster Time to Market",
      description: "Improve time to market, product acceleration, and commercialization speed."
    },
    customerSegmentationPrecision: {
      name: "Customer Segmentation",
      description: "Improve customer segmentation, customer analysis, and segmentation strategies."
    },
    strategicAlignment: {
      name: "Strategic Alignment",
      description: "Improve strategic alignment, organizational coherence, and alignment with business objectives."
    }
  },
  
  // Clipboard messages
  failedToCopyClipboard: "Failed to copy content to clipboard. Please try again.",
  
  // Complexity levels
  generalPublic: "General public (clear language)",
  generalOverview: "General overview",
  shortParagraph: "Short paragraph",
  fetchingExplanation: "Fetching explanation...",
  uploadTemplate: "Upload Template",
  templateUploaded: "Template: {name}",
  clearTemplate: "Clear template",
  pptTemplateNote: "Note: AI images are disabled when using a custom template.",
  listenAlongTitle: "Listen along with YouTube",
  listenAlongBody: "Use RecapHorizon to listen along to YouTube videos. Great for extra explanations and getting more out of any show: enable system audio, play the video, and let RecapHorizon transcribe and summarize automatically.",
  listenAlongHelp: "Listen along audio? How to",
  supportedFormatsLink: "Supported formats",
  supportedFormatsTitle: "Supported file formats",
  supportedFormatsIntro: "For transcription via the 'Upload Transcript' button we support the following formats:",
  formatTxt: "Best choice for accuracy and speed",
  formatPdf: "Automatically converted to plain text",
  formatRtf: "Automatically converted to plain text",
  formatHtml: "Basic extraction of text content",
  formatMd: "Markdown is read as text",
  formatDocx: "Automatically converted to plain text",
  supportedFormatsNote: "Note: PDF, RTF and DOCX are automatically converted to plain text. Results may vary depending on source document quality.",
  
  // McKinsey Framework Analysis
  mckinsey: "McKinsey Analysis",
  mckinseyAccessRestricted: "McKinsey analysis is only available for Gold, Enterprise and Diamond subscriptions. Upgrade your subscription to get access.",
  mckinseyFeatureUpgrade: "Upgrade to Gold for McKinsey strategic analysis",
  mckinseyGeneratingTopics: "Generating strategic topics...",
  mckinseySelectTopic: "Select a strategic topic",
  mckinseySelectRole: "Select your role",
  mckinseySelectFramework: "Select a framework",
  mckinseyGeneratingAnalysis: "Generating McKinsey analysis...",
  mckinseyAnalysisComplete: "Analysis complete",
  mckinseyRoleStrategyConsultant: "Strategy Consultant",
  mckinseyRoleBusinessAnalyst: "Business Analyst",
  mckinseyRoleProjectManager: "Project Manager",
  mckinseyRoleExecutive: "Executive",
  mckinseyFramework3C: "3C Framework (Company, Customers, Competitors)",
  mckinseyFramework7S: "7S Framework (Strategy, Structure, Systems, Shared Values, Skills, Style, Staff)",
  mckinseyFrameworkCustomerLifecycle: "Customer Lifecycle Analysis",
  mckinseyFrameworkValueChain: "Value Chain Analysis",
  mckinseyFrameworkForceField: "Force Field Analysis",
  mckinseyFrameworkCoreCompetencies: "Core Competencies Analysis",
  mckinseyFrameworkScenarioPlanning: "Scenario Planning Summary",
  mckinseyFrameworkPESTEL: "PESTEL Analysis",
  mckinseyFrameworkPortersFiveForces: "Competitive Forces Analysis (Porter's Five Forces)",
  mckinseyFrameworkAnsoffMatrix: "Growth Strategies Analysis (Ansoff Matrix)",
  mckinseyFrameworkMAIntegration: "M&A Integration Scan",
  mckinseyFrameworkOperationalBenchmarking: "Operational Benchmarking Analysis",
  mckinseyFrameworkDigitalTransformation: "Digital Transformation Readiness Scorecard",
  mckinseyFrameworkPortfolioManagement: "Portfolio Management Analysis (Growth/Return)",
  mckinseyFrameworkCustomerSegmentation: "Customer Segmentation Analysis",
  mckinseyFrameworkOrganizationalStructure: "Organizational Structure & Governance Scan",
  
  // McKinsey Framework Descriptions
  mckinseyFramework3CDesc: "Analyzes strategy through three pillars: Company (internal strengths and strategy), Customers (segments, needs and value), and Competitors (positioning and advantages).",
  mckinseyFramework7SDesc: "Assesses organizational effectiveness across the 7S: Strategy, Structure, Systems, Shared Values, Style, Staff and Skills to identify alignment gaps.",
  mckinseyFrameworkCustomerLifecycleDesc: "Identifies and analyzes the different stages a customer goes through, from awareness to loyalty, including opportunities and pain points.",
  mckinseyFrameworkValueChainDesc: "Deconstructs the primary and support activities that add value to a product or service, identifying areas for optimization.",
  mckinseyFrameworkForceFieldDesc: "Analyzes a desired change by mapping the driving forces (supporting the change) and restraining forces (opposing the change).",
  mckinseyFrameworkCoreCompetenciesDesc: "Identifies the unique capabilities and knowledge in which the company excels and which provide a sustainable competitive advantage.",
  mckinseyFrameworkScenarioPlanningDesc: "Summarizes the discussed possible future scenarios, including key driving factors and their potential implications.",
  mckinseyFrameworkPESTELDesc: "Analyzes the external macro-environment from Political, Economic, Socio-cultural, Technological, Ecological, and Legal perspectives.",
  mckinseyFrameworkPortersFiveForcesDesc: "Analyzes the competitive intensity of an industry using five forces: threat of new entrants, threat of substitutes, bargaining power of buyers, bargaining power of suppliers, and intensity of rivalry.",
  mckinseyFrameworkAnsoffMatrixDesc: "Evaluates discussed growth strategies using Product/Market combinations: Market Penetration, Market Development, Product Development, and Diversification.",
  mckinseyFrameworkMAIntegrationDesc: "Analyzes discussed aspects of a proposed merger or acquisition, focusing on integration challenges and synergy opportunities.",
  mckinseyFrameworkOperationalBenchmarkingDesc: "Compares discussed operational performance (processes, efficiency, costs) with best practices or competitors (if discussed).",
  mckinseyFrameworkDigitalTransformationDesc: "Evaluates the discussed readiness of the organization for digital transformation based on technological capabilities, culture, leadership, and strategy.",
  mckinseyFrameworkPortfolioManagementDesc: "Evaluates a portfolio of business units or investments based on growth potential and expected return, similar to McKinsey's GE-Matrix.",
  mckinseyFrameworkCustomerSegmentationDesc: "Categorizes discussed customer groups based on shared characteristics, needs, behavior, or value, and identifies optimal approaches per segment.",
  mckinseyFrameworkOrganizationalStructureDesc: "Evaluates discussed aspects of organizational setup, decision-making processes, roles, and responsibilities.",
  mckinseyTopicDependencyTitle: "Important: Topic-dependent analysis",
  mckinseyTopicDependencyDesc: "McKinsey reports are highly dependent on the chosen topic. The quality and relevance of the analysis depends on how specific and clearly the selected topic is defined.",
  mckinseyTopicFallback1: "Strategic positioning and competitive advantage",
  mckinseyTopicFallback2: "Operational efficiency and process optimization",
  mckinseyTopicFallback3: "Market expansion and growth opportunities",
  mckinseyTopicFallback4: "Organizational development and change management",
  mckinseyTopicFallback5: "Digital transformation and innovation",
  mckinseyNoTopics: "No topics available. Please try again.",
  mckinseyRegenerateTopics: "Generate new topics",
  mckinseyBackToTopics: "Back to topics",
  mckinseyBackToRole: "Back to role selection",
  mckinseyBackToFramework: "Back to framework selection",
  mckinseyAnalysisError: "An error occurred while generating the analysis. Please try again.",
  mckinseyTopicsError: "An error occurred while generating topics. Please try again.",
  mckinseyDownloadPdf: "Download as PDF",
  mckinseyDownloadText: "Download as text",
  mckinseyEmailAnalysis: "Email analysis",
  mckinseyCopyAnalysis: "Copy analysis",
  mckinseyAnalysisCopied: "Analysis copied to clipboard",
  mckinseyReset: "Reset analysis",
  landingHeroSubtitle: "Transform your meetings, webinars and conversations into professional documents, export and insights with AI",
  waitlistTitle: "📋 Access by Invitation",
  waitlistLead: "RecapHorizon is currently available by invitation only. Join the waitlist!",
  emailPlaceholder: "your@email.com",
  waitlistSignUp: "Join",
  waitlistMoreInfo: "More about the waitlist",
  aboutAiTitle: "🤖 About AI & API Key",
  aboutAiBody: "RecapHorizon uses the Google Gemini API; for that we need an API key. RecapHorizon works with your key: it's free, no charge. The key is yours — and that's why RecapHorizon can be so affordable.",
  haveAccessLead: "Already have access? Log in to get started",
  loginNow: "Log in",
  featuresTitle: "Perfect For:",
  featureRecordingTitle: "Smart Recording",
  featureRecordingDesc: "Record meetings, webinars and conversations with your microphone and system audio. Full support for 64 languages.",
  featureAIAnalysisTitle: "📝 AI Analysis",
  featureAIAnalysisDesc: "Generate summaries, FAQs, key learnings and follow-up questions automatically with the latest AI technology.",
  featurePresentationsTitle: "📊 Export",
  featurePresentationsDesc: "Use exactly the content you need and summarize it into a document, presentation, or email.",
  featureChatTitle: "💬 Chat & Questions",
  featureChatDesc: "Ask questions about your transcript and get detailed answers. Voice input supported.",


  featurePrivacyTitle: "🔒 Privacy & Anonymization",
  featurePrivacyDesc: "Automatic anonymization of names and sensitive information. Configurable rules for your organization.",
  featureToolkitTitle: "🛠️ AI Assistant Toolkit",
  featureToolkitDesc: "RecapHorizon offers a versatile toolkit with functionalities beyond audio recording, including file and text analysis, webpage import, and image processing, complemented by premium options like email import and expert chat.",
  featurePWATitle: "📱 PWA Support",
  featurePWADesc: "RecapHorizon supports Progressive Web Apps (PWAs), which means it loads quickly, and works like an app on your device after installation.",
  privacyTitle: "🔒 Full Privacy Guarantee",
  privacyLead: "Important: Your sessions are NOT stored in our database. All data stays fully local on your device.",
  privacyItemApiKeyLocal: "🔑 API key stored locally on your device",
  privacyItemRecordings: "🎙️ Recordings stay local",
  privacyItemTranscripts: "📝 Transcripts are private",
  privacyItemAIOutput: "🤖 AI output only for you",
  privacyItemNoServers: "🌐 No session data to our servers",
  privacyItemWeStoreNothing: "✅ We store nothing at all",
  privacyItemNoVideo: "🎥 No video is recorded",
  privacyItemAudioStored: "🔊 Audio files not stored",
  privacyFootnote: "Your privacy comes first. We cannot see, store or use your sessions.",
  useCasesTitle: "💼 Perfect For:",
  useCasesMgmtTitle: "Management & Leadership",
  useCasesMgmt1: "Project managers and team leads",
  useCasesMgmt2: "Product owners and product managers",
  useCasesMgmt3: "Executives and CEOs (for strategic meetings and reporting)",
  useCasesMgmt4: "Sales managers and account managers (for customer talks and pitches)",
  useCasesAdviceTitle: "Advisory & Consulting",
  useCasesAdvice1: "Consultants and advisors",
  useCasesAdvice2: "Support consultants",
  useCasesAdvice3: "HR professionals and recruiters (for interviews and onboarding)",
  useCasesAdvice4: "Financial advisors and auditors (for compliance and reports)",
  useCasesCreationTitle: "Creation & Communication",
  useCasesCreation1: "Content creators and journalists",
  useCasesCreation2: "Marketers and PR specialists (for brainstorms and campaigns)",
  useCasesCreation3: "Webinar hosts and trainers",
  useCasesCreation4: "Vloggers (for recording and editing)",
  useCasesResearchTitle: "Research & Analysis",
  useCasesResearch1: "Researchers and academics",
  useCasesResearch2: "Legal professionals",
  useCasesResearch3: "Accountants and bookkeepers",
  useCasesResearch4: "Data analysts and BI researchers (for data sessions and insights)",
  howItWorksTitle: "🔄 How It Works:",
  hiwStep1Title: "Record",
  hiwStep1Desc: "Start a recording of your meeting or upload a transcript",
  hiwStep2Title: "AI Processing",
  hiwStep2Desc: "AI analyzes and generates content based on your input",
  hiwStep3Title: "Result",
  hiwStep3Desc: "Download your documents, export and insights",
  ctaTitle: "🚀 Ready to Start?",
  ctaLead: "Log in and discover how RecapHorizon can transform your workflow. Save hours on manual notes and documentation.",
  listening: "Listening...",
  speaking: "Speak your question...",
  startListening: "Start speech recognition",
  stopListening: "Stop speech recognition",
  powerpointOptions: "PowerPoint Options",
  templateUpload: "Template upload",
  useCustomTemplate: "Use custom template",
  selectTemplate: "Select template",
  maxSlides: "Maximum slides",
  presentationLanguage: "Presentation language",
  generatePresentation: "Generate presentation",
  // New PowerPoint options
  targetAudience: "Target Audience",
  mainGoal: "Main Goal of Presentation",
  toneStyle: "Desired Tone/Style",
  // Target audience options
  seniorManagement: "Senior management",
  potentialCustomers: "Potential customers",
  technicalExperts: "Technical experts",
  // Main goal options
  informAndUpdate: "Inform and provide updates",
  convinceToDecide: "Convince to decide",
  trainAndShare: "Train and share knowledge",
  presentProblemAndSolution: "Present problem and propose solution",
  reportProgress: "Report progress",
  brainstormAndGenerate: "Brainstorm and generate ideas",
  // Tone/style options
  formalAndFactual: "Formal and factual",
  enthusiasticAndMotivating: "Enthusiastic and motivating",
  criticalAndAnalytical: "Critical and analytical",
  conciseAndToThePoint: "Concise and to-the-point",
  storytellingOriented: "Storytelling-oriented",
  cancel: "Cancel",
  setupApiKey: "Setup API Key",
  howToGetApiKey: "How to get a Google Gemini API Key?",
  apiKeyStep1: "Go to Google MakerSuite",
  apiKeyStep2: "Sign in with your Google account",
  apiKeyStep3: "Click 'Create API Key'",
  apiKeyStep4: "Copy the generated key",
  openGoogleMakerSuite: "Open Google MakerSuite",
  enterApiKey: "Enter your API Key",
  apiKeyRequired: "API Key is required",
  apiKeyInvalid: "API Key is invalid",
  validating: "Validating...",
  saveApiKey: "Save API Key",
  privacyNote: "Privacy Note",
  apiKeyPrivacy: "Your API key is only stored locally on your device and is never sent to our servers.",
  pricingTagline: "The only companion you need — save hours every week",
  
  pricingMonthly: "Monthly",
  pricingPrice: "€2",
  
  pricingCancelable: "after that, cancel any month (1-month notice)",
  pricingFreeTitle: "Free Mode",
  pricingFreeDesc: "Limited features, 10 days access",
  pricingBenefitsTitle: "What you get",
  pricingBenefit1: "Automatic transcription and AI summaries",
  pricingBenefit2: "PowerPoint generation and mindmaps",
  pricingBenefit3: "Chat over your transcript",
  pricingBenefit4: "Anonymization and privacy — data stays local",
  pricingCta: "Start now",
  recording: "Recording",
  paused: "Paused",
  recordingInProgress: "Recording in progress...",
  recordingPaused: "Recording paused",
  recordingActive: "Recording active",
  executiveSummary: "Executive Summary",
  storytelling: "Storytelling",
  businessCase: "Business Case",
  objective: "Objective",
  situation: "Situation",
  complication: "Complication",
  resolution: "Resolution",
  benefits: "Benefits",
  callToAction: "Call to Action",
  quizQuestions: "Quiz Questions",
  correctAnswer: "Correct answer",
  numberOfQuestions: "Number of questions (1-5)",
  optionsPerQuestion: "Options per question",
  includeAnswers: "Include answers",
  generate: "Generate",

  // Audio limit messages

  currentUsage: "Current usage",
  minutes: "minutes",
  upgradeForMoreMinutes: "Upgrade for more minutes",
  audioMinutesPerMonth: "{limit} minutes per month",
  upgradeTo: "Upgrade to {tier}",

  goldTierContactSupport: "Contact support for enterprise options.",
  viewAllPricingOptions: "View all pricing options",

  upgradeToGetMoreMinutes: "Upgrade your subscription to get more audio minutes.",
  remainingAudioMinutes: "Remaining audio minutes: {remaining} of {total}",
  audioUsageWarning: "Warning: You have used {percentage}% of your monthly audio minutes.",
  regenerate: "Regenerate",
  // Use case texts for info page
  useCaseMeetingTitle: "Direct meeting summaries",
  useCaseMeetingDesc1: "You have an online meeting, you let RecapHorizon listen along on your PC, listening to system audio.",
  useCaseMeetingDesc2: "RecapHorizon delivers a concise summary, action points and decisions directly, so you immediately know what was agreed upon.",
  useCaseWebinarTitle: "Webinar essence in minutes",
  useCaseWebinarDesc1: "You've followed a long and informative webinar, RecapHorizon listens along on your PC.",
  useCaseWebinarDesc2: "Get the most important learning points, keywords and a summary directly, without spending hours going through your notes.",
  useCaseConversationTitle: "Never miss details again",
  useCaseConversationDesc1: "An important conversation with colleagues and you let RecapHorizon listen along on your smartphone.",
  useCaseConversationDesc2: "Afterwards, immediately an overview with agreements.",
  useCaseSalesTitle: "Grip on customer conversations",
  useCaseSalesDesc1: "Daily customer conversations? Use Sentiment Analysis for extra insights.",
  useCaseSalesDesc2: "Let RecapHorizon analyze the audio from the speaker.",
  useCaseQuizTitle: "Knowledge check with quiz questions",
  useCaseQuizDesc1: "Repeat a training or test your team.",
  useCaseQuizDesc2: "RecapHorizon creates quiz questions for self-study or testing.",
  useCaseFaqTitle: "Lightning fast FAQs",
  useCaseFaqDesc1: "Quickly a list of questions and answers.",
  useCaseFaqDesc2: "Analyze your conversation or webinar; RecapHorizon does the rest.",
  useCaseExecTitle: "Executive overview",
  useCaseExecDesc1: "Strategic update in O-S-C-R-B-C style.",
  useCaseExecDesc2: "Perfect for your executive slide.",
  useCaseVoiceTitle: "Strategy with voice input",
  useCaseVoiceDesc1: "Speak your ideas, RecapHorizon works them out.",
  useCaseVoiceDesc2: "Including documents and executive summary.",
  useCaseChatTitle: "Chat about your content",
  useCaseChatDesc1: "Ask everything about your meeting or webinar.",
  useCaseChatDesc2: "Direct answers without searching.",
  useCaseExportTitle: "Everything in one document",
  useCaseExportDesc1: "Bundle all outcomes and export.",
  useCaseExportDesc2: "With the RecapHorizon panel you put everything together.",
  // Admin panel translations
  adminPanel: "Admin Panel",
  backToStartSession: "Back to Start Session",
  addUser: "Add User",
  add: "Add",
  syncUsers: "Sync Users",
  syncUsersDesc: "Repairs missing UID fields and synchronizes users",
  exportFunctionality: "Export Functionality",
  exportWaitlistToCsv: "Export Waitlist to CSV",
  exportUsersToCsv: "Export Users to CSV",
  exportFunctionalityDesc: "Export data for analysis and administration",
  // Login form translations
  email: "Email",
  socialPost: "Social Post",
  socialPostX: "X / BlueSky post",
  password: "Password",
  rememberMe: "Remember me",
  accountCreate: "Create Account",
  resetSend: "Send Reset",
  // Privacy window bullets
  privacyBullet1: "🎙️ Recordings stay local",
  privacyBullet2: "📝 Transcripts are private",
  privacyBullet3: "🤖 AI output only for you",
  privacyBullet4: "🌐 No session data to our servers",
  privacyBullet5: "✅ We store nothing at all",
  privacyBullet6: "🎥 No video is recorded",
  privacyBullet7: "🔊 Audio files not stored",
  // Footer menu items
  ourStory: "Our Story",
  theTeam: "The Team",
  disclaimer: "Disclaimer",
  cookies: "Cookies",
  // Error messages
  passwordsDoNotMatch: "Passwords do not match",
  passwordTooShort: "Password must be at least 6 characters",
  // Password validation
  passwordRequirements: "Password requirements:",
  passwordMinLength: "At least 8 characters",
  passwordSpecialChar: "At least 1 special character (!@#$%^&*)",
  passwordUppercase: "At least 1 uppercase letter",
  passwordLowercase: "At least 1 lowercase letter",
  passwordNumber: "At least 1 number",
  passwordStrengthWeak: "Weak",
  passwordStrengthMedium: "Medium",
  passwordStrengthStrong: "Strong",
  passwordStrengthVeryStrong: "Very Strong",
  allRequirementsMet: "All requirements met",
  // Login form additional texts
  confirmPassword: "Confirm Password",
  passwordAppSpecific: "This password is specific to this app",
  forgotPassword: "Forgot Password?",
  // FAQ translations
  faqTitle: "Frequently Asked Questions",
  faqSubtitle: "Everything you need to know about RecapHorizon. From basic functionality to advanced AI features, privacy settings and practical use cases.",
  faqSearchPlaceholder: "Search all questions...",
  faqNoResultsTitle: "No questions found",
  faqNoResultsSubtitle: "Try other search terms or select a different category.",
  faqCategoryAll: "All Questions",
  faqCategoryCore: "Core Functionality",
  faqCategoryAI: "AI Features",
  faqCategoryPrivacy: "Privacy & Security",
  faqCategoryUseCases: "Use Cases",
  faqCategoryExport: "Export & Integration",
  faqCategoryTechnical: "Technical & Setup",
  faqCategoryPricing: "Pricing & Subscription",
  faqStatsFeatures: "Features",
  faqStatsPrivacy: "Privacy",
  faqStatsAvailable: "Available - 64 languages",
  // FAQ Questions and Answers
  faqWhatIsRecapHorizon: "What is RecapHorizon and how does it work?",
    faqWhatIsRecapHorizonAnswer: "RecapHorizon is an AI-powered tool that automatically records, transcribes and analyzes your meetings, webinars and conversations. It works by using your microphone and system audio to capture everything, after which AI processes the content into summaries, action points and insights. All data remains local on your device for complete privacy.",
  faqFileFormats: "What file formats can I upload?",
  faqFileFormatsAnswer: "RecapHorizon supports TXT, PDF, RTF, HTML, Markdown and DOCX files. PDF, RTF and DOCX are automatically converted to plain text. For best results, we recommend TXT files, but all formats are supported.",
  faqDocxImport: "How does DOCX import work?",
  faqDocxImportAnswer: "DOCX files are automatically converted to plain text when you upload them. The text is extracted from the document and can then be analyzed by our AI. Formatting like bold text, tables, and images are lost during conversion, but the text content is preserved.",
  faqRecordingLength: "How long can I record?",
  faqRecordingLengthAnswer: "The maximum length of recordings depends on your chosen subscription. The AI processes everything in real-time and generates results as soon as you stop recording.",
  faqPauseResume: "Can I pause and resume recordings?",
  faqPauseResumeAnswer: "Yes, you can pause recordings and resume them later. This is useful for long meetings or when you need to stop temporarily. The recording is seamlessly merged.",
  faqAIAnalyses: "What types of analyses can AI generate?",
  faqAIAnalysesAnswer: "The AI can generate summaries, FAQs, key learnings, follow-up questions, sentiment analysis, keyword analysis, mindmaps, executive summaries, business cases, storytelling and quiz questions. Each analysis is tailored to your specific content.",
  faqAIAccuracy: "How accurate are the AI summaries?",
  faqAIAccuracyAnswer: "The AI summaries are very accurate and take into account the context of your conversation. They automatically identify important points, decisions and action items. The quality improves as the transcription becomes clearer.",
  faqAIQuestions: "Can I ask the AI questions about my transcript?",
  faqAIQuestionsAnswer: "Yes! You can chat with your transcript by asking questions. The AI understands the context and provides detailed answers. You can also use speech to ask questions.",
  faqLanguageSupport: "What languages does RecapHorizon support?",
  faqLanguageSupportAnswer: "RecapHorizon supports 64 languages for both input (transcription) and output (AI analysis). You can record a Dutch conversation and generate a summary in English, for example. Supported languages include Dutch, English, German, French, Spanish, Portuguese, Italian, Japanese, Chinese, Arabic, Hindi, and many more.",
  
  // Session options
  sessionOptionsTitle: "Choose your session option",
  sessionOptionsSubtitle: "Select how you want to input your transcript",
  chooseHowToStart: "Choose how you want to start:",
  uploadFile: "Upload file",
  pasteText: "Paste text",
  pasteTextDirectly: "Paste text directly into the application",
  analyzeWebPageContent: "Analyze content from 1 or multiple web page(s)",
  sessionOptionAudio: "Audio Recording",
  sessionOptionAudioDesc: "Record your meeting/presentation/your voice with your microphone and/or system audio",
  sessionOptionFile: "File Upload",
  sessionOptionFileDesc: "Upload an existing transcript or text file",
  sessionOptionFileFormats: "Supported formats:\nTXT, PDF, RTF, HTML, MD, DOCX",
  sessionOptionPaste: "Paste Text",
  sessionOptionPasteDesc: "Paste text from your clipboard or another document",
  sessionOptionWebPage: "Web Page",
  sessionOptionWebPageDesc: "Enter a URL to import text directly from a web page",
  sessionOptionImage: "Image Upload",
  sessionOptionImageDesc: "Upload a photo or image for AI analysis and transcript generation",
  sessionOptionImageFormats: "Supported formats:\nJPG, PNG, JPEG, WEBP, GIF\n• Gold, Diamond & Enterprise only",
  
  // Multi Uploads Session Option
  sessionOptionMultiUpload: "Multiple Files",
  sessionOptionMultiUploadDesc: "Upload multiple files; text is merged and prepared for analysis",
  sessionOptionMultiUploadFormats: "Supported formats:\nTXT, PDF, RTF, HTML, MD, DOCX",
  
  // Audio Upload Session Option
  sessionOptionAudioUpload: "Audio Upload",
  sessionOptionAudioUploadDesc: "Upload an existing audio file (MP3/MP4) for direct transcription",
  sessionOptionAudioUploadFormats: "Supported formats:\nMP3, MP4\n• All subscriptions",
  webPageUrlLabel: "Web Page URL",
  webPageHelpText: "Enter a URL or drag and drop a link to analyze content from a web page.",
  webPageDragDropText: "Drag URL here or type",
  webPageDragDropHint: "You can drag links from other tabs or applications",
  sessionOptionsNote: "All options support the same AI analysis features. Choose what works best for your situation.",
  faqStorage: "Where are my recordings stored?",
  faqStorageAnswer: "All recordings remain local on your device. We don't store anything on our servers. Your privacy comes first - we cannot see, store or use your sessions.",
  faqAnonymization: "How does anonymization work?",
  faqAnonymizationAnswer: "RecapHorizon can automatically replace names and sensitive information with pseudonyms. You can configure anonymization rules for your organization. This is ideal for compliance and privacy.",
  faqDataExport: "Can I export and delete my data?",
  faqDataExportAnswer: "Yes, you can export all your generated content to various formats. All data can be easily deleted by clearing your browser data.",
  faqPhoneRecording: "Can I directly record and analyze phone calls?",
  faqPhoneRecordingAnswer: "No, you cannot and are not allowed to directly record phone calls from your phone and analyze them. However, you can put a phone call on speaker and let RecapHorizon listen on your laptop. Make sure to inform your conversation partners.",
  faqMeetings: "How can I use RecapHorizon for meetings?",
  faqMeetingsAnswer: "Start a recording for your meeting and let RecapHorizon listen along. Afterwards you get a concise summary, action points and decisions. Ideal for project managers, team leaders and executives.",
  faqWebinars: "Can I process webinars?",
  faqWebinarsAnswer: "Absolutely! Let RecapHorizon listen along during webinars and get the essence in minutes. You get the most important learning points, keywords and a summary without having to go through your notes for hours.",
  faqCustomerConversations: "How does it help with customer conversations?",
  faqCustomerConversationsAnswer: "Use sentiment analysis for extra insights into customer conversations. RecapHorizon analyzes the audio and gives you a better understanding of customer satisfaction and needs.",
  faqTrainingQuizzes: "Can I create training and quizzes?",
  faqTrainingQuizzesAnswer: "Yes! RecapHorizon automatically generates quiz questions based on your content. Perfect for testing your team or self-study. You can adjust the number of questions and answer options.",
  faqContentCreators: "How does it work for content creators?",
  faqContentCreatorsAnswer: "Content creators can create executive summaries and mindmaps from meetings. Ideal for journalists, marketers and vloggers.",
  faqExportOptions: "What export options are available?",
  faqExportOptionsAnswer: "You can generate PowerPoint presentations, export PDFs, copy text to clipboard and bundle all content in one document. The AI even generates images for your slides.",
  faqPowerPoint: "Can I create PowerPoint presentations?",
  faqPowerPointAnswer: "Yes! RecapHorizon automatically generates PowerPoint presentations with AI-generated images. You can adjust the number of slides, template and language. Perfect for executive updates.",
  faqMindmap: "How does the mindmap functionality work?",
  faqMindmapAnswer: "The AI analyzes your content and automatically generates a visual mindmap. This helps in understanding connections and structuring information. You can export the mindmap as an image.",
  faqTemplates: "Can I use templates?",
  faqTemplatesAnswer: "Yes, you can upload custom PowerPoint templates. Note that AI images are disabled when using custom templates for optimal compatibility.",
  faqBrowsers: "Which browsers are supported?",
  faqBrowsersAnswer: "RecapHorizon works on all modern browsers that support WebRTC, including Chrome, Firefox, Safari and Edge. For the best experience, we recommend Chrome.",
  faqRecordingProblems: "What if I have problems with recording?",
  faqRecordingProblemsAnswer: "Check if your microphone and screen recording permissions are granted. Reload the page if you experience problems. All recordings are stored locally, so you don't lose any data.",
  faqMobile: "Can I use RecapHorizon on mobile?",
  faqMobileAnswer: "Yes, RecapHorizon works on smartphones and tablets. You can record meetings and upload transcriptions. The interface automatically adapts to your screen size.",
  faqPricing: "How much does RecapHorizon cost?",
  faqPricingAnswer: "RecapHorizon costs only €2 per month with a minimum of 6 months. After that, you can cancel monthly with 1 month notice. There is also a free mode with limited features.",
  faqPaidVersion: "What do I get in the paid version?",
  faqPaidVersionAnswer: "You get unlimited transcriptions, AI summaries, PowerPoint generation, mindmaps, chat functionality, anonymization and all export options. No restrictions on file formats.",
  faqTrialPeriod: "Is there a free trial period?",
  faqTrialPeriodAnswer: "Yes, you can use RecapHorizon for free for 1 month. This gives you a good idea of what RecapHorizon can do before you decide to upgrade.",
  faqCancellation: "Can I cancel at any time?",
  faqCancellationAnswer: "After the initial 6 months, you can cancel at any time with 1 month notice. You retain access to all features until the end of your subscription.",
  
  // New FAQ items
  faq64Languages: "How many languages does RecapHorizon support?",
  faq64LanguagesAnswer: "RecapHorizon supports 64 different languages for transcription and analysis. You can speak in any supported language and generate output in another language.",
  
  faqMultilingual: "Can I analyze a French conversation and get Dutch results?",
  faqMultilingualAnswer: "Yes! You can, for example, record a French presentation, have the analysis done in German, and use the app itself in Spanish. RecapHorizon is fully multilingual and flexible.",
  
  faqTeamsTranscript: "How do I import a Microsoft Teams transcript?",
  faqTeamsTranscriptAnswer: "Simple: 1) Download your Teams recording, 2) Open the transcript file, 3) Select and copy all text, 4) Paste the text in RecapHorizon under 'Paste transcript'. RecapHorizon processes it immediately for analysis.",
  
  // Web page functionality FAQ
  faqWebPageImport: "Can I import text directly from a web page?",
  faqWebPageImportAnswer: "Yes! You can enter a URL to import text directly from a web page. RecapHorizon automatically fetches all text and prepares it for analysis. This is useful for articles, blog posts, news articles and other web content.",
  
  // Story modal translations
  storyTitle: "Our Story",
  storyContent: `The Story of RecapHorizon: Beyond the Chaos

Do you recognize that feeling after an intensive meeting, an engaging webinar, or an important conversation with your colleague? That fuzzy aftermath where you try to reconstruct: "What exactly did we discuss? What were the concrete agreements? And, oh yes, were there also follow-up actions?" It was this shared, universal frustration – the everyday chaos of communication – that brought together a small team of visionaries. They later called themselves, very appropriately, the "RecapHorizon team".

Their first thought was simple yet revolutionary: there had to be a way to capture and structure the essence of every conversation, regardless of the medium. Whether it was a noisy brainstorming session around a coffee table, a formal online meeting, or an ad-hoc phone call, they wanted a program that would help us record and summarize a meeting. The beginning was rudimentary, a rough diamond that needed to take shape.

Soon the ambition grew beyond just meetings. The chaos wasn't limited to the boardroom after all. Imagine: you're following a complex webinar, bursting with valuable information. What if you could summarize and analyze that directly, without spending hours taking notes? The need for a tool that could not only summarize meetings but also distill a recently followed webinar directly into usable insights quickly became the next milestone.

And then accessibility. A powerful tool is useless if it's not always and everywhere available. The vision expanded: not just on your PC, but especially also on your smartphone. The dream was crystal clear: "Press a button on your smartphone, put it down, and let the conversation be fully automated into a structured overview." It had to be seamless, an intuitive extension of your daily workflow.

What the RecapHorizon team made immediately clear, however, was that their focus was absolutely not on recording and storing audio or video. In fact, this raw data is deleted immediately after processing. Privacy and efficiency were paramount; it was purely about transforming fleeting spoken language into concrete, tangible insights. It was the essence, the 'recap', that mattered, not the carrier.

The ultimate goal was to, hand in hand with advanced AI, get the most out of the data. Depending on the recording and the user's needs, RecapHorizon had to easily let them choose what they wanted to see. One time a concise summary, another time an in-depth sentiment analysis, or a list of concrete follow-up actions. The user was the director, AI the invisible assistant that kneaded the data into the desired output.

This evolution, from a simple frustration to an ambitious vision, culminated in the creation of a robust web-app. This finally made the promise of 'everywhere and always accessible' true. Regardless of device or location, RecapHorizon was ready.

The RecapHorizon team was realistic. They knew they certainly weren't the first tool that could do this. The market was already full of various solutions. But where many competitors were complex, had a high threshold, and came with a price tag of 15 to 35 euros per month per user, RecapHorizon wanted something different. It was a tool built from the user, with the promise of accessibility for everyone. Costs were kept as low as possible, to offer a low-threshold alternative that everyone could always use, without pain in the wallet. They believed that the power of insight shouldn't be reserved for the elite, but should be available to everyone.

Today, the RecapHorizon team is proud of what they have achieved: a powerful, intuitive, and affordable solution that transforms the chaos of communication into clear insights. But the journey is far from over. Their notebooks are full of new ideas, and the drive to make communication even smarter and more efficient burns brighter than ever. The next steps are already in mind, all aimed at further empowering the user.

RecapHorizon: Beyond the chaos, the essence first.`,
  storyClose: "Close",
  
  // Team modal translations
  teamTitle: "The Team",
  teamContent: "We will introduce the team here soon. Interested in building together? Email support@recaphorizon.nl",
  teamClose: "Close",
  
  // Cookie modal translations
  cookiePolicyTitle: "🍪 Cookie Policy",
  cookiePolicyDescription: "This app uses cookies to improve your experience. By using the app, you agree to our cookie policy.",
  cookiePolicyWhatWeStore: "What we store:",
  cookiePolicyLanguagePreference: "• Your language preference",
  cookiePolicyThemePreference: "• Your theme preference (dark/light)",
  cookiePolicyDecline: "Decline",
  cookiePolicyAccept: "Accept",
  
  // Cookie info modal translations
  cookieInfoTitle: "Cookie Information",
  cookieInfoClose: "Close",
  
  // Paste transcript modal translations
  pasteTranscriptTitle: "Paste Transcript",
  pasteTranscriptDescription: "Paste your transcript or text content below. You can copy text from any source and paste it here for instant analysis.",
  pasteTranscriptPlaceholder: "Paste your text here... (Ctrl+V or right-click → Paste)",
  processTranscript: "Process Transcript",
  pasteHelpTitle: "How to Paste Text",
  pasteHelpDescription: "Follow these simple steps to paste text for analysis:",
  pasteHelpStep1: "Copy text from any source (document, website, email, etc.)",
  pasteHelpStep2: "Click the 'Paste Transcript' button above",
  pasteHelpStep3: "Paste your text (Ctrl+V) and click 'Process Transcript'",
  
  // Multi Uploads modal translations
  multiUploadTitle: "Upload Multiple Files",
  multiUploadDescription: "Drag one or more files here or click to select. Each file is converted to plain text and added below.",
  multiUploadDragText: "Drag files here or click",
  multiUploadSelectFiles: "Select Files",
  multiUploadReadOnlyTitle: "Merged text",
  multiUploadReadOnlySubtitle: "The uploaded files are merged into one readable text",
  multiUploadEdit: "Edit",
  multiUploadCancel: "Cancel",
  multiUploadProcessTranscript: "Process Transcript",
  multiUploadClear: "Clear",
  multiUploadDownload: "Download",
  multiUploadUnsupportedFormat: "Only TXT, PDF, RTF, HTML, MD and DOCX files are allowed",
  multiUploadMaxLengthWarning: "Merged text is too long ({currentLength} characters). Maximum allowed: {maxLength}. Shorten the text or remove files.",
  
  // Multi Uploads help popup
  multiUploadHelpTitle: "Multiple Files – Help",
  multiUploadHelpDescription: "Learn how to upload and merge multiple files for analysis:",
  multiUploadHelpStep1: "Drag one or more files to the upload area or click to select",
  multiUploadHelpStep2: "Each file is automatically converted to plain text and added below",
  multiUploadHelpStep3: "Use ‘Edit’ to modify the merged text if needed",
  multiUploadHelpStep4: "Click ‘Process Transcript’ to send the merged text to the Analysis section",
  multiUploadHelpStep5: "Mind the maximum length: if exceeded, a warning appears and you must shorten",
  
  // Coming soon modal translations
  comingSoonTitle: "🚀 Coming Soon!",
  comingSoonDescription: "This feature is not yet available, but it's coming soon!",
  cookieInfoWhatAreCookies: "What are cookies?",
  cookieInfoWhatAreCookiesAnswer: "Cookies are small text files that are stored on your device when you visit websites. They help the website remember what you have done and preserve your preferences.",
  cookieInfoWhatWeUse: "Cookies we use",
  cookieInfoEssentialCookies: "Essential cookies",
  cookieInfoEssentialCookiesAnswer: "These cookies are necessary for the app to function and cannot be disabled.",
  cookieInfoAnalyticsCookies: "Analytics cookies",
  cookieInfoAnalyticsCookiesAnswer: "These cookies help us understand how users use the app so we can improve it.",
  cookieInfoNoTracking: "No tracking of personal data",
  cookieInfoNoTrackingAnswer: "We do not collect personal information through cookies. All data is collected anonymously and used solely to improve the app.",
  cookieInfoSettings: "Change cookie settings",
  cookieInfoSettingsAnswer: "You can change your cookie preferences at any time by adjusting your browser settings. Note that disabling cookies may affect the app's functionality.",
  
  // Disclaimer modal translations
  disclaimerTitle: "⚠️ Disclaimer",
  disclaimerClose: "Close",
  disclaimerAIContent: "AI-Generated Content",
  disclaimerAIContentAnswer: "RecapHorizon uses the latest AI technology to generate transcriptions, summaries, analyses, and other content. All generated content is AI-based and serves only to support your work.",
  disclaimerAccuracy: "No Guarantee of Accuracy",
  disclaimerAccuracyAnswer: "While we do our best to provide accurate results, we cannot guarantee that all AI-generated content is 100% accurate. We recommend checking and verifying all output before using it for important decisions.",
  disclaimerOwnRisk: "Use at Your Own Risk",
  disclaimerOwnRiskAnswer: "The use of this app and all generated content is at your own risk. We are not liable for any errors, inaccuracies, or consequences of using the generated content.",
  disclaimerGoogleGemini: "Google Gemini API",
  disclaimerGoogleGeminiAnswer: "The app integrates with AI services. The quality and availability of these services depend on the AI provider's terms and may vary. We have no control over the underlying AI models or their output.",
  disclaimerPrivacy: "Privacy and Data - Complete Local Storage",
  disclaimerPrivacyAnswer: "Important: Your sessions are NOT stored in our database. All data remains completely local on your device.",
  disclaimerPrivacyBullet1: "🎙️ Recordings: Only stored locally, we cannot see them",
  disclaimerPrivacyBullet2: "📝 Transcripts: Stay on your device, not in our database",
  disclaimerPrivacyBullet3: "🤖 AI Output: Only you can see your generated content",

  disclaimerPrivacyNote: "We store absolutely nothing from your sessions. Your privacy comes first.",
  disclaimerRecommendations: "Recommendations",
  disclaimerRecommendation1: "Always check generated content for accuracy",
  disclaimerRecommendation2: "Use AI output as support, not as a replacement for professional judgment",
  disclaimerRecommendation3: "Consider the limitations of AI technology",
  disclaimerRecommendation4: "Consult experts for important decisions",
  
  // Settings modal translations
  settings: "Settings",
  logout: "Logout",
  settingsPwaInstallation: "App Installation",
  settingsPwaInstallationDesc: "Install RecapSmart as an app on your device for a better experience",

  // Pricing page translations
  pricingTitle: "RecapHorizon Subscriptions",
  pricingCurrentTier: "You are currently on the {tier} Tier",
  pricingCurrentTierAdmin: "You are currently on the {tier} Tier (Admin)",
  pricingComingSoon: "Coming Soon",
  pricingPerMonth: "/month",
  pricingMinTerm: "Minimum {months} months",
  pricingPriceOnRequest: "Price on request",
  pricingMinutesPerSession: "{minutes} minutes per session",
  pricingSessionsPerDay: "{sessions} sessions per day",
  pricingTranscriptLength: "{length}k characters transcript",
  pricingUnlimited: "Unlimited",
  pricingFileTypes: "File types: {types}",
  pricingOnlyTxt: "TXT only",
  pricingPremiumFeatures: "Premium Features",
  pricingChatWithTranscript: "Chat with transcript",
  horizonPackageTitle: "Horizon package",
  horizonPackageAvailableFor: "Only available for <strong>Silver</strong> and <strong>Gold</strong> members.",
  horizonPackageAudio: "4 hours extra audio recording (<span class=\"whitespace-nowrap\">240 minutes</span>)",
  horizonPackageTokens: "25,000 extra tokens",
  horizonPackagePrice: "Price: <strong>one-time €4</strong>",
  horizonPackageValidUntil: "Only valid in your subscription month{{billingDate}}.",
  horizonPackageNotTransferable: "Not transferable to a new billing period.",
  horizonPackageComingSoon: "Coming soon",
  whatAreTokensTitle: "What are tokens?",
  whatAreTokensDescription: "Tokens are small pieces of text used for AI computation. You rarely need to think about them: you just work, we safely track your limits per tier.",
  whatAreTokensPoint1: "We count tokens you upload (to the AI) and tokens you download (from the AI). Together these make up your usage.",
  whatAreTokensPoint2: "Download tokens (the AI result) cost slightly more than upload tokens. This helps keep answer quality high.",
  whatAreTokensPoint3: "Approaching your limit? We’ll kindly notify you and you can easily upgrade.",

  pricingPowerPointExport: "PowerPoint export",
  pricingBusinessCaseGenerator: "Business Case Generator",
  pricingWebPageImport: "Web Page Import",
  pricingBasicWebPageImport: "Basic Web Page Import (single URL)",
  pricingWebExpertImport: "WebExpert URL Import (advanced method, 375% higher success rate)",
  pricingNoPremiumFeatures: "No premium features available",
  pricingCurrentTierButton: "Current Tier",
  pricingAdminOnly: "Admin Only",
  pricingStartFree: "Start Free",
  pricingContactEnterprise: "Contact for Enterprise",
  pricingUpgradeTo: "Upgrade to {tier}",
  pricingDowngradeTo: "Downgrade to {tier}",
  pricingProcessing: "Processing...",
  pricingLoginRequired: "Log in to select this tier",

  // Enterprise Contact Modal
  enterpriseContactTitle: "Enterprise contact",
  enterpriseContactIntro: "Tell us a bit about your organization, and we will reach out to tailor RecapHorizon for your team.",
  enterpriseYourName: "Your name",
  enterpriseYourNamePlaceholder: "e.g. Jane Doe",
  enterpriseWorkEmail: "Work email",
  enterpriseWorkEmailPlaceholder: "name@company.com",
  enterpriseCompany: "Company",
  enterpriseCompanyPlaceholder: "Company name",
  enterpriseEstimatedUsers: "Estimated users",
  enterpriseSelectOption: "Select...",
  enterpriseSubmitButton: "Submit request",
  enterpriseUsers_2_5: "2 - 5",
  enterpriseUsers_6_10: "6 - 10",
  enterpriseUsers_11_25: "11 - 25",
  enterpriseUsers_26_100: "26 - 100",
  enterpriseUsers_100_plus: "100+",
  enterpriseContactRateLimit: "You can only send this request once per session. Log in to send another.",
  pricingUnlimitedSessions: "Unlimited sessions",
  horizonPackageAvailableForButton: "Only for Silver and Gold",
  faqBrainstorm: "What is Brainstorm and which tiers include it?",
  faqBrainstormAnswer: "Brainstorm helps generate ideas and directions from your transcript. Available from Gold and above; Free can view the interface but cannot generate output.",
  faqSpecialPrompts: "What are Special prompts and who can use them?",
  faqSpecialPromptsAnswer: "Special prompts are ready‑made AI tasks for specific use cases. Available from Gold and above; Free can see prompts but cannot generate results.",
  faqAIDiscussion: "What does AI discussion do, and is it available for my plan?",
  faqAIDiscussionAnswer: "AI discussion facilitates a multi‑agent brainstorm/discussion with roles and goals. Available from Gold and above; Free can see configuration but cannot start a discussion.",
  enterpriseMessage: "Additional info",
  enterpriseMessagePlaceholder: "What are your goals and needs?",
  enterprisePrivacyNote: "We will only use this information to contact you about enterprise options.",
  enterpriseSendRequest: "Send request",
  enterpriseRequiredFields: "Please fill in all required fields.",
  enterpriseUnsafeInput: "Unsafe input detected. Please remove special scripts or suspicious patterns.",
  enterpriseContactSuccess: "Thanks! Your request has been sent. We will contact you shortly.",
  enterpriseContactError: "Failed to send your request. Please try again later.",
  enterpriseUsers_10_50: "10 - 50",
  enterpriseUsers_50_200: "50 - 200",
  enterpriseUsers_200_1000: "200 - 1,000",
  enterpriseUsers_1000_plus: "1,000+",
  pricingContactUs: "Contact us",
  pricingAdditionalInfo: "Silver and Gold are cancellable monthly after the minimum term of 6 months.",
  pricingGoldEnterprise: "Gold and Enterprise provide access to all premium features.",
  pricingDiamondAdmin: "Diamond Tier is exclusive for admins and provides all features.",
  pricingQuestions: "Do you have questions about the subscriptions? Contact us via",
  pricingSupportEmail: "support@recaphorizon.nl",
  pricingAIModels: "AI Technology",
  pricingAIModelFree: "Optimized AI models for cost-effective processing",
  pricingAIModelSilver: "Enhanced AI models for improved quality",
  pricingAIModelGold: "Advanced AI models with experimental features",
  pricingAIModelDiamond: "Premium AI models for highest quality results",
  pricingAIModelEnterprise: "Enterprise-grade AI models for maximum performance",
  pricingFreeFor4Weeks: "Free for 4 weeks",
  pricingTrialExpired: "Trial period expired",
  pricingTrialEndsOn: "Trial ends on {{date}} ({{days}} days left)",
  pricingShowMeFeature: "Show Me / Teach Me, your related information",
  pricingIdeaBuilderFeature: "Idea Builder, structured ideation workflow",

  // Upgrade modal translations
  upgradeSubscription: "Upgrade Your Subscription",
  upgradeSubscriptionDesc: "Upgrade your subscription to unlock more functionality and increase your limits.",
  premiumFeaturesFromGold: "Premium Features from Gold Tier",
  chatWithTranscriptFeature: "Chat with transcript",
  powerpointExportFeature: "PowerPoint export",
  businessCaseGeneratorFeature: "Business case generator",
  silverTier: "Silver",
  goldTier: "Gold",

  subscriptionCancellable: "All subscriptions are cancellable monthly after 6 months.",
  supportContact: "Have questions? Contact us via support@recaphorizon.nl",
  later: "Later",
  silverPrice: "€5/month",
  goldPrice: "€8/month",
  silverFeature1: "• 60 minutes per session",
  silverFeature2: "• 3 sessions per day",
  silverFeature3: "• 15,000 characters transcript",
  silverFeature4: "• All file types",
  silverFeature5: "• Basic functionalities",
  goldFeature1: "• 90 minutes per session",
  goldFeature2: "• Unlimited sessions",
  goldFeature3: "• 30,000 characters transcript",
  goldFeature4: "• All file types",
  goldFeature5: "• All premium functionalities",
  moveUp: "Move up",
  moveDown: "Move down",
  sessionExpiringSoon: "Session Expiring Soon",
  sessionWillExpireIn: "Your session will expire in {timeRemaining}. Would you like to extend your session?",
  extending: "Extending...",
  extendSession: "Extend Session",

  // Settings page translations
  settingsTitle: "⚙️ Settings",
  settingsCurrentTier: "Current tier:",
  settingsViewPricing: "view pricing",
  settingsTokensThisMonth: "Tokens this month:",
  settingsTokensToday: "Tokens today:",
  settingsSessionsThisMonth: "Sessions this month:",
  tokenUsageUsed: "used",
  tokenUsageRemaining: "remaining",
  tokenUsageWarningMonthly: "You are approaching your monthly token limit. Consider upgrading to a higher tier.",
  tokenUsageWarningDaily: "You are approaching your daily token limit. Try again tomorrow or upgrade to a higher tier.",
  settingsAnonymizationRules: "Anonymization Rules",
  settingsAddRule: "+ Add Rule",
  settingsAnonymizationAutoText: "to automatically anonymize text",
  settingsOriginalText: "Original Text",
  settingsOriginalTextPlaceholder: "e.g. Jan, Company, etc.",
  settingsReplacementText: "Replacement Text",
  settingsReplacementTextPlaceholder: "e.g. employee, Company, etc.",
  settingsExactMatch: "Exact match",
  settingsCaseSensitive: "Case sensitive",
  settingsDeleteRule: "Delete",
  settingsNoRules: "No anonymization rules set. Set the rules first via the settings screen.",
  settingsApiKeyFound: "API key found in database. If something fails, refresh the key in Settings.",

  // Subscription service error messages
  fileUploadNotAllowed: "Your current subscription only supports {allowedTypes} files. Upgrade to Silver or Gold to upload other file types.",
  transcriptTooLong: "Your transcript is {currentLength} characters long, but your current subscription supports a maximum of {maxLength} characters. Upgrade to a higher tier for longer transcripts.",
  
  // Email upload error messages

  invalidEmailFileType: "Invalid file type. Only EML and MSG files or direct Outlook email drag are supported.",
  emailExtractionFailed: "Could not extract text from the email file. The file may be corrupted or empty.",
  outlookDragSupported: "You can drag emails directly from Outlook or upload .eml and .msg files.",
  
  // Upgrade messages
  upgradeDurationMessage: "You have reached the maximum recording time of {maxDuration} minutes for this session. Upgrade to Silver (60 min) or Gold (90 min) for longer sessions.",
  upgradeSessionsMessage: "You have reached your daily limit of {maxSessions} session(s). Upgrade to Silver (3 sessions) or Gold (unlimited) for more sessions.",
  upgradeFileTypeMessage: "Your current subscription only supports TXT files. Upgrade to Silver or Gold to upload all file types.",
  upgradeTranscriptLengthMessage: "Your transcript is too long for your current subscription. Upgrade to Silver (15,000 characters), Gold (30,000 characters) or Enterprise (50,000 characters) for longer transcripts.",
  upgradeGeneralMessage: "Upgrade your subscription for more features.",
  
  // Feature upgrade messages
  chatFeatureUpgrade: "Chat functionality is available from Gold tier. Upgrade your subscription to chat with your transcript.",

  exportPptFeatureUpgrade: "PowerPoint export is available from Gold tier. Upgrade your subscription to export presentations.",
  businessCaseFeatureUpgrade: "Business case generation is available from Gold tier. Upgrade your subscription to generate business cases.",
  webExpertFeatureUpgrade: "WebExpert option is available from Gold tier. Upgrade your subscription to use advanced AI analysis for web pages.",
  multipleUrlsFeatureUpgrade: "Importing multiple URLs is available from Gold tier. Upgrade your subscription to process multiple web pages at once.",
  webPageFeatureUpgrade: "Web page import is available from Gold tier. Upgrade your subscription to import text directly from web pages.",
  thinkingPartnerFeatureUpgrade: "Thinking Partner is available from Gold tier. Upgrade your subscription to access structured thinking guidance.",
  showMeFeatureUpgrade: "Show Me is available from Gold tier. Upgrade your subscription to access guided topic exploration.",
  ideaBuilderFeatureUpgrade: "Idea Builder is available from Gold tier. Upgrade your subscription to access guided ideation.",
  defaultFeatureUpgrade: "This functionality is available from Gold tier. Upgrade your subscription for more possibilities.",
  multiUploadFeatureUpgrade: "Uploading multiple files is available for Gold, Diamond and Enterprise. Upgrade your subscription to use this feature.",
  aiDiscussionFeatureUpgrade: "AI Discussion is available from Gold tier. Upgrade your subscription to use multi‑agent discussions.",
  thinkingPartnerAccessRestricted: "Thinking Partner is available from Gold tier. Please upgrade to access this feature.",
  
  // Anonymization tips and buttons
  settingsAnonymizationTips: "💡 Anonymization Tips",
  settingsTipExact: "• Exact: Replaces only complete words (e.g. \"Jan\" → \"employee\")",
  settingsTipFuzzy: "• Fuzzy: Intelligent name recognition - finds names that match (e.g. \"Jan\" finds \"Jan\", \"Janneke\", \"Jan-Peter\")",
  settingsTipEmployeeNumbering: "• Employee numbering: Use \"employee\" as replacement text, numbers are automatically added",
  settingsTipRuleOrder: "• Rule order: Rules are applied from top to bottom",
  settingsTipSafe: "• Safe: Fuzzy matching NEVER replaces parts of other words (e.g. \"jan\" in \"january\" remains intact)",
  settingsCancel: "Cancel",
  settingsSave: "Save",
  settingsClose: "Close",
  anonymizationRulesSavedTitle: "Settings saved",
  anonymizationRulesSavedDesc: "Your anonymization settings have been saved successfully.",
  
  // Loading text
  
  // Login text
  login: "Login",
  backToLogin: "Back to login",
  loginFailed: "Login failed: {error}",
  loginLeftProminent: "Login (left, prominent)",
  appControls: "Only visible after login",
  
  // Storytelling questions popup
  storytellingQuestionsTitle: "Storytelling Options",
  storytellingQuestionsSubtitle: "Customize your story by answering these optional questions:",
  
  // Target audience
  storytellingTargetAudience: "Target Audience",
  storytellingTargetAudienceQuestion: "Who is this story intended for?",
  storytellingTargetAudiencePlaceholder: "Select target audience or type custom...",
  storytellingTargetAudienceOptions: {
    internalTeam: "Internal team members",
    management: "Senior management",
    customers: "Potential customers/partners",
    investors: "Investors",
    newEmployees: "New employees",
    generalPublic: "Broader public",
    academics: "Academics/researchers",
    competitors: "Competitors",
    localCommunity: "Local community",
    alumni: "Alumni or former employees",
    internationalStakeholders: "International stakeholders",
    specificInterestGroups: "Specific interest groups"
  },
  
  // Main goal
  storytellingMainGoal: "Main Goal",
  storytellingMainGoalQuestion: "What is the main goal of this story?",
  storytellingMainGoalPlaceholder: "Select main goal or type custom...",
  storytellingMainGoalOptions: {
    inform: "Inform",
    motivate: "Motivate/inspire",
    convince: "Convince",
    celebrate: "Celebrate",
    explain: "Explain",
    educate: "Educate",
    warn: "Warn",
    engage: "Engage",
    promote: "Promote",
    reflect: "Reflect",
    predict: "Predict",
    commemorate: "Commemorate"
  },
  
  // Tone and style
  storytellingToneStyle: "Tone and Style",
  storytellingToneStyleQuestion: "What tone or style should the story have?",
  storytellingToneStylePlaceholder: "Select tone or type custom...",
  storytellingToneStyleOptions: {
    formal: "Formal and factual",
    informal: "Informal and motivating",
    inspiring: "Inspiring and visionary",
    critical: "Critical and analytical",
    humorous: "Humorous",
    empathetic: "Empathetic and supportive",
    neutral: "Neutral and objective",
    dynamic: "Dynamic and energetic",
    warm: "Warm and personal",
    technical: "Technical and detailed",
    narrative: "Narrative and storytelling",
    cultureSensitive: "Culture-sensitive and adaptive"
  },
  
  // Length
  storytellingLength: "Desired Length",
  storytellingLengthQuestion: "How long should the story be approximately?",
  storytellingLengthPlaceholder: "Select length",
  storytellingLengthOptions: {
    short: "Short (300-500 words)",
    medium: "Medium (500-800 words)", 
    long: "Long (800-1200 words)"
  },
  
  // General
  storytellingOptional: "All questions are optional",
  storytellingGenerate: "Generate Story",
  storytellingCancel: "Cancel",
  help: "Help",
  
  // Explain functionality
  explain: "Explain",
  explainOptional: "All options are optional",
  explainComplexityLevel: "Complexity Level / Target Audience",
  explainComplexityBeginner: "Beginner (basic concepts)",
  explainComplexityGeneral: "General public (clear language)",
  explainComplexityTeam: "Team members (specific context)",
  explainComplexityExpert: "Expert (technical/deep)",
  explainComplexityChild: "5-Year-Old (extremely simple)",
  explainComplexityChildEn: "5-Year-Old (extremely simple)",
  explainComplexityHighSchool: "High school, 15-year-old",
  explainFocusArea: "Focus of Explanation",
  explainFocusDecisions: "Main decisions",
  explainFocusConcepts: "Complex concepts",
  explainFocusActions: "Action points",
  explainFocusProblems: "Discussed problems",
  explainFocusSolutions: "Proposed solutions",
  explainFocusOverview: "General overview",
  explainFormat: "Desired Format",
  explainFormatParagraph: "Short paragraph",
  explainFormatBullets: "Bullet points",
  explainFormatQa: "Question & Answer style",
  explainFormatStepByStep: "Step-by-step guide",
  explainGenerate: "Generate Explanation",
  
  // Teach Me feature
  teachMe: "Teach me",
  teachMeTitle: "Teach me",
  teachMeDescription: "Discover topics from your transcript and learn in your own way",
  teachMeGeneratingTopics: "Generating topics...",
  teachMeSelectTopic: "Select a topic to learn about",
  teachMeSelectMethod: "Choose your learning method",
  teachMeMethod: "Learning method",
  teachMeTopicsFound: "topics found",
  teachMeNoTopics: "No topics found in this transcript",
  teachMeGenerateContent: "Generating content...",
  teachMeContentGenerated: "Content generated",
  teachMeBackToTopics: "Back to topics",
  teachMeBackToMethods: "Back to learning methods",
  teachMeTryAgain: "Try again",
  teachMeRegenerateTopics: "Regenerate topics",
  teachMeSelectedTopic: "Selected topic",
  selectedTopic: "Selected topic",
  teachMeGeneratingContent: "Generating content...",
  
  // Learning methods
  teachMeMethodUseAnalogies: "Use analogies",
  teachMeMethodBreakMyths: "Break myths",
  teachMeMethodRelateToRealLife: "Relate to real life",
  teachMeMethodTeachItBack: "Teach it back",
  teachMeMethodAskCriticalWhy: "Ask the critical 'why'",
  teachMeMethodSimulateOrPractice: "Simulate or practice",
  teachMeMethodTurnIntoStory: "Turn it into a story",
  teachMeMethodChallengeIt: "Challenge it",
  teachMeMethodPrioritizeLearning: "Prioritize learning",
  teachMeMethodFindTheGaps: "Find the gaps",
  teachMeMethodIdentifyCorePrinciples: "Identify Core Principles",
  teachMeMethodExplainEvolutionHistory: "Explain the Evolution/History",
  teachMeMethodPredictFutureImplications: "Predict Future Implications",
  teachMeMethodIdentifyStakeholdersUsers: "Identify Stakeholders/Users",
  teachMeMethodExploreEthicalConsiderations: "Explore Ethical Considerations",
  teachMeMethodSummarizeKeyDebatesControversies: "Summarize Key Debates/Controversies",
  teachMeMethodSummarizeKeyTheoriesModels: "Summarize Key Theories/Models",
  teachMeMethodDiscussLimitationsConstraints: "Discuss Limitations/Constraints",
  teachMeMethodDefineKeyTerminology: "Define Key Terminology",
  teachMeMethodCreateLearningExercises: "Create Learning Exercises",
  
  // Method descriptions
  teachMeMethodUseAnalogiesDesc: "Compare the topic to something familiar to make it easier to understand",
  teachMeMethodBreakMythsDesc: "Identify and correct common misconceptions about the topic",
  teachMeMethodRelateToRealLifeDesc: "Connect the topic to daily life and practical situations",
  teachMeMethodTeachItBackDesc: "Explain how you would teach this to someone who knows nothing about it",
  teachMeMethodAskCriticalWhyDesc: "Explore why the topic matters and what its key implications are",
  teachMeMethodSimulateOrPracticeDesc: "Provide examples and exercises to apply the topic right now",
  teachMeMethodTurnIntoStoryDesc: "Create a story where the topic plays a role in the narrative",
  teachMeMethodChallengeItDesc: "Identify common mistakes people make and how to avoid them",
  teachMeMethodPrioritizeLearningDesc: "Focus on the 2-3 most important concepts for a strong foundation",
  teachMeMethodFindTheGapsDesc: "Discover overlooked aspects that are crucial to understanding",
  teachMeMethodIdentifyCorePrinciplesDesc: "List the fundamental principles and laws that govern the topic",
  teachMeMethodExplainEvolutionHistoryDesc: "Describe the historical development and key milestones",
  teachMeMethodPredictFutureImplicationsDesc: "Predict potential future developments and challenges",
  teachMeMethodIdentifyStakeholdersUsersDesc: "Identify who benefits from or is affected by the topic",
  teachMeMethodExploreEthicalConsiderationsDesc: "Explore ethical dilemmas and how they might be addressed",
  teachMeMethodSummarizeKeyDebatesControversiesDesc: "Summarize important discussions and different viewpoints",
  teachMeMethodSummarizeKeyTheoriesModelsDesc: "Provide an overview of important theories and frameworks",
  teachMeMethodDiscussLimitationsConstraintsDesc: "Discuss known limitations and boundaries of applicability",
  teachMeMethodDefineKeyTerminologyDesc: "Define 3-5 essential terms critical to understanding the topic",
  teachMeMethodCreateLearningExercisesDesc: "Design practical exercises to better understand the topic",
  
  // Show Me feature
  showMe: "Show me",
  showMeTitle: "Show me",
  showMeDescription: "Visualize your content with interactive diagrams, charts and visual representations",
  showMeGeneratingVisuals: "Generating visual elements...",
  showMeSelectVisualization: "Select a visualization type",
  showMeVisualizationType: "Visualization type",
  showMeVisualizationsFound: "visualizations available",
  showMeNoVisualizations: "No suitable visualizations found for this transcript",
  showMeGenerateContent: "Generating visualization...",
  showMeContentGenerated: "Visualization generated",
  showMeBackToTypes: "Back to visualization types",
  showMeTryAgain: "Try again",
  showMeRegenerateVisuals: "Regenerate visualizations",
  showMeSelectedType: "Selected visualization type",
  showMeGeneratingContent: "Generating visualization...",
  
  // Visualization types
  showMeTypeFlowchart: "Flowchart",
  showMeTypeTimeline: "Timeline",
  showMeTypeProcessDiagram: "Process diagram",
  showMeTypeOrganizationChart: "Organization chart",
  showMeTypeConceptMap: "Concept map",
  showMeTypeComparisonChart: "Comparison chart",
  showMeTypeDecisionTree: "Decision tree",
  showMeTypeSystemDiagram: "System diagram",
  showMeTypeDataVisualization: "Data visualization",
  showMeTypeInfographic: "Infographic",
  
  // Visualization descriptions
  showMeTypeFlowchartDesc: "Show processes and workflows with clear steps and decision points",
  showMeTypeTimelineDesc: "Visualize events and milestones in chronological order",
  showMeTypeProcessDiagramDesc: "Illustrate complex processes with inputs, outputs and transformations",
  showMeTypeOrganizationChartDesc: "Show hierarchical structures and relationships between entities",
  showMeTypeConceptMapDesc: "Connect related concepts and ideas visually",
  showMeTypeComparisonChartDesc: "Compare different options, products or concepts side by side",
  showMeTypeDecisionTreeDesc: "Visualize decision-making processes with different outcomes",
  showMeTypeSystemDiagramDesc: "Show how different components of a system work together",
  showMeTypeDataVisualizationDesc: "Transform numerical data into graphs and charts",
  showMeTypeInfographicDesc: "Combine text and visual elements for a comprehensive overview",
  
  // Web page functionality
  webPageTitle: "Import Web Page",
  webPageUrlPlaceholder: "https://example.com/article",
  processWebPage: "Process Web Page",
  webPageHelpTitle: "Web Page Help",
  webPageHelpDescription: "Learn how to import web pages into RecapHorizon:",
  webPageHelpStep1: "Copy the URL of the web page you want to analyze",
  webPageHelpStep2: "Paste the URL in the input field above",
  webPageHelpStep3: "Click 'Process Web Page' to import the text",
  webPageHelpStep4: "RecapHorizon automatically extracts all text and prepares it for analysis",
  useWebExpertOption: "Use WebExpert Option",
  webExpertDescription: "Process multiple URLs with advanced AI analysis",
  multipleUrlsPlaceholder: "Enter URL #{number}",
  addMoreUrls: "Add URL",
  removeUrl: "Remove",
  webPageWebExpertSuccess: "Successfully processed web pages with WebExpert",
  webPageStandardSuccess: "Successfully processed web page",
  firecrawlApiError: "Error with Firecrawl API",
  firecrawlApiKeyError: "Firecrawl API key is missing",
  goldAndDiamondOnly: "Gold & Diamond",
  goldDiamondEnterpriseOnly: "Gold, Diamond & Enterprise",
  webExpertUrlsNote: "WebExpert allows analyzing multiple URLs simultaneously for comprehensive insights.",
  analyzeWithWebExpert: "Analyze with WebExpert",
  webExpertUrlsLabel: "Web Page URLs for WebExpert Analysis",
  faqWebExpert: "What is the WebExpert option for web page imports?",
  faqWebExpertAnswer: "The WebExpert option is an advanced feature available for Gold, Diamond, and Enterprise tier users that uses a far more sophisticated web page import method with 375% higher success rate compared to standard import. WebExpert not only allows processing multiple URLs simultaneously but also employs advanced AI analysis techniques for superior content extraction and analysis. This ensures more reliable and comprehensive web page processing for both single and multiple page imports.",
  
  // Mobile Audio Help
  mobileAudioHelpTitle: "Phone Audio Recording (Improvements)",
  mobileAudioHelpSubtitle: "Why can recordings be interrupted by your phone?",
  mobileAudioHelpIntro: "Your phone can interrupt recordings when an incoming call comes in, even if you don't answer it. This is because iOS and Android temporarily give priority to the call for microphone access, which can affect RecapHorizon's functionality. To prevent this, we recommend two solutions. Below you'll find instructions for both iOS and Android. Choose the option that best fits your situation to let your recordings proceed uninterrupted.",
  mobileAudioHelpOption1Title: "Option 1: Enable Airplane Mode – Avoid interruptions",
  mobileAudioHelpOption1iOS: "For iOS: Go to Settings > Airplane Mode and turn it on. Keep Wi-Fi on if internet access is required.",
  mobileAudioHelpOption1Android: "For Android: Open the Quick Menu by swiping down, tap the airplane mode icon. Enable Wi-Fi if needed for connectivity.",
  mobileAudioHelpOption1Explanation: "Explanation: This setting blocks all incoming calls, allowing your recording to continue uninterrupted. Keep in mind that you will be temporarily unreachable for phone calls.",
  mobileAudioHelpOption2Title: "Option 2: Silence incoming calls – Stay partially reachable",
  mobileAudioHelpOption2iOS: "For iOS: Go to Settings > Focus > Do Not Disturb and activate this mode. Set up a schedule for planned recordings through the settings.",
  mobileAudioHelpOption2Android: "For Android: Open the Quick Menu by swiping down, tap Do Not Disturb. Configure a rule via Settings > Sounds & vibration > Do not disturb for fixed times.",
  mobileAudioHelpOption2Explanation: "Explanation: This mode suppresses calls while you stay online for other notifications. This is suitable if you want to remain reachable for non-phone communication.",
  mobileAudioHelpExtraTip: "Test your chosen setting before starting an important recording. This way you can be sure everything works as expected.",
  mobileAudioHelpClose: "Got it",
  
  // Image Upload FAQ
  faqImageUpload: "Can I upload images for AI analysis?",
  faqImageUploadAnswer: "Yes! Gold, Diamond, and Enterprise tier users can upload images for AI-powered analysis. This feature allows you to analyze photos, documents, screenshots, and other visual content using advanced AI technology.",
  faqImageFormats: "What image formats are supported?",
  faqImageFormatsAnswer: "RecapHorizon supports the following image formats: JPG, JPEG, PNG, WEBP, and GIF. Simply click the image upload button and select your file from your device.",
  faqImageAnalysis: "What can the AI analyze in my images?",
  faqImageAnalysisAnswer: "Our AI can perform comprehensive image analysis including: object recognition and identification, optical character recognition (OCR) for text extraction, context analysis and scene understanding, detailed descriptions of visual elements, and intelligent insights based on the image content.",
  
  // Audio Import FAQ
  faqAudioImport: "Can I upload audio files to start an analysis?",
  faqAudioImportAnswer: "Yes! You can upload existing audio files (MP3, MP4, WebM, WAV) to start your analysis. Simply select the 'Audio Upload' option when starting a new session, choose your audio file, and RecapHorizon will automatically transcribe it and generate comprehensive AI analysis including summaries, key insights, action items, and more.",
  
  // Teach Me FAQ
  faqTeachMe: "What is the 'Teach Me' feature?",
  faqTeachMeAnswer: "The 'Teach Me' feature analyzes your content and automatically generates learning topics with different teaching methods. You can choose from 20 different learning approaches like analogies, examples, step-by-step explanations, and more. The AI adapts the explanation based on the chosen method and makes complex topics more understandable.",
  
  // Social Post FAQ
  faqSocialPost: "How does the Social Post feature work?",
  faqSocialPostAnswer: "The Social Post feature automatically generates social media posts based on your content. You can choose from different platforms (LinkedIn, Facebook, Instagram, X/BlueSky), tones (professional, casual, informative), lengths, and options like hashtags and emoticons. The AI creates multiple posts that you can directly copy and use on your social media channels.",
  
  // Show Me FAQ
  faqShowMe: "What is the 'Show Me' feature?",
  faqShowMeAnswer: "The 'Show Me' feature offers two powerful capabilities: 1) Transforms your content into visual representations like flowcharts, timelines, process diagrams, and infographics. 2) Discovers relevant TED Talks and news articles related to your content. This premium feature is available for Gold, Diamond, and Enterprise users and helps make complex information more understandable through interactive visualizations and related educational content.",
  
  // Show Me Feature Translations (TED Talks & News)
  showMeSelectTopic: "Select a topic",
  showMeGeneratingTopics: "Generating topics...",
  showMeSearchingContent: "Searching content...",
  showMeNoTopics: "No topics available",
  showMeNoResults: "No results found",
  showMeTedTalks: "TED Talks",
  showMeNews: "News",
  showMeWatchVideo: "Watch video",
  showMeReadArticle: "Read article",
  showMeCopyLink: "Copy link",
  showMeViewsCount: "{count} views",
  showMeDuration: "{duration} min",
  showMePublishedDate: "Published on {date}",
  showMeSource: "Source: {source}",
  showMeError: "An error occurred while loading content",
  showMeRetry: "Try again",
  showMeLoadingResults: "Loading results...",
  showMeTopicGenerated: "Topics generated",
  showMeContentFound: "Content found",
  showMeLinkCopied: "Link copied to clipboard",
  showMeAccessRestricted: "This feature is only available for GOLD, Diamond and Enterprise users",
  showMeUpgradePrompt: "Upgrade your subscription to access this feature",
  showMeBackToTopics: "Back to topics",
  showMeNewsArticles: "News Articles",
  showMeRegenerateTopics: "Regenerate topics",
  
  // Pricing page image upload
  pricingImageUpload: "AI Image Analysis (JPG, PNG, WEBP, GIF)",
  pricingEmailUpload: "Email Upload (.msg, .eml files)",
  emailUploadSubscriptionRequired: "Email upload is only available for Gold, Enterprise and Diamond subscriptions.",
  
  // Image upload help modal
  imageUploadHelpTitle: "Image Upload Help",
  imageUploadHelpSubtitle: "How to Upload and Analyze Images",
  imageUploadHelpIntro: "Learn how to upload images and leverage AI analysis to extract insights, text, and detailed descriptions from your visual content.",
  imageUploadHelpFormatsTitle: "Supported Image Formats",
  imageUploadHelpSupportedFormats: "Supported formats:",
  imageUploadHelpFormatsList: "JPG, JPEG, PNG, WEBP, and GIF files are fully supported for upload and analysis.",
  imageUploadHelpFormatsNote: "For best results, use high-quality images with clear text and well-defined objects.",
  imageUploadHelpAITitle: "AI Analysis Capabilities",
  imageUploadHelpObjectRecognition: "Object Recognition",
  imageUploadHelpObjectRecognitionDesc: "Identifies and describes objects, people, animals, and scenes in your images with detailed accuracy.",
  imageUploadHelpOCR: "Text Extraction (OCR)",
  imageUploadHelpOCRDesc: "Extracts and transcribes any text found in images, including handwritten notes, signs, documents, and screenshots.",
  imageUploadHelpContextAnalysis: "Context Analysis",
  imageUploadHelpContextAnalysisDesc: "Provides intelligent insights about the image context, relationships between elements, and overall meaning.",
  imageUploadHelpAINote: "Available for Gold, Diamond, and Enterprise tier users only.",
  imageUploadHelpUsageTitle: "How to Use Image Upload",
  imageUploadHelpStep1: "Select Image Source",
  imageUploadHelpStep1Desc: "Choose to upload from your device's file explorer or take a new photo with your camera.",
  imageUploadHelpStep2: "Upload Your Image",
  imageUploadHelpStep2Desc: "Select your image file and wait for it to upload. The system will automatically validate the format.",
  imageUploadHelpStep3: "AI Analysis",
  imageUploadHelpStep3Desc: "Our AI will analyze your image and generate a detailed transcript with insights, extracted text, and descriptions.",
  imageUploadHelpTipTitle: "Pro Tip:",
  imageUploadHelpTipDesc: "For best OCR results, ensure text in images is clear and well-lit. For object recognition, use images with good lighting and clear subjects.",
  imageUploadHelpClose: "Got it",
  
  // Ask the Expert functionality
  sessionOptionExpert: "Ask the Expert",
  sessionOptionExpertDesc: "Chat with an AI expert about your idea and RecapHorizon will then provide in-depth insights and analyses",
  premiumOnly: "Premium Feature",
  
  // Expert Help Modal translations
  expertHelpTitle: "Ask the Expert - How it Works",
  expertHelpIntroTitle: "What is Ask the Expert?",
  expertHelpIntro: "With Ask the Expert you can have a conversation with a specialized AI expert on a specific topic. You choose a topic, expert role, and industry, after which you can have a personalized conversation.",
  expertHelpHowTitle: "How does it work?",
  expertHelpStep1Title: "Choose your configuration",
  expertHelpStep1: "Select a topic, expert role, and industry that match your question.",
  expertHelpStep2Title: "Start the conversation",
  expertHelpStep2: "Begin chatting with your chosen expert. Ask questions and get specialized answers.",
  expertHelpStep3Title: "Analyze the result",
  expertHelpStep3: "After the conversation, you can analyze the complete chat history for further processing.",
  expertHelpSubscriptionTitle: "Subscription required",
  expertHelpSubscription: "The Ask the Expert functionality is available for Gold, Diamond, and Enterprise subscriptions. Upgrade your account to access this advanced feature.",
  specialsFeatureUpgrade: "The Specials functionality is available for Gold, Diamond, and Enterprise subscriptions. Upgrade your account to access these advanced AI-powered prompts.",
  expertHelpTipsTitle: "Tips for best results",
  expertHelpTip1: "Be specific in your questions for more targeted answers",
  expertHelpTip2: "Choose an expert role that fits the type of advice you need",
  expertHelpTip3: "Select the right industry for context-specific information",
  expertHelpTip4: "Use the follow-up question suggestions to deepen the conversation",
  expertHelpClose: "Got it",
  
  // Notion Help Modal translations
  notionHelpTitle: "Notion Integration Help",

  // Remaining miscellaneous keys
  intro: "Introduction",
  outro: "Conclusion",
  maand: "month",
  none: "None",
  noSubject: "No Subject",
  noEmailAddressesFound: "No email addresses found",
  conclusions: "Conclusions",
  compressingAudio: "Compressing audio...",
  copyAll: "Copy All",
  copyBody: "Copy Body",
  deeperAspectQuestion: "What specific aspect would you like to explore further?",
  errorCreatingUserDocument: "Error creating user document",
  errorGeneratingAnswer: "Error generating answer",
  executeSuggestion: "Execute Suggestion",
  failedToLoadStoredSession: "Failed to load stored session",
  failedToLoadStoredSessions: "Failed to load stored sessions",
  failedToRemoveStoredSession: "Failed to remove stored session",
  failedToStoreSession: "Failed to store session",
  firebaseConfigValidationFailed: "Firebase configuration validation failed",
  firebaseValidationError: "Firebase validation error",
  generateMailTo: "Generate Email Link",
  noOptionsFound: "No options found",
  openMailClient: "Open Email Client",
  notionHelpIntroTitle: "What is Notion Integration?",
  notionHelpIntro: "Connect your Notion workspace to RecapHorizon and analyze your Notion pages directly. Import content from your Notion pages for comprehensive analysis and insights.",
  notionHelpHowItWorksTitle: "How it works",
  notionHelpStep1Title: "Connect your Notion",
  notionHelpStep1: "Authorize RecapHorizon to access your Notion workspace securely through OAuth.",
  notionHelpStep2Title: "Search and select pages",
  notionHelpStep2: "Browse and search through your Notion pages to find the content you want to analyze.",
  notionHelpStep3Title: "Import and analyze",
  notionHelpStep3: "Import the selected pages and use RecapHorizon's powerful analysis tools to gain insights.",
  notionHelpSecurityTitle: "Security & Privacy",
  notionHelpSecurity: "Your Notion data is handled with the highest security standards. We only access the pages you explicitly select and never store your Notion content permanently.",
  notionHelpTipsTitle: "Tips for best results",
  notionHelpTip1: "Ensure your Notion pages have clear structure and headings for better analysis",
  notionHelpTip2: "Select pages with substantial content for more meaningful insights",
  notionHelpTip3: "Use descriptive page titles to easily identify content during import",
  notionHelpAvailabilityTitle: "Availability",
  notionHelpAvailability: "Notion integration is available for Diamond subscribers. Upgrade your account to access this powerful feature.",
  notionHelpClose: "Got it",
  
  // Expert Configuration Modal translations
  expertConfigTitle: "Ask the Expert: Configure your expert",
  expertTopicLabel: "What would you like to discuss? (Select a Topic)",
  expertTopicPlaceholder: "Select a topic...",
  expertRoleLabel: "Select the role of the AI Expert:",
  expertRolePlaceholder: "Select a role...",
  expertBrancheLabel: "Select the Industry/Field of the idea:",
  expertBranchePlaceholder: "Select an industry/field...",
  expertConfigStart: "Start Chat",
  
  // Expert Dropdown translations
  searchPlaceholder: "Search...",
  
  // Email composition labels
  emailTo: "To",
  emailCC: "CC",
  emailBCC: "BCC",
  emailNA: "N/A",

  // Expert Chat Modal translations
  expertChatTitle: "Ask the Expert Chat",
  expertChatPlaceholder: "Type your question here...",
  suggestedQuestions: "Follow-up Question Suggestion",
  chatCancel: "Cancel Chat",
  toAnalysis: "To Analysis",
  expertInitialMessage: "Hello! I am your {role} specialized in {branche}. I'm ready to help you with questions about \"{topic}\". What would you like to discuss?",
  expertInitialSuggestion: "Can you tell me more about the key aspects of this topic?",
  expertSystemInstruction: "You are an expert {role} specialized in {topic} within the {branche} sector.\n\nYour task is to:\n1. Provide professional and detailed answers in English\n2. Offer specific insights from your expertise in {topic}\n3. Give practical advice relevant to the {branche} sector\n4. Use the transcript context to make targeted analyses\n5. Make concrete recommendations based on best practices in your field\n\n{transcriptContext}\n\nAlways respond in English and from your role as a {role} expert.",
  expertTranscriptContext: "Here is the transcript the user has questions about:\n\n---\n{transcript}\n---\n\nUse this transcript as context for your answers.",
  expertFollowUpPrompt: "You are a helpful assistant that generates a relevant follow-up question based on a chat conversation.\n\nHere is a recent chat conversation between a user and an expert:\n\n{recentMessages}\n\nLast response from the expert:\n{lastResponse}\n\nGenerate one specific follow-up question that the user could ask to dive deeper into the content of this conversation. The question should be directly related to the topics discussed and help the user gain more insight.\n\nReturn only the question, without introduction or explanation.",
  expertVerificationGuideline: "If you cannot verify something, say: \"I cannot verify this.\" or \"I don't have access to that information.\" or \"My knowledge base doesn't contain that.\"",
  expertSystemPromptTemplate: "You are a {role}. Your expertise lies within {branche}. The discussion will be about \"{topic}\".\n\nYour task is to guide and inform the user within the boundaries of your role, industry and the chosen topic. Stick strictly to the delineation of these selections. Do NOT give answers or information about topics that fall outside this specific context. If a question falls outside your expertise, indicate that you cannot answer that within this context.\n\nThe output language should ALWAYS be English.\nYou behave helpfully, professionally and objectively. Keep answers relevant and to-the-point.\n\nAdditional guidelines:\n- Never present generated, derived, speculated or inferred content as fact.\n- {verificationGuideline}\n- Label unverified content at the beginning of a sentence: [Inference] [Speculation] [Unverified]\n- Ask for clarification if information is missing. Don't guess and don't fill in gaps.\n- If a part is unverified, label the entire response.\n- Don't paraphrase or interpret my input unless I ask you to.\n- For claims about LLM behavior (including yourself), add: [Inference] or [Unverified], with a note that it's based on observed patterns.",
  expertChatUser: "User",
  expertChatExpert: "Expert",

  // Expert Configuration Options - 50 Topics
  expertTopics: {
    projectManagement: { name: "Project Management Best Practices", description: "Agile methodologies, stakeholder management, risk mitigation, resource allocation, timeline optimization, and project delivery frameworks for successful outcomes" },
    personalBudgeting: { name: "Personal Budgeting", description: "Financial planning strategies, expense tracking, savings optimization, debt management, investment allocation, and budgeting tools for financial wellness" },
    aiEverydayLife: { name: "AI in Everyday Life", description: "Practical AI applications, smart home automation, productivity tools, AI ethics, privacy considerations, and emerging technologies integration" },
    climateChange: { name: "Climate Change", description: "Environmental science, sustainability practices, carbon footprint reduction, renewable energy adoption, climate adaptation strategies, and policy implications" },
    digitalMarketing: { name: "Digital Marketing Strategies", description: "Multi-channel campaigns, customer acquisition, conversion optimization, marketing automation, analytics interpretation, and ROI measurement" },
    leadershipSkills: { name: "Leadership Skills", description: "Team motivation, strategic vision, decision-making frameworks, emotional intelligence, conflict resolution, and organizational culture development" },
    healthNutrition: { name: "Health and Nutrition", description: "Evidence-based nutrition, meal planning, dietary supplements, fitness integration, health monitoring, and lifestyle optimization strategies" },
    cybersecurity: { name: "Cybersecurity Best Practices", description: "Threat assessment, security frameworks, incident response, data protection, privacy compliance, and security awareness training" },
    remoteWork: { name: "Remote Work Optimization", description: "Virtual collaboration tools, productivity systems, work-life balance, team communication, performance management, and remote culture building" },
    entrepreneurship: { name: "Entrepreneurship and Startups", description: "Business model validation, funding strategies, market entry, scaling operations, innovation management, and startup ecosystem navigation" },
    mentalHealth: { name: "Mental Health", description: "Stress management, mindfulness practices, therapeutic approaches, mental wellness strategies, support systems, and psychological resilience building" },
    sustainableLiving: { name: "Sustainable Living", description: "Eco-friendly practices, waste reduction, sustainable consumption, green technology adoption, environmental impact assessment, and lifestyle changes" },
    financialPlanning: { name: "Financial Planning", description: "Investment strategies, retirement planning, tax optimization, insurance coverage, estate planning, and wealth management principles" },
    careerDevelopment: { name: "Career Development", description: "Skill assessment, professional networking, career transitions, personal branding, performance optimization, and advancement strategies" },
    educationTechnology: { name: "Education Technology", description: "E-learning platforms, digital pedagogy, assessment tools, educational innovation, technology integration, and learning analytics" },
    customerService: { name: "Customer Service Excellence", description: "Customer experience design, service recovery, communication skills, quality metrics, customer retention strategies, and service innovation" },
    timeManagement: { name: "Time Management Techniques", description: "Productivity systems, priority frameworks, workflow optimization, distraction management, goal setting, and efficiency improvement methods" },
    publicSpeaking: { name: "Presentation Skills", description: "Audience engagement, storytelling techniques, visual design, confidence building, persuasion strategies, and communication effectiveness" },
    teamBuilding: { name: "Team Building Strategies", description: "Team dynamics, collaboration frameworks, trust building, conflict resolution, performance optimization, and group facilitation techniques" },
    innovationManagement: { name: "Innovation Management", description: "Creative processes, idea generation, innovation frameworks, technology adoption, change management, and innovation culture development" },
    supplyChain: { name: "Supply Chain Optimization", description: "Logistics efficiency, vendor management, inventory optimization, risk mitigation, technology integration, and global supply chain strategies" },
    dataAnalytics: { name: "Data Analytics Techniques", description: "Statistical analysis, data visualization, predictive modeling, business intelligence, data mining, and analytics-driven decision making" },
    cloudComputing: { name: "Cloud Computing Solutions", description: "Cloud architecture, migration strategies, security considerations, cost optimization, service selection, and cloud governance frameworks" },
    hrManagement: { name: "HR Management Best Practices", description: "Talent acquisition, performance management, employee engagement, organizational development, compliance, and HR technology implementation" },
    salesTechniques: { name: "Sales Techniques", description: "Customer relationship building, sales process optimization, negotiation strategies, pipeline management, closing techniques, and sales technology" },
    qualityAssurance: { name: "Quality Assurance", description: "Quality management systems, testing methodologies, process improvement, compliance standards, quality metrics, and continuous improvement" },
    riskManagement: { name: "Risk Management", description: "Risk assessment frameworks, mitigation strategies, compliance monitoring, crisis management, business continuity, and risk governance" },
    changeManagement: { name: "Change Management", description: "Organizational transformation, stakeholder engagement, communication strategies, resistance management, change implementation, and culture adaptation" },
    businessStrategy: { name: "Business Strategy", description: "Strategic planning, competitive analysis, market positioning, growth strategies, strategic execution, and performance measurement" },
    marketResearch: { name: "Market Research Methods", description: "Research design, data collection, consumer insights, market analysis, competitive intelligence, and research methodology" },
    productDevelopment: { name: "Product Development", description: "Innovation processes, user research, product design, development lifecycle, market validation, and product launch strategies" },
    brandManagement: { name: "Brand Management", description: "Brand strategy, brand positioning, brand equity, brand communication, brand experience, and brand portfolio management" },
    socialMedia: { name: "Social Media Strategies", description: "Platform optimization, content strategy, community management, social advertising, influencer partnerships, and social media analytics" },
    contentMarketing: { name: "Content Marketing", description: "Content strategy, storytelling, content creation, distribution channels, audience engagement, and content performance measurement" },
    seoOptimization: { name: "SEO Optimization", description: "Search engine algorithms, keyword research, on-page optimization, technical SEO, link building, and search performance analytics" },
    emailMarketing: { name: "Email Marketing", description: "Email automation, segmentation strategies, personalization, deliverability optimization, campaign analytics, and customer lifecycle marketing" },
    mobileDevelopment: { name: "Mobile App Development", description: "Mobile platforms, user experience design, app architecture, performance optimization, app store optimization, and mobile security" },
    webDevelopment: { name: "Web Development", description: "Frontend/backend technologies, responsive design, web performance, security practices, development frameworks, and web standards" },
    uxDesign: { name: "UX Design Principles", description: "User research, information architecture, interaction design, usability testing, design thinking, and user-centered design methodologies" },
    uiDesign: { name: "UI Design Best Practices", description: "Visual design, interface patterns, design systems, accessibility, prototyping, and design tool proficiency" },
    agileMethodology: { name: "Agile Methodology", description: "Agile principles, iterative development, team collaboration, continuous improvement, agile frameworks, and agile transformation" },
    scrumFramework: { name: "Scrum Framework", description: "Scrum roles, ceremonies, artifacts, sprint planning, retrospectives, and Scrum Master facilitation techniques" },
    kanbanMethod: { name: "Kanban Method", description: "Visual workflow management, work-in-progress limits, continuous flow, metrics tracking, and Kanban implementation strategies" },
    sixSigma: { name: "Six Sigma Methods", description: "DMAIC methodology, statistical analysis, process improvement, quality metrics, defect reduction, and Six Sigma certification" },
    leanManufacturing: { name: "Lean Manufacturing", description: "Waste elimination, value stream mapping, continuous improvement, lean tools, production optimization, and lean culture development" },
    businessIntelligence: { name: "Business Intelligence", description: "Data warehousing, reporting systems, dashboard design, analytics platforms, data governance, and BI strategy development" },
    artificialIntelligence: { name: "Artificial Intelligence", description: "AI algorithms, machine learning applications, neural networks, AI ethics, implementation strategies, and AI business transformation" },
    machineLearning: { name: "Machine Learning", description: "ML algorithms, model training, data preprocessing, feature engineering, model evaluation, and ML deployment strategies" },
    blockchainTechnology: { name: "Blockchain Technology", description: "Distributed ledger systems, smart contracts, cryptocurrency, blockchain applications, security considerations, and blockchain implementation" },
    iotSolutions: { name: "IoT Solutions", description: "Connected devices, sensor networks, data collection, IoT platforms, edge computing, and IoT security frameworks" },
    augmentedReality: { name: "Augmented Reality", description: "AR development, user experience design, AR applications, hardware considerations, AR content creation, and AR business applications" },
    virtualReality: { name: "Virtual Reality", description: "VR development, immersive experiences, VR hardware, content creation, user interaction design, and VR implementation strategies" },
    robotics: { name: "Robotics", description: "Robotic systems, automation technologies, human-robot interaction, robotics applications, programming, and robotics integration" },
    nanotechnology: { name: "Nanotechnology", description: "Nanomaterials, nanotechnology applications, research methodologies, manufacturing processes, and commercialization strategies" },
    biotechnology: { name: "Biotechnology", description: "Genetic engineering, bioprocessing, pharmaceutical applications, regulatory compliance, research development, and biotech commercialization" },
    renewableEnergy: { name: "Renewable Energy", description: "Solar/wind technologies, energy storage, grid integration, sustainability metrics, policy frameworks, and renewable energy project development" },
    smartCities: { name: "Smart Cities", description: "Urban technology, IoT infrastructure, citizen services, data analytics, sustainability initiatives, and smart city planning" },
    digitalTransformation: { name: "Digital Transformation", description: "Technology adoption, process digitization, organizational change, digital strategy, innovation culture, and transformation management" },
    ecommerce: { name: "E-commerce Strategies", description: "Online marketplace optimization, customer experience, payment systems, logistics integration, conversion optimization, and e-commerce analytics" },
    retailManagement: { name: "Retail Management", description: "Store operations, inventory management, customer service, retail technology, merchandising strategies, and retail analytics" },
    hospitality: { name: "Hospitality Management", description: "Guest experience, service excellence, revenue management, hospitality technology, staff training, and hospitality operations" },
    healthcare: { name: "Healthcare Management", description: "Healthcare operations, patient care optimization, healthcare technology, regulatory compliance, quality improvement, and healthcare analytics" },
    pharmaceutical: { name: "Pharmaceutical Industry", description: "Drug development, clinical trials, regulatory affairs, market access, pharmaceutical manufacturing, and pharmacovigilance" },
    automotive: { name: "Automotive Industry", description: "Vehicle technology, manufacturing processes, supply chain management, automotive innovation, sustainability, and mobility solutions" },
    aerospace: { name: "Aerospace", description: "Aerospace engineering, safety regulations, project management, technology innovation, manufacturing processes, and aerospace applications" },
    construction: { name: "Construction", description: "Project management, construction technology, safety protocols, sustainable building, regulatory compliance, and construction innovation" },
    realEstate: { name: "Real Estate", description: "Property investment, market analysis, real estate technology, property management, valuation methods, and real estate development" },
    insurance: { name: "Insurance", description: "Risk assessment, insurance products, claims management, regulatory compliance, insurance technology, and customer service" },
    banking: { name: "Banking", description: "Banking operations, financial services, regulatory compliance, digital banking, risk management, and customer relationship management" },
    investment: { name: "Investment Strategies", description: "Portfolio management, asset allocation, risk assessment, investment analysis, market research, and investment planning" },
    stockMarket: { name: "Stock Market and Trading", description: "Market analysis, trading strategies, investment research, risk management, portfolio optimization, and market psychology" },
    cryptocurrency: { name: "Cryptocurrency", description: "Digital currencies, blockchain technology, crypto trading, security considerations, regulatory compliance, and crypto investment strategies" },
    forexTrading: { name: "Forex Trading", description: "Currency markets, trading strategies, technical analysis, risk management, market psychology, and forex investment approaches" },
    commodityTrading: { name: "Commodity Trading", description: "Commodity markets, trading strategies, supply/demand analysis, risk management, market fundamentals, and commodity investment" },
    ventureCapital: { name: "Venture Capital", description: "Startup evaluation, investment strategies, due diligence, portfolio management, exit strategies, and venture capital operations" },
    privateEquity: { name: "Private Equity", description: "Investment strategies, company valuation, due diligence, portfolio optimization, exit planning, and private equity operations" },
    mergersAcquisitions: { name: "Mergers and Acquisitions", description: "Deal structuring, due diligence, valuation methods, integration planning, regulatory compliance, and M&A strategy" },
    corporateFinance: { name: "Corporate Finance", description: "Financial planning, capital structure, investment decisions, risk management, financial analysis, and corporate financial strategy" },
    taxation: { name: "Taxation Strategies", description: "Tax planning, compliance requirements, tax optimization, regulatory updates, tax technology, and strategic tax management" },
    auditing: { name: "Auditing", description: "Audit procedures, compliance verification, risk assessment, audit technology, quality assurance, and audit methodology" },
    legalCompliance: { name: "Legal Compliance", description: "Regulatory frameworks, compliance monitoring, legal risk management, policy development, compliance training, and legal technology" },
    intellectualProperty: { name: "Intellectual Property", description: "Patent strategies, trademark protection, copyright management, IP valuation, licensing agreements, and IP portfolio management" },
    contractLaw: { name: "Contract Law", description: "Contract drafting, negotiation strategies, legal compliance, risk mitigation, contract management, and dispute prevention" },
    employmentLaw: { name: "Employment Law", description: "Labor regulations, workplace compliance, employee rights, HR legal issues, employment contracts, and workplace policies" },
    environmentalLaw: { name: "Environmental Law", description: "Environmental regulations, compliance requirements, sustainability law, environmental impact assessment, and green legal frameworks" },
    internationalLaw: { name: "International Law", description: "Cross-border regulations, international treaties, global compliance, international business law, and diplomatic frameworks" },
    disputeResolution: { name: "Dispute Resolution", description: "Conflict resolution strategies, negotiation techniques, alternative dispute resolution, mediation processes, and resolution frameworks" },
    mediation: { name: "Mediation", description: "Mediation techniques, conflict resolution, communication facilitation, agreement structuring, and mediation best practices" },
    arbitration: { name: "Arbitration", description: "Arbitration procedures, dispute resolution, legal frameworks, arbitration strategy, and alternative dispute resolution methods" },
    litigation: { name: "Litigation", description: "Legal proceedings, case strategy, evidence management, court procedures, litigation technology, and legal advocacy" },
    notaryServices: { name: "Notary Services", description: "Document authentication, notarial procedures, legal compliance, notary technology, and notarial best practices" },
    familyLaw: { name: "Family Law", description: "Family legal issues, divorce proceedings, custody matters, family mediation, legal documentation, and family legal strategy" },
    immigrationLaw: { name: "Immigration Law", description: "Immigration procedures, visa applications, legal compliance, immigration strategy, documentation requirements, and immigration advocacy" },
    humanRights: { name: "Human Rights", description: "Human rights frameworks, advocacy strategies, legal protection, international standards, human rights monitoring, and rights-based approaches" }
  },

  // Expert Configuration Options - 25 Roles
  expertRoles: {
    strategicAdvisor: { name: "Strategic Advisor", description: "Long-term vision development, competitive analysis, market positioning, strategic frameworks, business model innovation, and executive decision-making support" },
    wellnessConsultant: { name: "Wellness Consultant", description: "Holistic health assessment, lifestyle optimization, stress management, nutrition planning, fitness integration, and wellness program development" },
    technicalArchitect: { name: "Technical Architect", description: "System design patterns, scalability planning, technology stack selection, integration strategies, performance optimization, and technical governance" },
    financialAnalyst: { name: "Financial Analyst", description: "Financial modeling, investment evaluation, risk assessment, market analysis, valuation methods, and financial forecasting techniques" },
    marketingSpecialist: { name: "Marketing Specialist", description: "Customer segmentation, brand positioning, campaign optimization, digital marketing, content strategy, and marketing analytics interpretation" },
    hrConsultant: { name: "HR Consultant", description: "Talent acquisition strategies, performance management systems, organizational development, employee engagement, compensation design, and HR policy development" },
    legalExpert: { name: "Legal Expert", description: "Legal risk assessment, compliance frameworks, contract negotiation, regulatory interpretation, dispute resolution, and legal strategy development" },
    healthcareProfessional: { name: "Healthcare Professional", description: "Clinical assessment, treatment protocols, patient care optimization, healthcare technology, medical ethics, and evidence-based practice implementation" },
    educationSpecialist: { name: "Education Specialist", description: "Curriculum development, learning methodologies, educational technology, assessment strategies, pedagogical approaches, and training program design" },
    technologyConsultant: { name: "Technology Consultant", description: "Digital transformation, technology roadmaps, system integration, IT strategy, emerging technology adoption, and technology vendor evaluation" },
    businessCoach: { name: "Business Coach", description: "Performance improvement, goal setting, accountability frameworks, skill development, business strategy coaching, and leadership mentoring" },
    salesExpert: { name: "Sales Expert", description: "Sales process optimization, customer relationship management, negotiation strategies, sales team development, pipeline management, and revenue growth tactics" },
    operationsManager: { name: "Operations Manager", description: "Process optimization, workflow design, resource allocation, quality management, operational efficiency, and continuous improvement methodologies" },
    projectManager: { name: "Project Manager", description: "Project planning methodologies, stakeholder management, risk mitigation, resource coordination, timeline optimization, and project delivery frameworks" },
    qualityAssuranceExpert: { name: "Quality Assurance Expert", description: "Quality management systems, testing methodologies, process improvement, compliance standards, quality metrics, and continuous quality enhancement" },
    riskManagementSpecialist: { name: "Risk Management Specialist", description: "Risk assessment frameworks, mitigation strategies, compliance monitoring, crisis management, business continuity planning, and risk governance" },
    changeManagementConsultant: { name: "Change Management Consultant", description: "Organizational transformation, stakeholder engagement, communication strategies, resistance management, change implementation, and culture adaptation" },
    innovationSpecialist: { name: "Innovation Specialist", description: "Innovation frameworks, creative processes, technology scouting, idea generation, innovation culture development, and innovation portfolio management" },
    dataScientist: { name: "Data Scientist", description: "Statistical analysis, machine learning algorithms, data visualization, predictive modeling, data mining, and analytics-driven insights generation" },
    cybersecurityExpert: { name: "Cybersecurity Expert", description: "Security frameworks, threat assessment, incident response, vulnerability management, security awareness training, and cybersecurity governance" },
    sustainabilityConsultant: { name: "Sustainability Consultant", description: "Environmental impact assessment, sustainability strategies, carbon footprint reduction, ESG frameworks, sustainable business practices, and green technology adoption" },
    leadershipCoach: { name: "Leadership Coach", description: "Leadership development, emotional intelligence, team dynamics, executive presence, decision-making frameworks, and organizational culture building" },
    communicationSpecialist: { name: "Communication Specialist", description: "Communication strategies, stakeholder engagement, message development, crisis communication, internal communication, and brand communication" },
    researchAnalyst: { name: "Research Analyst", description: "Research methodologies, data collection, market intelligence, competitive analysis, trend identification, and research-based recommendations" },
    policyAdvisor: { name: "Policy Advisor", description: "Policy analysis, regulatory frameworks, stakeholder consultation, policy development, implementation strategies, and government relations" }
  },

  // Expert Configuration Options - 50 Branches
  expertBranches: {
    technologySoftware: { name: "Technology & Software", description: "Digital transformation, agile development, cloud migration, cybersecurity challenges, emerging technologies, and software scalability considerations" },
    familyRelationships: { name: "Family & Relationships", description: "Communication dynamics, conflict resolution, emotional intelligence, relationship building, family therapy approaches, and interpersonal skill development" },
    educationTraining: { name: "Education & Training", description: "Learning methodologies, curriculum development, educational technology, skill assessment, training effectiveness, and knowledge transfer strategies" },
    healthcareMedical: { name: "Healthcare & Medical", description: "Patient care protocols, medical technology, healthcare regulations, clinical best practices, health outcomes optimization, and medical ethics" },
    financeBanking: { name: "Finance & Banking", description: "Financial regulations, risk management, digital banking, investment strategies, compliance requirements, and fintech innovation" },
    marketingAdvertising: { name: "Marketing & Advertising", description: "Consumer behavior, brand positioning, digital marketing trends, campaign effectiveness, market segmentation, and advertising ROI optimization" },
    retailConsumerGoods: { name: "Retail & Consumer Goods", description: "Customer experience, inventory management, omnichannel strategies, consumer trends, retail technology, and supply chain optimization" },
    manufacturing: { name: "Manufacturing", description: "Production efficiency, quality control, lean manufacturing, automation technologies, supply chain management, and industrial safety protocols" },
    constructionRealEstate: { name: "Construction & Real Estate", description: "Project management, building regulations, sustainable construction, market analysis, property valuation, and construction technology" },
    transportationLogistics: { name: "Transportation & Logistics", description: "Supply chain optimization, logistics technology, route planning, inventory management, transportation regulations, and delivery efficiency" },
    energyUtilities: { name: "Energy & Utilities", description: "Energy efficiency, renewable technologies, grid management, regulatory compliance, sustainability initiatives, and utility modernization" },
    hospitalityTourism: { name: "Hospitality & Tourism", description: "Guest experience, service excellence, tourism trends, hospitality technology, revenue management, and destination marketing" },
    mediaEntertainment: { name: "Media & Entertainment", description: "Content creation, audience engagement, digital media trends, entertainment technology, content distribution, and media analytics" },
    telecommunications: { name: "Telecommunications", description: "Network infrastructure, communication technologies, 5G implementation, telecom regulations, service optimization, and connectivity solutions" },
    aerospaceDefense: { name: "Aerospace & Defense", description: "Aerospace engineering, defense technologies, safety regulations, project management, innovation processes, and security considerations" },
    automotive: { name: "Automotive", description: "Vehicle technology, electric mobility, autonomous systems, manufacturing processes, automotive regulations, and sustainability initiatives" },
    pharmaceuticals: { name: "Pharmaceuticals", description: "Drug development, clinical trials, regulatory compliance, pharmaceutical manufacturing, market access, and pharmacovigilance" },
    biotechnology: { name: "Biotechnology", description: "Genetic engineering, bioprocessing, research methodologies, regulatory frameworks, commercialization strategies, and biotech innovation" },
    environmentalServices: { name: "Environmental Services", description: "Environmental compliance, sustainability practices, waste management, environmental impact assessment, green technologies, and conservation strategies" },
    legalServices: { name: "Legal Services", description: "Legal practice management, regulatory compliance, client relations, legal technology, case management, and legal research methodologies" },
    consultingServices: { name: "Consulting Services", description: "Client engagement, problem-solving methodologies, industry expertise, project delivery, consulting frameworks, and value proposition development" },
    nonprofit: { name: "Non-profit", description: "Mission-driven operations, fundraising strategies, volunteer management, impact measurement, nonprofit governance, and community engagement" },
    governmentPublicSector: { name: "Government & Public Sector", description: "Public policy, regulatory frameworks, citizen services, government operations, public administration, and civic engagement" },
    educationInstitutions: { name: "Education Institutions", description: "Academic administration, student services, educational quality, institutional governance, research management, and educational innovation" },
    researchDevelopment: { name: "Research & Development", description: "Research methodologies, innovation processes, technology development, intellectual property, research funding, and commercialization strategies" },
    artsCulture: { name: "Arts & Culture", description: "Creative processes, cultural preservation, arts management, audience development, cultural programming, and artistic innovation" },
    sportsRecreation: { name: "Sports & Recreation", description: "Athletic performance, sports management, recreational programming, facility management, sports technology, and wellness promotion" },
    agriculture: { name: "Agriculture", description: "Sustainable farming, agricultural technology, crop management, livestock care, agricultural economics, and food security" },
    fishing: { name: "Fishing", description: "Sustainable fishing practices, marine conservation, fishing technology, fisheries management, aquaculture, and seafood industry" },
    mining: { name: "Mining", description: "Mining operations, environmental compliance, safety protocols, resource extraction, mining technology, and sustainable mining practices" },
    forestry: { name: "Forestry", description: "Forest management, conservation practices, timber industry, sustainable forestry, forest ecology, and environmental stewardship" },
    insurance: { name: "Insurance", description: "Risk assessment, insurance products, claims management, regulatory compliance, insurance technology, and customer service" },
    realEstateServices: { name: "Real Estate Services", description: "Property management, real estate transactions, market analysis, property valuation, real estate technology, and client relations" },
    itServices: { name: "IT Services", description: "IT support, system administration, technology consulting, IT infrastructure, service delivery, and technology solutions" },
    cybersecurityServices: { name: "Cybersecurity Services", description: "Security assessments, threat management, incident response, security consulting, compliance frameworks, and cybersecurity solutions" },
    cloudServices: { name: "Cloud Services", description: "Cloud architecture, migration strategies, cloud security, service optimization, cloud governance, and cloud technology solutions" },
    ecommerce: { name: "E-commerce", description: "Online retail, digital commerce, customer experience, e-commerce technology, payment systems, and online marketplace optimization" },
    digitalMarketing: { name: "Digital Marketing", description: "Online marketing strategies, SEO optimization, digital advertising, content marketing, social media marketing, and digital analytics" },
    socialMedia: { name: "Social Media", description: "Social media strategy, community management, content creation, social media analytics, influencer marketing, and brand engagement" },
    gaming: { name: "Gaming", description: "Game development, gaming technology, player engagement, gaming industry trends, monetization strategies, and gaming community management" },
    vrAr: { name: "VR & AR", description: "Immersive technologies, VR/AR development, user experience design, hardware considerations, content creation, and technology implementation" },
    iot: { name: "Internet of Things", description: "Connected devices, IoT platforms, sensor networks, data analytics, IoT security, and smart technology integration" },
    blockchain: { name: "Blockchain", description: "Distributed ledger technology, cryptocurrency, smart contracts, blockchain applications, security considerations, and blockchain implementation" },
    aiMl: { name: "AI & Machine Learning", description: "Artificial intelligence, machine learning algorithms, data science, AI ethics, model development, and AI implementation strategies" },
    robotics: { name: "Robotics", description: "Robotic systems, automation technology, human-robot interaction, robotics applications, programming, and robotics integration" },
    nanotechnology: { name: "Nanotechnology", description: "Nanomaterials, nanotechnology applications, research methodologies, manufacturing processes, commercialization, and safety considerations" },
    renewableEnergy: { name: "Renewable Energy", description: "Solar/wind technologies, energy storage, grid integration, sustainability metrics, policy frameworks, and renewable energy development" },
    smartCities: { name: "Smart Cities", description: "Urban technology, IoT infrastructure, citizen services, data analytics, sustainability initiatives, and smart city planning" }
  },
  
  // AI Discussion functionality
  aiDiscussion: "AI Discussion",
  aiDiscussionTitle: "AI Discussion - Multi-Agent Simulation",
  aiDiscussionDescription: "Conduct a structured discussion with 4 AI experts about your topic",
  aiDiscussionUpgradeRequired: "Upgrade Required for AI Discussion",
  aiDiscussionAccessDenied: "AI Discussion is only available for Premium and Enterprise users",
  aiDiscussionUpgradeMessage: "AI Discussion is available for Gold, Diamond and Enterprise users. This functionality provides multi-agent discussions with different organizational roles.",
  aiDiscussionAvailableForTiers: "Available for:",
  aiDiscussionUpgradeNote: "Upgrade your subscription to access this advanced AI functionality.",
  
  // AI Discussion Configuration
  aiDiscussionConfigTitle: "Configure your AI Discussion",
  aiDiscussionConfigDescription: "Set up your discussion by selecting a topic, roles, and goal",
  aiDiscussionSelectTopic: "Select a topic",
  aiDiscussionTopicPlaceholder: "Choose a topic for discussion...",
  aiDiscussionSelectGoal: "Select discussion goal",
  aiDiscussionGoalPlaceholder: "Choose the goal of the discussion...",
  aiDiscussionSelectRoles: "Select organizational roles (4 required)",
  aiDiscussionRolesPlaceholder: "Choose 2-4 roles for the discussion...",
  aiDiscussionStartDiscussion: "Start Discussion",
  aiDiscussionConfigurationRequired: "Configuration required to proceed",
  
  // AI Discussion Goals
  aiDiscussionGoals: {
    // Category 1: Vision and Concept Validation
    v1: { name: "V1 - Core Hypothesis Validation", description: "What must absolutely be true for this idea to succeed, and how do we test it quickly?" },
    v2: { name: "V2 - Blue Sky Ideation", description: "Exploring the most ambitious and 'wildest' versions of the idea." },
    v3: { name: "V3 - Minimum Viable Solution (MVP) Definition", description: "What is the smallest, fastest version we can build to deliver value?" },
    v4: { name: "V4 - Scenario Development (Best & Worst Case)", description: "What are the most extreme success and failure scenarios and how do we respond?" },
    v5: { name: "V5 - Core Values and Brand Positioning", description: "What emotion or problem do we primarily solve and how do we translate this to our identity?" },
    
    // Category 2: Lean Finance and Resources
    l1: { name: "L1 - Cost-Smart Implementation Paths", description: "How can we execute this initiative with minimal initial investments (bootstrapping)?" },
    l2: { name: "L2 - Possible Revenue Streams", description: "Brainstorming all possible ways to make money (direct, indirect, data)." },
    l3: { name: "L3 - Efficient Use of Current Resources", description: "How can we deploy existing talents, systems or partners to save costs?" },
    l4: { name: "L4 - Focus on Early Cashflow", description: "Which parts of the idea can generate money fastest to finance the rest?" },
    l5: { name: "L5 - Resource Bartering / Partnerships", description: "What value can we offer partners in exchange for their resources or expertise?" },
    
    // Category 3: Speed and Flexible Execution
    u1: { name: "U1 - Feature Prioritization (Must/Should/Could)", description: "Determining which functions are crucial for the MVP and which are luxury." },
    u2: { name: "U2 - Timeline Acceleration", description: "How can we accelerate the delivery of the first version by 30%?" },
    u3: { name: "U3 - Dependency Elimination", description: "How do we make ourselves less dependent on slow or expensive external factors?" },
    u4: { name: "U4 - Operational Simplicity", description: "How do we design the process so it's scalable with minimal effort?" },
    u5: { name: "U5 - Feedback Loop Design", description: "How do we create the fastest and most effective mechanism to collect and process feedback from early users?" },
    
    // Category 4: People, Talent and Culture
    m1: { name: "M1 - Identifying Critical Talent Gaps", description: "What critical expertise are we currently missing to build this?" },
    m2: { name: "M2 - Attracting Early Adopters (Internal & External)", description: "How do we make the first customers/employees excited and willing to take risks?" },
    m3: { name: "M3 - Small Team Structure", description: "How do we assemble the most effective, compact team for the first 6 months?" },
    m4: { name: "M4 - Stimulating Mindset Change", description: "How do we communicate this idea to reduce organizational resistance and spark curiosity?" },
    m5: { name: "M5 - Fast Decision Framework", description: "How do we accelerate decision-making around this project?" },
    
    // Category 5: Market and Adoption
    a1: { name: "A1 - Creative Solutions for Legal Frameworks", description: "How can we be innovative within existing laws and regulations?" },
    a2: { name: "A2 - Zero Budget Marketing", description: "What guerrilla marketing or viral strategies can we use?" },
    a3: { name: "A3 - Competitive Advantage through Process", description: "What can we do better or differently than competitors that's barely copyable?" },
    a4: { name: "A4 - Early Market Segmentation", description: "Who are the first 100 customers we absolutely want to win and why?" },
    a5: { name: "A5 - Integral Innovation Analysis", description: "How can this idea help every department become more innovative?" }
  },
  
  // AI Discussion Roles
  aiDiscussionRoles: {
    ceo: { name: "CEO", description: "Chief Executive Officer - Strategic leadership and vision" },
    cto: { name: "CTO", description: "Chief Technology Officer - Technical leadership and innovation" },
    cfo: { name: "CFO", description: "Chief Financial Officer - Financial strategy and risk management" },
    cmo: { name: "CMO", description: "Chief Marketing Officer - Marketing strategy and brand management" },
    coo: { name: "COO", description: "Chief Operating Officer - Operational excellence and processes" }
  },
  
  // Multi-Agent Discussion Interface
  aiDiscussionInterface: "Discussion Interface",
  aiDiscussionTurn: "Turn {current} of {total}",
  aiDiscussionWaitingForResponse: "Waiting for response...",
  aiDiscussionGeneratingResponse: "Generating response...",
  aiDiscussionComplete: "Discussion complete",
  aiDiscussionViewReport: "View Report",
  aiDiscussionNewDiscussion: "New Discussion",
  aiDiscussionError: "An error occurred during the discussion",
  aiDiscussionRetry: "Retry",
  
  // Discussion Report
  aiDiscussionReport: "Discussion Report",
  aiDiscussionReportTitle: "AI Discussion Report",
  aiDiscussionReportSummary: "Summary",
  aiDiscussionReportKeyPoints: "Key Points",
  aiDiscussionReportRecommendations: "Recommendations",
  aiDiscussionReportFullTranscript: "Full Transcript",
  aiDiscussionReportExportPDF: "Export as PDF",
  aiDiscussionReportGenerating: "Generating report...",
  aiDiscussionReportError: "Error generating report",
  aiDiscussionReportBackToDiscussion: "Back to Discussion",
  
  // PDF Export
  aiDiscussionPDFTitle: "AI Discussion Report",
  aiDiscussionPDFGeneratedOn: "Generated on",
  aiDiscussionPDFTopic: "Topic",
  aiDiscussionPDFGoal: "Goal",
  aiDiscussionPDFParticipants: "Participants",
  aiDiscussionPDFExporting: "Exporting PDF...",
  aiDiscussionPDFExportSuccess: "PDF exported successfully",
  aiDiscussionPDFExportError: "Error exporting PDF",
  emailTone: {
    formal: {
      label: "Formal",
      description: "Professional and respectful tone"
    },
    friendly: {
      label: "Friendly",
      description: "Warm and approachable tone"
    },
    direct: {
      label: "Direct",
      description: "Clear and to the point"
    },
    persuasive: {
      label: "Persuasive",
      description: "Convincing and compelling tone"
    },
    empathetic: {
      label: "Empathetic",
      description: "Understanding and compassionate tone"
    },
    humorous: {
      label: "Humorous",
      description: "Light-hearted and engaging tone"
    },
    neutral: {
      label: "Neutral",
      description: "Balanced and objective tone"
    }
  },
  
  // Narrative email option
  emailNarrative: "Narrative email text",
  emailNarrativeDescription: "Make the email more narrative and personal",
  emailNarrativeYes: "Yes, make it narrative",
  emailNarrativeNo: "No, keep it business-like",
  
  // Email detail level
  emailDetailLevel: "Detail Level",
  emailDetailLevelDescription: "How detailed should the response be?",
  emailDetailVeryShort: "Very Short (1-2 sentences)",
  emailDetailShort: "Short",
  emailDetailMedium: "Medium",
  emailDetailExtensive: "Extensive",
  emailDetailVeryShortDesc: "Only the absolute essentials",
  emailDetailShortDesc: "Direct and to-the-point, no unnecessary details",
  emailDetailMediumDesc: "Sufficient detail and context, but still concise",
  emailDetailExtensiveDesc: "All relevant details, background",
  
  // Mailto modal
  mailtoModal: "Email being prepared",
  mailtoModalDescription: "The email will open in your default email program. The content is in your clipboard - paste it manually into the email with Ctrl+V or right-click > Paste.",
  mailtoModalContinue: "Continue",
  mailtoModalCancel: "Cancel",

  // Email preview modal
  copyEmailBody: "Copy email content",
  openInEmailClient: "Open in email client",
  emailPreview: "Email Preview",
  
  // Social Post preview modal
  copySocialPost: "Copy social post",
  downloadSocialPost: "Download social post",
  emailSocialPost: "Email social post",
  copyImageInstructions: "Copy AI image instructions",
  socialPostContent: "Social Post Content",
  aiImageInstructions: "AI Image Instructions",
  socialPostCopied: "Social post copied to clipboard",
  imageInstructionCopied: "AI image instruction copied to clipboard",
  copyImageInstruction: "Copy image instruction",
  aiImageInstruction: "AI Image Instruction",
  aiImageInstructionDescription: "Below is an instruction for creating a corresponding image. Copy and paste this into an AI tool for image generation.",
  aiImageInstructionExample: "For example with",
  includeSummary: "Include summary",
  includeConclusions: "Include conclusions",
  includeActionPoints: "Include action points",
  emailIncludeOptions: "What would you like to include in the email?",
  emailTitle: "Title",
  emailTitlePlaceholder: "Email title",
  emailTitleHelp: "Used as subject and as the top title line of the email. You can change this.",
  plainTextOnly: "Plain text only is supported.",
  emailSummaryIntro: "Here is the summary of our meeting:",
  emailClosing: "Kind regards",
  copiedToClipboard: "Copied to clipboard!",
  copyFailed: "Copy failed",
  copied: "Copied!",
  emailClientError: "Could not open email client",
  emailClientInstructions: "Email client instructions:",
  emailInstruction1: "If your email client doesn't open, copy the email content manually",
  emailInstruction2: "Paste the content into your favorite email application",
  emailInstruction3: "Add the recipients and send the email",
  dismiss: "Dismiss",
  
  // Email view translations
  emailOptional: "Optional settings",
  emailLength: "Length",
  emailLengthVeryShort: "Very Short",
  emailLengthShort: "Short",
  emailLengthMedium: "Medium",
  emailLengthExtensive: "Extensive",
  emailToneProfessional: "Professional",
  emailToneFriendly: "Friendly",
  emailToneFormal: "Formal",
  emailToneInformal: "Informal",
  emailGenerate: "Generate Email",
  socialPostGenerate: "Generate Social Post",
  socialPostCount: "Number of posts",
  socialPostCountLabel: "Select number of posts (1-5)",
  socialPostGenerating: "Generating posts...",
  socialPostCopyIndividual: "Copy this post",
  socialPostCopyAll: "Copy all posts",
  socialPostGenerated: "Social posts generated",
  // Social media post options
  socialPostToneInformative: "Informative",
  socialPostToneCasual: "Casual",
  socialPostToneProfessional: "Professional",
  socialPostToneEngaging: "Engaging",
  socialPostToneFriendly: "Friendly",
  socialPostToneEnthusiastic: "Enthusiastic",
  socialPostToneHumor: "Humor",
  socialPostToneFactual: "Factual",
  socialPostLengthShort: "Short (200 characters)",
  socialPostLengthMedium: "Medium (200-500 characters)",
  socialPostLengthLong: "Long (up to 1000 characters)",
  socialPostPlatformXBlueSky: "X / BlueSky",
  socialPostPlatformLinkedIn: "LinkedIn",
  socialPostPlatformFacebook: "Facebook",
  socialPostPlatformInstagram: "Instagram",
  socialPostPlatform: "Platform",
  socialPostTone: "Tone",
  socialPostLength: "Length",
  socialPostIncludeHashtags: "Include hashtags",
  socialPostIncludeEmoticons: "Use emoticons",
  socialPostOptions: "Social Media Options",
  socialPostGenerateWithOptions: "Generate with options",
  imageGeneration: "Image Generation",
  imageGenerationStyle: "Style",
  imageGenerationColor: "Color",
  imageStyleInfographic: "Infographic",
  imageStyleDrawing: "Drawing",
  imageStyleRealistic: "Realistic photo",
  imageColorBlackWhite: "Black/white",
  imageColorColor: "Color",
  imageColorVibrant: "Very colorful/vibrant colors",
  generateImage: "Generate Image",
  generatingImage: "Generating image...",
  imageGenerationGoldFeature: "Image Generation - Gold Feature",
  imageGenerationUpgradeMessage: "Image generation is only available for Gold, Diamond and Enterprise subscriptions.",

  // Email import
  emailImportOption: "Email Import",
  emailImportOptionDesc: "Import .msg and .eml files",
  emailImportDragDropText: "Drag email files here or click to upload",
  emailImportSupportedFormats: "Supported: EML and MSG files or drag directly from Outlook",
  emailImportSelectFile: "Select Email File",
  emailImportError: "Error processing email file",
  emailImportRequiresSilver: "Email import requires at least Silver plan",

  // Email import help modal
  emailImportHelpTitle: "Email Import Help",
  emailImportHelpSubtitle: "How to import email files",
  emailImportHelpIntro: "This feature allows you to upload and analyze email files (.msg and .eml).",
  emailImportHelpFormatsTitle: "Supported Formats",
  emailImportHelpSupportedFormats: "Supported file types",
  emailImportHelpFormatsList: ".msg (Outlook), .eml (standard email format)",
  emailImportHelpStep1: "Select .msg or .eml files from your computer",
  emailImportHelpStep2: "Drag files into the upload area",
  emailImportHelpStep3: "Wait for the emails to be processed and analyzed",
  emailImportHowToUseTitle: "How to use",
  emailImportTipsTitle: "Tips",
  emailImportTip1: "Email files may contain multiple messages that will be combined",
  emailImportTip2: "Attachments in emails are currently not processed",
  emailImportTip3: "HTML formatting is automatically converted to plain text",
  emailImportTip4: "Large email files may take longer to process",

  // Email upload analyzing
  analyzingEmail: "Analyzing email",
  tryAgain: "Try again",
  
  // Image upload
  dragImageHere: "Drag your image here or click Import",
  
  // File upload
  dragFileHere: "Drag your file here or click Import",

  // Firestore health check - duplicates removed, keeping only unique properties
  checkInternetAndConfig: "Check your internet connection and Firebase configuration",
  ensureUserLoggedInWithAccess: "Make sure user is logged in and has access to their own data",

  // Startup validation
  firestoreHealthCheckFailed: "Firestore health check failed",
  firestoreAuthenticationRequired: "Please log in to access all database features",
  firestoreSkippingAuthTests: "Skipping permission tests - authentication required",

  // App.tsx hardcoded strings
  webpage: "Webpage",
  
  // Additional keys for hardcoded strings
  apiKeyNotAvailable: "API key not available. Contact the administrator",
  switchToDark: "Switch to dark",
  switchToLight: "Switch to light",
  systemAudioInstructions: "Follow these steps to listen along with podcasts and videos. When sharing your screen, turn on the 'System audio' option.",
  blogTargetAudience: "Blog Target Audience",
  blogMainGoal: "Main Goal of the Blog",
  blogTone: "Desired Tone",
  blogLength: "Desired Length (approximately)",

  // Language selector
  searchLanguage: "Search language...",
  noLanguagesFound: "No languages found",

  // Email confirmation modal
  emailConfirmation: "Email Confirmation",
  confirmEmailAddress: "Confirm your email address",
  confirmationCodeSent: "We have sent a confirmation code to:",
  enterConfirmationCodeInstruction: "Enter the confirmation code to complete your waitlist registration.",
  confirmationCode: "Confirmation code",
  enterConfirmationCode: "Enter the code you received",
  confirming: "Confirming...",
  noCodeReceived: "Didn't receive a code?",
  bcc: "BCC",
  notApplicable: "N/A",
  // UI states (additional)
  download: "Download",
  downloadAudio: "Download audio",
  audioDeleteWarning: "Note: The original audio recording will be deleted once the transcription process starts.",
  actions: "Actions",

  // Waitlist modal
  waitlist: "Waitlist",
  waitlistExplanation: "RecapHorizon is currently only accessible to invited users...",
  howWaitlistWorks: "How does the waitlist work?",
  signUpWithEmail: "Sign up with your email address",
  addToWaitlist: "We'll add you to the waitlist",
  receiveInvitation: "Once there's space, you'll receive an invitation",
  createAccountAndUse: "You can then create an account and use the app",
  whatHappensToData: "What happens to your data?",
  emailUsageExplanation: "Your email address is only used to contact you...",
  recordingsStayLocal: "Recordings: Stay completely local on your device",
  transcriptionsPrivacy: "Transcriptions: We cannot see or store them",
  aiOutputPrivacy: "AI Output: Only you have access to your content",
  privacyStatement: "We don't store anything from your sessions. Your privacy comes first.",
  directSignup: "Direct Signup",
  signUp: "Sign up",

  // Expert configuration
  role: "Role:",
  industry: "Industry:",

  // File upload
  supportedImageFormats: "JPG, JPEG, PNG, WEBP, GIF",
  processingMsgEmlFile: "Processing MSG/EML file...",
  dragDropEmlMsgInstruction: "You can drag and drop an .eml or .msg file...",

  // Content loading
  itemsAppearWhenLoaded: "Items appear here once content is loaded from tabs",

  // Additional email confirmation modal
  confirm: "Confirm",
  resendCode: "Resend code",
  resendCodeWithTimer: "Resend code ({time}s)",
  demoWarning: "Note: This is a demo implementation. In a production environment, a real email would be sent with the confirmation code.",
  testingNote: "For testing: check the browser console for the generated token.",

  // Waitlist modal (additional keys)
  waitlistDescription: "RecapHorizon is currently only accessible by invitation. This ensures we can provide the best service and optimize the app based on feedback from our users.",
  waitlistStep1: "Sign up with your email address",
  waitlistStep2: "We place you on the waitlist",
  waitlistStep3: "As soon as there's space, you'll receive an invitation",
  waitlistStep4: "You can then create an account and use the app",
  whatHappensWithData: "What happens to your data?",
  dataUsageDescription: "Your email address is only used to contact you when you get access. We don't share your data with third parties.",
  sessionsNotSaved: "When you use the app, your sessions are NOT saved in our database.",
  recordingsLocal: "Recordings: Stay completely local on your device",
  transcriptionsPrivate: "Transcriptions: We cannot see or save them",
  aiOutputPrivate: "AI Output: Only you have access to your content",
  privacyFirst: "We save absolutely nothing from your sessions. Your privacy comes first.",

  // Console Messages & Errors
  basicConnectionOk: "✅ Basic connection: OK",
  basicConnectionFailed: "❌ Basic connection failed:",
  readPermissionsOk: "✅ Read permissions: OK",
  readPermissionsFailed: "❌ Read permissions failed:",
  skippingReadPermissionsTest: "ℹ️ Skipping read permissions test - user not authenticated",
  writePermissionsOk: "✅ Write permissions: OK",
  writePermissionsFailed: "❌ Write permissions failed:",
  indexesOk: "✅ Indexes: OK",
  indexTestFailed: "❌ Index test failed:",
  microphoneAccessDenied: "Microphone access required but denied",
  noAudioSources: "No audio sources available",
  recordingFailed: "Recording failed",
  recordingStartedWithMimeType: "Recording started with MIME type:",
  recordingPausedConsole: "Recording paused",
  recordingResumed: "Recording resumed",
  tabHiddenPausingRecording: "Tab hidden, pausing recording to prevent interruption",
  tabVisibleResumingRecording: "Tab visible, resuming recording",
  mediaRecorderRestarted: "MediaRecorder restarted after track end",
  failedToRecoverFromTrackEnd: "Failed to recover from track end:",
  displayCaptureNotAvailable: "Display capture not available:",
  mediaRecorderBitrateNotSupported: "MediaRecorder with bitrate not supported, using default:",
  failedToStartRecording: "Failed to start recording:",
  failedToResumeAudioContext: "Failed to resume AudioContext:",
  cleanupError: "Cleanup error:",
  audioContextAutoResumed: "AudioContext auto-resumed after brief interruption",
  failedToAutoResumeAudioContext: "Failed to auto-resume AudioContext:",
  couldNotAttachAudioContextListener: "Could not attach AudioContext statechange listener:",

  // Error Messages
  jsxDevNotAvailable: "jsxDEV is not available in production runtime",
  couldNotFindRootElement: "Could not find root element to mount to",
  userIdRequiredForReadTest: "User ID required for read permission test",
  userIdRequiredForWriteTest: "User ID required for write permission test",
  userIdEmptyInSubscriptionTier: "userId is leeg in getUserSubscriptionTier!",
  userIdEmptyInFirestoreUser: "userId is leeg in Firestore user functie!",
  userIdEmptyInTokenUsage: "userId is leeg in Firestore token usage functie!",
  userIdEmptyInUserPreferences: "userId is leeg in Firestore userPreferences functie!",
  invalidUrlProvided: "Invalid URL provided",
  emptyResponseReceived: "Empty response received",
  requestTimeoutAfter: "Request timeout after",
  redirectToDisabled: "Redirect to {location} (redirects disabled)",
  invalidAnalysisType: "Invalid analysis type",
  invalidMindmapOutput: "Invalid mindmap output",
  rateLimitExceeded: "Rate limit exceeded",
  
  // File handling errors
  unsupportedFileFormat: "Unsupported file format. Try PDF, RTF, HTML, MD, DOCX or TXT.",
  noTextFound: "No text found in the file.",
  processingFile: "Processing file...",
  uploadFailedTierFreeTxtOnly: "Upload failed: Your current subscription only supports TXT files for transcription. Upgrade to Silver or Gold to upload other file types.",
  uploadFailedUnsupportedTier: "Upload failed: This file type is not supported for your tier.",
  errorMarkdownProcessingFailed: "Markdown processing failed.",
  errorMarkdownReadFailed: "Failed to read Markdown.",
  errorDocxReadFailed: "Failed to read DOCX.",
  errorDocxNoTextFound: "No text found in the DOCX file.",
  errorDocxProcessingFailed: "DOCX processing failed: {message}",
  errorDocxLibraryLoadFailed: "DOCX library failed to load: {message}",
  errorTokenLimitFileProcessing: "Token limit reached for file processing.",
  firecrawlNotConfigured: "Firecrawl API key is not configured.",
  noContentRetrieved: "No content could be retrieved from any of the provided URLs.",
  littleTextRetrieved: "Very little text could be retrieved from these web pages.",
  littleTextRetrievedSingle: "Very little text could be retrieved from this web page. This may be due to security settings or because the page contains little text.",
  couldNotRetrieveProxy: "Could not retrieve content from the web page via proxy.",
  
  // Authentication errors
  accountDisabled: "Account is disabled. Contact administrator.",
  couldNotCreateAccount: "Kon gebruikersaccount niet aanmaken. Probeer het opnieuw of contact administrator.",
  emailNotFound: "Email adres niet gevonden. Maak eerst een account aan.",
  incorrectPassword: "Onjuist wachtwoord. Probeer opnieuw.",
  invalidEmail: "Invalid email address.",
  accountDisabledContact: "Account is uitgeschakeld. Contact administrator.",
  emailNotFoundSystem: "Email not found in system. Contact administrator to be added.",
  emailInUse: "Dit email adres is al in gebruik. Probeer in te loggen in plaats van een account aan te maken.",
  emailInUseFirebase: "Dit email adres is al in gebruik in Firebase. Probeer in te loggen in plaats van een account aan te maken.",
  invalidCredentials: "Ongeldige inloggegevens. Mogelijk bestaat het account al in Firebase. Probeer in te loggen of neem contact op met de administrator.",
  accountCreationNotAllowed: "Account aanmaken is niet toegestaan. Neem contact op met de administrator.",
  keywordAnalysisGenerationError: "Error generating keyword analysis:",
  
  // New unique translations
  noResultsYet: "No results yet. Try a search.",
  pageLoadedSuccessfully: "Page Loaded Successfully!",
  language: "Language",
  selectTopic: "Select a topic...",
  selectRole: "Select a role...",
  selectBranch: "Select a branch/sphere...",
  processingMsgFile: "Processing MSG/EML file...",
  onlyPlainTextSupported: "Only plain text is supported.",
  
  // Security & Privacy Messages
  aiServiceIntegration: "The app integrates with AI services. The quality and availability of these services depend on the AI provider's terms and may vary. We have no control over the underlying AI models or their output.",
  
  // Google Cloud Speech API Errors
  speechApiKeyNotConfigured: "Google Cloud Speech API key is not configured",
  addValidApiKey: "Add a valid API key to environment variables",
  speechApiKeyInvalidFormat: "Google Cloud Speech API key has invalid format",
  checkApiKeyCorrect: "Check if API key is correctly copied from Google Cloud Console",
  speechApiAccessDenied: "Google Cloud Speech API access denied",
  speechApiQuotaExceeded: "Google Cloud Speech API quota exceeded",
  cannotConnectSpeechApi: "Cannot connect to Google Cloud Speech API",
  checkInternetFirewall: "Check your internet connection and firewall settings",
  
  // Firestore Error Messages
  cannotConnectFirestore: "Cannot connect to Firestore",
  checkInternetFirebaseConfig: "Check your internet connection and Firebase configuration",
  checkFirestoreSecurityRules: "Check Firestore security rules",
  noReadPermissionsFirestore: "No read permissions for Firestore",
  checkFirestoreReadRules: "Check Firestore security rules for reading",
  makeSureUserLoggedIn: "Make sure user is logged in and has access to their own data",
  skippingPermissionTests: "Skipping permission tests - authentication required",
  pleaseLoginDatabaseFeatures: "Please log in to access all database features",
  noWritePermissionsFirestore: "No write permissions for Firestore",
  checkFirestoreWriteRules: "Check Firestore security rules for writing",
  firestoreIndexesNotWorking: "Firestore indexes don't work correctly",
  checkFirebaseConsoleMissingIndexes: "Check Firebase Console for missing indexes",
  createRequiredCompositeIndexes: "Create required composite indexes in Firebase Console",
  
  // Generic Database Errors
  problemDatabaseConnection: "There is a problem with the database connection",
  noAccessDatabaseLoginAgain: "No access to the database. Please log in again.",
  logOutLogInAgain: "Log out and log in again",
  checkAccountActive: "Check if your account is active",
  contactSupportProblemPersists: "Contact support if the problem persists",
  databaseTemporarilyUnavailable: "Database temporarily unavailable. Please try again in a few minutes.",
  waitTryAgain: "Wait 2-3 minutes and try again",
  checkInternetConnection: "Check your internet connection",
  reloadPageProblemPersists: "Reload the page if the problem persists",
  databaseConfigurationProblem: "Database configuration problem. Please contact support.",
  contactAdministrator: "Contact the administrator",
  mentionErrorCode: "Mention this error code: failed-precondition",
  databaseQuotaExceeded: "Database quota exceeded. Please try again later.",
  waitFewHoursTryAgain: "Wait a few hours and try again",
  contactSupportQuotaIncrease: "Contact support for quota increase",
  connectionInterrupted: "Connection interrupted. Check your internet connection.",
  tryDifferentBrowser: "Try a different browser if the problem persists",
  networkProblem: "Network problem. Check your internet connection.",
  tryAgainFewMinutes: "Try again in a few minutes",
  
  // Device & Platform Specific
  deviceMobile: "mobile",
  deviceTablet: "tablet",
  deviceDesktop: "desktop",
  osIos: "ios",
  osAndroid: "android",
  osWindows: "windows",
  osMacos: "macos",
  osLinux: "linux",
  osUnknown: "unknown",
  platformAndroid: "android",
  platformWebos: "webos",
  platformIphone: "iphone",
  platformIpad: "ipad",
  platformIpod: "ipod",
  platformBlackberry: "blackberry",
  platformWindowsPhone: "windows phone",
  platformMobile: "mobile",
  platformOperaMini: "opera mini",
  
  // Audio/Media Related
  mimeAudioWebm: "audio/webm",
  mimeAudioMp4: "audio/mp4",
  mimeAudioAac: "audio/aac",
  mimeAudioMpeg: "audio/mpeg",
  codecAudioWebmOpus: "audio/webm; codecs=opus",
  recordingStateRecording: "recording",
  recordingStatePaused: "paused",
  recordingStateStopped: "stopped",
  recordingStateError: "error",
  mediaRecorderInactive: "inactive",
  mediaRecorderSuspended: "suspended",
  
  // Error Messages & Validation
  errorOnlyImageFiles: "Only image files are allowed (JPG, PNG, JPEG, WEBP, GIF).",
  errorDailySessionLimit: "Daily session limit reached.",
  errorApiKeyNotAvailable: "API key not available. Please contact the administrator.",
  errorTokenLimitImageAnalysis: "Token limit reached for image analysis.",
  errorTokenLimit: "Token limit reached.",
  errorTooManyPasteActions: "Too many paste actions. Please try again in a minute.",
  errorInvalidText: "Invalid text: {error}",
  errorNoValidTextPasted: "No valid text pasted. Please paste text from your clipboard first.",
  
  // Loading States
  loadingAnalyzingImage: "Analyzing image...",
  loadingAnalyzingImageWithAI: "Analyzing image with AI...",
  loadingProcessingPastedText: "Processing pasted text...",
  loadingWebExpertAnalysis: "Loading and analyzing web pages with WebExpert...",
  loadingWebPageExtraction: "Loading web page and extracting text...",

  // Modal Content & Help Text
  helpLanguageSelection: "Selecting the language for the source document/recording helps AI understand it better.",
  buttonClose: "Close",
  waitlistAlreadyLoggedIn: "You are already logged in, the waitlist is only for new invitations.",
  waitlistAlreadyRegistered: "You have already registered for the waitlist in this session.",
  waitlistInvalidEmail: "Please enter a valid email address.",
  waitlistConfirmationTitle: "Registration Confirmed",
  waitlistConfirmationMessage: "Your registration has been added to our system. You will hear from us as soon as possible. Thank you!",
  waitlistThankYou: "Thank you for registering! The RecapHorizon team will contact you as soon as possible. We appreciate your interest!",
  
  // 2FA Waitlist Translations
  waitlist2FADescription: "We'll send you a confirmation code via email to complete your registration.",
  waitlist2FAEmailSent: "Confirmation Code Sent",
  waitlist2FAEmailSentMessage: "We've sent a confirmation code to your email address.",
  waitlist2FAEmailInstructions: "Check your inbox and enter the code to complete your registration.",
  emailRequired: "Email address is required",
  sending: "Sending...",
  waitlistSignupFailed: "Registration failed. Please try again.",

  // Business Logic Messages
  waitlistErrorAdding: "An error occurred while adding to the waitlist. Please try again.",
  waitlistAccessDenied: "Access denied. Check your internet connection and try again.",
  waitlistNetworkError: "Network error. Check your internet connection and try again.",
  waitlistSuspiciousActivity: "Suspicious activity detected. Please try again later.",
  waitlistEmailBlocked: "This email address is temporarily blocked due to repeated submissions.",

  // Admin Functions
  adminNoAccess: "No access to waitlist management. Admin rights required.",
  adminSelectUsers: "Please select users to activate first.",
  adminUsersActivated: "user(s) successfully activated!",
  adminActivationError: "Error activating users.",
  adminUserRemoved: "User successfully removed from waitlist.",
  adminRemovalError: "Error removing user from waitlist.",

  // Email Templates
  emailInvitationSubject: "Invitation for RecapHorizon - You can now create an account!",
  emailInvitationBody: "Dear user,\n\nGreat news! You have been invited to join RecapHorizon.\n\nYou can now create your account and start using our platform.\n\nClick here to get started: [Registration Link]\n\nWelcome to RecapHorizon!\n\nBest regards,\nThe RecapHorizon Team",
  emailClientOpened: "Email client opened for {email}!",
  emailNoValidEmails: "No valid emails found.",

  // Console Messages & Technical Errors
  errorUpdateSessionCount: "Could not update sessionCount:",
  errorImageAnalysis: "Error during image analysis:",
  errorImageProcessing: "Error processing image:",
  errorReadMsgFile: "Could not read MSG file data",
  errorParsingEml: "Error parsing EML:",
  errorParsingMsg: "Error parsing MSG:",
  errorProcessingMsg: "Error processing MSG file:",
  errorProcessingEml: "Error processing EML file:",

  // Startup Validation Console Messages
  startupValidationStart: "🚀 Starting RecapHorizon startup validation...",
  validatingFirebaseConfig: "🔍 Validating Firebase configuration...",
  firebaseConfigOk: "✅ Firebase configuration: OK",
  firebaseConfigFailed: "❌ Firebase configuration failed:",
  validatingFirestoreHealth: "🔍 Validating Firestore health...",
  firestoreHealthOk: "✅ Firestore health: OK",
  firestoreHealthIssues: "⚠️ Firestore health issues:",
  firestoreHealthError: "❌ Firestore health check error:",
  validatingGoogleSpeechApi: "🔍 Validating Google Speech API...",
  googleSpeechApiOk: "✅ Google Speech API: OK",
  googleSpeechApiIssues: "⚠️ Google Speech API issues:",
  googleSpeechApiError: "❌ Google Speech API validation error:",
  googleSpeechApiNotConfigured: "ℹ️ Google Speech API key not configured (development mode)",
  performingEnvironmentChecks: "🔍 Performing additional environment checks...",
  startupValidationCompleted: "🎉 Startup validation completed successfully!",
  servicesStatus: "📊 Services status:",
  nonCriticalWarnings: "⚠️ Non-critical warnings:",
  startupValidationFailed: "🚨 Startup validation failed!",
  criticalIssues: "❌ Critical issues:",
  runningDevelopmentMode: "🔧 Running in development mode",
  mediaDevicesNotAvailable: "MediaDevices API not available - audio recording may not work",
  optionalEnvVarNotSet: "ℹ️ Optional environment variable {varName} not set",
  startupReportTitle: "📋 **RecapHorizon Startup Report**",
  statusAppReady: "✅ **Status**: Application is ready for use",
  statusAppIssues: "⚠️ **Status**: Application has issues but can run",
  statusAppFailed: "❌ **Status**: Application failed to start properly",
  
  // Firestore Health Check Console Messages (removed duplicates)
  userDocumentNotExist: "User document does not exist, skipping write permission test",
  
  // Fetch Page Console Messages
  fetchHtmlErrorExtractingMetadata: "[FetchHTML] Error extracting metadata:",
  fetchMultipleHtmlFetching: "[FetchMultipleHTML] Fetching {urlCount} URLs with max {maxConcurrent} concurrent requests",
  fetchMultipleHtmlFailedToFetch: "[FetchMultipleHTML] Failed to fetch {url}:",
  fetchMultipleHtmlCompleted: "[FetchMultipleHTML] Completed: {successful}/{total} successful",
  extractTextErrorParsingHtml: "[ExtractText] Error parsing HTML:",
  
  // Firebase Console Messages
  missingFirebaseEnvVars: "Missing required Firebase environment variables:",
  firebaseAppCheckNotInitialized: "Firebase App Check not initialized: no site key provided...",
  failedInitializeAppCheck: "Failed to initialize Firebase App Check:",
  errorTrackingUserSession: "Error tracking user session:",
  errorGettingUserSessionsToday: "Error getting user sessions today:",
  errorGettingUserSessionsMonth: "Error getting user sessions this month:",
  errorUpdatingTokenUsage: "Error updating token usage:",
  errorGettingTokenUsageToday: "Error getting token usage today:",
  errorGettingTotalTokenUsage: "Error getting total token usage:",
  errorGettingUserPreferences: "Error getting user preferences:",
  errorSavingUserPreferences: "Error saving user preferences:",
  
  // Security Console Messages
  failedStoreSessionSecurely: "Failed to store session securely:",
  failedLoadStoredSession: "Failed to load stored session:",
  failedLoadStoredSessions: "Failed to load stored sessions:",
  failedRemoveStoredSession: "Failed to remove stored session:",
  couldNotGenerateSecureToken: "Could not generate secure token, falling back to timestamp-based:",
  errorCreatingEmailConfirmation: "Error creating email confirmation:",
  errorVerifyingEmailConfirmation: "Error verifying email confirmation:",
  errorCheckingPendingConfirmation: "Error checking pending confirmation:",
  couldNotCheckDuplicateEmails: "Could not check for duplicate emails:",
  errorCompletingWaitlistSignup: "Error completing waitlist signup:",

  // File Processing
  imageAnalyzedLabel: "[IMAGE ANALYZED]",
  fileInfoFilename: "Filename:",
  fileInfoType: "File type:",
  fileInfoSize: "File size:",
  aiAnalysisHeader: "=== AI ANALYSIS ===",
  emailSubjectLabel: "Subject:",

  // Console Messages - Firestore Health Check (removed duplicates)
  skippingFirestoreTests: "⏭️ Skipping Firestore tests (no user ID provided)",

  // Console Messages - Fetch Page
  fetchAttempt: "[FetchHTML] Attempt {attempt}/{total} for URL: {url}",
  fetchContentTypeWarning: "[FetchHTML] Warning: Content-Type is '{contentType}', expected HTML",
  fetchSuccess: "[FetchHTML] Successfully fetched {length} characters from {url}",
  fetchAttemptFailed: "[FetchHTML] Attempt {attempt} failed:",
  fetchRetryWait: "[FetchHTML] Waiting {delay}ms before retry...",
  fetchMultipleStart: "[FetchMultipleHTML] Fetching {count} URLs with max {concurrent} concurrent requests",
  fetchMultipleFailed: "[FetchMultipleHTML] Failed to fetch {url}:",
  fetchMultipleCompleted: "[FetchMultipleHTML] Completed: {successful}/{total} successful",
  fetchMetadataError: "[FetchHTML] Error extracting metadata:",

  // Console Messages - Firebase, Security, Startup Validator (removed duplicates)
  quickStartupCheckFailed: "Quick startup check failed:",
  runningInDevMode: "🔧 Running in development mode",
  // optionalEnvVarNotSet: duplicate removed

  // Console Messages - Tab Cache Integration
  debugSummaryTabClicked: "[DEBUG] Summary tab clicked",
  debugGeneratingNewSummary: "[DEBUG] Generating new summary...",
  debugExecutiveSummaryTabClicked: "[DEBUG] Executive Summary tab clicked",
  debugGeneratingNewExecutiveSummary: "[DEBUG] Generating new executive summary...",

  // Console Messages - Tab Cache
  tabCacheCheckingCache: "[TabCache] 🔍 Checking cache for {tabType}",
  tabCacheCurrentState: "[TabCache] 📊 Current cache state:",
  tabCacheUsingCached: "[TabCache] ✅ Using cached content for {tabType} ({length} characters)",
  tabCacheGeneratingNew: "[TabCache] 🆕 Generating new content for {tabType}",
  tabCacheGenerated: "[TabCache] 📝 Generated content for {tabType} ({length} characters)",
  tabCacheCaching: "[TabCache] 💾 Caching content for {tabType}",
  tabCacheUpdated: "[TabCache] 📈 Updated cache:",
  tabCacheError: "[TabCache] ❌ Error generating content for {tabType}:",
  tabCacheCheckingSyncCache: "[TabCache] 🔍 Checking sync cache for {tabType}",
  tabCacheUsingSyncCached: "[TabCache] ✅ Using cached sync content for {tabType}",
  tabCacheCachingNewSync: "[TabCache] 🆕 Caching new sync content for {tabType} ({length} characters)",
  tabCacheCachedSync: "[TabCache] 💾 Cached sync content for {tabType}",
  tabCacheResetting: "[TabCache] 🔄 Resetting all cached content",
  tabCacheReset: "[TabCache] ✅ Cache completely reset",
  tabCacheIsCached: "[TabCache] ❓ Is {tabType} cached? {cached}",
  tabCacheStatusOverview: "[TabCache] 📋 Cache Status Overview:",
  tabCacheStatusItem: "  {key}: {status}",

  // Technical Console Messages - API Validator
  apiCallFailed: "API call failed for {apiName}:",
  retryingApiCall: "Retrying {apiName} in {delay}ms (attempt {attempt}/{maxRetries})",
  usingFallbackApi: "Using fallback for {apiName}",
  fallbackAlsoFailed: "Fallback also failed for {apiName}:",

  // Technical Console Messages - Error Handler
  errorHandlerLog: "[{errorId}] {errorType}:",
  errorStackTrace: "Stack trace:",
  failedToSendErrorLog: "Failed to send error to logging service:",

  // Technical Console Messages - Token Manager

  // Missing basic translations
  Exact: "Exact",
  Simpel: "Simple",
  actionPoints: "Action Points",
  approachingTokenLimit: "Approaching token limit",
  audioCompression: "Audio compression",
  audioCompressionDescription: "Compress audio to reduce file size and improve processing speed",
  autoStopRecording: "Auto-stop recording",
  autoStopRecordingDescription: "Automatically stop recording after a period of silence",
  speechRecognition: "Speech recognition",
  bccField: "BCC",
  bccPlaceholder: "Enter BCC recipients...",
  bodyField: "Body",
  bodyPlaceholder: "Enter email body...",
  bothTemplate: "Both (Summary + Transcript)",
  cc: "CC",
  ccField: "CC",
  ccPlaceholder: "Enter CC recipients...",
  // Duplicate keys removed (chatCancel removed)
  contentTitle: "Content",
  currentTier: "Current Tier",
  customTemplate: "Custom Template",
  detectedEmails: "Detected emails",
  emailAddresses: "Email addresses",
  // Duplicate email keys removed
  emailFormTitle: "Email Form",
  emailSubject: "Subject",
  emailSubjectPlaceholder: "Enter subject...",
  emailToneDescription: "Choose the tone for your email",
  emailToneDirect: "Direct",
  emailToneDirectDesc: "Straightforward and to the point",
  emailToneEmpathetic: "Empathetic",
  emailToneEmpatheticDesc: "Understanding and compassionate",
  emailToneFormalDesc: "Professional and formal",
  emailToneFriendlyDesc: "Warm and approachable",
  emailToneHumorous: "Humorous",
  emailToneHumorousDesc: "Light-hearted and funny",
  emailToneNeutral: "Neutral",
  emailToneNeutralDesc: "Balanced and objective",
  emailTonePersuasive: "Persuasive",
  emailTonePersuasiveDesc: "Convincing and influential",
  // Miscellaneous duplicates removed
  formatField: "Format",
  htmlFormat: "HTML Format",
  plainText: "Plain Text",
  preview: "Preview",
  recipientsTitle: "Recipients",
  subjectField: "Subject",
  subjectPlaceholder: "Enter subject...",
  summaryTemplate: "Summary Only",
  templateTitle: "Template",
  toField: "To",
  toPlaceholder: "Enter recipients...",
  transcriptTemplate: "Transcript Only",

  // Email composition keys
  "emailComposition.bccField": "BCC",
  "emailComposition.bccPlaceholder": "Enter BCC recipients...",
  "emailComposition.bodyField": "Body",
  "emailComposition.bodyPlaceholder": "Enter email body...",
  "emailComposition.bothTemplate": "Both (Summary + Transcript)",
  "emailComposition.ccField": "CC",
  "emailComposition.ccPlaceholder": "Enter CC recipients...",
  "emailComposition.contentTitle": "Content",
  "emailComposition.copyAll": "Copy All",
  "emailComposition.copyBody": "Copy Body",
  "emailComposition.customTemplate": "Custom Template",
  "emailComposition.detectedEmails": "Detected emails",
  "emailComposition.formatField": "Format",
  "emailComposition.htmlFormat": "HTML Format",
  "emailComposition.openMailClient": "Open mail client",
  "emailComposition.plainText": "Plain Text",
  "emailComposition.preview": "Preview",
  "emailComposition.recipientsTitle": "Recipients",
  "emailComposition.subjectField": "Subject",
  "emailComposition.subjectPlaceholder": "Enter subject...",
  "emailComposition.summaryTemplate": "Summary Only",
  "emailComposition.templateTitle": "Template",
  "emailComposition.toField": "To",
  "emailComposition.toPlaceholder": "Enter recipients...",
  "emailComposition.transcriptTemplate": "Transcript Only",

  // Email templates
  "emailTemplates.both.intro": "Please find below both the summary and full transcript of our meeting:",
  "emailTemplates.both.outro": "Please let me know if you have any questions or need clarification on any points discussed.",
  "emailTemplates.both.subject": "Meeting Summary and Transcript - {date}",
  "emailTemplates.both.summaryTitle": "Summary",
  "emailTemplates.both.transcriptTitle": "Full Transcript",
  "emailTemplates.intro": "Please find below the meeting details:",
  "emailTemplates.outro": "Best regards",
  "emailTemplates.subject": "Meeting Summary - {date}",
  "emailTemplates.summary.intro": "Please find below a summary of our meeting:",
  "emailTemplates.summary.outro": "Please let me know if I missed anything important or if you need clarification on any points.",
  "emailTemplates.summary.subject": "Meeting Summary - {date}",
  "emailTemplates.summaryTitle": "Meeting Summary",
  "emailTemplates.transcript.intro": "Please find below the full transcript of our meeting:",
  "emailTemplates.transcript.outro": "Please review and let me know if you have any questions.",
  "emailTemplates.transcript.subject": "Meeting Transcript - {date}",
  "emailTemplates.transcriptTitle": "Meeting Transcript",

  // Additional email template keys
  "both.intro": "Please find below both the summary and full transcript:",
  "both.outro": "Please let me know if you have any questions.",
  "both.subject": "Summary and Transcript - {date}",
  "both.summaryTitle": "Summary",
  "both.transcriptTitle": "Transcript",

  // Expert help and configuration (duplicates removed)
  // Expert help duplicates removed

  // Image upload help and FAQ (duplicates removed)




  errorValidatingTokenUsage: "Error validating token usage:",
  errorRecordingTokenUsage: "Error recording token usage:",
  errorGettingCurrentUsage: "Error getting current usage:",
  errorCheckingUsageWarnings: "Error checking usage warnings:",

  // Technical Console Messages - Tab Cache (useTabCache)
  tabCacheResettingAll: "[TabCache] 🔄 Resetting all cached content",
  tabCacheCompletelyReset: "[TabCache] ✅ Cache completely reset",
  tabCacheIsTypeCached: "[TabCache] ❓ Is {tabType} cached? {cached}",

  // Technical Console Messages - Clipboard
  clipboardToastMessage: "{type}: {message}",

  // Toast Messages
  toastApiKeyNotAvailable: "API key not available. Contact the administrator.",
  toastTokenLimitReached: "Token limit reached. Upgrade your subscription for more AI generations.",
  toastDiamondTokenCompleted: "Diamond token action completed!",
  toastDiamondTokenError: "An error occurred during the diamond token action.",
  toastCopiedToClipboard: "Copied to clipboard",
  toastCopyFailed: "Copy failed",
  toastFileDownloaded: "File downloaded",
  toastErrorLoadingPreferences: "Error loading preferences",
  toastPleaseSelectAIProvider: "Please select an AI provider",
  toastPreferencesSaved: "AI Provider preferences saved successfully",
  toastErrorSavingPreferences: "Error saving preferences",
  toastBusinessCaseGenerated: "Business case generated!",
  toastTooManyChatMessages: "Too many chat messages. Please try again in a minute.",
  toastNotEnoughCredits: "Unfortunately, you do not have enough credits to perform this feature. Click here to upgrade to a higher subscription.",
  toastNoUserManagementAccess: "No access to user management. Admin rights required.",
  toastErrorLoadingUsers: "Error loading users.",
  toastErrorAddingUser: "Error adding user.",
  toastConfirmationEmailSent: "A confirmation email has been sent. Check your inbox.",
  toastWaitlistError: "An error occurred while signing up for the waitlist.",
  toastNoEmailAccess: "No access to email functions. Admin rights required.",
  toastErrorPreparingInvitations: "Error preparing invitation emails.",
  toastWebSpeechAPINotSupported: "Web Speech API does not support saved audio transcription",
  toastErrorPreparingLargeAudio: "Error preparing large audio file. Try a smaller file.",
  toastFailedToDownloadFile: "Failed to download file. Please try again.",

  // Expert Chat Console Messages
  expertChatRateLimitExceeded: "Rate limit exceeded for expert chat",
  expertChatInvalidMessage: "Invalid message content:",
  expertChatTokenValidationFailed: "Token validation failed:",
  expertChatFollowUpError: "Error generating follow-up question:",
  expertChatTokenRecordingError: "Error recording token usage:",
  expertChatError: "Expert chat error:",

  // Email Composition Console Messages
  emailMissingApiKey: "Missing GEMINI_API_KEY env variable",
  emailGenerationError: "Error generating AI email:",
  
  // App.tsx Error Messages
  httpErrorStatus: "HTTP error! status: {status}",
  weakPasswordMinimum: "Password must be at least 6 characters.",
  accountCreationFailed: "Account creation failed: {message}",
  directFetchFailed: "Direct fetch failed, falling back to CORS proxy:",
  firebaseEmailInUse: "This email address is already in use in Firebase. Try logging in instead of creating an account.",

  // Settings Tab Translations
  settingsTabGeneral: "General",
  settingsTabSubscription: "Subscription",
  settingsTabTranscription: "Transcription",
  settingsTabAnonymization: "Anonymization",

  // Subscription Tab Translations
  subscriptionCurrentPlan: "Current Subscription",
  subscriptionFreeTier: "Free trial - 28 days",
  subscriptionPaidTier: "Paid subscription",
  subscriptionNextBilling: "Next billing",
  subscriptionTrialEnds: "Trial ends",
  subscriptionEmail: "Email",
  subscriptionAccountCreated: "Account created",
  subscriptionNextProlongation: "Next prolongation",
  subscriptionManagement: "Subscription Management",
  subscriptionViewPricing: "View Pricing",
  subscriptionViewPricingDesc: "Compare all available plans",
  subscriptionUpgrade: "Upgrade Subscription",
  subscriptionUpgradeDesc: "Get access to more features",
  subscriptionChangeplan: "Change Plan",
  subscriptionChangeplanDesc: "Upgrade or downgrade your current plan",
  manageSubscription: "Manage subscription",

  // AI Discussion - common UI keys
  "aiDiscussion.turnCount": "Turn {{count}}",
  "aiDiscussion.participants": "Participants",
  "aiDiscussion.statusActive": "Active",
  "aiDiscussion.statusCompleted": "Completed",
  "aiDiscussion.discussionFlow": "Discussion flow",
  "aiDiscussion.welcomeTitle": "Discussion started!",
  "aiDiscussion.welcomeMessage": "The AI experts will now discuss the topic from their unique perspectives. Each participant will contribute their expertise to reach valuable insights.",
  "aiDiscussion.welcomeAction": "Click \"Continue discussion\" to generate the first responses.",
  "aiDiscussion.participantsPreview": "These experts will participate in the discussion:",
  "aiDiscussion.moreParticipants": "And {{count}} other experts...",
  "aiDiscussion.generating": "Generating report...",
  "aiDiscussion.progress": "Progress",
  "aiDiscussion.turns": "turns",
  "aiDiscussion.canContinue": "You can continue the discussion or generate a report",
  "aiDiscussion.maxReached": "Maximum number of turns reached - generate a report",
  "aiDiscussion.reportCopied": "Report copied to clipboard",
  "aiDiscussion.copyError": "Error copying to clipboard",
  "aiDiscussion.pdfGenerated": "PDF report generated",
  "aiDiscussion.pdfError": "Error generating PDF",
  "aiDiscussion.discussionReport": "Discussion Report",
  "aiDiscussion.copyReport": "Copy Report",
  "aiDiscussion.generatingPDF": "Generating PDF...",
  "aiDiscussion.downloadPDF": "Download PDF",
  "aiDiscussion.discussionGoal": "Discussion goal",
  "aiDiscussion.summary": "Summary",
  "aiDiscussion.keyPoints": "Key points",
  "aiDiscussion.recommendations": "Recommendations",
  "aiDiscussion.fullTranscript": "Full discussion",
  "aiDiscussion.copyTranscript": "Copy transcript",
  "aiDiscussion.moveToTranscript": "Move to transcript",
  "aiDiscussion.moveToTranscriptModal.title": "Move report to transcript",
  "aiDiscussion.moveToTranscriptModal.message": "This report will become the new transcript and replace the current content. It can then be used for further analysis with other options.",
  "aiDiscussion.moveToTranscriptModal.warning": "Note: The current transcript content will be permanently replaced.",
  "aiDiscussion.moveToTranscriptModal.confirm": "Yes, replace transcript",
  "aiDiscussion.moveToTranscriptModal.cancel": "Cancel",
  "aiDiscussion.transcriptReplaced": "Transcript successfully replaced",
  "aiDiscussion.transcriptReplaceError": "Error replacing transcript",
  "aiDiscussion.rateLimitWarning": "Please wait... You can try again in a few seconds.",
  "aiDiscussion.topicGenerationError": "An error occurred while generating discussion topics",
  "aiDiscussion.serverOverloadError": "The AI service is currently overloaded. Please try again in a few minutes.",
  "aiDiscussion.quotaExceededError": "Daily AI service usage has been reached. Please try again later or upgrade your subscription.",
  "aiDiscussion.networkError": "Network error connecting to the AI service. Check your internet connection and try again.",
  "aiDiscussion.startError": "An error occurred while starting the discussion",
  "aiDiscussion.continueError": "An error occurred while continuing the discussion",
  "aiDiscussion.reportError": "An error occurred while generating the report",
  "aiDiscussion.selectTopic": "Select a discussion topic",
  "aiDiscussion.selectTopicDesc": "Choose the topic for the AI discussion with different organizational roles",
  "aiDiscussion.refreshTopics": "Refresh topics",
  "aiDiscussion.backToTopics": "Back to topics",
  "aiDiscussion.rolesModeratorTitle": "Roles & moderator",
  "aiDiscussion.rolesModeratorHelp": "Select 2-4 roles for this discussion. The first selected role acts as the moderator: facilitates the discussion, asks clarifying questions and summarizes. In the discussion UI this is indicated by \"(Moderator)\" after the role name.",
  "aiDiscussion.backToConfig": "Back to configuration",
  "aiDiscussion.continueDiscussion": "Continue discussion",
  "aiDiscussion.generateReport": "Generate report",
  "aiDiscussion.selectedTopic": "Selected topic",
  "aiDiscussion.selectGoal": "Select discussion goal",
  "aiDiscussion.selectGoalDesc": "Choose the main goal for this discussion from 5 categories",
  "aiDiscussion.selectedGoal": "Selected goal",
  "aiDiscussion.selectRoles": "Select 2-4 organizational roles",
  "aiDiscussion.selectRolesDesc": "Choose which roles will participate in the discussion (minimum 2, maximum 4)",
  "aiDiscussion.rolesSelected": "roles selected",
  "aiDiscussion.moderatorInfo": "The 1st selected role is the moderator. This role facilitates the conversation, asks clarifying questions, and summarizes.",
  "aiDiscussion.currentModerator": "Current moderator",
  "aiDiscussion.backToGoals": "Back to goals",
  "aiDiscussion.startDiscussion": "Start discussion",
  "aiDiscussion.configureStyles": "Configure Styles",
  "aiDiscussion.stylesConfiguration": "Style Configuration",
  "aiDiscussion.stylesConfigurationDesc": "Adjust the communication style and tone of the discussion",
  "aiDiscussion.configureRoleStyles": "Configure Role Styles",
  "aiDiscussion.configureRoleStylesDesc": "Set the communication style per role",
  "aiDiscussion.communicationTone": "Communication Tone",
  "aiDiscussion.interactionPattern": "Interaction Pattern & Questioning",
  "aiDiscussion.depthFocus": "Depth & Focus",
  "aiDiscussion.backToRoles": "Back to roles",
  "aiDiscussion.moderator": "Moderator",

  "discussionStyles.adjustTitle": "Adjust Discussion Styles",
  "discussionStyles.adjustDescription": "Adjust the discussion styles for each role. These changes apply to future messages in the discussion.",
  "discussionStyles.communicationTone": "Communication Tone",
  "discussionStyles.interactionPattern": "Interaction Pattern",
  "discussionStyles.depthFocus": "Depth & Focus",

  // AI Discussion style categories
  "aiDiscussion.category.vision": "Vision & Concept Validation",
  "aiDiscussion.category.lean": "Lean Finance & Resources",
  "aiDiscussion.category.execution": "Speed & Agile Execution",
  "aiDiscussion.category.people": "People, Talent & Culture",
  "aiDiscussion.category.market": "Market & Adoption",

  // AI Discussion styles (names and descriptions by ID)
  "aiDiscussion.styles.concise_direct.name": "Concise & Direct",
  "aiDiscussion.styles.concise_direct.desc": "Delivers curt, to-the-point answers without much embellishment.",
  "aiDiscussion.styles.elaborate_indepth.name": "Elaborate & In-depth",
  "aiDiscussion.styles.elaborate_indepth.desc": "Provides detailed analyses, context, and extensive explanations.",
  "aiDiscussion.styles.encouraging_positive.name": "Encouraging & Positive",
  "aiDiscussion.styles.encouraging_positive.desc": "Focuses on opportunities, strengths, and potential, with an optimistic and motivating tone.",
  "aiDiscussion.styles.critical_challenging.name": "Critical & Challenging",
  "aiDiscussion.styles.critical_challenging.desc": "Questions the status quo, seeks out weaknesses, and challenges assumptions.",
  "aiDiscussion.styles.highly_questioning.name": "Highly Questioning",
  "aiDiscussion.styles.highly_questioning.desc": "Often responds with open-ended questions to dig deeper and gather more information.",
  "aiDiscussion.styles.solution_oriented.name": "Solution-Oriented",
  "aiDiscussion.styles.solution_oriented.desc": "Focuses directly on proposing concrete solutions and action plans for discussed problems.",
  "aiDiscussion.styles.collaborative.name": "Collaborative",
  "aiDiscussion.styles.collaborative.desc": "Seeks consensus, builds upon existing ideas, and facilitates joint conclusions.",
  "aiDiscussion.styles.drawing_comparisons.name": "Drawing Comparisons",
  "aiDiscussion.styles.drawing_comparisons.desc": "Draws parallels with other situations, best practices, or industry standards.",
  "aiDiscussion.styles.action_oriented.name": "Action-Oriented",
  "aiDiscussion.styles.action_oriented.desc": "Consistently steers the discussion towards concrete steps, responsibilities, and the next logical actions.",
  "aiDiscussion.styles.big_picture_thinker.name": "Big Picture Thinker",
  "aiDiscussion.styles.big_picture_thinker.desc": "Places details in a broader context, connects topics to higher goals and overarching strategies.",
  "aiDiscussion.styles.narrative_example_rich.name": "Narrative & Example-Rich",
  "aiDiscussion.styles.narrative_example_rich.desc": "Explains concepts and supports arguments with relevant scenarios or examples for greater vividness and understanding.",

  // AI Discussion goals (names and descriptions by ID)
  "aiDiscussion.goal.v1": "Core Hypothesis Validation",
  "aiDiscussion.goal.v1Desc": "What must absolutely be true for this idea to succeed, and how do we test it quickly?",
  "aiDiscussion.goal.v2": "Blue Sky Ideation",
  "aiDiscussion.goal.v2Desc": "Exploring the most ambitious and 'wildest' versions of the idea.",
  "aiDiscussion.goal.v3": "Minimum Viable Solution (MVP) Definition",
  "aiDiscussion.goal.v3Desc": "What is the smallest, fastest version we can build to deliver value?",
  "aiDiscussion.goal.v4": "Scenario Development (Best & Worst Case)",
  "aiDiscussion.goal.v4Desc": "What are the most extreme success and failure scenarios and how do we respond?",
  "aiDiscussion.goal.v5": "Core Values and Brand Positioning",
  "aiDiscussion.goal.v5Desc": "What emotion or problem do we primarily solve and how do we translate this to our identity?",
  "aiDiscussion.goal.l1": "Cost-Smart Implementation Paths",
  "aiDiscussion.goal.l1Desc": "How can we execute this initiative with minimal initial investments (bootstrapping)?",
  "aiDiscussion.goal.l2": "Possible Revenue Streams",
  "aiDiscussion.goal.l2Desc": "Brainstorming all possible ways to make money (direct, indirect, data).",
  "aiDiscussion.goal.l3": "Efficient Use of Current Resources",
  "aiDiscussion.goal.l3Desc": "How can we deploy existing talents, systems or partners to save costs?",
  "aiDiscussion.goal.l4": "Focus on Early Cashflow",
  "aiDiscussion.goal.l4Desc": "Which parts of the idea can generate money fastest to finance the rest?",
  "aiDiscussion.goal.l5": "Resource Bartering / Partnerships",
  "aiDiscussion.goal.l5Desc": "What value can we offer partners in exchange for their resources or expertise?",
  "aiDiscussion.goal.u1": "Feature Prioritization (Must/Should/Could)",
  "aiDiscussion.goal.u1Desc": "Determining which functions are crucial for the MVP and which are luxury.",
  "aiDiscussion.goal.u2": "Timeline Acceleration",
  "aiDiscussion.goal.u2Desc": "How can we accelerate the delivery of the first version by 30%?",
  "aiDiscussion.goal.u3": "Dependency Elimination",
  "aiDiscussion.goal.u3Desc": "How do we make ourselves less dependent on slow or expensive external factors?",
  "aiDiscussion.goal.u4": "Operational Simplicity",
  "aiDiscussion.goal.u4Desc": "How do we design the process so it's scalable with minimal effort?",
  "aiDiscussion.goal.u5": "Feedback Loop Design",
  "aiDiscussion.goal.u5Desc": "How do we create the fastest and most effective mechanism to collect and process feedback from early users?",
  "aiDiscussion.goal.m1": "Identifying Critical Talent Gaps",
  "aiDiscussion.goal.m1Desc": "What critical expertise are we currently missing to build this?",
  "aiDiscussion.goal.m2": "Attracting Early Adopters (Internal & External)",
  "aiDiscussion.goal.m2Desc": "How do we make the first customers/employees excited and willing to take risks?",
  "aiDiscussion.goal.m3": "Small Team Structure",
  "aiDiscussion.goal.m3Desc": "How do we assemble the most effective, compact team for the first 6 months?",
  "aiDiscussion.goal.m4": "Stimulating Mindset Change",
  "aiDiscussion.goal.m4Desc": "How do we communicate this idea to reduce organizational resistance and spark curiosity?",
  "aiDiscussion.goal.m5": "Fast Decision Framework",
  "aiDiscussion.goal.m5Desc": "How do we accelerate decision-making around this project?",
  "aiDiscussion.goal.a1": "Creative Solutions for Legal Frameworks",
  "aiDiscussion.goal.a1Desc": "How can we be innovative within existing laws and regulations?",
  "aiDiscussion.goal.a2": "Zero Budget Marketing",
  "aiDiscussion.goal.a2Desc": "What guerrilla marketing or viral strategies can we use?",
  "aiDiscussion.goal.a3": "Competitive Advantage through Process",
  "aiDiscussion.goal.a3Desc": "What can we do better or differently than competitors that's barely copyable?",
  "aiDiscussion.goal.a4": "Early Market Segmentation",
  "aiDiscussion.goal.a4Desc": "Who are the first 100 customers we absolutely want to win and why?",
  "aiDiscussion.goal.a5": "Integral Innovation Analysis",
  "aiDiscussion.goal.a5Desc": "How can this idea help every department become more innovative?",

  // AI Discussion roles (names and descriptions by ID)
  "aiDiscussion.role.ceo": "CEO",
  "aiDiscussion.role.ceoDesc": "Chief Executive Officer – Focus on vision, market leadership and long-term strategy",
  "aiDiscussion.role.cfo": "CFO",
  "aiDiscussion.role.cfoDesc": "Chief Financial Officer – Focus on budget, ROI, financial risks and scalability",
  "aiDiscussion.role.hr_hoofd": "Head of HR & Culture",
  "aiDiscussion.role.hr_hoofdDesc": "Focus on personnel impact, talent acquisition and organizational change",
  "aiDiscussion.role.juridisch_directeur": "Director of Legal Affairs",
  "aiDiscussion.role.juridisch_directeurDesc": "Focus on compliance, legislation and ethical risks",
  "aiDiscussion.role.cpo": "CPO",
  "aiDiscussion.role.cpoDesc": "Chief Product Officer – Focus on product development, user experience and roadmap",
  "aiDiscussion.role.marketing_specialist": "Marketing Specialist",
  "aiDiscussion.role.marketing_specialistDesc": "Focus on market positioning, customer segmentation and communication",
  "aiDiscussion.role.verkoopdirecteur": "Sales Director",
  "aiDiscussion.role.verkoopdirecteurDesc": "Focus on sales channels, revenue forecasts and customer acquisition",
  "aiDiscussion.role.customer_success": "Customer Success Lead",
  "aiDiscussion.role.customer_successDesc": "Focus on customer satisfaction, retention and service quality",
  "aiDiscussion.role.product_owner": "Product Owner",
  "aiDiscussion.role.product_ownerDesc": "Attention to details, clarity, alignment with customers, and fit with the current product",
  "aiDiscussion.role.lead_architect": "Lead IT Architect",
  "aiDiscussion.role.lead_architectDesc": "Focus on technical infrastructure, security and integration",
  "aiDiscussion.role.data_analist": "Data Analyst",
  "aiDiscussion.role.data_analistDesc": "Focus on measurability, data quality and insights",
  "aiDiscussion.role.security_expert": "Security Expert",
  "aiDiscussion.role.security_expertDesc": "Focus on data security, privacy (GDPR) and cyber risks",
  "aiDiscussion.role.devops_engineer": "DevOps Engineer",
  "aiDiscussion.role.devops_engineerDesc": "Focus on deployment speed, automation and operational stability",
  "aiDiscussion.role.operationeel_manager": "Operations Manager",
  "aiDiscussion.role.operationeel_managerDesc": "Focus on efficiency, process optimization and resource management",
  "aiDiscussion.role.project_manager": "Project/Program Manager",
  "aiDiscussion.role.project_managerDesc": "Focus on planning, milestones, scope management and delivery",
  "aiDiscussion.role.kwaliteitsmanager": "Quality Manager",
  "aiDiscussion.role.kwaliteitsmanagerDesc": "Focus on standards, audit procedures and error reduction",
  "aiDiscussion.role.innovatie_manager": "Innovation Manager",
  "aiDiscussion.role.innovatie_managerDesc": "Focus on new technologies, experiments and disruption",
  "aiDiscussion.role.duurzaamheidsadviseur": "Sustainability Advisor",
  "aiDiscussion.role.duurzaamheidsadviseurDesc": "Focus on ecological and social impact (ESG)",
  "aiDiscussion.role.externe_consultant": "External Consultant (Neutral)",
  "aiDiscussion.role.externe_consultantDesc": "Focus on best practices, external benchmarks and independent advice",
  "aiDiscussion.role.eindgebruiker": "End User/Customer Representative",
  "aiDiscussion.role.eindgebruikerDesc": "Focus on the actual needs and problems of the user",
  "aiDiscussion.role.interne_auditor": "Internal Auditor",
  "aiDiscussion.role.interne_auditorDesc": "Focus on risk control and compliance with internal policies",
  "aiDiscussion.role.invester": "The Investor",
  "aiDiscussion.role.investerDesc": "Focus on opportunities, costs, profitability and time to market",
  "aiDiscussion.role.generaal": "The General",
  "aiDiscussion.role.generaalDesc": "Wants structure, alignment, makes decisions when facing multiple options, cuts the knot",
  "aiDiscussion.role.storyteller": "Storyteller",
  "aiDiscussion.role.storytellerDesc": "Crafts narratives, simplifies complex ideas, and frames messages for different audiences",
  "aiDiscussion.role.dromer": "Dreamer",
  "aiDiscussion.role.dromerDesc": "Vision-oriented, imagines ideal scenarios, pushes boundaries and inspires new directions",
  "aiDiscussion.role.skeptische_advocaat": "Devil's Advocate",
  "aiDiscussion.role.skeptische_advocaatDesc": "Challenges assumptions, identifies risks, and asks critical questions",
  "aiDiscussion.role.gamification_architect": "Gamification Architect",
  "aiDiscussion.role.gamification_architectDesc": "Designs engagement mechanics, incentives, and challenges to motivate behavior",
  "aiDiscussion.role.ethicus_impact_analist": "Ethics & Impact Analyst",
  "aiDiscussion.role.ethicus_impact_analistDesc": "Evaluates moral implications, societal impact, and compliance with ethical standards",

  manageSubscriptionDesc: "View and modify your payment information via Stripe",
  customerPortalTitleDiamond: "Manage RecapHorizon subscription",
  customerPortalTitle: "Stripe Customer Portal",
  diamondHeaderDesc: "Manage your Diamond subscription via the secure Stripe customer portal.",
  portalHeaderDesc: "Manage your subscription, payment methods, and billing details in a secure environment.",
  diamondSectionTitle: "As a Diamond user, you can:",
  portalSectionTitle: "In the Customer Portal, you can:",
  diamondBulletStop: "Stop Diamond subscription",
  bulletPaymentMethodsManage: "Manage payment methods",
  bulletInvoiceDetailsUpdate: "Update billing details and address",
  bulletInvoiceHistory: "View invoice history",
  generalBulletChangePlan: "Upgrade, downgrade or cancel subscription",
  bulletPaymentMethodsAddModify: "Add or modify payment methods",
  generalBulletInvoiceHistoryDownload: "View and download invoice history",
  generalBulletNextBillingDate: "See next billing date",
  diamondSubscriptionManaged: "Diamond subscriptions are managed by administrators",
  subscriptionPortalError: "An error occurred while opening the billing portal. Please try again.",
  subscriptionCancel: "Cancel Subscription",
  subscriptionCancelDesc: "Cancel your subscription - remains active until end of period",
  subscriptionCancelConfirm: "Are you sure you want to cancel your subscription? You'll retain access to your current features until the end of your billing period.",
  subscriptionCancelPending: "Your cancellation has been submitted. Your subscription will remain active until the end of your current billing period.",
  subscriptionStopRecapHorizon: "Stop RecapHorizon",
  subscriptionStopRecapHorizonDesc: "Manage your Diamond subscription via Stripe portal",
  subscriptionScheduledChanges: "Scheduled Changes",
  subscriptionScheduledCancel: "Subscription will be cancelled",
  subscriptionScheduledDowngrade: "Downgrade to {tier}",
  subscriptionEffectiveDate: "Effective date",
  dateUnknown: "Unknown date",
  // Goodbye modal and reactivation label
  subscriptionCancelGoodbyeTitle: "Sorry to see you go",
  subscriptionCancelGoodbyeMessage: "Sorry to see you go. We hope RecapHorizon was a great help for you!",
  subscriptionCancelActiveUntil: "Your current price tier remains active until",
  subscriptionCancelFallbackToFree: "After that, you will automatically fall back to the Free tier.",
  subscriptionReactivate: "Re-activate...",
  subscriptionReactivated: "Subscription successfully reactivated! It will become active on the scheduled date.",
  pricingReactivateError: "An error occurred while reactivating the subscription. Please try again.",
  
  // Reactivation Success Modal
  subscriptionReactivationSuccessTitle: "Welcome back!",
  subscriptionReactivationSuccessMessage: "Great to have you back! Your subscription has been successfully reactivated.",
  subscriptionReactivationActiveFrom: "Your subscription will become active again on",
  subscriptionReactivationEnjoy: "Thank you for choosing RecapHorizon again. Enjoy all the features!",
  subscriptionReactivationPortalInfo: "Want to manage your subscription or view billing details?",

  // Tier Names
  tierFree: "Free",
  tierSilver: "Silver",
  tierGold: "Gold",
  tierDiamond: "Diamond",
  tierEnterprise: "Enterprise",

  // Pricing Stripe Footnote
  pricingStripeFootnote: "Payments are securely processed via <a href=\"https://stripe.com\" target=\"_blank\" rel=\"noopener noreferrer\" class=\"text-blue-600 hover:text-blue-800 underline\">Stripe.com</a>, the world leader in trusted and secure online payment solutions.",

  // Usage Modal
  usageOverview: "Usage Overview",
  currentPlan: "Current Plan",
  tokenUsage: "Token Usage",
  sessionUsage: "Session Usage (audio sessions)",
  unlimitedSessions: "Unlimited Sessions",
  loadingUsage: "Loading usage data...",
  upgradeForMore: "Upgrade for more",
  upgradeDescription: "Upgrade your subscription for more tokens and sessions",
  changePlan: "Change Plan",

  // Audio Limit Modal
  audioLimitReached: "Audio Limit Reached",
  monthlyAudioLimitExceeded: "You have reached your monthly audio limit.",
  freeMonthlyLimit: "Free users can record up to 60 minutes per month.",
  silverMonthlyLimit: "Silver users can record up to 500 minutes per month.",
  goldMonthlyLimit: "Gold users can record up to 1000 minutes per month.",
  upgradeToSilver: "Upgrade to Silver",
  upgradeToGold: "Upgrade to Gold",
  viewPricingOptions: "View Pricing Options",
  minutesUsedThisMonth: "Minutes used this month",
  minutesRemaining: "Minutes remaining",
  monthlyUsage: "Monthly usage",
  sessionRecordingTime: "Session recording time",
  
  // Audio Usage Meter
  unlimitedAudio: "Unlimited audio - no restrictions!",
  approachingAudioLimit: "You are approaching your monthly audio limit. Consider upgrading to a higher plan.",

  // Subscription Success Modal
  yourSubscriptionIsActive: "Your {tierName} subscription is active",
  subscriptionActiveImmediately: "Your subscription is immediately active and you have full access to all features.",
  featuresAvailable: "What you now have access to:",
  nextSteps: "Next Steps",
  confirmationEmail: "You will receive a confirmation email from Stripe",
  allFeaturesAvailable: "All {tierName} features are now available",
  manageSubscriptionViaSettings: "You can manage your subscription via the settings",
  pdfExport: "PDF export",
  wordExport: "Word export",
  powerpointExport: "PowerPoint export",
  businessCaseGenerator: "Business Case Generator",
  webPageImport: "Web Page Import",
  emailSupport: "Email support"

  // Referral Program
,referralProgramTitle: "Referral Program"
,referralWhatIsIt: "What is this?"
,referralIntro: "Earn 1 dollar per month recurring commission on every paid subscription you refer."
,referralRulePaidCustomer: "You must be a paying customer to enroll."
,referralRulePayment: "Payouts are made monthly via PayPal."
,referralRulePaypal: "A valid PayPal.Me link is required to receive payouts."
,referralRuleJoinUrl: "Your unique join URL automatically signs new users up as your referrals."
,referralRulePayoutSchedule: "Commissions accrue monthly and are paid out within 7 days after month end."
,referralRuleFree: "New users start on the free plan; once they choose a paid subscription, your referral starts and pays monthly."
  ,referralAlreadyEnrolled: "You're enrolled in the referral program."
  ,referralYourJoinUrl: "Your join URL"
  ,referralEnrollButton: "Enroll now"
  ,referralDashboardTitle: "Referral Dashboard"
  ,referralNeedEnroll: "You need to enroll to see your referral dashboard."
  ,referralEarningsTotal: "Total earnings"
  ,referralEarningsMonth: "Earnings this month"
  ,referralColEmail: "Email"
  ,referralColCurrentTier: "Current Tier"
  ,referralColMonthStartTier: "Start-of-month Tier"
  ,referralNoEntries: "No referral entries yet."
  ,referralPaypalMeDesc: "We use PayPal.Me for simple, secure payouts."
  ,referralPaypalLearnMore: "Learn more"
  ,referralPaypalMeLabel: "Your PayPal.Me link"
  ,referralPaypalInvalid: "Please enter a valid PayPal.Me link like https://paypal.me/yourname"
  ,referralSignupTitle: "Enroll in Referral Program"
  ,referralGenerateCode: "Generate referral code"
  ,referralYourCode: "Your referral code"
  ,referralJoinUrl: "Your join URL"
  ,mustBeLoggedIn: "You must be logged in to continue."
  ,copy: "Copy"
  ,referralEnrollSuccess: "You're enrolled! Your referral profile has been saved."
  ,referralEnrollError: "Could not enroll in the referral program. Please try again."
  ,welcomeNewReferral: "Welcome! Your account was created using a referral."
  ,referralExportPdf: "Export PDF"
  ,referralExportError: "Export failed. Please try again."
  ,referralOneTimeWarning: "IMPORTANT: This code is provided only ONCE! Copy and save it carefully."
  ,copyCode: "Copy code"
  ,referralInstructions: "Instructions:"
  ,referralInstruction1: "Share this URL with people who want to sign up (for free)"
  ,referralInstruction2: "The URL can be used by everyone"
  ,referralInstruction3: "Save the URL in a safe place"
  ,referralInstruction4: "For communication with RecapHorizon about your referral program, always provide your unique code"

  // Cancellation Confirmation Modal
  ,cancellationConfirmationTitle: "Cancel Subscription"
  ,cancellationSadTitle: "We're sorry to see you go"
  ,cancellationSadSubtitle: "Your feedback helps us improve"
  ,cancellationCurrentPlan: "Current plan"
  ,cancellationActiveUntil: "Active until {date}"
  ,cancellationWillLose: "What you'll lose:"
  ,cancellationFeatureTokens: "Increased token limits"
  ,cancellationFeatureSessions: "More sessions per month"
  ,cancellationFeatureAudioTime: "Longer audio recording time"
  ,cancellationFeaturePowerPoint: "PowerPoint export feature"
  ,cancellationFeatureBusinessCase: "Business case generator"
  ,cancellationFeatureChat: "Chat with transcript"
  ,cancellationFeatureUnlimited: "Unlimited tokens and sessions"
  ,cancellationFeaturePriority: "Priority support"
  ,cancellationFreeTierTitle: "What you'll keep with the free tier:"
  ,cancellationFreeBenefit1: "Basic transcription functionality"
  ,cancellationFreeBenefit2: "Limited monthly tokens"
  ,cancellationFreeBenefit3: "Access to all basic features"
  ,cancellationEffectiveDate: "Effective date"
  ,cancellationWillTakeEffect: "Cancellation will take effect on {date}"
  ,cancellationConfirmed: "Confirmed"
  ,cancellationEnabled: "Cancellation button enabled"
  ,cancellationSliderText: "Slide to enable cancellation button"
  ,confirmCancellation: "Confirm Cancellation"
  ,keepSubscription: "Keep subscription"
  ,cancellationAdditionalInfo: "You can reactivate your subscription at any time."
  ,cancellationReactivateInfo: "All features remain available until the expiration date."
  ,cancellationError: "An error occurred while cancelling. Please try again."

  // Downgrade Confirmation Modal
  ,downgradeConfirmationTitle: "Downgrade Subscription"
  ,downgradeWarningTitle: "Warning: You're about to downgrade"
  ,downgradeWarningSubtitle: "Some features will no longer be available"
  ,newTier: "New tier"
  ,downgradeWillLose: "Features you'll lose:"
  ,downgradeFeatureLimitedTokens: "Limited token limits"
  ,downgradeFeatureLimitedSessions: "Limited sessions per month"
  ,downgradeFeatureNoPowerPoint: "No PowerPoint export"
  ,downgradeFeatureNoBusinessCase: "No business case generator"
  ,downgradeEffectiveDate: "Effective date"
  ,downgradeWillTakeEffect: "Downgrade will take effect on {date}"
  ,downgradeConfirmed: "Confirmed"
  ,downgradeEnabled: "Downgrade button enabled"
  ,downgradeSliderText: "Slide to enable downgrade button"
  ,confirmDowngrade: "Confirm Downgrade"
  ,downgradeAdditionalInfo: "You can upgrade to a higher plan at any time."
  ,downgradeError: "An error occurred while downgrading. Please try again."

  // Opportunities module
  ,opportunities: "Opportunities"
  ,opportunitiesTitle: "Opportunities Generation"
  ,opportunitiesDescription: "Discover new business opportunities and possibilities based on your content"
  ,opportunitiesFeatureUpgrade: "Opportunities generation is available from Silver tier. Upgrade your subscription to discover AI-generated business opportunities."
  ,opportunitiesAccessRestricted: "Opportunities generation is available from Silver tier. Upgrade to use this functionality."
  ,opportunitiesUpgradeRequired: "Upgrade required for Opportunities Generation"
  ,opportunitiesUpgradeMessage: "Opportunities generation is available for Silver, Gold, Diamond and Enterprise users. This functionality provides AI-generated business opportunities and possibilities."
  ,opportunitiesAvailableForTiers: "Available for:"
  ,opportunitiesUpgradeNote: "Upgrade your subscription to access this advanced AI functionality."

  // Opportunities workflow
  ,opportunitiesSelectTopic: "Select a topic"
  ,opportunitiesSelectTopicDesc: "Choose the topic for opportunities generation"
  ,opportunitiesSelectRole: "Select an AI role"
  ,opportunitiesSelectRoleDesc: "Choose which AI expert will analyze the opportunities"
  ,opportunitiesSelectType: "Select opportunity type"
  ,opportunitiesSelectTypeDesc: "Choose the type of opportunities you want to explore"
  ,opportunitiesGenerate: "Generate Opportunities"
  ,opportunitiesGenerating: "Generating opportunities..."
  ,opportunitiesGeneratingDesc: "AI is analyzing your content and generating relevant business opportunities..."
  ,opportunitiesComplete: "Opportunities generated"
  ,opportunitiesRegenerateAnalysis: "Regenerate opportunities"
  ,opportunitiesStartNewAnalysis: "Start new opportunities analysis"
  ,opportunitiesCopyAnalysis: "Copy opportunities"
  ,opportunitiesAnalysisCopied: "Opportunities copied to clipboard"

  // Opportunities roles
  ,"opportunities.role.strategic-advisor": "The Strategic Advisor"
  ,"opportunities.role.strategic-advisorDesc": "Focuses on long-term vision, market leadership, and overarching growth strategies."
  ,"opportunities.role.marketing-director": "The Marketing Director"
  ,"opportunities.role.marketing-directorDesc": "Focuses on brand positioning, campaign ideas, and effective target audience reach."
  ,"opportunities.role.sales-expert": "The Sales Expert"
  ,"opportunities.role.sales-expertDesc": "Analyzes sales strategies, lead generation, and conversion optimization."
  ,"opportunities.role.product-manager": "The Product Manager"
  ,"opportunities.role.product-managerDesc": "Focuses on product development, feature expansion, and user experience (UX) enhancement."
  ,"opportunities.role.innovation-specialist": "The Innovation Specialist"
  ,"opportunities.role.innovation-specialistDesc": "Generates disruptive ideas, R&D directions, and out-of-the-box solutions."
  ,"opportunities.role.financial-analyst": "The Financial Analyst"
  ,"opportunities.role.financial-analystDesc": "Identifies cost savings, investment opportunities, and revenue streams."
  ,"opportunities.role.operations-director": "The Operations Director"
  ,"opportunities.role.operations-directorDesc": "Focuses on process optimization, workflow improvement, and operational scalability."
  ,"opportunities.role.hr-manager": "The HR Manager"
  ,"opportunities.role.hr-managerDesc": "Explores opportunities for talent development, employee satisfaction, and retention."
  ,"opportunities.role.customer-service-expert": "The Customer Service Expert"
  ,"opportunities.role.customer-service-expertDesc": "Seeks ways to increase customer satisfaction and support efficiency."
  ,"opportunities.role.business-development-manager": "The Business Development Manager"
  ,"opportunities.role.business-development-managerDesc": "Uncovers new business opportunities, potential partnerships, and strategic alliances."
  ,"opportunities.role.data-analyst": "The Data Analyst"
  ,"opportunities.role.data-analystDesc": "Analyzes data collection, reporting needs, and data-driven decision-making."
  ,"opportunities.role.legal-advisor": "The Legal Advisor"
  ,"opportunities.role.legal-advisorDesc": "Identifies compliance opportunities, legal risks, and ethical considerations."
  ,"opportunities.role.technology-strategist": "The Technology Strategist"
  ,"opportunities.role.technology-strategistDesc": "Advises on new technology adoption, IT infrastructure, and digital transformation."
  ,"opportunities.role.csr-esg-specialist": "The CSR / ESG Specialist"
  ,"opportunities.role.csr-esg-specialistDesc": "Focuses on corporate social responsibility, sustainability, and social impact."
  ,"opportunities.role.internal-communications-specialist": "The Internal Communications Specialist"
  ,"opportunities.role.internal-communications-specialistDesc": "Analyzes knowledge sharing, internal communication flows, and employee engagement."
  ,"opportunities.role.external-communications-specialist": "The External Communications Specialist"
  ,"opportunities.role.external-communications-specialistDesc": "Generates ideas for public relations, stakeholder communication, and reputation management."
  ,"opportunities.role.project-manager": "The Project Manager"
  ,"opportunities.role.project-managerDesc": "Provides insights into project planning, resource allocation, and risk management within projects."
  ,"opportunities.role.training-development-specialist": "The Training & Development Specialist"
  ,"opportunities.role.training-development-specialistDesc": "Identifies training needs, skill gaps, and learning opportunities."
  ,"opportunities.role.international-expansion-expert": "The International Expansion Expert"
  ,"opportunities.role.international-expansion-expertDesc": "Advises on globalization strategies, local adaptation, and international market entry."
  ,"opportunities.role.customer-journey-mapper": "The Customer Journey Mapper"
  ,"opportunities.role.customer-journey-mapperDesc": "Analyzes the complete customer journey, identifying pain points and improvement opportunities."
  ,"opportunities.role.content-strategist": "The Content Strategist"
  ,"opportunities.role.content-strategistDesc": "Focuses on content creation, distribution channels, storytelling, and SEO/SEA implications."
  ,"opportunities.role.talent-acquisition-specialist": "The Talent Acquisition Specialist"
  ,"opportunities.role.talent-acquisition-specialistDesc": "Looks for opportunities in recruitment strategies, employer branding, and talent pools."
  ,"opportunities.role.sustainability-analyst": "The Sustainability Analyst"
  ,"opportunities.role.sustainability-analystDesc": "Evaluates environmental impact, circular economy, and green initiatives."
  ,"opportunities.role.innovation-facilitator": "The Innovation Facilitator"
  ,"opportunities.role.innovation-facilitatorDesc": "Facilitates brainstorming sessions, idea generation, and validation of new concepts."
  ,"opportunities.role.policymaker": "The Policymaker"
  ,"opportunities.role.policemakerDesc": "Advises on internal company policies, ethical guidelines, and governance structures."

  // Opportunities types - 14 comprehensive types
  ,"opportunities.type.new-product-development": "New Product or Service Development"
  ,"opportunities.type.new-product-developmentDesc": "Suggestions for entirely new products, services, or features to develop"
  ,"opportunities.type.market-expansion": "Market Expansion & Segmentation"
  ,"opportunities.type.market-expansionDesc": "Opportunities to enter new geographical markets or customer segments"
  ,"opportunities.type.process-optimization": "Process Optimization & Efficiency"
  ,"opportunities.type.process-optimizationDesc": "Suggestions for streamlining workflows and increasing operational efficiency"
  ,"opportunities.type.cost-reduction": "Cost Reduction"
  ,"opportunities.type.cost-reductionDesc": "Identification of areas where costs can be reduced without compromising quality"
  ,"opportunities.type.customer-engagement": "Customer Engagement & Loyalty"
  ,"opportunities.type.customer-engagementDesc": "Ideas to improve customer interaction and increase their loyalty"
  ,"opportunities.type.partnerships": "Partnership & Alliances"
  ,"opportunities.type.partnershipsDesc": "Potential collaborations with other companies or strategic partners"
  ,"opportunities.type.competitive-advantage": "Competitive Advantage"
  ,"opportunities.type.competitive-advantageDesc": "Ways to differentiate from competitors and create unique value propositions"
  ,"opportunities.type.risk-prevention": "Risk Prevention & Mitigation"
  ,"opportunities.type.risk-preventionDesc": "Opportunities to identify potential risks and strategies to prevent them"
  ,"opportunities.type.knowledge-sharing": "Internal Knowledge Sharing & Training"
  ,"opportunities.type.knowledge-sharingDesc": "Opportunities to improve internal knowledge transfer and employee skills"
  ,"opportunities.type.revenue-growth": "Revenue Growth"
  ,"opportunities.type.revenue-growthDesc": "Strategies to increase revenue through pricing optimization or new business models"
  ,"opportunities.type.sustainability": "Sustainability & Social Impact"
  ,"opportunities.type.sustainabilityDesc": "Opportunities to integrate sustainable practices and increase social impact"
  ,"opportunities.type.employer-branding": "Employer Branding & Talent Acquisition"
  ,"opportunities.type.employer-brandingDesc": "Opportunities to make the company more attractive to top talent and improve recruitment strategy"
  ,"opportunities.type.technology-adoption": "Technology Adoption & Integration"
  ,"opportunities.type.technology-adoptionDesc": "Possibilities to implement new technologies or integrate existing systems"
  ,"opportunities.type.ux-improvement": "User Experience (UX) Improvement"
  ,"opportunities.type.ux-improvementDesc": "Opportunities to optimize the usability and overall experience of the app/service"
  ,"opportunities.type.niche-targeting": "Niche Targeting"
  ,"opportunities.type.niche-targetingDesc": "Opportunities to identify and serve specific, underserved niche markets"
  ,"opportunities.type.financial-injection": "Financial Injection & Funding"
  ,"opportunities.type.financial-injectionDesc": "Opportunities for attracting investments, grants, or optimizing capital flows"
  ,"opportunities.type.internal-communication": "Internal Communication Improvement"
  ,"opportunities.type.internal-communicationDesc": "Opportunities to enhance the clarity and effectiveness of communication within the organization"
  ,"opportunities.type.automation-ai": "Automation & AI Application"
  ,"opportunities.type.automation-aiDesc": "Opportunities to automate manual tasks and leverage AI for smarter decision-making"
  ,"opportunities.type.reputation-management": "Reputation Management"
  ,"opportunities.type.reputation-managementDesc": "Opportunities to improve public perception, foster positive messaging, and manage criticism"



  // Opportunities errors
  ,opportunitiesTopicGenerationError: "An error occurred while generating topics"
  ,opportunitiesGenerationError: "An error occurred while generating opportunities"
  ,opportunitiesServerOverloadError: "The AI service is currently overloaded. Please try again in a few minutes."
  ,opportunitiesQuotaExceededError: "Daily AI usage limit reached. Please try again later or upgrade your subscription."
  ,opportunitiesNetworkError: "Network error connecting to AI service. Check your internet connection and try again."
  ,opportunitiesRateLimitWarning: "Please wait... You can try again in a few seconds."

  // Opportunities navigation
  ,opportunitiesBackToTopics: "Back to topics"
  ,opportunitiesBackToRoles: "Back to roles"
  ,opportunitiesBackToTypes: "Back to types"
  ,opportunitiesRefreshTopics: "Refresh topics"
  ,opportunitiesSelectedTopic: "Selected topic"
  ,opportunitiesSelectedRole: "Selected role"
  ,opportunitiesSelectedType: "Selected type"

  // Opportunities status texts
  ,opportunitiesTopicSelected: "1 topic selected"
  ,opportunitiesSelectOneTopic: "Select 1 topic"
  ,opportunitiesRoleSelected: "1 role selected"
  ,opportunitiesSelectOneRole: "Select 1 role"
  ,opportunitiesTypesSelected: "of {total} types selected"
  ,continueToRoles: "Continue to AI roles"
  ,continueToTypes: "Continue to opportunity types"
  ,backToTopics: "Back to topics"
  ,backToRoles: "Back to AI roles"
  ,selectedTopics: "Selected topics"
  ,selectedRoles: "Selected roles"

  // Thinking Partner translations
  ,thinkingPartner: "Thinking Partner"
  ,thinkingPartnerTitle: "Thinking Partner"
  ,thinkingPartnerDescription: "Let AI guide you through structured thinking processes"
  ,selectTopicDesc: "Choose the topic you want to think deeper about"
  ,selectThinkingPartner: "Choose your thinking partner"
  ,selectPartnerDesc: "Select the thinking approach that best fits your question"
  ,thinkingPartnerSelected: "Thinking partner selected"
  ,backToPartners: "Back to partners"

  // Partner names and descriptions
  ,challengeThinking: "Challenge my thinking"
  ,challengeThinkingDesc: "Question assumptions, logic, and blind spots"
  ,reframeLens: "Reframe through a different lens"
  ,reframeLensDesc: "View from new audience POV or positioning angle"
  ,translateGutFeeling: "Translate my gut feeling"
  ,translateGutFeelingDesc: "Give words to tensions and misalignments"
  ,structureThinking: "Structure my messy thinking"
  ,structureThinkingDesc: "Organize ideas into clear structure"
  ,faceDecision: "Help me face the decision"
  ,faceDecisionDesc: "Identify avoided or complicated decisions"
  ,surfaceQuestion: "Surface the deeper question"
  ,surfaceQuestionDesc: "Find the real strategic question underneath"
  ,spotRisks: "Spot execution risks"
  ,spotRisksDesc: "Identify practical implementation challenges"
  ,reverseEngineer: "Reverse-engineer my intuition"
  ,reverseEngineerDesc: "Unravel why an idea feels right"

  // ThinkingPartner component specific keys
  ,"thinkingPartner.challenge-thinking": "Challenge my thinking"
  ,"thinkingPartner.challenge-thinkingDesc": "Question assumptions, logic, and blind spots"
  ,"thinkingPartner.reframe-lens": "Reframe through a different lens"
  ,"thinkingPartner.reframe-lensDesc": "View from new audience POV or positioning angle"
  ,"thinkingPartner.translate-gut-feeling": "Translate my gut feeling"
  ,"thinkingPartner.translate-gut-feelingDesc": "Give words to tensions and misalignments"
  ,"thinkingPartner.structure-thinking": "Structure my messy thinking"
  ,"thinkingPartner.structure-thinkingDesc": "Organize ideas into clear structure"
  ,"thinkingPartner.face-decision": "Help me face the decision"
  ,"thinkingPartner.face-decisionDesc": "Identify avoided or complicated decisions"
  ,"thinkingPartner.surface-question": "Surface the deeper question"
  ,"thinkingPartner.surface-questionDesc": "Find the real strategic question underneath"
  ,"thinkingPartner.spot-risks": "Spot execution risks"
  ,"thinkingPartner.spot-risksDesc": "Identify practical implementation challenges"
  ,"thinkingPartner.reverse-engineer": "Reverse-engineer my intuition"
  ,"thinkingPartner.reverse-engineerDesc": "Unravel why an idea feels right"

  // Analysis
  ,analyzingWithPartner: "Analyzing with {partnerName}..."
  ,analyzingDesc: "Your thinking partner is analyzing the topic and generating insights..."
  ,analysisComplete: "Analysis complete"
  ,regenerateAnalysis: "Regenerate analysis"
  ,startNewAnalysis: "Start new analysis"
  ,copyAnalysis: "Copy analysis"
  ,analysisCopied: "Analysis copied to clipboard"

  // Thinking Partner Prompt Templates
  ,"promptTemplate.challenge-thinking": "Here's what I'm planning: {TOPIC_TITLE} - {TOPIC_DESCRIPTION}. Act as a critical thinker - Question my assumptions, logic, or blind spots - but don't rewrite anything. I want to stress test my own thinking, not get new ideas."
  ,"promptTemplate.reframe-lens": "Here's the core idea I'm working with: {TOPIC_TITLE} - {TOPIC_DESCRIPTION}. Help me reframe it through a different lens - like a new audience POV, emotional trigger, or brand positioning angle."
  ,"promptTemplate.translate-gut-feeling": "Something about this feels off, but I can't explain why: {TOPIC_TITLE} - {TOPIC_DESCRIPTION}. Help me put words to the tension I'm sensing. What might be misaligned or unclear?"
  ,"promptTemplate.structure-thinking": "Here's a braindump of what I'm thinking: {TOPIC_TITLE} - {TOPIC_DESCRIPTION}. Organize this into a clear structure or outline - but don't change the voice or inject new ideas."
  ,"promptTemplate.face-decision": "Here's the context I'm working with: {TOPIC_TITLE} - {TOPIC_DESCRIPTION}. What decision am I avoiding or overcomplicating? Reflect back where I'm hesitating or dragging things out."
  ,"promptTemplate.surface-question": "Here's the situation I'm thinking through: {TOPIC_TITLE} - {TOPIC_DESCRIPTION}. Help me surface the 'real' strategic question underneath this. What should I actually be asking myself?"
  ,"promptTemplate.spot-risks": "This is the strategy I'm planning to roll out: {TOPIC_TITLE} - {TOPIC_DESCRIPTION}. Walk me through how this could go wrong in real-world execution. Think about resourcing, timing, team alignment, dependencies, etc."
  ,"promptTemplate.reverse-engineer": "Here's what I'm thinking, and it feels right to me: {TOPIC_TITLE} - {TOPIC_DESCRIPTION}. Can you help me unpack 'why' this might be a smart move - even if I can't fully explain it yet?"

  // Analysis screen dropdown labels
  ,chooseModeLabel: "Choose mode:"
  ,chooseAnalysisLabel: "Choose analysis:"

  // RecapHorizon panel status
  ,noItems: "(no items)"
  ,selectItems: "(select items)"
  ,itemsSelected: "({count} selected)"
  ,likertStronglyDisagree: "Strongly Disagree"
  ,likertDisagree: "Disagree"
  ,likertNeutral: "Neutral"
  ,likertAgree: "Agree"
  ,likertStronglyAgree: "Strongly Agree"

  // Analysis mode options
  ,analysisResults: "Analysis Results"
  ,advancedFunctions: "Advanced Functions"
  ,selectAnalysis: "-- Select an analysis --"
  ,opportunitiesAnalysis: "Opportunities & Chances"

  // AI Discussion Phase translations (already exist above but adding missing ones)
  ,aiDiscussionAccessRestricted: "AI Discussion is available from Gold tier. Upgrade to access this functionality."
  ,aiDiscussionGenerating: "AI agents discussing..."
  ,aiDiscussionGoalDecisionMaking: "Decision Making"
  ,aiDiscussionGoalDecisionMakingDesc: "Support complex decision-making processes"
  ,aiDiscussionGoalInnovation: "Innovation & Creativity"
  ,aiDiscussionGoalInnovationDesc: "Generate creative solutions and new ideas"
  ,aiDiscussionGoalProblemSolving: "Problem Solving"
  ,aiDiscussionGoalProblemSolvingDesc: "Identify and solve complex problems"
  ,aiDiscussionGoalRiskAssessment: "Risk Assessment"
  ,aiDiscussionGoalRiskAssessmentDesc: "Evaluate and mitigate potential risks"
  ,aiDiscussionGoalStrategyDevelopment: "Strategy Development"
  ,aiDiscussionGoalStrategyDevelopmentDesc: "Develop strategic plans and roadmaps"
  ,aiDiscussionReportCopied: "Discussion report copied to clipboard"
  ,aiDiscussionReportCopy: "Copy Discussion Report"
  ,aiDiscussionReportKeyInsights: "Key Insights"
  ,aiDiscussionReportNextSteps: "Next Steps"
  ,aiDiscussionRoleCEO: "CEO"
  ,aiDiscussionRoleCEODesc: "Strategic leadership and vision"
  ,aiDiscussionRoleCFO: "CFO"
  ,aiDiscussionRoleCFODesc: "Financial strategy and risk management"
  ,aiDiscussionRoleCTO: "CTO"
  ,aiDiscussionRoleCTODesc: "Technical leadership and innovation"
  ,aiDiscussionRoleMarketing: "Marketing Director"
  ,aiDiscussionRoleMarketingDesc: "Market positioning and customer engagement"
  ,aiDiscussionRoleOperations: "Operations Manager"
  ,aiDiscussionRoleOperationsDesc: "Operational efficiency and processes"
  ,aiDiscussionRound: "Round"
  ,aiDiscussionStartNew: "Start New Discussion"
  ,aiImageGeneration: "AI Image Generation"
  
  // Missing translations from Dutch file
  ,analysisError: "Error performing analysis"
  ,ben: "am"
  ,both: "both"
  ,copyError: "Error copying to clipboard"
  ,denk: "think"
  ,discussie: "discussion"
  ,emailComposition: "Email Composition"
  ,emailTemplates: "Email Templates"
  ,errorValidatingReferralCode: "Error validating referral code"
  ,expertHelpAvailability: "Expert Help Availability"
  ,expertHelpAvailabilityText: "Expert help is available 24/7"
  ,expertHelpHowItWorks: "How Expert Help Works"
  ,expertHelpTips: "Expert Help Tips"
  ,faqEmailUpload: "FAQ Email Upload"
  ,faqEmailUploadAnswer: "FAQ Email Upload Answer"
  ,generatingTopics: "Generating topics..."
  ,generatingTopicsDesc: "Generating topics description"
  ,imageColor: "Image Color"
  ,invalidReferralCode: "Invalid referral code"
  ,mckinseyRoleBusinessAnalystDesc: "Business analysis and process optimization"
  ,mckinseyRoleCeoAdvisor: "CEO Advisor"
  ,mckinseyRoleCeoAdvisorDesc: "Strategic leadership and executive guidance"
  ,mckinseyRoleManagementConsultant: "Management Consultant"
  ,mckinseyRoleManagementConsultantDesc: "Management consulting and organizational improvement"
  ,mckinseyRoleStrategyConsultantDesc: "Strategic planning and business development"
  ,mij: "me"
  ,nadenk: "think"
  ,noTopicsGenerated: "No topics generated"
  ,opportunitiesGeneratedAt: "Generated at"
  ,opportunitiesSelectedRoles: "Selected roles"
  ,opportunitiesSelectedTopics: "Selected topics"
  ,opportunitiesSelectedTypes: "Selected types"
  ,opportunity: "Opportunity"
  ,opportunityRole: "Role"
  ,opportunityTopic: "Topic"
  ,opportunityType: "Type"
  ,passwordResetEmailSent: "Password reset email sent"
  ,passwordResetError: "Password reset error"
  ,passwordResetInvalidEmail: "Invalid email for password reset"
  ,passwordResetTooManyRequests: "Too many password reset requests"
  ,passwordResetUserNotFound: "User not found for password reset"
  ,podcastFeatureUpgrade: "Podcast feature upgrade"
  ,previewEmail: "Preview email"
  ,referralCodeNotFound: "Referral code not found"
  ,referralEarningsPreviousMonth: "Referral earnings previous month"
  ,referralWelcomeGreeting: "Referral welcome greeting"
  ,referralWelcomeTitle: "Referral welcome title"
  ,remaining: "remaining"
  ,rollen: "roles"
  ,selectActionAbove: "Select action above"
  ,sessionsThisMonth: "Sessions this month"
  ,settingsAudioCompression: "Audio compression settings"
  ,settingsAudioCompressionDesc: "Audio compression settings description"
  ,settingsAutoStopEnabled: "Auto-stop enabled"
  ,settingsCompressionEnabled: "Compression enabled"
  ,settingsQualityBalanced: "Balanced quality"
  ,settingsQualityFast: "Fast quality"
  ,settingsQualityHigh: "High quality"
  ,settingsStopRecordingAfterCapture: "Stop recording after capture"
  ,settingsStopRecordingDesc: "Stop recording description"
  ,settingsTranscriptionQuality: "Transcription quality"
  ,settingsTranscriptionQualityDesc: "Transcription quality description"
  ,settingsTranscriptionTitle: "Transcription settings"
  ,subject: "subject"
  ,thinkingPartnerMethod: "Thinking partner method"
  ,thinkingPartnerSelectedTopic: "Selected thinking partner topic"
  ,to: "to"
  ,tokensThisMonth: "Tokens this month"
  ,tokensThisPeriod: "Tokens this period"
  ,sessionsThisPeriod: "Sessions this period"
  ,periodStart: "Period start"
  ,periodEnd: "Period end"
  ,daysRemaining: "days remaining"
  ,horizonPackageBuyNow: "Buy now"
  ,pleaseLoginFirst: "Please log in to purchase"
  ,horizonProductMissing: "Product ID missing (config)"
  ,horizonPurchaseFailed: "Could not start Horizon purchase"
  ,topicGenerationError: "Topic generation error"
  ,topicsGenerated: "Topics generated"
  ,transcriptionQuality: "Transcription quality"
  ,transcriptionQualityBalanced: "Balanced transcription quality"
  ,transcriptionQualityFast: "Fast transcription quality"
  ,transcriptionQualityHigh: "High transcription quality"
  ,transcriptionSettings: "Transcription settings"
  ,unlimitedTokens: "Unlimited tokens"
  ,used: "used"
  ,userDocumentCreated: "User document created"
  ,userIdEmptyInEnsureUser: "User ID empty in ensure user"
  ,vergaderdetails: "meeting details"
  ,vergadering: "meeting"
  ,viewPricing: "View pricing"
  ,waarom: "why"
  ,werk: "work"
  
  // AI Discussion - Enthusiasm Meter
  ,"aiDiscussion.enthusiasmLevel": "Enthusiasm Level"
  ,"aiDiscussion.enthusiasmLow": "Pessimistic"
  ,"aiDiscussion.enthusiasmHigh": "Very Enthusiastic"

  // AI Discussion Phase Names
  ,"aiDiscussion.phase.introduction": "Introduction"
  ,"aiDiscussion.phase.problem_analysis": "Problem Analysis"
  ,"aiDiscussion.phase.root_cause": "Root Cause Analysis"
  ,"aiDiscussion.phase.stakeholder_perspective": "Stakeholder Perspective"
  ,"aiDiscussion.phase.solution_generation": "Solution Generation"
  ,"aiDiscussion.phase.critical_evaluation": "Critical Evaluation"
  ,"aiDiscussion.phase.risk_assessment": "Risk Assessment"
  ,"aiDiscussion.phase.implementation_planning": "Implementation Planning"
  ,"aiDiscussion.phase.success_metrics": "Success Metrics"
  ,"aiDiscussion.phase.synthesis": "Synthesis"
  
  // Idea Builder workflow
  ,ideaBuilderTitle: "Idea Builder"
  ,ideaBuilderDesc: "Generate high-quality ideas and outlines based on topic, audience and goals."
  ,ideaBuilderInitialIdea: "Describe your idea"
  ,ideaBuilderInitialIdeaPh: "Write at least 30 characters describing your idea and context"
  ,ideaBuilderMinChars: "Minimum 30 characters required"
  ,ideaBuilderRound1Title: "Round 1: Clarifying Questions"
  ,ideaBuilderRound2Title: "Round 2: Deepening Questions"
  ,ideaBuilderRound3Title: "Round 3: Prioritization (MoSCoW)"
  ,ideaBuilderStepLabel: "Step 1 of 4"
  ,ideaBuilderStepLabel2: "Step 2 of 4"
  ,ideaBuilderStepLabel3: "Step 3 of 4"
  ,ideaBuilderStepLabel4: "Step 4 of 4"
  ,ideaBuilderStartRound1: "Start Round 1"
  ,ideaBuilderContinueToRound2: "Continue to Round 2"
  ,ideaBuilderContinueToRound3: "Continue to Round 3"
  ,ideaBuilderGeneratePlan: "Generate Plan"
  ,ideaBuilderGenerating: "Generating..."
  ,selected: "Selected"

  // Idea Builder Round 3 focus and MoSCoW labels
  ,ideaBuilderFocusType: "Focus for Round 3"
  ,ideaBuilderFocusTypeFunctional: "Functional items"
  ,ideaBuilderFocusTypeWildIdeas: "Wild ideas"
  ,ideaBuilderFocusTypeServices: "Services"
  ,ideaBuilderFocusTypeCombined: "Combined options"
  ,ideaBuilderFocusTypeHint: "This selection guides the 5 items generated in Round 3."
  ,moscowNA: "N/A"
  ,moscowNice: "Nice to have"
  ,moscowCould: "Could have"
  ,moscowShould: "Should have"
  ,moscowMust: "Must have"

  // Idea Builder Help Text
  ,ideaBuilderHelpTitle: "Idea Builder Help"
  ,ideaBuilderHelpWhatIsTitle: "What is Idea Builder?"
  ,ideaBuilderHelpWhatIsDesc: "With Idea Builder you can quickly generate ideas, concepts and outlines based on a topic."
  ,ideaBuilderHelpHow: "How does it work?"
  ,ideaBuilderHelpStep1: "1. Enter an idea"
  ,ideaBuilderHelpStep2: "2. RecapHorizon will guide you through 15 statements to develop your idea"
  ,ideaBuilderHelpStep3: "3. Generate report"
  ,ideaBuilderHelpStep4: "4. Use the report as transcript in our analysis section for further study"
  ,ideaBuilderHelpNote: "You can use the generated report directly in your analysis as a transcript."
  ,ideaBuilderHelpClose: "Close"

  // Summary Questions Modal
  ,summaryFormat: "Format"
  ,summaryTargetAudience: "Target Audience"
  ,summaryToneStyle: "Tone"
  ,summaryLength: "Length"
  ,summaryOptional: "All fields are optional"
  ,summaryQuestionsTitle: "Summary options"
  ,summaryQuestionsSubtitle: "Choose your preferred options for the summary"
  ,summaryFormatQuestion: "What type of summary do you want to generate?"
  ,summaryTargetAudienceQuestion: "Who is this summary for?"
  ,summaryToneStyleQuestion: "What tone and style should the summary have?"
  ,summaryLengthQuestion: "How extensive should the summary be?"
  ,"summaryFormatOptions.executiveSummary": "Executive Summary"
  ,"summaryFormatOptions.toThePointSummary": "To-the-point Summary"
  ,"summaryFormatOptions.narrativeSummary": "Narrative Summary"
  ,"summaryFormatOptions.decisionMakingSummary": "Decision-making Summary"
  ,"summaryFormatOptions.problemSolutionSummary": "Problem–Solution Summary"
  ,"summaryFormatOptions.detailedSummaryWithQuotes": "Detailed Summary with Quotes"
  ,"summaryFormatOptions.highLevelOverview": "High-level Overview"
  ,"summaryTargetAudienceOptions.internalTeam": "Internal team"
  ,"summaryTargetAudienceOptions.management": "Management"
  ,"summaryTargetAudienceOptions.customers": "Customers"
  ,"summaryTargetAudienceOptions.investors": "Investors"
  ,"summaryTargetAudienceOptions.newEmployees": "New employees"
  ,"summaryTargetAudienceOptions.generalPublic": "General public"
  ,"summaryTargetAudienceOptions.academics": "Academics"
  ,"summaryTargetAudienceOptions.competitors": "Competitors"
  ,"summaryTargetAudienceOptions.localCommunity": "Local community"
  ,"summaryTargetAudienceOptions.alumni": "Alumni"
  ,"summaryTargetAudienceOptions.internationalStakeholders": "International stakeholders"
  ,"summaryTargetAudienceOptions.specificInterestGroups": "Specific interest groups"
  ,"summaryTargetAudienceOptions.children8": "Children aged 8"
  ,"summaryTargetAudienceOptions.highSchool15": "High school students aged 15"
  ,"summaryToneStyleOptions.formal": "Formal"
  ,"summaryToneStyleOptions.informal": "Informal"
  ,"summaryToneStyleOptions.inspiring": "Inspiring"
  ,"summaryToneStyleOptions.critical": "Critical"
  ,"summaryToneStyleOptions.humorous": "Humorous"
  ,"summaryToneStyleOptions.neutral": "Neutral"
  ,"summaryToneStyleOptions.professional": "Professional"
  ,"summaryToneStyleOptions.conversational": "Conversational"
  ,"summaryToneStyleOptions.authoritative": "Authoritative"
  ,"summaryToneStyleOptions.friendly": "Friendly"
  ,"summaryToneStyleOptions.technical": "Technical"
  ,"summaryToneStyleOptions.simple": "Simple"
  ,"summaryLengthOptions.concise": "Concise"
  ,"summaryLengthOptions.standard": "Standard"
  ,"summaryLengthOptions.extensive": "Extensive"
  ,"summaryLengthOptions.fullTimeline": "Full timeline"
  
  // Audio Recording Screen - Missing translations
  ,recordingDetails: "Recording Details"
  ,fileSize: "File size"
  ,audioFormat: "Audio format"
  ,quality: "Quality"
  ,optimizedFor: "Optimized for"
  ,listenBack: "Listen back to your recording before transcribing"
  ,transcribe: "Transcribe"
  ,aiTranscription: "AI transcription"
  ,aiTranscriptionDesc: "High-quality transcription with AI technology"

  ,maxRecordingTimeReached: "Maximum recording time reached!"
  ,noAudioDetected: "No audio detected"
  ,audioDetected: "Audio detected"
  ,yourRecordingIsReady: "Your audio recording is ready. Listen back and start transcription when you're ready."
  ,recordingTime: "Recording time"
  ,pauseTime: "Pause time"
  ,startTime: "Start time"

  // Months
  ,january: "January"
  ,february: "February"
  ,march: "March"
  ,april: "April"
  ,may: "May"
  ,june: "June"
  ,july: "July"
  ,august: "August"
  ,september: "September"
  ,october: "October"
  ,november: "November"
  ,december: "December"

  // Subscription Success Modal
  ,startWithRecapHorizon: "Start with RecapHorizon!"
  ,thankYouMessage: "We're glad you chose RecapHorizon. Good luck with your AI-driven analyses!"

  // Email Confirmation Modal
  ,emailConfirmTitle: "Confirm your email address for registration"
  ,emailConfirmDescription: "We have sent a confirmation code to your email address to create your account."
  ,emailConfirmInstruction: "Enter the 6-digit code you received by email."
  ,emailConfirmPlaceholder: "Enter 6-digit code"
  ,emailConfirmVerify: "Confirm"
  ,emailConfirmVerifying: "Confirming..."
  ,emailConfirmNoCode: "Didn't receive a code?"
  ,emailConfirmResend: "Resend code"
  ,emailConfirmResending: "Sending..."
  ,emailConfirmResendCooldown: "Resend ({seconds}s)"
  ,emailConfirmAttemptCount: "Attempt {count} of {total}. {remaining} attempts remaining."
  ,emailConfirmAccountCreating: "Your account will be created once your email address is confirmed."
  ,emailConfirmWaitlistAdding: "You will be added to the waitlist once your email address is confirmed."
  ,emailConfirmCheckSpam: "Also check your spam/junk email folder if you don't see the code."
  ,emailConfirmTechnicalError: "A technical error occurred. Please try again."
  ,emailConfirmCodeExpired: "The confirmation code has expired. Request a new one."
  ,emailConfirmCodeInvalid: "Invalid confirmation code. Check the code and try again."
  ,emailConfirmTooManyAttempts: "Too many attempts. Please try again later."
  ,emailConfirmCodeAlreadySent: "A confirmation email has already been sent. Check your inbox."
  ,emailConfirmTooManyRequests: "Too many requests. Please try again later."
  ,emailConfirmCouldNotResend: "Could not send new confirmation code. Please try again later."
  ,emailConfirmErrorSending: "A technical error occurred while sending a new code.",

  brainstorm: "Brainstorm & Report"
  ,"brainstorm.title": "Brainstorm & Report"
  ,"brainstorm.description": "Guide an interactive brainstorming flow from the transcript and generate a top‑level report based on a chosen method and, optionally, an expert role."
  ,"brainstorm.initialIdeasLoadingTitle": "Generating initial ideas"
  ,"brainstorm.initialIdeasLoadingMessage": "The AI is now generating initial ideas based on the transcript. Please wait..."
  ,"brainstorm.transcriptOption": "No specific idea, brainstorm based on transcript"
  ,"brainstorm.selectIdea": "Choose one idea (or transcript option) from the list above that you want to develop further."
  ,"brainstorm.selectMethod": "Which brainstorming method do you want to apply to '{idea}'? Choose from the options below:"
  ,"brainstorm.selectMethodShort": "Which brainstorming method do you want to apply? Choose from the options below:"
  ,"brainstorm.selectExpertRole": "Run the brainstorm from a specific expert perspective?"
  ,"brainstorm.genericRole": "Generic role"
  ,"brainstorm.generatingReport": "The AI is now generating the brainstorm report. This may take a moment..."
  ,"brainstorm.reportTitle": "Brainstorm Report"
  ,"brainstorm.downloadPdf": "Download as PDF"
  ,"brainstorm.copyToClipboard": "Copy to clipboard"
  ,"brainstorm.moveToTranscript": "Move to Transcript"
  ,"brainstorm.regenerate": "Regenerate"
  ,"brainstorm.downloadTxt": "Download TXT"
  ,"brainstorm.initialIdeaInstruction": `You are a creative AI analyst. Your task is to extract the most prominent and innovative ideas, concepts, problems or opportunities from the transcript below. These should have potential for further development or strategic discussion.

**Current Transcript:**
"""
{transcript_text}
"""

**Instruction:**
Identify and present between 1 and 25 (maximum 25, minimum 1) unique and relevant ideas/concepts/problems/opportunities that directly follow from the content of this transcript. Formulate each idea briefly and powerfully. Provide your own ranking from 1 to 5 stars (allow half stars) and sort by stars in the presentation.

Generate the list in {output_language}, sorted by relevance. The first item must always be: "No specific idea, brainstorm based on transcript".`
  ,"brainstorm.reportInstruction": `You are a specialized AI consultant who facilitates expert sessions and produces reports. Your task is to generate a structured brainstorming report based on a specific idea, a chosen brainstorming method, and an expert role.

**Idea to brainstorm (focus):**
"""
{user_selected_idea}
"""

**Chosen Brainstorm Method:**
{user_selected_method}

**Current Transcript (for context and factual grounding):**
"""
{transcript_text}
"""

**Specific Instructions for the Chosen Method:**
{method_specific_instructions}

**Expert Role:**
Adopt the perspective and thinking style of the following expert role: '{user_selected_expert_role_name}'. When generating the brainstorm output, focus on the aspects most relevant to this role. The description of this role is: '{user_selected_expert_role_description}'.

**Output Format & Report Structure:**
Generate the output as a comprehensive, structured report in {output_language}. The report should start with a clear title, the chosen idea, the brainstorming method used, and the expert role. The rest of the report must closely follow the instructions of the chosen method and clearly present the generated ideas. Maintain a professional and concrete tone. Use sections and bullet points where appropriate. Use clean formatting and do not include formatting codes.

**Constraints:**
• All generated ideas and analyses must be directly derivable from or strongly inspired by the transcript and the chosen idea.
• Be creative but practical.
• Avoid inventing external facts that are not in the transcript.
• Respect the chosen expert role and adjust depth/focus accordingly.`
  ,"brainstorm.method.frameworks": "Frameworks"
  ,"brainstorm.method.frameworksDesc": "Brainstorm using known frameworks (e.g., 5 Whys, SCAMPER, Six Thinking Hats)."
  ,"brainstorm.method.frameworksList": "5 Whys, SCAMPER, Six Thinking Hats, Mind Mapping, Starbursting"
  ,"brainstorm.method.frameworksPromptTemplate": "Using the {selected_framework} brainstorming framework, brainstorm the following topic: {user_selected_idea}. Provide actionable insights and ideas."
  ,"brainstorm.method.selectFramework": "Select framework"
  ,"brainstorm.method.differentPerspectives": "Different Perspectives"
  ,"brainstorm.method.differentPerspectivesDesc": "Approach the topic from diverse roles (e.g., Marketing expert, Sales expert, Product expert), each generating 10 ideas."
  ,"brainstorm.method.differentPerspectivesPromptTemplate": "We are in a brainstorming session about {user_selected_idea}. From the perspective of {selected_perspectives}, generate 10 ideas from each perspective. Each idea should be distinct and practical."
  ,"brainstorm.method.oppositeDay": "Opposite Day"
  ,"brainstorm.method.oppositeDayDesc": "Flip the problem: brainstorm how to make customers LESS satisfied, then invert those ideas for innovative solutions."
  ,"brainstorm.method.oppositeDayPromptTemplate": "Give me {number_of_dissatisfaction_ideas} ways I would make my customers more DISSATISFIED with my {user_selected_idea}. Then, for every point, provide the exact opposite approach as a viable solution or improvement. Structure as: 'Problematic Idea' -> 'Inverted Solution'."
  ,"brainstorm.method.stepByStep": "Step-by-Step"
  ,"brainstorm.method.stepByStepDesc": "Proceed step-by-step and build upon the previous step. Ideas are generated in a logical sequence."
  ,"brainstorm.method.stepByStepPromptTemplate": "You are building a business idea for {user_selected_idea}. Let's go step-by-step: 1. List 5-10 key aspects of {initial_step_focus}. 2. For each aspect, identify 2-3 associated challenges. 3. For each challenge, brainstorm 1-2 potential solutions or innovations. 4. From these, formulate 5-7 concrete business ideas."
  ,"brainstorm.method.creativeWords": "Creative Words"
  ,"brainstorm.method.creativeWordsDesc": "Use words that encourage creativity (e.g., Extremely unique, Daringly different) to generate ideas."
  ,"brainstorm.method.creativeWordsPromptTemplate": "Using words like 'Extremely unique', 'Daringly different', 'Never-before-seen', 'Utterly unexpected', 'Wildly unconventional', 'Absolutely unheard-of', 'Completely out-of-the-box', generate {number_of_ideas} creative ideas about {user_selected_idea}. Each idea should clearly reflect one or more of these creative qualities."
  ,"brainstorm.method.chainOfDensity": "Chain of Density"
  ,"brainstorm.method.chainOfDensityDesc": "Iteratively generates denser and more creative outputs by adding missing points and refining the output."
  ,"brainstorm.method.chainOfDensityPromptTemplate": "You are an expert in creative recursion. For the topic: {user_selected_idea}, generate an initial creative idea. Then, repeat the following 2 steps {number_of_iterations} times:\nStep 1. Identify 1-3 missing or implicit points from the initial output that would make it more dense and creative.\nStep 2. Rewrite a new, improved output of identical length which includes these missing points, making it more detailed and impactful. Focus on generating increasingly creative outputs."
  ,"brainstorm.method.firstPrinciples": "First Principles"
  ,"brainstorm.method.firstPrinciplesDesc": "Break down a complex problem into basic components and reassemble it from the ground up for fundamental solutions."
  ,"brainstorm.method.firstPrinciplesPromptTemplate": "Using First Principles thinking, thoroughly analyze the following topic: {user_selected_idea}. Break it down into its fundamental truths or core components, questioning all assumptions. Then, based on these first principles, brainstorm 3-5 innovative solutions or approaches."
  ,"brainstorm.method.oppositeDayCountLabel": "Number of dissatisfaction ideas"
  ,"brainstorm.method.creativeWordsCountLabel": "Number of ideas"
  ,"brainstorm.method.chainOfDensityIterationsLabel": "Number of iterations"
  ,"brainstorm.method.stepByStepInitialFocusLabel": "Initial step focus"

  ,uploadFailed: "Upload failed."
  ,supportedFileTypes: "TXT, PDF, RTF, HTML, MD, DOCX"
  ,audioFormats: "MP3, MP4, WebM, WAV"

  ,agilePbi: {
    title: "Create Agile/SCRUM PBIs",
    generate: "Generate",
    refine: "Refine",
    moveToTranscript: "Move to transcript",
    empty: "No PBIs yet. Choose a tone and approach and click Generate.",
    noContent: "Insufficient content",
    generateError: "Could not generate PBIs",
    tone: {
      title: "Tone of voice",
      formeelZakelijk: "Formal/Business",
      formeelZakelijkDesc: "Objective, factual, professional, direct.",
      praktischDirect: "Practical/Direct",
      praktischDirectDesc: "Action and functionality focused, to the point.",
      klantgerichtEmpathisch: "Customer‑focused/Empathetic",
      klantgerichtEmpathischDesc: "Emphasizes customer needs and user impact.",
      technischGedetailleerd: "Technical/Detailed",
      technischGedetailleerdDesc: "Technical details and considerations where relevant.",
      motiverendVisionair: "Motivational/Visionary",
      motiverendVisionairDesc: "Highlights vision, impact and long‑term.",
      synthetischKortBondig: "Synthetic/Concise",
      synthetischKortBondigDesc: "Very short, condensed and to the point.",
      informeelVriendelijk: "Informal/Friendly",
      informeelVriendelijkDesc: "Relaxed, approachable, team‑oriented."
    },
    approach: {
      title: "Approach",
      frameworks: "Frameworks (User Story)",
      frameworksDesc: "Formulate in User Story format with clear value.",
      differentPerspectives: "Different Perspectives",
      differentPerspectivesDesc: "Add business value and technical considerations per PBI.",
      stepByStep: "Step‑by‑Step",
      stepByStepDesc: "Identify needs first, then convert into PBIs.",
      creativeWords: "Creative Words",
      creativeWordsDesc: "Core PBIs plus extra innovative ideas.",
      chainOfDensity: "Chain of Density",
      chainOfDensityDesc: "Make PBIs iteratively more specific and measurable.",
      firstPrinciples: "First Principles",
      firstPrinciplesDesc: "Address fundamental needs and briefly motivate."
    },
    options: {
      includeAcceptanceCriteria: "Include acceptance criteria",
      includeValueNote: "Include business value note",
      includeTechnicalNote: "Include technical considerations"
    },
    card: {
      acceptanceCriteria: "Acceptance criteria",
      notes: "Notes",
      businessValue: "Business value",
      technicalConsiderations: "Technical considerations",
      fundamentalReason: "Fundamental reason",
      innovativeIdea: "Innovative idea"
    }
  }
};
