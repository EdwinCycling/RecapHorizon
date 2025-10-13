# Tier-Based Model Configuration System

Dit document beschrijft het tier-based model configuratie systeem dat is geïmplementeerd in RecapSmart. Dit systeem stelt verschillende AI-modellen in op basis van de subscription tier van de gebruiker.

## Overzicht

Het systeem ondersteunt 5 subscription tiers, elk met hun eigen model configuratie:

- **FREE**: Gebruikt `gemini-2.5-flash-lite` voor alle functies (meest kosteneffectief)
- **SILVER**: Gebruikt `gemini-2.5-flash` voor belangrijke functies, `lite` voor eenvoudige taken
- **GOLD**: Gebruikt `gemini-2.0-flash-exp` voor geavanceerde functies, `flash` voor anderen
- **DIAMOND**: Gebruikt `gemini-2.0-flash-exp` voor alle functies (beste kwaliteit)
- **ENTERPRISE**: Gebruikt `gemini-2.0-flash-exp` voor alle functies (beste kwaliteit)

## Model Configuratie per Tier

### FREE Tier
```typescript
{
  audioTranscription: 'gemini-2.5-flash-lite',
  expertChat: 'gemini-2.5-flash-lite',
  emailComposition: 'gemini-2.5-flash-lite',
  analysisGeneration: 'gemini-2.5-flash-lite',
  pptExport: 'gemini-2.5-flash-lite',
  businessCase: 'gemini-2.5-flash-lite',
  sessionImport: 'gemini-2.5-flash-lite',
  generalAnalysis: 'gemini-2.5-flash-lite'
}
```

### SILVER Tier
```typescript
{
  audioTranscription: 'gemini-2.5-flash',        // Betere kwaliteit voor audio
  expertChat: 'gemini-2.5-flash-lite',           // Eenvoudige gesprekken
  emailComposition: 'gemini-2.5-flash-lite',     // Eenvoudige tekst generatie
  analysisGeneration: 'gemini-2.5-flash',        // Goede kwaliteit analyse
  pptExport: 'gemini-2.5-flash',                 // Goede gestructureerde output
  businessCase: 'gemini-2.5-flash',              // Goede redenering
  sessionImport: 'gemini-2.5-flash-lite',        // Eenvoudige verwerking
  generalAnalysis: 'gemini-2.5-flash'            // Gebalanceerd voor silver gebruikers
}
```

### GOLD Tier
```typescript
{
  audioTranscription: 'gemini-2.5-flash',        // Hoge kwaliteit
  expertChat: 'gemini-2.5-flash',                // Betere gesprekken
  emailComposition: 'gemini-2.5-flash',          // Betere tekst generatie
  analysisGeneration: 'gemini-2.0-flash-exp',    // Experimentele functies
  pptExport: 'gemini-2.5-flash',                 // Hoge kwaliteit gestructureerde output
  businessCase: 'gemini-2.0-flash-exp',          // Geavanceerde redenering
  sessionImport: 'gemini-2.5-flash',             // Betere verwerking
  generalAnalysis: 'gemini-2.0-flash-exp'        // Nieuwste functies voor gold
}
```

### DIAMOND & ENTERPRISE Tiers
```typescript
{
  audioTranscription: 'gemini-2.0-flash-exp',    // Beste kwaliteit
  expertChat: 'gemini-2.0-flash-exp',            // Beste gesprekken
  emailComposition: 'gemini-2.0-flash-exp',      // Beste tekst generatie
  analysisGeneration: 'gemini-2.0-flash-exp',    // Beste analyse
  pptExport: 'gemini-2.0-flash-exp',             // Beste gestructureerde output
  businessCase: 'gemini-2.0-flash-exp',          // Beste redenering
  sessionImport: 'gemini-2.0-flash-exp',         // Beste verwerking
  generalAnalysis: 'gemini-2.0-flash-exp'        // Beste kwaliteit
}
```

## Gebruik in Code

### Basis Gebruik

```typescript
import { getModelForUser } from './utils/tierModelService';

// Krijg het juiste model voor een gebruiker en functie
const model = await getModelForUser(userId, 'audioTranscription');
```

### Direct per Tier

```typescript
import { getModelByTier } from './utils/tierModelService';
import { SubscriptionTier } from '../types';

// Krijg model direct per tier
const model = getModelByTier(SubscriptionTier.GOLD, 'analysisGeneration');
```

### Volledige Configuratie Ophalen

```typescript
import { getModelConfigForUser } from './utils/tierModelService';

// Krijg de volledige model configuratie voor een gebruiker
const config = await getModelConfigForUser(userId);
```

### Kosten Vergelijking

```typescript
import { tierModelService } from './utils/tierModelService';

// Bereken kosten vergelijking tussen tiers
const costs = tierModelService.calculateTierCosts(100000); // 100k tokens per maand
```

## Firestore Structuur

De tier configuraties worden opgeslagen in Firestore onder de `settings` collectie:

```
settings/
├── modelConfig_free
├── modelConfig_silver
├── modelConfig_gold
├── modelConfig_diamond
└── modelConfig_enterprise
```

Elk document bevat:
```typescript
{
  audioTranscription: string,
  expertChat: string,
  emailComposition: string,
  analysisGeneration: string,
  pptExport: string,
  businessCase: string,
  sessionImport: string,
  generalAnalysis: string,
  tier: string,
  createdAt: string,
  updatedAt: string,
  createdBy: string,
  description: string
}
```

## Scripts

### Initialisatie

Om de tier configuraties te initialiseren:

```bash
npm run init-tier-models
```

Dit script:
1. Maakt verbinding met Firebase
2. Creëert model configuraties voor alle tiers
3. Slaat ze op in Firestore
4. Toont een overzicht van de gemaakte configuraties

## Admin Interface

Er is een admin component beschikbaar om de tier configuraties te bekijken:

```typescript
import TierModelConfigViewer from './components/admin/TierModelConfigViewer';

// Gebruik in je admin interface
<TierModelConfigViewer />
```

Deze component toont:
- Alle tier configuraties
- Model details en kosten
- Kosten vergelijking tussen tiers
- Gebruiksinstructies

## Voordelen

1. **Kostenoptimalisatie**: FREE tier gebruikt goedkopere modellen
2. **Kwaliteitsverbetering**: Hogere tiers krijgen betere modellen
3. **Flexibiliteit**: Eenvoudig aan te passen per tier
4. **Schaalbaarheid**: Nieuwe tiers kunnen eenvoudig worden toegevoegd
5. **Transparantie**: Duidelijke kosten vergelijking tussen tiers

## Toekomstige Uitbreidingen

- Dynamische model selectie op basis van workload
- A/B testing tussen modellen
- Gebruiker-specifieke model voorkeuren
- Real-time kosten monitoring
- Automatische tier aanbevelingen op basis van gebruik