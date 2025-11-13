const express = require('express');
const router = express.Router();
const llmController = require('../controllers/llmController');

/**
 * LLM Management Routes
 */

// Get all available LLM providers
router.get('/providers', llmController.getLLMProviders);

// Get models for a specific provider
router.get('/providers/:provider/models', llmController.getProviderModels);

// Test LLM connection
router.post('/test', llmController.testLLMConnection);

// Get current LLM configuration
router.get('/config', llmController.getLLMConfig);

module.exports = router;

