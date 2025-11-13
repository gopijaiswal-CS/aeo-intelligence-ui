const { GoogleGenerativeAI } = require("@google/generative-ai");
const OpenAI = require("openai");

/**
 * Unified LLM Configuration
 * Supports multiple AI models: OpenAI (default), Gemini
 */

// Initialize AI clients
const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// Default model configuration
const DEFAULT_PROVIDER = "openai"; // Set OpenAI as default
const MODEL_CONFIGS = {
  openai: {
    default: "gpt-4o-mini",
    models: {
      "gpt-4o": "gpt-4o",
      "gpt-4o-mini": "gpt-4o-mini",
      "gpt-4-turbo": "gpt-4-turbo",
      "gpt-3.5-turbo": "gpt-3.5-turbo",
    },
  },
  gemini: {
    default: "gemini-2.0-flash",
    models: {
      "gemini-2.5-flash": "gemini-2.5-flash",
      "gemini-2.0-flash": "gemini-2.0-flash",
      "gemini-pro": "gemini-pro",
    },
  },
};

/**
 * Get the appropriate model client
 * @param {string} provider - 'openai' or 'gemini'
 * @param {string} modelName - specific model name (optional)
 * @returns {Object} Model client
 */
function getModel(provider = DEFAULT_PROVIDER, modelName = null) {
  const normalizedProvider = provider.toLowerCase();

  // Validate provider
  if (!MODEL_CONFIGS[normalizedProvider]) {
    throw new Error(
      `Unsupported AI provider: ${provider}. Supported: ${Object.keys(
        MODEL_CONFIGS
      ).join(", ")}`
    );
  }

  // Get model name (use provided or default)
  const model = modelName || MODEL_CONFIGS[normalizedProvider].default;

  switch (normalizedProvider) {
    case "openai":
      if (!openai) {
        throw new Error(
          "OpenAI API key not configured. Set OPENAI_API_KEY in environment."
        );
      }
      return {
        provider: "openai",
        model: model,
        client: openai,
      };

    case "gemini":
      if (!genAI) {
        throw new Error(
          "Gemini API key not configured. Set GEMINI_API_KEY in environment."
        );
      }
      return {
        provider: "gemini",
        model: model,
        client: genAI.getGenerativeModel({ model }),
      };

    default:
      throw new Error(`Provider ${provider} not implemented`);
  }
}

/**
 * Generate content using unified interface
 * @param {string} prompt - The prompt to send
 * @param {Object} options - Configuration options
 * @returns {Promise<string>} Generated text
 */
async function generateContent(prompt, options = {}) {
  const {
    provider = DEFAULT_PROVIDER,
    model = null,
    temperature = 0.7,
    maxTokens = 2000,
  } = options;

  const modelClient = getModel(provider, model);
  try {
    switch (modelClient.provider) {
      case "openai": {
        const completion = await modelClient.client.chat.completions.create({
          model: modelClient.model,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature,
          max_tokens: maxTokens,
        });
        return completion.choices[0].message.content;
      }

      case "gemini": {
        const result = await modelClient.client.generateContent(prompt);
        const response = result.response;
        return response.text();
      }

      default:
        throw new Error(`Provider ${modelClient.provider} not supported`);
    }
  } catch (error) {
    console.error(
      `Error generating content with ${modelClient.provider}:`,
      error.message
    );
    throw new Error(`Failed to generate content: ${error.message}`);
  }
}

/**
 * Generate content with JSON response
 * @param {string} prompt - The prompt to send
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>} Parsed JSON response
 */
async function generateJSONContent(prompt, options = {}) {
  const text = await generateContent(prompt, options);

  try {
    // Try to find JSON in the response (handle markdown code blocks, XML tags, or raw JSON)
    const jsonMatch =
      text.match(/```json\s*(\{[\s\S]*?\}|\[[\s\S]*?\])\s*```/) || // Markdown: ```json {...} ```
      text.match(/```\s*(\{[\s\S]*?\}|\[[\s\S]*?\])\s*```/) || // Markdown: ``` {...} ```
      text.match(/<json>\s*(\{[\s\S]*?\}|\[[\s\S]*?\])\s*<\/json>/) || // XML: <json>{...}</json>
      text.match(/(\{[\s\S]*?\})/) || // Raw JSON object
      text.match(/(\[[\s\S]*?\])/); // Raw JSON array

    if (jsonMatch) {
      let jsonText = jsonMatch[1] || jsonMatch[0];
      // Clean up any remaining markdown or whitespace
      jsonText = jsonText.replace(/```json|```/g, "").trim();
      return JSON.parse(jsonText);
    } else {
      throw new Error("No JSON found in response");
    }
  } catch (parseError) {
    console.error("JSON parsing error:", parseError);
    console.error("Response text:", text);
    throw new Error(`Failed to parse JSON response: ${parseError.message}`);
  }
}

/**
 * Get available models for a provider
 * @param {string} provider - Provider name
 * @returns {Array<string>} List of available models
 */
function getAvailableModels(provider = DEFAULT_PROVIDER) {
  const config = MODEL_CONFIGS[provider.toLowerCase()];
  if (!config) {
    return [];
  }
  return Object.keys(config.models);
}

/**
 * Get current default provider
 * @returns {string} Default provider name
 */
function getDefaultProvider() {
  return DEFAULT_PROVIDER;
}

module.exports = {
  getModel,
  generateContent,
  generateJSONContent,
  getAvailableModels,
  getDefaultProvider,
  DEFAULT_PROVIDER,
  MODEL_CONFIGS,
};
