const Settings = require('../models/Settings');

/**
 * Get user settings
 * GET /api/v1/settings
 */
exports.getSettings = async (req, res) => {
  try {
    // For now, use 'default' as userId (can be enhanced with auth later)
    const userId = 'default';
    
    let settings = await Settings.findOne({ userId });
    
    // If no settings exist, create default ones
    if (!settings) {
      settings = await Settings.create({ userId });
    }

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: error.message
      }
    });
  }
};

/**
 * Update user settings
 * PUT /api/v1/settings
 */
exports.updateSettings = async (req, res) => {
  try {
    const userId = 'default';
    const updateData = req.body;

    // Find existing settings or create new ones
    let settings = await Settings.findOne({ userId });
    
    if (settings) {
      // Update existing settings
      Object.keys(updateData).forEach(key => {
        if (key !== 'userId' && key !== '_id') {
          settings[key] = updateData[key];
        }
      });
      await settings.save();
    } else {
      // Create new settings
      settings = await Settings.create({
        userId,
        ...updateData
      });
    }

    res.json({
      success: true,
      data: settings,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: error.message
      }
    });
  }
};

/**
 * Reset settings to default
 * POST /api/v1/settings/reset
 */
exports.resetSettings = async (req, res) => {
  try {
    const userId = 'default';
    
    // Delete existing settings
    await Settings.findOneAndDelete({ userId });
    
    // Create new default settings
    const settings = await Settings.create({ userId });

    res.json({
      success: true,
      data: settings,
      message: 'Settings reset to default'
    });
  } catch (error) {
    console.error('Error resetting settings:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: error.message
      }
    });
  }
};

module.exports = exports;

