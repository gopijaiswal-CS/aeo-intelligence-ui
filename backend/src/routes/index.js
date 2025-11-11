const express = require('express');
const router = express.Router();

const profileRoutes = require('./profileRoutes');
const productRoutes = require('./productRoutes');
const optimizationRoutes = require('./optimizationRoutes');
const seoRoutes = require('./seoRoutes');

// Mount routes
router.use('/profiles', profileRoutes);
router.use('/products', productRoutes);
router.use('/optimize', optimizationRoutes);
router.use('/seo', seoRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'AEO Intelligence API is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;

