import React, { useState, useEffect } from 'react';
import { SubscriptionTier } from '../../../types';
import { tierModelService } from '../../utils/tierModelService';
import { AVAILABLE_MODELS } from '../../utils/modelManager';

interface TierModelConfigViewerProps {
  className?: string;
}

const TierModelConfigViewer: React.FC<TierModelConfigViewerProps> = ({ className = '' }) => {
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>(SubscriptionTier.FREE);
  const [costComparison, setCostComparison] = useState<Record<string, any>>({});
  const [estimatedTokens, setEstimatedTokens] = useState(100000);

  const tierConfigs = tierModelService.getAllTierConfigs();
  const currentConfig = tierConfigs[selectedTier];

  useEffect(() => {
    const costs = tierModelService.calculateTierCosts(estimatedTokens);
    setCostComparison(costs);
  }, [estimatedTokens]);

  const getTierDisplayName = (tier: SubscriptionTier): string => {
    return tier.charAt(0).toUpperCase() + tier.slice(1);
  };

  const getModelDisplayInfo = (modelName: string) => {
    const model = AVAILABLE_MODELS[modelName as keyof typeof AVAILABLE_MODELS];
    return model || { name: modelName, description: 'Unknown model', inputCost: 0, outputCost: 0 };
  };

  const getTierColor = (tier: SubscriptionTier): string => {
    switch (tier) {
      case SubscriptionTier.FREE: return 'bg-gray-100 border-gray-300';
      case SubscriptionTier.SILVER: return 'bg-gray-200 border-gray-400';
      case SubscriptionTier.GOLD: return 'bg-yellow-100 border-yellow-400';
      case SubscriptionTier.DIAMOND: return 'bg-blue-100 border-blue-400';
      case SubscriptionTier.ENTERPRISE: return 'bg-purple-100 border-purple-400';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  return (
    <div className={`p-6 bg-white rounded-lg shadow-lg ${className}`}>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Tier Model Configuration Viewer</h2>
      
      {/* Tier Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Subscription Tier:
        </label>
        <div className="flex flex-wrap gap-2">
          {Object.values(SubscriptionTier).map((tier) => (
            <button
              key={tier}
              onClick={() => setSelectedTier(tier)}
              className={`px-4 py-2 rounded-lg border-2 transition-all ${
                selectedTier === tier
                  ? `${getTierColor(tier)} ring-2 ring-blue-500`
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              }`}
            >
              {getTierDisplayName(tier)}
            </button>
          ))}
        </div>
      </div>

      {/* Current Configuration */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          {getTierDisplayName(selectedTier)} Tier Configuration
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(currentConfig).map(([functionName, modelName]) => {
            const modelInfo = getModelDisplayInfo(modelName as string);
            return (
              <div key={functionName} className="p-4 border rounded-lg bg-gray-50">
                <h4 className="font-medium text-gray-800 mb-2">
                  {functionName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </h4>
                <p className="text-sm text-blue-600 font-medium mb-1">{modelInfo.name}</p>
                <p className="text-xs text-gray-600 mb-2">{modelInfo.description}</p>
                <div className="text-xs text-gray-500">
                  <div>Input: ${modelInfo.inputCost}/1M tokens</div>
                  <div>Output: ${modelInfo.outputCost}/1M tokens</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cost Comparison */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Cost Comparison</h3>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estimated Monthly Tokens:
          </label>
          <input
            type="number"
            value={estimatedTokens}
            onChange={(e) => setEstimatedTokens(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="1000"
            step="1000"
          />
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Tier</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Audio Transcription</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Analysis Generation</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Business Case</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Total Est. Cost</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(costComparison).map(([tier, costs]) => {
                const totalCost = Object.values(costs as Record<string, number>).reduce((sum, cost) => sum + cost, 0);
                return (
                  <tr key={tier} className={selectedTier === tier ? 'bg-blue-50' : 'bg-white'}>
                    <td className="px-4 py-2 text-sm font-medium">{getTierDisplayName(tier as SubscriptionTier)}</td>
                    <td className="px-4 py-2 text-sm">${((costs as any).audioTranscription || 0).toFixed(2)}</td>
                    <td className="px-4 py-2 text-sm">${((costs as any).analysisGeneration || 0).toFixed(2)}</td>
                    <td className="px-4 py-2 text-sm">${((costs as any).businessCase || 0).toFixed(2)}</td>
                    <td className="px-4 py-2 text-sm font-semibold">${totalCost.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-blue-800">How to Use in Your Code</h3>
        <div className="text-sm text-blue-700 space-y-2">
          <p><strong>Get model for a user:</strong></p>
          <code className="block bg-white p-2 rounded text-xs font-mono">
            {`import { getModelForUser } from './utils/tierModelService';
const model = await getModelForUser(userId, 'audioTranscription');`}
          </code>
          
          <p><strong>Get model by tier directly:</strong></p>
          <code className="block bg-white p-2 rounded text-xs font-mono">
            {`import { getModelByTier } from './utils/tierModelService';
const model = getModelByTier(SubscriptionTier.GOLD, 'analysisGeneration');`}
          </code>
        </div>
      </div>
    </div>
  );
};

export default TierModelConfigViewer;