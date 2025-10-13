# Nieuwe AI Modellen Toevoegen aan RecapSmart

Dit document beschrijft hoe je nieuwe AI modellen kunt toevoegen aan het RecapSmart tier-based model systeem.

## Overzicht

Het RecapSmart systeem gebruikt een gelaagde aanpak voor AI model configuratie:
1. **Model Definitie**: Beschrijf het nieuwe model en zijn eigenschappen
2. **Tier Configuratie**: Wijs het model toe aan specifieke subscription tiers
3. **Database Update**: Update de Firestore configuratie
4. **Testing**: Test het nieuwe model in alle relevante functies

## Stap 1: Model Definitie Toevoegen

### 1.1 Update AVAILABLE_MODELS in modelManager.ts

Voeg het nieuwe model toe aan de `AVAILABLE_MODELS` object in `src/utils/modelManager.ts`:

```typescript
export const AVAILABLE_MODELS = {
  // Bestaande modellen...
  'gemini-2.5-flash': {
    name: 'Gemini 2.5 Flash',
    description: 'Balanced performance and cost',
    inputCost: 0.30,
    outputCost: 2.50,
    speed: 'Fast',
    quality: 'High'
  },
  
  // NIEUW MODEL TOEVOEGEN:
  'gemini-3.0-ultra': {
    name: 'Gemini 3.0 Ultra',
    description: 'Next-generation model with enhanced capabilities',
    inputCost: 0.50, // per 1M tokens
    outputCost: 4.00, // per 1M tokens
    speed: 'Medium',
    quality: 'Exceptional'
  }
};
```

### 1.2 Model Eigenschappen

Zorg ervoor dat je de volgende eigenschappen correct instelt:
- **name**: Gebruiksvriendelijke naam voor het model
- **description**: Korte beschrijving van de mogelijkheden
- **inputCost**: Kosten per 1M input tokens (in dollars)
- **outputCost**: Kosten per 1M output tokens (in dollars)
- **speed**: Verwachte snelheid ('Very Fast', 'Fast', 'Medium', 'Slow')
- **quality**: Kwaliteitsniveau ('Good', 'High', 'Very High', 'Exceptional')

## Stap 2: Tier Configuratie Updaten

### 2.1 Update TIER_MODEL_CONFIGS

Besluit voor welke tiers en functies het nieuwe model gebruikt moet worden:

```typescript
export const TIER_MODEL_CONFIGS: Record<SubscriptionTier, ModelConfig> = {
  [SubscriptionTier.FREE]: {
    // FREE tier blijft meestal ongewijzigd voor kostenbeheersing
    audioTranscription: 'gemini-2.5-flash-lite',
    expertChat: 'gemini-2.5-flash-lite',
    // ... andere functies
  },
  
  [SubscriptionTier.DIAMOND]: {
    audioTranscription: 'gemini-3.0-ultra', // NIEUW MODEL HIER
    expertChat: 'gemini-3.0-ultra',
    emailComposition: 'gemini-3.0-ultra',
    analysisGeneration: 'gemini-3.0-ultra',
    pptExport: 'gemini-3.0-ultra',
    businessCase: 'gemini-3.0-ultra',
    sessionImport: 'gemini-3.0-ultra',
    generalAnalysis: 'gemini-3.0-ultra'
  },
  
  [SubscriptionTier.ENTERPRISE]: {
    // Enterprise krijgt ook het nieuwe model
    audioTranscription: 'gemini-3.0-ultra',
    expertChat: 'gemini-3.0-ultra',
    // ... andere functies
  }
};
```

### 2.2 Tier Selectie Richtlijnen

**FREE Tier**: Gebruik alleen de goedkoopste modellen
- Meestal `gemini-2.5-flash-lite` voor alle functies
- Alleen wijzigen als er een nog goedkoper model beschikbaar komt

**SILVER Tier**: Balans tussen kost en kwaliteit
- `gemini-2.5-flash` voor belangrijke functies
- `gemini-2.5-flash-lite` voor eenvoudige taken

**GOLD Tier**: Hoge kwaliteit met experimentele functies
- `gemini-2.0-flash-exp` voor geavanceerde functies
- `gemini-2.5-flash` voor standaard functies

**DIAMOND/ENTERPRISE Tier**: Beste beschikbare modellen
- Nieuwste en beste modellen voor alle functies
- Geen kostenbeperking

## Stap 3: Database Configuratie Updaten

### 3.1 Update het Initialisatie Script

Update `scripts/initializeTierModelConfigs.js` met de nieuwe model configuraties:

```javascript
const TIER_MODEL_CONFIGS = {
  [SubscriptionTier.DIAMOND]: {
    audioTranscription: 'gemini-3.0-ultra', // NIEUW MODEL
    expertChat: 'gemini-3.0-ultra',
    // ... andere functies
  },
  // ... andere tiers
};
```

### 3.2 Run Database Update

Voer het script uit om de Firestore database bij te werken:

```bash
cd scripts
node initializeTierModelConfigs.js
```

Dit script zal:
1. Verbinding maken met Firestore
2. De nieuwe configuraties uploaden
3. Bestaande configuraties overschrijven
4. Een overzicht tonen van de wijzigingen

## Stap 4: Testing en Validatie

### 4.1 Lokale Testing

1. **Start de development server**:
   ```bash
   npm run dev
   ```

2. **Test model selectie**:
   ```typescript
   import { getModelForUser } from './utils/tierModelService';
   
   // Test voor verschillende tiers
   const diamondModel = await getModelForUser('test-user-id', 'audioTranscription');
   console.log('Diamond tier model:', diamondModel); // Moet 'gemini-3.0-ultra' zijn
   ```

3. **Test kosten berekening**:
   ```typescript
   import { tierModelService } from './utils/tierModelService';
   
   const costs = tierModelService.calculateTierCosts(100000);
   console.log('Tier costs:', costs);
   ```

### 4.2 Functionaliteit Testing

Test het nieuwe model in alle relevante functies:

- **Audio Transcriptie**: Upload een audio bestand
- **Expert Chat**: Start een gesprek
- **Email Compositie**: Genereer een email
- **Analyse Generatie**: Maak een analyse
- **PPT Export**: Exporteer naar PowerPoint
- **Business Case**: Genereer een business case
- **Session Import**: Importeer een sessie
- **General Analysis**: Voer een algemene analyse uit

### 4.3 Performance Monitoring

Monitor de performance van het nieuwe model:

1. **Response tijd**: Meet hoe snel het model reageert
2. **Kwaliteit**: Evalueer de output kwaliteit
3. **Kosten**: Monitor de werkelijke kosten
4. **Error rate**: Check voor fouten of failures

## Stap 5: Documentatie Updaten

### 5.1 Update TIER_MODEL_SYSTEM.md

Update de hoofddocumentatie met:
- Nieuwe model beschrijving
- Bijgewerkte tier configuraties
- Kosten vergelijking

### 5.2 Update Admin Interface

Als er een admin interface is, zorg ervoor dat:
- Het nieuwe model zichtbaar is
- Kosten correct worden weergegeven
- Configuratie wijzigingen mogelijk zijn

## Stap 6: Deployment

### 6.1 Pre-deployment Checklist

- [ ] Alle tests slagen
- [ ] Firestore configuratie is bijgewerkt
- [ ] Documentatie is compleet
- [ ] Performance is gevalideerd
- [ ] Kosten zijn gecontroleerd

### 6.2 Deployment Process

1. **Commit changes**:
   ```bash
   git add .
   git commit -m "Add new AI model: gemini-3.0-ultra"
   ```

2. **Deploy to staging**:
   ```bash
   npm run deploy:staging
   ```

3. **Test in staging environment**

4. **Deploy to production**:
   ```bash
   npm run deploy:production
   ```

## Troubleshooting

### Veelvoorkomende Problemen

**Model niet beschikbaar**:
- Check of het model correct is toegevoegd aan `AVAILABLE_MODELS`
- Verificeer de spelling van de model naam
- Controleer of de Firestore configuratie is bijgewerkt

**Verkeerde kosten berekening**:
- Controleer de `inputCost` en `outputCost` waarden
- Verificeer de token ratio (70% input, 30% output)
- Check of de kosten in de juiste eenheid zijn (per 1M tokens)

**Performance problemen**:
- Monitor de response tijden
- Check de model specificaties
- Overweeg een ander model voor specifieke functies

**Firestore errors**:
- Controleer de Firebase configuratie
- Verificeer de security rules
- Check de internet verbinding

### Debug Commands

```typescript
// Check huidige model voor gebruiker
const model = await getModelForUser(userId, 'audioTranscription');
console.log('Current model:', model);

// Check tier configuratie
const config = tierModelService.getModelConfigForTier(SubscriptionTier.DIAMOND);
console.log('Diamond config:', config);

// Check beschikbare modellen
console.log('Available models:', AVAILABLE_MODELS);
```

## Best Practices

1. **Gradual Rollout**: Introduceer nieuwe modellen eerst voor hogere tiers
2. **Cost Monitoring**: Monitor kosten nauwlettend na introductie
3. **A/B Testing**: Test nieuwe modellen tegen bestaande modellen
4. **Fallback Strategy**: Houd altijd een fallback model beschikbaar
5. **Documentation**: Documenteer alle wijzigingen uitgebreid
6. **User Communication**: Informeer gebruikers over nieuwe mogelijkheden

## Voorbeeld: Google's Nieuwe Model Toevoegen

Stel dat Google een nieuw model uitbrengt: `gemini-4.0-pro`

### Stap 1: Model Definitie
```typescript
'gemini-4.0-pro': {
  name: 'Gemini 4.0 Pro',
  description: 'Revolutionary AI with advanced reasoning capabilities',
  inputCost: 0.75,
  outputCost: 6.00,
  speed: 'Medium',
  quality: 'Revolutionary'
}
```

### Stap 2: Tier Assignment
```typescript
[SubscriptionTier.ENTERPRISE]: {
  audioTranscription: 'gemini-4.0-pro',
  expertChat: 'gemini-4.0-pro',
  analysisGeneration: 'gemini-4.0-pro',
  // Alleen voor enterprise vanwege hoge kosten
}
```

### Stap 3: Testing
- Test met enterprise gebruikers
- Monitor kosten en performance
- Verzamel feedback

### Stap 4: Gradual Rollout
- Week 1: Alleen enterprise
- Week 2: Ook diamond tier
- Week 3: Evaluatie en mogelijk gold tier

Door deze systematische aanpak kun je veilig nieuwe AI modellen introduceren zonder de stabiliteit of kosten van het systeem in gevaar te brengen.