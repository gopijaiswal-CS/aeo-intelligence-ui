const express = require('express');
const router = express.Router();
const optimizationController = require('../controllers/optimizationController');

router.post('/content', optimizationController.getOptimizationRecommendations);

module.exports = router;

