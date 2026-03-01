/**
 * AI Service Module
 * Handles AI interactions and insights
 */

class AIService {
  constructor(options = {}) {
    this.options = {
      apiEndpoint: options.apiEndpoint || '/api/ai',
      model: options.model || 'default',
      temperature: options.temperature || 0.7,
      maxTokens: options.maxTokens || 1000,
      streaming: options.streaming || false,
      onStream: options.onStream || null,
    };
    this.context = [];
    this.isProcessing = false;
  }

  /**
   * Send a message to the AI
   */
  async sendMessage(message, context = {}) {
    if (this.isProcessing) {
      throw new Error('AI is currently processing a request');
    }

    this.isProcessing = true;
    
    // Add user message to context
    this.context.push({ role: 'user', content: message });

    try {
      const response = await fetch(`${this.options.apiEndpoint}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          context,
          history: this.context.slice(-10), // Last 10 messages
          model: this.options.model,
          temperature: this.options.temperature,
          maxTokens: this.options.maxTokens,
          stream: this.options.streaming,
        }),
      });

      if (!response.ok) {
        throw new Error(`AI request failed: ${response.status}`);
      }

      const data = await response.json();

      // Add AI response to context
      this.context.push({ role: 'assistant', content: data.response });

      return {
        response: data.response,
        insights: data.insights || null,
        suggestions: data.suggestions || [],
        sources: data.sources || [],
      };
    } catch (error) {
      console.error('AI Service Error:', error);
      throw error;
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Get health insights based on user data
   */
  async getHealthInsight(userData) {
    try {
      const response = await fetch(`${this.options.apiEndpoint}/insight`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userData,
          type: 'health_analysis',
        }),
      });

      if (!response.ok) {
        throw new Error(`Insight request failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Health Insight Error:', error);
      throw error;
    }
  }

  /**
   * Analyze symptoms and provide potential indicators
   */
  async analyzeSymptoms(symptoms) {
    try {
      const response = await fetch(`${this.options.apiEndpoint}/analyze-symptoms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms }),
      });

      if (!response.ok) {
        throw new Error(`Symptom analysis failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Symptom Analysis Error:', error);
      throw error;
    }
  }

  /**
   * Get lifestyle recommendations
   */
  async getLifestyleRecommendations(profile) {
    try {
      const response = await fetch(`${this.options.apiEndpoint}/lifestyle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile }),
      });

      if (!response.ok) {
        throw new Error(`Lifestyle recommendations failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Lifestyle Recommendations Error:', error);
      throw error;
    }
  }

  /**
   * Generate personalized diet plan
   */
  async generateDietPlan(userProfile, goals) {
    try {
      const response = await fetch(`${this.options.apiEndpoint}/diet-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userProfile, goals }),
      });

      if (!response.ok) {
        throw new Error(`Diet plan generation failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Diet Plan Error:', error);
      throw error;
    }
  }

  /**
   * Explain medical terms in simple language
   */
  async explainTerm(term, context = {}) {
    try {
      const response = await fetch(`${this.options.apiEndpoint}/explain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ term, context }),
      });

      if (!response.ok) {
        throw new Error(`Explanation failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Explain Term Error:', error);
      throw error;
    }
  }

  /**
   * Clear conversation context
   */
  clearContext() {
    this.context = [];
  }

  /**
   * Get conversation history
   */
  getHistory() {
    return [...this.context];
  }

  /**
   * Set custom context
   */
  setContext(messages) {
    this.context = messages;
  }
}

// Singleton instance
let aiServiceInstance = null;

export function getAIService(options = {}) {
  if (!aiServiceInstance) {
    aiServiceInstance = new AIService(options);
  }
  return aiServiceInstance;
}

export { AIService };
// Personalization: summarize user data for AI context
let userSummary = '';
try {
  const analysisRaw = localStorage.getItem('pcos_last_analysis');
  if (analysisRaw) {
    const analysis = JSON.parse(analysisRaw);
    const lastEntry = analysis.entries && analysis.entries.length > 0 ? analysis.entries[0] : null;
    userSummary = 'User Data Summary:\n';
    if (lastEntry) {
      userSummary += `- Last cycle length: ${lastEntry.cycle_length} days\n`;
      userSummary += `- Last symptoms: ${(lastEntry.symptoms || []).join(', ') || 'none'}\n`;
      userSummary += `- Last entry date: ${lastEntry.date}\n`;
    }
    if (analysis.analysis && typeof analysis.analysis.risk_score === 'number') {
      userSummary += `- Risk score: ${analysis.analysis.risk_score}/100\n`;
    }
  }
} catch (e) { /* ignore */ }

// Add user message to context, with personalization
this.context.push({ role: 'user', content: userSummary + '\n' + message });
