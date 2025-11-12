const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: String,
    default: 'default-user', // For now, using default user. Can be extended for multi-user
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'profile_created',
      'analysis_complete',
      'score_improvement',
      'score_drop',
      'competitor_update',
      'broken_link',
      'questions_generated',
      'report_ready',
      'system',
      'warning',
      'error'
    ]
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  profileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
    default: null
  },
  profileName: {
    type: String,
    default: null
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  actionUrl: {
    type: String,
    default: null
  },
  expiresAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for efficient queries
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index for auto-deletion

// Static method to create notification
notificationSchema.statics.createNotification = async function(data) {
  try {
    const notification = await this.create({
      userId: data.userId || 'default-user',
      type: data.type,
      title: data.title,
      message: data.message,
      profileId: data.profileId || null,
      profileName: data.profileName || null,
      metadata: data.metadata || {},
      priority: data.priority || 'medium',
      actionUrl: data.actionUrl || null,
      expiresAt: data.expiresAt || null
    });
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Instance method to mark as read
notificationSchema.methods.markAsRead = async function() {
  this.isRead = true;
  return await this.save();
};

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;

