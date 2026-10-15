// AI provider configuration.
//
// Keys are resolved at runtime, in priority order:
//   1. window.__AI_KEYS__  — injected at runtime (e.g. a host page/plugin)
//   2. import.meta.env.VITE_* — baked in at build time from environment vars
//
// No secrets are ever committed to this repository. Configure them with
// Vercel environment variables (or a local, gitignored .env.local).

type ProviderKeyName = "groq" | "google" | "openrouter";

function envKey(provider: ProviderKeyName): string {
  const env = import.meta.env as Record<string, string | undefined>;
  switch (provider) {
    case "groq":
      return env.VITE_GROQ_API_KEY || env.GROQ_API_KEY || "";
    case "google":
      return (
        env.VITE_GEMINI_API_KEY ||
        env.VITE_GOOGLE_AI_API_KEY ||
        env.VITE_GOOGLE_AI_STUDIO_API_KEY ||
        env.GOOGLE_API_KEY ||
        ""
      );
    case "openrouter":
      return env.VITE_OPENROUTER_API_KEY || env.OPENROUTER_API_KEY || "";
    default:
      return "";
  }
}

export function getKey(provider: ProviderKeyName): string {
  const win: any = typeof window !== "undefined" ? window : {};
  const runtime = win.__AI_KEYS__?.[provider];
  if (typeof runtime === "string" && runtime.trim()) return runtime;
  return envKey(provider);
}

/** True when a usable key is configured for the provider. */
export function hasKey(provider: ProviderKeyName): boolean {
  return getKey(provider).trim().length > 0;
}

export const AI_PROVIDERS = {
  groq: {
    name: "Groq LPU",
    baseUrl: "https://api.groq.com/openai/v1/chat/completions",
    defaultModel: "openai/gpt-oss-120b",
    models: ["openai/gpt-oss-120b", "openai/gpt-oss-20b", "qwen/qwen3.8-27b"],
  },
  google: {
    name: "Google Gemini",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/models",
    defaultModel: "gemini-3.8-flash",
    models: ["gemini-3.8-flash", "gemini-2.5-flash-lite", "gemini-2.5-pro"],
  },
  openrouter: {
    name: "OpenRouter",
    baseUrl: "https://openrouter.ai/api/v1/chat/completions",
    defaultModel: "openai/gpt-oss-120b",
    models: ["openai/gpt-oss-120b", "google/gemini-2.5-flash", "anthropic/claude-3.5-sonnet"],
  },
} as const;

export type ProviderType = keyof typeof AI_PROVIDERS;

const SYSTEM_PROMPT = `You are Aadrit's Portfolio AI Shell Assistant. You represent Aadrit Chandravanci (@AadritIND), a Full-Stack Developer, Cybersecurity & Ethical Hacking enthusiast, and AI/ML explorer.
Aadrit's primary repositories:
- conduit: E2E-encrypted real-time collaboration rooms (WebSockets, WebRTC, Vite, Fastify, PostgreSQL)
- filemorph: Free online file converter & audio transcriber with content preservation
- printbridge: Self-hosted local network printing utility with client/workspace modules
- prompt-forge: AI engineering workbench with pluggable model backends
- FormulaVault: Offline formula reference library with 830+ physics, math, and chemistry equations
- Portfolio: Engineered developer portfolio with live telemetry, cyber HUD, and system catalogs

Style rules: Be technical, concise, sharp, and helpful. Format responses in clean Markdown. Avoid fluff or generic boilerplate.`;

/**
 * Execute a query against the selected AI provider with automatic fallback.
 */
export async function queryAI(
  prompt: string,
  preferredProvider: ProviderType = "google",
  model?: string
): Promise<string> {
  // Provider execution order: try preferred, then fallback to others
  const providersToTry: ProviderType[] = [
    preferredProvider,
    preferredProvider === "google" ? "groq" : "google",
  ];

  let lastError: Error | null = null;

  for (const provider of providersToTry) {
    try {
      const apiKey = getKey(provider);
      if (!apiKey) continue;

      if (provider === "google") {
        const modelName = model || AI_PROVIDERS.google.defaultModel;
        const url = `${AI_PROVIDERS.google.baseUrl}/${modelName}:generateContent?key=${apiKey}`;

        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: SYSTEM_PROMPT }],
            },
            contents: [
              {
                parts: [{ text: prompt }],
              },
            ],
            generationConfig: {
              maxOutputTokens: 1200,
              temperature: 0.7,
            },
          }),
        });

        if (!res.ok) {
          const errBody = await res.text();
          throw new Error(`Google API ${res.status}: ${errBody}`);
        }

        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) throw new Error("Empty response from Google Gemini");
        return text;
      } else {
        // Groq / OpenRouter OpenAI-compatible format
        const config = AI_PROVIDERS[provider];
        const modelName = model || config.defaultModel;

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        };
        if (provider === "openrouter") {
          headers["HTTP-Referer"] = typeof window !== "undefined" ? window.location.origin : "http://localhost";
          headers["X-Title"] = "Aadrit Portfolio";
        }

        const res = await fetch(config.baseUrl, {
          method: "POST",
          headers,
          body: JSON.stringify({
            model: modelName,
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              { role: "user", content: prompt },
            ],
            max_tokens: 1200,
            temperature: 0.7,
          }),
        });

        if (!res.ok) {
          const errBody = await res.text();
          throw new Error(`${config.name} ${res.status}: ${errBody}`);
        }

        const data = await res.json();
        const text = data.choices?.[0]?.message?.content;
        if (!text) throw new Error(`Empty response from ${config.name}`);
        return text;
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`AI Provider ${provider} failed, attempting next provider:`, err.message);
    }
  }

  throw lastError || new Error("Failed to query AI providers. Please check connectivity.");
}
