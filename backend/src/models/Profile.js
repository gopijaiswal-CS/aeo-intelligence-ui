const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  region: {
    type: String,
    required: true
  },
  aiMentions: {
    type: Number,
    default: 0
  },
  visibility: {
    type: Number,
    default: 0
  },
  addedBy: {
    type: String,
    enum: ['auto', 'manual'],
    default: 'auto'
  }
}, { _id: true });

const CompetitorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  visibility: {
    type: Number,
    default: 0
  },
  mentions: {
    type: Number,
    default: 0
  },
  citations: {
    type: Number,
    default: 0
  },
  rank: {
    type: Number,
    required: true
  }
}, { _id: true });

const AnalysisResultSchema = new mongoose.Schema({
  overallScore: {
    type: Number,
    required: true
  },
  mentions: {
    type: Number,
    required: true
  },
  seoHealth: {
    type: Number,
    required: true
  },
  citations: {
    type: Number,
    required: true
  },
  brokenLinks: {
    type: Number,
    default: 0
  },
  trend: {
    type: [Number],
    default: []
  },
  citationSources: {
    type: [{
      url: String,
      llm: String,
      weight: Number,
      mentions: Number
    }],
    default: []
  },
  llmPerformance: {
    type: [{
      llmName: String,
      score: Number,
      mentions: Number,
      totalMentions: Number,
      citations: Number,
      competitorMentions: mongoose.Schema.Types.Mixed,
      topSources: [{
        url: String,
        weight: Number,
        mentions: Number,
        pageType: String
      }]
    }],
    default: []
  },
  competitorAnalysis: {
    type: [{
      id: String,
      name: String,
      category: String,
      visibility: Number,
      mentions: Number,
      citations: Number,
      rank: Number,
      isUserProduct: Boolean
    }],
    default: []
  }
}, { _id: false });

const ProfileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  websiteUrl: {
    type: String,
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  region: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'generating', 'ready', 'analyzing', 'completed'],
    default: 'draft'
  },
  questions: {
    type: [QuestionSchema],
    default: []
  },
  competitors: {
    type: [CompetitorSchema],
    default: []
  },
  analysisResult: {
    type: AnalysisResultSchema,
    default: null
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
ProfileSchema.index({ websiteUrl: 1 });
ProfileSchema.index({ productName: 1 });
ProfileSchema.index({ status: 1 });
ProfileSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Profile', ProfileSchema);

