import { AIProviderManager, ProviderSelectionRequest, AIFunction } from '../utils/aiProviderManager';
import { McKinseyTopic, McKinseyFramework, McKinseyAnalysisData, SubscriptionTier } from '../../types';

// Generate McKinsey topics based on transcript/summary content
export async function generateMckinseyTopics(
  transcript: string,
  summary?: string,
  language: string = 'nl',
  userId?: string,
  userTier?: SubscriptionTier
): Promise<McKinseyTopic[]> {

  const content = (summary || transcript || '').trim();
  if (!content) {
    return createFallbackTopics('', language);
  }

  // Check cache first
  const cacheKey = `mckinsey-topics:${userId || 'anon'}:${language}:${hashString(content)}`;
  const cached = topicCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const prompt = createTopicGenerationPrompt(content, language);
    
    // Create provider selection request
    const request: ProviderSelectionRequest = {
      userId,
      functionType: AIFunction.ANALYSIS_GENERATION,
      userTier
    };

    // Add timeout for topic generation
    const timeoutPromise = new Promise<null>((resolve) => {
      setTimeout(() => {
        resolve(null);
      }, 15000);
    });

    const generationPromise = AIProviderManager.generateContentWithProviderSelection(
      request,
      prompt,
      false // No streaming for topic generation
    );

    // Race between generation and timeout
    const response = await Promise.race([generationPromise, timeoutPromise]);

    if (!response || !response.content) {
      return createFallbackTopics('', language);
    }

    const topics = parseTopicsFromResponse(response.content, language);
    
    // If parsing fails or returns empty array, use fallback
    if (!topics || topics.length === 0) {
      return createFallbackTopics(response.content, language);
    }

    // Cache the results
    topicCache.set(cacheKey, topics);
    
    return topics;
  } catch (error) {
    // Provide more specific error messages like TeachMe
    if (error instanceof Error) {
      if (error.message.includes('timed out')) {
        return createFallbackTopics('', language);
      }
      if (error.message.includes('Rate limit') || error.message.includes('quota')) {
        throw new Error('AI service quota exceeded. Please try again later or upgrade your subscription.');
      }
      if (error.message.includes('overloaded') || error.message.includes('503')) {
        throw new Error('AI service is currently overloaded. Please try again in a few minutes.');
      }
      if (error.message.includes('network') || error.message.includes('fetch')) {
        throw new Error('Network error connecting to AI service. Please check your internet connection and try again.');
      }
      if (error.message.includes('API key')) {
        throw new Error('AI service configuration error. Please contact support.');
      }
    }
    
    // For any other error, provide user-friendly message like TeachMe
    return createFallbackTopics('', language);
  }
}

// Generate McKinsey analysis using selected framework (3C or 7S)
export async function generateMckinseyAnalysis(
  topic: McKinseyTopic,
  framework: McKinseyFramework,
  roleId: string,
  language: string = 'nl',
  userId?: string,
  userTier?: SubscriptionTier,
  transcript?: string,
  summary?: string
): Promise<string> {
  const prompt = createAnalysisPrompt(topic, framework, roleId, language, transcript, summary);
  
  try {
    // Create provider selection request
    const request: ProviderSelectionRequest = {
      userId,
      functionType: AIFunction.ANALYSIS_GENERATION,
      userTier
    };

    const response = await AIProviderManager.generateContentWithProviderSelection(
      request,
      prompt,
      false // No streaming for analysis generation
    );

    // Explicit guard: empty or missing content must surface as an error
    if (!response || typeof response.content !== 'string' || response.content.trim().length === 0) {
      throw new Error('Error: Empty AI response received for McKinsey analysis');
    }

    // Post-process the analysis to improve formatting and professionalism
    const processedAnalysis = postProcessAnalysis(response.content, framework, language);
    
    return processedAnalysis;
  } catch (error) {
    // Let a clear error message bubble up
    if (error instanceof Error && error.message.startsWith('Error:')) {
      throw error;
    }
    throw new Error('Error: Failed to generate McKinsey analysis');
  }
}

// Create prompt for generating McKinsey topics (simplified like TeachMe)
function createTopicGenerationPrompt(content: string, language: string): string {
  const instructions = getLanguageInstructions(language);
  
  // Simplified prompt like TeachMe approach
  return `Genereer 3-5 strategische onderwerpen voor McKinsey-analyse gebaseerd op de volgende inhoud.

Elk onderwerp moet:
- Een duidelijke titel hebben
- Een korte beschrijving bevatten
- Relevante context bieden
- Geschikt zijn voor strategische analyse

Geef de onderwerpen terug in JSON-formaat met deze structuur:
[
  {
    "title": "Onderwerp titel",
    "description": "Korte beschrijving",
    "context": "Relevante context uit de inhoud",
    "businessImpact": "high/medium/low",
    "complexity": "high/medium/low"
  }
]

Gebruik alleen geldige JSON. Geen extra tekst buiten de JSON.

Inhoud om te analyseren:
${content.substring(0, 2000)}`; // Limit content length to prevent overload
}

// Create prompt for McKinsey framework analysis
function createAnalysisPrompt(
  topic: McKinseyTopic,
  framework: McKinseyFramework,
  roleId: string,
  language: string,
  transcript?: string,
  summary?: string
): string {
  const instructions = getLanguageInstructions(language);
  const frameworkPrompt = getFrameworkPrompt(framework, language);
  const roleContext = getRoleContext(roleId, language);
  
  let contentSection = '';
  if (transcript) {
    contentSection += `\n\nTRANSCRIPT_TEXT:\n${transcript}`;
  }
  if (summary) {
    contentSection += `\n\nSAMENVATTING:\n${summary}`;
  }
  
  return `${instructions.systemPrompt}

${roleContext}

${frameworkPrompt}

${instructions.analysisInstructions}

${instructions.analysisRequirements}

ANALYSE ONDERWERP:
Titel: ${topic.title}
Beschrijving: ${topic.description}
Context: ${topic.context}${contentSection}

${instructions.professionalTone}`;
}

// Get framework-specific analysis prompt
function getFrameworkPrompt(framework: McKinseyFramework, language: string): string {
  const prompts = {
    'nl': {
      '3C': `Voer een uitgebreide 3C-analyse uit (Company, Customers, Competitors):

**Company (Bedrijf):**
- Analyseer de interne sterke en zwakke punten
- Evalueer kerncompetenties en middelen
- Beoordeel de huidige strategie en positionering

**Customers (Klanten):**
- Identificeer doelgroepen en klantsegmenten
- Analyseer klantbehoeften en -gedrag
- Evalueer klantwaarde en -tevredenheid

**Competitors (Concurrenten):**
- Identificeer directe en indirecte concurrenten
- Analyseer concurrentieposities en -strategieën
- Evalueer marktaandeel en concurrentievoordelen`,

      '7S': `Voer een uitgebreide 7S-analyse uit volgens het McKinsey 7S-model:

**Harde elementen:**
- **Strategy (Strategie):** Analyseer de bedrijfsstrategie en richting
- **Structure (Structuur):** Evalueer organisatiestructuur en hiërarchie
- **Systems (Systemen):** Beoordeel processen en procedures

**Zachte elementen:**
- **Shared Values (Gedeelde Waarden):** Identificeer kernwaarden en cultuur
- **Style (Stijl):** Analyseer leiderschapsstijl en managementaanpak
- **Staff (Personeel):** Evalueer talent en capaciteiten
- **Skills (Vaardigheden):** Beoordeel kerncompetenties en expertise`,

      'CustomerLifecycle': `Voer een uitgebreide Klantlevenscyclus Analyse uit:

**Analyseer de verschillende fasen die een klant doorloopt:**
- **Bewustzijn:** Identificeer hoe klanten bewust worden van het product/dienst
- **Overweging:** Analyseer het evaluatieproces en beslissingscriteria
- **Aankoop:** Beoordeel het aankoopproces en conversie-optimalisatie
- **Gebruik:** Evalueer de gebruikservaring en waarderealisatie
- **Loyaliteit:** Analyseer klantbehoud en advocacy-mogelijkheden

**Per fase identificeer:**
- Klantgedrag en behoeften
- Pijnpunten en uitdagingen
- Kansen voor optimalisatie
- Touchpoints en interacties`,

      'ValueChain': `Voer een uitgebreide Waardeketen Analyse uit:

**Primaire Activiteiten:**
- **Inbound Logistiek:** Analyseer leveranciersbeheer en inkomende materialen
- **Operaties:** Evalueer productie- en serviceprocessen
- **Outbound Logistiek:** Beoordeel distributie en levering
- **Marketing & Sales:** Analyseer marktbewerking en verkoopprocessen
- **Service:** Evalueer klantenservice en ondersteuning

**Ondersteunende Activiteiten:**
- **Infrastructuur:** Beoordeel bedrijfsvoering en management
- **HR Management:** Analyseer talent en personeelsontwikkeling
- **Technologieontwikkeling:** Evalueer innovatie en R&D
- **Inkoop:** Beoordeel leveranciersstrategie en kostenoptimalisatie

**Identificeer per activiteit:**
- Waarde-creatie momenten
- Kostenstructuur en efficiënties
- Optimalisatiekansen`,

      'ForceField': `Voer een uitgebreide Krachtenveldanalyse uit:

**Analyseer de gewenste verandering door:**

**Drijvende Krachten (die de verandering ondersteunen):**
- Interne factoren die verandering bevorderen
- Externe marktdruk en kansen
- Stakeholder-ondersteuning
- Beschikbare middelen en capaciteiten

**Beperkende Krachten (die de verandering tegenwerken):**
- Weerstand tegen verandering
- Organisatorische belemmeringen
- Resource-beperkingen
- Externe bedreigingen

**Voor elke kracht bepaal:**
- Sterkte en invloed (1-10 schaal)
- Beïnvloedbaarheid
- Strategieën om drijvende krachten te versterken
- Tactieken om beperkende krachten te verzwakken`,

      'CoreCompetencies': `Voer een uitgebreide Kerncompetenties Analyse uit:

**Identificeer unieke capaciteiten en kennis:**

**Kerncompetenties Criteria:**
- **Waardevol:** Creëert waarde voor klanten
- **Zeldzaam:** Moeilijk te vinden bij concurrenten
- **Moeilijk te imiteren:** Uniek en complex
- **Organisatorisch ingebed:** Goed geïntegreerd in de organisatie

**Analyseer per competentie:**
- Technische vaardigheden en expertise
- Unieke processen en methodologieën
- Propriëtaire technologieën
- Organisatorische capaciteiten
- Relaties en netwerken

**Evalueer:**
- Huidige sterkte van kerncompetenties
- Concurrentievoordeel dat ze opleveren
- Ontwikkelingsmogelijkheden
- Strategische toepassingen`,

      'ScenarioPlanning': `Voer een uitgebreide Scenario Planning Samenvatting uit:

**Analyseer besproken toekomstscenario's:**

**Identificeer Scenario's:**
- Verschillende mogelijke toekomstvisies
- Waarschijnlijkheid van elk scenario
- Tijdshorizon en ontwikkelingsfase

**Drijvende Factoren (Driving Forces):**
- Cruciale onzekerheden die scenario's bepalen
- Externe trends en ontwikkelingen
- Technologische veranderingen
- Maatschappelijke en economische shifts

**Impact Analyse:**
- Gevolgen voor het bedrijf per scenario
- Strategische implicaties
- Risico's en kansen
- Benodigde aanpassingen en voorbereidingen`,

      'PESTEL': `Voer een uitgebreide PESTEL Analyse uit:

**Analyseer de externe macro-omgeving:**

**Politieke Factoren:**
- Overheidsbeleid en regelgeving
- Politieke stabiliteit
- Handelsbeleid en tarieven
- Belastingbeleid

**Economische Factoren:**
- Economische groei en conjunctuur
- Inflatie en rentetarieven
- Wisselkoersen
- Werkloosheid en koopkracht

**Sociaal-culturele Factoren:**
- Demografische trends
- Levensstijl en waarden
- Onderwijs en cultuur
- Gezondheid en welzijn

**Technologische Factoren:**
- Innovaties en R&D
- Automatisering en digitalisering
- Technologische infrastructuur
- Intellectueel eigendom

**Ecologische Factoren:**
- Milieuwetgeving
- Klimaatverandering
- Duurzaamheid en circulaire economie
- Natuurlijke hulpbronnen

**Legale Factoren:**
- Wet- en regelgeving
- Arbeidsrecht
- Consumentenbescherming
- Intellectueel eigendomsrecht`,

      'PortersFiveForces': `Voer een uitgebreide Concurrentiekrachten Analyse uit (Porter's Five Forces):

**Analyseer de concurrentie-intensiteit:**

**1. Dreiging van Nieuwe Toetreders:**
- Toetredingsbarrières (kapitaal, technologie, schaalvoordelen)
- Merktrouw en klantenbinding
- Toegang tot distributiekanalen
- Overheidsregulering

**2. Onderhandelingsmacht van Leveranciers:**
- Concentratie van leveranciers
- Uniekheid van geleverde producten/diensten
- Switching costs voor het bedrijf
- Voorwaartse integratie mogelijkheden

**3. Onderhandelingsmacht van Kopers:**
- Concentratie van klanten
- Volume van aankopen
- Switching costs voor klanten
- Achterwaartse integratie mogelijkheden

**4. Dreiging van Substituten:**
- Beschikbaarheid van alternatieven
- Prijs-prestatie verhouding van substituten
- Switching costs naar substituten
- Klantvoorkeur en loyaliteit

**5. Intensiteit van Concurrentie:**
- Aantal en grootte van concurrenten
- Groeisnelheid van de markt
- Productdifferentiatie
- Exit barriers en overcapaciteit`,

      'AnsoffMatrix': `Voer een uitgebreide Groei Strategieën Analyse uit (Ansoff Matrix):

**Analyseer groeistrategieën per Product/Markt-combinatie:**

**1. Marktpenetratie (Bestaande Producten + Bestaande Markten):**
- Verhogen van marktaandeel
- Stimuleren van meer gebruik door bestaande klanten
- Klanten van concurrenten aantrekken
- Prijsstrategieën en promoties

**2. Marktontwikkeling (Bestaande Producten + Nieuwe Markten):**
- Geografische expansie
- Nieuwe klantsegmenten
- Nieuwe distributiekanalen
- Nieuwe toepassingen van bestaande producten

**3. Productontwikkeling (Nieuwe Producten + Bestaande Markten):**
- Productinnovatie en verbetering
- Productlijn uitbreiding
- Nieuwe features en functionaliteiten
- Technologische upgrades

**4. Diversificatie (Nieuwe Producten + Nieuwe Markten):**
- Gerelateerde diversificatie (synergieën)
- Ongerelateerde diversificatie (risicospreiding)
- Horizontale of verticale integratie
- Joint ventures en partnerships

**Voor elke strategie evalueer:**
- Risico en complexiteit
- Benodigde investeringen en resources
- Verwachte returns en groei
- Strategische fit met organisatie`,

      'BCGMatrix': `Voer een uitgebreide Portfolio Analyse uit (BCG Matrix):

**Analyseer het productportfolio:**

**1. Question Marks (Vraagtekens):**
- Producten met hoog groeipotentieel maar laag marktaandeel
- Marktgroei en concurrentie-intensiteit
- Benodigde investeringen voor groei
- Potentieel om Star te worden

**2. Stars (Sterren):**
- Producten met hoog marktaandeel in snelgroeiende markten
- Cashflow-generatie en winstgevendheid
- Investeringsbehoeften voor behoud positie
- Marktleiderschap en differentiatie

**3. Cash Cows (Melkkoeien):**
- Producten met hoog marktaandeel in volwassen markten
- Sterke cashflow-generatie met minimale investeringen
- Marktverzadiging en groeimogelijkheden
- Strategie voor maximalisatie rendement

**4. Dogs (Honden):**
- Producten met laag marktaandeel in langzaamgroeiende markten
- Kosten-batenanalyse en winstgevendheid
- Exit-strategieën en desinvestering
- Mogelijke herpositionering of verbetering

**Voor elk kwadrant evalueer:**
- Strategische positie en toekomstpotentieel
- Resource allocatie en investeringsprioriteiten
- Portfolio-balans en risicospreiding`,

      'GE_McKinseyMatrix': `Voer een uitgebreide Business Unit Evaluatie uit (GE/McKinsey Matrix):

**Analyseer business units op twee dimensies:**

**1. Industrie-aantrekkelijkheid:**
- Marktgrootte en groeipotentieel
- Concurrentie-intensiteit en winstgevendheid
- Technologische ontwikkelingen en innovatie
- Regelgevende en politieke factoren
- Toetredingsbarrières en marktstructuur

**2. Concurrentievoordeel:**
- Marktaandeel en relatieve positie
- Kostenvoordelen en operationele efficiëntie
- Productdifferentiatie en merksterkte
- Technologische leiderschap en innovatie
- Distributiekanalen en klantrelaties

**Categoriseer business units in:**
- **Invest/Grow:** Hoge aantrekkelijkheid, sterk voordeel
- **Select/Harvest:** Gemiddelde aantrekkelijkheid, gemiddeld voordeel  
- **Divest/Exit:** Lage aantrekkelijkheid, zwak voordeel

**Voor elke categorie bepaal:**
- Strategische richting en resource allocatie
- Investeringsniveau en groeiverwachtingen
- Performance metrics en streefdoelen`,

      'McKinseyHorizons': `Voer een uitgebreide Groei Horizons Analyse uit (McKinsey Three Horizons):

**Analyseer groei-initiatieven over drie tijdshorizonten:**

**Horizon 1 (Huidige Business):**
- Optimalisatie bestaande kernactiviteiten
- Verbetering operationele efficiëntie
- Marktaandeel behoud en incrementele groei
- Cashflow-generatie en winstmaximalisatie

**Horizon 2 (Opkomende Business):**
- Ontwikkeling nieuwe business modellen
- Expansie naar aanverwante markten
- Schaalvergroting en groeiversnelling
- Bouwen aan toekomstige kernactiviteiten

**Horizon 3 (Toekomstige Opties):**
- Onderzoek radicale innovaties
- Experimenteren met disruptieve technologieën
- Creëren van nieuwe markten en ecosystemen
- Voorbereiding op langetermijntransformatie

**Voor elke horizon evalueer:**
- Tijdsframe en investeringshorizon
- Risicoprofiel en onzekerheidsniveau
- Resource allocatie en portfolio-balans
- Management focus en meetbare resultaten`,

      'DigitalTransformation': `Voer een uitgebreide Digitale Transformatie Analyse uit:

**Analyseer digitale volwassenheid en transformatie:**

**Digitale Strategie:**
- Visie en roadmap voor digitale transformatie
- Alignment met business doelstellingen
- Digitale waardecreatie en differentiatie
- Ecosystem ontwikkeling en partnerships

**Technologie & Data:**
- Technologische infrastructuur en architecturen
- Data management en analytics capabilities
- Cloud adoption en digitale platformen
- Cybersecurity en compliance

**Processen & Operaties:**
- Digitale workflow automatisering
- Customer journey digitalisering
- Supply chain en operationele efficiëntie
- Agile werken en digitale samenwerking

**Organisatie & Cultuur:**
- Digitale skills en capabilities
- Organisatiestructuur en governance
- Verandermanagement en adoption
- Innovatiecultuur en experimentatie

**Evalueer per dimensie:**
- Huidige volwassenheid en capability niveau
- Transformationele prioriteiten en quick wins
- Benodigde investeringen en resources
- Impact op klantwaarde en operationele excellentie`,

      'SustainabilityFramework': `Voer een uitgebreide Duurzaamheid Analyse uit:

**Analyseer duurzaamheidsprestaties en kansen:**

**Environmental (Planet):**
- Carbon footprint en emissiereductie
- Energie-efficiëntie en hernieuwbare energie
- Water management en circulaire economie
- Biodiversiteit en natuurlijk kapitaal

**Social (People):**
- Diversiteit, gelijkheid en inclusie
- Arbeidsomstandigheden en mensenrechten
- Gemeenschapsbetrokkenheid en sociale impact
- Consumentenwelzijn en productveiligheid

**Governance (Profit):**
- Bedrijfsethiek en compliance
- Transparantie en stakeholder engagement
- Risicomanagement en due diligence
- Langetermijnwaardecreatie en resilience

**Voor elke pijler evalueer:**
- Huidige prestaties en benchmark positie
- Regelgevende compliance en toekomstige requirements
- Stakeholder verwachtingen en maatschappelijke trends
- Kansen voor innovatie en concurrentievoordeel
- Metrische doelen en impact measurement`
    },
    'en': {
      '3C': `Conduct a comprehensive 3C analysis (Company, Customers, Competitors):

**Company:**
- Analyze internal strengths and weaknesses
- Evaluate core competencies and resources
- Assess current strategy and positioning

**Customers:**
- Identify target groups and customer segments
- Analyze customer needs and behavior
- Evaluate customer value and satisfaction

**Competitors:**
- Identify direct and indirect competitors
- Analyze competitive positions and strategies
- Evaluate market share and competitive advantages`,

      '7S': `Conduct a comprehensive 7S analysis using the McKinsey 7S model:

**Hard Elements:**
- **Strategy:** Analyze business strategy and direction
- **Structure:** Evaluate organizational structure and hierarchy
- **Systems:** Assess processes and procedures

**Soft Elements:**
- **Shared Values:** Identify core values and culture
- **Style:** Analyze leadership style and management approach
- **Staff:** Evaluate talent and capabilities
- **Skills:** Assess core competencies and expertise`,

      'CustomerLifecycle': `Conduct a comprehensive Customer Lifecycle Analysis:

**Analyze the different stages a customer goes through:**
- **Awareness:** Identify how customers become aware of the product/service
- **Consideration:** Analyze the evaluation process and decision criteria
- **Purchase:** Assess the buying process and conversion optimization
- **Usage:** Evaluate the user experience and value realization
- **Loyalty:** Analyze customer retention and advocacy opportunities

**For each stage identify:**
- Customer behavior and needs
- Pain points and challenges
- Optimization opportunities
- Touchpoints and interactions`,

      'ValueChain': `Conduct a comprehensive Value Chain Analysis:

**Primary Activities:**
- **Inbound Logistics:** Analyze supplier management and incoming materials
- **Operations:** Evaluate production and service processes
- **Outbound Logistics:** Assess distribution and delivery
- **Marketing & Sales:** Analyze market development and sales processes
- **Service:** Evaluate customer service and support

**Support Activities:**
- **Infrastructure:** Assess business operations and management
- **HR Management:** Analyze talent and personnel development
- **Technology Development:** Evaluate innovation and R&D
- **Procurement:** Assess supplier strategy and cost optimization

**Identify for each activity:**
- Value creation moments
- Cost structure and efficiencies
- Optimization opportunities`,

      'ForceField': `Conduct a comprehensive Force Field Analysis:

**Analyze the desired change by:**

**Driving Forces (supporting the change):**
- Internal factors promoting change
- External market pressure and opportunities
- Stakeholder support
- Available resources and capabilities

**Restraining Forces (opposing the change):**
- Resistance to change
- Organizational barriers
- Resource limitations
- External threats

**For each force determine:**
- Strength and influence (1-10 scale)
- Controllability
- Strategies to strengthen driving forces
- Tactics to weaken restraining forces`,

      'CoreCompetencies': `Conduct a comprehensive Core Competencies Analysis:

**Identify unique capabilities and knowledge:**

**Core Competencies Criteria:**
- **Valuable:** Creates value for customers
- **Rare:** Difficult to find among competitors
- **Difficult to imitate:** Unique and complex
- **Organizationally embedded:** Well integrated into the organization

**Analyze per competency:**
- Technical skills and expertise
- Unique processes and methodologies
- Proprietary technologies
- Organizational capabilities
- Relationships and networks

**Evaluate:**
- Current strength of core competencies
- Competitive advantage they provide
- Development opportunities
- Strategic applications`,

      'ScenarioPlanning': `Conduct a comprehensive Scenario Planning Summary:

**Analyze discussed future scenarios:**

**Identify Scenarios:**
- Different possible future visions
- Probability of each scenario
- Time horizon and development phase

**Driving Forces:**
- Crucial uncertainties that determine scenarios
- External trends and developments
- Technological changes
- Social and economic shifts

**Impact Analysis:**
- Consequences for the business per scenario
- Strategic implications
- Risks and opportunities
- Required adjustments and preparations`,

      'PESTEL': `Conduct a comprehensive PESTEL Analysis:

**Analyze the external macro-environment:**

**Political Factors:**
- Government policy and regulation
- Political stability
- Trade policy and tariffs
- Tax policy

**Economic Factors:**
- Economic growth and business cycle
- Inflation and interest rates
- Exchange rates
- Unemployment and purchasing power

**Social-cultural Factors:**
- Demographic trends
- Lifestyle and values
- Education and culture
- Health and welfare

**Technological Factors:**
- Innovations and R&D
- Automation and digitalization
- Technological infrastructure
- Intellectual property

**Environmental Factors:**
- Environmental legislation
- Climate change
- Sustainability and circular economy
- Natural resources

**Legal Factors:**
- Laws and regulations
- Labor law
- Consumer protection
- Intellectual property rights`,

      'PortersFiveForces': `Conduct a comprehensive Competitive Forces Analysis (Porter's Five Forces):

**Analyze competitive intensity:**

**1. Threat of New Entrants:**
- Entry barriers (capital, technology, economies of scale)
- Brand loyalty and customer retention
- Access to distribution channels
- Government regulation

**2. Bargaining Power of Suppliers:**
- Supplier concentration
- Uniqueness of supplied products/services
- Switching costs for the company
- Forward integration possibilities

**3. Bargaining Power of Buyers:**
- Customer concentration
- Purchase volume
- Switching costs for customers
- Backward integration possibilities

**4. Threat of Substitutes:**
- Availability of alternatives
- Price-performance ratio of substitutes
- Switching costs to substitutes
- Customer preference and loyalty

**5. Intensity of Rivalry:**
- Number and size of competitors
- Market growth rate
- Product differentiation
- Exit barriers and overcapacity`,

      'AnsoffMatrix': `Conduct a comprehensive Growth Strategies Analysis (Ansoff Matrix):

**Analyze growth strategies per Product/Market combination:**

**1. Market Penetration (Existing Products + Existing Markets):**
- Increase market share
- Stimulate more usage by existing customers
- Attract customers from competitors
- Pricing strategies and promotions

**2. Market Development (Existing Products + New Markets):**
- Geographic expansion
- New customer segments
- New distribution channels
- New applications of existing products

**3. Product Development (New Products + Existing Markets):**
- Product innovation and improvement
- Product line extension
- New features and functionalities
- Technological upgrades

**4. Diversification (New Products + New Markets):**
- Related diversification (synergies)
- Unrelated diversification (risk spreading)
- Horizontal or vertical integration
- Joint ventures and partnerships

**For each strategy evaluate:**
- Risk and complexity
- Required investments and resources
- Expected returns and growth
- Strategic fit with organization`,

      'BCGMatrix': `Conduct a comprehensive Portfolio Analysis (BCG Matrix):

**Analyze the product portfolio:**

**1. Question Marks:**
- Products with high growth potential but low market share
- Market growth and competition intensity
- Required investments for growth
- Potential to become Stars

**2. Stars:**
- Products with high market share in fast-growing markets
- Cash flow generation and profitability
- Investment needs to maintain position
- Market leadership and differentiation

**3. Cash Cows:**
- Products with high market share in mature markets
- Strong cash flow generation with minimal investments
- Market saturation and growth opportunities
- Strategy for maximizing returns

**4. Dogs:**
- Products with low market share in slow-growing markets
- Cost-benefit analysis and profitability
- Exit strategies and divestment
- Possible repositioning or improvement

**For each quadrant evaluate:**
- Strategic position and future potential
- Resource allocation and investment priorities
- Portfolio balance and risk diversification`,

      'GE_McKinseyMatrix': `Conduct a comprehensive Business Unit Evaluation (GE/McKinsey Matrix):

**Analyze business units on two dimensions:**

**1. Industry Attractiveness:**
- Market size and growth potential
- Competition intensity and profitability
- Technological developments and innovation
- Regulatory and political factors
- Entry barriers and market structure

**2. Competitive Advantage:**
- Market share and relative position
- Cost advantages and operational efficiency
- Product differentiation and brand strength
- Technological leadership and innovation
- Distribution channels and customer relationships

**Categorize business units into:**
- **Invest/Grow:** High attractiveness, strong advantage
- **Select/Harvest:** Medium attractiveness, medium advantage  
- **Divest/Exit:** Low attractiveness, weak advantage

**For each category determine:**
- Strategic direction and resource allocation
- Investment level and growth expectations
- Performance metrics and targets`,

      'McKinseyHorizons': `Conduct a comprehensive Growth Horizons Analysis (McKinsey Three Horizons):

**Analyze growth initiatives across three time horizons:**

**Horizon 1 (Current Business):**
- Optimization of existing core activities
- Improvement of operational efficiency
- Market share maintenance and incremental growth
- Cash flow generation and profit maximization

**Horizon 2 (Emerging Business):**
- Development of new business models
- Expansion into adjacent markets
- Scaling and growth acceleration
- Building future core activities

**Horizon 3 (Future Options):**
- Research of radical innovations
- Experimentation with disruptive technologies
- Creation of new markets and ecosystems
- Preparation for long-term transformation

**For each horizon evaluate:**
- Timeframe and investment horizon
- Risk profile and uncertainty level
- Resource allocation and portfolio balance
- Management focus and measurable results`,

      'DigitalTransformation': `Conduct a comprehensive Digital Transformation Analysis:

**Analyze digital maturity and transformation:**

**Digital Strategy:**
- Vision and roadmap for digital transformation
- Alignment with business objectives
- Digital value creation and differentiation
- Ecosystem development and partnerships

**Technology & Data:**
- Technological infrastructure and architectures
- Data management and analytics capabilities
- Cloud adoption and digital platforms
- Cybersecurity and compliance

**Processes & Operations:**
- Digital workflow automation
- Customer journey digitalization
- Supply chain and operational efficiency
- Agile working and digital collaboration

**Organization & Culture:**
- Digital skills and capabilities
- Organizational structure and governance
- Change management and adoption
- Innovation culture and experimentation

**Evaluate per dimension:**
- Current maturity and capability level
- Transformational priorities and quick wins
- Required investments and resources
- Impact on customer value and operational excellence`,

      'SustainabilityFramework': `Conduct a comprehensive Sustainability Analysis:

**Analyze sustainability performance and opportunities:**

**Environmental (Planet):**
- Carbon footprint and emission reduction
- Energy efficiency and renewable energy
- Water management and circular economy
- Biodiversity and natural capital

**Social (People):**
- Diversity, equality and inclusion
- Working conditions and human rights
- Community engagement and social impact
- Consumer welfare and product safety

**Governance (Profit):**
- Business ethics and compliance
- Transparency and stakeholder engagement
- Risk management and due diligence
- Long-term value creation and resilience

**For each pillar evaluate:**
- Current performance and benchmark position
- Regulatory compliance and future requirements
- Stakeholder expectations and societal trends
- Opportunities for innovation and competitive advantage
- Metric goals and impact measurement`
    }
  };

  const langPrompts = prompts[language as keyof typeof prompts] || prompts['en'];
  return langPrompts[framework];
}

// Get role-specific context
function getRoleContext(roleId: string, language: string): string {
  const roleContexts = {
    'nl': {
      'strategy-consultant': 'Je bent een ervaren strategieconsultant met expertise in McKinsey-methodologieën. Je helpt organisaties met strategische vraagstukken en transformaties.',
      'business-analyst': 'Je bent een business analist met sterke analytische vaardigheden en ervaring in het toepassen van McKinsey-frameworks voor bedrijfsanalyse.',
      'management-consultant': 'Je bent een managementconsultant gespecialiseerd in organisatieontwikkeling en het implementeren van McKinsey-best practices.',
      'ceo-advisor': 'Je bent een senior advisor voor CEO\'s en topmanagement, met diepgaande kennis van McKinsey-strategieën en -methodologieën.'
    },
    'en': {
      'strategy-consultant': 'You are an experienced strategy consultant with expertise in McKinsey methodologies. You help organizations with strategic issues and transformations.',
      'business-analyst': 'You are a business analyst with strong analytical skills and experience in applying McKinsey frameworks for business analysis.',
      'management-consultant': 'You are a management consultant specialized in organizational development and implementing McKinsey best practices.',
      'ceo-advisor': 'You are a senior advisor to CEOs and top management, with deep knowledge of McKinsey strategies and methodologies.'
    }
  };

  const langContexts = roleContexts[language as keyof typeof roleContexts] || roleContexts['en'];
  return langContexts[roleId as keyof typeof langContexts] || langContexts['strategy-consultant'];
}

// Parse topics from AI response
function parseTopicsFromResponse(response: string, language: string): McKinseyTopic[] {
  try {
    // Try to extract JSON from response
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const topics = JSON.parse(jsonMatch[0]);
      if (Array.isArray(topics) && topics.length > 0) {
        return topics.map((topic, index) => ({
          id: `topic-${index + 1}`,
          title: topic.title || topic.naam || `Topic ${index + 1}`,
          description: topic.description || topic.beschrijving || '',
          context: topic.context || topic.achtergrond || '',
          businessImpact: topic.businessImpact || topic.bedrijfsimpact || 'medium',
          complexity: topic.complexity || topic.complexiteit || 'medium'
        }));
      }
    }

    // Fallback: create topics from response text
    return createFallbackTopics(response, language);
  } catch (error) {
    return createFallbackTopics(response, language);
  }
}

// Create fallback topics when JSON parsing fails
function createFallbackTopics(response: string, language: string): McKinseyTopic[] {
  const fallbackTitles = getLocalizedFallbackTitles(language);
  
  return fallbackTitles.map((title, index) => ({
    id: `fallback-topic-${index + 1}`,
    title,
    description: getLocalizedFallbackDescription(language),
    context: response.substring(0, 200) + '...',
    businessImpact: 'medium',
    complexity: 'medium'
  }));
}

// Get localized fallback topic titles
function getLocalizedFallbackTitles(language: string): string[] {
  const titles = {
    'nl': [
      'Strategische Analyse',
      'Marktpositie Evaluatie',
      'Organisatie Optimalisatie'
    ],
    'en': [
      'Strategic Analysis',
      'Market Position Evaluation',
      'Organization Optimization'
    ],
    'de': [
      'Strategische Analyse',
      'Marktposition Bewertung',
      'Organisationsoptimierung'
    ]
  };

  return titles[language as keyof typeof titles] || titles['en'];
}

// Get localized fallback description
function getLocalizedFallbackDescription(language: string): string {
  const descriptions = {
    'nl': 'Een strategisch onderwerp voor McKinsey-analyse',
    'en': 'A strategic topic for McKinsey analysis',
    'de': 'Ein strategisches Thema für McKinsey-Analyse'
  };

  return descriptions[language as keyof typeof descriptions] || descriptions['en'];
}

// Cache for generated topics to prevent regeneration
const topicCache = new Map<string, McKinseyTopic[]>();

// Simple hash function for content caching
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(36);
}

// Get language-specific instructions for prompts
function getLanguageInstructions(language: string) {
  const instructions = {
    'nl': {
      systemPrompt: 'Je bent een expert McKinsey-consultant met uitgebreide ervaring in strategische analyse en bedrijfstransformatie. Je houdt je strikt aan de gegeven transcript_text en baseert alle conclusies uitsluitend op aantoonbare informatie.',
      topicGenerationPrompt: 'Genereer 3-5 strategische onderwerpen die geschikt zijn voor McKinsey-analyse (3C of 7S framework) gebaseerd op de gegeven inhoud.',
      topicRequirements: `Elk onderwerp moet:
- Een duidelijke titel hebben
- Een beknopte beschrijving bevatten
- Relevante context bieden
- Geschikt zijn voor strategische analyse`,
      outputFormat: 'Geef de onderwerpen terug in JSON-formaat met de velden: title, description, context, businessImpact, complexity.',
      jsonFormat: 'Gebruik alleen geldige JSON-syntax. Geen extra tekst buiten de JSON.',
      analysisInstructions: `Voer een diepgaande analyse uit met strikte naleving van de volgende principes:

FEITELIJKE CORRECTHEID:
- Baseer ALLE informatie uitsluitend op de transcript_text
- Citeer specifieke passages waar mogelijk
- Maak geen aannames buiten de gegeven context

OBJECTIVITEIT:
- Presenteer neutrale business analyse
- Vermijd subjectieve interpretaties tenzij de rol dit vereist
- Gebruik zakelijke, professionele taal

VOLLEDIGHEID:
- Behandel alle relevante aspecten van het gekozen framework
- Dek alle beschikbare informatie uit de transcript systematisch af
- Structureer de analyse volgens het framework

CONSISTENTIE:
- Gebruik consistente terminologie door de hele analyse
- Handhaaf uniforme opmaak en structuur
- Zorg voor logische samenhang tussen secties

GEEN HALLUCINATIES:
- Geef expliciet aan wanneer informatie ontbreekt: "Deze informatie is niet beschikbaar in de transcript"
- Maak geen veronderstellingen over ontbrekende data
- Wees transparant over beperkingen van de analyse`,
      analysisRequirements: `Je analyse moet in het ${language.toUpperCase()} worden geschreven en:
- Gestructureerd zijn volgens het gekozen framework
- Alleen verifieerbare informatie uit de transcript bevatten
- Duidelijk aangeven waar informatie ontbreekt
- Praktische, op feiten gebaseerde aanbevelingen geven
- Consistente terminologie gebruiken`,
      professionalTone: 'Gebruik een professionele, analytische toon zoals gebruikelijk bij McKinsey-rapporten. Schrijf in het Nederlands en zorg voor heldere, zakelijke communicatie.'
    },
    'en': {
      systemPrompt: 'You are an expert McKinsey consultant with extensive experience in strategic analysis and business transformation. You strictly adhere to the given transcript_text and base all conclusions exclusively on demonstrable information.',
      topicGenerationPrompt: 'Generate 3-5 strategic topics suitable for McKinsey analysis (3C or 7S framework) based on the given content.',
      topicRequirements: `Each topic should:
- Have a clear title
- Contain a concise description
- Provide relevant context
- Be suitable for strategic analysis`,
      outputFormat: 'Return the topics in JSON format with fields: title, description, context, businessImpact, complexity.',
      jsonFormat: 'Use only valid JSON syntax. No additional text outside the JSON.',
      analysisInstructions: `Conduct an in-depth analysis with strict adherence to the following principles:

FACTUAL CORRECTNESS:
- Base ALL information exclusively on the transcript_text
- Quote specific passages where possible
- Make no assumptions beyond the given context

OBJECTIVITY:
- Present neutral business analysis
- Avoid subjective interpretations unless the role requires it
- Use professional, business language

COMPLETENESS:
- Address all relevant aspects of the chosen framework
- Systematically cover all available information from the transcript
- Structure the analysis according to the framework

CONSISTENCY:
- Use consistent terminology throughout the analysis
- Maintain uniform formatting and structure
- Ensure logical coherence between sections

NO HALLUCINATIONS:
- Explicitly state when information is missing: "This information is not available in the transcript"
- Make no assumptions about missing data
- Be transparent about analysis limitations`,
      analysisRequirements: `Your analysis must be written in ${language.toUpperCase()} and:
- Be structured according to the chosen framework
- Contain only verifiable information from the transcript
- Clearly indicate where information is missing
- Provide practical, fact-based recommendations
- Use consistent terminology`,
      professionalTone: 'Use a professional, analytical tone as typical in McKinsey reports. Write in English and ensure clear, business communication.'
    },
    'de': {
      systemPrompt: 'Sie sind ein erfahrener McKinsey-Berater mit umfassender Erfahrung in strategischer Analyse und Unternehmenstransformation. Sie halten sich strikt an den gegebenen transcript_text und basieren alle Schlussfolgerungen ausschließlich auf nachweisbaren Informationen.',
      topicGenerationPrompt: 'Generieren Sie 3-5 strategische Themen, die für McKinsey-Analysen (3C oder 7S Framework) geeignet sind, basierend auf dem gegebenen Inhalt.',
      topicRequirements: `Jedes Thema sollte:
- Einen klaren Titel haben
- Eine prägnante Beschreibung enthalten
- Relevanten Kontext bieten
- Für strategische Analyse geeignet sein`,
      outputFormat: 'Geben Sie die Themen im JSON-Format mit den Feldern zurück: title, description, context, businessImpact, complexity.',
      jsonFormat: 'Verwenden Sie nur gültige JSON-Syntax. Kein zusätzlicher Text außerhalb des JSON.',
      analysisInstructions: `Führen Sie eine tiefgreifende Analyse mit strikter Einhaltung der folgenden Prinzipien durch:

FAKTISCHE KORREKTHEIT:
- Basieren Sie ALLE Informationen ausschließlich auf dem transcript_text
- Zitieren Sie spezifische Passagen wo möglich
- Machen Sie keine Annahmen außerhalb des gegebenen Kontexts

OBJEKTIVITÄT:
- Präsentieren Sie neutrale Geschäftsanalyse
- Vermeiden Sie subjektive Interpretationen, es sei denn, die Rolle erfordert es
- Verwenden Sie professionelle, geschäftliche Sprache

VOLLSTÄNDIGKEIT:
- Behandeln Sie alle relevanten Aspekte des gewählten Frameworks
- Decken Sie systematisch alle verfügbaren Informationen aus dem Transkript ab
- Strukturieren Sie die Analyse nach dem Framework

KONSISTENZ:
- Verwenden Sie konsistente Terminologie in der gesamten Analyse
- Behalten Sie einheitliche Formatierung und Struktur bei
- Sorgen Sie für logische Kohärenz zwischen den Abschnitten

KEINE HALLUZINATIONEN:
- Geben Sie explizit an, wenn Informationen fehlen: "Diese Information ist im Transkript nicht verfügbar"
- Machen Sie keine Annahmen über fehlende Daten
- Seien Sie transparent über Analysebegrenzungen`,
      analysisRequirements: `Ihre Analyse muss in ${language.toUpperCase()} geschrieben werden und:
- Nach dem gewählten Framework strukturiert sein
- Nur überprüfbare Informationen aus dem Transkript enthalten
- Klar angeben, wo Informationen fehlen
- Praktische, faktenbasierte Empfehlungen geben
- Konsistente Terminologie verwenden`,
      professionalTone: 'Verwenden Sie einen professionellen, analytischen Ton, wie er in McKinsey-Berichten üblich ist. Schreiben Sie auf Deutsch und sorgen Sie für klare, geschäftliche Kommunikation.'
    }
  };

  return instructions[language as keyof typeof instructions] || instructions['en'];
}

// Post-process analysis to improve formatting and professionalism
function postProcessAnalysis(analysis: string, framework: McKinseyFramework, language: string): string {
  let processed = analysis;
  
  // Clean up common formatting issues
  processed = processed
    // Fix inconsistent markdown headers
    .replace(/##\s+#/g, '##')
    .replace(/###\s+#/g, '###')
    .replace(/####\s+#/g, '####')
    
    // Fix inconsistent bullet points
    .replace(/\*\s+\*/g, '* ')
    .replace(/\-\s+\-/g, '- ')
    
    // Remove extra whitespace
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\s{2,}/g, ' ')
    
    // Fix inconsistent spacing after headers
    .replace(/(#+\s.*?)\n(\s*\n)*/g, '$1\n\n');

  // Add framework-specific formatting improvements
  if (framework === '3C') {
    processed = enhance3CFormatting(processed, language);
  } else if (framework === '7S') {
    processed = enhance7SFormatting(processed, language);
  } else if (framework === 'CoreCompetencies') {
    processed = enhanceCoreCompetenciesFormatting(processed, language);
  }

  // Ensure proper section structure
  processed = ensureSectionStructure(processed, language);

  return processed;
}

// Enhance 3C analysis formatting
function enhance3CFormatting(analysis: string, language: string): string {
  const sectionTitles = {
    'nl': ['**Company (Bedrijf):**', '**Customers (Klanten):**', '**Competitors (Concurrenten):**'],
    'en': ['**Company:**', '**Customers:**', '**Competitors:**'],
    'de': ['**Company (Unternehmen):**', '**Customers (Kunden):**', '**Competitors (Wettbewerber):**']
  };

  const titles = sectionTitles[language as keyof typeof sectionTitles] || sectionTitles['en'];
  
  let enhanced = analysis;
  
  // Ensure proper section spacing
  titles.forEach(title => {
    enhanced = enhanced.replace(new RegExp(`(${title})`, 'g'), '\n\n$1\n\n');
  });

  return enhanced;
}

// Enhance 7S analysis formatting
function enhance7SFormatting(analysis: string, language: string): string {
  const hardElements = {
    'nl': ['**Strategy (Strategie):**', '**Structure (Structuur):**', '**Systems (Systemen):**'],
    'en': ['**Strategy:**', '**Structure:**', '**Systems:**'],
    'de': ['**Strategy (Strategie):**', '**Structure (Struktur):**', '**Systems (Systeme):**']
  };

  const softElements = {
    'nl': ['**Shared Values (Gedeelde Waarden):**', '**Style (Stijl):**', '**Staff (Personeel):**', '**Skills (Vaardigheden):**'],
    'en': ['**Shared Values:**', '**Style:**', '**Staff:**', '**Skills:**'],
    'de': ['**Shared Values (Gemeinsame Werte):**', '**Style (Stil):**', '**Staff (Personal):**', '**Skills (Fähigkeiten):**']
  };

  const hardTitles = hardElements[language as keyof typeof hardElements] || hardElements['en'];
  const softTitles = softElements[language as keyof typeof softElements] || softElements['en'];
  
  let enhanced = analysis;
  
  // Ensure proper section spacing for hard elements
  hardTitles.forEach(title => {
    enhanced = enhanced.replace(new RegExp(`(${title})`, 'g'), '\n\n$1\n\n');
  });

  // Ensure proper section spacing for soft elements
  softTitles.forEach(title => {
    enhanced = enhanced.replace(new RegExp(`(${title})`, 'g'), '\n\n$1\n\n');
  });

  return enhanced;
}

// Enhance Core Competencies formatting
function enhanceCoreCompetenciesFormatting(analysis: string, language: string): string {
  const criteriaTitles = {
    'nl': ['**Kerncompetenties Criteria:**', '**Analyze per competency:**', '**Evaluate:**'],
    'en': ['**Core Competencies Criteria:**', '**Analyze per competency:**', '**Evaluate:**'],
    'de': ['**Kernkompetenzen Kriterien:**', '**Analyze per competency:**', '**Evaluate:**']
  };

  const titles = criteriaTitles[language as keyof typeof criteriaTitles] || criteriaTitles['en'];
  
  let enhanced = analysis;
  
  // Ensure proper section spacing
  titles.forEach(title => {
    enhanced = enhanced.replace(new RegExp(`(${title})`, 'g'), '\n\n$1\n\n');
  });

  return enhanced;
}

// Ensure proper section structure throughout the analysis
function ensureSectionStructure(analysis: string, language: string): string {
  const sectionHeaders = {
    'nl': ['## ', '### ', '#### '],
    'en': ['## ', '### ', '#### '],
    'de': ['## ', '### ', '#### ']
  };

  const headers = sectionHeaders[language as keyof typeof sectionHeaders] || sectionHeaders['en'];
  
  let structured = analysis;
  
  // Ensure proper spacing after headers
  headers.forEach(header => {
    structured = structured.replace(
      new RegExp(`(${header}[^\n]*)\n(\s*\n)*`, 'g'),
      '$1\n\n'
    );
  });

  // Ensure bullet points have proper spacing
  structured = structured.replace(/(\*\s+[^\n]*)\n(\s*\n)*/g, '$1\n');

  return structured;
}