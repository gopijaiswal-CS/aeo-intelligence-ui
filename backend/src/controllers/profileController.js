const Profile = require("../models/Profile");
const {
  generateQuestionsAndCompetitors,
} = require("../services/geminiService");
const { runAEOAnalysis } = require("../services/analysisService");
const NotificationService = require("../services/notificationService");

/**
 * Create a new profile
 * POST /api/v1/profiles
 */
exports.createProfile = async (req, res) => {
  try {
    const { websiteUrl, productName, category, region } = req.body;

    // Validation
    if (!websiteUrl || !productName || !category || !region) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message:
            "Missing required fields: websiteUrl, productName, category, region",
        },
      });
    }

    // Create profile
    const profile = await Profile.create({
      name: `${productName} Analysis`,
      websiteUrl,
      productName,
      category,
      region,
      status: "draft",
    });

    // Create notification
    await NotificationService.notifyProfileCreated(profile);

    res.status(201).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error("Error creating profile:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: error.message,
      },
    });
  }
};

/**
 * Get all profiles
 * GET /api/v1/profiles
 */
exports.getProfiles = async (req, res) => {
  try {
    const profiles = await Profile.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        profiles,
        total: profiles.length,
      },
    });
  } catch (error) {
    console.error("Error fetching profiles:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: error.message,
      },
    });
  }
};

/**
 * Get profile by ID
 * GET /api/v1/profiles/:id
 */
exports.getProfileById = async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id);

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Profile not found",
        },
      });
    }

    res.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: error.message,
      },
    });
  }
};

/**
 * Update profile
 * PUT /api/v1/profiles/:id
 */
exports.updateProfile = async (req, res) => {
  try {
    const profile = await Profile.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Profile not found",
        },
      });
    }

    res.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: error.message,
      },
    });
  }
};

/**
 * Delete profile
 * DELETE /api/v1/profiles/:id
 */
exports.deleteProfile = async (req, res) => {
  try {
    const profile = await Profile.findByIdAndDelete(req.params.id);

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Profile not found",
        },
      });
    }

    res.json({
      success: true,
      data: { message: "Profile deleted successfully" },
    });
  } catch (error) {
    console.error("Error deleting profile:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: error.message,
      },
    });
  }
};

/**
 * Generate questions and competitors for a profile
 * POST /api/v1/profiles/:id/generate
 */
exports.generateQuestionsAndCompetitors = async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id);

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Profile not found",
        },
      });
    }

    // Update status
    profile.status = "generating";
    await profile.save();

    // Generate using Gemini AI
    const { questions, competitors } = await generateQuestionsAndCompetitors(
      profile.productName,
      profile.category,
      profile.region,
      profile.websiteUrl
    );

    // Update profile with generated data
    profile.questions = questions;
    profile.competitors = competitors;
    profile.status = "ready";
    await profile.save();

    // Create notification
    await NotificationService.notifyQuestionsGenerated(
      profile,
      questions.length,
      competitors.length
    );

    res.json({
      success: true,
      data: {
        questions,
        competitors,
      },
    });
  } catch (error) {
    console.error("Error generating questions and competitors:", error);

    // Reset status on error
    try {
      await Profile.findByIdAndUpdate(req.params.id, { status: "draft" });
    } catch (updateError) {
      console.error("Error resetting status:", updateError);
    }

    res.status(500).json({
      success: false,
      error: {
        code: "GENERATION_ERROR",
        message: error.message,
      },
    });
  }
};

/**
 * Run AEO analysis for a profile
 * POST /api/v1/profiles/:id/analyze
 */
exports.runAnalysis = async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id);

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Profile not found",
        },
      });
    }

    if (profile.questions.length === 0 || profile.competitors.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_STATE",
          message:
            "Profile must have questions and competitors before running analysis",
        },
      });
    }

    // Update status
    profile.status = "analyzing";
    await profile.save();

    // Run analysis
    const analysisResult = await runAEOAnalysis(profile);

    // Update profile with results
    profile.analysisResult = analysisResult;

    // Store LLM responses with questions
    if (analysisResult.questionsWithResponses) {
      profile.questions = analysisResult.questionsWithResponses;
    }

    // Update competitor data (exclude user's product)
    if (analysisResult.competitorAnalysis) {
      // Filter out user's product from competitor list
      profile.competitors = analysisResult.competitorAnalysis.filter(
        (item) => !item.isUserProduct
      );
    }

    profile.status = "completed";
    await profile.save();

    // Create notification
    await NotificationService.notifyAnalysisComplete(
      profile,
      analysisResult.overallScore
    );

    res.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error("Error running analysis:", error);

    // Reset status on error
    try {
      await Profile.findByIdAndUpdate(req.params.id, { status: "ready" });
    } catch (updateError) {
      console.error("Error resetting status:", updateError);
    }

    res.status(500).json({
      success: false,
      error: {
        code: "ANALYSIS_ERROR",
        message: error.message,
      },
    });
  }
};

module.exports = exports;
