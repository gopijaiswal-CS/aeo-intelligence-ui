const Notification = require('../models/Notification');

/**
 * Notification Service
 * Helper functions to create notifications from anywhere in the app
 */

class NotificationService {
  /**
   * Create a notification
   */
  static async create(data) {
    try {
      return await Notification.createNotification(data);
    } catch (error) {
      console.error('NotificationService: Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Notify when a profile is created
   */
  static async notifyProfileCreated(profile) {
    return await this.create({
      type: 'profile_created',
      title: 'Profile Created',
      message: `New profile "${profile.name}" has been created successfully`,
      profileId: profile._id,
      profileName: profile.name,
      priority: 'low',
      actionUrl: `/profile/${profile._id}`,
      metadata: {
        productName: profile.productName,
        category: profile.category,
        region: profile.region
      }
    });
  }

  /**
   * Notify when questions and competitors are generated
   */
  static async notifyQuestionsGenerated(profile, questionCount, competitorCount) {
    return await this.create({
      type: 'questions_generated',
      title: 'Questions & Competitors Generated',
      message: `Generated ${questionCount} questions and ${competitorCount} competitors for "${profile.name}"`,
      profileId: profile._id,
      profileName: profile.name,
      priority: 'medium',
      actionUrl: `/profile/${profile._id}`,
      metadata: {
        questionCount,
        competitorCount
      }
    });
  }

  /**
   * Notify when analysis is complete
   */
  static async notifyAnalysisComplete(profile, score) {
    return await this.create({
      type: 'analysis_complete',
      title: 'Analysis Complete',
      message: `Analysis completed for "${profile.name}" with visibility score of ${score}%`,
      profileId: profile._id,
      profileName: profile.name,
      priority: 'high',
      actionUrl: `/profile/${profile._id}`,
      metadata: {
        score,
        completedAt: new Date().toISOString()
      }
    });
  }

  /**
   * Notify when score improves
   */
  static async notifyScoreImprovement(profile, oldScore, newScore) {
    const improvement = newScore - oldScore;
    return await this.create({
      type: 'score_improvement',
      title: 'Score Improved! 🎉',
      message: `"${profile.name}" visibility improved by ${improvement.toFixed(1)}% (${oldScore}% → ${newScore}%)`,
      profileId: profile._id,
      profileName: profile.name,
      priority: 'high',
      actionUrl: `/profile/${profile._id}`,
      metadata: {
        oldScore,
        newScore,
        improvement
      }
    });
  }

  /**
   * Notify when score drops
   */
  static async notifyScoreDrop(profile, oldScore, newScore) {
    const drop = oldScore - newScore;
    return await this.create({
      type: 'score_drop',
      title: 'Score Dropped ⚠️',
      message: `"${profile.name}" visibility dropped by ${drop.toFixed(1)}% (${oldScore}% → ${newScore}%)`,
      profileId: profile._id,
      profileName: profile.name,
      priority: 'urgent',
      actionUrl: `/profile/${profile._id}`,
      metadata: {
        oldScore,
        newScore,
        drop
      }
    });
  }

  /**
   * Notify about competitor updates
   */
  static async notifyCompetitorUpdate(profile, competitorName, change) {
    return await this.create({
      type: 'competitor_update',
      title: 'Competitor Activity',
      message: `${competitorName} ${change} in "${profile.name}" analysis`,
      profileId: profile._id,
      profileName: profile.name,
      priority: 'medium',
      actionUrl: `/profile/${profile._id}`,
      metadata: {
        competitorName,
        change
      }
    });
  }

  /**
   * Notify about broken links
   */
  static async notifyBrokenLink(profile, url) {
    return await this.create({
      type: 'broken_link',
      title: 'Broken Link Detected',
      message: `Broken link found in "${profile.name}": ${url}`,
      profileId: profile._id,
      profileName: profile.name,
      priority: 'high',
      actionUrl: `/profile/${profile._id}`,
      metadata: {
        url
      }
    });
  }

  /**
   * Notify when report is ready
   */
  static async notifyReportReady(profile) {
    return await this.create({
      type: 'report_ready',
      title: 'Report Ready',
      message: `Analysis report for "${profile.name}" is ready to download`,
      profileId: profile._id,
      profileName: profile.name,
      priority: 'medium',
      actionUrl: `/profile/${profile._id}`,
      metadata: {
        generatedAt: new Date().toISOString()
      }
    });
  }

  /**
   * Send a system notification
   */
  static async notifySystem(title, message, priority = 'low') {
    return await this.create({
      type: 'system',
      title,
      message,
      priority,
      metadata: {}
    });
  }

  /**
   * Send a warning notification
   */
  static async notifyWarning(title, message, profileId = null, profileName = null) {
    return await this.create({
      type: 'warning',
      title,
      message,
      profileId,
      profileName,
      priority: 'high',
      actionUrl: profileId ? `/profile/${profileId}` : null,
      metadata: {}
    });
  }

  /**
   * Send an error notification
   */
  static async notifyError(title, message, profileId = null, profileName = null) {
    return await this.create({
      type: 'error',
      title,
      message,
      profileId,
      profileName,
      priority: 'urgent',
      actionUrl: profileId ? `/profile/${profileId}` : null,
      metadata: {}
    });
  }
}

module.exports = NotificationService;

