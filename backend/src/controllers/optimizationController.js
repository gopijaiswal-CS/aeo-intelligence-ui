const Profile = require('../models/Profile');
const { getOptimizationRecommendations } = require('../services/geminiService');

/**
 * Get content optimization recommendations
 * POST /api/v1/optimize/content
 */
exports.getOptimizationRecommendations = async (req, res) => {
  try {
    const { profileId } = req.body;

    if (!profileId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'profileId is required'
        }
      });
    }

    const profile = await Profile.findById(profileId);

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Profile not found'
        }
      });
    }

    // Get recommendations using Gemini AI
    const recommendations = await getOptimizationRecommendations(profile);

    res.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    console.error('Error getting optimization recommendations:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'OPTIMIZATION_ERROR',
        message: error.message
      }
    });
  }
};

module.exports = exports;

