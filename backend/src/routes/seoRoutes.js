const express = require('express');
const router = express.Router();
const seoController = require('../controllers/seoController');

router.post('/health-check', seoController.runSEOHealthCheck);

module.exports = router;

