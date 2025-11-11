const { generateProducts } = require('../services/geminiService');

/**
 * Generate products from website URL
 * POST /api/v1/products/generate
 */
exports.generateProducts = async (req, res) => {
  try {
    const { websiteUrl } = req.body;

    if (!websiteUrl) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'websiteUrl is required'
        }
      });
    }

    // Validate URL format
    try {
      new URL(websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`);
    } catch (urlError) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_URL',
          message: 'Invalid URL format'
        }
      });
    }

    // Generate products using Gemini AI
    const result = await generateProducts(websiteUrl);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error generating products:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GENERATION_ERROR',
        message: error.message
      }
    });
  }
};

module.exports = exports;

