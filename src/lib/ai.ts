// AI Provider configurations using the provided API keys
export const AI_PROVIDERS = {
  groq: {
    name: 'Groq',
    baseUrl: 'https://api.groq.com/openai/v1/chat/completions',
    apiKey: import.meta.env.VITE_GROQ_API_KEY,
    defaultModel: 'llama-3.3-70b-versatile',
    models: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768', 'gemma2-9b-it']
  },
  openrouter: {
    name: 'OpenRouter',
    baseUrl: 'https://openrouter.ai/api/v1/chat/completions',
    apiKey: import.meta.env.VITE_OPENROUTER_API_KEY,
    defaultModel: 'anthropic/claude-3.5-sonnet',
    models: ['anthropic/claude-3.5-sonnet', 'google/gemini-2.5-flash', 'openai/gpt-4o-mini', 'meta-llama/llama-3.1-8b-instruct']
  },
  google: {
    name: 'Google AI Studio',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/models',
    apiKey: import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GOOGLE_AI_API_KEY || import.meta.env.VITE_GOOGLE_AI_STUDIO_API_KEY,
    defaultModel: 'gemini-1.5-flash',
    models: ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash-exp']
  }
} as const;

export type ProviderType = keyof typeof AI_PROVIDERS;

export async function queryAI(prompt: string, provider: ProviderType = 'groq', model?: string): Promise<string> {
  const config = AI_PROVIDERS[provider];
  if (!config.apiKey) {
    throw new Error(`API key not configured for ${config.name}. Please check environment variables.`);
  }

  try {
    if (provider === 'google') {
      const modelName = model || config.defaultModel;
      const url = `${config.baseUrl}/${modelName}:generateContent?key=${config.apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Google AI error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error('No response generated from Google AI');
      }
      return text;
    } else {
      const modelName = model || config.defaultModel;
      const headers: any = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      };
      if (provider === 'openrouter') {
        headers['HTTP-Referer'] = window.location.origin;
        headers['X-Title'] = 'Aadrit Portfolio';
      }
      const response = await fetch(config.baseUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: modelName,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1500,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`${config.name} error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content;
      if (!text) {
        throw new Error(`No response generated from ${config.name}`);
      }
      return text;
    }
  } catch (error) {
    console.error('AI query error:', error);
    throw error;
  }
}
