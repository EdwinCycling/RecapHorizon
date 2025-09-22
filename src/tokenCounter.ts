// Token counter for Gemini API
// Includes both estimation methods and actual API-based counting
// For accurate counting, use countTokensWithAPI when possible

export const estimateTokens = (text: string): number => {
  if (!text) return 0;
  
  // Rough estimation: 1 token ≈ 4 characters for most languages
  // This is a conservative estimate for Gemini
  return Math.ceil(text.length / 4);
};

export const countPromptTokens = (prompt: string | Array<string | { text: string }> | { text: string }): number => {
  if (typeof prompt === 'string') {
    return estimateTokens(prompt);
  }
  
  if (Array.isArray(prompt)) {
    return prompt.reduce((total, part) => {
      if (typeof part === 'string') {
        return total + estimateTokens(part);
      }
      if (part.text) {
        return total + estimateTokens(part.text);
      }
      return total;
    }, 0);
  }
  
  if (prompt.text) {
    return estimateTokens(prompt.text);
  }
  
  return 0;
};

export const countResponseTokens = (response: string): number => {
  return estimateTokens(response);
};

export const getTotalTokens = (prompt: string | Array<string | { text: string }> | { text: string }, response: string): number => {
  const inputTokens = countPromptTokens(prompt);
  const outputTokens = countResponseTokens(response);
  // Inkomende tokens (AI responses) zijn duurder, dus vermenigvuldig met 5
  return inputTokens + (outputTokens * 5);
};

// Accurate token counting using Google's countTokens API
export const countTokensWithAPI = async (model: any, content: any): Promise<number> => {
  try {
    const result = await model.countTokens(content);
    return result.totalTokens || 0;
  } catch (error) {
    console.warn('Failed to count tokens with API, falling back to estimation:', error);
    // Fallback to estimation if API call fails
    if (typeof content === 'string') {
      return estimateTokens(content);
    }
    if (Array.isArray(content)) {
      return content.reduce((total, part) => {
        if (typeof part === 'string') {
          return total + estimateTokens(part);
        }
        if (part.text) {
          return total + estimateTokens(part.text);
        }
        return total;
      }, 0);
    }
    return 0;
  }
};

// Provide a default export with the functions grouped to match usage as `tokenCounter.*`
export const tokenCounter = {
  estimateTokens,
  countPromptTokens,
  countResponseTokens,
  getTotalTokens,
  countTokens: estimateTokens, // Alias for estimateTokens to maintain compatibility
  countTokensWithAPI, // Accurate API-based token counting
};

export default tokenCounter;

