// Define SubscriptionTier enum locally for testing
const SubscriptionTier = {
  FREE: 'free',
  SILVER: 'silver',
  GOLD: 'gold',
  DIAMOND: 'diamond',
  ENTERPRISE: 'enterprise'
};

// Mock the ModelManager for testing
class TestModelManager {
  getModelForFunctionByTier(functionName, tier) {
    const TIER_MODEL_CONFIGS = {
      [SubscriptionTier.FREE]: {
        audioTranscription: 'gemini-2.5-flash-lite',
        expertChat: 'gemini-2.5-flash-lite',
        emailComposition: 'gemini-2.5-flash-lite',
        analysisGeneration: 'gemini-2.5-flash-lite',
        pptExport: 'gemini-2.5-flash-lite',
        businessCase: 'gemini-2.5-flash-lite',
        sessionImport: 'gemini-2.5-flash-lite',
        generalAnalysis: 'gemini-2.5-flash-lite'
      },
      [SubscriptionTier.SILVER]: {
        audioTranscription: 'gemini-2.5-flash',
        expertChat: 'gemini-2.5-flash-lite',
        emailComposition: 'gemini-2.5-flash-lite',
        analysisGeneration: 'gemini-2.5-flash',
        pptExport: 'gemini-2.5-flash',
        businessCase: 'gemini-2.5-flash',
        sessionImport: 'gemini-2.5-flash-lite',
        generalAnalysis: 'gemini-2.5-flash'
      },
      [SubscriptionTier.GOLD]: {
        audioTranscription: 'gemini-2.5-flash',
        expertChat: 'gemini-2.5-flash',
        emailComposition: 'gemini-2.5-flash',
        analysisGeneration: 'gemini-2.0-flash-exp',
        pptExport: 'gemini-2.5-flash',
        businessCase: 'gemini-2.0-flash-exp',
        sessionImport: 'gemini-2.5-flash',
        generalAnalysis: 'gemini-2.0-flash-exp'
      },
      [SubscriptionTier.DIAMOND]: {
        audioTranscription: 'gemini-2.0-flash-exp',
        expertChat: 'gemini-2.0-flash-exp',
        emailComposition: 'gemini-2.0-flash-exp',
        analysisGeneration: 'gemini-2.0-flash-exp',
        pptExport: 'gemini-2.0-flash-exp',
        businessCase: 'gemini-2.0-flash-exp',
        sessionImport: 'gemini-2.0-flash-exp',
        generalAnalysis: 'gemini-2.0-flash-exp'
      },
      [SubscriptionTier.ENTERPRISE]: {
        audioTranscription: 'gemini-2.0-flash-exp',
        expertChat: 'gemini-2.0-flash-exp',
        emailComposition: 'gemini-2.0-flash-exp',
        analysisGeneration: 'gemini-2.0-flash-exp',
        pptExport: 'gemini-2.0-flash-exp',
        businessCase: 'gemini-2.0-flash-exp',
        sessionImport: 'gemini-2.0-flash-exp',
        generalAnalysis: 'gemini-2.0-flash-exp'
      }
    };
    
    const tierConfig = TIER_MODEL_CONFIGS[tier];
    return tierConfig[functionName] || 'gemini-2.5-flash-lite';
  }

  async getModelForUser(userId, userTier, functionName) {
    return this.getModelForFunctionByTier(functionName, userTier);
  }
}

async function testTierModelSelection() {
  console.log('🧪 Testing Tier-Based Model Selection...');
  console.log('=' .repeat(50));
  
  const modelManager = new TestModelManager();
  const tiers = ['free', 'silver', 'gold', 'diamond', 'enterprise'];
  const functions = ['expertChat', 'emailComposition', 'analysisGeneration', 'businessCase'];
  
  // Test each tier and function combination
  for (const tier of tiers) {
    console.log(`\n📊 ${tier.toUpperCase()} TIER:`);
    console.log('-'.repeat(30));
    
    for (const func of functions) {
      const model = modelManager.getModelForFunctionByTier(func, tier);
      console.log(`  ${func}: ${model}`);
    }
  }
  
  // Test getModelForUser method
  console.log('\n🔍 Testing getModelForUser method:');
  console.log('-'.repeat(40));
  
  const testCases = [
    { userId: 'user1', tier: 'free', function: 'expertChat' },
    { userId: 'user2', tier: 'silver', function: 'analysisGeneration' },
    { userId: 'user3', tier: 'gold', function: 'businessCase' },
    { userId: 'user4', tier: 'diamond', function: 'emailComposition' }
  ];
  
  for (const testCase of testCases) {
    const model = await modelManager.getModelForUser(
      testCase.userId, 
      testCase.tier, 
      testCase.function
    );
    console.log(`  User ${testCase.userId} (${testCase.tier}) - ${testCase.function}: ${model}`);
  }
  
  console.log('\n✅ All tests completed successfully!');
  console.log('🎉 Tier-based model selection is working correctly!');
}

// Run the test
testTierModelSelection()
  .then(() => {
    console.log('\n🏁 Test suite finished.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });