import{S as l,A as c,a as u}from"./index-CI7YSB92.js";async function y(e,n,t="nl",i="anonymous",r=l.FREE){const s=n||e;if(!s||s.trim().length===0)throw new Error("No content provided for topic generation");const a=f(s,t);try{const o={userId:i,functionType:c.ANALYSIS_GENERATION,userTier:r},p=await u.generateContentWithProviderSelection(o,a,!1);return m(p.content,t)}catch{throw new Error("Failed to generate thinking topics")}}async function q(e,n,t="nl",i="anonymous",r=l.FREE){const s=g(e,n,t);try{const a={userId:i,functionType:c.ANALYSIS_GENERATION,userTier:r};return(await u.generateContentWithProviderSelection(a,s,!1)).content}catch{throw new Error("Failed to generate thinking partner analysis")}}function f(e,n){const t=d(n);return`${t.systemPrompt}

${t.topicGenerationPrompt}

${t.topicRequirements}

${t.contentLabel}
${e}

${t.outputFormat}

${t.jsonFormatInstructions}

${t.outputOnlyJson}`}function g(e,n,t){const i=d(t),r=n.promptTemplate.replace("{TOPIC_TITLE}",e.title).replace("{TOPIC_DESCRIPTION}",e.description);return`${i.systemPrompt}

${i.partnerIntro}

${r}

${i.analysisInstructions}

${i.analysisRequirements}

${i.professionalTone}`}function m(e,n="nl"){try{const t=e.match(/\[[\s\S]*\]/);if(!t)throw new Error("No JSON array found in response");return JSON.parse(t[0]).map((r,s)=>({id:r.id||`topic-${s+1}`,title:r.title||b(s+1,n),description:r.description||v(n)}))}catch{return h(n)}}function h(e){switch(e.toLowerCase()){case"en":return[{id:"fallback-1",title:"Strategic priorities",description:"Analyze the most important strategic priorities and their relationships"},{id:"fallback-2",title:"Decision making",description:"Examine the core decisions that need to be made"},{id:"fallback-3",title:"Implementation and risks",description:"Evaluate implementation plans and potential risk factors"}];case"de":return[{id:"fallback-1",title:"Strategische Prioritäten",description:"Analysieren Sie die wichtigsten strategischen Prioritäten und ihre Beziehungen"},{id:"fallback-2",title:"Entscheidungsfindung",description:"Untersuchen Sie die Kernentscheidungen, die getroffen werden müssen"},{id:"fallback-3",title:"Umsetzung und Risiken",description:"Bewerten Sie Umsetzungspläne und potenzielle Risikofaktoren"}];case"fr":return[{id:"fallback-1",title:"Priorités stratégiques",description:"Analysez les priorités stratégiques les plus importantes et leurs relations"},{id:"fallback-2",title:"Prise de décision",description:"Examinez les décisions fondamentales qui doivent être prises"},{id:"fallback-3",title:"Mise en œuvre et risques",description:"Évaluez les plans de mise en œuvre et les facteurs de risque potentiels"}];case"es":return[{id:"fallback-1",title:"Prioridades estratégicas",description:"Analiza las prioridades estratégicas más importantes y sus relaciones"},{id:"fallback-2",title:"Toma de decisiones",description:"Examina las decisiones fundamentales que deben tomarse"},{id:"fallback-3",title:"Implementación y riesgos",description:"Evalúa los planes de implementación y los factores de riesgo potenciales"}];case"pt":return[{id:"fallback-1",title:"Prioridades estratégicas",description:"Analise as prioridades estratégicas mais importantes e suas relações"},{id:"fallback-2",title:"Tomada de decisões",description:"Examine as decisões fundamentais que precisam ser tomadas"},{id:"fallback-3",title:"Implementação e riscos",description:"Avalie planos de implementação e fatores de risco potenciais"}];default:return[{id:"fallback-1",title:"Strategische prioriteiten",description:"Analyseer de belangrijkste strategische prioriteiten en hun onderlinge relaties"},{id:"fallback-2",title:"Besluitvorming",description:"Onderzoek de kernbeslissingen die genomen moeten worden"},{id:"fallback-3",title:"Uitvoering en risicos",description:"Evalueer uitvoeringsplannen en potentiële risicofactoren"}]}}function b(e,n){switch(n.toLowerCase()){case"en":return`Topic ${e}`;case"de":return`Thema ${e}`;case"fr":return`Sujet ${e}`;default:return`Onderwerp ${e}`}}function v(e){switch(e.toLowerCase()){case"en":return"No description available";case"de":return"Keine Beschreibung verfügbar";case"fr":return"Aucune description disponible";default:return"Geen beschrijving beschikbaar"}}function d(e){switch(e.toLowerCase()){case"en":return{systemPrompt:"You are an expert strategic thinking facilitator who helps identify key topics for deeper reflection.",topicGenerationPrompt:"Analyze the following content and generate 5-8 strategic thinking topics suitable for deeper reflection with a thinking partner.",topicRequirements:`Each topic should:
- Identify a specific strategic question or challenge
- Be relevant for decision-making or planning
- Be suitable for different thinking methodologies
- Be concrete enough to work with`,contentLabel:"Content to analyze:",outputFormat:"Generate the topics in English. Use clear, professional language that is accessible to business professionals.",jsonFormatInstructions:`Generate the topics in the following JSON format:
[
  {
    "id": "unique-id-1",
    "title": "Short, compelling title",
    "description": "Detailed description of the topic and why it's relevant"
  },
  {
    "id": "unique-id-2", 
    "title": "Short, compelling title",
    "description": "Detailed description of the topic and why it's relevant"
  }
]`,outputOnlyJson:"Ensure the output is only valid JSON, without additional text.",analysisInstructions:"Provide your analysis in English. Use clear, professional language accessible to business professionals.",partnerIntro:"You are an experienced thinking partner who helps with strategic reflection and decision-making.",analysisRequirements:`Provide a thoughtful, structured analysis that:
- Directly addresses the specific question or challenge
- Offers concrete insights and perspectives
- Contains actionable suggestions where relevant
- Has a clear structure with headings and bullet points
- Is between 300-500 words long`,professionalTone:"Use a professional but accessible tone."};case"de":return{systemPrompt:"Du bist ein Experte für strategisches Denken, der dabei hilft, wichtige Themen für tiefere Reflexion zu identifizieren.",topicGenerationPrompt:"Analysiere den folgenden Inhalt und generiere 5-8 strategische Denkthemen, die für tiefere Reflexion mit einem Denkpartner geeignet sind.",topicRequirements:`Jedes Thema sollte:
- Eine spezifische strategische Frage oder Herausforderung identifizieren
- Relevant für Entscheidungsfindung oder Planung sein
- Für verschiedene Denkmethodologien geeignet sein
- Konkret genug sein, um damit zu arbeiten`,contentLabel:"Zu analysierender Inhalt:",outputFormat:"Generiere die Themen auf Deutsch. Verwende eine klare, professionelle Sprache, die für Geschäftsleute zugänglich ist.",jsonFormatInstructions:`Generiere die Themen im folgenden JSON-Format:
[
  {
    "id": "unique-id-1",
    "title": "Kurzer, überzeugender Titel",
    "description": "Detaillierte Beschreibung des Themas und warum es relevant ist"
  },
  {
    "id": "unique-id-2", 
    "title": "Kurzer, überzeugender Titel",
    "description": "Detaillierte Beschreibung des Themas und warum es relevant ist"
  }
]`,outputOnlyJson:"Stelle sicher, dass die Ausgabe nur gültiges JSON ist, ohne zusätzlichen Text.",analysisInstructions:"Gib deine Analyse auf Deutsch ab. Verwende eine klare, professionelle Sprache, die für Geschäftsleute zugänglich ist.",partnerIntro:"Du bist ein erfahrener Denkpartner, der bei strategischer Reflexion und Entscheidungsfindung hilft.",analysisRequirements:`Biete eine durchdachte, strukturierte Analyse, die:
- Direkt auf die spezifische Frage oder Herausforderung eingeht
- Konkrete Einsichten und Perspektiven bietet
- Umsetzbare Vorschläge enthält, wo relevant
- Eine klare Struktur mit Überschriften und Aufzählungspunkten hat
- Zwischen 300-500 Wörtern lang ist`,professionalTone:"Verwende einen professionellen, aber zugänglichen Ton."};case"fr":return{systemPrompt:"Vous êtes un expert en facilitation de la pensée stratégique qui aide à identifier les sujets clés pour une réflexion plus approfondie.",topicGenerationPrompt:"Analysez le contenu suivant et générez 5-8 sujets de réflexion stratégique adaptés à une réflexion plus approfondie avec un partenaire de réflexion.",topicRequirements:`Chaque sujet doit :
- Identifier une question ou un défi stratégique spécifique
- Être pertinent pour la prise de décision ou la planification
- Être adapté à différentes méthodologies de réflexion
- Être suffisamment concret pour travailler avec`,contentLabel:"Contenu à analyser :",outputFormat:"Générez les sujets en français. Utilisez un langage clair et professionnel accessible aux professionnels des affaires.",jsonFormatInstructions:`Générez les sujets dans le format JSON suivant :
[
  {
    "id": "unique-id-1",
    "title": "Titre court et convaincant",
    "description": "Description détaillée du sujet et pourquoi il est pertinent"
  },
  {
    "id": "unique-id-2", 
    "title": "Titre court et convaincant",
    "description": "Description détaillée du sujet et pourquoi il est pertinent"
  }
]`,outputOnlyJson:"Assurez-vous que la sortie ne contient que du JSON valide, sans texte supplémentaire.",analysisInstructions:"Fournissez votre analyse en français. Utilisez un langage clair et professionnel accessible aux professionnels des affaires.",partnerIntro:"Vous êtes un partenaire de réflexion expérimenté qui aide à la réflexion stratégique et à la prise de décision.",analysisRequirements:`Fournissez une analyse réfléchie et structurée qui :
- Aborde directement la question ou le défi spécifique
- Offre des perspectives et des insights concrets
- Contient des suggestions exploitables le cas échéant
- A une structure claire avec des titres et des puces
- Fait entre 300 et 500 mots`,professionalTone:"Utilisez un ton professionnel mais accessible."};case"es":return{systemPrompt:"Eres un experto facilitador de pensamiento estratégico que ayuda a identificar temas clave para una reflexión más profunda.",topicGenerationPrompt:"Analiza el siguiente contenido y genera 5-8 temas de pensamiento estratégico adecuados para una reflexión más profunda con un compañero de pensamiento.",topicRequirements:`Cada tema debe:
- Identificar una pregunta o desafío estratégico específico
- Ser relevante para la toma de decisiones o planificación
- Ser adecuado para diferentes metodologías de pensamiento
- Ser lo suficientemente concreto para trabajar con él`,contentLabel:"Contenido a analizar:",outputFormat:"Genera los temas en español. Usa un lenguaje claro y profesional accesible para profesionales de negocios.",jsonFormatInstructions:`Genera los temas en el siguiente formato JSON:
[
  {
    "id": "unique-id-1",
    "title": "Título corto y convincente",
    "description": "Descripción detallada del tema y por qué es relevante"
  },
  {
    "id": "unique-id-2", 
    "title": "Título corto y convincente",
    "description": "Descripción detallada del tema y por qué es relevante"
  }
]`,outputOnlyJson:"Asegúrate de que la salida sea solo JSON válido, sin texto adicional.",analysisInstructions:"Proporciona tu análisis en español. Usa un lenguaje claro y profesional accesible para profesionales de negocios.",partnerIntro:"Eres un compañero de pensamiento experimentado que ayuda con la reflexión estratégica y la toma de decisiones.",analysisRequirements:`Proporciona un análisis reflexivo y estructurado que:
- Aborde directamente la pregunta o desafío específico
- Ofrezca perspectivas e insights concretos
- Contenga sugerencias accionables cuando sea relevante
- Tenga una estructura clara con encabezados y viñetas
- Tenga entre 300-500 palabras de longitud`,professionalTone:"Usa un tono profesional pero accesible."};case"pt":return{systemPrompt:"Você é um especialista facilitador de pensamento estratégico que ajuda a identificar tópicos-chave para reflexão mais profunda.",topicGenerationPrompt:"Analise o seguinte conteúdo e gere 5-8 tópicos de pensamento estratégico adequados para reflexão mais profunda com um parceiro de pensamento.",topicRequirements:`Cada tópico deve:
- Identificar uma pergunta ou desafio estratégico específico
- Ser relevante para tomada de decisões ou planejamento
- Ser adequado para diferentes metodologias de pensamento
- Ser concreto o suficiente para trabalhar`,contentLabel:"Conteúdo para analisar:",outputFormat:"Gere os tópicos em português. Use linguagem clara e profissional acessível para profissionais de negócios.",jsonFormatInstructions:`Gere os tópicos no seguinte formato JSON:
[
  {
    "id": "unique-id-1",
    "title": "Título curto e convincente",
    "description": "Descrição detalhada do tópico e por que é relevante"
  },
  {
    "id": "unique-id-2", 
    "title": "Título curto e convincente",
    "description": "Descrição detalhada do tópico e por que é relevante"
  }
]`,outputOnlyJson:"Certifique-se de que a saída seja apenas JSON válido, sem texto adicional.",analysisInstructions:"Forneça sua análise em português. Use linguagem clara e profissional acessível para profissionais de negócios.",partnerIntro:"Você é um parceiro de pensamento experiente que ajuda com reflexão estratégica e tomada de decisões.",analysisRequirements:`Forneça uma análise reflexiva e estruturada que:
- Aborde diretamente a pergunta ou desafio específico
- Ofereça perspectivas e insights concretos
- Contenha sugestões acionáveis quando relevante
- Tenha uma estrutura clara com cabeçalhos e marcadores
- Tenha entre 300-500 palavras de comprimento`,professionalTone:"Use um tom profissional, mas acessível."};default:return{systemPrompt:"Je bent een expert strategische denkfacilitator die helpt bij het identificeren van belangrijke onderwerpen voor diepere reflectie.",topicGenerationPrompt:"Analyseer de volgende content en genereer 5-8 strategische denkonderwerpen die geschikt zijn voor diepere reflectie met een denkpartner.",topicRequirements:`Elk onderwerp moet:
- Een specifieke strategische vraag of uitdaging identificeren
- Relevant zijn voor besluitvorming of planning
- Geschikt zijn voor verschillende denkmethodologieën
- Concreet genoeg zijn om mee te werken`,contentLabel:"Content om te analyseren:",outputFormat:"Genereer de onderwerpen in het Nederlands. Gebruik heldere, professionele taal die toegankelijk is voor zakelijke professionals.",jsonFormatInstructions:`Genereer de onderwerpen in het volgende JSON-formaat:
[
  {
    "id": "unique-id-1",
    "title": "Korte, pakkende titel",
    "description": "Uitgebreide beschrijving van het onderwerp en waarom het relevant is"
  },
  {
    "id": "unique-id-2", 
    "title": "Korte, pakkende titel",
    "description": "Uitgebreide beschrijving van het onderwerp en waarom het relevant is"
  }
]`,outputOnlyJson:"Zorg ervoor dat de uitvoer alleen geldige JSON is, zonder extra tekst.",analysisInstructions:"Geef je analyse in het Nederlands. Gebruik duidelijke, professionele taal die toegankelijk is voor zakelijke professionals.",partnerIntro:"Je bent een ervaren denkpartner die helpt bij strategische reflectie en besluitvorming.",analysisRequirements:`Geef een doordachte, gestructureerde analyse die:
- Direct ingaat op de specifieke vraag of uitdaging
- Concrete inzichten en perspectieven biedt
- Actionable suggesties bevat waar relevant
- Een heldere structuur heeft met kopjes en bullet points
- Tussen de 300-500 woorden lang is`,professionalTone:"Gebruik een professionele maar toegankelijke toon."}}}export{q as generateThinkingPartnerAnalysis,y as generateThinkingTopics};
