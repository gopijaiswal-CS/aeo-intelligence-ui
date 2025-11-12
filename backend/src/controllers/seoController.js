const { runSEOHealthCheck } = require('../services/seoHealthService');

/**
 * Run SEO health check
 * POST /api/v1/seo/health-check
 */
exports.runSEOHealthCheck = async (req, res) => {
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

    // Run SEO health check
    const result = await runSEOHealthCheck(websiteUrl);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error running SEO health check:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SEO_CHECK_ERROR',
        message: error.message
      }
    });
  }
};

module.exports = exports;

