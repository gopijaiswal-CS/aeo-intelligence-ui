const express = require('express');
const router = express.Router();
const llmTextController = require('../controllers/llmTextController');

router.post('/generate', llmTextController.generateLLMText);

module.exports = router;

