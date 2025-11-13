const { getAvailableModels, getDefaultProvider, MODEL_CONFIGS } = require('../config/llm');

/**
 * Get available LLM providers and models
 */
exports.getLLMProviders = async (req, res) => {
  try {
    const providers = Object.keys(MODEL_CONFIGS).map(providerName => ({
      name: providerName,
      default: MODEL_CONFIGS[providerName].default,
      models: Object.keys(MODEL_CONFIGS[providerName].models),
      isDefault: providerName === getDefaultProvider()
    }));

    res.json({
      success: true,
      defaultProvider: getDefaultProvider(),
      providers
    });
  } catch (error) {
    console.error('Error getting LLM providers:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get available models for a specific provider
 */
exports.getProviderModels = async (req, res) => {
  try {
    const { provider } = req.params;
    const models = getAvailableModels(provider);

    if (models.length === 0) {
      return res.status(404).json({
        success: false,
        error: `Provider '${provider}' not found`
      });
    }

    res.json({
      success: true,
      provider,
      models,
      default: MODEL_CONFIGS[provider.toLowerCase()].default
    });
  } catch (error) {
    console.error('Error getting provider models:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Test LLM connection
 */
exports.testLLMConnection = async (req, res) => {
  try {
    const { provider, model } = req.body;
    const { generateContent } = require('../config/llm');

    const testPrompt = "Say 'Hello, I am working!' in a friendly way.";
    
    const response = await generateContent(testPrompt, {
      provider: provider || getDefaultProvider(),
      model: model || null,
      temperature: 0.7,
      maxTokens: 50
    });

    res.json({
      success: true,
      provider: provider || getDefaultProvider(),
      model: model || 'default',
      response,
      message: 'LLM connection successful!'
    });
  } catch (error) {
    console.error('Error testing LLM connection:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to connect to LLM. Please check your API keys.'
    });
  }
};

/**
 * Get current LLM configuration
 */
exports.getLLMConfig = async (req, res) => {
  try {
    const hasOpenAI = !!process.env.OPENAI_API_KEY;
    const hasGemini = !!process.env.GEMINI_API_KEY;

    res.json({
      success: true,
      config: {
        defaultProvider: getDefaultProvider(),
        availableProviders: {
          openai: {
            enabled: hasOpenAI,
            models: hasOpenAI ? getAvailableModels('openai') : []
          },
          gemini: {
            enabled: hasGemini,
            models: hasGemini ? getAvailableModels('gemini') : []
          }
        }
      }
    });
  } catch (error) {
    console.error('Error getting LLM config:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

