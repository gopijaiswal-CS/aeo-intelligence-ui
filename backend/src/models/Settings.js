const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  // Account Information
  companyName: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    default: ''
  },
  website: {
    type: String,
    default: ''
  },

  // Default Preferences
  defaultProduct: {
    type: String,
    default: ''
  },
  defaultRegion: {
    type: String,
    default: ''
  },

  // LLM Configuration
  llmProvider: {
    type: String,
    enum: ['openai', 'anthropic', 'google', 'perplexity', ''],
    default: ''
  },
  llmApiKey: {
    type: String,
    default: ''
  },

  // Contentstack Integration
  contentstackUrl: {
    type: String,
    default: ''
  },
  contentstackApiKey: {
    type: String,
    default: ''
  },
  contentstackToken: {
    type: String,
    default: ''
  },

  // Analysis Settings
  testFrequency: {
    type: Number,
    default: 4,
    min: 1,
    max: 24
  },
  maxQuestions: {
    type: Number,
    default: 20,
    min: 5,
    max: 100
  },

  // Notification Preferences
  notifications: {
    weeklyReports: {
      type: Boolean,
      default: true
    },
    brokenLinkAlerts: {
      type: Boolean,
      default: true
    },
    competitorUpdates: {
      type: Boolean,
      default: false
    },
    scoreImprovementAlerts: {
      type: Boolean,
      default: true
    }
  },

  // Alert Thresholds
  alertThresholds: {
    scoreDrop: {
      type: Number,
      default: 10,
      min: 1,
      max: 50
    },
    mentionDrop: {
      type: Number,
      default: 15,
      min: 1,
      max: 50
    }
  },

  // User identifier (for multi-user support in future)
  userId: {
    type: String,
    default: 'default'
  }
}, {
  timestamps: true
});

// Ensure only one settings document per user
SettingsSchema.index({ userId: 1 }, { unique: true });

module.exports = mongoose.model('Settings', SettingsSchema);

